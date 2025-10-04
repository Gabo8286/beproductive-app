import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GoalMilestone } from "@/types/goals";

export interface CreateMilestoneInput {
  goal_id: string;
  title: string;
  description?: string;
  target_date?: Date;
  target_progress?: number;
  depends_on?: string[];
  priority?: 1 | 2 | 3 | 4 | 5;
  estimated_hours?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateMilestoneInput {
  title?: string;
  description?: string;
  target_date?: Date;
  target_progress?: number;
  depends_on?: string[];
  priority?: 1 | 2 | 3 | 4 | 5;
  estimated_hours?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface MilestoneTemplate {
  id: string;
  name: string;
  description: string;
  milestones: Omit<CreateMilestoneInput, "goal_id">[];
  category: string;
  created_by: string;
  created_at: string;
}

export interface MilestoneAnalytics {
  totalMilestones: number;
  completedMilestones: number;
  overdueMilestones: number;
  upcomingMilestones: number;
  averageCompletionTime: number;
  completionRate: number;
  milestoneVelocity: number;
}

// Get milestones for a goal with enhanced data
export function useGoalMilestones(goalId: string) {
  return useQuery({
    queryKey: ["goal-milestones", goalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goal_milestones")
        .select(
          `
          *,
          dependencies:goal_milestone_dependencies!goal_milestone_dependencies_milestone_id_fkey(
            depends_on_milestone:goal_milestones!goal_milestone_dependencies_depends_on_id_fkey(
              id, title, completed_at
            )
          )
        `,
        )
        .eq("goal_id", goalId)
        .order("target_date", { ascending: true });

      if (error) throw error;
      return data as (GoalMilestone & {
        dependencies: {
          depends_on_milestone: {
            id: string;
            title: string;
            completed_at: string | null;
          };
        }[];
      })[];
    },
    enabled: !!goalId,
  });
}

// Get milestone analytics
export function useMilestoneAnalytics(goalId: string) {
  return useQuery({
    queryKey: ["milestone-analytics", goalId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "calculate_milestone_analytics",
        {
          goal_id: goalId,
        },
      );

      if (error) throw error;
      return data as unknown as MilestoneAnalytics;
    },
    enabled: !!goalId,
    refetchInterval: 1000 * 60 * 15, // 15 minutes
  });
}

// Create enhanced milestone
export function useCreateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMilestoneInput) => {
      if (!input.title?.trim()) {
        throw new Error("Milestone title is required");
      }
      if (input.title.length > 200) {
        throw new Error("Milestone title must be less than 200 characters");
      }
      if (
        input.target_progress &&
        (input.target_progress < 0 || input.target_progress > 100)
      ) {
        throw new Error("Target progress must be between 0 and 100");
      }

      const milestoneData = {
        goal_id: input.goal_id,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        target_date: input.target_date?.toISOString().split("T")[0] || null,
        progress_percentage: input.target_progress || 0,
        priority: input.priority || 3,
        estimated_hours: input.estimated_hours || null,
        tags: input.tags || [],
        metadata: input.metadata || {},
      };

      const { data, error } = await supabase
        .from("goal_milestones")
        .insert(milestoneData)
        .select()
        .single();

      if (error) throw error;

      // Add dependencies if provided
      if (input.depends_on && input.depends_on.length > 0) {
        const dependencies = input.depends_on.map((dependsOnId) => ({
          milestone_id: data.id,
          depends_on_id: dependsOnId,
        }));

        const { error: depError } = await supabase
          .from("goal_milestone_dependencies")
          .insert(dependencies);

        if (depError) throw depError;
      }

      return data as GoalMilestone;
    },
    onSuccess: (milestone) => {
      queryClient.invalidateQueries({
        queryKey: ["goal-milestones", milestone.goal_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["milestone-analytics", milestone.goal_id],
      });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Milestone created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create milestone");
      console.error("Create milestone error:", error);
    },
  });
}

