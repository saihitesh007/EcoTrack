import { useCallback, useMemo, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  startAfter,
  onSnapshot,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { COLLECTIONS } from '../constants/emissions';
import { DEMO_ACTIVITIES } from '../constants/rawData';
import { getTodayString, getDaysAgoString } from '../utils/formatters';
import type { Activity, ActivityCategory, ActivityDetails, DailyTotal } from '../types';

const PAGE_SIZE = 10;
const TIMEOUT_MS = 3000;

function activitiesPath(uid: string) {
  return `${COLLECTIONS.USERS}/${uid}/${COLLECTIONS.ACTIVITIES}`;
}

function isFirestoreTimestamp(value: unknown): value is { toDate: () => Date } {
  return Boolean(value && typeof value === 'object' && 'toDate' in value);
}

function normalizeActivity(activity: Activity, fallbackIndex: number): Activity {
  return {
    ...activity,
    timestamp: isFirestoreTimestamp(activity.timestamp)
      ? activity.timestamp
      : { toDate: () => new Date(), toMillis: () => Date.now() } as never,
    id: activity.id || `fallback-${fallbackIndex}`,
  };
}

export function useActivities(uid: string | null, category?: ActivityCategory) {
  const queryClient = useQueryClient();
  const [weeklyActivities, setWeeklyActivities] = useState<Activity[]>([]);
  const [activities30Days, setActivities30Days] = useState<Activity[]>([]);
  const [isWeeklyLoading, setIsWeeklyLoading] = useState(true);
  const [is30DaysLoading, setIs30DaysLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isWeeklyLoading && !is30DaysLoading) {
      setTimedOut(false);
      return;
    }

    const timer = window.setTimeout(() => {
      if (isWeeklyLoading || is30DaysLoading) {
        const recentDemo = DEMO_ACTIVITIES.filter(activity => activity.date >= getDaysAgoString(6));
        setWeeklyActivities(recentDemo);
        setActivities30Days(DEMO_ACTIVITIES);
        setTimedOut(true);
        setIsWeeklyLoading(false);
        setIs30DaysLoading(false);
      }
    }, TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [isWeeklyLoading, is30DaysLoading]);

  useEffect(() => {
    if (!uid) {
      setWeeklyActivities([]);
      setActivities30Days([]);
      setIsWeeklyLoading(false);
      setIs30DaysLoading(false);
      setError(null);
      return;
    }

    setIsWeeklyLoading(true);
    setIs30DaysLoading(true);
    setError(null);

    const sevenDaysAgo = getDaysAgoString(6);
    const thirtyDaysAgo = getDaysAgoString(29);
    const ref = collection(db, activitiesPath(uid));

    const buildQuery = (fromDate: string) =>
      query(ref, where('date', '>=', fromDate), orderBy('date', 'desc'));

    const weeklyUnsubscribe = onSnapshot(
      buildQuery(sevenDaysAgo),
      snapshot => {
        const mapped = snapshot.docs.map((document, index) =>
          normalizeActivity({ id: document.id, ...document.data() } as unknown as Activity, index)
        );
        setWeeklyActivities(mapped);
        setIsWeeklyLoading(false);
      },
      err => {
        if (import.meta.env.DEV) {
          console.error('Weekly activity listener error:', err);
        }
        setWeeklyActivities(DEMO_ACTIVITIES.filter(activity => activity.date >= sevenDaysAgo));
        setIsWeeklyLoading(false);
        setError(err.message || 'Unable to load weekly activities');
      }
    );

    const thirtyDayUnsubscribe = onSnapshot(
      buildQuery(thirtyDaysAgo),
      snapshot => {
        const mapped = snapshot.docs.map((document, index) =>
          normalizeActivity({ id: document.id, ...document.data() } as unknown as Activity, index)
        );
        setActivities30Days(mapped);
        setIs30DaysLoading(false);
      },
      err => {
        if (import.meta.env.DEV) {
          console.error('30-day activity listener error:', err);
        }
        setActivities30Days(DEMO_ACTIVITIES);
        setIs30DaysLoading(false);
        setError(err.message || 'Unable to load activity history');
      }
    );

    return () => {
      weeklyUnsubscribe();
      thirtyDayUnsubscribe();
    };
  }, [uid]);

  const fetchActivitiesPage = useCallback(
    async (cursor?: DocumentSnapshot): Promise<{
      activities: Activity[];
      lastDoc: DocumentSnapshot | null;
      hasMore: boolean;
    }> => {
      if (!uid) return { activities: [], lastDoc: null, hasMore: false };

      try {
        const ref = collection(db, activitiesPath(uid));
        const constraints: Parameters<typeof query>[1][] = [orderBy('timestamp', 'desc'), limit(PAGE_SIZE + 1)];

        if (category) {
          constraints.unshift(where('category', '==', category));
        }
        if (cursor) {
          constraints.push(startAfter(cursor));
        }

        const snap = await getDocs(query(ref, ...constraints));
        const docs = snap.docs as Array<{ id: string; data(): Record<string, unknown> }>;
        const hasMore = docs.length > PAGE_SIZE;
        const sliced = hasMore ? docs.slice(0, PAGE_SIZE) : docs;

        return {
          activities: sliced.map((document, index) =>
            normalizeActivity({ id: document.id, ...document.data() } as unknown as Activity, index)
          ),
          lastDoc: (sliced[sliced.length - 1] as unknown as DocumentSnapshot | undefined) ?? null,
          hasMore,
        };
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Failed to fetch page activities:', err);
        }
        return { activities: [], lastDoc: null, hasMore: false };
      }
    },
    [uid, category]
  );

  const addActivityMutation = useMutation({
    mutationFn: async (params: {
      category: ActivityCategory;
      details: ActivityDetails;
      co2kg: number;
    }) => {
      if (!uid) throw new Error('Not authenticated');
      const ref = collection(db, activitiesPath(uid));
      const docRef = await addDoc(ref, {
        ...params,
        userId: uid,
        timestamp: serverTimestamp(),
        date: getTodayString(),
      });
      return docRef.id;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['activities', uid] });
      void queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: async (activityId: string) => {
      if (!uid) throw new Error('Not authenticated');
      await deleteDoc(doc(db, activitiesPath(uid), activityId));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['activities', uid] });
    },
  });

  const weeklyStats = useMemo(() => {
    const totalKg = weeklyActivities.reduce((sum, activity) => sum + activity.co2kg, 0);
    const byCategory: Record<string, number> = {};
    const byDate: Record<string, Record<string, number>> = {};

    weeklyActivities.forEach(activity => {
      byCategory[activity.category] = (byCategory[activity.category] || 0) + activity.co2kg;
      if (!byDate[activity.date]) byDate[activity.date] = {};
      byDate[activity.date][activity.category] =
        (byDate[activity.date][activity.category] || 0) + activity.co2kg;
    });

    const dailyTotals: DailyTotal[] = Object.entries(byDate).map(([date, cats]) => ({
      date,
      total: Object.values(cats).reduce((sum, value) => sum + value, 0),
      byCategory: cats,
    }));

    return { totalKg, byCategory, dailyTotals };
  }, [weeklyActivities]);

  return {
    weeklyActivities,
    weeklyStats,
    activities30Days,
    isLoading: isWeeklyLoading,
    is30DaysLoading,
    isTimedOut: timedOut,
    error,
    fetchActivitiesPage,
    addActivity: addActivityMutation.mutateAsync,
    isAddingActivity: addActivityMutation.isPending,
    deleteActivity: deleteActivityMutation.mutateAsync,
    isDeletingActivity: deleteActivityMutation.isPending,
  };
}
