import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInRouterContext, useNavigate } from 'react-router-dom';
import { Bus, Utensils, Zap, Droplets, ShoppingBag, MapPin, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useActivities } from '../hooks/useActivities';
import { useStreak } from '../hooks/useStreak';
import { useLeaderboard } from '../hooks/useLeaderboard';
import Toast, { useToast } from '../components/Toast';
import MapInput from '../components/MapInput';
import { calculateDistance } from '../services/mapsService';
import { calculateActivityCO2 } from '../utils/carbonCalculator';
import {
  TRANSPORT_VEHICLE_OPTIONS,
  FOOD_TYPE_OPTIONS,
  SHOPPING_CATEGORY_OPTIONS,
} from '../constants/emissions';
import type {
  ActivityCategory,
  ActivityDetails,
  FoodType,
  ShoppingCategory,
  TransportVehicle,
} from '../types';
import { formatKg } from '../utils/formatters';

const TABS = [
  { id: 'transport', label: 'Transport', icon: Bus },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'energy', label: 'Energy', icon: Zap },
  { id: 'water', label: 'Water', icon: Droplets },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
] as const;

const toTransportVehicle = (value: string) => value as TransportVehicle;
const toFoodType = (value: string) => value as FoodType;
const toShoppingCategory = (value: string) => value as ShoppingCategory;

