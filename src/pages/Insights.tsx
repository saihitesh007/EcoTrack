import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Lightbulb, Clock, CheckCircle, Recycle, Truck, Salad } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useActivities } from '../hooks/useActivities';
import { useInsights } from '../hooks/useInsights';
import InsightCard from '../components/InsightCard';
import EmptyState from '../components/EmptyState';
import SkeletonCard from '../components/SkeletonCard';
import Toast, { useToast } from '../components/Toast';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Insights() {
  const { user } = useAuth();
  const { weeklyActivities, activities30Days, isLoading: isLoadingActivities, isTimedOut: isActivitiesTimedOut } = useActivities(user?.uid ?? null);
  const {
    insights,
    isLoading: isLoadingInsights,
    isGenerating,
    generateInsights,
    canRegenerate,
    minutesUntilRefresh,
    error: insightsError,
  } = useInsights(user?.uid ?? null, weeklyActivities, activities30Days);

  const { toasts, addToast, dismissToast } = useToast();
  const hasEnoughData = weeklyActivities.length >= 3;
  const isInitialLoading = isLoadingActivities || isLoadingInsights;

  const insightSections = useMemo(() => {
    if (!insights) return null;
    return {
      weeklySummary: insights.weeklySummary,
      recommendations: insights.recommendations,
      motivationalMessage: insights.motivationalMessage,
      prediction: insights.prediction,
      anomalies: insights.anomalies,
      goal: insights.goal,
    };
  }, [insights]);

  const quickTips = useMemo(
    () => [
      {
        title: 'Take low-carbon transport',
        description: 'Walk, cycle, or use public transport for short daily trips to cut transport emissions fast.',
        icon: Truck,
        accent: 'from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20',
      },
      {
        title: 'Choose more plant-based meals',
        description: 'Swapping one meat-heavy meal for a plant-based option can noticeably reduce your weekly footprint.',
        icon: Salad,
        accent: 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20',
      },
      {
        title: 'Save electricity at home',
        description: 'Turn off standby devices, use LEDs, and reduce unnecessary appliance runtime to lower energy waste.',
        icon: Recycle,
        accent: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
      },
    ],
    []
  );

  const handleGenerate = async () => {
    try {
      await generateInsights();
      addToast('success', 'AI Insights successfully generated!');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Unable to generate insights. Please try again.');
    }
  };

  return (
    <ErrorBoundary>
      <motion.div
        initial="initial"
        animate="animate"
        className="page-enter max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6"
      >
        <Toast toasts={toasts} onDismiss={dismissToast} />

        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
              AI Insights
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Powered by Google Gemini 1.5 Flash</p>
          </div>

          <button
            onClick={() => void handleGenerate()}
            disabled={isGenerating || !canRegenerate || !hasEnoughData}
            className="btn-primary"
          >
            <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Generate Insights'}
          </button>
        </header>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quick Tips</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Short actions that help reduce carbon waste and warming impact.</p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Quick wins
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickTips.map(tip => {
              const Icon = tip.icon;
              return (
                <article
                  key={tip.title}
                  className={`rounded-2xl border border-gray-200/80 dark:border-gray-800 p-4 shadow-sm bg-gradient-to-br ${tip.accent} hover:shadow-md transition-shadow duration-200`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-gray-950/60 border border-white/50 dark:border-gray-700">
                      <Icon className="w-5 h-5 text-gray-800 dark:text-gray-100" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{tip.title}</h3>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{tip.description}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {!canRegenerate && !isGenerating && hasEnoughData && (
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
            <Clock className="w-4 h-4" />
            New insights available in {minutesUntilRefresh} minutes to prevent rate limiting.
          </div>
        )}

        {insightsError && !isInitialLoading ? (
          <EmptyState icon={Lightbulb} title="Unable to generate insights" description={insightsError} />
        ) : isInitialLoading && !isActivitiesTimedOut ? (
          <div className="space-y-4">
            <SkeletonCard lines={4} />
            <SkeletonCard lines={3} />
            <SkeletonCard lines={5} />
          </div>
        ) : !hasEnoughData ? (
          <EmptyState
            icon={Lightbulb}
            title="Not enough data"
            description="Log at least 3 activities to generate AI insights."
          />
        ) : !insightSections && !isGenerating ? (
          <EmptyState
            icon={Lightbulb}
            title="Ready for Analysis"
            description="Click generate to get your first AI-powered sustainability analysis."
          />
        ) : isGenerating ? (
          <div className="space-y-4">
            <SkeletonCard className="animate-pulse-slow" lines={4} />
            <SkeletonCard className="animate-pulse-slow" lines={3} />
          </div>
        ) : insightSections ? (
          <div className="space-y-6">
            <InsightCard
              type="summary"
              title="Weekly Summary"
              content={
                <div className="space-y-4">
                  <p>{insightSections.weeklySummary}</p>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Recommendations:</strong>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {insightSections.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="italic font-medium text-blue-700 dark:text-blue-300">
                    "{insightSections.motivationalMessage}"
                  </p>
                </div>
              }
            />

            <InsightCard
              type="goal"
              title="Personalized Goal"
              content={
                <div className="space-y-3">
                  <p className="font-semibold text-lg text-green-700 dark:text-green-400">
                    Target Reduction: {insightSections.goal.targetReductionKg} kg CO₂
                  </p>
                  <p>{insightSections.goal.description}</p>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Strategies to achieve this:</strong>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {insightSections.goal.strategies.map((strat, i) => (
                        <li key={i}>{strat}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InsightCard type="prediction" title="Next Month Projection" content={<p>{insightSections.prediction}</p>} />

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white px-2">Anomaly Detection</h3>
                {insightSections.anomalies.length > 0 ? (
                  insightSections.anomalies.map((anomaly, i) => (
                    <InsightCard
                      key={i}
                      type="anomaly"
                      title={`Unusual Activity: ${anomaly.category}`}
                      content={
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                            {anomaly.date}
                          </p>
                          <p>{anomaly.description}</p>
                          <p className="font-medium text-amber-900 dark:text-amber-200 bg-amber-100/50 dark:bg-amber-900/30 p-2 rounded">
                            💡 Suggestion: {anomaly.suggestion}
                          </p>
                        </div>
                      }
                    />
                  ))
                ) : (
                  <div className="card p-6 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/50">
                    <p className="text-green-800 dark:text-green-300 text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      No unusual emission spikes detected in the last 30 days. Great consistency!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>
    </ErrorBoundary>
  );
}
