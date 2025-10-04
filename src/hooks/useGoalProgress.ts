import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProgressEntry {
  id: string;
  goal_id: string;
  previous_progress: number;
  new_progress: number;
  change_type: "manual" | "milestone" | "automatic" | "sub_goal";
  notes?: string;
  created_at: string;
  created_by: string;
}

export interface ProgressAnalytics {
  totalProgress: number;
  weeklyVelocity: number;
  monthlyVelocity: number;
  projectedCompletion: Date | null;
  milestoneCompletion: number;
  subGoalCompletion: number;
  averageDailyProgress: number;
  progressTrend: "increasing" | "decreasing" | "stable";
  timeToTarget: number | null;
  confidenceScore: number;
}

export interface ProgressSuggestion {
  type:
    | "milestone_due"
    | "behind_schedule"
    | "ahead_schedule"
    | "stagnant"
    | "target_adjustment";
  message: string;
  action?: string;
  priority: "low" | "medium" | "high";
  data?: any;
}

export function useGoalProgressHistory(goalId: string) {
  return useQuery({
    queryKey: ["goal-progress-history", goalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goal_progress_entries")
        .select("*")
        .eq("goal_id", goalId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile data separately for each entry
      const entriesWithProfiles = await Promise.all(
        (data || []).map(async (entry) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", entry.created_by)
            .single();

          return {
            ...entry,
            created_by_profile: profile || {
              full_name: "Unknown",
              avatar_url: "",
            },
          };
        }),
      );

      return entriesWithProfiles as (ProgressEntry & {
        created_by_profile: { full_name: string; avatar_url: string };
      })[];
    },
    enabled: !!goalId,
  });
}

export function useGoalProgressAnalytics(goalId: string) {
  return useQuery({
    queryKey: ["goal-progress-analytics", goalId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("calculate_goal_analytics", {
        goal_id: goalId,
      });

      if (error) throw error;

      // Parse the JSON response and convert date strings
      const analytics = data as any;
      return {
        ...analytics,
        projectedCompletion: analytics.projectedCompletion
          ? new Date(analytics.projectedCompletion)
          : null,
      } as ProgressAnalytics;
    },
    enabled: !!goalId,
    refetchInterval: 1000 * 60 * 30,
  });
}

export function useProgressSuggestions(goalId: string) {
  return useQuery({
    queryKey: ["progress-suggestions", goalId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_progress_suggestions", {
        goal_id: goalId,
      });

      if (error) throw error;

      // Parse JSON data if it's a string
      let suggestions = data;
      if (typeof data === "string") {
        suggestions = JSON.parse(data);
      }

      return (suggestions || []) as unknown as ProgressSuggestion[];
    },
    enabled: !!goalId,
    refetchInterval: 1000 * 60 * 60,
  });
}

export function useBulkProgressUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: { goalId: string; progress: number; notes?: string }[],
    ) => {
      const { data, error } = await supabase.rpc("bulk_update_goal_progress", {
        progress_updates: updates,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-progress-history"] });
      queryClient.invalidateQueries({ queryKey: ["goal-progress-analytics"] });
      toast.success("Progress updated for all selected goals!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update progress");
      console.error("Bulk progress update error:", error);
    },
  });
}

export function useAdvancedProgressUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      goalId,
      progress,
      notes,
      changeType = "manual",
    }: {
      goalId: string;
      progress: number;
      notes?: string;
      changeType?: ProgressEntry["change_type"];
    }) => {
      const { data, error } = await supabase.rpc(
        "update_goal_progress_with_history",
        {
          goal_id: goalId,
          new_progress: progress,
          change_type: changeType,
          notes: notes || null,
        },
      );

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goals", variables.goalId] });
      queryClient.invalidateQueries({
        queryKey: ["goal-progress-history", variables.goalId],
      });
      queryClient.invalidateQueries({
        queryKey: ["goal-progress-analytics", variables.goalId],
      });
      toast.success("Progress updated and logged!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update progress");
      console.error("Advanced progress update error:", error);
    },
  });
}

export function useCalculateAutoProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: string) => {
      const { data, error } = await supabase.rpc(
        "calculate_automatic_progress",
        {
          goal_id: goalId,
        },
      );

      if (error) throw error;
      return data;
    },
    onSuccess: (_, goalId) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goals", goalId] });
      queryClient.invalidateQueries({
        queryKey: ["goal-progress-analytics", goalId],
      });
      toast.success("Progress auto-calculated from milestones and sub-goals!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to calculate automatic progress");
      console.error("Auto progress calculation error:", error);
    },
  });
}
