import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';
import * as useAuthHook from '../hooks/useAuth';
import * as useActivitiesHook from '../hooks/useActivities';
import * as useStreakHook from '../hooks/useStreak';
import * as useLeaderboardHook from '../hooks/useLeaderboard';
import * as useChallengesHook from '../hooks/useChallenges';
import * as useInsightsHook from '../hooks/useInsights';

// Mock ResponsiveContainer to actually render its children
vi.mock('recharts', async () => {
  const OriginalRechartsModule = await vi.importActual('recharts');
  return {
    ...OriginalRechartsModule,
    ResponsiveContainer: ({ children }: any) => (
      <div style={{ width: '800px', height: '400px' }}>{children}</div>
    ),
  };
});

vi.mock('../hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../hooks/useActivities', () => ({ useActivities: vi.fn() }));
vi.mock('../hooks/useStreak', () => ({ useStreak: vi.fn() }));
vi.mock('../hooks/useLeaderboard', () => ({ useLeaderboard: vi.fn() }));
vi.mock('../hooks/useChallenges', () => ({ useChallenges: vi.fn() }));
vi.mock('../hooks/useInsights', () => ({ useInsights: vi.fn() }));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthHook.useAuth as any).mockReturnValue({ user: { uid: '123', displayName: 'Test User' } });
    (useActivitiesHook.useActivities as any).mockReturnValue({
      weeklyStats: { totalKg: 50, byCategory: {}, dailyTotals: [] },
      activities30Days: [],
      isLoading: false
    });
    (useStreakHook.useStreak as any).mockReturnValue({ currentStreak: 5, updateStreak: vi.fn(), isLoading: false });
    (useLeaderboardHook.useLeaderboard as any).mockReturnValue({ userRank: 3, isLoading: false });
    (useChallengesHook.useChallenges as any).mockReturnValue({ challenge: null, isCompleting: false, isLoading: false });
    (useInsightsHook.useInsights as any).mockReturnValue({ insights: null });
  });

  it('renders user name', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Hello, Test/i)).toBeInTheDocument();
  });

  it('renders stat cards with correct values', () => {
    render(<Dashboard />);
    // total
    expect(screen.getByText('50 kg')).toBeInTheDocument();
    // streak
    expect(screen.getByText('5 Days')).toBeInTheDocument();
    // rank
    expect(screen.getByText('#3')).toBeInTheDocument();
  });

  it('shows comparison percentages', () => {
    render(<Dashboard />);
    // 50kg vs 80.7kg india avg is ~38% better
    expect(screen.getByText(/38% better than avg/i)).toBeInTheDocument();
  });

  it('shows loading skeletons when data fetches', () => {
    (useActivitiesHook.useActivities as any).mockReturnValue({
      weeklyStats: { totalKg: 0, byCategory: {}, dailyTotals: [] },
      isLoading: true
    });
    const { container } = render(<Dashboard />);
    // Look for skeleton class
    expect(container.querySelector('.skeleton')).toBeInTheDocument();
  });
});
