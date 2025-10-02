import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GoalMilestone } from "@/types/goals";
import { toast } from "sonner";

export function useGoalMilestones(goalId: string) {
  return useQuery({
    queryKey: ['goal-milestones', goalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goal_milestones')
        .select('*')
        .eq('goal_id', goalId)
        .order('target_date', { ascending: true });

      if (error) throw error;
      return data as GoalMilestone[];
    },
    enabled: !!goalId,
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<GoalMilestone, 'id' | 'created_at' | 'updated_at' | 'progress_percentage' | 'completed_at'>) => {
      // Validate input
      if (!input.title?.trim()) {
        throw new Error("Milestone title is required");
      }
      if (input.title.length > 200) {
        throw new Error("Milestone title must be less than 200 characters");
      }

      const { data, error } = await supabase
        .from('goal_milestones')
        .insert({
          goal_id: input.goal_id,
          title: input.title.trim(),
          description: input.description?.trim() || null,
          target_date: input.target_date || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as GoalMilestone;
    },
    onSuccess: (milestone) => {
      queryClient.invalidateQueries({ queryKey: ['goal-milestones', milestone.goal_id] });
      queryClient.invalidateQueries({ queryKey: ['goals', milestone.goal_id] });
      toast.success("Milestone created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create milestone");
      console.error('Create milestone error:', error);
    },
  });
}

export function useCompleteMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (milestoneId: string) => {
      const { error } = await supabase.rpc('complete_milestone', {
        milestone_id: milestoneId
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-milestones'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success("Milestone completed!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to complete milestone");
      console.error('Complete milestone error:', error);
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<GoalMilestone> & { id: string }) => {
      const updateData: any = {};
      
      if (input.title !== undefined) {
        if (!input.title.trim()) {
          throw new Error("Milestone title is required");
        }
        updateData.title = input.title.trim();
      }
      if (input.description !== undefined) {
        updateData.description = input.description?.trim() || null;
      }
      if (input.target_date !== undefined) {
        updateData.target_date = input.target_date;
      }

      const { data, error } = await supabase
        .from('goal_milestones')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as GoalMilestone;
    },
    onSuccess: (milestone) => {
      queryClient.invalidateQueries({ queryKey: ['goal-milestones', milestone.goal_id] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success("Milestone updated!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update milestone");
      console.error('Update milestone error:', error);
    },
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (milestoneId: string) => {
      const { error } = await supabase
        .from('goal_milestones')
        .delete()
        .eq('id', milestoneId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-milestones'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success("Milestone deleted!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete milestone");
      console.error('Delete milestone error:', error);
    },
  });
}
