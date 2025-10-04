import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface HabitGoalLink {
  id: string;
  habit_id: string;
  goal_id: string;
  contribution_weight: number;
  created_at: string;
}

export interface HabitGoalLinkWithDetails extends HabitGoalLink {
  habits?: {
    id: string;
    title: string;
    category: string;
    current_streak: number;
  };
  goals?: {
    id: string;
    title: string;
    category: string;
    progress: number;
  };
}

export function useHabitGoalLinks(habitId?: string, goalId?: string) {
  return useQuery({
    queryKey: ["habit-goal-links", habitId, goalId],
    queryFn: async () => {
      let query = supabase.from("habit_goal_links").select(`
          *,
          habits:habit_id (id, title, category, current_streak),
          goals:goal_id (id, title, category, progress)
        `);

      if (habitId) {
        query = query.eq("habit_id", habitId);
      }
      if (goalId) {
        query = query.eq("goal_id", goalId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HabitGoalLinkWithDetails[];
    },
    enabled: !!(habitId || goalId),
  });
}

export function useCreateHabitGoalLink() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      habitId,
      goalId,
      contributionWeight = 1.0,
    }: {
      habitId: string;
      goalId: string;
      contributionWeight?: number;
    }) => {
      const { data, error } = await supabase
        .from("habit_goal_links")
        .insert({
          habit_id: habitId,
          goal_id: goalId,
          contribution_weight: contributionWeight,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-goal-links"] });
      toast({
        title: "Link created",
        description: "Habit successfully linked to goal",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateHabitGoalLink() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      linkId,
      contributionWeight,
    }: {
      linkId: string;
      contributionWeight: number;
    }) => {
      const { data, error } = await supabase
        .from("habit_goal_links")
        .update({ contribution_weight: contributionWeight })
        .eq("id", linkId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-goal-links"] });
      toast({
        title: "Link updated",
        description: "Contribution weight updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteHabitGoalLink() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase
        .from("habit_goal_links")
        .delete()
        .eq("id", linkId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-goal-links"] });
      toast({
        title: "Link removed",
        description: "Habit unlinked from goal",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useGoalProgressFromHabits(goalId: string) {
  return useQuery({
    queryKey: ["goal-habit-progress", goalId],
    queryFn: async () => {
      // Get all linked habits
      const { data: links, error: linksError } = await supabase
        .from("habit_goal_links")
        .select(
          `
          *,
          habits:habit_id (
            id,
            title,
            current_streak,
            longest_streak,
            frequency
          )
        `,
        )
        .eq("goal_id", goalId);

      if (linksError) throw linksError;
      if (!links || links.length === 0) return null;

      // Calculate contribution for each habit
      const habitContributions = await Promise.all(
        links.map(async (link) => {
          // Get recent entries (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const { data: entries, error: entriesError } = await supabase
            .from("habit_entries")
            .select("*")
            .eq("habit_id", link.habit_id)
            .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
            .eq("status", "completed");

          if (entriesError) throw entriesError;

          const completionRate = entries ? (entries.length / 30) * 100 : 0;
          const weightedContribution =
            completionRate * link.contribution_weight;

          return {
            habitId: link.habit_id,
            habitTitle: link.habits?.title || "",
            completionRate,
            contributionWeight: link.contribution_weight,
            weightedContribution,
            currentStreak: link.habits?.current_streak || 0,
          };
        }),
      );

      // Calculate total weighted progress
      const totalWeight = links.reduce(
        (sum, link) => sum + link.contribution_weight,
        0,
      );
      const totalProgress =
        habitContributions.reduce(
          (sum, contrib) => sum + contrib.weightedContribution,
          0,
        ) / (totalWeight || 1);

      return {
        totalProgress: Math.min(totalProgress, 100),
        habitContributions,
        totalWeight,
      };
    },
    enabled: !!goalId,
  });
}
