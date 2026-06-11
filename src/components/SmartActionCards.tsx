import { memo, useMemo } from 'react';
import { Bike, Salad, Zap, Flame } from 'lucide-react';
import type { ActivityCategory } from '../types';
import { formatKg } from '../utils/formatters';

interface SmartActionCardsProps {
  highestCategory: ActivityCategory | null;
  onDone?: (category: ActivityCategory) => void;
}

const CARD_MAP: Record<ActivityCategory, { title: string; description: string; savings: number; icon: typeof Bike }> = {
  transport: {
    title: 'Take the bus today',
    description: 'Skip one car trip and cut an easy chunk of transport emissions.',
    savings: 2.4,
    icon: Bike,
  },
  food: {
    title: 'Choose a vegetarian meal',
    description: 'A single lighter meal can reduce today’s footprint noticeably.',
    savings: 1.8,
    icon: Salad,
  },
  energy: {
    title: 'Turn off AC earlier',
    description: 'Reduce energy use by switching off cooling and lights sooner.',
    savings: 0.5,
    icon: Zap,
  },
  water: {
    title: 'Shorter shower challenge',
    description: 'Save water and the carbon cost of pumping and treatment.',
    savings: 0.1,
    icon: Flame,
  },
  shopping: {
    title: 'Delay a purchase',
    description: 'Hold off on a non-essential buy to avoid new embodied emissions.',
    savings: 5,
    icon: Flame,
  },
};

function SmartActionCards({ highestCategory, onDone }: SmartActionCardsProps) {
  const cards = useMemo(() => {
    const baseCategory = highestCategory ?? 'transport';
    return [baseCategory, baseCategory === 'food' ? 'transport' : 'food', baseCategory === 'energy' ? 'transport' : 'energy'] as ActivityCategory[];
  }, [highestCategory]);

  return (
    <section className="card p-5 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quick Actions to Reduce Today</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Personalized to your biggest emission category.</p>
      </div>
      <div className="grid gap-3">
        {cards.map(category => {
          const data = CARD_MAP[category];
          const Icon = data.icon;
          return (
            <article key={category} className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900/40">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{data.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{data.description}</p>
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mt-2">
                    Save about {formatKg(data.savings)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onDone?.(category)}
                    className="mt-3 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    I did this! ✓
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default memo(SmartActionCards);
