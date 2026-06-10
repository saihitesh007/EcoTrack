import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLeaderboard } from '../hooks/useLeaderboard';
import LeaderboardRow from '../components/LeaderboardRow';
import SkeletonCard from '../components/SkeletonCard';
import { getWeekId } from '../constants/challenges';
import { formatKg } from '../utils/formatters';

export default function Leaderboard() {
  const { user } = useAuth();
  const { entries, currentUserEntry, userRank, isLoading } = useLeaderboard(user?.uid ?? null);

  // Auto-sync current user's profile weekly kg to leaderboard on mount
  // (In a real app, this might be handled by Cloud Functions, but doing it client-side for the hackathon)
  useEffect(() => {
    if (user?.uid && user.displayName) {
      // Just ping the hook to ensure the user exists in the leaderboard collection if they have data
      // useActivities handles the actual updates when an activity is logged
    }
  }, [user]);

  const weekId = getWeekId();
  const top10 = entries.slice(0, 10);
  
  // Is the user in the top 10?
  const isUserInTop10 = top10.some(e => e.uid === user?.uid);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="page-enter max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6"
    >
      <header className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
          <Trophy className="w-10 h-10 text-yellow-600 dark:text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Weekly Leaderboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Top 10 lowest emissions for {weekId}. Reset every week.
        </p>
      </header>

      {/* Current User Summary Banner */}
      {!isLoading && user && currentUserEntry && (
        <div className="bg-gradient-to-r from-primary-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl">
              #{userRank || '-'}
            </div>
            <div>
              <p className="text-primary-100 text-sm font-medium">Your Rank</p>
              <p className="text-2xl font-bold">{formatKg(currentUserEntry.weeklyKg)} CO₂</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-primary-100 text-sm font-medium">Your Score</p>
            <p className="text-3xl font-extrabold">{currentUserEntry.score}</p>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="card p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-6 px-2">
          <Users className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Top Eco Warriors</h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} lines={2} />
            ))}
          </div>
        ) : top10.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No entries for this week yet. Log an activity to be the first!
          </div>
        ) : (
          <div className="space-y-3" role="list">
            {top10.map(entry => (
              <LeaderboardRow
                key={entry.uid}
                entry={entry}
                isCurrentUser={entry.uid === user?.uid}
              />
            ))}
          </div>
        )}

        {/* Show current user at the bottom if they aren't in the top 10 */}
        {!isLoading && user && currentUserEntry && !isUserInTop10 && userRank && userRank > 10 && (
          <>
            <div className="flex justify-center my-4">
              <div className="flex gap-1 flex-col items-center text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
              </div>
            </div>
            <LeaderboardRow
              entry={{ ...currentUserEntry, rank: userRank }}
              isCurrentUser={true}
            />
          </>
        )}
      </div>
    </motion.div>
  );
}
