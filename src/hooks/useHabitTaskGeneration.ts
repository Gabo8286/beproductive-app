import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number;
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  dayOfMonth?: number;
  endDate?: string;
  count?: number;
}

export interface GenerateTasksParams {
  habitId: string;
  startDate?: Date;
  daysAhead?: number;
}

export interface HabitTaskRecord {
  id: string;
  workspace_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'scheduled' | 'todo' | 'in_progress' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  scheduled_date?: string;
  estimated_duration?: number;
  actual_duration?: number;
  assigned_to?: string;
  created_by: string;
  parent_task_id?: string;
  tags: string[];
  position: number;
  completed_at?: string;
  metadata: Record<string, any>;
  recurrence_pattern?: RecurrencePattern;
  is_recurring: boolean;
  habit_id?: string;
  auto_generated: boolean;
  created_at: string;
  updated_at: string;
}

export function useHabitTaskGeneration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to get tasks generated from a specific habit
  const getHabitTasks = (habitId: string) => {
    return useQuery({
      queryKey: ['habit-tasks', habitId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('habit_id', habitId)
          .eq('auto_generated', true)
          .order('due_date', { ascending: true });

        if (error) throw error;
        return data.map(item => ({
          ...item,
          recurrence_pattern: item.recurrence_pattern as unknown as RecurrencePattern
        })) as HabitTaskRecord[];
      },
      enabled: !!habitId
    });
  };

  // Mutation to generate recurring tasks from a habit
  const generateTasksMutation = useMutation({
    mutationFn: async (params: GenerateTasksParams) => {
      if (!user) throw new Error('User not authenticated');

      // Get habit details
      const { data: habit, error: habitError } = await supabase
        .from('habits')
        .select('*')
        .eq('id', params.habitId)
        .single();

      if (habitError) throw habitError;
      if (!habit) throw new Error('Habit not found');

      // Use the database function to generate tasks
      const { data, error } = await supabase.rpc(
        'generate_recurring_tasks_from_habit',
        {
          p_habit_id: params.habitId,
          p_start_date: params.startDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          p_days_ahead: params.daysAhead || 7
        }
      );

      if (error) throw error;

      return { tasksGenerated: data, habit };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['habit-tasks'] });

      toast({
        title: "Tasks Generated",
        description: `Generated ${data.tasksGenerated} recurring tasks from "${data.habit.title}".`
      });
    },
    onError: (error) => {
      console.error('Error generating tasks from habit:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate tasks from habit. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation to update a recurring task and regenerate future instances
  const updateRecurringTaskMutation = useMutation({
    mutationFn: async (params: { taskId: string; updates: Partial<HabitTaskRecord> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(params.updates as any)
        .eq('id', params.taskId)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        recurrence_pattern: data.recurrence_pattern as unknown as RecurrencePattern
      } as HabitTaskRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['habit-tasks'] });

      toast({
        title: "Task Updated",
        description: "Recurring task has been updated."
      });
    },
    onError: (error) => {
      console.error('Error updating recurring task:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update recurring task. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation to bulk update habit-generated tasks
  const bulkUpdateHabitTasksMutation = useMutation({
    mutationFn: async (params: {
      habitId: string;
      updates: Partial<HabitTaskRecord>;
      applyToFuture?: boolean;
    }) => {
      let query = supabase
        .from('tasks')
        .update(params.updates as any)
        .eq('habit_id', params.habitId)
        .eq('auto_generated', true);

      // If applyToFuture is true, only update future tasks
      if (params.applyToFuture) {
        query = query.gte('due_date', new Date().toISOString());
      }

      const { data, error } = await query.select();

      if (error) throw error;
      return data.map(item => ({
        ...item,
        recurrence_pattern: item.recurrence_pattern as unknown as RecurrencePattern
      })) as HabitTaskRecord[];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['habit-tasks'] });

      toast({
        title: "Tasks Updated",
        description: `Updated ${data.length} habit-generated tasks.`
      });
    },
    onError: (error) => {
      console.error('Error bulk updating habit tasks:', error);
      toast({
        title: "Bulk Update Failed",
        description: "Failed to update habit-generated tasks. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Function to calculate next occurrence date based on habit frequency
  const calculateNextOccurrence = (
    lastDate: Date,
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom',
    customFrequency?: any
  ): Date => {
    const next = new Date(lastDate);

    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'custom':
        // Handle custom frequency based on pattern
        if (customFrequency?.interval) {
          next.setDate(next.getDate() + customFrequency.interval);
        } else {
          next.setDate(next.getDate() + 1); // Default to daily
        }
        break;
      default:
        next.setDate(next.getDate() + 1);
        break;
    }

    return next;
  };

  // Function to check if a task should be created for a given date
  const shouldCreateTaskForDate = (
    date: Date,
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom',
    startDate: Date,
    customFrequency?: any
  ): boolean => {
    switch (frequency) {
      case 'daily':
        return true; // Create task every day
      case 'weekly':
        return date.getDay() === startDate.getDay(); // Same day of week
      case 'monthly':
        return date.getDate() === startDate.getDate(); // Same day of month
      case 'custom':
        // Custom logic based on pattern
        if (customFrequency?.daysOfWeek) {
          return customFrequency.daysOfWeek.includes(date.getDay());
        }
        return true; // Default to daily
      default:
        return true;
    }
  };

  return {
    getHabitTasks,
    generateTasks: generateTasksMutation.mutate,
    isGeneratingTasks: generateTasksMutation.isPending,
    updateRecurringTask: updateRecurringTaskMutation.mutate,
    isUpdatingRecurringTask: updateRecurringTaskMutation.isPending,
    bulkUpdateHabitTasks: bulkUpdateHabitTasksMutation.mutate,
    isBulkUpdating: bulkUpdateHabitTasksMutation.isPending,
    calculateNextOccurrence,
    shouldCreateTaskForDate
  };
}