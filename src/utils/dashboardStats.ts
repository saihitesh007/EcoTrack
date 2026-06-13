import type { Activity, ActivityCategory, DailyTotal } from '../types';

export type EmissionCategory = ActivityCategory;

export const EMPTY_WEEKLY_STATS = {
  totalKg: 0,
  byCategory: {
    transport: 0,
    food: 0,
    energy: 0,
    water: 0,
    shopping: 0,
  } as Record<EmissionCategory, number>,
  dailyTotals: [] as DailyTotal[],
};

export function getHighestCategory(
  byCategory: Record<EmissionCategory, number>
): EmissionCategory | undefined {
  const entries = Object.entries(byCategory).sort(([, left], [, right]) => right - left);
  const [category, value] = entries[0] ?? [];
  if (!category || !value) return undefined;
  return category as EmissionCategory;
}

export function sumEmissionsForMonth(activities: Activity[], monthKey: string): number {
  return activities
    .filter(activity => activity.date.startsWith(monthKey))
    .reduce((sum, activity) => sum + activity.co2kg, 0);
}

export function getDailyTip(highestCategory: EmissionCategory | undefined): string {
  if (highestCategory === 'food') {
    return 'Try one plant-based meal today. Small swaps in food can create quick wins.';
  }

  if (highestCategory === 'energy') {
    return 'Turn off unused devices earlier tonight to reduce wasted electricity.';
  }

  if (highestCategory === 'shopping') {
    return 'Delay one non-essential purchase and reuse what you already own.';
  }

  return 'Use the bus, walk, or cycle for one short trip today to lower transport emissions.';
}

export function getMonthKey(date: Date, monthsAgo: number): string {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() - monthsAgo);
  return copy.toISOString().slice(0, 7);
}
