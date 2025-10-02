import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type {
  Reflection,
  ReflectionWithRelations,
  CreateReflectionInput,
  UpdateReflectionInput,
  ReflectionFilters,
  ReflectionSortBy,
  SortOrder,
} from "@/types/reflections";
import { validateReflectionInput } from "@/utils/reflections";

const REFLECTIONS_QUERY_KEY = "reflections";

/**
 * Hook to fetch reflections with filters and sorting
 */
export function useReflections(
  workspaceId: string,
  filters?: ReflectionFilters,
  sortBy: ReflectionSortBy = 'reflection_date',
  sortOrder: SortOrder = 'desc'
) {
  return useQuery({
    queryKey: [REFLECTIONS_QUERY_KEY, workspaceId, filters, sortBy, sortOrder],
    queryFn: async () => {
      let query = supabase
        .from('reflections')
        .select(`
          *,
          goal_links:reflection_goal_links(
            *,
            goal:goals(*)
          ),
          habit_links:reflection_habit_links(
            *,
            habit:habits(*)
          )
        `)
        .eq('workspace_id', workspaceId);

      // Apply filters
      if (filters?.reflection_type) {
        query = query.eq('reflection_type', filters.reflection_type);
      }
      if (filters?.mood) {
        query = query.eq('mood', filters.mood);
      }
      if (filters?.date_from) {
        query = query.gte('reflection_date', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('reflection_date', filters.date_to);
      }
      if (filters?.is_private !== undefined) {
        query = query.eq('is_private', filters.is_private);
      }
      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;
      return data.map(r => ({
        ...r,
        metadata: r.metadata as Record<string, any>,
        habit_links: r.habit_links?.map((link: any) => ({
          ...link,
          habit: link.habit ? {
            ...link.habit,
            custom_frequency: link.habit.custom_frequency as any,
            metadata: link.habit.metadata as any,
          } : undefined,
        })),
      })) as ReflectionWithRelations[];
    },
    enabled: !!workspaceId,
  });
}

/**
 * Hook to fetch a single reflection with all relations
 */
export function useReflection(reflectionId: string) {
  return useQuery({
    queryKey: [REFLECTIONS_QUERY_KEY, reflectionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reflections')
        .select(`
          *,
          goal_links:reflection_goal_links(
            *,
            goal:goals(*)
          ),
          habit_links:reflection_habit_links(
            *,
            habit:habits(*)
          )
        `)
        .eq('id', reflectionId)
        .single();

      if (error) throw error;
      return {
        ...data,
        metadata: data.metadata as Record<string, any>,
        habit_links: data.habit_links?.map((link: any) => ({
          ...link,
          habit: link.habit ? {
            ...link.habit,
            custom_frequency: link.habit.custom_frequency as any,
            metadata: link.habit.metadata as any,
          } : undefined,
        })),
      } as ReflectionWithRelations;
    },
    enabled: !!reflectionId,
  });
}

/**
 * Hook to fetch reflections by date range
 */
export function useReflectionsByDateRange(
  workspaceId: string,
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: [REFLECTIONS_QUERY_KEY, 'date-range', workspaceId, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .eq('workspace_id', workspaceId)
        .gte('reflection_date', startDate)
        .lte('reflection_date', endDate)
        .order('reflection_date', { ascending: true });

      if (error) throw error;

      // Calculate summary statistics
      const reflections = data.map(r => ({
        ...r,
        metadata: r.metadata as Record<string, any>,
      })) as Reflection[];
      const summary = {
        total: reflections.length,
        avgMood: reflections.filter(r => r.mood).length > 0
          ? reflections.reduce((sum, r) => {
              const moodScores = { amazing: 6, great: 5, good: 4, neutral: 3, bad: 2, terrible: 1 };
              return sum + (r.mood ? moodScores[r.mood] : 0);
            }, 0) / reflections.filter(r => r.mood).length
          : 0,
        avgEnergy: reflections.filter(r => r.energy_level).length > 0
          ? reflections.reduce((sum, r) => sum + (r.energy_level || 0), 0) / reflections.filter(r => r.energy_level).length
          : 0,
        avgStress: reflections.filter(r => r.stress_level).length > 0
          ? reflections.reduce((sum, r) => sum + (r.stress_level || 0), 0) / reflections.filter(r => r.stress_level).length
          : 0,
      };

      return { reflections, summary };
    },
    enabled: !!workspaceId && !!startDate && !!endDate,
  });
}

/**
 * Hook to create a new reflection
 */
export function useCreateReflection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReflectionInput) => {
      // Validate input
      const validation = validateReflectionInput(input);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const { data, error } = await supabase
        .from('reflections')
        .insert({
          workspace_id: input.workspace_id,
          title: input.title,
          content: input.content,
          reflection_type: input.reflection_type,
          mood: input.mood,
          energy_level: input.energy_level,
          stress_level: input.stress_level,
          satisfaction_level: input.satisfaction_level,
          gratitude_items: input.gratitude_items || [],
          challenges: input.challenges || [],
          wins: input.wins || [],
          learnings: input.learnings || [],
          tomorrow_focus: input.tomorrow_focus || [],
          reflection_date: input.reflection_date,
          is_private: input.is_private ?? true,
          tags: input.tags || [],
          metadata: input.metadata || {},
          created_by: (await supabase.auth.getUser()).data.user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        metadata: data.metadata as Record<string, any>,
      } as Reflection;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [REFLECTIONS_QUERY_KEY, data.workspace_id] });
      queryClient.invalidateQueries({ queryKey: ['reflection-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['reflection-streak'] });
      toast.success("Reflection created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create reflection: ${error.message}`);
    },
  });
}

/**
 * Hook to update an existing reflection
 */
export function useUpdateReflection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateReflectionInput }) => {
      // Validate updates
      const validation = validateReflectionInput(updates);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const { data, error } = await supabase
        .from('reflections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        metadata: data.metadata as Record<string, any>,
      } as Reflection;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [REFLECTIONS_QUERY_KEY, data.workspace_id] });
      queryClient.invalidateQueries({ queryKey: [REFLECTIONS_QUERY_KEY, data.id] });
      queryClient.invalidateQueries({ queryKey: ['reflection-analytics'] });
      toast.success("Reflection updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update reflection: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a reflection
 */
export function useDeleteReflection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reflections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REFLECTIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['reflection-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['reflection-streak'] });
      toast.success("Reflection deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete reflection: ${error.message}`);
    },
  });
}

/**
 * Hook to duplicate a reflection for a new date
 */
export function useDuplicateReflection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newDate }: { id: string; newDate: string }) => {
      // Fetch original reflection
      const { data: original, error: fetchError } = await supabase
        .from('reflections')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Create new reflection with same structure but new date
      const { data, error } = await supabase
        .from('reflections')
        .insert({
          workspace_id: original.workspace_id,
          title: `${original.title} (Copy)`,
          content: '', // Reset content for new reflection
          reflection_type: original.reflection_type,
          gratitude_items: [],
          challenges: [],
          wins: [],
          learnings: [],
          tomorrow_focus: [],
          reflection_date: newDate,
          is_private: original.is_private,
          tags: original.tags,
          metadata: original.metadata,
          created_by: (await supabase.auth.getUser()).data.user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        metadata: data.metadata as Record<string, any>,
      } as Reflection;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [REFLECTIONS_QUERY_KEY, data.workspace_id] });
      toast.success("Reflection duplicated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to duplicate reflection: ${error.message}`);
    },
  });
}
