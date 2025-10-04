import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  HabitAnalytics,
  PeriodType,
  HabitTrend,
  HabitHeatmapData,
  HabitInsight,
} from "@/types/habits";
import {
  format,
  subDays,
  startOfWeek,
  startOfMonth,
  startOfYear,
  eachDayOfInterval,
} from "date-fns";

// =====================================================
// QUERY KEYS
// =====================================================

export const habitAnalyticsKeys = {
  all: ["habit-analytics"] as const,
  lists: () => [...habitAnalyticsKeys.all, "list"] as const,
  list: (habitId: string, periodType: PeriodType) =>
    [...habitAnalyticsKeys.lists(), habitId, periodType] as const,
  trends: (habitId: string) =>
    [...habitAnalyticsKeys.all, "trends", habitId] as const,
  heatmap: (habitId: string, year: number) =>
    [...habitAnalyticsKeys.all, "heatmap", habitId, year] as const,
  insights: (workspaceId: string) =>
    [...habitAnalyticsKeys.all, "insights", workspaceId] as const,
};

// =====================================================
// QUERIES
// =====================================================

/**
 * Get analytics for a habit for a specific period
 */
export function useHabitAnalytics(habitId: string, periodType: PeriodType) {
  return useQuery({
    queryKey: habitAnalyticsKeys.list(habitId, periodType),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_analytics")
        .select("*")
        .eq("habit_id", habitId)
        .eq("period_type", periodType)
        .order("period_start", { ascending: false })
        .limit(1);

      if (error) throw error;
      return data[0] as HabitAnalytics | undefined;
    },
    enabled: !!habitId,
  });
}

/**
 * Get trend data for a habit (last 30 days)
 */
export function useHabitTrends(habitId: string, days: number = 30) {
  return useQuery({
    queryKey: habitAnalyticsKeys.trends(habitId),
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(endDate, days);

      // Get entries for the period
      const { data: entries, error } = await supabase
        .from("habit_entries")
        .select("date, status, mood, energy_level")
        .eq("habit_id", habitId)
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(endDate, "yyyy-MM-dd"))
        .order("date", { ascending: true });

      if (error) throw error;

      // Get habit for streak info
      const { data: habit } = await supabase
        .from("habits")
        .select("current_streak")
        .eq("id", habitId)
        .single();

      // Create map of entries by date
      const entryMap = new Map(entries?.map((e) => [e.date, e]));

      // Generate trend data for each day
      const allDays = eachDayOfInterval({ start: startDate, end: endDate });
      const trends: HabitTrend[] = allDays.map((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const entry = entryMap.get(dateStr);

        return {
          date: dateStr,
          completions: entry?.status === "completed" ? 1 : 0,
          completion_rate: entry?.status === "completed" ? 100 : 0,
          streak: habit?.current_streak || 0,
          mood: entry?.mood ? moodToNumber(entry.mood) : undefined,
          energy: entry?.energy_level || undefined,
        };
      });

      return trends;
    },
    enabled: !!habitId,
  });
}

/**
 * Get heatmap data for a habit for a year
 */
export function useCompletionHeatmap(habitId: string, year: number) {
  return useQuery({
    queryKey: habitAnalyticsKeys.heatmap(habitId, year),
    queryFn: async () => {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      const { data: entries, error } = await supabase
        .from("habit_entries")
        .select("date, status")
        .eq("habit_id", habitId)
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(endDate, "yyyy-MM-dd"));

      if (error) throw error;

      // Create map of entries
      const entryMap = new Map(entries?.map((e) => [e.date, e]));

      // Generate heatmap data for each day
      const allDays = eachDayOfInterval({ start: startDate, end: endDate });
      const heatmap: HabitHeatmapData[] = allDays.map((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const entry = entryMap.get(dateStr);

        let level: 0 | 1 | 2 | 3 | 4 = 0;
        let count = 0;

        if (entry) {
          if (entry.status === "completed") {
            level = 4;
            count = 1;
          } else if (entry.status === "partial") {
            level = 2;
          } else if (entry.status === "skipped") {
            level = 1;
          }
        }

        return {
          date: dateStr,
          count,
          level,
        };
      });

      return heatmap;
    },
    enabled: !!habitId,
  });
}

/**
 * Get AI-powered insights for habits
 */
