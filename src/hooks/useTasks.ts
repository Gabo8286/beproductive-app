import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

// Get user's default workspace
const useDefaultWorkspace = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['default-workspace', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .eq('type', 'personal')
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

// Get all tasks for user's workspace
export const useTasks = () => {
  const { user } = useAuth();
  const { data: workspace } = useDefaultWorkspace();

  return useQuery({
    queryKey: ['tasks', workspace?.id],
    queryFn: async () => {
      if (!workspace) throw new Error('No workspace found');

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name, avatar_url),
          created_by_profile:profiles!tasks_created_by_fkey(full_name, avatar_url)
        `)
        .eq('workspace_id', workspace.id)
        .order('position', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (Task & {
        assigned_to_profile?: { full_name: string | null; avatar_url: string | null };
        created_by_profile?: { full_name: string | null; avatar_url: string | null };
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
    mutationFn: async (taskData: Omit<TaskInsert, 'workspace_id' | 'created_by'>) => {
      if (!user || !workspace) throw new Error('User or workspace not found');

      const { data, error } = await supabase
        .from('tasks')
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
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
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
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully');
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
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });
};

// Toggle task completion
export const useToggleTaskCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Task) => {
      const newStatus = task.status === 'done' ? 'todo' : 'done';
      const updateData: TaskUpdate = {
        status: newStatus,
        completed_at: newStatus === 'done' ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });
};
