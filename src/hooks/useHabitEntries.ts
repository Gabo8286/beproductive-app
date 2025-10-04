import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  HabitEntry,
  CreateHabitEntryInput,
  UpdateHabitEntryInput,
} from "@/types/habits";
import { validateEntryInput } from "@/utils/habits";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { habitKeys } from "./useHabits";
import { useGamification } from "./useGamification";

// =====================================================
// QUERY KEYS
// =====================================================

export const habitEntryKeys = {
  all: ["habit-entries"] as const,
  lists: () => [...habitEntryKeys.all, "list"] as const,
  list: (habitId: string, startDate?: string, endDate?: string) =>
    [...habitEntryKeys.lists(), habitId, startDate, endDate] as const,
  today: () => [...habitEntryKeys.all, "today"] as const,
  calendar: (habitId: string, month: Date) =>
    [
      ...habitEntryKeys.all,
      "calendar",
      habitId,
      format(month, "yyyy-MM"),
    ] as const,
};

// =====================================================
// QUERIES
// =====================================================

/**
 * Get entries for a habit within a date range
 */
export function useHabitEntries(
  habitId: string,
  startDate?: string,
  endDate?: string,
) {
  return useQuery({
    queryKey: habitEntryKeys.list(habitId, startDate, endDate),
    queryFn: async () => {
      let query = supabase
        .from("habit_entries")
        .select("*")
        .eq("habit_id", habitId)
        .order("date", { ascending: false });

      if (startDate) {
        query = query.gte("date", startDate);
      }
      if (endDate) {
        query = query.lte("date", endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HabitEntry[];
    },
    enabled: !!habitId,
  });
}

/**
 * Get today's entries for all habits in workspace
 */
export function useTodayEntries(workspaceId: string) {
  return useQuery({
    queryKey: habitEntryKeys.today(),
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("habit_entries")
        .select(
          `
          *,
          habit:habits!inner(*)
        `,
        )
        .eq("date", today)
        .eq("habit.workspace_id", workspaceId);

      if (error) throw error;
      return data as (HabitEntry & { habit: any })[];
    },
    enabled: !!workspaceId,
  });
}

/**
 * Get calendar data for a habit for a specific month
 */
export function useHabitCalendar(habitId: string, month: Date) {
  const start = format(startOfMonth(month), "yyyy-MM-dd");
  const end = format(endOfMonth(month), "yyyy-MM-dd");

  return useHabitEntries(habitId, start, end);
}

// =====================================================
// MUTATIONS
// =====================================================

/**
 * Create a habit entry (mark habit complete/skipped/missed)
 */
export function useCreateEntry() {
  const queryClient = useQueryClient();
  const { refresh: refreshGamification } = useGamification();

  return useMutation({
    mutationFn: async (input: CreateHabitEntryInput) => {
      // Validate input
      const validation = validateEntryInput(input);
      if (!validation.valid) {
        throw new Error(validation.errors.join(", "));
      }

      // Check if entry already exists for this date
      const { data: existing } = await supabase
        .from("habit_entries")
        .select("id")
        .eq("habit_id", input.habit_id)
        .eq("date", input.date)
        .maybeSingle();

      if (existing) {
        throw new Error("Entry already exists for this date");
      }

      const entryData = {
        ...input,
        completed_at:
          input.status === "completed" ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from("habit_entries")
        .insert(entryData)
        .select()
        .single();

      if (error) throw error;
      return data as HabitEntry;
    },
    onSuccess: async (entry) => {
      queryClient.invalidateQueries({ queryKey: habitEntryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: habitEntryKeys.today() });
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: habitKeys.detail(entry.habit_id),
      });

      // Refresh gamification data for XP and achievement updates
      if (entry.status === "completed") {
        try {
          await refreshGamification();
        } catch (error) {
          console.error("Failed to refresh gamification data:", error);
        }
      }

      const message =
        entry.status === "completed"
          ? "Habit completed! 🎉"
          : entry.status === "skipped"
            ? "Entry marked as skipped"
            : "Entry recorded";
      toast.success(message);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create entry");
      console.error("Create entry error:", error);
    },
  });
}

/**
 * Update an existing habit entry
 */
export function useUpdateEntry() {
  const queryClient = useQueryClient();
  const { refresh: refreshGamification } = useGamification();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateHabitEntryInput & { id: string }) => {
      const updateData: any = { ...input };

      if (input.status === "completed" && !updateData.completed_at) {
        updateData.completed_at = new Date().toISOString();
      } else if (input.status && input.status !== "completed") {
        updateData.completed_at = null;
      }

      const { data, error } = await supabase
        .from("habit_entries")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as HabitEntry;
    },
    onSuccess: async (entry) => {
      queryClient.invalidateQueries({ queryKey: habitEntryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: habitEntryKeys.today() });
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: habitKeys.detail(entry.habit_id),
      });

      // Refresh gamification data if habit was completed
      if (entry.status === "completed") {
        try {
          await refreshGamification();
        } catch (error) {
          console.error("Failed to refresh gamification data:", error);
        }
      }

      toast.success("Entry updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update entry");
      console.error("Update entry error:", error);
    },
  });
}

/**
 * Delete a habit entry
 */
export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      // Get entry first to access habit_id for cache invalidation
      const { data: entry } = await supabase
        .from("habit_entries")
        .select("habit_id")
        .eq("id", entryId)
        .single();

      const { error } = await supabase
        .from("habit_entries")
        .delete()
        .eq("id", entryId);

      if (error) throw error;
      return entry?.habit_id;
    },
    onSuccess: (habitId) => {
      queryClient.invalidateQueries({ queryKey: habitEntryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: habitEntryKeys.today() });
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
      if (habitId) {
        queryClient.invalidateQueries({ queryKey: habitKeys.detail(habitId) });
      }
      toast.success("Entry deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete entry");
      console.error("Delete entry error:", error);
    },
  });
}

/**
 * Bulk create entries for multiple habits on the same date
 */
export function useBulkCreateEntries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inputs: CreateHabitEntryInput[]) => {
      // Validate all inputs
      for (const input of inputs) {
        const validation = validateEntryInput(input);
        if (!validation.valid) {
          throw new Error(
            `Invalid input for habit ${input.habit_id}: ${validation.errors.join(", ")}`,
          );
        }
      }

      const entries = inputs.map((input) => ({
        ...input,
        completed_at:
          input.status === "completed" ? new Date().toISOString() : null,
      }));

      const { data, error } = await supabase
        .from("habit_entries")
        .insert(entries)
        .select();

      if (error) throw error;
      return data as HabitEntry[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitEntryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: habitEntryKeys.today() });
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
      toast.success("Entries created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create entries");
      console.error("Bulk create entries error:", error);
    },
  });
}
