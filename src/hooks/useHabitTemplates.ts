import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HabitTemplate, HabitCategory, Habit, CreateHabitInput } from "@/types/habits";
import { habitKeys, useCreateHabit } from "./useHabits";
import { getHabitColor, getHabitIcon } from "@/utils/habits";

// =====================================================
// QUERY KEYS
// =====================================================

export const habitTemplateKeys = {
  all: ['habit-templates'] as const,
  lists: () => [...habitTemplateKeys.all, 'list'] as const,
  list: (category?: HabitCategory) => [...habitTemplateKeys.lists(), category] as const,
  popular: () => [...habitTemplateKeys.all, 'popular'] as const,
};

// =====================================================
// QUERIES
// =====================================================

/**
 * Get habit templates, optionally filtered by category
 */
export function useHabitTemplates(category?: HabitCategory) {
  return useQuery({
    queryKey: habitTemplateKeys.list(category),
    queryFn: async () => {
      let query = supabase
        .from('habit_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HabitTemplate[];
    },
  });
}

/**
 * Get popular templates based on usage
 */
export function usePopularTemplates(limit: number = 10) {
  return useQuery({
    queryKey: habitTemplateKeys.popular(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habit_templates')
        .select('*')
        .order('usage_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as HabitTemplate[];
    },
  });
}

// =====================================================
// MUTATIONS
// =====================================================

/**
 * Create a habit from a template
 */
export function useCreateFromTemplate() {
  const createHabit = useCreateHabit();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      templateId, 
      workspaceId,
      customizations 
    }: { 
      templateId: string; 
      workspaceId: string;
      customizations?: Partial<CreateHabitInput>;
    }) => {
      // Get template
      const { data: template, error: templateError } = await supabase
        .from('habit_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      // Create habit from template
      const habitInput: CreateHabitInput = {
        workspace_id: workspaceId,
        title: template.title,
        description: template.description || undefined,
        category: template.category,
        type: 'build', // Default type
        frequency: template.frequency,
        difficulty: template.difficulty,
        time_of_day: template.time_of_day || undefined,
        duration_minutes: template.duration_minutes || undefined,
        color: template.color || getHabitColor(template.category),
        icon: template.icon || getHabitIcon(template.category),
        metadata: template.metadata as any,
        ...customizations,
      };

      const habit = await createHabit.mutateAsync(habitInput);

      // Increment usage count
      await supabase
        .from('habit_templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', templateId);

      return habit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitTemplateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
      toast.success("Habit created from template!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create habit from template");
      console.error('Create from template error:', error);
    },
  });
}

/**
 * Save a habit as a template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      habit, 
      templateName, 
      templateDescription 
    }: { 
      habit: Habit; 
      templateName?: string;
      templateDescription?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const templateData = {
        category: habit.category,
        title: templateName || habit.title,
        description: templateDescription || habit.description || undefined,
        frequency: habit.frequency,
        duration_minutes: habit.duration_minutes || undefined,
        difficulty: habit.difficulty,
        time_of_day: habit.time_of_day || undefined,
        icon: habit.icon || undefined,
        color: habit.color || undefined,
        is_system: false,
        created_by: user.id,
        metadata: habit.metadata as any,
      };

      const { data, error } = await supabase
        .from('habit_templates')
        .insert(templateData)
        .select()
        .single();

      if (error) throw error;
      return data as HabitTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitTemplateKeys.lists() });
      toast.success("Template created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create template");
      console.error('Create template error:', error);
    },
  });
}

/**
 * Rate a template
 */
export function useRateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      templateId, 
      rating 
    }: { 
      templateId: string; 
      rating: number;
    }) => {
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Get current rating
      const { data: template, error: fetchError } = await supabase
        .from('habit_templates')
        .select('rating, usage_count')
        .eq('id', templateId)
        .single();

      if (fetchError) throw fetchError;

      // Calculate new average rating
      const currentRating = template.rating || 0;
      const usageCount = template.usage_count;
      const newRating = ((currentRating * usageCount) + rating) / (usageCount + 1);

      const { error } = await supabase
        .from('habit_templates')
        .update({ rating: newRating })
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitTemplateKeys.lists() });
      toast.success("Thank you for rating!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to rate template");
      console.error('Rate template error:', error);
    },
  });
}
