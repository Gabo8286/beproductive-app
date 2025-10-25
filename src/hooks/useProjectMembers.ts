// Project Members Hooks
// Data management for project collaboration and member management

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ProjectMember,
  ProjectMemberPermissions,
  CreateProjectMemberInput,
  UpdateProjectMemberInput,
  PROJECT_MEMBER_DEFAULTS,
} from "@/types/projects";
import { useAuth } from "@/contexts/AuthContext";
import { projectKeys } from "@/hooks/useProjects";

// =====================================================
// QUERY KEYS
// =====================================================

export const projectMemberKeys = {
  all: ["project-members"] as const,
  lists: () => [...projectMemberKeys.all, "list"] as const,
  list: (projectId: string) =>
    [...projectMemberKeys.lists(), projectId] as const,
  detail: (id: string) => [...projectMemberKeys.all, "detail", id] as const,
};

// =====================================================
// QUERIES
// =====================================================

/**
 * Get all members for a specific project
 */
export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: projectMemberKeys.list(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_members")
        .select(
          `
          *,
          user_profile:profiles!project_members_user_id_fkey(id, full_name, avatar_url, email),
          invited_by_profile:profiles!project_members_invited_by_fkey(id, full_name, avatar_url)
        `,
        )
        .eq("project_id", projectId)
        .order("joined_at", { ascending: true });

      if (error) throw error;
      return (data || []).map((member) => ({
        ...member,
        permissions: member.permissions as any as ProjectMemberPermissions,
      })) as ProjectMember[];
    },
    enabled: !!projectId,
  });
}

/**
 * Get a single project member by ID
 */
export function useProjectMember(memberId: string) {
  return useQuery({
    queryKey: projectMemberKeys.detail(memberId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_members")
        .select(
          `
          *,
          user_profile:profiles!project_members_user_id_fkey(id, full_name, avatar_url, email),
          invited_by_profile:profiles!project_members_invited_by_fkey(id, full_name, avatar_url),
          project:projects(id, title, workspace_id)
        `,
        )
        .eq("id", memberId)
        .single();

      if (error) throw error;
      return {
        ...data,
        permissions: data.permissions as any as ProjectMemberPermissions,
      } as ProjectMember;
    },
    enabled: !!memberId,
  });
}

/**
 * Get current user's membership for a project
 */
export function useCurrentUserProjectMembership(projectId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...projectMemberKeys.all, "current-user", projectId],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("project_members")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data
        ? ({
            ...data,
            permissions: data.permissions as any as ProjectMemberPermissions,
          } as ProjectMember)
        : null;
    },
    enabled: !!projectId && !!user?.id,
  });
}

/**
 * Search for users to invite to a project
 */
export function useProjectInviteSearch(projectId: string, searchQuery: string) {
  return useQuery({
    queryKey: ["project-invite-search", projectId, searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];

      // Get project workspace to limit search to workspace members
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("workspace_id")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;

      // Get existing project members to exclude them
      const { data: existingMembers } = await supabase
        .from("project_members")
        .select("user_id")
        .eq("project_id", projectId);

      const excludeUserIds = existingMembers?.map((m) => m.user_id) || [];

      // Search for workspace members not already in the project
      let query = supabase
        .from("workspace_members")
        .select(
          `
          user_id,
          user_profile:profiles(id, full_name, avatar_url, email)
        `,
        )
        .eq("workspace_id", project.workspace_id)
        .ilike("user_profile.full_name", `%${searchQuery}%`);

      if (excludeUserIds.length > 0) {
        query = query.not("user_id", "in", `(${excludeUserIds.join(",")})`);
      }

      const { data, error } = await query.limit(10);

      if (error) throw error;
      return (data || []).map((item) => item.user_profile).filter(Boolean);
    },
    enabled: !!projectId && !!searchQuery && searchQuery.length >= 2,
  });
}

// =====================================================
// MUTATIONS
// =====================================================

/**
 * Add a member to a project
 */
export function useAddProjectMember() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateProjectMemberInput) => {
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from("project_members")
        .select("id")
        .eq("project_id", input.project_id)
        .eq("user_id", input.user_id)
        .maybeSingle();

      if (existingMember) {
        throw new Error("User is already a member of this project");
      }

      const memberData = {
        ...PROJECT_MEMBER_DEFAULTS,
        ...input,
        invited_by: user?.id,
      };

      const { data, error } = await supabase
        .from("project_members")
        .insert(memberData)
        .select(
          `
          *,
          user_profile:profiles!project_members_user_id_fkey(id, full_name, avatar_url, email)
        `,
        )
        .single();

      if (error) throw error;
      return {
        ...data,
        permissions: data.permissions as any as ProjectMemberPermissions,
      } as ProjectMember;
    },
    onSuccess: (member) => {
      queryClient.invalidateQueries({
        queryKey: projectMemberKeys.list(member.project_id),
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(member.project_id),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success("Member added to project successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add member to project");
      console.error("Add project member error:", error);
    },
  });
}