// Update milestone
export function useUpdateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateMilestoneInput & { id: string }) => {
      if (input.title !== undefined) {
        if (!input.title.trim()) {
          throw new Error("Milestone title is required");
        }
        if (input.title.length > 200) {
          throw new Error("Milestone title must be less than 200 characters");
        }
      }
      if (
        input.target_progress &&
        (input.target_progress < 0 || input.target_progress > 100)
      ) {
        throw new Error("Target progress must be between 0 and 100");
      }

      const updateData: any = {};
      if (input.title !== undefined) updateData.title = input.title.trim();
      if (input.description !== undefined)
        updateData.description = input.description?.trim() || null;
      if (input.target_date !== undefined) {
        updateData.target_date =
          input.target_date?.toISOString().split("T")[0] || null;
      }
      if (input.target_progress !== undefined)
        updateData.progress_percentage = input.target_progress;
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.estimated_hours !== undefined)
        updateData.estimated_hours = input.estimated_hours;
      if (input.tags !== undefined) updateData.tags = input.tags;
      if (input.metadata !== undefined) updateData.metadata = input.metadata;

      const { data, error } = await supabase
        .from("goal_milestones")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update dependencies if provided
      if (input.depends_on !== undefined) {
        await supabase
          .from("goal_milestone_dependencies")
          .delete()
          .eq("milestone_id", id);

        if (input.depends_on.length > 0) {
          const dependencies = input.depends_on.map((dependsOnId) => ({
            milestone_id: id,
            depends_on_id: dependsOnId,
          }));

          const { error: depError } = await supabase
            .from("goal_milestone_dependencies")
            .insert(dependencies);

          if (depError) throw depError;
        }
      }

      return data as GoalMilestone;
    },
    onSuccess: (milestone) => {
      queryClient.invalidateQueries({
        queryKey: ["goal-milestones", milestone.goal_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["milestone-analytics", milestone.goal_id],
      });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Milestone updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update milestone");
      console.error("Update milestone error:", error);
    },
  });
}

// Complete milestone with enhanced workflow
export function useCompleteMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      milestoneId,
      notes,
      actualHours,
    }: {
      milestoneId: string;
      notes?: string;
      actualHours?: number;
    }) => {
      const { data, error } = await supabase.rpc(
        "complete_milestone_enhanced",
        {
          milestone_id: milestoneId,
          completion_notes: notes || null,
          actual_hours: actualHours || null,
        },
      );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal-milestones"] });
      queryClient.invalidateQueries({ queryKey: ["milestone-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-progress-analytics"] });
      toast.success("Milestone completed!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to complete milestone");
      console.error("Complete milestone error:", error);
    },
  });
}

// Delete a milestone
export function useDeleteMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("goal_milestones")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal-milestones"] });
      queryClient.invalidateQueries({ queryKey: ["milestone-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Milestone deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete milestone");
      console.error("Delete milestone error:", error);
    },
  });
}

// Bulk milestone operations
export function useBulkMilestoneOperations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      operation,
      milestoneIds,
      data,
    }: {
      operation: "complete" | "delete" | "update";
      milestoneIds: string[];
      data?: any;
    }) => {
      const { data: result, error } = await supabase.rpc(
        "bulk_milestone_operations",
        {
          operation_type: operation,
          milestone_ids: milestoneIds,
          operation_data: data || null,
        },
      );

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goal-milestones"] });
      queryClient.invalidateQueries({ queryKey: ["milestone-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success(
        `Bulk ${variables.operation} completed for ${variables.milestoneIds.length} milestones`,
      );
    },
    onError: (error: any) => {
      toast.error(error.message || "Bulk operation failed");
      console.error("Bulk milestone operation error:", error);
    },
  });
}

// Milestone templates
export function useMilestoneTemplates() {
  return useQuery({
    queryKey: ["milestone-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milestone_templates")
        .select("*")
        .order("name");

      if (error) throw error;
      return (data || []) as any as MilestoneTemplate[];
    },
  });
}

// Apply milestone template
export function useApplyMilestoneTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      goalId,
      templateId,
      startDate,
    }: {
      goalId: string;
      templateId: string;
      startDate?: Date;
    }) => {
      const { data, error } = await supabase.rpc("apply_milestone_template", {
        goal_id: goalId,
        template_id: templateId,
        start_date: startDate?.toISOString().split("T")[0] || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["goal-milestones", variables.goalId],
      });
      queryClient.invalidateQueries({
        queryKey: ["milestone-analytics", variables.goalId],
      });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Milestone template applied successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to apply template");
      console.error("Apply template error:", error);
    },
  });
}