export default function LogActivity() {
  const inRouter = useInRouterContext();
  const navigate = inRouter ? useNavigate() : () => {};
  const { user } = useAuth();
  const { weeklyStats, addActivity, isAddingActivity } = useActivities(user?.uid ?? null);
  const { updateStreak } = useStreak(user?.uid ?? null);
  const { updateLeaderboard } = useLeaderboard(user?.uid ?? null);
  const { toasts, addToast, dismissToast } = useToast();

  const [activeTab, setActiveTab] = useState<ActivityCategory>('transport');
  const [calculatingDist, setCalculatingDist] = useState(false);

  const [transport, setTransport] = useState({ vehicle: 'carPetrol', distanceKm: '', origin: '', destination: '' });
  const [food, setFood] = useState({ foodType: 'vegan', meals: '1' });
  const [energy, setEnergy] = useState({ electricityKwh: '', gasM3: '' });
  const [water, setWater] = useState({ litres: '' });
  const [shopping, setShopping] = useState({ shoppingCategory: 'clothing', quantity: '1' });

  const handleCalculateDistance = async () => {
    if (!transport.origin || !transport.destination) {
      addToast('warning', 'Please enter both origin and destination');
      return;
    }
    setCalculatingDist(true);
    try {
      const dist = await calculateDistance(transport.origin, transport.destination);
      setTransport(prev => ({ ...prev, distanceKm: dist.toString() }));
      addToast('success', `Distance calculated: ${dist} km`);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Could not calculate distance');
    } finally {
      setCalculatingDist(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let details: ActivityDetails;
    try {
      switch (activeTab) {
        case 'transport':
          if (!transport.distanceKm) throw new Error('Distance is required');
          details = {
            vehicle: toTransportVehicle(transport.vehicle),
            distanceKm: parseFloat(transport.distanceKm),
            origin: transport.origin || undefined,
            destination: transport.destination || undefined,
          };
          break;
        case 'food':
          if (!food.meals) throw new Error('Number of meals is required');
          details = {
            foodType: toFoodType(food.foodType),
            meals: parseInt(food.meals, 10),
          };
          break;
        case 'energy':
          if (!energy.electricityKwh && !energy.gasM3) throw new Error('Enter at least one energy value');
          details = {
            electricityKwh: parseFloat(energy.electricityKwh || '0'),
            gasM3: parseFloat(energy.gasM3 || '0'),
          };
          break;
        case 'water':
          if (!water.litres) throw new Error('Litres used is required');
          details = {
            litres: parseFloat(water.litres),
          };
          break;
        case 'shopping':
          if (!shopping.quantity) throw new Error('Quantity is required');
          details = {
            shoppingCategory: toShoppingCategory(shopping.shoppingCategory),
            quantity: parseInt(shopping.quantity, 10),
          };
          break;
        default:
          throw new Error('Invalid category');
      }

      const co2kg = calculateActivityCO2(activeTab, details);
      await addActivity({ category: activeTab, details, co2kg });

      try {
        await updateStreak();
      } catch {
        // Streak update is best-effort, activity should still save.
      }

      try {
        await updateLeaderboard({
          displayName: user.displayName ?? 'User',
          weeklyKg: (weeklyStats.totalKg ?? 0) + co2kg,
        });
      } catch {
        // Leaderboard update is best-effort and will sync from listeners.
      }

      addToast('success', `Activity logged! You produced ${formatKg(co2kg)} CO₂`);
      navigate('/dashboard');

      if (activeTab === 'transport') setTransport({ vehicle: 'carPetrol', distanceKm: '', origin: '', destination: '' });
      if (activeTab === 'food') setFood({ foodType: 'vegan', meals: '1' });
      if (activeTab === 'energy') setEnergy({ electricityKwh: '', gasM3: '' });
      if (activeTab === 'water') setWater({ litres: '' });
      if (activeTab === 'shopping') setShopping({ shoppingCategory: 'clothing', quantity: '1' });
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to log activity');
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="page-enter max-w-3xl mx-auto px-4 sm:px-6 py-8"
    >
      <Toast toasts={toasts} onDismiss={dismissToast} />

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Log Activity</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Record your daily activities to track your carbon footprint</p>
      </div>

      <div className="card overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] py-4 px-4 text-sm font-medium flex flex-col items-center gap-2 transition-colors focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800 ${
                activeTab === tab.id
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              <tab.icon className="w-5 h-5" aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div key={activeTab}>
                {activeTab === 'transport' && (
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="vehicle" className="form-label">Vehicle Type</label>
                      <select
                        id="vehicle"
                        value={transport.vehicle}
                        onChange={e => setTransport(prev => ({ ...prev, vehicle: e.target.value }))}
                        className="form-input"
                      >
                        {TRANSPORT_VEHICLE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <MapInput
                        id="origin"
                        label="Origin (optional)"
                        placeholder="e.g. Home"
                        value={transport.origin}
                        onChange={val => setTransport(prev => ({ ...prev, origin: val }))}
                      />
                      <MapInput
                        id="destination"
                        label="Destination (optional)"
                        placeholder="e.g. Office"
                        value={transport.destination}
                        onChange={val => setTransport(prev => ({ ...prev, destination: val }))}
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => void handleCalculateDistance()}
                        disabled={calculatingDist || !transport.origin || !transport.destination}
                        className="btn-secondary text-sm"
                      >
                        {calculatingDist ? <span className="animate-spin mr-1">⌛</span> : <MapPin className="w-4 h-4" />}
                        Calculate Distance
                      </button>
                    </div>

                    <div>
                      <label htmlFor="distanceKm" className="form-label">Distance (km)</label>
                      <input
                        type="number"
                        id="distanceKm"
                        min="0"
                        step="0.1"
                        required
                        value={transport.distanceKm}
                        onChange={e => setTransport(prev => ({ ...prev, distanceKm: e.target.value }))}
                        className="form-input"
                        placeholder="Enter distance in km"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'food' && (
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="foodType" className="form-label">Diet / Meal Type</label>
                      <select
                        id="foodType"
                        value={food.foodType}
                        onChange={e => setFood(prev => ({ ...prev, foodType: e.target.value }))}
                        className="form-input"
                      >
                        {FOOD_TYPE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="meals" className="form-label">Number of Meals</label>
                      <input
                        type="number"
                        id="meals"
                        min="1"
                        max="10"
                        required
                        value={food.meals}
                        onChange={e => setFood(prev => ({ ...prev, meals: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'energy' && (
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="electricityKwh" className="form-label">Electricity Used (kWh)</label>
                      <input
                        type="number"
                        id="electricityKwh"
                        min="0"
                        step="0.1"
                        value={energy.electricityKwh}
                        onChange={e => setEnergy(prev => ({ ...prev, electricityKwh: e.target.value }))}
                        className="form-input"
                        placeholder="e.g. 5.2"
                      />
                    </div>
                    <div>
                      <label htmlFor="gasM3" className="form-label">Gas Used (m³)</label>
                      <input
                        type="number"
                        id="gasM3"
                        min="0"
                        step="0.1"
                        value={energy.gasM3}
                        onChange={e => setEnergy(prev => ({ ...prev, gasM3: e.target.value }))}
                        className="form-input"
                        placeholder="e.g. 1.5"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Note: Provide at least one value.</p>
                  </div>
                )}

                {activeTab === 'water' && (
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="litres" className="form-label">Water Used (Litres)</label>
                      <input
                        type="number"
                        id="litres"
                        min="0"
                        required
                        value={water.litres}
                        onChange={e => setWater(prev => ({ ...prev, litres: e.target.value }))}
                        className="form-input"
                        placeholder="e.g. 150"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'shopping' && (
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="shoppingCategory" className="form-label">Item Category</label>
                      <select
                        id="shoppingCategory"
                        value={shopping.shoppingCategory}
                        onChange={e => setShopping(prev => ({ ...prev, shoppingCategory: e.target.value }))}
                        className="form-input"
                      >
                        {SHOPPING_CATEGORY_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="quantity" className="form-label">Quantity</label>
                      <input
                        type="number"
                        id="quantity"
                        min="1"
                        max="100"
                        required
                        value={shopping.quantity}
                        onChange={e => setShopping(prev => ({ ...prev, quantity: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                  </div>
                )}
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
              <button
                type="submit"
                disabled={isAddingActivity}
                className="btn-primary w-full justify-center text-lg py-3"
              >
                {isAddingActivity ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Save Activity
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
