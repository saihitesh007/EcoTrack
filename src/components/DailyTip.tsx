import { memo } from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';

interface DailyTipProps {
  tip: string;
}

function DailyTip({ tip }: DailyTipProps) {
  return (
    <section className="card p-5 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-900">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-white/80 dark:bg-gray-950/60 border border-emerald-200 dark:border-emerald-800">
          <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Today&apos;s tip for you
          </p>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-6">{tip}</p>
        </div>
      </div>
    </section>
  );
}

export default memo(DailyTip);
