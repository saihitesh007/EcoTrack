import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Activity, WeeklyStats } from '../types';
import { formatKg, formatDate, formatMonthLabel } from '../utils/formatters';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../constants/emissions';

interface MonthlyReportData {
  month: string; // YYYY-MM
  activities: Activity[];
  weeklyStats: WeeklyStats[];
  recommendations: string[];
  userName: string;
}

export function generateMonthlyReport(data: MonthlyReportData): void {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = margin;

  // ---- HEADER ----
  pdf.setFillColor(22, 163, 74); // primary-600
  pdf.rect(0, 0, pageWidth, 40, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('🌿 EcoTrack', margin, 18);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Monthly Carbon Report — ${formatMonthLabel(data.month)}`, margin, 28);
  pdf.text(`Generated for: ${data.userName}`, margin, 35);

  yPos = 50;
  pdf.setTextColor(17, 24, 39);

  // ---- TOTAL CO2 ----
  const totalKg = data.activities.reduce((s, a) => s + a.co2kg, 0);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Monthly Summary', margin, yPos);
  yPos += 8;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total CO₂ Emissions: ${formatKg(totalKg)}`, margin, yPos);
  yPos += 6;
  pdf.text(`Total Activities Logged: ${data.activities.length}`, margin, yPos);
  yPos += 6;
  pdf.text(`India Average (monthly): ~350 kg`, margin, yPos);
  yPos += 6;
  pdf.text(`World Average (monthly): ~400 kg`, margin, yPos);
  yPos += 12;

  // ---- CATEGORY BREAKDOWN ----
  const byCategory: Record<string, number> = {};
  data.activities.forEach(a => {
    byCategory[a.category] = (byCategory[a.category] || 0) + a.co2kg;
  });

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Category Breakdown', margin, yPos);
  yPos += 6;

  const categoryRows = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, kg]) => [
      CATEGORY_LABELS[cat] || cat,
      formatKg(kg),
      `${totalKg > 0 ? ((kg / totalKg) * 100).toFixed(1) : '0'}%`,
    ]);

  autoTable(pdf, {
    startY: yPos,
    head: [['Category', 'CO₂ (kg)', '% of Total']],
    body: categoryRows,
    margin: { left: margin, right: margin },
    headStyles: { fillColor: [22, 163, 74], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    styles: { fontSize: 10 },
  });

  yPos = (pdf as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

  // ---- WEEK-BY-WEEK BREAKDOWN ----
  if (data.weeklyStats.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Weekly Breakdown', margin, yPos);
    yPos += 6;

    const weekRows = data.weeklyStats.map((week, i) => [
      `Week ${i + 1}`,
      formatKg(week.totalKg),
      `${week.score}/100`,
      week.grade,
    ]);

    autoTable(pdf, {
      startY: yPos,
      head: [['Week', 'Total CO₂', 'Score', 'Grade']],
      body: weekRows,
      margin: { left: margin, right: margin },
      headStyles: { fillColor: [22, 163, 74], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      styles: { fontSize: 10 },
    });

    yPos = (pdf as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
  }

  // ---- AI RECOMMENDATIONS ----
  if (data.recommendations.length > 0) {
    if (yPos > 240) {
      pdf.addPage();
      yPos = margin;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI-Powered Recommendations', margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    data.recommendations.slice(0, 3).forEach((rec, i) => {
      const lines = pdf.splitTextToSize(`${i + 1}. ${rec}`, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = margin;
        }
        pdf.text(line, margin, yPos);
        yPos += 5;
      });
      yPos += 3;
    });

    yPos += 5;
  }

  // ---- ACTIVITY LOG TABLE ----
  if (data.activities.length > 0) {
    if (yPos > 200) {
      pdf.addPage();
      yPos = margin;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Activity Log', margin, yPos);
    yPos += 6;

    const activityRows = data.activities.slice(0, 50).map(a => [
      formatDate(a.date),
      CATEGORY_LABELS[a.category] || a.category,
      formatKg(a.co2kg),
    ]);

    autoTable(pdf, {
      startY: yPos,
      head: [['Date', 'Category', 'CO₂']],
      body: activityRows,
      margin: { left: margin, right: margin },
      headStyles: { fillColor: [22, 163, 74], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      styles: { fontSize: 9 },
    });
  }

  // ---- FOOTER ----
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(156, 163, 175);
    pdf.text(
      `EcoTrack Monthly Report | Page ${i} of ${pageCount} | Generated ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  // Save
  const fileName = `EcoTrack_Report_${data.month}_${data.userName.replace(/\s/g, '_')}.pdf`;
  pdf.save(fileName);
}

// Re-export CATEGORY_COLORS for chart use in PDF
export { CATEGORY_COLORS };
