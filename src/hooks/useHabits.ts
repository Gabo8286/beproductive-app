import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Habit, HabitWithStats, CreateHabitInput, UpdateHabitInput, HabitFilters, HabitSortBy, SortOrder } from "@/types/habits";
import { validateHabitInput, isDueToday, calculateCompletionRate } from "@/utils/habits";
import { format, subDays } from "date-fns";

// =====================================================
// QUERY KEYS
// =====================================================

export const habitKeys = {
  all: ['habits'] as const,
  lists: () => [...habitKeys.all, 'list'] as const,
  list: (workspaceId: string, filters?: HabitFilters) => [...habitKeys.lists(), workspaceId, filters] as const,
  details: () => [...habitKeys.all, 'detail'] as const,
  detail: (id: string) => [...habitKeys.details(), id] as const,
};

// =====================================================
// QUERIES
// =====================================================

/**
 * Get all habits for a workspace with optional filters
 */
export function useHabits(
  workspaceId: string,
  filters?: HabitFilters,
  sortBy: HabitSortBy = 'position',
  sortOrder: SortOrder = 'asc'
) {
  return useQuery({
    queryKey: habitKeys.list(workspaceId, filters),
    queryFn: async () => {
      let query = supabase
        .from('habits')
        .select('*')
        .eq('workspace_id', workspaceId);

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.frequency) {
        query = query.eq('frequency', filters.frequency);
      }
      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters?.time_of_day) {
        query = query.eq('time_of_day', filters.time_of_day);
      }
      if (filters?.archived !== undefined) {
        if (filters.archived) {
          query = query.not('archived_at', 'is', null);
        } else {
          query = query.is('archived_at', null);
        }
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      // Apply sorting
      const ascending = sortOrder === 'asc';
      query = query.order(sortBy, { ascending });

      const { data, error } = await query;

      if (error) throw error;

      // Get today's entries for all habits
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: todayEntries } = await supabase
        .from('habit_entries')
        .select('*')
        .eq('date', today)
        .in('habit_id', data.map(h => h.id));

      // Get recent entries for completion rate (last 30 days)
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const { data: recentEntries } = await supabase
        .from('habit_entries')
        .select('habit_id, status, date')
        .gte('date', thirtyDaysAgo)
        .in('habit_id', data.map(h => h.id));

      // Map entries to habits
      const entryMap = new Map(todayEntries?.map(e => [e.habit_id, e]));
      const recentEntriesMap = new Map<string, any[]>();
      recentEntries?.forEach(entry => {
        const entries = recentEntriesMap.get(entry.habit_id) || [];
        entries.push(entry);
        recentEntriesMap.set(entry.habit_id, entries);
      });

      // Enhance habits with computed fields
      const habitsWithStats: HabitWithStats[] = data.map(habit => {
        const todayEntry = entryMap.get(habit.id);
        const entries = recentEntriesMap.get(habit.id) || [];
        const completionRate = entries.length > 0 
          ? calculateCompletionRate(entries, subDays(new Date(), 30), new Date())
          : 0;

        const habitData = habit as unknown as Habit;

        return {
          ...habitData,
          today_entry: todayEntry,
          is_due_today: isDueToday(habitData, todayEntry),
          completion_rate: completionRate,
        };
      });

      return habitsWithStats;
    },
    enabled: !!workspaceId,
  });
}

/**
 * Get a single habit with full details
 */
export function useHabit(habitId: string) {
  return useQuery({
    queryKey: habitKeys.detail(habitId),
    queryFn: async () => {
      const { data: habit, error } = await supabase
        .from('habits')
        .select('*')
        .eq('id', habitId)
        .single();

      if (error) throw error;

      // Get today's entry
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: todayEntry } = await supabase
        .from('habit_entries')
        .select('*')
        .eq('habit_id', habitId)
        .eq('date', today)
        .maybeSingle();

      // Get recent analytics
      const { data: analytics } = await supabase
        .from('habit_analytics')
        .select('*')
        .eq('habit_id', habitId)
        .order('period_start', { ascending: false })
        .limit(1)
        .maybeSingle();

      const habitData = habit as unknown as Habit;

      const habitWithStats: HabitWithStats = {
        ...habitData,
        today_entry: todayEntry || undefined,
        is_due_today: isDueToday(habitData, todayEntry || undefined),
        completion_rate: analytics?.completion_rate,
      };

      return habitWithStats;
    },
    enabled: !!habitId,
  });
}

