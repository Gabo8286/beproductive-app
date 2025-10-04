import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type {
  ReflectionPrompt,
  PromptCategory,
  PromptFrequency,
} from "@/types/reflections";

const PROMPTS_QUERY_KEY = "reflection-prompts";

/**
 * Hook to fetch reflection prompts with filters
 */
export function useReflectionPrompts(
  category?: PromptCategory,
  frequency?: PromptFrequency,
) {
  return useQuery({
    queryKey: [PROMPTS_QUERY_KEY, category, frequency],
    queryFn: async () => {
      const user = await supabase.auth.getUser();

      let query = supabase
        .from("reflection_prompts")
        .select("*")
        .or(`is_system.eq.true,created_by.eq.${user.data.user?.id}`)
        .order("effectiveness_score", { ascending: false, nullsFirst: false });

      if (category) {
        query = query.eq("category", category);
      }

      if (frequency) {
        query = query.eq("frequency", frequency);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ReflectionPrompt[];
    },
  });
}

/**
 * Hook to fetch daily recommended prompts
 */
export function useDailyPrompts(reflectionDate: string) {
  return useQuery({
    queryKey: ["daily-prompts", reflectionDate],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc("generate_daily_prompts", {
        p_user_id: user.user.id,
        p_reflection_date: reflectionDate,
      });

      if (error) throw error;
      return data as { prompt_text: string; category: PromptCategory }[];
    },
    enabled: !!reflectionDate,
  });
}

/**
 * Hook to create a custom prompt
 */
export function useCreatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      prompt_text: string;
      category: PromptCategory;
      difficulty_level: number;
      frequency: PromptFrequency;
      metadata?: Record<string, any>;
    }) => {
      const user = await supabase.auth.getUser();

      if (input.difficulty_level < 1 || input.difficulty_level > 5) {
        throw new Error("Difficulty level must be between 1 and 5");
      }

      const { data, error } = await supabase
        .from("reflection_prompts")
        .insert({
          prompt_text: input.prompt_text,
          category: input.category,
          difficulty_level: input.difficulty_level,
          frequency: input.frequency,
          is_system: false,
          created_by: user.data.user?.id,
          metadata: input.metadata || {},
        })
        .select()
        .single();

      if (error) throw error;
      return data as ReflectionPrompt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMPTS_QUERY_KEY] });
      toast.success("Prompt created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create prompt: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a custom prompt
 */
export function useDeletePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promptId: string) => {
      const { error } = await supabase
        .from("reflection_prompts")
        .delete()
        .eq("id", promptId);

      if (error) throw error;
      return promptId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMPTS_QUERY_KEY] });
      toast.success("Prompt deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete prompt: ${error.message}`);
    },
  });
}

/**
 * Hook to track prompt effectiveness
 */
export function useTrackPromptEffectiveness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      promptId,
      wasHelpful,
    }: {
      promptId: string;
      wasHelpful: boolean;
    }) => {
      // Fetch current prompt
      const { data: prompt, error: fetchError } = await supabase
        .from("reflection_prompts")
        .select("effectiveness_score, usage_count")
        .eq("id", promptId)
        .single();

      if (fetchError) throw fetchError;

      // Calculate new effectiveness score (weighted average)
      const currentScore = prompt.effectiveness_score || 0.5;
      const usageCount = prompt.usage_count || 0;
      const newScore =
        (currentScore * usageCount + (wasHelpful ? 1 : 0)) / (usageCount + 1);

      const { error } = await supabase
        .from("reflection_prompts")
        .update({
          effectiveness_score: newScore,
          usage_count: usageCount + 1,
        })
        .eq("id", promptId);

      if (error) throw error;
      return { promptId, newScore };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMPTS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error("Failed to track prompt effectiveness:", error);
    },
  });
}

/**
 * Hook to get contextual prompts based on goals and habits
 */
export function useContextualPrompts(workspaceId: string) {
  return useQuery({
    queryKey: ["contextual-prompts", workspaceId],
    queryFn: async () => {
      // Fetch active goals and habits
      const [goalsResult, habitsResult] = await Promise.all([
        supabase
          .from("goals")
          .select("title, status")
          .eq("workspace_id", workspaceId)
          .in("status", ["active", "draft"])
          .limit(5),
        supabase
          .from("habits")
          .select("title, current_streak")
          .eq("workspace_id", workspaceId)
          .is("archived_at", null)
          .limit(5),
      ]);

      if (goalsResult.error) throw goalsResult.error;
      if (habitsResult.error) throw habitsResult.error;

      const contextualPrompts: {
        prompt_text: string;
        category: PromptCategory;
      }[] = [];

      // Generate goal-related prompts
      if (goalsResult.data.length > 0) {
        goalsResult.data.forEach((goal) => {
          contextualPrompts.push({
            prompt_text: `What progress did you make today on "${goal.title}"?`,
            category: "goals",
          });
        });
      }

      // Generate habit-related prompts
      if (habitsResult.data.length > 0) {
        habitsResult.data.forEach((habit) => {
          if (habit.current_streak > 0) {
            contextualPrompts.push({
              prompt_text: `You're on a ${habit.current_streak}-day streak with "${habit.title}". How are you feeling about it?`,
              category: "habits",
            });
          }
        });
      }

      return contextualPrompts;
    },
    enabled: !!workspaceId,
  });
}
