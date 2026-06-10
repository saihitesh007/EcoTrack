import type { Activity, Challenge, Insights, LeaderboardEntry, UserProfile } from '../types';
import { getDaysAgoString, getTodayString } from '../utils/formatters';

const now = new Date();

function demoTimestamp(date: Date): { toDate: () => Date; toMillis: () => number } {
  return {
    toDate: () => date,
    toMillis: () => date.getTime(),
  };
}

export const DEMO_PROFILE: UserProfile = {
  uid: 'demo-user',
  displayName: 'Eco Tracker',
  email: 'demo@ecotrack.local',
  photoURL: null,
  currentStreak: 4,
  longestStreak: 9,
  lastLoggedDate: getTodayString(),
  createdAt: demoTimestamp(new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000)) as never,
  weeklyKg: 38.6,
  totalActivities: 18,
  sustainabilityScore: 76,
};

export const DEMO_ACTIVITIES: Activity[] = [
  {
    id: 'demo-1',
    userId: DEMO_PROFILE.uid,
    category: 'transport',
    details: { vehicle: 'bus', distanceKm: 42, origin: 'Home', destination: 'Office' },
    co2kg: 3.738,
    timestamp: demoTimestamp(now) as never,
    date: getTodayString(),
  },
  {
    id: 'demo-2',
    userId: DEMO_PROFILE.uid,
    category: 'food',
    details: { foodType: 'beefLamb', meals: 1 },
    co2kg: 6,
    timestamp: demoTimestamp(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)) as never,
    date: getDaysAgoString(1),
  },
  {
    id: 'demo-3',
    userId: DEMO_PROFILE.uid,
    category: 'energy',
    details: { electricityKwh: 12, gasM3: 1.5 },
    co2kg: 5.676,
    timestamp: demoTimestamp(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)) as never,
    date: getDaysAgoString(1),
  },
  {
    id: 'demo-4',
    userId: DEMO_PROFILE.uid,
    category: 'water',
    details: { litres: 4000 },
    co2kg: 1.2,
    timestamp: demoTimestamp(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)) as never,
    date: getDaysAgoString(2),
  },
  {
    id: 'demo-5',
    userId: DEMO_PROFILE.uid,
    category: 'shopping',
    details: { shoppingCategory: 'electronics', quantity: 1 },
    co2kg: 300,
    timestamp: demoTimestamp(new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)) as never,
    date: getDaysAgoString(4),
  },
  {
    id: 'demo-6',
    userId: DEMO_PROFILE.uid,
    category: 'transport',
    details: { vehicle: 'metroTrain', distanceKm: 8, origin: 'Metro Station', destination: 'Campus' },
    co2kg: 0.328,
    timestamp: demoTimestamp(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)) as never,
    date: getDaysAgoString(5),
  },
  {
    id: 'demo-7',
    userId: DEMO_PROFILE.uid,
    category: 'food',
    details: { foodType: 'vegan', meals: 1 },
    co2kg: 0.5,
    timestamp: demoTimestamp(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)) as never,
    date: getDaysAgoString(5),
  },
  {
    id: 'demo-8',
    userId: DEMO_PROFILE.uid,
    category: 'energy',
    details: { electricityKwh: 4.2, gasM3: 0.2 },
    co2kg: 1.267,
    timestamp: demoTimestamp(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)) as never,
    date: getDaysAgoString(6),
  },
  {
    id: 'demo-9',
    userId: DEMO_PROFILE.uid,
    category: 'water',
    details: { litres: 95 },
    co2kg: 0.029,
    timestamp: demoTimestamp(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)) as never,
    date: getDaysAgoString(6),
  },
  {
    id: 'demo-10',
    userId: DEMO_PROFILE.uid,
    category: 'shopping',
    details: { shoppingCategory: 'other', quantity: 2 },
    co2kg: 10,
    timestamp: demoTimestamp(new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)) as never,
    date: getDaysAgoString(8),
  },
];

