import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface TeamTask {
  id: string;
  workspace_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  estimated_duration?: number;
  actual_duration?: number;
  assigned_to?: string;
  created_by: string;
  parent_task_id?: string;
  tags: string[];
  position: number;
  completed_at?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  assigned_user?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
  creator?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
  subtasks?: TeamTask[];
  comments_count?: number;
  watchers?: TaskWatcher[];
}

export interface TaskWatcher {
  id: string;
  task_id: string;
  user_id: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface CreateTaskData {
  workspace_id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  estimated_duration?: number;
  assigned_to?: string;
  parent_task_id?: string;
  tags?: string[];
  goal_id?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'blocked' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  estimated_duration?: number;
  actual_duration?: number;
  assigned_to?: string;
  tags?: string[];
  position?: number;
}

export const useTeamTasks = (workspaceId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get tasks for workspace
  const {
    data: tasks = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['team-tasks', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:profiles!assigned_to(id, email, full_name, avatar_url),
          creator:profiles!created_by(id, email, full_name, avatar_url),
          watchers:task_watchers(
            id,
            user_id,
            created_at,
            user:profiles(id, email, full_name, avatar_url)
          )
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group tasks by parent relationships
      const tasksMap = new Map();
      const rootTasks: TeamTask[] = [];

      data.forEach((task: any) => {
        const processedTask = {
          ...task,
          subtasks: [],
          comments_count: 0 // Will be populated separately if needed
        };
        tasksMap.set(task.id, processedTask);

        if (!task.parent_task_id) {
          rootTasks.push(processedTask);
        }
      });

      // Build subtask relationships
      data.forEach((task: any) => {
        if (task.parent_task_id) {
          const parentTask = tasksMap.get(task.parent_task_id);
          if (parentTask) {
            parentTask.subtasks.push(tasksMap.get(task.id));
          }
        }
      });

      return rootTasks;
    },
    enabled: !!workspaceId
  });

  // Create task
  const createTask = useMutation({
    mutationFn: async (data: CreateTaskData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const taskData = {
        workspace_id: data.workspace_id,
        title: data.title,
        description: data.description,
        status: 'todo' as const,
        priority: data.priority,
        due_date: data.due_date,
        estimated_duration: data.estimated_duration,
        assigned_to: data.assigned_to,
        created_by: user.id,
        parent_task_id: data.parent_task_id,
        tags: data.tags || [],
        position: 0,
        metadata: {
          goal_id: data.goal_id
        }
      };

      const { data: task, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select(`
          *,
          assigned_user:profiles!assigned_to(id, email, full_name, avatar_url),
          creator:profiles!created_by(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Add creator as watcher
      await supabase
        .from('task_watchers')
        .insert({
          task_id: task.id,
          user_id: user.id
        });

      // Add assignee as watcher if different from creator
      if (data.assigned_to && data.assigned_to !== user.id) {
        await supabase
          .from('task_watchers')
          .insert({
            task_id: task.id,
            user_id: data.assigned_to
          });
      }

      // Log activity
      await supabase
        .from('team_activities')
        .insert({
          workspace_id: data.workspace_id,
          user_id: user.id,
          activity_type: 'task_created',
          title: 'Task created',
          related_task_id: task.id,
          metadata: {
            task_title: data.title,
            assigned_to: data.assigned_to
          }
        });

      // Create notification for assignee
      if (data.assigned_to && data.assigned_to !== user.id) {
        await supabase
          .from('team_notifications')
          .insert({
            user_id: data.assigned_to,
            workspace_id: data.workspace_id,
            notification_type: 'task_assigned',
            title: 'New task assigned',
            message: `You've been assigned the task: ${data.title}`,
            related_task_id: task.id
          });
      }

      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-tasks'] });
      toast.success('Task created successfully');
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  });

  // Update task
  const updateTask = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskData }) => {
      const updates: any = { ...data };

      // Handle status changes
      if (data.status === 'done') {
        updates.completed_at = new Date().toISOString();
      } else if (data.status && data.status !== 'done') {
        updates.completed_at = null;
      }

      const { data: task, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          assigned_user:profiles!assigned_to(id, email, full_name, avatar_url),
          creator:profiles!created_by(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Log activity for significant changes
      if (data.status || data.assigned_to !== undefined) {
        await supabase
          .from('team_activities')
          .insert({
            workspace_id: task.workspace_id,
            user_id: user?.id,
            activity_type: data.status === 'done' ? 'task_completed' :
                          data.assigned_to !== undefined ? 'task_assigned' : 'task_updated',
            title: data.status === 'done' ? 'Task completed' :
                   data.assigned_to !== undefined ? 'Task assigned' : 'Task updated',
            related_task_id: id,
            metadata: {
              task_title: task.title,
              status: data.status,
              assigned_to: data.assigned_to
            }
          });
      }

      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-tasks'] });
      toast.success('Task updated successfully');
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  });

  // Assign task
  const assignTask = useMutation({
    mutationFn: async ({ taskId, userId }: { taskId: string; userId: string }) => {
      const { data: task, error } = await supabase.rpc('assign_task', {
        p_task_id: taskId,
        p_assignee_id: userId
      });

      if (error) throw error;
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-tasks'] });
      toast.success('Task assigned successfully');
    },
    onError: (error: any) => {
      console.error('Error assigning task:', error);
      toast.error(error.message || 'Failed to assign task');
    }
  });

  // Delete task
  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  });

  // Add watcher
  const addWatcher = useMutation({
    mutationFn: async ({ taskId, userId }: { taskId: string; userId: string }) => {
      const { error } = await supabase
        .from('task_watchers')
        .insert({
          task_id: taskId,
          user_id: userId
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-tasks'] });
      toast.success('Watcher added successfully');
    },
    onError: (error) => {
      console.error('Error adding watcher:', error);
      toast.error('Failed to add watcher');
    }
  });

  // Remove watcher
  const removeWatcher = useMutation({
    mutationFn: async ({ taskId, userId }: { taskId: string; userId: string }) => {
      const { error } = await supabase
        .from('task_watchers')
        .delete()
        .eq('task_id', taskId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-tasks'] });
      toast.success('Watcher removed successfully');
    },
    onError: (error) => {
      console.error('Error removing watcher:', error);
      toast.error('Failed to remove watcher');
    }
  });

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    assignTask,
    deleteTask,
    addWatcher,
    removeWatcher
  };
};

export const useTaskComments = (taskId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get comments for task
  const {
    data: comments = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_comments')
        .select(`
          *,
          user:profiles(id, email, full_name, avatar_url)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as TaskComment[];
    },
    enabled: !!taskId
  });

  // Add comment
  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('add_task_comment', {
        p_task_id: taskId,
        p_content: content
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      toast.success('Comment added successfully');
    },
    onError: (error: any) => {
      console.error('Error adding comment:', error);
      toast.error(error.message || 'Failed to add comment');
    }
  });

  return {
    comments,
    isLoading,
    error,
    addComment
  };
};