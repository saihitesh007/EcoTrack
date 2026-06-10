import { describe, it, expect } from 'vitest';
import {
  calculateTransportCO2,
  calculateFoodCO2,
  calculateEnergyCO2,
  calculateWaterCO2,
  calculateShoppingCO2,
  calculateActivityCO2,
} from '../utils/carbonCalculator';
import { TRANSPORT_FACTORS, FOOD_FACTORS } from '../constants/emissions';

describe('carbonCalculator', () => {
  describe('calculateTransportCO2', () => {
    it('calculates car petrol correctly', () => {
      expect(calculateTransportCO2('carPetrol', 10)).toBe(2.1);
    });

    it('returns 0 for 0 distance', () => {
      expect(calculateTransportCO2('carDiesel', 0)).toBe(0);
    });

    it('throws error for negative distance', () => {
      expect(() => calculateTransportCO2('bus', -5)).toThrow('Distance cannot be negative');
    });

    it('uses short haul flight factor for distance < 1500', () => {
      expect(calculateTransportCO2('flightShortHaul', 1000)).toBe(1000 * TRANSPORT_FACTORS.flightShortHaul);
    });

    it('uses long haul flight factor for distance >= 1500 even if short haul is selected', () => {
      expect(calculateTransportCO2('flightShortHaul', 2000)).toBe(2000 * TRANSPORT_FACTORS.flightLongHaul);
    });

    it('calculates bike/walk correctly (0)', () => {
      expect(calculateTransportCO2('bikeWalk', 50)).toBe(0);
    });
  });

  describe('calculateFoodCO2', () => {
    it('calculates vegan multi-meal correctly', () => {
      expect(calculateFoodCO2('vegan', 3)).toBe(3 * FOOD_FACTORS.vegan);
    });

    it('calculates beef/lamb correctly', () => {
      expect(calculateFoodCO2('beefLamb', 1)).toBe(FOOD_FACTORS.beefLamb);
    });

    it('throws error for negative meals', () => {
      expect(() => calculateFoodCO2('vegetarian', -1)).toThrow('negative');
    });
  });

  describe('calculateEnergyCO2', () => {
    it('calculates combined electricity and gas', () => {
      expect(calculateEnergyCO2(10, 5)).toBe(10 * 0.233 + 5 * 2.04);
    });

    it('throws error for negative inputs', () => {
      expect(() => calculateEnergyCO2(-5, 0)).toThrow('negative');
      expect(() => calculateEnergyCO2(0, -5)).toThrow('negative');
    });
  });

  describe('calculateWaterCO2', () => {
    it('calculates water litres correctly', () => {
      expect(calculateWaterCO2(100)).toBe(0.03); // 100 * 0.0003
    });

    it('throws error for negative litres', () => {
      expect(() => calculateWaterCO2(-10)).toThrow('negative');
    });
  });

  describe('calculateShoppingCO2', () => {
    it('calculates electronics correctly', () => {
      expect(calculateShoppingCO2('electronics', 2)).toBe(600);
    });

    it('throws error for negative quantity', () => {
      expect(() => calculateShoppingCO2('clothing', -1)).toThrow('negative');
    });
  });

  describe('calculateActivityCO2 wrapper', () => {
    it('routes transport correctly', () => {
      expect(
        calculateActivityCO2('transport', {
          vehicle: 'bus',
          distanceKm: 10,
        })
      ).toBe(0.89);
    });

    it('returns 0 for unknown category', () => {
      expect(calculateActivityCO2('unknown' as any, {} as any)).toBe(0);
    });
  });
});
