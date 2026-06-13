import { memo, useMemo } from 'react';
import { Trees } from 'lucide-react';
import { formatKg, formatMonthLabel } from '../utils/formatters';

interface ReductionJourneyProps {
  joinedAtMonth?: string;
  currentMonthKg: number;
  previousMonthKg: number;
}

function ReductionJourney({ joinedAtMonth = '2026-01', currentMonthKg, previousMonthKg }: ReductionJourneyProps) {
  const delta = previousMonthKg - currentMonthKg;
  const percent = previousMonthKg > 0 ? (delta / previousMonthKg) * 100 : 0;
  const treesSaved = useMemo(() => Math.max(0, Math.ceil(delta / 21.77)), [delta]);

  return (
    <section className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
          <Trees className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Reduction Journey</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Since {formatMonthLabel(joinedAtMonth)}, you are building better habits.
          </p>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-gray-50 dark:bg-gray-900/60 p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Previous month</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{formatKg(previousMonthKg)} CO₂</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Current month</p>
          <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300">{formatKg(currentMonthKg)} CO₂</p>
        </div>
        <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Change</p>
          <p className="mt-1 text-2xl font-black text-blue-700 dark:text-blue-300">{percent.toFixed(0)}%</p>
        </div>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        You have reduced your footprint by {formatKg(Math.max(0, delta))} since you joined. That is the equivalent of saving about {treesSaved} trees.
      </p>
    </section>
  );
}

export default memo(ReductionJourney);
