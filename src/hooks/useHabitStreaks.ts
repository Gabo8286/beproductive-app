import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HabitStreak, StreakLeaderboardEntry } from "@/types/habits";
import { habitKeys } from "./useHabits";

// =====================================================
// QUERY KEYS
// =====================================================

export const habitStreakKeys = {
  all: ['habit-streaks'] as const,
  lists: () => [...habitStreakKeys.all, 'list'] as const,
  list: (habitId: string) => [...habitStreakKeys.lists(), habitId] as const,
  current: (habitId: string) => [...habitStreakKeys.all, 'current', habitId] as const,
  leaderboard: (workspaceId: string) => [...habitStreakKeys.all, 'leaderboard', workspaceId] as const,
};

// =====================================================
// QUERIES
// =====================================================

/**
 * Get streak history for a habit
 */
export function useHabitStreaks(habitId: string) {
  return useQuery({
    queryKey: habitStreakKeys.list(habitId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habit_streaks')
        .select('*')
        .eq('habit_id', habitId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data as HabitStreak[];
    },
    enabled: !!habitId,
  });
}

/**
 * Get current active streak for a habit
 */
export function useCurrentStreak(habitId: string) {
  return useQuery({
    queryKey: habitStreakKeys.current(habitId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habits')
        .select('current_streak, longest_streak')
        .eq('id', habitId)
        .single();

      if (error) throw error;
      return {
        current: data.current_streak,
        longest: data.longest_streak,
      };
    },
    enabled: !!habitId,
  });
}

/**
 * Get streak leaderboard for workspace
 */
export function useStreakLeaderboard(workspaceId: string, limit: number = 10) {
  return useQuery({
    queryKey: habitStreakKeys.leaderboard(workspaceId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('workspace_id', workspaceId)
        .is('archived_at', null)
        .order('current_streak', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Calculate completion rates
      const leaderboard: StreakLeaderboardEntry[] = await Promise.all(
        data.map(async (habit, index) => {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const { data: entries } = await supabase
            .from('habit_entries')
            .select('status')
            .eq('habit_id', habit.id)
            .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

          const completed = entries?.filter(e => e.status === 'completed').length || 0;
          const total = entries?.length || 1;
          const completionRate = Math.round((completed / total) * 100);

          return {
            habit: habit as any,
            current_streak: habit.current_streak,
            longest_streak: habit.longest_streak,
            completion_rate: completionRate,
            rank: index + 1,
          };
        })
      );

      return leaderboard;
    },
    enabled: !!workspaceId,
  });
}

// =====================================================
// MUTATIONS
// =====================================================

/**
 * Manually break a streak with a reason
 */
export function useBreakStreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, reason }: { habitId: string; reason?: string }) => {
      // Get current streak info
      const { data: habit, error: habitError } = await supabase
        .from('habits')
        .select('current_streak')
        .eq('id', habitId)
        .single();

      if (habitError) throw habitError;

      if (habit.current_streak > 0) {
        // Create streak record
        const { error: streakError } = await supabase
          .from('habit_streaks')
          .insert({
            habit_id: habitId,
            start_date: new Date(Date.now() - habit.current_streak * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            length: habit.current_streak,
            broken_at: new Date().toISOString(),
            reason: reason || 'Manually reset',
          });

        if (streakError) throw streakError;
      }

      // Reset current streak
      const { error: updateError } = await supabase
        .from('habits')
        .update({ current_streak: 0 })
        .eq('id', habitId);

      if (updateError) throw updateError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: habitStreakKeys.list(variables.habitId) });
      queryClient.invalidateQueries({ queryKey: habitStreakKeys.current(variables.habitId) });
      queryClient.invalidateQueries({ queryKey: habitKeys.detail(variables.habitId) });
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
      toast.success("Streak reset successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to break streak");
      console.error('Break streak error:', error);
    },
  });
}

/**
 * Restore streak (admin function to fix data)
 */
export function useRestoreStreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      habitId, 
      streakLength 
    }: { 
      habitId: string; 
      streakLength: number;
    }) => {
      const { data: habit, error: habitError } = await supabase
        .from('habits')
        .select('longest_streak')
        .eq('id', habitId)
        .single();

      if (habitError) throw habitError;

      const longestStreak = Math.max(habit.longest_streak, streakLength);

      const { error } = await supabase
        .from('habits')
        .update({ 
          current_streak: streakLength,
          longest_streak: longestStreak,
        })
        .eq('id', habitId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: habitStreakKeys.current(variables.habitId) });
      queryClient.invalidateQueries({ queryKey: habitKeys.detail(variables.habitId) });
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
      toast.success("Streak restored successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to restore streak");
      console.error('Restore streak error:', error);
    },
  });
}