export function useHabitInsights(workspaceId: string) {
  return useQuery({
    queryKey: habitAnalyticsKeys.insights(workspaceId),
    queryFn: async () => {
      const insights: HabitInsight[] = [];

      // Get all active habits
      const { data: habits, error: habitsError } = await supabase
        .from("habits")
        .select("*")
        .eq("workspace_id", workspaceId)
        .is("archived_at", null);

      if (habitsError) throw habitsError;

      for (const habit of habits || []) {
        // Check for streak milestones
        if (habit.current_streak >= 30 && habit.current_streak % 30 === 0) {
          insights.push({
            type: "streak_milestone",
            title: `🔥 ${habit.current_streak}-Day Streak!`,
            description: `Amazing! You've maintained ${habit.title} for ${habit.current_streak} days straight.`,
            action: "Keep going!",
            priority: "high",
            habit_id: habit.id,
          });
        }

        // Check for consistency drops
        const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");
        const { data: recentEntries } = await supabase
          .from("habit_entries")
          .select("status")
          .eq("habit_id", habit.id)
          .gte("date", thirtyDaysAgo);

        const completed =
          recentEntries?.filter((e) => e.status === "completed").length || 0;
        const completionRate = recentEntries
          ? (completed / recentEntries.length) * 100
          : 0;

        if (completionRate < 50 && recentEntries && recentEntries.length > 7) {
          insights.push({
            type: "consistency_drop",
            title: "Consistency Drop Detected",
            description: `Your completion rate for ${habit.title} has dropped to ${Math.round(completionRate)}%. Consider adjusting difficulty or frequency.`,
            action: "Review habit settings",
            priority: "medium",
            habit_id: habit.id,
          });
        }
      }

      return insights;
    },
    enabled: !!workspaceId,
  });
}

/**
 * Analyze best time for a habit based on historical data
 */
export function useBestTimeAnalysis(habitId: string) {
  return useQuery({
    queryKey: [...habitAnalyticsKeys.all, "best-time", habitId],
    queryFn: async () => {
      // Get all completed entries with timestamps
      const { data: entries, error } = await supabase
        .from("habit_entries")
        .select("completed_at, mood, energy_level")
        .eq("habit_id", habitId)
        .eq("status", "completed")
        .not("completed_at", "is", null);

      if (error) throw error;

      if (!entries || entries.length < 5) {
        return null;
      }

      // Group by hour of day
      const hourStats = new Map<
        number,
        { count: number; avgMood: number; avgEnergy: number }
      >();

      entries.forEach((entry) => {
        if (entry.completed_at) {
          const hour = new Date(entry.completed_at).getHours();
          const stats = hourStats.get(hour) || {
            count: 0,
            avgMood: 0,
            avgEnergy: 0,
          };

          stats.count++;
          if (entry.mood) stats.avgMood += moodToNumber(entry.mood);
          if (entry.energy_level) stats.avgEnergy += entry.energy_level;

          hourStats.set(hour, stats);
        }
      });

      // Find best hour
      let bestHour = 0;
      let bestScore = 0;

      hourStats.forEach((stats, hour) => {
        const avgMood = stats.avgMood / stats.count;
        const avgEnergy = stats.avgEnergy / stats.count;
        const score = stats.count * (avgMood + avgEnergy);

        if (score > bestScore) {
          bestScore = score;
          bestHour = hour;
        }
      });

      return {
        bestHour,
        bestTime: formatHour(bestHour),
        confidence:
          Math.min((hourStats.get(bestHour)?.count || 0) / entries.length, 1) *
          100,
      };
    },
    enabled: !!habitId,
  });
}

// =====================================================
// MUTATIONS
// =====================================================

/**
 * Calculate analytics for a habit
 */
export function useCalculateAnalytics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      habitId,
      periodType,
      startDate,
      endDate,
    }: {
      habitId: string;
      periodType: PeriodType;
      startDate: string;
      endDate: string;
    }) => {
      const { error } = await supabase.rpc("calculate_habit_analytics", {
        p_habit_id: habitId,
        p_period_type: periodType,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: habitAnalyticsKeys.list(
          variables.habitId,
          variables.periodType,
        ),
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to calculate analytics");
      console.error("Calculate analytics error:", error);
    },
  });
}

// =====================================================
// HELPERS
// =====================================================

function moodToNumber(mood: string): number {
  const moodMap: Record<string, number> = {
    amazing: 5,
    good: 4,
    neutral: 3,
    bad: 2,
    terrible: 1,
  };
  return moodMap[mood] || 3;
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
}
