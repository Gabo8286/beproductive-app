import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface TeamInvitation {
  id: string;
  workspace_id: string;
  email: string;
  invited_by: string;
  role: 'member' | 'admin' | 'owner';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  token: string;
  expires_at: string;
  accepted_at?: string;
  declined_at?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  workspace?: {
    name: string;
    description?: string;
  };
  inviter?: {
    full_name?: string;
    email: string;
  };
}

export interface InviteTeamMemberData {
  workspaceId: string;
  email: string;
  role: 'member' | 'admin';
}

export const useTeamInvitations = (workspaceId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get invitations for a workspace
  const {
    data: invitations = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['team-invitations', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];

      const { data, error } = await supabase
        .from('team_invitations')
        .select(`
          *,
          workspace:workspaces(name, description),
          inviter:profiles!invited_by(full_name, email)
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId
  });

  // Get invitations for current user (across all workspaces)
  const {
    data: userInvitations = [],
    isLoading: userInvitationsLoading
  } = useQuery({
    queryKey: ['user-invitations', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];

      const { data, error } = await supabase
        .from('team_invitations')
        .select(`
          *,
          workspace:workspaces(name, description),
          inviter:profiles!invited_by(full_name, email)
        `)
        .eq('email', user.email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.email
  });

  // Invite team member
  const inviteTeamMember = useMutation({
    mutationFn: async ({ workspaceId, email, role }: InviteTeamMemberData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Call the database function to create invitation
      const { data, error } = await supabase.rpc('invite_team_member', {
        p_workspace_id: workspaceId,
        p_email: email,
        p_role: role
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations', workspaceId] });
      toast.success('Team member invited successfully');
    },
    onError: (error: any) => {
      console.error('Error inviting team member:', error);
      toast.error(error.message || 'Failed to invite team member');
    }
  });

  // Accept invitation
  const acceptInvitation = useMutation({
    mutationFn: async (token: string) => {
      const { error } = await supabase.rpc('accept_team_invitation', {
        p_token: token
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Invitation accepted successfully');
    },
    onError: (error: any) => {
      console.error('Error accepting invitation:', error);
      toast.error(error.message || 'Failed to accept invitation');
    }
  });

  // Decline invitation
  const declineInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('team_invitations')
        .update({
          status: 'declined',
          declined_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['team-invitations', workspaceId] });
      toast.success('Invitation declined');
    },
    onError: (error) => {
      console.error('Error declining invitation:', error);
      toast.error('Failed to decline invitation');
    }
  });

  // Cancel invitation (for workspace admins)
  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('team_invitations')
        .update({
          status: 'expired'
        })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations', workspaceId] });
      toast.success('Invitation cancelled');
    },
    onError: (error) => {
      console.error('Error cancelling invitation:', error);
      toast.error('Failed to cancel invitation');
    }
  });

  // Resend invitation
  const resendInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      // Update expiry date to extend invitation
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 7);

      const { error } = await supabase
        .from('team_invitations')
        .update({
          expires_at: newExpiryDate.toISOString(),
          status: 'pending'
        })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations', workspaceId] });
      toast.success('Invitation resent');
    },
    onError: (error) => {
      console.error('Error resending invitation:', error);
      toast.error('Failed to resend invitation');
    }
  });

  return {
    invitations,
    userInvitations,
    isLoading: isLoading || userInvitationsLoading,
    error,
    inviteTeamMember,
    acceptInvitation,
    declineInvitation,
    cancelInvitation,
    resendInvitation
  };
};