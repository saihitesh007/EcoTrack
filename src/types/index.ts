import type { Timestamp } from 'firebase/firestore';

export type ActivityCategory = 'transport' | 'food' | 'energy' | 'water' | 'shopping';

export type TransportVehicle =
  | 'carPetrol'
  | 'carDiesel'
  | 'bus'
  | 'metroTrain'
  | 'flightShortHaul'
  | 'flightLongHaul'
  | 'bikeWalk'
  | 'twoWheelerPetrol';

export type FoodType = 'vegan' | 'vegetarian' | 'chickenFish' | 'beefLamb';
export type ShoppingCategory = 'electronics' | 'clothing' | 'other';
export type ScoreGrade = 'Excellent' | 'Good' | 'Average' | 'Poor';

export interface TransportDetails {
  vehicle: TransportVehicle;
  distanceKm: number;
  origin?: string;
  destination?: string;
}

export interface FoodDetails {
  foodType: FoodType;
  meals: number;
}

export interface EnergyDetails {
  electricityKwh: number;
  gasM3: number;
}

export interface WaterDetails {
  litres: number;
}

export interface ShoppingDetails {
  shoppingCategory: ShoppingCategory;
  quantity: number;
  itemName?: string;
}

export type ActivityDetails =
  | TransportDetails
  | FoodDetails
  | EnergyDetails
  | WaterDetails
  | ShoppingDetails;

export interface Activity {
  id: string;
  category: ActivityCategory;
  details: ActivityDetails;
  co2kg: number;
  timestamp: Timestamp;
  date: string; // YYYY-MM-DD
  userId: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  onboardingCompleted?: boolean;
  baselineFootprintKg?: number;
  onboardingAnswers?: Record<string, string>;
  activeGoal?: string | null;
  emailSummaryEnabled?: boolean;
  currentStreak: number;
  longestStreak: number;
  lastLoggedDate: string | null; // YYYY-MM-DD
  createdAt: Timestamp;
  weeklyKg: number;
  totalActivities: number;
  sustainabilityScore: number;
}

export interface DailyTotal {
  date: string;
  total: number;
  byCategory: Record<string, number>;
}

export interface WeeklyStats {
  totalKg: number;
  byCategory: Record<string, number>;
  dailyTotals: DailyTotal[];
  score: number;
  grade: ScoreGrade;
}

export interface Insights {
  id: string;
  weekId: string;
  weeklySummary: string;
  recommendations: string[];
  motivationalMessage: string;
  prediction: string;
  anomalies: AnomalyItem[];
  goal: PersonalizedGoal;
  generatedAt: Timestamp;
}

export interface AnomalyItem {
  date: string;
  category: string;
  description: string;
  suggestion: string;
}

export interface PersonalizedGoal {
  targetReductionKg: number;
  strategies: string[];
  description: string;
}

export interface Challenge {
  id: string;
  weekId: string;
  title: string;
  description: string;
  icon: string;
  category: ActivityCategory;
  targetMetric: string;
  completed: boolean;
  completedAt?: Timestamp;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string; // first name + last initial only
  weeklyKg: number;
  score: number;
  weekId: string;
  avatarColor: string;
  rank?: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface PaginatedActivities {
  activities: Activity[];
  hasMore: boolean;
  lastDoc: unknown;
}

export interface GoalProgress {
  targetKg: number;
  savedKg: number;
  percentage: number;
  description: string;
}

export interface OffsetInfo {
  weeklyKg: number;
  treesNeeded: number;
}
