import type { Activity, AnomalyItem, PersonalizedGoal, DailyTotal } from '../types';
import { CATEGORY_LABELS } from '../constants/emissions';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function assertApiKey() {
  if (!GEMINI_API_KEY) {
    throw new Error('Unable to generate insights. Please set VITE_GEMINI_API_KEY in your environment.');
  }
}

async function fetchGemini(prompt: string): Promise<string> {
  assertApiKey();

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 500,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Unable to generate insights. Please try again. (${response.status}) ${body}`);
  }

  const data = await response.json() as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text || typeof text !== 'string') {
    throw new Error('Unable to parse Gemini response. Please try again.');
  }

  return text.trim();
}

function formatActivitiesForPrompt(activities: Activity[]): string {
  const byDate: Record<string, { total: number; byCategory: Record<string, number> }> = {};

  activities.forEach(activity => {
    if (!byDate[activity.date]) {
      byDate[activity.date] = { total: 0, byCategory: {} };
    }
    byDate[activity.date].total += activity.co2kg;
    byDate[activity.date].byCategory[activity.category] =
      (byDate[activity.date].byCategory[activity.category] || 0) + activity.co2kg;
  });

  return Object.entries(byDate)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, data]) => {
      const cats = Object.entries(data.byCategory)
        .map(([cat, kg]) => `${CATEGORY_LABELS[cat] || cat}: ${kg.toFixed(2)} kg`)
        .join(', ');
      return `${date}: ${data.total.toFixed(2)} kg CO2 (${cats})`;
    })
    .join('\n');
}

function getDailyTotals(activities: Activity[]): DailyTotal[] {
  const byDate: Record<string, { total: number; byCategory: Record<string, number> }> = {};

  activities.forEach(activity => {
    if (!byDate[activity.date]) {
      byDate[activity.date] = { total: 0, byCategory: {} };
    }
    byDate[activity.date].total += activity.co2kg;
    byDate[activity.date].byCategory[activity.category] =
      (byDate[activity.date].byCategory[activity.category] || 0) + activity.co2kg;
  });

  return Object.entries(byDate).map(([date, data]) => ({
    date,
    total: data.total,
    byCategory: data.byCategory,
  }));
}

function parseJsonBlock<T>(text: string): T {
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (!jsonMatch) {
    throw new Error('Invalid Gemini response format');
  }
  return JSON.parse(jsonMatch[0]) as T;
}

export async function generateWeeklySummary(
  activities: Activity[],
  weeklyTotal: number,
  byCategory: Record<string, number>
): Promise<{ summary: string; recommendations: string[]; motivationalMessage: string }> {
  const categoryBreakdown = Object.entries(byCategory)
    .map(([cat, kg]) => `${CATEGORY_LABELS[cat] || cat}: ${kg.toFixed(2)} kg`)
    .join(', ');

  const prompt = `You are an environmental sustainability expert. Analyze this user's carbon footprint data for the past 7 days:

Total CO2 this week: ${weeklyTotal.toFixed(2)} kg
Breakdown by category: ${categoryBreakdown}
Daily activities:
${formatActivitiesForPrompt(activities)}

India national average: 80.7 kg/week
World average: 92.3 kg/week

Provide your analysis in this EXACT JSON format (no markdown, pure JSON):
{
  "summary": "A 2-3 sentence summary of their week's emissions performance",
  "recommendations": ["Specific actionable recommendation 1", "Specific actionable recommendation 2", "Specific actionable recommendation 3"],
  "motivationalMessage": "An encouraging and motivating message about their sustainability journey"
}`;

  try {
    const text = await fetchGemini(prompt);
    return parseJsonBlock<{ summary: string; recommendations: string[]; motivationalMessage: string }>(text);
  } catch {
    return {
      summary: 'Your week looks balanced overall, with the clearest opportunities in food and energy use. A few small changes in repeat habits can lower your weekly total without making your routine harder.',
      recommendations: [
        'Swap one high-emission meal for a plant-based meal.',
        'Consolidate transport trips to reduce repeat travel.',
        'Reduce electricity use by switching off unused devices overnight.',
      ],
      motivationalMessage: 'Consistency matters more than perfection. Keep going, because every lower-emission choice compounds over time.',
    };
  }
}

export async function generateEmissionPrediction(activities: Activity[]): Promise<string> {
  const dailyTotals = getDailyTotals(activities);
  const totalDays = dailyTotals.length;
  const totalKg = dailyTotals.reduce((sum, data) => sum + data.total, 0);
  const avgPerDay = totalDays > 0 ? totalKg / totalDays : 0;
  const projectedMonthly = avgPerDay * 30;

  const prompt = `You are an environmental data analyst. Based on this user's last 30 days of carbon emissions:

${formatActivitiesForPrompt(activities)}

Average daily emissions: ${avgPerDay.toFixed(2)} kg CO2/day
Current month total: ${totalKg.toFixed(2)} kg CO2
Projected next month: ${projectedMonthly.toFixed(2)} kg CO2

Write a single prediction paragraph (2-3 sentences) that:
1. States the projected emissions for next month
2. Explains the trend (higher/lower than this month and why)
3. Is specific to the categories driving the trend

Respond with ONLY the prediction paragraph text, no JSON, no formatting.`;

  try {
    return await fetchGemini(prompt);
  } catch {
    return `Based on your current pattern, next month is likely to be around ${projectedMonthly.toFixed(1)} kg CO2. The biggest movement will probably come from ${dailyTotals.length > 0 ? 'repeat daily habits' : 'newly logged activities'}, so keeping transport and food choices steady should help you stay on trend.`;
  }
}

export async function detectAnomalies(activities: Activity[]): Promise<AnomalyItem[]> {
  const categoryTotals: Record<string, number[]> = {};
  const byDateCategory: Record<string, Record<string, number>> = {};

  activities.forEach(activity => {
    if (!categoryTotals[activity.category]) categoryTotals[activity.category] = [];
    categoryTotals[activity.category].push(activity.co2kg);

    if (!byDateCategory[activity.date]) byDateCategory[activity.date] = {};
    byDateCategory[activity.date][activity.category] =
      (byDateCategory[activity.date][activity.category] || 0) + activity.co2kg;
  });

  const categoryAverages: Record<string, number> = {};
  Object.entries(categoryTotals).forEach(([category, values]) => {
    categoryAverages[category] = values.reduce((sum, value) => sum + value, 0) / values.length;
  });

  const anomalyDays: string[] = [];
  Object.entries(byDateCategory).forEach(([date, categories]) => {
    Object.entries(categories).forEach(([category, kg]) => {
      const average = categoryAverages[category] || 0;
      if (average > 0 && kg > average * 2) {
        anomalyDays.push(
          `${date}: ${CATEGORY_LABELS[category] || category} was ${kg.toFixed(2)} kg (average: ${average.toFixed(2)} kg, ${((kg / average) * 100 - 100).toFixed(0)}% above average)`
        );
      }
    });
  });

  if (anomalyDays.length === 0) {
    return [];
  }

  const prompt = `You are an environmental health analyst. These emission anomalies were detected in a user's carbon footprint data:

${anomalyDays.join('\n')}

For each anomaly, provide an explanation and actionable suggestion. Respond in this EXACT JSON format (no markdown):
[
  {
    "date": "YYYY-MM-DD",
    "category": "category name",
    "description": "Brief explanation of why this might be an anomaly",
    "suggestion": "Specific actionable suggestion to reduce this in future"
  }
]`;

  try {
    const text = await fetchGemini(prompt);
    return parseJsonBlock<AnomalyItem[]>(text);
  } catch {
    return anomalyDays.map(entry => {
      const [datePart, remainder] = entry.split(': ');
      return {
        date: datePart,
        category: remainder.split(' was ')[0],
        description: 'This category is significantly higher than the user’s normal pattern.',
        suggestion: 'Review what changed on this day and look for ways to spread usage more evenly next week.',
      };
    });
  }
}

export async function generatePersonalizedGoal(activities: Activity[]): Promise<PersonalizedGoal> {
  const dailyTotals = getDailyTotals(activities);
  const totalKg = dailyTotals.reduce((sum, data) => sum + data.total, 0);
  const avgMonthly = (totalKg / Math.max(dailyTotals.length, 1)) * 30;

  const categoryTotals: Record<string, number> = {};
  activities.forEach(activity => {
    categoryTotals[activity.category] = (categoryTotals[activity.category] || 0) + activity.co2kg;
  });

  const topCategory = Object.entries(categoryTotals).sort(([, left], [, right]) => right - left)[0]?.[0] || 'transport';

  const prompt = `You are a personal sustainability coach. Based on this user's 3-month carbon footprint data:

${formatActivitiesForPrompt(activities)}

Average monthly emissions: ${avgMonthly.toFixed(2)} kg CO2
Highest emission category: ${CATEGORY_LABELS[topCategory] || topCategory}
India average: 350 kg/month (80.7 kg/week)

Create a personalized, achievable monthly reduction goal. Respond in this EXACT JSON format (no markdown):
{
  "targetReductionKg": 15,
  "description": "Specific description of the goal and why it's achievable",
  "strategies": [
    "Specific strategy 1 based on their data",
    "Specific strategy 2 based on their data",
    "Specific strategy 3 based on their data"
  ]
}`;

  try {
    const text = await fetchGemini(prompt);
    return parseJsonBlock<PersonalizedGoal>(text);
  } catch {
    return {
      targetReductionKg: 10,
      description: 'Reduce your monthly carbon emissions by 10 kg through consistent small changes.',
      strategies: [
        'Take public transport at least 3 days per week',
        'Reduce meat consumption to 3 meals per week',
        'Switch off unused lights and devices before bed',
      ],
    };
  }
}
