import { memo, useMemo } from 'react';
import type { Activity } from '../types';
import { getLastNDates } from '../utils/formatters';

interface CarbonCalendarProps {
  activities: Activity[];
}

function CarbonCalendar({ activities }: CarbonCalendarProps) {
  const dates = useMemo(() => getLastNDates(28), []);
  const totalsByDate = useMemo(() => {
    return activities.reduce<Record<string, number>>((acc, activity) => {
      acc[activity.date] = (acc[activity.date] || 0) + activity.co2kg;
      return acc;
    }, {});
  }, [activities]);

  const max = Math.max(...Object.values(totalsByDate), 1);

  const getTone = (value: number) => {
    if (value === 0) return 'bg-gray-200 dark:bg-gray-800';
    if (value <= max * 0.33) return 'bg-emerald-300 dark:bg-emerald-700';
    if (value <= max * 0.66) return 'bg-amber-300 dark:bg-amber-600';
    return 'bg-rose-400 dark:bg-rose-600';
  };

  return (
    <section className="card p-5 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Carbon Calendar</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">A heatmap of your recent emissions.</p>
      </div>
      <div className="grid grid-cols-7 gap-2" role="grid" aria-label="Carbon calendar heatmap">
        {dates.map(date => {
          const total = totalsByDate[date] ?? 0;
          return (
            <div
              key={date}
              role="gridcell"
              title={`${date}: ${total.toFixed(2)} kg CO2`}
              className={`aspect-square rounded-md ${getTone(total)} flex items-center justify-center text-[10px] font-semibold text-gray-700 dark:text-gray-100`}
            >
              {total > 0 ? total.toFixed(0) : ''}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-800" />No data</span>
        <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-300 dark:bg-emerald-700" />Low</span>
        <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-300 dark:bg-amber-600" />Medium</span>
        <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded bg-rose-400 dark:bg-rose-600" />High</span>
      </div>
    </section>
  );
}

export default memo(CarbonCalendar);
