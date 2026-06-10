import { memo } from 'react';

interface ProgressBarProps {
  label: string;
  value: number;    // 0–100
  max?: number;
  unit?: string;
  colorClass?: string;
  showPercentage?: boolean;
  height?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const HEIGHT_MAP = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

function ProgressBar({
  label,
  value,
  max = 100,
  unit = '',
  colorClass = 'bg-primary-600',
  showPercentage = true,
  height = 'md',
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const roundedPct = Math.round(percentage);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        {showPercentage && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {unit ? `${value} ${unit}` : `${roundedPct}%`}
          </span>
        )}
      </div>
      <div
        className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${HEIGHT_MAP[height]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${roundedPct}%`}
      >
        <div
          className={`${HEIGHT_MAP[height]} ${colorClass} rounded-full ${animated ? 'transition-all duration-700 ease-out' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default memo(ProgressBar);