/**
 * Update project member role and permissions
 */
export function useUpdateProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateProjectMemberInput & { id: string }) => {
      const { data, error } = await supabase
        .from("project_members")
        .update(input)
        .eq("id", id)
        .select(
          `
          *,
          user_profile:profiles!project_members_user_id_fkey(id, full_name, avatar_url, email)
        `,
        )
        .single();

      if (error) throw error;
      return {
        ...data,
        permissions: data.permissions as any as ProjectMemberPermissions,
      } as ProjectMember;
    },
    onSuccess: (member) => {
      queryClient.invalidateQueries({
        queryKey: projectMemberKeys.list(member.project_id),
      });
      queryClient.invalidateQueries({
        queryKey: projectMemberKeys.detail(member.id),
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(member.project_id),
      });
      toast.success("Member role updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update member role");
      console.error("Update project member error:", error);
    },
  });
}

/**
 * Remove a member from a project
 */
export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      // Get member data before deletion for cache invalidation
      const { data: member } = await supabase
        .from("project_members")
        .select("project_id, user_id")
        .eq("id", memberId)
        .single();

      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      return {
        memberId,
        projectId: member?.project_id,
        userId: member?.user_id,
      };
    },
    onSuccess: ({ memberId, projectId, userId }) => {
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: projectMemberKeys.list(projectId),
        });
        queryClient.invalidateQueries({
          queryKey: projectKeys.detail(projectId),
        });
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      }
      queryClient.removeQueries({
        queryKey: projectMemberKeys.detail(memberId),
      });

      // Also invalidate current user membership if removing self
      if (userId && projectId) {
        queryClient.invalidateQueries({
          queryKey: [...projectMemberKeys.all, "current-user", projectId],
        });
      }

      toast.success("Member removed from project successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove member from project");
      console.error("Remove project member error:", error);
    },
  });
}

/**
 * Leave a project (current user removes themselves)
 */
export function useLeaveProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (projectId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Find current user's membership
      const { data: membership, error: findError } = await supabase
        .from("project_members")
        .select("id, role")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .single();

      if (findError) throw new Error("You are not a member of this project");

      // Check if user is the only owner
      if (membership.role === "owner") {
        const { data: owners, error: ownerError } = await supabase
          .from("project_members")
          .select("id")
          .eq("project_id", projectId)
          .eq("role", "owner");

        if (ownerError) throw ownerError;

        if (owners && owners.length === 1) {
          throw new Error(
            "Cannot leave project - you are the only owner. Transfer ownership first or delete the project.",
          );
        }
      }

      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("id", membership.id);

      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({
        queryKey: projectMemberKeys.list(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: [...projectMemberKeys.all, "current-user", projectId],
      });
      toast.success("You have left the project successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to leave project");
      console.error("Leave project error:", error);
    },
  });
}

/**
 * Transfer project ownership
 */
export function useTransferProjectOwnership() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      projectId,
      newOwnerId,
    }: {
      projectId: string;
      newOwnerId: string;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Verify current user is an owner
      const { data: currentMembership, error: currentError } = await supabase
        .from("project_members")
        .select("id, role")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .single();

      if (currentError || currentMembership.role !== "owner") {
        throw new Error("Only project owners can transfer ownership");
      }

      // Verify new owner is a member
      const { data: newOwnerMembership, error: newOwnerError } = await supabase
        .from("project_members")
        .select("id")
        .eq("project_id", projectId)
        .eq("user_id", newOwnerId)
        .single();

      if (newOwnerError) {
        throw new Error("New owner must be a project member");
      }

      // Update new owner role
      const { error: updateError } = await supabase
        .from("project_members")
        .update({ role: "owner" })
        .eq("id", newOwnerMembership.id);

      if (updateError) throw updateError;

      // Update current owner to manager
      const { error: demoteError } = await supabase
        .from("project_members")
        .update({ role: "manager" })
        .eq("id", currentMembership.id);

      if (demoteError) throw demoteError;

      // Update project manager field
      await supabase
        .from("projects")
        .update({ project_manager: newOwnerId })
        .eq("id", projectId);

      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({
        queryKey: projectMemberKeys.list(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success("Project ownership transferred successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to transfer project ownership");
      console.error("Transfer ownership error:", error);
    },
  });
}
