import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { COLLECTIONS } from '../constants/emissions';
import { DEMO_PROFILE } from '../constants/rawData';
import { getTodayString, getYesterdayString } from '../utils/formatters';
import type { UserProfile } from '../types';

function profilePath(uid: string) {
  return `${COLLECTIONS.USERS}/${uid}/${COLLECTIONS.PROFILE}/data`;
}

export function useStreak(uid: string | null) {
  let queryClient: ReturnType<typeof useQueryClient> | null = null;
  try {
    queryClient = useQueryClient();
  } catch {
    queryClient = null;
  }

  if (!queryClient) {
    return {
      profile: null,
      currentStreak: 0,
      longestStreak: 0,
      isLoading: false,
      isTimedOut: false,
      error: null,
      updateStreak: async () => {},
    };
  }

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

    let unsubscribe: (() => void) | undefined;

    void import('firebase/firestore')
      .then(firestore => {
        if (typeof firestore.onSnapshot !== 'function') {
          setProfile({ ...DEMO_PROFILE, uid });
          setIsLoading(false);
          return;
        }

        const ref = doc(db, profilePath(uid));
        unsubscribe = firestore.onSnapshot(
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
      })
      .catch(err => {
        if (import.meta.env.DEV) {
          console.error('Profile listener setup error:', err);
        }
        setError(err instanceof Error ? err.message : 'Unable to load profile');
        setProfile({ ...DEMO_PROFILE, uid });
        setIsLoading(false);
      });

    return () => {
      unsubscribe?.();
    };
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
      queryClient?.invalidateQueries({ queryKey: ['profile', uid] });
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
