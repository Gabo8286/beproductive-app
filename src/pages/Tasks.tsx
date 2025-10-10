import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTasks, useSortedTasks } from "@/hooks/useTasks";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskListView } from "@/components/tasks/TaskListView";
import { TaskBoardView } from "@/components/tasks/TaskBoardView";
import { TaskCalendarView } from "@/components/tasks/TaskCalendarView";
import { ProjectGroupView } from "@/components/tasks/ProjectGroupView";
import { StatusGroupView } from "@/components/tasks/StatusGroupView";
import { TaskViewProvider } from "@/contexts/TaskViewContext";
import { QuickTaskModal } from "@/components/tasks/QuickTaskModal";
import { RecommendationsBanner } from "@/components/ai/RecommendationsBanner";
import { useGlobalView } from "@/contexts/GlobalViewContext";
import { useState } from "react";

function TasksContent() {
  const { data: tasks, isLoading, error } = useTasks();
  const { sortTasks, groupTasks } = useSortedTasks();
  const { viewMode, sortBy, sortOrder, groupBy, filters, searchTerm, activeTags } = useGlobalView();

  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);

  // Filter and sort tasks based on global view state
  const filteredTasks =
    tasks?.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply global filters
      let matchesFilters = true;
      for (const filter of filters) {
        if (filter.type === 'priority' && task.priority !== filter.value) {
          matchesFilters = false;
          break;
        }
        if (filter.type === 'status' && task.status !== filter.value) {
          matchesFilters = false;
          break;
        }
        if (filter.type === 'dueDate') {
          if (filter.value === 'today') {
            const today = new Date().toISOString().split('T')[0];
            const taskDue = task.due_date?.split('T')[0];
            if (taskDue !== today) {
              matchesFilters = false;
              break;
            }
          }
          if (filter.value === 'overdue') {
            if (!task.due_date || new Date(task.due_date) >= new Date()) {
              matchesFilters = false;
              break;
            }
          }
        }
      }

      const matchesTags =
        activeTags.length === 0 ||
        activeTags.every((tag) => task.tags?.includes(tag));

      return matchesSearch && matchesFilters && matchesTags;
    }) || [];

  const sortedTasks = sortTasks(filteredTasks, sortBy, sortOrder);
  const groupedTasks = groupTasks(sortedTasks, groupBy);

  const totalTasks = tasks?.length || 0;
  const completedTasks =
    tasks?.filter((task) => task.status === "done").length || 0;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-8">
        <p>Failed to load tasks. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 md:px-6 py-6 max-w-7xl mx-auto">
      {/* Minimal Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          Manage your daily tasks and to-dos
        </p>
      </div>

      {/* AI Recommendations Banner */}
      <RecommendationsBanner context="tasks" />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Badge variant="secondary">{totalTasks}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Badge variant="secondary">{completedTasks}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {completedTasks}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Badge variant="secondary">
              {sortedTasks.filter((t) => t.status === "in_progress").length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {sortedTasks.filter((t) => t.status === "in_progress").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <Badge variant="secondary">{completionRate}%</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Display */}
      {sortedTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.length > 0 || searchTerm || activeTags.length > 0
                  ? "Try adjusting your filters using the FAB menu"
                  : "Create your first task to get started"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === "list" && <TaskListView tasks={sortedTasks} />}
          {viewMode === "board" && <TaskBoardView tasks={sortedTasks} />}
          {viewMode === "calendar" && <TaskCalendarView tasks={sortedTasks} />}
          {viewMode === "projects" && <ProjectGroupView tasks={sortedTasks} />}
          {viewMode === "status" && <StatusGroupView tasks={sortedTasks} />}
          {viewMode === "grid" &&
            (groupBy === "none" ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedTasks).map(([group, groupTasks]) => (
                  <div key={group}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      {group}
                      <Badge variant="secondary">{groupTasks.length}</Badge>
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {groupTasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </>
      )}

      {/* Quick Create Modal */}
      <QuickTaskModal
        open={isQuickModalOpen}
        onOpenChange={setIsQuickModalOpen}
      />
    </div>
  );
}

export default function Tasks() {
  return (
    <TaskViewProvider>
      <TasksContent />
    </TaskViewProvider>
  );
}
