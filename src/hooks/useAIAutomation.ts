import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  AutomationSuggestion,
  AIAutomationRule,
  WorkflowChain,
  NaturalLanguageRule,
  AIInsight,
  LearningData,
  AIAutomationType
} from "@/types/ai-automation";

export const useAutomationSuggestions = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: ['automation-suggestions', user?.id],
    queryFn: async (): Promise<AutomationSuggestion[]> => {
      if (!user?.id) throw new Error('Authentication required');

      // Simulate AI-generated suggestions based on user patterns
      const mockSuggestions: AutomationSuggestion[] = [
        {
          id: '1',
          title: 'Auto-prioritize urgent tasks',
          description: 'Automatically mark tasks as high priority when they contain keywords like "urgent", "ASAP", or have short deadlines.',
          ai_type: 'smart_prioritization',
          confidence: 0.92,
          potential_impact: 'high',
          implementation_complexity: 'simple',
          estimated_time_saved_minutes: 30,
          suggested_rule: {
            name: 'Smart Priority Assignment',
            ai_type: 'smart_prioritization',
            smart_triggers: [{
              type: 'pattern_based',
              conditions: {
                title_keywords: ['urgent', 'asap', 'critical', 'emergency'],
                due_date_hours: { lt: 24 }
              },
              confidence_threshold: 0.8
            }],
            smart_actions: [{
              type: 'modify_task',
              parameters: {
                priority: 'high',
                add_tags: ['auto-prioritized']
              }
            }]
          } as Partial<AIAutomationRule>,
          reasoning: 'Analysis of your task patterns shows you often manually prioritize tasks with urgent keywords.',
          evidence: [
            '85% of tasks with "urgent" were manually set to high priority',
            'Tasks with short deadlines had 3x higher completion rate when prioritized',
            'You spend an average of 2 minutes prioritizing each urgent task'
          ],
          user_patterns_used: ['keyword_analysis', 'manual_prioritization_patterns'],
          created_at: new Date().toISOString(),
          status: 'pending'
        },
        {
          id: '2',
          title: 'Smart goal progress tracking',
          description: 'Automatically update goal progress when related tasks are completed.',
          ai_type: 'cross_module_chain',
          confidence: 0.88,
          potential_impact: 'medium',
          implementation_complexity: 'moderate',
          estimated_time_saved_minutes: 15,
          suggested_rule: {
            name: 'Goal Progress Sync',
            ai_type: 'cross_module_chain',
            smart_triggers: [{
              type: 'event_based',
              conditions: {
                event: 'task_completed',
                has_goal_tags: true
              }
            }],
            smart_actions: [{
              type: 'update_habit',
              parameters: {
                increment_progress: 'auto',
                calculate_percentage: true
              }
            }]
          } as Partial<AIAutomationRule>,
          reasoning: 'You frequently have tasks linked to goals but manually update progress.',
          evidence: [
            'Goal progress updated manually 73% of the time after task completion',
            '12 minutes average delay between task completion and goal update',
            'Higher goal achievement rate when progress is tracked consistently'
          ],
          user_patterns_used: ['goal_task_correlation', 'update_timing_patterns'],
          created_at: new Date().toISOString(),
          status: 'pending'
        },
        {
          id: '3',
          title: 'Intelligent break reminders',
          description: 'Suggest breaks based on your productivity patterns and task complexity.',
          ai_type: 'predictive_scheduling',
          confidence: 0.75,
          potential_impact: 'medium',
          implementation_complexity: 'complex',
          estimated_time_saved_minutes: 45,
          suggested_rule: {
            name: 'Smart Break Scheduling',
            ai_type: 'predictive_scheduling',
            smart_triggers: [{
              type: 'ai_predicted',
              conditions: {
                continuous_work_time: { gt: 90 },
                productivity_decline_detected: true,
                complex_task_active: true
              },
              confidence_threshold: 0.7
            }],
            smart_actions: [{
              type: 'send_notification',
              parameters: {
                type: 'break_suggestion',
                message: 'Consider taking a 10-minute break to maintain productivity',
                include_suggestions: true
              }
            }]
          } as Partial<AIAutomationRule>,
          reasoning: 'Your productivity data shows optimal performance with regular breaks.',
          evidence: [
            'Productivity drops 23% after 90 minutes of continuous work',
            'Tasks completed 15% faster when breaks are taken regularly',
            'You work for 2+ hours without breaks 67% of the time'
          ],
          user_patterns_used: ['productivity_curves', 'break_timing_analysis'],
          created_at: new Date().toISOString(),
          status: 'pending'
        }
      ];

      return mockSuggestions;
    },
    enabled: !!user?.id && !authLoading,
  });
};

