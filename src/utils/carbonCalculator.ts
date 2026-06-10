import {
  TRANSPORT_FACTORS,
  FOOD_FACTORS,
  ENERGY_FACTORS,
  WATER_FACTORS,
  SHOPPING_FACTORS,
  FLIGHT_SHORT_HAUL_THRESHOLD_KM,
} from '../constants/emissions';
import type {
  TransportVehicle,
  FoodType,
  ShoppingCategory,
  TransportDetails,
  FoodDetails,
  EnergyDetails,
  WaterDetails,
  ShoppingDetails,
  ActivityDetails,
  ActivityCategory,
} from '../types';

/**
 * Calculate CO2 emissions for transport
 * @throws Error if distanceKm is negative
 */
export function calculateTransportCO2(
  vehicle: TransportVehicle,
  distanceKm: number
): number {
  if (distanceKm < 0) throw new Error('Distance cannot be negative');
  if (distanceKm === 0) return 0;

  let factor: number;
  if (vehicle === 'flightShortHaul') {
    factor =
      distanceKm < FLIGHT_SHORT_HAUL_THRESHOLD_KM
        ? TRANSPORT_FACTORS.flightShortHaul
        : TRANSPORT_FACTORS.flightLongHaul;
  } else {
    factor = TRANSPORT_FACTORS[vehicle] as number;
  }

  return Math.round(factor * distanceKm * 1000) / 1000;
}

/**
 * Calculate CO2 emissions for food
 * @throws Error if meals is negative or not an integer
 */
export function calculateFoodCO2(foodType: FoodType, meals: number): number {
  if (meals < 0) throw new Error('Number of meals cannot be negative');
  if (meals === 0) return 0;
  const factor = FOOD_FACTORS[foodType];
  return Math.round(factor * meals * 1000) / 1000;
}

/**
 * Calculate CO2 emissions for energy usage
 */
export function calculateEnergyCO2(
  electricityKwh: number,
  gasM3: number
): number {
  if (electricityKwh < 0) throw new Error('Electricity kWh cannot be negative');
  if (gasM3 < 0) throw new Error('Gas cubic meters cannot be negative');

  const electricityCO2 = ENERGY_FACTORS.electricity * electricityKwh;
  const gasCO2 = ENERGY_FACTORS.gasLpg * gasM3;
  return Math.round((electricityCO2 + gasCO2) * 1000) / 1000;
}

/**
 * Calculate CO2 emissions for water usage
 */
export function calculateWaterCO2(litres: number): number {
  if (litres < 0) throw new Error('Water litres cannot be negative');
  return Math.round(WATER_FACTORS.waterPumping * litres * 1000) / 1000;
}

/**
 * Calculate CO2 emissions for shopping
 */
export function calculateShoppingCO2(
  category: ShoppingCategory,
  quantity: number
): number {
  if (quantity < 0) throw new Error('Quantity cannot be negative');
  if (quantity === 0) return 0;
  const factor = SHOPPING_FACTORS[category];
  return Math.round(factor * quantity * 1000) / 1000;
}

/**
 * Calculate CO2 for any activity category given its details
 */
export function calculateActivityCO2(
  category: ActivityCategory,
  details: ActivityDetails
): number {
  switch (category) {
    case 'transport': {
      const d = details as TransportDetails;
      return calculateTransportCO2(d.vehicle, d.distanceKm);
    }
    case 'food': {
      const d = details as FoodDetails;
      return calculateFoodCO2(d.foodType, d.meals);
    }
    case 'energy': {
      const d = details as EnergyDetails;
      return calculateEnergyCO2(d.electricityKwh, d.gasM3);
    }
    case 'water': {
      const d = details as WaterDetails;
      return calculateWaterCO2(d.litres);
    }
    case 'shopping': {
      const d = details as ShoppingDetails;
      return calculateShoppingCO2(d.shoppingCategory, d.quantity);
    }
    default:
      return 0;
  }
}

/**
 * Clamp a value to a min/max range
 */
export function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Validate and sanitize numeric input
 */
export function validateNumericInput(
  value: number,
  min: number,
  max: number,
  fieldName: string
): number {
  if (isNaN(value)) throw new Error(`${fieldName} must be a valid number`);
  if (value < min) throw new Error(`${fieldName} must be at least ${min}`);
  if (value > max) throw new Error(`${fieldName} must be at most ${max}`);
  return value;
}
