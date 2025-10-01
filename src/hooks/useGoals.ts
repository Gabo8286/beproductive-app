import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Goal, CreateGoalInput, UpdateGoalInput } from "@/types/goals";
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
        .is('deleted_at', null)
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
        user_id: user.id,
        title: input.title,
        description: input.description,
        timeline_start: input.timeline_start?.toISOString().split('T')[0],
        timeline_end: input.timeline_end?.toISOString().split('T')[0],
        workspace_id: input.workspace_id,
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
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      return data as Goal;
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
      if (input.timeline_start !== undefined) {
        updateData.timeline_start = input.timeline_start?.toISOString().split('T')[0];
      }
      if (input.timeline_end !== undefined) {
        updateData.timeline_end = input.timeline_end?.toISOString().split('T')[0];
      }
      if (input.status !== undefined) updateData.status = input.status;
      if (input.progress !== undefined) updateData.progress = input.progress;

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
        .update({ deleted_at: new Date().toISOString() })
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
