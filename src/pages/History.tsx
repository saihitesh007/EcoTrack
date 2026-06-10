import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Download, Filter } from 'lucide-react';
import type { DocumentSnapshot } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { useActivities } from '../hooks/useActivities';
import { generateMonthlyReport } from '../services/pdfService';
import ActivityRow from '../components/ActivityRow';
import EmptyState from '../components/EmptyState';
import Toast, { useToast } from '../components/Toast';
import { ACTIVITY_CATEGORIES, CATEGORY_LABELS } from '../constants/emissions';
import type { ActivityCategory, Activity } from '../types';
import { activitiesToCSV, getTodayString } from '../utils/formatters';
import ErrorBoundary from '../components/ErrorBoundary';

export default function History() {
  const { user, profile } = useAuth();
  const [filterCategory, setFilterCategory] = useState<ActivityCategory | ''>('');
  
  const {
    activities30Days,
    weeklyStats,
    deleteActivity,
    isDeletingActivity,
    fetchActivitiesPage,
  } = useActivities(user?.uid ?? null, filterCategory || undefined);

  const { toasts, addToast, dismissToast } = useToast();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load initial page
  useEffect(() => {
    let mounted = true;
    setLoadingInitial(true);
    fetchActivitiesPage()
      .then(res => {
        if (!mounted) return;
        setActivities(res.activities.length > 0 ? res.activities : activities30Days);
        setLastDoc(res.lastDoc);
        setHasMore(res.hasMore && (res.activities.length > 0 || activities30Days.length > 0));
      })
      .catch(err => {
        if (import.meta.env.DEV) console.error(err);
        if (mounted) addToast('error', 'Failed to load history');
      })
      .finally(() => {
        if (mounted) setLoadingInitial(false);
      });
    return () => { mounted = false; };
  }, [fetchActivitiesPage, addToast, activities30Days]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !lastDoc) return;
    setLoadingMore(true);
    try {
      const res = await fetchActivitiesPage(lastDoc);
      setActivities(prev => [...prev, ...res.activities]);
      setLastDoc(res.lastDoc);
      setHasMore(res.hasMore && res.activities.length > 0);
    } catch (err) {
      addToast('error', 'Failed to load more activities');
    } finally {
      setLoadingMore(false);
    }
  }, [fetchActivitiesPage, lastDoc, hasMore, loadingMore, addToast]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    try {
      await deleteActivity(id);
      setActivities(prev => prev.filter(a => a.id !== id));
      addToast('success', 'Activity deleted');
    } catch (err) {
      addToast('error', 'Failed to delete activity');
    }
  };

  const handleDownloadPdf = () => {
    if (!user || !profile) return;
    try {
      const monthStr = getTodayString().slice(0, 7); // YYYY-MM
      generateMonthlyReport({
        month: monthStr,
        activities: activities30Days,
        weeklyStats: [{ ...weeklyStats, score: 0, grade: 'Good' }], // In a real app we'd fetch 4 weeks
        recommendations: [], // We don't want to burn a Gemini call just for the PDF unless cached
        userName: profile.displayName || 'User',
      });
      addToast('success', 'Report generated successfully');
    } catch (err) {
      addToast('error', 'Failed to generate report');
    }
  };

  const handleExportCsv = () => {
    try {
      const csv = activitiesToCSV(
        activities.map(activity => ({
          date: activity.date,
          category: activity.category,
          co2kg: activity.co2kg,
          details: activity.details as unknown as Record<string, unknown>,
        }))
      );
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'activity-history.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast('success', 'CSV exported successfully');
    } catch (err) {
      addToast('error', 'Failed to export CSV');
    }
  };

  return (
    <ErrorBoundary>
      <motion.div
        initial="initial"
        animate="animate"
        className="page-enter max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6"
      >
      <Toast toasts={toasts} onDismiss={dismissToast} />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <HistoryIcon className="w-8 h-8 text-primary-600" />
            Activity History
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View and manage your past carbon-emitting activities.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadPdf}
            className="btn-secondary"
            disabled={activities30Days.length === 0}
          >
            <Download className="w-4 h-4" />
            Download PDF Report
          </button>
          <button
            onClick={handleExportCsv}
            className="btn-secondary"
            disabled={activities.length === 0}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </header>

      <div className="card overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filter by Category:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterCategory === ''
                  ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {ACTIVITY_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterCategory === cat
                    ? 'bg-primary-600 text-white dark:bg-primary-500'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loadingInitial ? (
            <div className="p-8 flex justify-center">
              <span className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          ) : activities.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={HistoryIcon}
                title="No activities found"
                description={
                  filterCategory
                    ? `You haven't logged any ${CATEGORY_LABELS[filterCategory]} activities yet.`
                    : "You haven't logged any activities yet. Head over to the Log Activity page to get started."
                }
              />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CO₂</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {activities.map(activity => (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                    onDelete={handleDelete}
                    isDeleting={isDeletingActivity}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {hasMore && !loadingInitial && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-center">
            <button
              onClick={() => void loadMore()}
              disabled={loadingMore}
              className="btn-secondary"
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
    </ErrorBoundary>
  );
}
