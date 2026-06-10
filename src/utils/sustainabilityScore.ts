import { INDIA_WEEKLY_AVERAGE_KG, SCORE_THRESHOLDS, TREE_CO2_ABSORPTION_KG_YEAR } from '../constants/emissions';
import type { ScoreGrade } from '../types';

/**
 * Calculate sustainability score (0-100)
 * Formula: score = max(0, min(100, round(100 - (weeklyKg / 80.7) * 50)))
 */
export function calculateScore(weeklyKg: number): number {
  if (weeklyKg < 0) weeklyKg = 0;
  return Math.max(0, Math.min(100, Math.round(100 - (weeklyKg / INDIA_WEEKLY_AVERAGE_KG) * 50)));
}

/**
 * Get grade from score
 */
export function getGrade(score: number): ScoreGrade {
  if (score >= SCORE_THRESHOLDS.excellent.min) return 'Excellent';
  if (score >= SCORE_THRESHOLDS.good.min) return 'Good';
  if (score >= SCORE_THRESHOLDS.average.min) return 'Average';
  return 'Poor';
}

/**
 * Get Tailwind color class for a grade
 */
export function getGradeColor(grade: ScoreGrade): string {
  switch (grade) {
    case 'Excellent':
      return 'text-green-600 dark:text-green-400';
    case 'Good':
      return 'text-teal-600 dark:text-teal-400';
    case 'Average':
      return 'text-amber-600 dark:text-amber-400';
    case 'Poor':
      return 'text-red-600 dark:text-red-400';
  }
}

export function getGradeBgColor(grade: ScoreGrade): string {
  switch (grade) {
    case 'Excellent':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'Good':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
    case 'Average':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'Poor':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  }
}

/**
 * Calculate trees needed to offset weekly emissions
 */
export function calculateTreesNeeded(weeklyKg: number): number {
  return Math.ceil(weeklyKg / TREE_CO2_ABSORPTION_KG_YEAR);
}

/**
 * Calculate percentage difference vs average
 */
export function calculateVsAverage(
  userKg: number,
  averageKg: number
): { percentage: number; isBetter: boolean } {
  if (averageKg === 0) return { percentage: 0, isBetter: true };
  const diff = ((userKg - averageKg) / averageKg) * 100;
  return {
    percentage: Math.abs(Math.round(diff)),
    isBetter: diff < 0,
  };
}
