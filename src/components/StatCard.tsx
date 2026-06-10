import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id: string;
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  loading?: boolean;
}

function StatCard({
  id,
  label,
  value,
  subValue,
  icon: Icon,
  iconColor = 'text-primary-600',
  iconBg = 'bg-primary-50 dark:bg-primary-900/30',
  trend,
  trendLabel,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="card p-5" aria-busy="true" aria-label="Loading stat">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-8 w-16 rounded" />
            <div className="skeleton h-3 w-32 rounded" />
          </div>
          <div className="skeleton w-10 h-10 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <article
      className="card p-5 hover:shadow-md transition-shadow duration-200"
      aria-labelledby={`stat-${id}-label`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p
            id={`stat-${id}-label`}
            className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate"
          >
            {label}
          </p>
          <p
            className="mt-1 text-2xl font-bold text-gray-900 dark:text-white truncate"
            aria-describedby={trendLabel ? `stat-${id}-trend` : undefined}
          >
            {value}
          </p>
          {subValue && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
              {subValue}
            </p>
          )}
          {trend && trendLabel && (
            <p
              id={`stat-${id}-trend`}
              className={`mt-1 text-xs font-medium flex items-center gap-1 ${
                trend === 'down'
                  ? 'text-green-600 dark:text-green-400'
                  : trend === 'up'
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {trend === 'down' ? '▼' : trend === 'up' ? '▲' : ''}
              {trendLabel}
            </p>
          )}
        </div>
        <div className={`ml-3 p-2.5 rounded-xl ${iconBg} flex-shrink-0`} aria-hidden="true">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </article>
  );
}

export default memo(StatCard);
