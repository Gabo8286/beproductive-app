import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { useDefaultWorkspace } from '@/hooks/useTasks';
import { toast } from 'sonner';

type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskStatus = Database['public']['Enums']['task_status'];
type TaskPriority = Database['public']['Enums']['task_priority'];

export interface QuickTaskDefaults {
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
  workspace_id?: string;
}

export interface TaskTemplate {
  name: string;
  title: string;
  priority?: TaskPriority;
  tags?: string[];
  description?: string;
}

// Smart context detection hook
export const useTaskCreationContext = (overrides?: QuickTaskDefaults) => {
  const { data: workspace } = useDefaultWorkspace();
  const { user } = useAuth();

  const getDefaults = (): QuickTaskDefaults => {
    return {
      status: overrides?.status || 'todo',
      priority: overrides?.priority || 'medium',
      tags: overrides?.tags || [],
      workspace_id: overrides?.workspace_id || workspace?.id,
    };
  };

  return {
    defaults: getDefaults(),
    workspace,
    user,
  };
};

// Quick task creation hook (optimized for minimal input)
export const useQuickCreateTask = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: workspace } = useDefaultWorkspace();

  return useMutation({
    mutationFn: async ({ 
      title, 
      defaults 
    }: { 
      title: string; 
      defaults?: QuickTaskDefaults;
    }) => {
      if (!user || !workspace) throw new Error('User or workspace not found');

      const taskData: TaskInsert = {
        title: title.trim(),
        workspace_id: defaults?.workspace_id || workspace.id,
        created_by: user.id,
        status: defaults?.status || 'todo',
        priority: defaults?.priority || 'medium',
        tags: defaults?.tags || [],
        position: 0, // Will be recalculated by backend
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created');
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    },
  });
};

// Batch task creation hook
export const useBatchCreateTasks = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: workspace } = useDefaultWorkspace();

  return useMutation({
    mutationFn: async ({ 
      titles, 
      defaults 
    }: { 
      titles: string[]; 
      defaults?: QuickTaskDefaults;
    }) => {
      if (!user || !workspace) throw new Error('User or workspace not found');

      const tasks: TaskInsert[] = titles.map((title, index) => ({
        title: title.trim(),
        workspace_id: defaults?.workspace_id || workspace.id,
        created_by: user.id,
        status: defaults?.status || 'todo',
        priority: defaults?.priority || 'medium',
        tags: defaults?.tags || [],
        position: index,
      }));

      const { data, error } = await supabase
        .from('tasks')
        .insert(tasks)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(`${data.length} tasks created`);
    },
    onError: (error) => {
      console.error('Error creating tasks:', error);
      toast.error('Failed to create tasks');
    },
  });
};

// Parse multiline input for batch creation
export const parseMultilineInput = (input: string): string[] => {
  return input
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
};

// Common task templates
export const commonTemplates: TaskTemplate[] = [
  { 
    name: 'Meeting', 
    title: 'Meeting: ',
    priority: 'medium',
    tags: ['work', 'meeting'] 
  },
  { 
    name: 'Bug Fix', 
    title: 'Fix: ',
    priority: 'high',
    tags: ['bug'] 
  },
  { 
    name: 'Research', 
    title: 'Research: ',
    priority: 'low',
    tags: ['learning'] 
  },
  { 
    name: 'Review', 
    title: 'Review: ',
    priority: 'medium',
    tags: ['review'] 
  },
  { 
    name: 'Planning', 
    title: 'Plan: ',
    priority: 'medium',
    tags: ['planning'] 
  },
];

// Hook to get task templates (extensible for future user-custom templates)
export const useTaskTemplates = () => {
  return {
    data: commonTemplates,
    isLoading: false,
  };
};
