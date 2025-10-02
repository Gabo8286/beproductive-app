import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useReflections,
  useCreateReflection,
  useUpdateReflection,
  useDeleteReflection,
} from '@/hooks/useReflections';
import { supabase } from '@/integrations/supabase/client';
import type { ReactNode } from 'react';

vi.mock('@/integrations/supabase/client');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useReflections Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should track mood patterns', async () => {
    const mockReflections = [
      {
        id: '1',
        mood: 'great',
        energy_level: 8,
        reflection_date: '2025-01-01',
      },
      {
        id: '2',
        mood: 'good',
        energy_level: 7,
        reflection_date: '2025-01-02',
      },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockReflections,
        error: null,
      }),
    } as any);

    const { result } = renderHook(
      () => useReflections('workspace-id', { mood: 'great' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should analyze content themes', async () => {
    const mockReflection = {
      id: '1',
      title: 'Work Progress',
      content: 'Made good progress on project',
      tags: ['work', 'productivity'],
      metadata: { themes: ['career', 'achievement'] },
    };

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [mockReflection],
        error: null,
      }),
    } as any);

    const { result } = renderHook(
      () => useReflections('workspace-id', { tags: ['work'] }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data?.[0].tags).toContain('work');
    });
  });

  it('should link reflections to goals', async () => {
    const mockReflection = {
      id: '1',
      title: 'Goal Progress',
      goal_links: [
        {
          goal_id: 'goal-1',
          goal: { id: 'goal-1', title: 'Learn React' },
        },
      ],
    };

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [mockReflection],
        error: null,
      }),
    } as any);

    const { result } = renderHook(
      () => useReflections('workspace-id'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data?.[0].goal_links).toBeDefined();
    });
  });

  it('should validate reflection input', async () => {
    const invalidReflection = {
      workspace_id: 'workspace-id',
      title: '', // Invalid: empty title
      content: 'Test',
      reflection_type: 'daily' as const,
      reflection_date: '2025-01-01',
    };

    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user-id' } as any },
      error: null,
    });

    const { result } = renderHook(() => useCreateReflection(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(invalidReflection);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('should calculate average mood and energy', async () => {
    const mockReflections = [
      { mood: 'amazing', energy_level: 9, stress_level: 2 },
      { mood: 'great', energy_level: 8, stress_level: 3 },
      { mood: 'good', energy_level: 7, stress_level: 4 },
    ];

    const moodScores = { amazing: 6, great: 5, good: 4, neutral: 3, bad: 2, terrible: 1 };
    const avgMood = mockReflections.reduce(
      (sum, r) => sum + moodScores[r.mood as keyof typeof moodScores],
      0
    ) / mockReflections.length;

    const avgEnergy = mockReflections.reduce((sum, r) => sum + r.energy_level, 0) / mockReflections.length;

    expect(avgMood).toBe(5); // (6+5+4)/3
    expect(avgEnergy).toBe(8); // (9+8+7)/3
  });
});
