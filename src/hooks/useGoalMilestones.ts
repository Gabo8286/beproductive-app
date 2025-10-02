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
      const { data, error } = await supabase
        .from('goal_milestones')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as GoalMilestone;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['goal-milestones', data.goal_id] });
      queryClient.invalidateQueries({ queryKey: ['goals', data.goal_id] });
      toast.success("Milestone created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create milestone");
      console.error(error);
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
    onError: (error) => {
      toast.error("Failed to complete milestone");
      console.error(error);
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
    onError: (error) => {
      toast.error("Failed to delete milestone");
      console.error(error);
    },
  });
}
