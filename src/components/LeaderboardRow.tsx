import { memo } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import type { LeaderboardEntry } from '../types';
import { formatKg } from '../utils/formatters';
import Badge from './Badge';
import { getGrade } from '../utils/sustainabilityScore';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

function LeaderboardRow({ entry, isCurrentUser = false }: LeaderboardRowProps) {
  const renderRankIcon = () => {
    switch (entry.rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" aria-label="1st Place" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" aria-label="2nd Place" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-700" aria-label="3rd Place" />;
      default:
        return <span className="font-semibold text-gray-500 w-5 text-center">{entry.rank}</span>;
    }
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
        isCurrentUser
          ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800'
          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md'
      }`}
      role="listitem"
    >
      <div className="flex-shrink-0 w-8 flex justify-center">
        {renderRankIcon()}
      </div>
      
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm"
        style={{ backgroundColor: entry.avatarColor }}
        aria-hidden="true"
      >
        {entry.displayName.substring(0, 2).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate flex items-center gap-2">
          {entry.displayName}
          {isCurrentUser && (
            <span className="text-[10px] uppercase tracking-wider font-bold bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 px-2 py-0.5 rounded-full">
              You
            </span>
          )}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Score: {entry.score}/100</p>
      </div>

      <div className="text-right flex flex-col items-end gap-1">
        <p className="font-bold text-gray-900 dark:text-white">{formatKg(entry.weeklyKg)}</p>
        <Badge grade={getGrade(entry.score)} />
      </div>
    </div>
  );
}

export default memo(LeaderboardRow);
