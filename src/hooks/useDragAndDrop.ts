import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskStatus = Database["public"]["Enums"]["task_status"];

interface TaskUpdate {
  id: string;
  position: number;
  status?: TaskStatus;
}

interface MoveTaskParams {
  taskId: string;
  newStatus: TaskStatus;
  newPosition: number;
}

interface ReorderParams {
  workspaceId: string;
  status: TaskStatus;
  taskIds: string[];
}

export function useUpdateTaskPositions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: TaskUpdate[]) => {
      const { error } = await supabase.rpc("update_task_positions", {
        task_updates: updates.map((u) => ({
          id: u.id,
          position: u.position,
          ...(u.status && { status: u.status }),
        })),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update positions",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useReorderTasksInStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workspaceId, status, taskIds }: ReorderParams) => {
      const { error } = await supabase.rpc("reorder_tasks_in_status", {
        workspace_id_param: workspaceId,
        status_param: status,
        task_ids: taskIds,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to reorder tasks",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useMoveTaskToStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, newStatus, newPosition }: MoveTaskParams) => {
      const { error } = await supabase.rpc("move_task_to_status", {
        task_id_param: taskId,
        new_status: newStatus,
        new_position: newPosition,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Task moved",
        description: "Task status and position updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to move task",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Helper function to calculate new position
export function calculateNewPosition(
  activeIndex: number,
  overIndex: number,
  tasks: Task[],
): number {
  if (overIndex >= tasks.length) {
    return tasks[tasks.length - 1]?.position + 1 || 0;
  }

  if (overIndex === 0) {
    return tasks[0]?.position - 1 || 0;
  }

  // Insert between tasks
  const prevPosition = tasks[overIndex - 1]?.position || 0;
  const nextPosition = tasks[overIndex]?.position || prevPosition + 2;

  return Math.floor((prevPosition + nextPosition) / 2);
}

// Recalculate positions to avoid conflicts
export function recalculatePositions(tasks: Task[]): TaskUpdate[] {
  return tasks.map((task, index) => ({
    id: task.id,
    position: index * 100, // Use increments of 100 to allow easy insertions
  }));
}
