import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type {
  ReflectionTemplate,
  CreateReflectionTemplateInput,
  UpdateReflectionTemplateInput,
  TemplateCategory,
  CreateReflectionInput,
  TemplatePrompt,
  TemplateStructure,
} from "@/types/reflections";

const TEMPLATES_QUERY_KEY = "reflection-templates";

/**
 * Hook to fetch reflection templates
 */
export function useReflectionTemplates(
  category?: TemplateCategory,
  includeSystem: boolean = true
) {
  return useQuery({
    queryKey: [TEMPLATES_QUERY_KEY, category, includeSystem],
    queryFn: async () => {
      const user = await supabase.auth.getUser();
      
      let query = supabase
        .from('reflection_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      // Filter by category
      if (category) {
        query = query.eq('category', category);
      }

      // Filter by visibility
      if (includeSystem) {
        query = query.or(`is_system.eq.true,created_by.eq.${user.data.user?.id},is_public.eq.true`);
      } else {
        query = query.eq('created_by', user.data.user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data.map(t => ({
        ...t,
        prompts: t.prompts as any as TemplatePrompt[],
        structure: t.structure as any as TemplateStructure,
        metadata: t.metadata as Record<string, any>,
      })) as ReflectionTemplate[];
    },
  });
}

/**
 * Hook to fetch a single template
 */
export function useReflectionTemplate(templateId: string) {
  return useQuery({
    queryKey: [TEMPLATES_QUERY_KEY, templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reflection_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      return {
        ...data,
        prompts: data.prompts as any as TemplatePrompt[],
        structure: data.structure as any as TemplateStructure,
        metadata: data.metadata as Record<string, any>,
      } as ReflectionTemplate;
    },
    enabled: !!templateId,
  });
}

/**
 * Hook to create a reflection from a template
 */
export function useCreateReflectionFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      workspaceId,
      reflectionDate,
      customizations,
    }: {
      templateId: string;
      workspaceId: string;
      reflectionDate: string;
      customizations?: Partial<CreateReflectionInput>;
    }) => {
      // Fetch template
      const { data: template, error: templateError } = await supabase
        .from('reflection_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      // Create reflection based on template
      const user = await supabase.auth.getUser();
      const templateMetadata = typeof template.metadata === 'object' && template.metadata !== null 
        ? template.metadata as Record<string, any>
        : {};
        
      const reflectionInput: CreateReflectionInput = {
        workspace_id: workspaceId,
        title: customizations?.title || template.name,
        content: customizations?.content || '',
        reflection_type: customizations?.reflection_type || 'custom',
        reflection_date: reflectionDate,
        is_private: customizations?.is_private ?? true,
        tags: customizations?.tags || [],
        metadata: {
          ...templateMetadata,
          template_id: templateId,
          ...customizations?.metadata,
        },
        ...customizations,
      };

      const { data, error } = await supabase
        .from('reflections')
        .insert({
          ...reflectionInput,
          created_by: user.data.user!.id,
          gratitude_items: reflectionInput.gratitude_items || [],
          challenges: reflectionInput.challenges || [],
          wins: reflectionInput.wins || [],
          learnings: reflectionInput.learnings || [],
          tomorrow_focus: reflectionInput.tomorrow_focus || [],
        })
        .select()
        .single();

      if (error) throw error;

      // Increment template usage count
      await supabase
        .from('reflection_templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', templateId);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reflections', data.workspace_id] });
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
      toast.success("Reflection created from template");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create reflection from template: ${error.message}`);
    },
  });
}

/**
 * Hook to create a new template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReflectionTemplateInput) => {
      const user = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('reflection_templates')
        .insert({
          name: input.name,
          description: input.description,
          category: input.category,
          prompts: input.prompts as any,
          structure: input.structure as any,
          is_public: input.is_public || false,
          is_system: false,
          created_by: user.data.user?.id,
          metadata: input.metadata || {},
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        prompts: data.prompts as any as TemplatePrompt[],
        structure: data.structure as any as TemplateStructure,
        metadata: data.metadata as Record<string, any>,
      } as ReflectionTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
      toast.success("Template created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });
}

/**
 * Hook to update a template
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateReflectionTemplateInput;
    }) => {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.category) updateData.category = updates.category;
      if (updates.prompts) updateData.prompts = updates.prompts as any;
      if (updates.structure) updateData.structure = updates.structure as any;
      if (updates.is_public !== undefined) updateData.is_public = updates.is_public;
      if (updates.metadata) updateData.metadata = updates.metadata;

      const { data, error } = await supabase
        .from('reflection_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        prompts: data.prompts as any as TemplatePrompt[],
        structure: data.structure as any as TemplateStructure,
        metadata: data.metadata as Record<string, any>,
      } as ReflectionTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
      toast.success("Template updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reflection_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
      toast.success("Template deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });
}

/**
 * Hook to rate a template
 */
export function useTemplateRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateId, rating }: { templateId: string; rating: number }) => {
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Fetch current template to calculate new average
      const { data: template, error: fetchError } = await supabase
        .from('reflection_templates')
        .select('rating, usage_count')
        .eq('id', templateId)
        .single();

      if (fetchError) throw fetchError;

      // Calculate new average rating
      const currentRating = template.rating || 0;
      const usageCount = template.usage_count || 1;
      const newRating = ((currentRating * usageCount) + rating) / (usageCount + 1);

      const { error } = await supabase
        .from('reflection_templates')
        .update({ rating: newRating })
        .eq('id', templateId);

      if (error) throw error;
      return { templateId, newRating };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
      toast.success("Template rated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to rate template: ${error.message}`);
    },
  });
}
