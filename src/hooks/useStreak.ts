import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { COLLECTIONS } from '../constants/emissions';
import { DEMO_PROFILE } from '../constants/rawData';
import { getTodayString, getYesterdayString } from '../utils/formatters';
import type { UserProfile } from '../types';

function profilePath(uid: string) {
  return `${COLLECTIONS.USERS}/${uid}/${COLLECTIONS.PROFILE}/data`;
}

export function useStreak(uid: string | null) {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
      setProfile(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const ref = doc(db, profilePath(uid));
    const unsubscribe = onSnapshot(
      ref,
      snapshot => {
        setProfile(snapshot.exists() ? (snapshot.data() as unknown as UserProfile) : null);
        setIsLoading(false);
      },
      err => {
        if (import.meta.env.DEV) {
          console.error('Profile listener error:', err);
        }
        setError(err.message || 'Unable to load profile');
        setProfile({ ...DEMO_PROFILE, uid });
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [uid]);

  const updateStreakMutation = useMutation({
    mutationFn: async () => {
      if (!uid) throw new Error('Not authenticated');

      const today = getTodayString();
      const yesterday = getYesterdayString();
      let currentStreak = profile?.currentStreak ?? 0;
      let longestStreak = profile?.longestStreak ?? 0;
      const lastLoggedDate = profile?.lastLoggedDate ?? null;

      if (lastLoggedDate === today) {
        return;
      } else if (lastLoggedDate === yesterday) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }

      longestStreak = Math.max(longestStreak, currentStreak);
      const ref = doc(db, profilePath(uid));
      await setDoc(ref, { currentStreak, longestStreak, lastLoggedDate: today }, { merge: true });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile', uid] });
    },
    onError: err => {
      if (import.meta.env.DEV) {
        console.error('Update streak error:', err);
      }
      setError(err instanceof Error ? err.message : 'Unable to update streak');
    },
  });

  return {
    profile,
    currentStreak: profile?.currentStreak ?? 0,
    longestStreak: profile?.longestStreak ?? 0,
    isLoading,
    isTimedOut: timedOut,
    error,
    updateStreak: updateStreakMutation.mutateAsync,
  };
}
