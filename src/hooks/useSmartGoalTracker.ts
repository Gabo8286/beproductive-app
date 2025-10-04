import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  smartGoalTracker,
  GoalContext,
  GoalProgress,
  GoalSuggestion,
  GoalAnalysisRequest
} from '@/services/ai/smartGoalTracker';
import { AIProvider } from '@/types/ai-insights';

export interface GoalTrackingData {
  progress: GoalProgress[];
  suggestions: GoalSuggestion[];
  insights: any[];
  lastAnalyzed: string;
}

export const useSmartGoalTracker = (preferredProvider: AIProvider = 'lovable') => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch user's active goals
  const {
    data: goals,
    isLoading: goalsLoading,
    error: goalsError,
    refetch: refetchGoals
  } = useQuery({
    queryKey: ['smart-goals', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          tasks:tasks(*)
        `)
        .eq('created_by', user.id)
        .eq('status', 'active')
        .order('priority', { ascending: false });

      if (error) throw error;

      return data.map(goal => ({
        ...goal,
        tasks: goal.tasks || [],
        milestones: goal.metadata?.milestones || []
      })) as GoalContext[];
    },
    enabled: !!user?.id
  });

  // Fetch latest goal analysis results
  const {
    data: trackingData,
    isLoading: trackingLoading,
    error: trackingError,
    refetch: refetchTracking
  } = useQuery({
    queryKey: ['goal-tracking-data', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get the latest goal recommendations
      const { data: recommendations, error: recError } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('metadata->>type', 'goal_suggestion')
        .order('created_at', { ascending: false });

      if (recError) throw recError;

      // Get goal insights from ai_insights table
      const { data: insights, error: insightsError } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .in('insight_type', ['goal_progress', 'goal_optimization'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (insightsError) throw insightsError;

      // Group recommendations by goal
      const suggestionsByGoal: Record<string, GoalSuggestion[]> = {};
      recommendations?.forEach(rec => {
        const goalId = rec.metadata?.goalId;
        if (goalId) {
          if (!suggestionsByGoal[goalId]) {
            suggestionsByGoal[goalId] = [];
          }
          suggestionsByGoal[goalId].push({
            goalId,
            type: rec.metadata?.suggestionType || 'strategy',
            title: rec.title,
            description: rec.description,
            reasoning: rec.metadata?.reasoning || '',
            priority: mapNumberToPriority(rec.priority),
            effort: rec.effort_level,
            expectedImpact: rec.expected_impact,
            implementationSteps: rec.implementation_steps || [],
            confidence: rec.metadata?.confidence || 0.7
          });
        }
      });

      const allSuggestions = Object.values(suggestionsByGoal).flat();

      return {
        suggestions: allSuggestions,
        insights: insights || [],
        lastAnalyzed: recommendations?.[0]?.created_at || null
      };
    },
    enabled: !!user?.id
  });

  // Analyze goals mutation
  const analyzeGoals = useMutation({
    mutationFn: async (options?: {
      lookbackDays?: number;
      includeTaskAnalysis?: boolean;
      includeMilestoneAnalysis?: boolean;
    }) => {
      if (!user?.id || !goals || goals.length === 0) {
        throw new Error('No goals available for analysis');
      }

      setIsAnalyzing(true);

      const request: GoalAnalysisRequest = {
        userId: user.id,
        goals,
        preferredProvider,
        lookbackDays: options?.lookbackDays || 30,
        includeTaskAnalysis: options?.includeTaskAnalysis ?? true,
        includeMilestoneAnalysis: options?.includeMilestoneAnalysis ?? true
      };

      const result = await smartGoalTracker.analyzeGoals(request);

      // Save suggestions to database
      if (result.suggestions.length > 0) {
        await smartGoalTracker.saveGoalRecommendations(result.suggestions, user.id);
      }

      // Save insights to database
      for (const insight of result.insights) {
        await supabase
          .from('ai_insights')
          .insert({
            user_id: user.id,
            insight_type: 'goal_progress',
            title: insight.title,
            content: insight.description,
            confidence: 0.8,
            metadata: {
              type: insight.type,
              recommendations: insight.recommendations,
              generated_at: new Date().toISOString()
            }
          });
      }

      return result;
    },
    onSuccess: (data) => {
      setIsAnalyzing(false);
      queryClient.invalidateQueries({ queryKey: ['goal-tracking-data', user?.id] });
      toast.success(`Analysis complete! Found ${data.suggestions.length} suggestions and ${data.insights.length} insights.`);
    },
    onError: (error) => {
      setIsAnalyzing(false);
      console.error('Goal analysis failed:', error);
      toast.error('Failed to analyze goals: ' + (error.message || 'Unknown error'));
    }
  });

  // Schedule automatic tracking
  const scheduleTracking = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      await smartGoalTracker.scheduleAutomaticTracking(user.id);
    },
    onSuccess: () => {
      toast.success('Automatic goal tracking scheduled');
    },
    onError: (error) => {
      console.error('Failed to schedule tracking:', error);
      toast.error('Failed to schedule tracking');
    }
  });

  // Get goal progress data
  const getGoalProgress = async (goalId: string): Promise<GoalProgress | null> => {
    if (!user?.id || !goals) return null;

    const goal = goals.find(g => g.id === goalId);
    if (!goal) return null;

    try {
      const userContext = await smartGoalTracker.getUserContext(user.id);
      const analysisResult = await smartGoalTracker.analyzeGoals({
        userId: user.id,
        goals: [goal],
        preferredProvider
      });

      return analysisResult.progress[0] || null;
    } catch (error) {
      console.error('Failed to get goal progress:', error);
      return null;
    }
  };

  // Apply suggestion (create task or update goal)
  const applySuggestion = useMutation({
    mutationFn: async (suggestion: GoalSuggestion) => {
      if (!user?.id) throw new Error('User not authenticated');

      const goal = goals?.find(g => g.id === suggestion.goalId);
      if (!goal) throw new Error('Goal not found');

      // Create implementation tasks based on suggestion
      for (const step of suggestion.implementationSteps) {
        await supabase
          .from('tasks')
          .insert({
            user_id: user.id,
            goal_id: suggestion.goalId,
            title: step,
            description: `Auto-generated from AI suggestion: ${suggestion.title}`,
            priority: mapPriorityToTaskPriority(suggestion.priority),
            status: 'todo',
            category: goal.category,
            metadata: {
              ai_generated: true,
              suggestion_id: suggestion.goalId + '_' + Date.now(),
              suggestion_type: suggestion.type
            }
          });
      }

      // Mark suggestion as applied
      await supabase
        .from('ai_recommendations')
        .update({
          metadata: {
            ...{},
            applied: true,
            applied_at: new Date().toISOString()
          }
        })
        .eq('user_id', user.id)
        .eq('title', suggestion.title);

      return suggestion;
    },
    onSuccess: (suggestion) => {
      queryClient.invalidateQueries({ queryKey: ['smart-goals', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['goal-tracking-data', user?.id] });
      toast.success(`Applied suggestion: ${suggestion.title}`);
    },
    onError: (error) => {
      console.error('Failed to apply suggestion:', error);
      toast.error('Failed to apply suggestion');
    }
  });

  // Calculate overall progress statistics
  const getOverallStats = () => {
    if (!goals || goals.length === 0) {
      return {
        totalGoals: 0,
        averageProgress: 0,
        onTrackCount: 0,
        atRiskCount: 0,
        highPriorityCount: 0
      };
    }

    const totalGoals = goals.length;
    const averageProgress = goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / totalGoals;
    const highPriorityCount = goals.filter(g => g.priority >= 4).length;

    // These would be more accurate with actual tracking data
    const onTrackCount = Math.floor(totalGoals * 0.6); // Placeholder
    const atRiskCount = Math.floor(totalGoals * 0.2); // Placeholder

    return {
      totalGoals,
      averageProgress,
      onTrackCount,
      atRiskCount,
      highPriorityCount
    };
  };

  return {
    // Data
    goals: goals || [],
    trackingData,
    overallStats: getOverallStats(),

    // Loading states
    isLoading: goalsLoading || trackingLoading,
    isAnalyzing: analyzeGoals.isPending || isAnalyzing,
    isApplying: applySuggestion.isPending,

    // Error states
    error: goalsError || trackingError,

    // Actions
    analyzeGoals: analyzeGoals.mutate,
    applySuggestion: applySuggestion.mutate,
    scheduleTracking: scheduleTracking.mutate,
    getGoalProgress,
    refetchGoals,
    refetchTracking,

    // Utilities
    hasData: !!(goals && goals.length > 0),
    hasTrackingData: !!(trackingData && trackingData.suggestions.length > 0),
    lastAnalyzed: trackingData?.lastAnalyzed
  };
};

// Helper functions
function mapNumberToPriority(priority: number): 'low' | 'medium' | 'high' | 'urgent' {
  if (priority >= 5) return 'urgent';
  if (priority >= 4) return 'high';
  if (priority >= 3) return 'medium';
  return 'low';
}

function mapPriorityToTaskPriority(priority: string): 'low' | 'medium' | 'high' | 'urgent' {
  return priority as 'low' | 'medium' | 'high' | 'urgent';
}