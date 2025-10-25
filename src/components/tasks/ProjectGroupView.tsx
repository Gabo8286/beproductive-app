import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Database } from '@/integrations/supabase/types';
import { Folder, Users, Calendar, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

type Task = Database['public']['Tables']['tasks']['Row'];

interface ProjectGroup {
  id: string;
  name: string;
  description?: string;
  tasks: Task[];
  color?: string;
  dueDate?: string;
  teamMembers?: number;
}

interface ProjectGroupViewProps {
  tasks: Task[];
  className?: string;
}

export const ProjectGroupView: React.FC<ProjectGroupViewProps> = ({ tasks, className }) => {
  // Group tasks by project
  const groupTasksByProject = (tasks: Task[]): ProjectGroup[] => {
    const projectMap = new Map<string, Task[]>();

    // Group tasks by project_id
    tasks.forEach(task => {
      const projectId = task.project_id || 'no-project';
      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, []);
      }
      projectMap.get(projectId)!.push(task);
    });

    // Convert to ProjectGroup array
    return Array.from(projectMap.entries()).map(([projectId, projectTasks]) => {
      // For now, we'll use simple project names. In a real app, you'd fetch project details
      const projectName = projectId === 'no-project' ? 'Personal Tasks' : `Project ${projectId.slice(0, 8)}`;

      return {
        id: projectId,
        name: projectName,
        description: projectId === 'no-project' ? 'Tasks not assigned to a project' : 'Project tasks and deliverables',
        tasks: projectTasks,
        color: getProjectColor(projectId),
        teamMembers: Math.floor(Math.random() * 5) + 1, // Mock data
      };
    });
  };

  const getProjectColor = (projectId: string): string => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-gray-100 text-gray-800 border-gray-200',
    ];

    // Use project ID to consistently assign colors
    const hash = projectId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const calculateProjectProgress = (projectTasks: Task[]): number => {
    if (projectTasks.length === 0) return 0;
    const completedTasks = projectTasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  };

  const getProjectPriority = (projectTasks: Task[]): 'low' | 'medium' | 'high' => {
    const highPriorityTasks = projectTasks.filter(task =>
      task.priority === 'high' || task.priority === 'urgent'
    ).length;

    if (highPriorityTasks > 0) return 'high';

    const mediumPriorityTasks = projectTasks.filter(task =>
      task.priority === 'medium'
    ).length;

    return mediumPriorityTasks > 0 ? 'medium' : 'low';
  };

  const getUpcomingDeadline = (projectTasks: Task[]): string | null => {
    const tasksWithDueDates = projectTasks
      .filter(task => task.due_date && task.status !== 'done')
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

    return tasksWithDueDates.length > 0 ? tasksWithDueDates[0].due_date! : null;
  };

  const projectGroups = groupTasksByProject(tasks);

  if (projectGroups.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Folder className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
          <p className="text-muted-foreground text-center">
            Create tasks and assign them to projects to see them organized here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Project Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Folder className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{projectGroups.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Progress</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    projectGroups.reduce((acc, project) =>
                      acc + calculateProjectProgress(project.tasks), 0
                    ) / projectGroups.length
                  )}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Groups */}
      <div className="space-y-6">
        {projectGroups.map((project) => {
          const progress = calculateProjectProgress(project.tasks);
          const priority = getProjectPriority(project.tasks);
          const upcomingDeadline = getUpcomingDeadline(project.tasks);
          const pendingTasks = project.tasks.filter(task => task.status !== 'done').length;
          const completedTasks = project.tasks.filter(task => task.status === 'done').length;

          return (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      project.color
                    )}>
                      <Folder className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{project.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mb-3">
                        {project.description}
                      </p>

                      {/* Project Metadata */}
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span>{project.tasks.length} tasks</span>
                        </div>

                        {project.teamMembers && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{project.teamMembers} members</span>
                          </div>
                        )}

                        {upcomingDeadline && (
                          <div className="flex items-center space-x-1 text-orange-600">
                            <Calendar className="h-4 w-4" />
                            <span>Due {new Date(upcomingDeadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        priority === 'high' && 'border-red-300 text-red-700 bg-red-50',
                        priority === 'medium' && 'border-yellow-300 text-yellow-700 bg-yellow-50',
                        priority === 'low' && 'border-green-300 text-green-700 bg-green-50'
                      )}
                    >
                      {priority} priority
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress}% complete</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{completedTasks} completed</span>
                    <span>{pendingTasks} pending</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Task Grid */}
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {project.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      compact={true}
                      showProject={false}
                    />
                  ))}
                </div>

                {/* Show more button if many tasks */}
                {project.tasks.length > 6 && (
                  <div className="mt-4 text-center">
                    <button className="text-sm text-primary hover:underline">
                      View all {project.tasks.length} tasks →
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};