import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogActivity from '../pages/LogActivity';
import * as useActivitiesHook from '../hooks/useActivities';
import * as useAuthHook from '../hooks/useAuth';

// Mock the hooks
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../hooks/useActivities', () => ({
  useActivities: vi.fn(),
}));

describe('ActivityForm (LogActivity)', () => {
  const mockAddActivity = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthHook.useAuth as any).mockReturnValue({
      user: { uid: 'test-user' },
    });
    (useActivitiesHook.useActivities as any).mockReturnValue({
      addActivity: mockAddActivity,
      isAddingActivity: false,
    });
  });

  it('renders transport form by default', () => {
    render(<LogActivity />);
    expect(screen.getByLabelText(/Vehicle Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Distance \(km\)/i)).toBeInTheDocument();
  });

  it('switches tabs correctly', async () => {
    render(<LogActivity />);
    const user = userEvent.setup();
    
    await user.click(screen.getByRole('tab', { name: /Food/i }));
    expect(screen.getByLabelText(/Diet \/ Meal Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Number of Meals/i)).toBeInTheDocument();
  });

  it('rejects empty required fields on submit', async () => {
    render(<LogActivity />);
    const user = userEvent.setup();
    
    // Clear the required distance field (it's empty by default)
    await user.click(screen.getByRole('button', { name: /Save Activity/i }));
    
    // HTML5 validation should prevent submission, addActivity shouldn't be called
    expect(mockAddActivity).not.toHaveBeenCalled();
  });

  it('submits form and calls calculator with correct args', async () => {
    render(<LogActivity />);
    const user = userEvent.setup();
    
    await user.type(screen.getByLabelText(/Distance \(km\)/i), '10');
    await user.click(screen.getByRole('button', { name: /Save Activity/i }));

    await waitFor(() => {
      expect(mockAddActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'transport',
          co2kg: 2.1, // 10km * 0.21 (carPetrol)
          details: expect.objectContaining({
            distanceKm: 10,
            vehicle: 'carPetrol'
          })
        })
      );
    });
  });
});