export const useImplementSuggestion = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ suggestionId, customizations }: {
      suggestionId: string;
      customizations?: Partial<AIAutomationRule>
    }) => {
      // In a real implementation, this would create the actual automation rule
      // and mark the suggestion as implemented

      console.log('Implementing suggestion:', suggestionId, customizations);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      return { success: true, ruleId: `rule_${suggestionId}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast({
        title: "Success",
        description: "Automation rule implemented successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to implement automation rule",
        variant: "destructive",
      });
    },
  });
};

export const useRejectSuggestion = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ suggestionId, reason }: { suggestionId: string; reason?: string }) => {
      console.log('Rejecting suggestion:', suggestionId, reason);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-suggestions'] });
      toast({
        title: "Suggestion dismissed",
        description: "We'll improve our recommendations based on your feedback",
      });
    },
  });
};

export const useAIInsights = () => {
  const { user, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: ['ai-insights', user?.id],
    queryFn: async (): Promise<AIInsight[]> => {
      if (!user?.id) throw new Error('Authentication required');

      // Mock AI insights
      const mockInsights: AIInsight[] = [
        {
          id: '1',
          type: 'pattern',
          title: 'Peak Productivity Hours Identified',
          description: 'Your most productive hours are between 9-11 AM and 2-4 PM. Consider scheduling important tasks during these times.',
          data: {
            peak_hours: ['09:00-11:00', '14:00-16:00'],
            productivity_scores: { morning: 0.92, afternoon: 0.87, evening: 0.64 },
            sample_size: 30
          },
          confidence: 0.89,
          actionable: true,
          suggested_actions: [],
          related_modules: ['tasks', 'habits', 'goals'],
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'optimization',
          title: 'Task Batching Opportunity',
          description: 'Grouping similar tasks together could save 25% of your time based on context switching analysis.',
          data: {
            context_switches: 47,
            potential_savings: 25,
            similar_task_groups: ['email', 'planning', 'creative_work']
          },
          confidence: 0.76,
          actionable: true,
          suggested_actions: [],
          related_modules: ['tasks', 'automation'],
          created_at: new Date().toISOString()
        }
      ];

      return mockInsights;
    },
    enabled: !!user?.id && !authLoading,
  });
};

export const useLearningData = () => {
  const { user, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: ['learning-data', user?.id],
    queryFn: async (): Promise<LearningData> => {
      if (!user?.id) throw new Error('Authentication required');

      // Mock learning data
      const mockData: LearningData = {
        user_id: user.id,
        patterns: {
          work_hours: [9, 10, 11, 14, 15, 16],
          productive_times: ['morning', 'early_afternoon'],
          task_preferences: {
            preferred_duration: 45,
            break_frequency: 90,
            difficulty_preference: 'mixed'
          },
          completion_patterns: {
            streak_days: 7,
            best_day: 'tuesday',
            completion_rate: 0.78
          },
          interruption_patterns: {
            avg_interruptions_per_hour: 2.3,
            recovery_time_minutes: 8,
            most_disruptive_source: 'notifications'
          }
        },
        performance_trends: {
          productivity_score: [0.8, 0.82, 0.85, 0.87, 0.84],
          completion_rates: [0.75, 0.78, 0.82, 0.79, 0.83],
          time_estimates_accuracy: [0.65, 0.68, 0.72, 0.74, 0.71],
          goal_achievement_rate: [0.7, 0.73, 0.76, 0.78, 0.75]
        },
        context_awareness: {
          calendar_integration: { meetings_per_day: 3.2, focus_blocks: 2.1 },
          location_patterns: { home: 0.8, office: 0.2 },
          device_usage: { desktop: 0.7, mobile: 0.3 },
          app_switching_patterns: { avg_switches_per_hour: 15 }
        },
        feedback_history: {
          automation_ratings: [4.2, 4.5, 4.3, 4.6],
          suggestion_acceptance_rate: 0.73,
          manual_overrides: 12,
          feature_usage: { automation: 0.85, ai_insights: 0.67, suggestions: 0.78 }
        },
        updated_at: new Date().toISOString()
      };

      return mockData;
    },
    enabled: !!user?.id && !authLoading,
  });
};

export const useGenerateAutomationSuggestions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (context: { module?: string; userAction?: string }) => {
      console.log('Generating suggestions for context:', context);

      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));

      return { suggestionsGenerated: 3, analysisComplete: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-suggestions'] });
      toast({
        title: "Analysis Complete",
        description: "New automation suggestions have been generated",
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Unable to generate suggestions at this time",
        variant: "destructive",
      });
    },
  });
};

export const useOptimizeWorkflow = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflowId: string) => {
      console.log('Optimizing workflow:', workflowId);

      // Simulate AI optimization
      await new Promise(resolve => setTimeout(resolve, 3000));

      return {
        optimizationsApplied: 5,
        estimatedImprovement: 0.23,
        changes: [
          'Reordered steps for better efficiency',
          'Added parallel processing where possible',
          'Optimized task batching',
          'Improved error handling',
          'Enhanced user experience flow'
        ]
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-chains'] });
      toast({
        title: "Workflow Optimized",
        description: `Applied ${result.optimizationsApplied} optimizations with ${Math.round(result.estimatedImprovement * 100)}% improvement`,
      });
    },
    onError: () => {
      toast({
        title: "Optimization Failed",
        description: "Unable to optimize workflow at this time",
        variant: "destructive",
      });
    },
  });
};