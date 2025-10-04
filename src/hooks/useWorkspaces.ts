import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  type: 'personal' | 'team' | 'organization';
  owner_id: string;
  settings: any;
  created_at: string;
  updated_at: string;
  member_count?: number;
  user_role?: 'owner' | 'admin' | 'member';
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  user?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface CreateWorkspaceData {
  name: string;
  description?: string;
  type: 'personal' | 'team' | 'organization';
}

export interface UpdateWorkspaceData {
  name?: string;
  description?: string;
  settings?: any;
}

export const useWorkspaces = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get all workspaces for current user
  const {
    data: workspaces = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['workspaces', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('workspaces')
        .select(`
          *,
          workspace_members!inner(
            id,
            role,
            joined_at,
            user:profiles(email, full_name, avatar_url)
          )
        `)
        .or(`owner_id.eq.${user.id},workspace_members.user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process the data to include member count and user role
      return data.map((workspace: any) => ({
        ...workspace,
        member_count: workspace.workspace_members?.length || 0,
        user_role: workspace.owner_id === user.id
          ? 'owner'
          : workspace.workspace_members?.find((m: any) => m.user_id === user.id)?.role || 'member'
      }));
    },
    enabled: !!user?.id
  });

  // Create workspace mutation
  const createWorkspace = useMutation({
    mutationFn: async (data: CreateWorkspaceData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: workspace, error } = await supabase
        .from('workspaces')
        .insert({
          ...data,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return workspace;
    },
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success(`Workspace "${workspace.name}" created successfully`);
    },
    onError: (error) => {
      console.error('Error creating workspace:', error);
      toast.error('Failed to create workspace');
    }
  });

  // Update workspace mutation
  const updateWorkspace = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateWorkspaceData }) => {
      const { data: workspace, error } = await supabase
        .from('workspaces')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return workspace;
    },
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', workspace.id] });
      toast.success('Workspace updated successfully');
    },
    onError: (error) => {
      console.error('Error updating workspace:', error);
      toast.error('Failed to update workspace');
    }
  });

  // Delete workspace mutation
  const deleteWorkspace = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting workspace:', error);
      toast.error('Failed to delete workspace');
    }
  });

  return {
    workspaces,
    isLoading,
    error,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace
  };
};

export const useWorkspace = (workspaceId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get specific workspace details
  const {
    data: workspace,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select(`
          *,
          workspace_members(
            id,
            user_id,
            role,
            joined_at,
            user:profiles(id, email, full_name, avatar_url)
          )
        `)
        .eq('id', workspaceId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId
  });

  // Get workspace members
  const {
    data: members = [],
    isLoading: membersLoading
  } = useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          *,
          user:profiles(id, email, full_name, avatar_url)
        `)
        .eq('workspace_id', workspaceId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId
  });

  // Update member role
  const updateMemberRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: 'admin' | 'member' }) => {
      const { error } = await supabase
        .from('workspace_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
      toast.success('Member role updated successfully');
    },
    onError: (error) => {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role');
    }
  });

  // Remove member
  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
      toast.success('Member removed successfully');
    },
    onError: (error) => {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  });

  // Leave workspace (for non-owners)
  const leaveWorkspace = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
      toast.success('Left workspace successfully');
    },
    onError: (error) => {
      console.error('Error leaving workspace:', error);
      toast.error('Failed to leave workspace');
    }
  });

  const userRole = workspace?.owner_id === user?.id
    ? 'owner'
    : members.find(m => m.user_id === user?.id)?.role || 'member';

  const canManageMembers = userRole === 'owner' || userRole === 'admin';
  const canEditWorkspace = userRole === 'owner';

  return {
    workspace,
    members,
    isLoading: isLoading || membersLoading,
    error,
    userRole,
    canManageMembers,
    canEditWorkspace,
    updateMemberRole,
    removeMember,
    leaveWorkspace
  };
};