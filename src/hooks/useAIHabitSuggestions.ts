import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateHabitSuggestions, HabitSuggestion } from '@/lib/ai-service';
import { APIProviderType } from '@/types/api-management';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface AIHabitSuggestionRecord {
  id: string;
  goal_id: string;
  user_id: string;
  workspace_id: string;
  suggestion_data: HabitSuggestion;
  status: 'pending' | 'approved' | 'rejected' | 'converted';
  rejected_reason?: string;
  ai_provider: string;
  ai_model?: string;
  ai_confidence: number;
  created_habit_id?: string;
  created_at: string;
  updated_at: string;
}

export interface GenerateHabitSuggestionsParams {
  goalId: string;
  goalTitle: string;
  goalDescription: string;
  workspaceId: string;
  provider?: APIProviderType;
}

export interface UpdateSuggestionStatusParams {
  suggestionId: string;
  status: 'approved' | 'rejected';
  rejectedReason?: string;
}

export function useAIHabitSuggestions(goalId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Query to fetch AI habit suggestions for a goal
  const {
    data: suggestions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['ai-habit-suggestions', goalId],
    queryFn: async () => {
      if (!goalId) return [];

      const { data, error } = await supabase
        .from('ai_habit_suggestions')
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(item => ({
        ...item,
        suggestion_data: item.suggestion_data as unknown as HabitSuggestion
      })) as AIHabitSuggestionRecord[];
    },
    enabled: !!goalId
  });

  // Mutation to generate new AI habit suggestions
  const generateSuggestionsMutation = useMutation({
    mutationFn: async (params: GenerateHabitSuggestionsParams) => {
      if (!user) throw new Error('User not authenticated');

      setIsGenerating(true);

      try {
        // Generate AI suggestions
        const aiSuggestions = await generateHabitSuggestions(
          params.goalTitle,
          params.goalDescription,
          params.provider || 'openai',
          user.id
        );

        if (aiSuggestions.length === 0) {
          throw new Error('No suggestions generated');
        }

        const suggestionRecords = aiSuggestions.map(suggestion => ({
          goal_id: params.goalId,
          user_id: user.id,
          workspace_id: params.workspaceId,
          suggestion_data: suggestion as any,
          status: 'pending' as const,
          ai_provider: params.provider || 'openai',
          ai_confidence: suggestion.confidence
        }));

        const { data, error } = await supabase
          .from('ai_habit_suggestions')
          .insert(suggestionRecords)
          .select();

        if (error) throw error;

        return data.map(item => ({
          ...item,
          suggestion_data: item.suggestion_data as unknown as HabitSuggestion
        })) as AIHabitSuggestionRecord[];
      } finally {
        setIsGenerating(false);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-habit-suggestions', goalId] });
      toast({
        title: "AI Suggestions Generated",
        description: `Generated ${data.length} habit suggestions to help achieve your goal.`
      });
    },
    onError: (error) => {
      console.error('Error generating habit suggestions:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate habit suggestions. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation to update suggestion status (approve/reject)
  const updateStatusMutation = useMutation({
    mutationFn: async (params: UpdateSuggestionStatusParams) => {
      const { data, error } = await supabase
        .from('ai_habit_suggestions')
        .update({
          status: params.status,
          rejected_reason: params.rejectedReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.suggestionId)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        suggestion_data: data.suggestion_data as unknown as HabitSuggestion
      } as AIHabitSuggestionRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-habit-suggestions'] });

      const action = data.status === 'approved' ? 'approved' : 'rejected';
      toast({
        title: `Suggestion ${action}`,
        description: `Habit suggestion has been ${action}.`
      });
    },
    onError: (error) => {
      console.error('Error updating suggestion status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update suggestion status. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation to convert approved suggestion to actual habit
  const convertToHabitMutation = useMutation({
    mutationFn: async (suggestion: AIHabitSuggestionRecord) => {
      if (!user) throw new Error('User not authenticated');

      const habitData = suggestion.suggestion_data;

      // Create habit record
      const { data: habit, error: habitError } = await supabase
        .from('habits')
        .insert({
          workspace_id: suggestion.workspace_id,
          title: habitData.title,
          description: habitData.description,
          category: habitData.category as any,
          frequency: habitData.frequency as any,
          custom_frequency: habitData.customFrequency ? {
            pattern: habitData.customFrequency.pattern,
            description: habitData.customFrequency.description
          } : null,
          difficulty: habitData.difficulty as any,
          time_of_day: habitData.time_of_day as any,
          duration_minutes: habitData.duration_minutes,
          created_by: user.id
        })
        .select()
        .single();

      if (habitError) throw habitError;

      // Link habit to goal
      const { error: linkError } = await supabase
        .from('habit_goal_links')
        .insert({
          habit_id: habit.id,
          goal_id: suggestion.goal_id,
          contribution_weight: 1.0
        });

      if (linkError) throw linkError;

      // Update suggestion status to converted
      const { error: updateError } = await supabase
        .from('ai_habit_suggestions')
        .update({
          status: 'converted',
          created_habit_id: habit.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', suggestion.id);

      if (updateError) throw updateError;

      return { habit, suggestion };
    },
    onSuccess: ({ habit }) => {
      queryClient.invalidateQueries({ queryKey: ['ai-habit-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habit-goal-links'] });

      toast({
        title: "Habit Created",
        description: `"${habit.title}" has been added to your habits and linked to your goal.`
      });
    },
    onError: (error) => {
      console.error('Error converting suggestion to habit:', error);
      toast({
        title: "Conversion Failed",
        description: "Failed to create habit from suggestion. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    suggestions,
    isLoading,
    error,
    isGenerating,
    generateSuggestions: generateSuggestionsMutation.mutate,
    isGeneratingSuggestions: generateSuggestionsMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
    convertToHabit: convertToHabitMutation.mutate,
    isConvertingToHabit: convertToHabitMutation.isPending,
    refetch
  };
}