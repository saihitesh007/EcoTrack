import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStreak } from '../hooks/useStreak';
import * as formatters from '../utils/formatters';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  getFirestore: vi.fn(),
}));
vi.mock('../services/firebase', () => ({
  db: {},
}));

describe('streak tracking', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('provides a hook that returns streak data', () => {
    const { result } = renderHook(() => useStreak('test-user'), { wrapper });
    expect(result.current.currentStreak).toBe(0);
    expect(result.current.longestStreak).toBe(0);
  });

  // For the actual logic tests, we can verify that getTodayString and getYesterdayString 
  // formatters work exactly as needed since they drive the streak logic
  describe('formatter logic for streak', () => {
    it('returns today in YYYY-MM-DD', () => {
      const today = formatters.getTodayString();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns yesterday in YYYY-MM-DD', () => {
      const yesterday = formatters.getYesterdayString();
      expect(yesterday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      
      const t = new Date(formatters.getTodayString());
      const y = new Date(yesterday);
      const diffTime = Math.abs(t.getTime() - y.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      expect(diffDays).toBe(1);
    });
  });
});
