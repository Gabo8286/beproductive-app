import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGamification } from '@/hooks/useGamification';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: '1',
              user_id: 'user1',
              level: 1,
              total_xp: 0,
              weekly_xp: 0,
              monthly_xp: 0,
              achievement_count: 0,
              longest_streak_any_habit: 0,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            },
            error: null
          })),
          order: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: '1',
              user_id: 'user1',
              level: 1,
              total_xp: 0,
              weekly_xp: 0,
              monthly_xp: 0
            },
            error: null
          }))
        }))
      }))
    })),
    rpc: vi.fn(() => ({
      data: true,
      error: null
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(() => ({
          unsubscribe: vi.fn()
        }))
      }))
    }))
  }
}));


// Mock auth context
const mockUser = {
  id: 'user1',
  email: 'test@example.com'
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser
  })
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('useGamification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useGamification());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.profile).toBeNull();
  });

  it('should calculate level info correctly', () => {
    const { result } = renderHook(() => useGamification());

    const levelInfo = result.current.getLevelInfo(1500);
    expect(levelInfo.level).toBeGreaterThan(1);
    expect(levelInfo.current_xp).toBe(1500);
    expect(levelInfo.progress_percentage).toBeGreaterThanOrEqual(0);
    expect(levelInfo.progress_percentage).toBeLessThanOrEqual(100);
  });

  it('should award points successfully', async () => {
    const { result } = renderHook(() => useGamification());

    await waitFor(async () => {
      await expect(result.current.awardPoints('TASK_COMPLETED', 'task1')).resolves.not.toThrow();
    });

    const { supabase } = await import('@/integrations/supabase/client');
    expect(supabase.rpc).toHaveBeenCalledWith('award_points', {
      target_user_id: 'user1',
      point_amount: 10,
      action_type_param: 'TASK_COMPLETED',
      source_module_param: 'tasks',
      source_id_param: 'task1',
      description_param: 'Completed a task',
      multiplier_param: 1.0
    });
  });

  it('should handle errors when user is not authenticated', async () => {
    // Mock no user
    vi.mocked(require('@/contexts/AuthContext').useAuth).mockReturnValue({
      user: null
    });

    const { result } = renderHook(() => useGamification());

    await waitFor(async () => {
      await expect(result.current.awardPoints('TASK_COMPLETED')).rejects.toThrow('User not authenticated');
    });
  });

  it('should calculate level from XP correctly', () => {
    const { result } = renderHook(() => useGamification());

    expect(result.current.calculateLevel(0)).toBe(1);
    expect(result.current.calculateLevel(1000)).toBeGreaterThan(1);
    expect(result.current.calculateLevel(10000)).toBeGreaterThan(5);
  });
});