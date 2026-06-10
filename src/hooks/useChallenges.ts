import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { COLLECTIONS } from '../constants/emissions';
import { getCurrentChallenge, getWeekId, getWeekNumber } from '../constants/challenges';
import { DEMO_CHALLENGE } from '../constants/rawData';
import type { Challenge } from '../types';

function challengePath(uid: string, weekId: string) {
  return `${COLLECTIONS.USERS}/${uid}/${COLLECTIONS.CHALLENGES}/${weekId}`;
}

export function useChallenges(uid: string | null) {
  const queryClient = useQueryClient();
  const weekId = getWeekId();
  const weekNumber = getWeekNumber();
  const currentChallengeTemplate = getCurrentChallenge(weekNumber);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setChallenge(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const ref = doc(db, challengePath(uid, weekId));
    const unsubscribe = onSnapshot(
      ref,
      async snapshot => {
        try {
          if (snapshot.exists()) {
            setChallenge(snapshot.data() as unknown as Challenge);
          } else {
            const newChallenge: Challenge = {
              id: weekId,
              weekId,
              ...currentChallengeTemplate,
              completed: false,
            };
            await setDoc(ref, newChallenge as unknown as Record<string, unknown>);
            setChallenge(newChallenge);
          }
        } catch (err) {
          if (import.meta.env.DEV) {
            console.error('Challenge creation error:', err);
          }
          setError(err instanceof Error ? err.message : 'Unable to initialize challenge');
          setChallenge(null);
        } finally {
          setIsLoading(false);
        }
      },
      err => {
        if (import.meta.env.DEV) {
          console.error('Challenge listener error:', err);
        }
        setError(err.message || 'Unable to load challenge');
        setChallenge({ ...DEMO_CHALLENGE, id: weekId, weekId });
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [uid, weekId, currentChallengeTemplate]);

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!uid) throw new Error('Not authenticated');
      const ref = doc(db, challengePath(uid, weekId));
      await setDoc(
        ref,
        { completed: true, completedAt: serverTimestamp() },
        { merge: true }
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['challenge', uid, weekId] });
    },
    onError: err => {
      if (import.meta.env.DEV) {
        console.error('Complete challenge error:', err);
      }
      setError(err instanceof Error ? err.message : 'Unable to complete challenge');
    },
  });

  return {
    challenge,
    isLoading,
    isTimedOut: timedOut,
    error,
    completeChallenge: completeMutation.mutateAsync,
    isCompleting: completeMutation.isPending,
  };
}