// =====================================================
// MUTATIONS
// =====================================================

/**
 * Create a new habit
 */
export function useCreateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateHabitInput) => {
      // Validate input
      const validation = validateHabitInput(input);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const habitData = {
        ...input,
        created_by: user.id,
        tags: input.tags || [],
        metadata: input.metadata || {},
        start_date: input.start_date || format(new Date(), 'yyyy-MM-dd'),
        custom_frequency: input.custom_frequency as any,
      };

      const { data, error } = await supabase
        .from('habits')
        .insert(habitData)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Habit;
    },
    onSuccess: (habit) => {
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
      toast.success("Habit created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create habit");
      console.error('Create habit error:', error);
    },
  });
}

/**
 * Update an existing habit
 */
export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateHabitInput & { id: string }) => {
      // Validate if title is being updated
      if (input.title !== undefined) {
        const validation = validateHabitInput({ 
          title: input.title,
          category: input.category as any,
          frequency: input.frequency as any,
          custom_frequency: input.custom_frequency,
          target_streak: input.target_streak,
          duration_minutes: input.duration_minutes,
          start_date: input.start_date,
          end_date: input.end_date,
        });
        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }
      }

      const updateData = {
        ...input,
        custom_frequency: input.custom_frequency as any,
      };

      const { data, error } = await supabase
        .from('habits')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Habit;
    },
    onSuccess: (habit) => {
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: habitKeys.detail(habit.id) });
      toast.success("Habit updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update habit");
      console.error('Update habit error:', error);
    },
  });
}

/**
 * Delete a habit
 */
export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitId: string) => {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
      toast.success("Habit deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete habit");
      console.error('Delete habit error:', error);
    },
  });
}

/**
 * Archive a habit (soft delete)
 */
export function useArchiveHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, archive }: { habitId: string; archive: boolean }) => {
      const { data, error } = await supabase
        .from('habits')
        .update({ archived_at: archive ? new Date().toISOString() : null })
        .eq('id', habitId)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Habit;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: habitKeys.detail(variables.habitId) });
      toast.success(variables.archive ? "Habit archived" : "Habit restored");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to archive habit");
      console.error('Archive habit error:', error);
    },
  });
}

/**
 * Duplicate a habit
 */
export function useDuplicateHabit() {
  const createHabit = useCreateHabit();

  return useMutation({
    mutationFn: async (habitId: string) => {
      const { data: habit, error } = await supabase
        .from('habits')
        .select('*')
        .eq('id', habitId)
        .single();

      if (error) throw error;

      // Create copy with reset streaks
      const newHabit: CreateHabitInput = {
        workspace_id: habit.workspace_id,
        title: `${habit.title} (Copy)`,
        description: habit.description || undefined,
        category: habit.category,
        type: habit.type,
        frequency: habit.frequency,
        custom_frequency: habit.custom_frequency as any,
        target_streak: habit.target_streak || undefined,
        difficulty: habit.difficulty,
        time_of_day: habit.time_of_day || undefined,
        duration_minutes: habit.duration_minutes || undefined,
        reminder_time: habit.reminder_time || undefined,
        reminder_enabled: habit.reminder_enabled,
        tags: habit.tags,
        color: habit.color || undefined,
        icon: habit.icon || undefined,
        metadata: habit.metadata as any,
      };

      return createHabit.mutateAsync(newHabit);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to duplicate habit");
      console.error('Duplicate habit error:', error);
    },
  });
}

/**
 * Reorder habits (batch update positions)
 */
export function useReorderHabits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; position: number }[]) => {
      const promises = updates.map(({ id, position }) =>
        supabase
          .from('habits')
          .update({ position })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        throw new Error('Failed to reorder some habits');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reorder habits");
      console.error('Reorder habits error:', error);
    },
  });
}