export const DEMO_INSIGHTS: Insights = {
  id: 'demo-insights',
  weekId: 'demo-week',
  weeklySummary:
    'Your week is already moving in the right direction, with transport emissions staying relatively low and shopping kept under control. Food and energy remain your largest opportunities for improvement.',
  recommendations: [
    'Swap one meat-based meal for a plant-based meal this week.',
    'Keep car trips under 3 km limited to walking, cycling, or public transport.',
    'Trim electricity use at home by turning off standby devices overnight.',
  ],
  motivationalMessage: 'Small, consistent wins add up fast. You are building a cleaner routine one choice at a time.',
  prediction:
    'Based on your current pattern, next month is likely to stay close to this month, unless food and energy usage increase. A few consistent swaps could move the trend lower.',
  anomalies: [],
  goal: {
    targetReductionKg: 8,
    description: 'Reduce monthly emissions by 8 kg by shifting one commute and two meals each week.',
    strategies: [
      'Use public transport for one regular commute',
      'Choose vegetarian lunches twice a week',
      'Reduce evening energy use by switching off unused devices',
    ],
  },
  generatedAt: demoTimestamp(now) as never,
};

export const DEMO_CHALLENGE: Challenge = {
  id: 'demo-challenge',
  weekId: 'demo-week',
  title: 'Public Transport Week',
  description: 'Take public transport every day this week',
  icon: '🚍',
  category: 'transport',
  targetMetric: 'Use bus/metro/train for all commutes',
  completed: false,
};

export const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  {
    uid: 'demo-user-5',
    displayName: 'Dev P.',
    weeklyKg: 19.8,
    score: 91,
    weekId: 'demo-week',
    avatarColor: '#db2777',
    rank: 1,
  },
  {
    uid: 'demo-user-4',
    displayName: 'Meera T.',
    weeklyKg: 24.2,
    score: 88,
    weekId: 'demo-week',
    avatarColor: '#7c3aed',
    rank: 2,
  },
  {
    uid: 'demo-user-3',
    displayName: 'Rahul K.',
    weeklyKg: 27.9,
    score: 84,
    weekId: 'demo-week',
    avatarColor: '#2563eb',
    rank: 3,
  },
  {
    uid: 'demo-user-6',
    displayName: 'Anika R.',
    weeklyKg: 29.1,
    score: 82,
    weekId: 'demo-week',
    avatarColor: '#0891b2',
    rank: 4,
  },
  {
    uid: 'demo-user-2',
    displayName: 'Aanya S.',
    weeklyKg: 31.4,
    score: 81,
    weekId: 'demo-week',
    avatarColor: '#0d9488',
    rank: 5,
  },
  {
    uid: 'demo-user-7',
    displayName: 'Kabir M.',
    weeklyKg: 34.7,
    score: 78,
    weekId: 'demo-week',
    avatarColor: '#d97706',
    rank: 6,
  },
  {
    uid: 'demo-user',
    displayName: 'Eco Tracker',
    weeklyKg: 38.6,
    score: 76,
    weekId: 'demo-week',
    avatarColor: '#16a34a',
    rank: 7,
  },
  {
    uid: 'demo-user-8',
    displayName: 'Nina S.',
    weeklyKg: 41.2,
    score: 74,
    weekId: 'demo-week',
    avatarColor: '#dc2626',
    rank: 8,
  },
  {
    uid: 'demo-user-9',
    displayName: 'Arjun V.',
    weeklyKg: 44.9,
    score: 72,
    weekId: 'demo-week',
    avatarColor: '#8b5cf6',
    rank: 9,
  },
  {
    uid: 'demo-user-10',
    displayName: 'Sara J.',
    weeklyKg: 49.3,
    score: 69,
    weekId: 'demo-week',
    avatarColor: '#06b6d4',
    rank: 10,
  },
];
