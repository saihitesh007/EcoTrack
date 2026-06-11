import { useMemo, useState } from 'react';
import { Plus, Bike, Bus, Footprints, Salad, Drumstick, Beef, Zap, Plane, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useActivities } from '../hooks/useActivities';
import { calculateActivityCO2 } from '../utils/carbonCalculator';
import { formatKg } from '../utils/formatters';
import type { ActivityCategory, ActivityDetails } from '../types';

type QuickAction = {
  label: string;
  icon: LucideIcon;
  category: ActivityCategory;
  details: ActivityDetails;
  co2kg: number;
};

export default function QuickLogFAB() {
  const { user } = useAuth();
  const { addActivity } = useActivities(user?.uid ?? null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const actions = useMemo<QuickAction[]>(
    () => [
      { label: 'Drove to work', icon: Bike, category: 'transport', details: { vehicle: 'carPetrol', distanceKm: 15 }, co2kg: calculateActivityCO2('transport', { vehicle: 'carPetrol', distanceKm: 15 }) },
      { label: 'Took bus', icon: Bus, category: 'transport', details: { vehicle: 'bus', distanceKm: 12 }, co2kg: calculateActivityCO2('transport', { vehicle: 'bus', distanceKm: 12 }) },
      { label: 'Walked', icon: Footprints, category: 'transport', details: { vehicle: 'bikeWalk', distanceKm: 2 }, co2kg: 0 },
      { label: 'Vegan meal', icon: Salad, category: 'food', details: { foodType: 'vegan', meals: 1 }, co2kg: calculateActivityCO2('food', { foodType: 'vegan', meals: 1 }) },
      { label: 'Chicken meal', icon: Drumstick, category: 'food', details: { foodType: 'chickenFish', meals: 1 }, co2kg: calculateActivityCO2('food', { foodType: 'chickenFish', meals: 1 }) },
      { label: 'Beef meal', icon: Beef, category: 'food', details: { foodType: 'beefLamb', meals: 1 }, co2kg: calculateActivityCO2('food', { foodType: 'beefLamb', meals: 1 }) },
      { label: 'Used electricity', icon: Zap, category: 'energy', details: { electricityKwh: 5, gasM3: 0 }, co2kg: calculateActivityCO2('energy', { electricityKwh: 5, gasM3: 0 }) },
      { label: 'Took a flight', icon: Plane, category: 'transport', details: { vehicle: 'flightShortHaul', distanceKm: 450 }, co2kg: calculateActivityCO2('transport', { vehicle: 'flightShortHaul', distanceKm: 450 }) },
    ],
    []
  );

  const handleQuickLog = async (action: QuickAction) => {
    if (!user) return;
    try {
      await addActivity({ category: action.category, details: action.details, co2kg: action.co2kg });
      setStatus(`${action.label} logged • ${formatKg(action.co2kg)}`);
      setOpen(false);
      window.setTimeout(() => setStatus(null), 2500);
    } catch {
      setStatus('Could not log activity');
    }
  };

  if (!user) return null;

  return (
    <>
      {status && (
        <div className="fixed bottom-24 right-4 z-[70] rounded-full bg-gray-900 text-white px-4 py-2 text-sm shadow-lg">
          {status}
        </div>
      )}
      <div className="fixed bottom-5 right-5 z-[60]">
        <button
          type="button"
          onClick={() => setOpen(prev => !prev)}
          className="w-14 h-14 rounded-full bg-emerald-600 text-white shadow-2xl flex items-center justify-center hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          aria-label="Open quick activity logger"
        >
          {open ? <X className="w-6 h-6" /> : <Plus className="w-7 h-7" />}
        </button>

        {open && (
          <div className="absolute bottom-16 right-0 w-[min(92vw,26rem)] rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl p-4">
            <p className="font-bold text-gray-900 dark:text-white mb-3">What did you do today?</p>
            <div className="grid grid-cols-2 gap-2">
              {actions.map(action => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => void handleQuickLog(action)}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 px-3 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                  >
                      <Icon className="w-5 h-5 text-emerald-600 mb-2" aria-hidden={true} />
                    <span className="block text-sm font-medium text-gray-900 dark:text-white">{action.label}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">{formatKg(action.co2kg)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
