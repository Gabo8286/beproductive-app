import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Goal, GoalMilestone, CreateGoalInput, UpdateGoalInput } from "@/types/goals";
import { toast } from "sonner";
import { useEffect } from "react";

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

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Goal[];
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const goalData = {
        workspace_id: input.workspace_id,
        created_by: user.id,
        title: input.title,
        description: input.description,
        category: input.category || 'personal',
        status: input.status || 'draft',
        priority: input.priority || 3,
        target_value: input.target_value,
        current_value: input.current_value || 0,
        unit: input.unit,
        start_date: input.start_date?.toISOString().split('T')[0],
        target_date: input.target_date?.toISOString().split('T')[0],
        parent_goal_id: input.parent_goal_id,
        assigned_to: input.assigned_to,
        tags: input.tags || [],
      };

      const { data, error } = await supabase
        .from('goals')
        .insert(goalData)
        .select()
        .single();

      if (error) throw error;
      return data as Goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success("Goal created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create goal");
      console.error(error);
    },
  });

  return {
    goals,
    isLoading,
    createGoal: createGoalMutation.mutate,
    isCreating: createGoalMutation.isPending,
  };
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
      const updateData: any = {};
      
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.progress !== undefined) updateData.progress = input.progress;
      if (input.target_value !== undefined) updateData.target_value = input.target_value;
      if (input.current_value !== undefined) updateData.current_value = input.current_value;
      if (input.unit !== undefined) updateData.unit = input.unit;
      if (input.start_date !== undefined) {
        updateData.start_date = input.start_date?.toISOString().split('T')[0];
      }
      if (input.target_date !== undefined) {
        updateData.target_date = input.target_date?.toISOString().split('T')[0];
      }
      if (input.parent_goal_id !== undefined) updateData.parent_goal_id = input.parent_goal_id;
      if (input.assigned_to !== undefined) updateData.assigned_to = input.assigned_to;
      if (input.tags !== undefined) updateData.tags = input.tags;

      const { data, error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', id] });
      toast.success("Goal updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update goal");
      console.error(error);
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success("Goal deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete goal");
      console.error(error);
    },
  });
}
