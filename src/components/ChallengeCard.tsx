import { memo } from 'react';
import { CheckCircle, Circle, Target } from 'lucide-react';
import type { Challenge } from '../types';

interface ChallengeCardProps {
  challenge: Challenge | null;
  onComplete: () => void;
  isCompleting: boolean;
}

function ChallengeCard({ challenge, onComplete, isCompleting }: ChallengeCardProps) {
  if (!challenge) return null;

  return (
    <article className="card overflow-hidden" aria-labelledby="challenge-title">
      <div className="bg-gradient-to-r from-primary-600 to-teal-600 px-5 py-4">
        <div className="flex items-center gap-2 text-white/90 mb-1">
          <Target className="w-4 h-4" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-wider">Weekly Challenge</span>
        </div>
        <h3 id="challenge-title" className="text-xl font-bold text-white flex items-center gap-2">
          <span aria-hidden="true" className="text-2xl">{challenge.icon}</span>
          {challenge.title}
        </h3>
      </div>
      
      <div className="p-5">
        <p className="text-gray-600 dark:text-gray-300 mb-4">{challenge.description}</p>
        
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-5 border border-gray-100 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <strong className="text-gray-900 dark:text-white">Goal:</strong> {challenge.targetMetric}
          </p>
        </div>

        {challenge.completed ? (
          <div className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium rounded-xl border border-green-200 dark:border-green-800">
            <CheckCircle className="w-5 h-5" aria-hidden="true" />
            Challenge Completed!
          </div>
        ) : (
          <button
            onClick={onComplete}
            disabled={isCompleting}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-400 font-medium rounded-xl border border-primary-200 dark:border-primary-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            aria-label={`Mark ${challenge.title} as complete`}
          >
            {isCompleting ? (
              <span className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Circle className="w-5 h-5" aria-hidden="true" />
            )}
            Mark as Complete
          </button>
        )}
      </div>
    </article>
  );
}

export default memo(ChallengeCard);
