import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getRepositoryManager } from "@/services/repositories/RepositoryFactory";
import { Task, TaskInsert, TaskUpdate, TaskFilters } from "@/services/repositories/interfaces/ITaskRepository";

/**
 * Task Service Hook
 * Provides a clean API for task operations using the repository pattern
 * This replaces direct Supabase calls with repository abstraction
 */
export function useTaskService() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const repositoryManager = getRepositoryManager(supabase);
  const taskRepository = repositoryManager.getTaskRepository();

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const unsubscribe = taskRepository.subscribeToChanges(
      { user_id: user.id },
      () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
    );

    return unsubscribe;
  }, [user, taskRepository, queryClient]);

  // Get all tasks for user
  const useUserTasks = (filters?: TaskFilters) => {
    return useQuery({
      queryKey: ["tasks", user?.id, filters],
      queryFn: async () => {
        if (!user) throw new Error("User not authenticated");

        if (filters) {
          return await taskRepository.searchTasks(user.id, "", filters);
        }
        return await taskRepository.findByUserId(user.id);
      },
      enabled: !!user,
    });
  };

  // Get single task
  const useTask = (taskId: string | undefined) => {
    return useQuery({
      queryKey: ["task", taskId],
      queryFn: async () => {
        if (!taskId || !user) throw new Error("Task ID and user required");
        return await taskRepository.findUserItemById(user.id, taskId);
      },
      enabled: !!taskId && !!user,
    });
  };

  // Get task statistics
  const useTaskStats = () => {
    return useQuery({
      queryKey: ["task-stats", user?.id],
      queryFn: async () => {
        if (!user) throw new Error("User not authenticated");
        return await taskRepository.getTaskStats(user.id);
      },
      enabled: !!user,
    });
  };

  // Search tasks
  const useSearchTasks = (query: string, filters?: TaskFilters) => {
    return useQuery({
      queryKey: ["search-tasks", user?.id, query, filters],
      queryFn: async () => {
        if (!user) throw new Error("User not authenticated");
        return await taskRepository.searchTasks(user.id, query, filters);
      },
      enabled: !!user && query.trim().length > 0,
    });
  };

  // Create task mutation
  const useCreateTask = () => {
    return useMutation({
      mutationFn: async (data: Omit<TaskInsert, 'user_id'>) => {
        if (!user) throw new Error("User not authenticated");
        return await taskRepository.createForUser(user.id, data);
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        toast.success("Task created successfully");
      },
      onError: (error) => {
        toast.error(`Failed to create task: ${error.message}`);
      },
    });
  };

  // Update task mutation
  const useUpdateTask = () => {
    return useMutation({
      mutationFn: async ({ taskId, data }: { taskId: string; data: TaskUpdate }) => {
        if (!user) throw new Error("User not authenticated");
        return await taskRepository.updateUserItem(user.id, taskId, data);
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["task", data.id] });
        toast.success("Task updated successfully");
      },
      onError: (error) => {
        toast.error(`Failed to update task: ${error.message}`);
      },
    });
  };

  // Delete task mutation
  const useDeleteTask = () => {
    return useMutation({
      mutationFn: async (taskId: string) => {
        if (!user) throw new Error("User not authenticated");
        await taskRepository.deleteUserItem(user.id, taskId);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        toast.success("Task deleted successfully");
      },
      onError: (error) => {
        toast.error(`Failed to delete task: ${error.message}`);
      },
    });
  };

  // Complete task mutation
  const useCompleteTask = () => {
    return useMutation({
      mutationFn: async (taskId: string) => {
        if (!user) throw new Error("User not authenticated");
        return await taskRepository.markAsCompleted(user.id, taskId);
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["task", data.id] });
        toast.success("Task completed!");
      },
      onError: (error) => {
        toast.error(`Failed to complete task: ${error.message}`);
      },
    });
  };

  // Assign task mutation
  const useAssignTask = () => {
    return useMutation({
      mutationFn: async ({ taskId, assigneeId }: { taskId: string; assigneeId: string }) => {
        if (!user) throw new Error("User not authenticated");
        return await taskRepository.assignTask(user.id, taskId, assigneeId);
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["task", data.id] });
        toast.success("Task assigned successfully");
      },
      onError: (error) => {
        toast.error(`Failed to assign task: ${error.message}`);
      },
    });
  };

  // Update task positions (for drag & drop)
  const useUpdateTaskPositions = () => {
    return useMutation({
      mutationFn: async (taskUpdates: Array<{ id: string; position: number }>) => {
        if (!user) throw new Error("User not authenticated");
        await taskRepository.updateTaskPositions(user.id, taskUpdates);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      },
      onError: (error) => {
        toast.error(`Failed to update task positions: ${error.message}`);
      },
    });
  };

  return {
    // Queries
    useUserTasks,
    useTask,
    useTaskStats,
    useSearchTasks,

    // Mutations
    useCreateTask,
    useUpdateTask,
    useDeleteTask,
    useCompleteTask,
    useAssignTask,
    useUpdateTaskPositions,
  };
}