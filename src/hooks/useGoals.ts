import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Goal, GoalMilestone, CreateGoalInput, UpdateGoalInput } from "@/types/goals";
import { toast } from "sonner";
import { useEffect } from "react";
import { validateGoalInput, sanitizeGoalInput } from "@/utils/goalValidation";
import { shouldAutoComplete, calculateProgressFromValue, calculateValueFromProgress } from "@/utils/goalStatus";

export function useGoals() {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['goals'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          workspace:workspaces(name, type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (Goal & { workspace: { name: string; type: string } })[];
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      // Validate input
      const errors = validateGoalInput(input);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get user's default workspace if not provided
      let workspaceId = input.workspace_id;
      if (!workspaceId) {
        const { data: workspace } = await supabase
          .from('workspaces')
          .select('id')
          .eq('owner_id', user.id)
          .eq('type', 'personal')
          .maybeSingle();

        if (!workspace) throw new Error("No workspace found");
        workspaceId = workspace.id;
      }

      // Sanitize input
      const sanitized = sanitizeGoalInput(input);

      const goalData = {
        workspace_id: workspaceId,
        created_by: user.id,
        title: sanitized.title,
        description: sanitized.description || null,
        category: sanitized.category || 'personal',
        status: sanitized.status || 'draft',
        priority: sanitized.priority || 3,
        target_value: sanitized.target_value || null,
        current_value: sanitized.current_value || 0,
        unit: sanitized.unit || null,
        start_date: sanitized.start_date?.toISOString().split('T')[0] || null,
        target_date: sanitized.target_date?.toISOString().split('T')[0] || null,
        parent_goal_id: sanitized.parent_goal_id || null,
        assigned_to: sanitized.assigned_to || user.id,
        tags: sanitized.tags || [],
      };

      const { data, error } = await supabase
        .from('goals')
        .insert(goalData)
        .select()
        .single();

      if (error) throw error;
      return data as Goal;
    },
    onSuccess: (newGoal) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success(`Goal "${newGoal.title}" created successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create goal");
      console.error('Create goal error:', error);
    },
  });

  return {
    goals,
    isLoading,
    error,
    createGoal: createGoalMutation.mutate,
    isCreating: createGoalMutation.isPending,
  };
}

// Get goals filtered by status
export function useGoalsByStatus(status?: Goal['status']) {
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals', 'status', status],
    queryFn: async () => {
      let query = supabase
        .from('goals')
        .select(`
          *,
          workspace:workspaces(name)
        `)
        .order('position', { ascending: true });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Goal[];
    },
    enabled: status !== undefined,
  });

  return { goals, isLoading };
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: ['goals', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Goal | null;
    },
    enabled: !!id,
  });
}

export function useUpdateGoal(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateGoalInput) => {
      // Validate input
      const errors = validateGoalInput(input);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Sanitize input
      const sanitized = sanitizeGoalInput(input);
      const updateData: any = {};
      
      // Only include defined fields in update
      if (sanitized.title !== undefined) updateData.title = sanitized.title;
      if (sanitized.description !== undefined) updateData.description = sanitized.description || null;
      if (sanitized.category !== undefined) updateData.category = sanitized.category;
      if (sanitized.status !== undefined) {
        updateData.status = sanitized.status;
        // Auto-complete when status changes to completed
        if (sanitized.status === 'completed' && sanitized.progress === undefined) {
          updateData.progress = 100;
          updateData.completed_at = new Date().toISOString();
        }
      }
      if (sanitized.priority !== undefined) updateData.priority = sanitized.priority;
      if (sanitized.progress !== undefined) {
        updateData.progress = sanitized.progress;
        // Auto-complete when progress reaches 100
        if (shouldAutoComplete(sanitized.progress, sanitized.status || 'active')) {
          updateData.status = 'completed';
          updateData.completed_at = new Date().toISOString();
        }
        // Update current_value if target_value exists
        if (sanitized.target_value) {
          updateData.current_value = calculateValueFromProgress(sanitized.progress, sanitized.target_value);
        }
      }
      if (sanitized.target_value !== undefined) updateData.target_value = sanitized.target_value;
      if (sanitized.current_value !== undefined) {
        updateData.current_value = sanitized.current_value;
        // Auto-calculate progress if target_value exists
        if (sanitized.target_value && sanitized.target_value > 0) {
          updateData.progress = calculateProgressFromValue(sanitized.current_value, sanitized.target_value);
        }
      }
      if (sanitized.unit !== undefined) updateData.unit = sanitized.unit || null;
      if (sanitized.start_date !== undefined) {
        updateData.start_date = sanitized.start_date?.toISOString().split('T')[0] || null;
      }
      if (sanitized.target_date !== undefined) {
        updateData.target_date = sanitized.target_date?.toISOString().split('T')[0] || null;
      }
      if (sanitized.parent_goal_id !== undefined) updateData.parent_goal_id = sanitized.parent_goal_id;
      if (sanitized.assigned_to !== undefined) updateData.assigned_to = sanitized.assigned_to;
      if (sanitized.tags !== undefined) updateData.tags = sanitized.tags;

      const { data, error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Goal;
    },
    onSuccess: (updatedGoal) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', id] });
      toast.success(`Goal "${updatedGoal.title}" updated successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update goal");
      console.error('Update goal error:', error);
    },
  });
}

// Update goal progress with automatic status management
export function useUpdateGoalProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ goalId, progress }: { goalId: string; progress: number }) => {
      const clampedProgress = Math.max(0, Math.min(100, progress));
      
      const { error } = await supabase.rpc('update_goal_progress', {
        goal_id: goalId,
        new_progress: clampedProgress
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success("Goal progress updated!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update progress");
      console.error('Update progress error:', error);
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: string) => {
      // First check if goal has sub-goals
      const { data: subGoals } = await supabase
        .from('goals')
        .select('id, title')
        .eq('parent_goal_id', goalId);

      if (subGoals && subGoals.length > 0) {
        throw new Error(`Cannot delete goal with ${subGoals.length} sub-goal(s). Please delete or reassign sub-goals first.`);
      }

      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success("Goal deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete goal");
      console.error('Delete goal error:', error);
    },
  });
}
