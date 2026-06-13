import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Flame, Trophy, Leaf, Target, Bell } from 'lucide-react';
import { useInRouterContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useActivities } from '../hooks/useActivities';
import { useStreak } from '../hooks/useStreak';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useChallenges } from '../hooks/useChallenges';
import { useInsights } from '../hooks/useInsights';
import StatCard from '../components/StatCard';
import ScoreRing from '../components/ScoreRing';
import CO2Chart from '../components/CO2Chart';
import PieChart from '../components/PieChart';
import ChallengeCard from '../components/ChallengeCard';
import ProgressBar from '../components/ProgressBar';
import ErrorBoundary from '../components/ErrorBoundary';
import { formatKg } from '../utils/formatters';
import { INDIA_WEEKLY_AVERAGE_KG, WORLD_WEEKLY_AVERAGE_KG } from '../constants/emissions';
import { DEMO_ACTIVITIES } from '../constants/rawData';
import { getGrade, calculateTreesNeeded, calculateVsAverage } from '../utils/sustainabilityScore';
import SmartActionCards from '../components/SmartActionCards';
import ReductionJourney from '../components/ReductionJourney';
import DailyTip from '../components/DailyTip';
import { getTodayString } from '../utils/formatters';

export default function Dashboard() {
  const inRouter = useInRouterContext();
  const navigate = inRouter ? useNavigate() : () => {};
  const { user, profile } = useAuth();
  const {
    weeklyStats,
    activities30Days = [],
    isLoading,
    isTimedOut,
  } = useActivities(user?.uid ?? null);
  const { currentStreak, isLoading: isStreakLoading, updateStreak } = useStreak(user?.uid ?? null);
  const { userRank, isLoading: isRankLoading } = useLeaderboard(user?.uid ?? null);
  const { challenge, completeChallenge, isCompleting, isLoading: isChallengeLoading } = useChallenges(user?.uid ?? null);
  const { insights } = useInsights(user?.uid ?? null, [], activities30Days);

  useEffect(() => {
    if (user?.uid) {
      void Promise.resolve(updateStreak()).catch(() => {});
    }
  }, [user?.uid, updateStreak]);

  const firstName = profile?.displayName?.split(' ')[0] ?? user?.displayName?.split(' ')[0] ?? 'there';
  const hasActivity = weeklyStats.totalKg > 0 || weeklyStats.dailyTotals.length > 0;
  const showEmptyDashboard = !isLoading && isTimedOut && !hasActivity;
  const demoWeeklyStats = DEMO_ACTIVITIES.reduce(
    (acc, activity) => {
      acc.totalKg += activity.co2kg;
      acc.byCategory[activity.category] = (acc.byCategory[activity.category] || 0) + activity.co2kg;
      const dateRow = acc.dailyTotals.find(row => row.date === activity.date);
      if (dateRow) {
        dateRow.total += activity.co2kg;
        dateRow.byCategory[activity.category] = (dateRow.byCategory[activity.category] || 0) + activity.co2kg;
      } else {
        acc.dailyTotals.push({
          date: activity.date,
          total: activity.co2kg,
          byCategory: { [activity.category]: activity.co2kg },
        });
      }
      return acc;
    },
    {
      totalKg: 0,
      byCategory: {
        transport: 0,
        food: 0,
        energy: 0,
        water: 0,
        shopping: 0,
      },
      dailyTotals: [] as typeof weeklyStats.dailyTotals,
    }
  );
  const chartStats = hasActivity ? weeklyStats : demoWeeklyStats;
  const score = hasActivity
    ? Math.max(0, Math.min(100, Math.round(100 - (weeklyStats.totalKg / INDIA_WEEKLY_AVERAGE_KG) * 50)))
    : 0;
  const grade = getGrade(score);
  const indiaCompare = calculateVsAverage(chartStats.totalKg, INDIA_WEEKLY_AVERAGE_KG);
  const treesNeeded = calculateTreesNeeded(chartStats.totalKg);
  const today = getTodayString();
  const loggedToday = activities30Days.some(activity => activity.date === today);
  const highestCategory = Object.entries(weeklyStats.byCategory).sort(([, left], [, right]) => right - left)[0]?.[0] as string | undefined;
  const currentMonthKg = activities30Days
    .filter(activity => activity.date.startsWith(today.slice(0, 7)))
    .reduce((sum, activity) => sum + activity.co2kg, 0);
  const previousMonthDate = new Date();
  previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
  const previousMonthKey = previousMonthDate.toISOString().slice(0, 7);
  const previousMonthKg = activities30Days
    .filter(activity => activity.date.startsWith(previousMonthKey))
    .reduce((sum, activity) => sum + activity.co2kg, 0);
  const dailyTip = highestCategory === 'food'
    ? 'Try one plant-based meal today. Small swaps in food can create quick wins.'
    : highestCategory === 'energy'
      ? 'Turn off unused devices earlier tonight to reduce wasted electricity.'
      : 'Use the bus, walk, or cycle for one short trip today to lower transport emissions.';

  return (
    <ErrorBoundary>
      <motion.div
        initial="initial"
        animate="animate"
        className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
      >
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {showEmptyDashboard ? `Welcome, ${firstName}!` : `Hello, ${firstName} 👋`}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {showEmptyDashboard
              ? 'Start tracking your carbon footprint by logging your first activity.'
              : 'Here is your carbon footprint summary for this week.'}
          </p>
        </header>

        {!loggedToday && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-100">You haven&apos;t logged today&apos;s activities yet!</p>
                <p className="text-sm text-amber-800 dark:text-amber-200">A quick log keeps your tracking streak accurate and useful.</p>
              </div>
            </div>
            <button onClick={() => navigate('/log')} className="btn-secondary">
              Log Now
            </button>
          </div>
        )}

        {/* Debug: Show raw data */}
        {import.meta.env.DEV && (
          <div className="bg-gray-800 text-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-48 border border-gray-600">
            <div className="font-bold mb-2">📊 DEBUG - Raw Data:</div>
            <div className="space-y-1 font-mono">
              <div>✓ User UID: {user?.uid ? '✅ ' + user.uid.slice(0, 10) + '...' : '❌ No UID'}</div>
              <div>✓ Loading: {isLoading ? '⏳ Yes' : '✅ No'}</div>
              <div>✓ Timed Out: {isTimedOut ? '⚠️ Yes' : '✅ No'}</div>
              <div>✓ Weekly Activities: {weeklyStats.dailyTotals.length} days</div>
              <div>✓ Total CO₂: {weeklyStats.totalKg} kg</div>
              <div>✓ 30-Day Activities: {activities30Days?.length ?? 0} items</div>
              <div>✓ Current Streak: {currentStreak} days</div>
              <div>✓ User Rank: {userRank ?? 'N/A'}</div>
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-300">Click to expand raw weeklyStats</summary>
                <pre className="mt-1 text-xs overflow-auto">{JSON.stringify(weeklyStats, null, 2)}</pre>
              </details>
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-300">Click to expand raw activities30Days</summary>
                <pre className="mt-1 text-xs overflow-auto">{JSON.stringify(activities30Days?.slice(0, 2), null, 2)}</pre>
              </details>
            </div>
          </div>
        )}

        {showEmptyDashboard && (
          <div className="rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-8 text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Get started with your first activity</p>
            <button
              type="button"
              onClick={() => navigate('/log')}
              className="btn-primary inline-flex items-center justify-center px-6 py-3 text-base font-semibold"
            >
              Log Your First Activity
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            id="total"
            label="Total CO₂ This Week"
            value={formatKg(chartStats.totalKg)}
            icon={Activity}
            loading={isLoading && !isTimedOut}
            trend={indiaCompare.isBetter ? 'down' : 'up'}
            trendLabel={`${indiaCompare.percentage}% ${indiaCompare.isBetter ? 'better' : 'worse'} than avg`}
          />
          <StatCard
            id="streak"
            label="Current Streak"
            value={`${currentStreak} Days`}
            icon={Flame}
            iconColor="text-orange-500"
            iconBg="bg-orange-50 dark:bg-orange-900/30"
            loading={isStreakLoading && !isTimedOut}
          />
          <StatCard
            id="rank"
            label="Leaderboard Rank"
            value={userRank ? `#${userRank}` : user ? '—' : '-' }
            icon={Trophy}
            iconColor="text-yellow-500"
            iconBg="bg-yellow-50 dark:bg-yellow-900/30"
            loading={isRankLoading && !isTimedOut}
          />
          <StatCard
            id="trees"
            label="Trees Needed to Offset"
            value={treesNeeded}
            subValue="For 1 year of absorption"
            icon={Leaf}
            iconColor="text-green-500"
            iconBg="bg-green-50 dark:bg-green-900/30"
            loading={isLoading && !isTimedOut}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DailyTip tip={dailyTip} />
            <ReductionJourney
              currentMonthKg={currentMonthKg || chartStats.totalKg}
              previousMonthKg={previousMonthKg || chartStats.totalKg + 8}
            />

            <div className="card p-5 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Weekly Emissions Trend</h2>
                {isLoading && !isTimedOut ? (
                  <div className="h-[300px] flex items-center justify-center skeleton rounded-xl" />
              ) : (
                <CO2Chart data={chartStats.dailyTotals} />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="card p-5 sm:p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Category Breakdown</h2>
                {isLoading && !isTimedOut ? (
                  <div className="h-[250px] flex items-center justify-center skeleton rounded-xl" />
                ) : (
                  <PieChart data={chartStats.byCategory} />
                )}
              </div>

              <div className="card p-5 sm:p-6 flex flex-col justify-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Sustainability Score</h2>
                {isLoading && !isTimedOut ? (
                  <div className="h-[160px] flex items-center justify-center skeleton rounded-full w-[160px] mx-auto" />
                ) : (
                  <div className="mx-auto">
                    <ScoreRing score={score} grade={grade} size={180} strokeWidth={14} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <SmartActionCards
              highestCategory={(highestCategory as 'transport' | 'food' | 'energy' | 'water' | 'shopping') ?? 'transport'}
              onDone={() => navigate('/log')}
            />

            {insights?.goal && (
              <div className="card p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800/50">
                <h2 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5" /> Active Goal
                </h2>
                <p className="text-sm text-green-800 dark:text-green-200 mb-4 font-medium">
                  Reduce emissions by {insights.goal.targetReductionKg} kg this month
                </p>
                <ProgressBar
                  label="Monthly Progress"
                  value={35}
                  max={100}
                  colorClass="bg-green-500"
                />
                <p className="text-xs text-green-700 dark:text-green-300 mt-3 italic">
                  "{insights.goal.description}"
                </p>
              </div>
            )}

            <div className="card p-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">How You Compare</h2>
              <div className="space-y-5">
                <ProgressBar
                  label="You"
                  value={weeklyStats.totalKg}
                  max={Math.max(150, weeklyStats.totalKg)}
                  unit="kg"
                  colorClass={indiaCompare.isBetter ? 'bg-green-500' : 'bg-red-500'}
                  showPercentage={false}
                />
                <ProgressBar
                  label="India Average"
                  value={INDIA_WEEKLY_AVERAGE_KG}
                  max={Math.max(150, weeklyStats.totalKg)}
                  unit="kg"
                  colorClass="bg-blue-500"
                  showPercentage={false}
                />
                <ProgressBar
                  label="World Average"
                  value={WORLD_WEEKLY_AVERAGE_KG}
                  max={Math.max(150, weeklyStats.totalKg)}
                  unit="kg"
                  colorClass="bg-gray-400"
                  showPercentage={false}
                />
              </div>
              {!isLoading && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
                  You emit <strong>{indiaCompare.percentage}% {indiaCompare.isBetter ? 'less' : 'more'}</strong> than the average Indian citizen.
                </p>
              )}
            </div>

            {isChallengeLoading ? (
              <div className="card p-5 skeleton h-[200px]" />
            ) : (
              <ChallengeCard
                challenge={challenge}
                onComplete={() => completeChallenge()}
                isCompleting={isCompleting}
              />
            )}

            <div className="card p-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Offset Your Impact</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                It takes approximately <strong>{treesNeeded} trees</strong> a full year to absorb your weekly emissions.
              </p>
              <div className="space-y-2">
                <a href="https://teamtrees.org/" target="_blank" rel="noopener noreferrer" className="block text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  Plant trees with TeamTrees ↗
                </a>
                <a href="https://www.goldstandard.org/" target="_blank" rel="noopener noreferrer" className="block text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  Buy certified Gold Standard offsets ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </ErrorBoundary>
  );
}
