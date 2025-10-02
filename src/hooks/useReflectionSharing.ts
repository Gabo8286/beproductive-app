import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ReflectionShare, ShareType } from "@/types/reflections";

const SHARES_QUERY_KEY = "reflection-shares";

/**
 * Hook to fetch shares for a reflection
 */
export function useReflectionShares(reflectionId: string) {
  return useQuery({
    queryKey: [SHARES_QUERY_KEY, reflectionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reflection_shares')
        .select('*')
        .eq('reflection_id', reflectionId);

      if (error) throw error;
      return data as ReflectionShare[];
    },
    enabled: !!reflectionId,
  });
}

/**
 * Hook to fetch reflections shared with the current user
 */
export function useSharedReflections(workspaceId?: string) {
  return useQuery({
    queryKey: ['shared-reflections', workspaceId],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      let query = supabase
        .from('reflection_shares')
        .select(`
          *,
          reflection:reflections(*)
        `)
        .or(`shared_with_user_id.eq.${user.user.id},shared_with_workspace.eq.true`)
        .or('expires_at.is.null,expires_at.gt.now()');

      const { data, error } = await query;

      if (error) throw error;

      // Filter by workspace if provided
      if (workspaceId) {
        return data.filter((share: any) => 
          share.reflection?.workspace_id === workspaceId
        );
      }

      return data;
    },
  });
}

/**
 * Hook to create a new share
 */
export function useCreateReflectionShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      reflection_id: string;
      shared_with_user_id?: string;
      shared_with_workspace?: boolean;
      share_type: ShareType;
      expires_at?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Verify user owns the reflection
      const { data: reflection, error: reflectionError } = await supabase
        .from('reflections')
        .select('created_by, is_private')
        .eq('id', input.reflection_id)
        .single();

      if (reflectionError) throw reflectionError;

      if (reflection.created_by !== user.user.id) {
        throw new Error('You can only share your own reflections');
      }

      if (reflection.is_private && input.shared_with_workspace) {
        throw new Error('Cannot share private reflection with workspace');
      }

      const { data, error } = await supabase
        .from('reflection_shares')
        .insert({
          reflection_id: input.reflection_id,
          shared_with_user_id: input.shared_with_user_id,
          shared_with_workspace: input.shared_with_workspace || false,
          share_type: input.share_type,
          shared_by: user.user.id,
          expires_at: input.expires_at,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ReflectionShare;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SHARES_QUERY_KEY, data.reflection_id] });
      queryClient.invalidateQueries({ queryKey: ['shared-reflections'] });
      toast.success("Reflection shared successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to share reflection: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a share
 */
export function useDeleteReflectionShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shareId: string) => {
      const { error } = await supabase
        .from('reflection_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;
      return shareId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHARES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['shared-reflections'] });
      toast.success("Share removed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove share: ${error.message}`);
    },
  });
}

/**
 * Hook to check if current user can view a reflection
 */
export function useCanViewReflection(reflectionId: string) {
  return useQuery({
    queryKey: ['can-view-reflection', reflectionId],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      // Check if user owns the reflection
      const { data: reflection, error: reflectionError } = await supabase
        .from('reflections')
        .select('created_by, is_private, workspace_id')
        .eq('id', reflectionId)
        .single();

      if (reflectionError) throw reflectionError;

      // Owner can always view
      if (reflection.created_by === user.user.id) return true;

      // If not private, workspace members can view
      if (!reflection.is_private) {
        const { data: membership } = await supabase
          .from('workspace_members')
          .select('id')
          .eq('workspace_id', reflection.workspace_id)
          .eq('user_id', user.user.id)
          .single();

        if (membership) return true;
      }

      // Check if shared with user
      const { data: share } = await supabase
        .from('reflection_shares')
        .select('id')
        .eq('reflection_id', reflectionId)
        .or(`shared_with_user_id.eq.${user.user.id},shared_with_workspace.eq.true`)
        .or('expires_at.is.null,expires_at.gt.now()')
        .maybeSingle();

      return !!share;
    },
    enabled: !!reflectionId,
  });
}
