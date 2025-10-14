import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  UserGamificationProfile,
  PointsLogEntry,
  UserAchievement,
  UserChallenge,
  GamificationStats,
  CreatePointsLogData,
  LevelInfo,
  POINTS_ACTIONS,
  getLevelInfo,
  calculateLevelFromXp,
  AchievementProgress,
  AchievementCategory,
  AchievementRarity,
  RequirementType,
} from "@/types/gamification";

export function useGamification() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserGamificationProfile | null>(null);
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [challenges, setChallenges] = useState<UserChallenge[]>([]);
  const [recentActivity, setRecentActivity] = useState<PointsLogEntry[]>([]);
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize or get user gamification profile
  const initializeProfile = useCallback(async () => {
    if (!user) return null;

    try {
      let { data: existingProfile, error: fetchError } = await supabase
        .from("user_gamification_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!existingProfile) {
        const { data: newProfile, error: insertError } = await supabase
          .from("user_gamification_profiles")
          .insert({
            user_id: user.id,
            level: 1,
            total_xp: 0,
            weekly_xp: 0,
            monthly_xp: 0,
            achievement_count: 0,
            longest_streak_any_habit: 0,
            last_level_up_at: new Date().toISOString(),
            weekly_reset_at: new Date(
              Date.now() - (Date.now() % (7 * 24 * 60 * 60 * 1000)),
            ).toISOString(),
            monthly_reset_at: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1,
            ).toISOString(),
            metadata: {},
          })
          .select()
          .single();

        if (insertError) throw insertError;
        existingProfile = newProfile;
      }

      setProfile(existingProfile);
      return existingProfile;
    } catch (error) {
      console.warn("Gamification profile initialization failed (non-critical):", error);
      // Don't show disruptive toast - gamification is optional
      // User can still use the app without gamification features
      return null;
    }
  }, [user, toast]);

  // Award points for an action
  const awardPoints = useCallback(
    async (actionType: string, sourceId?: string, customPoints?: number) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const pointsAction = POINTS_ACTIONS[actionType];
      if (!pointsAction && !customPoints) {
        throw new Error(`Unknown action type: ${actionType}`);
      }

      const basePoints = customPoints || pointsAction.base_points;
      const sourceModule = pointsAction?.source_module || "custom";
      const description = pointsAction?.description || "Custom action";

      try {
        // Call the database function to award points
        const { data, error } = await supabase.rpc("award_points", {
          target_user_id: user.id,
          point_amount: basePoints,
          action_type_param: actionType,
          source_module_param: sourceModule,
          source_id_param: sourceId,
          description_param: description,
          multiplier_param: 1.0,
        });

        if (error) throw error;

        // Refresh profile data
        await fetchUserData();

        // Check for achievements
        await checkAchievements();

        toast({
          title: "Points Earned!",
          description: `+${basePoints} XP for ${description.toLowerCase()}`,
          duration: 2000,
        });

        return data;
      } catch (error) {
        console.warn("Points award failed (non-critical):", error);
        // Don't show toast or throw error - points are optional
        // User action (task completion, etc.) should still succeed
        return null;
      }
    },
    [user, toast],
  );

  // Check and update achievements
  const checkAchievements = useCallback(async () => {
    if (!user) return;

    try {
      // Get all achievements with user progress
      const { data: achievementData, error } = await supabase
        .from("achievements")
        .select(
          `
          *,
          user_achievements!left (
            current_progress,
            unlocked_at,
            user_id
          )
        `,
        )
        .order("category")
        .order("sort_order");

      if (error) throw error;

      const processedAchievements: AchievementProgress[] = achievementData.map(
        (achievement) => {
          const userAchievement = achievement.user_achievements.find(
            (ua: any) => ua.user_id === user.id,
          );

          return {
            achievement: {
              ...achievement,
              category: achievement.category as AchievementCategory,
              rarity: achievement.rarity as AchievementRarity,
              requirement_type: achievement.requirement_type as RequirementType,
            },
            current_progress: userAchievement?.current_progress || 0,
            is_unlocked: !!userAchievement?.unlocked_at,
            unlocked_at: userAchievement?.unlocked_at,
            progress_percentage: Math.min(
              100,
              ((userAchievement?.current_progress || 0) /
                achievement.requirement_value) *
                100,
            ),
          };
        },
      );

      setAchievements(processedAchievements);
    } catch (error) {
      console.error("Error checking achievements:", error);
    }
  }, [user]);

  // Get gamification stats
  const fetchStats = useCallback(async () => {
    if (!user || !profile) return;

    try {
      // Get points earned this week and month
      const weekStart = new Date(profile.weekly_reset_at);
      const monthStart = new Date(profile.monthly_reset_at);

      const [weeklyPoints, monthlyPoints, totalPoints, challengeData] =
        await Promise.all([
          supabase
            .from("user_points_log")
            .select("points")
            .eq("user_id", user.id)
            .gte("earned_at", weekStart.toISOString()),

          supabase
            .from("user_points_log")
            .select("points")
            .eq("user_id", user.id)
            .gte("earned_at", monthStart.toISOString()),

          supabase
            .from("user_points_log")
            .select("points")
            .eq("user_id", user.id),

          supabase
            .from("user_challenges")
            .select("status")
            .eq("user_id", user.id),
        ]);

      const levelInfo = getLevelInfo(profile.total_xp);

      const stats: GamificationStats = {
        total_points_earned:
          totalPoints.data?.reduce((sum, entry) => sum + entry.points, 0) || 0,
        points_this_week:
          weeklyPoints.data?.reduce((sum, entry) => sum + entry.points, 0) || 0,
        points_this_month:
          monthlyPoints.data?.reduce((sum, entry) => sum + entry.points, 0) ||
          0,
        achievements_unlocked: achievements.filter((a) => a.is_unlocked).length,
        current_level: profile.level,
        xp_to_next_level: levelInfo.xp_to_next_level,
        longest_streak: profile.longest_streak_any_habit,
        active_challenges:
          challengeData.data?.filter((c) => c.status === "active").length || 0,
        completed_challenges:
          challengeData.data?.filter((c) => c.status === "completed").length ||
          0,
      };

      setStats(stats);
    } catch (error) {
      console.error("Error fetching gamification stats:", error);
    }
  }, [user, profile, achievements]);

  // Fetch recent activity
  const fetchRecentActivity = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_points_log")
        .select("*")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentActivity(data || []);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    }
  }, [user]);

  // Fetch all user data
  const fetchUserData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await Promise.all([
        initializeProfile(),
        checkAchievements(),
        fetchRecentActivity(),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [user, initializeProfile, checkAchievements, fetchRecentActivity]);

  // Update stats when profile or achievements change
  useEffect(() => {
    if (profile) {
      fetchStats();
    }
  }, [profile, achievements, fetchStats]);

  // Load data on mount and user change
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const profileSubscription = supabase
      .channel("gamification-profile")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_gamification_profiles",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE" && payload.new) {
            setProfile(payload.new as UserGamificationProfile);
          }
        },
      )
      .subscribe();

    const pointsSubscription = supabase
      .channel("points-log")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_points_log",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchRecentActivity();
        },
      )
      .subscribe();

    return () => {
      profileSubscription.unsubscribe();
      pointsSubscription.unsubscribe();
    };
  }, [user, fetchRecentActivity]);

  return {
    profile,
    achievements,
    challenges,
    recentActivity,
    stats,
    isLoading,
    awardPoints,
    checkAchievements,
    refresh: fetchUserData,
    getLevelInfo: (xp: number) => getLevelInfo(xp),
    calculateLevel: (xp: number) => calculateLevelFromXp(xp),
  };
}
