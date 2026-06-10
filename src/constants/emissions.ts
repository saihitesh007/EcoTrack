// Emission factors (kg CO₂ per unit)
export const TRANSPORT_FACTORS = {
  carPetrol: 0.21,        // kg CO₂/km
  carDiesel: 0.17,        // kg CO₂/km
  bus: 0.089,             // kg CO₂/km
  metroTrain: 0.041,      // kg CO₂/km
  flightShortHaul: 0.255, // kg CO₂/km (<1500km)
  flightLongHaul: 0.195,  // kg CO₂/km (>=1500km)
  bikeWalk: 0,            // kg CO₂/km
  twoWheelerPetrol: 0.103,// kg CO₂/km
} as const;

export const FOOD_FACTORS = {
  vegan: 0.5,        // kg CO₂/meal
  vegetarian: 1.5,   // kg CO₂/meal
  chickenFish: 3.3,  // kg CO₂/meal
  beefLamb: 6.0,     // kg CO₂/meal
} as const;

export const ENERGY_FACTORS = {
  electricity: 0.233, // kg CO₂/kWh (India grid average)
  gasLpg: 2.04,       // kg CO₂/cubic meter
} as const;

export const WATER_FACTORS = {
  waterPumping: 0.0003, // kg CO₂/litre
} as const;

export const SHOPPING_FACTORS = {
  electronics: 300, // kg CO₂/item
  clothing: 10,     // kg CO₂/item
  other: 5,         // kg CO₂/item
} as const;

export const FLIGHT_SHORT_HAUL_THRESHOLD_KM = 1500;

export const INDIA_WEEKLY_AVERAGE_KG = 80.7;  // 4.2 tonnes/year
export const WORLD_WEEKLY_AVERAGE_KG = 92.3;  // 4.8 tonnes/year
export const TREE_CO2_ABSORPTION_KG_YEAR = 21.77;

export const TRANSPORT_VEHICLE_OPTIONS = [
  { value: 'carPetrol', label: 'Car (Petrol)', factor: TRANSPORT_FACTORS.carPetrol },
  { value: 'carDiesel', label: 'Car (Diesel)', factor: TRANSPORT_FACTORS.carDiesel },
  { value: 'bus', label: 'Bus', factor: TRANSPORT_FACTORS.bus },
  { value: 'metroTrain', label: 'Metro / Train', factor: TRANSPORT_FACTORS.metroTrain },
  { value: 'flightShortHaul', label: 'Flight (Short Haul <1500km)', factor: TRANSPORT_FACTORS.flightShortHaul },
  { value: 'flightLongHaul', label: 'Flight (Long Haul >1500km)', factor: TRANSPORT_FACTORS.flightLongHaul },
  { value: 'bikeWalk', label: 'Bike / Walk', factor: TRANSPORT_FACTORS.bikeWalk },
  { value: 'twoWheelerPetrol', label: 'Two-Wheeler (Petrol)', factor: TRANSPORT_FACTORS.twoWheelerPetrol },
] as const;

export const FOOD_TYPE_OPTIONS = [
  { value: 'vegan', label: 'Vegan', factor: FOOD_FACTORS.vegan },
  { value: 'vegetarian', label: 'Vegetarian', factor: FOOD_FACTORS.vegetarian },
  { value: 'chickenFish', label: 'Chicken / Fish', factor: FOOD_FACTORS.chickenFish },
  { value: 'beefLamb', label: 'Beef / Lamb', factor: FOOD_FACTORS.beefLamb },
] as const;

export const SHOPPING_CATEGORY_OPTIONS = [
  { value: 'electronics', label: 'Electronics', factor: SHOPPING_FACTORS.electronics },
  { value: 'clothing', label: 'Clothing', factor: SHOPPING_FACTORS.clothing },
  { value: 'other', label: 'Other', factor: SHOPPING_FACTORS.other },
] as const;

export const ACTIVITY_CATEGORIES = ['transport', 'food', 'energy', 'water', 'shopping'] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  transport: '#3b82f6',
  food: '#f59e0b',
  energy: '#f97316',
  water: '#06b6d4',
  shopping: '#8b5cf6',
};

export const CATEGORY_LABELS: Record<string, string> = {
  transport: 'Transport',
  food: 'Food',
  energy: 'Energy',
  water: 'Water',
  shopping: 'Shopping',
};

// Sustainability score thresholds
export const SCORE_THRESHOLDS = {
  excellent: { min: 80, max: 100, label: 'Excellent', color: 'eco-excellent' },
  good: { min: 60, max: 79, label: 'Good', color: 'eco-good' },
  average: { min: 40, max: 59, label: 'Average', color: 'eco-average' },
  poor: { min: 0, max: 39, label: 'Poor', color: 'eco-poor' },
} as const;

// Firestore collection paths
export const COLLECTIONS = {
  USERS: 'users',
  ACTIVITIES: 'activities',
  PROFILE: 'profile',
  INSIGHTS: 'insights',
  CHALLENGES: 'challenges',
  LEADERBOARD: 'leaderboard',
} as const;

export const GEMINI_RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour
