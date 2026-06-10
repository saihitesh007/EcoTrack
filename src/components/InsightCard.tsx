import { memo } from 'react';
import { Sparkles, TrendingDown, Target, AlertTriangle } from 'lucide-react';

interface InsightCardProps {
  type: 'summary' | 'prediction' | 'anomaly' | 'goal';
  title: string;
  content: string | React.ReactNode;
  iconBg?: string;
  iconColor?: string;
}

function InsightCard({ type, title, content, iconBg, iconColor }: InsightCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'summary':
        return Sparkles;
      case 'prediction':
        return TrendingDown;
      case 'anomaly':
        return AlertTriangle;
      case 'goal':
        return Target;
    }
  };

  const Icon = getIcon();
  
  const defaultBg = {
    summary: 'bg-blue-50 dark:bg-blue-900/30',
    prediction: 'bg-purple-50 dark:bg-purple-900/30',
    anomaly: 'bg-amber-50 dark:bg-amber-900/30',
    goal: 'bg-green-50 dark:bg-green-900/30',
  }[type];

  const defaultColor = {
    summary: 'text-blue-600 dark:text-blue-400',
    prediction: 'text-purple-600 dark:text-purple-400',
    anomaly: 'text-amber-600 dark:text-amber-400',
    goal: 'text-green-600 dark:text-green-400',
  }[type];

  return (
    <article className="card p-6 border-l-4" style={{ borderLeftColor: 'currentColor' }}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl flex-shrink-0 ${iconBg || defaultBg}`}>
          <Icon className={`w-6 h-6 ${iconColor || defaultColor}`} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {content}
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(InsightCard);
