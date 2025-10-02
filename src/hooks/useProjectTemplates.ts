// Project Templates Hooks
// Data management for project templates

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ProjectTemplate,
  CreateTemplateInput,
  UpdateTemplateInput,
  CreateProjectInput
} from "@/types/projects";
import { useAuth } from "@/contexts/AuthContext";
import { projectKeys } from "./useProjects";

// =====================================================
// QUERY KEYS
// =====================================================

export const templateKeys = {
  all: ['project-templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (category?: string, isPublic?: boolean) =>
    [...templateKeys.lists(), category, isPublic] as const,
  detail: (id: string) => [...templateKeys.all, 'detail', id] as const,
};

// =====================================================
// QUERIES
// =====================================================

/**
 * Get all project templates with optional filtering
 */
export function useProjectTemplates(category?: string, includePublic: boolean = true) {
  const { user } = useAuth();

  return useQuery({
    queryKey: templateKeys.list(category, includePublic),
    queryFn: async () => {
      let query = supabase
        .from('project_templates')
        .select(`
          *,
          created_by_profile:profiles(id, full_name, avatar_url)
        `)
        .order('usage_count', { ascending: false });

      // Filter by category if provided
      if (category) {
        query = query.eq('category', category);
      }

      // Include public templates and user's own templates
      if (includePublic && user?.id) {
        query = query.or(`is_public.eq.true,created_by.eq.${user.id}`);
      } else if (user?.id) {
        query = query.eq('created_by', user.id);
      } else if (includePublic) {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as ProjectTemplate[];
    },
    enabled: !!user || includePublic,
  });
}

/**
 * Get a single project template by ID
 */
export function useProjectTemplate(templateId: string) {
  return useQuery({
    queryKey: templateKeys.detail(templateId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_templates')
        .select(`
          *,
          created_by_profile:profiles(id, full_name, avatar_url)
        `)
        .eq('id', templateId)
        .single();

      if (error) throw error;
      return data as ProjectTemplate;
    },
    enabled: !!templateId,
  });
}

/**
 * Get template categories with counts
 */
export function useTemplateCategories() {
  return useQuery({
    queryKey: [...templateKeys.all, 'categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_templates')
        .select('category')
        .eq('is_public', true);

      if (error) throw error;

      // Count templates by category
      const categoryCounts = (data || []).reduce((acc, template) => {
        const category = template.category || 'general';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count,
        label: category.charAt(0).toUpperCase() + category.slice(1)
      }));
    },
  });
}

// =====================================================
// MUTATIONS
// =====================================================

/**
 * Create a new project template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateTemplateInput) => {
      const templateData = {
        ...input,
        created_by: user?.id,
      };

      const { data, error } = await supabase
        .from('project_templates')
        .insert(templateData)
        .select()
        .single();

      if (error) throw error;
      return data as ProjectTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      toast.success("Template created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create template");
      console.error('Create template error:', error);
    },
  });
}

/**
 * Update an existing project template
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateTemplateInput & { id: string }) => {
      const { data, error } = await supabase
        .from('project_templates')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ProjectTemplate;
    },
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(template.id) });
      toast.success("Template updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update template");
      console.error('Update template error:', error);
    },
  });
}

/**
 * Delete a project template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('project_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      return templateId;
    },
    onSuccess: (templateId) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.removeQueries({ queryKey: templateKeys.detail(templateId) });
      toast.success("Template deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete template");
      console.error('Delete template error:', error);
    },
  });
}

/**
 * Create project from template
 */
export function useCreateProjectFromTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      templateId,
      projectData
    }: {
      templateId: string;
      projectData: Partial<CreateProjectInput>
    }) => {
      // Get template data
      const { data: template, error: templateError } = await supabase
        .from('project_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      // Create project with template data
      const projectInput: CreateProjectInput = {
        workspace_id: projectData.workspace_id!,
        title: projectData.title || template.title,
        description: projectData.description || template.description || '',
        ...template.template_data,
        ...projectData, // Override with provided data
        template_id: templateId,
      };

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          ...projectInput,
          created_by: user?.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create milestones from template
      if (template.default_milestones && template.default_milestones.length > 0) {
        const milestoneData = template.default_milestones.map((milestone, index) => ({
          project_id: project.id,
          title: milestone.title,
          description: milestone.description,
          position: milestone.position || index,
          // Calculate due date based on project start date and estimated days
          due_date: projectData.start_date && milestone.estimated_days
            ? new Date(
                new Date(projectData.start_date).getTime() +
                milestone.estimated_days * 24 * 60 * 60 * 1000
              ).toISOString().split('T')[0]
            : null,
        }));

        const { error: milestonesError } = await supabase
          .from('project_milestones')
          .insert(milestoneData);

        if (milestonesError) {
          console.error('Failed to create milestones:', milestonesError);
          // Don't throw error here as project is already created
        }
      }

      // Create tasks from template
      if (template.default_tasks && template.default_tasks.length > 0) {
        const taskData = template.default_tasks.map((task, index) => ({
          workspace_id: projectData.workspace_id!,
          project_id: project.id,
          title: task.title,
          description: task.description,
          priority: task.priority || 3,
          estimated_hours: task.estimated_hours,
          assigned_to: user?.id,
          position: index,
        }));

        const { error: tasksError } = await supabase
          .from('tasks')
          .insert(taskData);

        if (tasksError) {
          console.error('Failed to create tasks:', tasksError);
          // Don't throw error here as project is already created
        }
      }

      // Increment template usage count
      await supabase
        .from('project_templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', templateId);

      return project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.analytics(project.workspace_id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.dashboard(project.workspace_id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      toast.success("Project created from template successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create project from template");
      console.error('Create project from template error:', error);
    },
  });
}

/**
 * Save project as template
 */
export function useSaveProjectAsTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      projectId,
      templateData
    }: {
      projectId: string;
      templateData: Omit<CreateTemplateInput, 'template_data'>
    }) => {
      // Get project data
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          milestones:project_milestones(title, description, position),
          tasks:tasks(title, description, priority, estimated_hours)
        `)
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Create template data from project
      const template: CreateTemplateInput = {
        ...templateData,
        template_data: {
          estimated_hours: project.estimated_hours,
          default_priority: project.priority,
          default_tags: project.tags,
          default_color: project.color,
          default_icon: project.icon,
        },
        default_milestones: project.milestones?.map((m: any) => ({
          title: m.title,
          description: m.description,
          position: m.position,
        })) || [],
        default_tasks: project.tasks?.map((t: any) => ({
          title: t.title,
          description: t.description,
          priority: t.priority,
          estimated_hours: t.estimated_hours,
        })) || [],
      };

      const { data, error } = await supabase
        .from('project_templates')
        .insert({
          ...template,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ProjectTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      toast.success("Project saved as template successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save project as template");
      console.error('Save project as template error:', error);
    },
  });
}