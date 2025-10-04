import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type {
  ReflectionAnalytics,
  ReflectionTrend,
  ReflectionInsight,
  ReflectionStreakData,
  AnalyticsPeriod,
} from "@/types/reflections";
import { generateInsights } from "@/utils/reflections";

const ANALYTICS_QUERY_KEY = "reflection-analytics";
const STREAK_QUERY_KEY = "reflection-streak";

/**
 * Hook to fetch reflection analytics for a period
 */
export function useReflectionAnalytics(
  userId: string,
  periodType: AnalyticsPeriod,
  periodStart: string,
  periodEnd: string,
) {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, userId, periodType, periodStart, periodEnd],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reflection_analytics")
        .select("*")
        .eq("user_id", userId)
        .eq("period_type", periodType)
        .eq("period_start", periodStart)
        .eq("period_end", periodEnd)
        .maybeSingle();

      if (error) throw error;

      // If no analytics exist, calculate them
      if (!data) {
        await supabase.rpc("update_reflection_analytics", {
          p_user_id: userId,
          p_period_type: periodType,
        });

        // Fetch again
        const { data: newData, error: newError } = await supabase
          .from("reflection_analytics")
          .select("*")
          .eq("user_id", userId)
          .eq("period_type", periodType)
          .eq("period_start", periodStart)
          .eq("period_end", periodEnd)
          .maybeSingle();

        if (newError) throw newError;
        return newData as ReflectionAnalytics | null;
      }

      return data as ReflectionAnalytics;
    },
    enabled: !!userId,
  });
}

/**
 * Hook to fetch reflection trends over time
 */
export function useReflectionTrends(
  workspaceId: string,
  startDate: string,
  endDate: string,
) {
  return useQuery({
    queryKey: ["reflection-trends", workspaceId, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reflections")
        .select(
          "reflection_date, mood, energy_level, stress_level, satisfaction_level",
        )
        .eq("workspace_id", workspaceId)
        .gte("reflection_date", startDate)
        .lte("reflection_date", endDate)
        .order("reflection_date", { ascending: true });

      if (error) throw error;

      // Group by date and calculate averages
      const trendsByDate: Record<string, ReflectionTrend> = {};

      data.forEach((reflection) => {
        const date = reflection.reflection_date;
        if (!trendsByDate[date]) {
          trendsByDate[date] = {
            date,
            mood: 0,
            energy: 0,
            stress: 0,
            satisfaction: 0,
            reflection_count: 0,
          };
        }

        const trend = trendsByDate[date];
        trend.reflection_count++;

        if (reflection.mood) {
          const moodScores = {
            amazing: 6,
            great: 5,
            good: 4,
            neutral: 3,
            bad: 2,
            terrible: 1,
          };
          trend.mood =
            ((trend.mood || 0) * (trend.reflection_count - 1) +
              moodScores[reflection.mood]) /
            trend.reflection_count;
        }

        if (reflection.energy_level) {
          trend.energy =
            ((trend.energy || 0) * (trend.reflection_count - 1) +
              reflection.energy_level) /
            trend.reflection_count;
        }

        if (reflection.stress_level) {
          trend.stress =
            ((trend.stress || 0) * (trend.reflection_count - 1) +
              reflection.stress_level) /
            trend.reflection_count;
        }

        if (reflection.satisfaction_level) {
          trend.satisfaction =
            ((trend.satisfaction || 0) * (trend.reflection_count - 1) +
              reflection.satisfaction_level) /
            trend.reflection_count;
        }
      });

      return Object.values(trendsByDate);
    },
    enabled: !!workspaceId,
  });
}

/**
 * Hook to generate AI-powered insights from reflections
 */
export function useReflectionInsights(workspaceId: string, days: number = 30) {
  return useQuery({
    queryKey: ["reflection-insights", workspaceId, days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("reflections")
        .select("*")
        .eq("workspace_id", workspaceId)
        .gte("reflection_date", startDateStr)
        .order("reflection_date", { ascending: true });

      if (error) throw error;

      // Generate insights using utility function
      const reflections = data.map((r) => ({
        ...r,
        metadata: r.metadata as Record<string, any>,
      })) as any[];
      const insights = generateInsights(reflections);

      return insights;
    },
    enabled: !!workspaceId,
  });
}

/**
 * Hook to calculate reflection streak
 */
export function useReflectionStreak(workspaceId: string) {
  return useQuery({
    queryKey: [STREAK_QUERY_KEY, workspaceId],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc(
        "calculate_reflection_streak",
        {
          p_user_id: user.user.id,
        },
      );

      if (error) throw error;

      // Fetch recent reflections to calculate longest streak
      const { data: reflections, error: reflectionsError } = await supabase
        .from("reflections")
        .select("reflection_date")
        .eq("workspace_id", workspaceId)
        .order("reflection_date", { ascending: false });

      if (reflectionsError) throw reflectionsError;

      // Calculate longest streak from historical data
      let longestStreak = 0;
      let tempStreak = 0;
      let lastDate: Date | null = null;

      reflections.forEach((r) => {
        const currentDate = new Date(r.reflection_date);

        if (!lastDate) {
          tempStreak = 1;
        } else {
          const dayDiff = Math.floor(
            (lastDate.getTime() - currentDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );
          if (dayDiff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }

        lastDate = currentDate;
      });

      longestStreak = Math.max(longestStreak, tempStreak);

      // Calculate next milestone
      const milestones = [7, 14, 30, 60, 90, 180, 365];
      const nextMilestone =
        milestones.find((m) => m > (data || 0)) || (data || 0) + 100;

      const streakData: ReflectionStreakData = {
        current_streak: data || 0,
        longest_streak: longestStreak,
        last_reflection_date: reflections[0]?.reflection_date,
        next_milestone: nextMilestone,
      };

      return streakData;
    },
    enabled: !!workspaceId,
  });
}

/**
 * Hook to manually trigger analytics calculation
 */
export function useCalculateAnalytics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      periodType,
    }: {
      userId: string;
      periodType: AnalyticsPeriod;
    }) => {
      const { error } = await supabase.rpc("update_reflection_analytics", {
        p_user_id: userId,
        p_period_type: periodType,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEY] });
      toast.success("Analytics updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update analytics: ${error.message}`);
    },
  });
}
