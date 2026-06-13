import { describe, expect, it } from 'vitest';
import { getDailyTip, getHighestCategory, getMonthKey, sumEmissionsForMonth } from '../utils/dashboardStats';
import type { Activity } from '../types';

const activities: Activity[] = [
  {
    id: 'a1',
    userId: 'u1',
    category: 'transport',
    details: { vehicle: 'carPetrol', distanceKm: 10 },
    co2kg: 4,
    date: '2026-06-13',
    timestamp: { toDate: () => new Date('2026-06-13T10:00:00Z'), toMillis: () => 1 } as never,
  },
  {
    id: 'a2',
    userId: 'u1',
    category: 'food',
    details: { foodType: 'vegan', meals: 2 },
    co2kg: 1.5,
    date: '2026-06-02',
    timestamp: { toDate: () => new Date('2026-06-02T10:00:00Z'), toMillis: () => 2 } as never,
  },
  {
    id: 'a3',
    userId: 'u1',
    category: 'energy',
    details: { electricityKwh: 5, gasM3: 0 },
    co2kg: 2.5,
    date: '2026-05-27',
    timestamp: { toDate: () => new Date('2026-05-27T10:00:00Z'), toMillis: () => 3 } as never,
  },
];

describe('dashboardStats', () => {
  it('returns undefined for empty category totals', () => {
    expect(getHighestCategory({ transport: 0, food: 0, energy: 0, water: 0, shopping: 0 })).toBeUndefined();
  });

  it('returns the largest category', () => {
    expect(getHighestCategory({ transport: 4, food: 7, energy: 2, water: 1, shopping: 0 })).toBe('food');
  });

  it('keeps the first category in a tie', () => {
    expect(getHighestCategory({ transport: 5, food: 5, energy: 2, water: 1, shopping: 0 })).toBe('transport');
  });

  it('sums emissions for the current month', () => {
    expect(sumEmissionsForMonth(activities, '2026-06')).toBeCloseTo(5.5);
  });

  it('sums emissions for a previous month', () => {
    expect(sumEmissionsForMonth(activities, '2026-05')).toBeCloseTo(2.5);
  });

  it('returns zero for a month without entries', () => {
    expect(sumEmissionsForMonth(activities, '2026-04')).toBe(0);
  });

  it('builds the current month key', () => {
    expect(getMonthKey(new Date('2026-06-13T00:00:00Z'), 0)).toBe('2026-06');
  });

  it('builds a prior month key across boundaries', () => {
    expect(getMonthKey(new Date('2026-01-13T00:00:00Z'), 1)).toBe('2025-12');
  });

  it('returns a food tip for food-heavy habits', () => {
    expect(getDailyTip('food')).toContain('plant-based meal');
  });

  it('returns the transport default tip', () => {
    expect(getDailyTip(undefined)).toContain('bus, walk, or cycle');
  });
});
