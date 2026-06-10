import { describe, it, expect } from 'vitest';
import {
  calculateScore,
  getGrade,
  calculateVsAverage,
} from '../utils/sustainabilityScore';

describe('sustainabilityScore', () => {
  describe('calculateScore', () => {
    it('returns 100 for 0 emissions', () => {
      expect(calculateScore(0)).toBe(100);
    });

    it('returns 50 for exactly the India average (80.7)', () => {
      expect(calculateScore(80.7)).toBe(50);
    });

    it('returns 0 for double the India average (161.4)', () => {
      expect(calculateScore(161.4)).toBe(0);
    });

    it('never returns negative score', () => {
      expect(calculateScore(500)).toBe(0);
    });

    it('never returns > 100 score for negative inputs (handles gracefully)', () => {
      expect(calculateScore(-10)).toBe(100);
    });
  });

  describe('getGrade', () => {
    it('returns Excellent for 80-100', () => {
      expect(getGrade(100)).toBe('Excellent');
      expect(getGrade(80)).toBe('Excellent');
    });

    it('returns Good for 60-79', () => {
      expect(getGrade(79)).toBe('Good');
      expect(getGrade(60)).toBe('Good');
    });

    it('returns Average for 40-59', () => {
      expect(getGrade(59)).toBe('Average');
      expect(getGrade(40)).toBe('Average');
    });

    it('returns Poor for 0-39', () => {
      expect(getGrade(39)).toBe('Poor');
      expect(getGrade(0)).toBe('Poor');
    });
  });

  describe('calculateVsAverage', () => {
    it('calculates worse percentage correctly', () => {
      const res = calculateVsAverage(161.4, 80.7);
      expect(res.percentage).toBe(100);
      expect(res.isBetter).toBe(false);
    });

    it('calculates better percentage correctly', () => {
      const res = calculateVsAverage(40.35, 80.7);
      expect(res.percentage).toBe(50);
      expect(res.isBetter).toBe(true);
    });
  });
});
