import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useGamification } from "@/hooks/useGamification";
// Removed demo mode dependencies

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

// Get user's default workspace
export const useDefaultWorkspace = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["default-workspace", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("owner_id", user.id)
        .eq("type", "personal")
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

// Get single task by ID
export const useTask = (taskId: string | undefined) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      if (!taskId) throw new Error("Task ID is required");

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
      return data as Task & {
        assigned_to_profile?: {
          full_name: string | null;
          avatar_url: string | null;
        };
        created_by_profile?: {
          full_name: string | null;
          avatar_url: string | null;
        };
      };
    },
    enabled: !!taskId,
  });
};

// Get all tasks for user's workspace
export const useTasks = () => {
  const { user } = useAuth();
  const { data: workspace } = useDefaultWorkspace();

  return useQuery({
    queryKey: ["tasks", workspace?.id],
    queryFn: async () => {
      if (!workspace) throw new Error("No workspace found");

      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name, avatar_url),
          created_by_profile:profiles!tasks_created_by_fkey(full_name, avatar_url)
        `,
        )
        .eq("workspace_id", workspace.id)
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (Task & {
        assigned_to_profile?: {
          full_name: string | null;
          avatar_url: string | null;
        };
        created_by_profile?: {
          full_name: string | null;
          avatar_url: string | null;
        };
      })[];
    },
    enabled: !!workspace,
  });
};

// Create new task
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: workspace } = useDefaultWorkspace();

  return useMutation({
    mutationFn: async (
      taskData: Omit<TaskInsert, "workspace_id" | "created_by">,
    ) => {
      if (!user || !workspace) throw new Error("User or workspace not found");

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...taskData,
          workspace_id: workspace.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });
};

// Update existing task
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: TaskUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });
};

// Delete task
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;
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

// Toggle task completion
export const useToggleTaskCompletion = () => {
  const queryClient = useQueryClient();
  const { awardPoints } = useGamification();

  return useMutation({
    mutationFn: async (task: Task) => {
      const newStatus = task.status === "done" ? "todo" : "done";
      const updateData: TaskUpdate = {
        status: newStatus,
        completed_at: newStatus === "done" ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", task.id)
        .select()
        .single();

      if (error) throw error;

      // Award points for task completion
      if (newStatus === "done") {
        try {
          await awardPoints("TASK_COMPLETED", task.id);
        } catch (pointsError) {
          console.error(
            "Failed to award points for task completion:",
            pointsError,
          );
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });
};

// Sorting and grouping functionality
type SortBy = "created_at" | "due_date" | "priority" | "status" | "title";
type SortOrder = "asc" | "desc";
type GroupBy = "none" | "status" | "priority" | "due_date";

export const useSortedTasks = () => {
  const sortTasks = (tasks: Task[], sortBy: SortBy, sortOrder: SortOrder) => {
    return [...tasks].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "created_at":
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case "due_date":
          aValue = a.due_date ? new Date(a.due_date) : new Date("9999-12-31");
          bValue = b.due_date ? new Date(b.due_date) : new Date("9999-12-31");
          break;
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case "status":
          const statusOrder = { todo: 1, in_progress: 2, blocked: 3, done: 4 };
          aValue = statusOrder[a.status as keyof typeof statusOrder] || 0;
          bValue = statusOrder[b.status as keyof typeof statusOrder] || 0;
          break;
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  const groupTasks = (tasks: Task[], groupBy: GroupBy) => {
    if (groupBy === "none") return { "All Tasks": tasks };

    return tasks.reduce((groups: Record<string, Task[]>, task) => {
      let groupKey: string;

      switch (groupBy) {
        case "status":
          groupKey =
            task.status === "in_progress"
              ? "In Progress"
              : task.status.charAt(0).toUpperCase() + task.status.slice(1);
          break;
        case "priority":
          groupKey =
            task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
          break;
        case "due_date":
          if (!task.due_date) {
            groupKey = "No Due Date";
          } else {
            const due = new Date(task.due_date);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            if (due.toDateString() === today.toDateString()) {
              groupKey = "Due Today";
            } else if (due.toDateString() === tomorrow.toDateString()) {
              groupKey = "Due Tomorrow";
            } else if (due < today) {
              groupKey = "Overdue";
            } else {
              groupKey = "Future";
            }
          }
          break;
        default:
          groupKey = "All Tasks";
      }

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(task);
      return groups;
    }, {});
  };

  return { sortTasks, groupTasks };
};
