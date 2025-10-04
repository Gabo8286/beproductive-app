// Projects Page
// Main page for project management with list view, filtering, and actions

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useDuplicateProject,
} from "@/hooks/useProjects";
import { useProjectAnalytics } from "@/hooks/useProjects";
import {
  ProjectWithRelations,
  ProjectFilters,
  ProjectSortOptions,
  PROJECT_STATUS_CONFIG,
  PROJECT_PRIORITY_CONFIG,
} from "@/types/projects";
import {
  Plus,
  Search,
  Filter,
  SortAsc,
  BarChart3,
  Grid,
  List,
  Users,
  Calendar,
  Target,
} from "lucide-react";
import { toast } from "sonner";

type ViewMode = "grid" | "list";

function Projects() {
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [sortOptions, setSortOptions] = useState<ProjectSortOptions>({
    field: "updated_at",
    direction: "desc",
  });

  // Form states
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<
    ProjectWithRelations | undefined
  >();

  // Delete confirmation
  const [deleteProject, setDeleteProject] = useState<
    ProjectWithRelations | undefined
  >();

  // Hooks
  const { data: projects = [], isLoading } = useProjects(
    { ...filters, search: searchQuery },
    sortOptions,
  );
  const { data: analytics } = useProjectAnalytics();
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const duplicateProjectMutation = useDuplicateProject();

  // Event handlers
  const handleCreateProject = (data: any) => {
    createProjectMutation.mutate(data, {
      onSuccess: () => {
        setShowProjectForm(false);
        toast.success("Project created successfully!");
      },
    });
  };

  const handleEditProject = (project: ProjectWithRelations) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleUpdateProject = (data: any) => {
    updateProjectMutation.mutate(data, {
      onSuccess: () => {
        setShowProjectForm(false);
        setEditingProject(undefined);
        toast.success("Project updated successfully!");
      },
    });
  };

  const handleDeleteProject = (project: ProjectWithRelations) => {
    setDeleteProject(project);
  };

  const confirmDeleteProject = () => {
    if (deleteProject) {
      deleteProjectMutation.mutate(deleteProject.id, {
        onSuccess: () => {
          setDeleteProject(undefined);
          toast.success("Project deleted successfully!");
        },
      });
    }
  };

  const handleDuplicateProject = (project: ProjectWithRelations) => {
    duplicateProjectMutation.mutate(project.id, {
      onSuccess: () => {
        toast.success("Project duplicated successfully!");
      },
    });
  };

  const handleFormClose = () => {
    setShowProjectForm(false);
    setEditingProject(undefined);
  };

  // Filter handlers
  const updateFilters = (key: keyof ProjectFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            Organize and manage your projects
          </p>
        </div>
        <Button onClick={() => setShowProjectForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {analytics.total_projects}
                </div>
                <div className="text-sm text-gray-600">Total Projects</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {analytics.projects_by_status.active}
                </div>
                <div className="text-sm text-gray-600">Active Projects</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {analytics.overdue_projects}
                </div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(analytics.average_progress)}%
                </div>
                <div className="text-sm text-gray-600">Avg Progress</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex space-x-2">
          <Select
            value={filters.status?.[0] || "all"}
            onValueChange={(value) =>
              updateFilters("status", value === "all" ? undefined : [value])
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(PROJECT_STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.priority?.[0] || "all"}
            onValueChange={(value) =>
              updateFilters("priority", value === "all" ? undefined : [value])
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              {Object.entries(PROJECT_PRIORITY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={`${sortOptions.field}-${sortOptions.direction}`}
            onValueChange={(value) => {
              const [field, direction] = value.split("-") as [
                any,
                "asc" | "desc",
              ];
              setSortOptions({ field, direction });
            }}
          >
            <SelectTrigger className="w-40">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_at-desc">Last Updated</SelectItem>
              <SelectItem value="title-asc">Name A-Z</SelectItem>
              <SelectItem value="title-desc">Name Z-A</SelectItem>
              <SelectItem value="target_date-asc">Due Date</SelectItem>
              <SelectItem value="priority-desc">Priority</SelectItem>
              <SelectItem value="progress_percentage-desc">Progress</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.status && (
            <Badge variant="secondary">
              Status: {PROJECT_STATUS_CONFIG[filters.status[0] as any]?.label}
            </Badge>
          )}
          {filters.priority && (
            <Badge variant="secondary">
              Priority:{" "}
              {PROJECT_PRIORITY_CONFIG[filters.priority[0] as any]?.label}
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Projects List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4 p-6 border rounded-lg">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-2/3" />
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || activeFiltersCount > 0
              ? "No projects found"
              : "No projects yet"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || activeFiltersCount > 0
              ? "Try adjusting your search or filters"
              : "Get started by creating your first project"}
          </p>
          {!searchQuery && activeFiltersCount === 0 && (
            <Button onClick={() => setShowProjectForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              onDuplicate={handleDuplicateProject}
            />
          ))}
        </div>
      )}

      {/* Project Form Dialog */}
      <ProjectForm
        open={showProjectForm}
        onOpenChange={handleFormClose}
        project={editingProject}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
        isLoading={
          createProjectMutation.isPending || updateProjectMutation.isPending
        }
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteProject}
        onOpenChange={() => setDeleteProject(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProject?.title}"? This
              action cannot be undone. All tasks and data associated with this
              project will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProject}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Projects;
