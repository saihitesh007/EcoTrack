import type { Challenge } from '../types';

export const WEEKLY_CHALLENGES: Omit<Challenge, 'id' | 'weekId' | 'completed'>[] = [
  {
    title: 'Public Transport Week',
    description: 'Take public transport every day this week',
    icon: '🚌',
    category: 'transport',
    targetMetric: 'Use bus/metro/train for all commutes',
  },
  {
    title: 'Meat-Free Days',
    description: 'Go meat-free for 5 days this week',
    icon: '🥗',
    category: 'food',
    targetMetric: 'Log only vegan or vegetarian meals for 5 days',
  },
  {
    title: 'Low Energy Week',
    description: 'Keep electricity usage under 5 kWh/day',
    icon: '⚡',
    category: 'energy',
    targetMetric: 'Stay below 5 kWh electricity per day',
  },
  {
    title: 'Active Commuter',
    description: 'Walk or cycle for all trips under 3 km',
    icon: '🚴',
    category: 'transport',
    targetMetric: 'Zero car trips for distances under 3 km',
  },
  {
    title: 'Water Warrior',
    description: 'Reduce shower water to under 60L/day',
    icon: '💧',
    category: 'water',
    targetMetric: 'Log under 60 litres water usage per day',
  },
  {
    title: 'No New Clothes',
    description: 'No new clothing purchases this week',
    icon: '👕',
    category: 'shopping',
    targetMetric: 'Zero clothing purchase logs this week',
  },
  {
    title: 'Plant-Based Pledge',
    description: 'Reduce food waste — log only plant-based meals',
    icon: '🌱',
    category: 'food',
    targetMetric: 'All meals logged as vegan or vegetarian',
  },
  {
    title: 'Car-Free Week',
    description: 'Car-free week — use only public transport or cycle',
    icon: '🚲',
    category: 'transport',
    targetMetric: 'No car trips logged for the entire week',
  },
];

export function getCurrentChallenge(weekNumber: number): Omit<Challenge, 'id' | 'weekId' | 'completed'> {
  const index = weekNumber % WEEKLY_CHALLENGES.length;
  return WEEKLY_CHALLENGES[index];
}

export function getWeekNumber(date: Date = new Date()): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.floor(diff / oneWeek);
}

export function getWeekId(date: Date = new Date()): string {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}
