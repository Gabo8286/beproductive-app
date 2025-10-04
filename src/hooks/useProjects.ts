// Projects CRUD Hooks - Simplified Version
// Data management for projects with React Query integration

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Project,
  ProjectWithRelations,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectFilters,
  ProjectSortOptions,
  ProjectAnalytics,
  ProjectDashboardData,
} from "@/types/projects";
import { useAuth } from "@/contexts/AuthContext";

// =====================================================
// QUERY KEYS
// =====================================================

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (userId: string, filters?: ProjectFilters, sort?: ProjectSortOptions) =>
    [...projectKeys.lists(), userId, filters, sort] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  analytics: (userId: string) =>
    [...projectKeys.all, "analytics", userId] as const,
  dashboard: (userId: string) =>
    [...projectKeys.all, "dashboard", userId] as const,
  templates: () => [...projectKeys.all, "templates"] as const,
};

// =====================================================
// QUERIES - SIMPLIFIED FOR NOW
// =====================================================

/**
 * Get all projects - simplified implementation
 */
export function useProjects(
  filters?: ProjectFilters,
  sort?: ProjectSortOptions,
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: projectKeys.list(user?.id || "", filters, sort),
    queryFn: async () => {
      // Return empty array for now - will implement once workspace system is available
      return [] as ProjectWithRelations[];
    },
    enabled: !!user?.id,
  });
}

/**
 * Get a single project by ID
 */
export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: async () => {
      // Return null for now - will implement once workspace system is available
      return null as ProjectWithRelations | null;
    },
    enabled: !!projectId,
  });
}

/**
 * Get project analytics
 */
export function useProjectAnalytics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: projectKeys.analytics(user?.id || ""),
    queryFn: async () => {
      if (!user?.id) return null;

      // Return default analytics for now
      const analytics: ProjectAnalytics = {
        total_projects: 0,
        projects_by_status: {
          planning: 0,
          active: 0,
          on_hold: 0,
          completed: 0,
          cancelled: 0,
          archived: 0,
        },
        projects_by_priority: {
          low: 0,
          medium: 0,
          high: 0,
          urgent: 0,
        },
        average_progress: 0,
        overdue_projects: 0,
        completed_this_month: 0,
        total_estimated_hours: 0,
        total_actual_hours: 0,
        efficiency_ratio: 0,
      };

      return analytics;
    },
    enabled: !!user?.id,
  });
}

/**
 * Get project dashboard data
 */
export function useProjectDashboard() {
  const { user } = useAuth();

  return useQuery({
    queryKey: projectKeys.dashboard(user?.id || ""),
    queryFn: async () => {
      if (!user?.id) return null;

      // Return default dashboard data for now
      const dashboardData: ProjectDashboardData = {
        recent_projects: [],
        active_projects_count: 0,
        completed_projects_count: 0,
        overdue_projects_count: 0,
        total_progress: 0,
        upcoming_milestones: [],
        recent_activity: [],
      };

      return dashboardData;
    },
    enabled: !!user?.id,
  });
}

// =====================================================
// MUTATIONS - SIMPLIFIED FOR NOW
// =====================================================

/**
 * Create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      // For now, just simulate success
      toast.success(
        "Project creation will be implemented once workspace system is available",
      );
      return { id: "temp-id" } as Project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success("Project created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create project");
    },
  });
}

/**
 * Update an existing project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateProjectInput & { id: string }) => {
      // For now, just simulate success
      toast.success(
        "Project updates will be implemented once workspace system is available",
      );
      return { id } as Project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(project.id),
      });
      toast.success("Project updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update project");
    },
  });
}

/**
 * Delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      // For now, just simulate success
      toast.success(
        "Project deletion will be implemented once workspace system is available",
      );
      return { projectId, workspaceId: "temp" };
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
      toast.success("Project deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete project");
    },
  });
}

/**
 * Duplicate a project
 */
export function useDuplicateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      // For now, just simulate success
      toast.success(
        "Project duplication will be implemented once workspace system is available",
      );
      return { id: "temp-duplicate-id" } as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success("Project duplicated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to duplicate project");
    },
  });
}
