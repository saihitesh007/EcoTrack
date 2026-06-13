/**
 * Format kg CO2 value with appropriate decimal places
 */
export function formatKg(kg: number): string {
  if (kg === 0) return '0 kg';
  if (kg < 0.01) return `${(kg * 1000).toFixed(1)} g`;
  if (kg < 1) return `${kg.toFixed(2)} kg`;
  if (kg < 100) return `${Number.isInteger(kg) ? kg.toFixed(0) : kg.toFixed(1)} kg`;
  return `${Math.round(kg)} kg`;
}

/**
 * Format a date string (YYYY-MM-DD) to a human-readable format
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date to short day label (e.g., "Mon", "Tue")
 */
export function formatDayShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { weekday: 'short' });
}

/**
 * Format a percentage value
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get yesterday's date as YYYY-MM-DD
 */
export function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

/**
 * Get date N days ago as YYYY-MM-DD
 */
export function getDaysAgoString(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

/**
 * Format month label (YYYY-MM) to human readable (e.g., "Jun 2025")
 */
export function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

/**
 * Sanitize a string for Firestore storage - remove dangerous characters
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>"'&]/g, '')
    .substring(0, 500);
}

/**
 * Format a display name for leaderboard privacy (first name + last initial)
 */
export function formatDisplayName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  if (parts.length === 0) return 'User';
  const firstName = parts[0];
  const lastInitial = parts.length > 1 ? ` ${parts[parts.length - 1][0]}.` : '';
  return `${firstName}${lastInitial}`;
}

/**
 * Get last N dates as YYYY-MM-DD strings (including today)
 */
export function getLastNDates(n: number): string[] {
  return Array.from({ length: n }, (_, i) => getDaysAgoString(n - 1 - i));
}

/**
 * Convert activities to CSV string
 */
export function activitiesToCSV(
  activities: Array<{
    date: string;
    category: string;
    co2kg: number;
    details: Record<string, unknown>;
  }>
): string {
  const headers = ['Date', 'Category', 'CO2 (kg)', 'Details'];
  const rows = activities.map(a => [
    a.date,
    a.category,
    a.co2kg.toFixed(3),
    JSON.stringify(a.details).replace(/"/g, "'"),
  ]);
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}
