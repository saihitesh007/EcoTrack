import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { collection, query, where, orderBy, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { COLLECTIONS } from '../constants/emissions';
import { getWeekId } from '../constants/challenges';
import { DEMO_LEADERBOARD } from '../constants/rawData';
import { formatDisplayName } from '../utils/formatters';
import { calculateScore } from '../utils/sustainabilityScore';
import type { LeaderboardEntry } from '../types';

const AVATAR_COLORS = [
  '#16a34a', '#0d9488', '#2563eb', '#7c3aed',
  '#db2777', '#dc2626', '#d97706', '#0891b2',
];

function getAvatarColor(uid: string): string {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function useLeaderboard(uid: string | null) {
  const weekId = getWeekId();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null);
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
    setIsLoading(true);
    setError(null);

    const ref = collection(db, COLLECTIONS.LEADERBOARD);
    const leaderboardQuery = query(ref, where('weekId', '==', weekId), orderBy('weeklyKg', 'asc'));

    const unsubscribe = onSnapshot(
      leaderboardQuery,
      snapshot => {
        const rows = snapshot.docs.map((d, index) => ({
          ...(d.data() as unknown as LeaderboardEntry),
          uid: d.id,
          rank: index + 1,
        }));
        const visibleRows =
          rows.length > 0
            ? rows.slice(0, 10)
            : [...DEMO_LEADERBOARD].sort((left, right) => left.weeklyKg - right.weeklyKg);
        setEntries(visibleRows);
        if (uid) {
          const fullRankIndex = rows.findIndex(row => row.uid === uid);
          setUserRank(fullRankIndex === -1 ? null : fullRankIndex + 1);
          setCurrentUserEntry(rows.find(row => row.uid === uid) ?? null);
        } else {
          setUserRank(null);
          setCurrentUserEntry(null);
        }
        setIsLoading(false);
      },
      err => {
        if (import.meta.env.DEV) {
          console.error('Leaderboard listener error:', err);
        }
        setError(err.message || 'Unable to load leaderboard');
        const fallbackRows = [...DEMO_LEADERBOARD].sort((left, right) => left.weeklyKg - right.weeklyKg);
        setEntries(fallbackRows);
        setUserRank(fallbackRows.find(row => row.uid === uid)?.rank ?? null);
        setCurrentUserEntry(fallbackRows.find(row => row.uid === uid) ?? null);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [uid, weekId]);

  const updateLeaderboardMutation = useMutation({
    mutationFn: async (params: { displayName: string; weeklyKg: number }) => {
      if (!uid) throw new Error('Not authenticated');
      const score = calculateScore(params.weeklyKg);
      const entry: LeaderboardEntry = {
        uid,
        displayName: formatDisplayName(params.displayName),
        weeklyKg: Math.round(params.weeklyKg * 100) / 100,
        score,
        weekId,
        avatarColor: getAvatarColor(uid),
      };
      await setDoc(doc(db, COLLECTIONS.LEADERBOARD, uid), entry as unknown as Record<string, unknown>);
    },
  });

  return {
    entries,
    userRank,
    currentUserEntry,
    isLoading,
    isTimedOut: timedOut,
    error,
    updateLeaderboard: updateLeaderboardMutation.mutateAsync,
  };
}
