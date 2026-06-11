import { useState, useEffect, useCallback } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';
import { COLLECTIONS } from '../constants/emissions';
import { DEMO_PROFILE } from '../constants/rawData';
import type { UserProfile } from '../types';

interface UseAuthReturn {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

function buildProfileData(user: User) {
  return {
    uid: user.uid,
    displayName: user.displayName ?? 'User',
    email: user.email ?? '',
    photoURL: user.photoURL ?? null,
    onboardingCompleted: false,
    baselineFootprintKg: 0,
    onboardingAnswers: {},
    activeGoal: null,
    emailSummaryEnabled: false,
    currentStreak: 0,
    longestStreak: 0,
    lastLoggedDate: null,
    createdAt: serverTimestamp(),
    weeklyKg: 0,
    totalActivities: 0,
    sustainabilityScore: 0,
  };
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profileRef = doc(
          db,
          COLLECTIONS.USERS,
          firebaseUser.uid,
          COLLECTIONS.PROFILE,
          'data'
        );
        try {
          const snap = await getDoc(profileRef);
          const defaultProfile = buildProfileData(firebaseUser);
          await setDoc(profileRef, defaultProfile, { merge: true });
          if (snap.exists()) {
            setProfile({ ...defaultProfile, ...(snap.data() as Partial<UserProfile>) } as UserProfile);
          } else {
            setProfile(defaultProfile as UserProfile);
          }
        } catch (err) {
          if (import.meta.env.DEV) {
            console.error('Error fetching profile:', err);
          }
          setProfile({ ...DEMO_PROFILE, uid: firebaseUser.uid, displayName: firebaseUser.displayName ?? DEMO_PROFILE.displayName });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      if (firebaseUser) {
        const profileRef = doc(
          db,
          COLLECTIONS.USERS,
          firebaseUser.uid,
          COLLECTIONS.PROFILE,
          'data'
        );
        const profileData = buildProfileData(firebaseUser);
        await setDoc(profileRef, profileData, { merge: true });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      throw err;
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
      throw err;
    }
  }, []);

  return { user, profile, loading, error, signInWithGoogle, signOutUser };
}

export function getProfilePath(uid: string): string {
  return `${COLLECTIONS.USERS}/${uid}/${COLLECTIONS.PROFILE}/data`;
}

export function formatLastLoggedDate(): string {
  return DEMO_PROFILE.lastLoggedDate ?? new Date().toISOString().split('T')[0];
}
