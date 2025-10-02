import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type TaskTemplate = Database['public']['Tables']['task_templates']['Row'];
type TaskTemplateInsert = Database['public']['Tables']['task_templates']['Insert'];
type TaskTemplateUpdate = Database['public']['Tables']['task_templates']['Update'];

export interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  default_value?: string;
  options?: string[];
}

export interface SubtaskTemplate {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface TemplateConfig {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  estimated_duration?: number;
  due_date_offset?: number;
  due_time?: string;
  subtasks?: SubtaskTemplate[];
}

// Fetch all templates for user's workspaces
export const useTaskTemplates = (category?: string) => {
  return useQuery({
    queryKey: ['task-templates', category],
    queryFn: async () => {
      let query = supabase
        .from('task_templates')
        .select('*')
        .order('usage_count', { ascending: false })
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TaskTemplate[];
    },
  });
};

// Fetch single template by ID
export const useTaskTemplate = (id: string | undefined) => {
  return useQuery({
    queryKey: ['task-template', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as TaskTemplate;
    },
    enabled: !!id,
  });
};

// Get unique template categories
export const useTemplateCategories = () => {
  return useQuery({
    queryKey: ['template-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_templates')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;

      const categories = [...new Set(data.map(item => item.category).filter(Boolean))];
      return categories as string[];
    },
  });
};

// Create new template
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      category,
      config,
      variables,
      isPublic,
    }: {
      name: string;
      description?: string;
      category?: string;
      config: TemplateConfig;
      variables?: TemplateVariable[];
      isPublic?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's default workspace
      const { data: workspace } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!workspace) throw new Error('No workspace found');

      const { data, error } = await supabase
        .from('task_templates')
        .insert({
          name,
          description,
          category,
          template_config: config as any,
          variables: variables as any,
          is_public: isPublic || false,
          workspace_id: workspace.workspace_id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Template created successfully');
      queryClient.invalidateQueries({ queryKey: ['task-templates'] });
      queryClient.invalidateQueries({ queryKey: ['template-categories'] });
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    },
  });
};

// Update existing template
export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<{
        name: string;
        description: string;
        category: string;
        config: TemplateConfig;
        variables: TemplateVariable[];
        isPublic: boolean;
      }>;
    }) => {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.config !== undefined) updateData.template_config = updates.config;
      if (updates.variables !== undefined) updateData.variables = updates.variables;
      if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;

      const { data, error } = await supabase
        .from('task_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success('Template updated successfully');
      queryClient.invalidateQueries({ queryKey: ['task-templates'] });
      queryClient.invalidateQueries({ queryKey: ['task-template', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['template-categories'] });
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    },
  });
};

// Delete template
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('task_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Template deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['task-templates'] });
      queryClient.invalidateQueries({ queryKey: ['template-categories'] });
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    },
  });
};

// Create task from template
export const useCreateTaskFromTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      variables,
    }: {
      templateId: string;
      variables?: Record<string, string>;
    }) => {
      const { data, error } = await supabase.rpc('create_task_from_template', {
        template_id: templateId,
        variable_values: variables || {},
      });

      if (error) throw error;
      return data as string; // Returns new task ID
    },
    onSuccess: () => {
      toast.success('Task created from template');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-templates'] }); // Refresh for updated usage count
    },
    onError: (error) => {
      console.error('Error creating task from template:', error);
      toast.error('Failed to create task from template');
    },
  });
};

// Save existing task as template
export const useSaveTaskAsTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      name,
      description,
      category,
    }: {
      taskId: string;
      name: string;
      description?: string;
      category?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the task
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;

      // Build template config from task
      const config: TemplateConfig = {
        title: task.title,
        description: task.description || undefined,
        priority: task.priority as any,
        tags: task.tags || [],
        estimated_duration: task.estimated_duration || undefined,
      };

      // Create template
      const { data, error } = await supabase
        .from('task_templates')
        .insert({
          name,
          description,
          category,
          template_config: config as any,
          workspace_id: task.workspace_id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Task saved as template');
      queryClient.invalidateQueries({ queryKey: ['task-templates'] });
      queryClient.invalidateQueries({ queryKey: ['template-categories'] });
    },
    onError: (error) => {
      console.error('Error saving task as template:', error);
      toast.error('Failed to save task as template');
    },
  });
};
