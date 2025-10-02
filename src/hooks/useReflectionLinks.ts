import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type {
  ReflectionGoalLink,
  ReflectionHabitLink,
  CreateReflectionGoalLinkInput,
  CreateReflectionHabitLinkInput,
} from "@/types/reflections";

const GOAL_LINKS_QUERY_KEY = "reflection-goal-links";
const HABIT_LINKS_QUERY_KEY = "reflection-habit-links";

/**
 * Hook to fetch goal links for a reflection
 */
export function useReflectionGoalLinks(reflectionId: string) {
  return useQuery({
    queryKey: [GOAL_LINKS_QUERY_KEY, reflectionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reflection_goal_links')
        .select(`
          *,
          goal:goals(*)
        `)
        .eq('reflection_id', reflectionId);

      if (error) throw error;
      return data as ReflectionGoalLink[];
    },
    enabled: !!reflectionId,
  });
}

/**
 * Hook to fetch habit links for a reflection
 */
export function useReflectionHabitLinks(reflectionId: string) {
  return useQuery({
    queryKey: [HABIT_LINKS_QUERY_KEY, reflectionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reflection_habit_links')
        .select(`
          *,
          habit:habits(*)
        `)
        .eq('reflection_id', reflectionId);

      if (error) throw error;
      return data.map(link => ({
        ...link,
        habit: link.habit ? {
          ...link.habit,
          custom_frequency: link.habit.custom_frequency as any,
          metadata: link.habit.metadata as any,
        } : undefined,
      })) as ReflectionHabitLink[];
    },
    enabled: !!reflectionId,
  });
}

/**
 * Hook to create a reflection-goal link
 */
export function useCreateReflectionGoalLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReflectionGoalLinkInput) => {
      const { data, error } = await supabase
        .from('reflection_goal_links')
        .insert({
          reflection_id: input.reflection_id,
          goal_id: input.goal_id,
          reflection_type: input.reflection_type,
          insights: input.insights,
          action_items: input.action_items || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data as ReflectionGoalLink;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [GOAL_LINKS_QUERY_KEY, data.reflection_id] });
      queryClient.invalidateQueries({ queryKey: ['reflections', data.reflection_id] });
      toast.success("Goal linked to reflection");
    },
    onError: (error: Error) => {
      toast.error(`Failed to link goal: ${error.message}`);
    },
  });
}

/**
 * Hook to create a reflection-habit link
 */
export function useCreateReflectionHabitLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReflectionHabitLinkInput) => {
      const { data, error } = await supabase
        .from('reflection_habit_links')
        .insert({
          reflection_id: input.reflection_id,
          habit_id: input.habit_id,
          reflection_type: input.reflection_type,
          observations: input.observations,
          adjustments: input.adjustments || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data as ReflectionHabitLink;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [HABIT_LINKS_QUERY_KEY, data.reflection_id] });
      queryClient.invalidateQueries({ queryKey: ['reflections', data.reflection_id] });
      toast.success("Habit linked to reflection");
    },
    onError: (error: Error) => {
      toast.error(`Failed to link habit: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a reflection-goal link
 */
export function useDeleteReflectionGoalLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase
        .from('reflection_goal_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;
      return linkId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOAL_LINKS_QUERY_KEY] });
      toast.success("Goal link removed");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove goal link: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a reflection-habit link
 */
export function useDeleteReflectionHabitLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase
        .from('reflection_habit_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;
      return linkId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HABIT_LINKS_QUERY_KEY] });
      toast.success("Habit link removed");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove habit link: ${error.message}`);
    },
  });
}

/**
 * Hook to get smart suggestions for linking goals/habits to a reflection
 */
export function useLinkSuggestions(reflectionId: string, content: string) {
  return useQuery({
    queryKey: ['link-suggestions', reflectionId, content],
    queryFn: async () => {
      // Get user's workspace
      const { data: reflection } = await supabase
        .from('reflections')
        .select('workspace_id')
        .eq('id', reflectionId)
        .single();

      if (!reflection) return { goals: [], habits: [] };

      // Fetch active goals and habits
      const [goalsResult, habitsResult] = await Promise.all([
        supabase
          .from('goals')
          .select('*')
          .eq('workspace_id', reflection.workspace_id)
          .in('status', ['active', 'draft']),
        supabase
          .from('habits')
          .select('*')
          .eq('workspace_id', reflection.workspace_id)
          .is('archived_at', null),
      ]);

      if (goalsResult.error) throw goalsResult.error;
      if (habitsResult.error) throw habitsResult.error;

      const lowerContent = content.toLowerCase();
      
      // Simple keyword matching for suggestions
      const suggestedGoals = goalsResult.data.filter(goal => {
        const goalKeywords = [
          goal.title.toLowerCase(),
          goal.description?.toLowerCase() || '',
          ...goal.tags.map(t => t.toLowerCase()),
        ];
        return goalKeywords.some(keyword => 
          lowerContent.includes(keyword) || keyword.includes(lowerContent.slice(0, 20))
        );
      });

      const suggestedHabits = habitsResult.data.filter(habit => {
        const habitKeywords = [
          habit.title.toLowerCase(),
          habit.description?.toLowerCase() || '',
          ...habit.tags.map(t => t.toLowerCase()),
        ];
        return habitKeywords.some(keyword => 
          lowerContent.includes(keyword) || keyword.includes(lowerContent.slice(0, 20))
        );
      });

      return {
        goals: suggestedGoals,
        habits: suggestedHabits,
      };
    },
    enabled: !!reflectionId && content.length > 10,
  });
}
