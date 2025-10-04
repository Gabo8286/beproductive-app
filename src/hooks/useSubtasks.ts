import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"] & {
  assigned_to_profile?: { full_name: string | null; avatar_url: string | null };
  created_by_profile?: { full_name: string | null; avatar_url: string | null };
};

type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

interface SubtaskProgress {
  total: number;
  completed: number;
  percentage: number;
}

// Fetch all direct subtasks of a parent task
export const useSubtasks = (parentId: string | undefined) => {
  return useQuery({
    queryKey: ["subtasks", parentId],
    queryFn: async () => {
      if (!parentId) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name, avatar_url),
          created_by_profile:profiles!tasks_created_by_fkey(full_name, avatar_url)
        `,
        )
        .eq("parent_task_id", parentId)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!parentId,
  });
};

// Fetch complete task hierarchy tree
export const useTaskHierarchy = (taskId: string | undefined) => {
  return useQuery({
    queryKey: ["task-hierarchy", taskId],
    queryFn: async () => {
      if (!taskId) return null;

      // Fetch the root task and all its descendants
      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name, avatar_url),
          created_by_profile:profiles!tasks_created_by_fkey(full_name, avatar_url)
        `,
        )
        .eq("id", taskId)
        .single();

      if (error) throw error;

      // Build hierarchy tree recursively
      const buildTree = async (
        parentTask: Task,
      ): Promise<Task & { subtasks?: Task[] }> => {
        const { data: subtasks } = await supabase
          .from("tasks")
          .select(
            `
            *,
            assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name, avatar_url),
            created_by_profile:profiles!tasks_created_by_fkey(full_name, avatar_url)
          `,
          )
          .eq("parent_task_id", parentTask.id)
          .order("position", { ascending: true });

        if (subtasks && subtasks.length > 0) {
          const subtasksWithChildren = await Promise.all(
            subtasks.map((subtask) => buildTree(subtask as Task)),
          );
          return { ...parentTask, subtasks: subtasksWithChildren };
        }

        return parentTask;
      };

      return buildTree(data as Task);
    },
    enabled: !!taskId,
  });
};

// Get subtask progress for a parent task
export const useSubtaskProgress = (parentId: string | undefined) => {
  return useQuery({
    queryKey: ["subtask-progress", parentId],
    queryFn: async () => {
      if (!parentId) return null;

      const { data, error } = await supabase
        .from("tasks")
        .select("metadata")
        .eq("id", parentId)
        .single();

      if (error) throw error;

      const metadata = data.metadata as any;
      return metadata?.subtask_progress as SubtaskProgress | null;
    },
    enabled: !!parentId,
  });
};

// Create a new subtask under a parent
export const useCreateSubtask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      parentId,
      taskData,
    }: {
      parentId: string;
      taskData: Omit<
        TaskInsert,
        "parent_task_id" | "created_by" | "workspace_id"
      >;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get parent task to inherit workspace
      const { data: parentTask, error: parentError } = await supabase
        .from("tasks")
        .select("workspace_id")
        .eq("id", parentId)
        .single();

      if (parentError) throw parentError;

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...taskData,
          parent_task_id: parentId,
          created_by: user.id,
          workspace_id: parentTask.workspace_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success("Subtask created successfully");
      queryClient.invalidateQueries({
        queryKey: ["subtasks", variables.parentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-hierarchy", variables.parentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["subtask-progress", variables.parentId],
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Error creating subtask:", error);
      toast.error("Failed to create subtask");
    },
  });
};

// Convert a standalone task to a subtask
export const useConvertToSubtask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      parentId,
    }: {
      taskId: string;
      parentId: string;
    }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({ parent_task_id: parentId })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success("Task converted to subtask");
      queryClient.invalidateQueries({
        queryKey: ["subtasks", variables.parentId],
      });
      queryClient.invalidateQueries({ queryKey: ["task-hierarchy"] });
      queryClient.invalidateQueries({
        queryKey: ["subtask-progress", variables.parentId],
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });
    },
    onError: (error) => {
      console.error("Error converting to subtask:", error);
      toast.error("Failed to convert task to subtask");
    },
  });
};

// Promote a subtask to a standalone task
export const usePromoteToParent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId }: { taskId: string }) => {
      // Get current parent before updating
      const { data: currentTask } = await supabase
        .from("tasks")
        .select("parent_task_id")
        .eq("id", taskId)
        .single();

      const { data, error } = await supabase
        .from("tasks")
        .update({ parent_task_id: null })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return { data, oldParentId: currentTask?.parent_task_id };
    },
    onSuccess: (result) => {
      toast.success("Task promoted to parent task");
      if (result.oldParentId) {
        queryClient.invalidateQueries({
          queryKey: ["subtasks", result.oldParentId],
        });
        queryClient.invalidateQueries({
          queryKey: ["subtask-progress", result.oldParentId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["task-hierarchy"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", result.data.id] });
    },
    onError: (error) => {
      console.error("Error promoting task:", error);
      toast.error("Failed to promote task");
    },
  });
};

// Move subtask to different parent
export const useMoveSubtask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      newParentId,
    }: {
      taskId: string;
      newParentId: string | null;
    }) => {
      // Get old parent for cache invalidation
      const { data: currentTask } = await supabase
        .from("tasks")
        .select("parent_task_id")
        .eq("id", taskId)
        .single();

      const { data, error } = await supabase
        .from("tasks")
        .update({ parent_task_id: newParentId })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return { data, oldParentId: currentTask?.parent_task_id };
    },
    onSuccess: (result, variables) => {
      toast.success("Subtask moved successfully");

      // Invalidate old parent caches
      if (result.oldParentId) {
        queryClient.invalidateQueries({
          queryKey: ["subtasks", result.oldParentId],
        });
        queryClient.invalidateQueries({
          queryKey: ["subtask-progress", result.oldParentId],
        });
      }

      // Invalidate new parent caches
      if (variables.newParentId) {
        queryClient.invalidateQueries({
          queryKey: ["subtasks", variables.newParentId],
        });
        queryClient.invalidateQueries({
          queryKey: ["subtask-progress", variables.newParentId],
        });
      }

      queryClient.invalidateQueries({ queryKey: ["task-hierarchy"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Error moving subtask:", error);
      toast.error("Failed to move subtask");
    },
  });
};
