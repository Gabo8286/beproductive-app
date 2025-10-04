import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from 'sonner';

// Types
export interface SharedGoal {
  id: string;
  workspace_id: string;
  title: string;
  description?: string;
  timeline_start?: string;
  timeline_end?: string;
  target_date?: string;
  status: 'active' | 'completed' | 'archived';
  progress: number;
  created_by: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  assigned_members: GoalCollaborator[];
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  total_tasks?: number;
  completed_tasks?: number;
  owner?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface GoalCollaborator {
  id: string;
  goal_id: string;
  user_id: string;
  role: 'owner' | 'collaborator' | 'viewer';
  added_by: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface CreateSharedGoalInput {
  workspace_id: string;
  title: string;
  description?: string;
  category: string;
  timeline_start?: string;
  timeline_end?: string;
  target_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_member_ids: string[];
}

export const useSharedGoals = (workspaceId?: string) => {
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const query = useQuery({
    queryKey: ['shared-goals', workspaceId, user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('Authentication required');
      }

      if (!workspaceId) return [];

      console.log('useSharedGoals: Fetching shared goals for workspace:', workspaceId);

      // Get goals from the workspace with collaborators
      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          owner:profiles!user_id(id, email, full_name, avatar_url),
          assigned_members:goal_collaborators(
            id,
            user_id,
            role,
            added_by,
            created_at,
            user:profiles(id, email, full_name, avatar_url)
          )
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useSharedGoals: Query error:', error);
        throw error;
      }

      // Process the data to include task counts and extract metadata
      const goalsWithTaskCounts = await Promise.all(
        (data || []).map(async (goal: any) => {
          // Get task counts for this goal
          const { data: tasks } = await supabase
            .from('tasks')
            .select('id, status')
            .eq('workspace_id', workspaceId)
            .contains('metadata', { goal_id: goal.id });

          const totalTasks = tasks?.length || 0;
          const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;

          // Extract metadata fields
          const metadata = goal.metadata || {};

          return {
            ...goal,
            category: metadata.category || 'general',
            priority: metadata.priority || 'medium',
            target_date: metadata.target_date,
            total_tasks: totalTasks,
            completed_tasks: completedTasks
          };
        })
      );

      console.log('useSharedGoals: Successfully fetched', goalsWithTaskCounts.length, 'shared goals');
      return goalsWithTaskCounts as SharedGoal[];
    },
    enabled: !!user?.id && !authLoading && !!workspaceId,
  });

  const createSharedGoal = useMutation({
    mutationFn: async (input: CreateSharedGoalInput) => {
      if (!user?.id) throw new Error('Authentication required');

      // Create the goal
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .insert({
          workspace_id: input.workspace_id,
          user_id: user.id,
          title: input.title,
          description: input.description,
          timeline_start: input.timeline_start,
          timeline_end: input.timeline_end,
          status: 'active',
          progress: 0,
          metadata: {
            category: input.category,
            priority: input.priority,
            target_date: input.target_date,
            is_shared: true
          }
        })
        .select()
        .single();

      if (goalError) throw goalError;

      // Add goal collaborators
      if (input.assigned_member_ids.length > 0) {
        const collaborators = input.assigned_member_ids.map(userId => ({
          goal_id: goal.id,
          user_id: userId,
          role: 'collaborator' as const,
          added_by: user.id
        }));

        const { error: collaboratorError } = await supabase
          .from('goal_collaborators')
          .insert(collaborators);

        if (collaboratorError) throw collaboratorError;
      }

      // Log activity
      await supabase
        .from('team_activities')
        .insert({
          workspace_id: input.workspace_id,
          user_id: user.id,
          activity_type: 'goal_created',
          title: 'Shared goal created',
          related_goal_id: goal.id,
          metadata: {
            goal_title: input.title,
            assigned_members: input.assigned_member_ids.length
          }
        });

      return goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-goals'] });
      toast.success("Shared goal created successfully");
    },
    onError: (error) => {
      console.error('Create shared goal error:', error);
      toast.error("Failed to create shared goal");
    },
  });

  const updateSharedGoalProgress = useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      const updates: any = {
        progress,
        updated_at: new Date().toISOString()
      };

      if (progress >= 100) {
        updates.status = 'completed';
      }

      const { data: goal, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log activity for completion
      if (progress >= 100) {
        await supabase
          .from('team_activities')
          .insert({
            workspace_id: goal.workspace_id,
            user_id: user?.id,
            activity_type: 'goal_completed',
            title: 'Goal completed',
            related_goal_id: id,
            metadata: {
              goal_title: goal.title,
              progress: progress
            }
          });
      }

      return goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-goals'] });
      toast.success("Goal progress updated");
    },
    onError: () => {
      toast.error("Failed to update goal progress");
    },
  });

  const updateSharedGoalStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'completed' | 'archived' }) => {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed') {
        updates.progress = 100;
      }

      const { data: goal, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase
        .from('team_activities')
        .insert({
          workspace_id: goal.workspace_id,
          user_id: user?.id,
          activity_type: status === 'completed' ? 'goal_completed' : 'goal_updated',
          title: `Goal ${status}`,
          related_goal_id: id,
          metadata: {
            goal_title: goal.title,
            status: status
          }
        });

      return goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-goals'] });
      toast.success("Goal status updated");
    },
    onError: () => {
      toast.error("Failed to update goal status");
    },
  });

  const assignMemberToGoal = useMutation({
    mutationFn: async ({ goalId, userId, role = 'collaborator' }: {
      goalId: string;
      userId: string;
      role?: 'collaborator' | 'viewer';
    }) => {
      if (!user?.id) throw new Error('Authentication required');

      const { error } = await supabase
        .from('goal_collaborators')
        .insert({
          goal_id: goalId,
          user_id: userId,
          role: role,
          added_by: user.id
        });

      if (error) throw error;

      // Create notification for the added user
      await supabase
        .from('team_notifications')
        .insert({
          user_id: userId,
          notification_type: 'role_changed',
          title: 'Added to goal',
          message: `You've been added as a ${role} to a shared goal`,
          related_goal_id: goalId
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-goals'] });
      toast.success("Member assigned to goal");
    },
    onError: () => {
      toast.error("Failed to assign member");
    },
  });

  const removeMemberFromGoal = useMutation({
    mutationFn: async ({ goalId, userId }: { goalId: string; userId: string }) => {
      const { error } = await supabase
        .from('goal_collaborators')
        .delete()
        .eq('goal_id', goalId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-goals'] });
      toast.success("Member removed from goal");
    },
    onError: () => {
      toast.error("Failed to remove member");
    },
  });

  const deleteSharedGoal = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-goals'] });
      toast.success("Goal deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete goal");
    },
  });

  return {
    sharedGoals: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createSharedGoal,
    updateSharedGoalProgress,
    updateSharedGoalStatus,
    assignMemberToGoal,
    removeMemberFromGoal,
    deleteSharedGoal,
  };
};