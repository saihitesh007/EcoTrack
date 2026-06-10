import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { DEMO_INSIGHTS } from '../constants/rawData';
import {
  generateWeeklySummary,
  generateEmissionPrediction,
  detectAnomalies,
  generatePersonalizedGoal,
} from '../services/gemini';
import { COLLECTIONS, GEMINI_RATE_LIMIT_MS } from '../constants/emissions';
import { getWeekId } from '../constants/challenges';
import type { Activity, Insights } from '../types';

function insightsPath(uid: string, weekId: string) {
  return `${COLLECTIONS.USERS}/${uid}/${COLLECTIONS.INSIGHTS}/${weekId}`;
}

export function useInsights(
  uid: string | null,
  weeklyActivities: Activity[],
  activities30Days: Activity[]
) {
  const weekId = getWeekId();
  const [insights, setInsights] = useState<Insights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setTimedOut(false);
      return;
    }

    const timer = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (!uid) {
      setInsights(DEMO_INSIGHTS);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const ref = doc(db, insightsPath(uid, weekId));
    const unsubscribe = onSnapshot(
      ref,
      snapshot => {
        setInsights(snapshot.exists() ? (snapshot.data() as unknown as Insights) : DEMO_INSIGHTS);
        setIsLoading(false);
      },
      err => {
        if (import.meta.env.DEV) {
          console.error('Insights listener error:', err);
        }
        setError(err.message || 'Unable to load insights.');
        setInsights(DEMO_INSIGHTS);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [uid, weekId]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!uid) throw new Error('Not authenticated');
      if (weeklyActivities.length < 3) {
        setInsights(DEMO_INSIGHTS);
        throw new Error('Log at least 3 activities to generate AI insights');
      }

      const existing = insights;
      if (existing?.generatedAt) {
        const genTime = existing.generatedAt.toMillis();
        const elapsed = Date.now() - genTime;
        if (elapsed < GEMINI_RATE_LIMIT_MS) {
          const remainingMs = GEMINI_RATE_LIMIT_MS - elapsed;
          const remainingMin = Math.ceil(remainingMs / 60000);
          throw new Error(`Please wait ${remainingMin} more minute(s) before regenerating insights.`);
        }
      }

      const weeklyTotal = weeklyActivities.reduce((s, a) => s + a.co2kg, 0);
      const byCategory: Record<string, number> = {};
      weeklyActivities.forEach(a => {
        byCategory[a.category] = (byCategory[a.category] || 0) + a.co2kg;
      });

      const [summaryResult, prediction, anomalies, goal] = await Promise.all([
        generateWeeklySummary(weeklyActivities, weeklyTotal, byCategory),
        generateEmissionPrediction(activities30Days),
        detectAnomalies(activities30Days),
        generatePersonalizedGoal(activities30Days),
      ]);

      const newInsights: Omit<Insights, 'id'> = {
        weekId,
        weeklySummary: summaryResult.summary,
        recommendations: summaryResult.recommendations,
        motivationalMessage: summaryResult.motivationalMessage,
        prediction,
        anomalies,
        goal,
        generatedAt: { toDate: () => new Date(), toMillis: () => Date.now() } as never,
      };

      const ref = doc(db, insightsPath(uid, weekId));
      await setDoc(ref, newInsights);

      return { id: weekId, ...newInsights } as Insights;
    },
    onMutate: () => {
      setIsGenerating(true);
      setError(null);
    },
    onSuccess: data => {
      setInsights(data);
      setError(null);
    },
    onError: err => {
      setError(err instanceof Error ? err.message : 'Unable to generate insights. Please try again.');
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  const canRegenerate = (() => {
    if (!insights?.generatedAt) return true;
    const genTime = insights.generatedAt.toMillis();
    return Date.now() - genTime >= GEMINI_RATE_LIMIT_MS;
  })();

  const minutesUntilRefresh = (() => {
    if (!insights?.generatedAt || canRegenerate) return 0;
    const genTime = insights.generatedAt.toMillis();
    return Math.ceil((GEMINI_RATE_LIMIT_MS - (Date.now() - genTime)) / 60000);
  })();

  return {
    insights,
    isLoading,
    isGenerating,
    generateInsights: generateMutation.mutateAsync,
    error,
    canRegenerate,
    minutesUntilRefresh,
    isTimedOut: timedOut,
  };
}
