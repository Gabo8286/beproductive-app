import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Database } from '@/integrations/supabase/types';
import { CheckCircle, Clock, AlertCircle, PlayCircle, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskStatus = Database['public']['Enums']['task_status'];

interface StatusGroup {
  status: TaskStatus;
  name: string;
  description: string;
  tasks: Task[];
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

interface StatusGroupViewProps {
  tasks: Task[];
  className?: string;
}

export const StatusGroupView: React.FC<StatusGroupViewProps> = ({ tasks, className }) => {
  const statusConfig: Record<TaskStatus, Omit<StatusGroup, 'tasks'>> = {
    todo: {
      status: 'todo',
      name: 'To Do',
      description: 'Tasks ready to be started',
      icon: Clock,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 border-gray-200',
    },
    in_progress: {
      status: 'in_progress',
      name: 'In Progress',
      description: 'Tasks currently being worked on',
      icon: PlayCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 border-blue-200',
    },
    blocked: {
      status: 'blocked',
      name: 'Blocked',
      description: 'Tasks waiting for dependencies',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 border-red-200',
    },
    done: {
      status: 'done',
      name: 'Completed',
      description: 'Successfully finished tasks',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 border-green-200',
    },
  };

  // Group tasks by status
  const groupTasksByStatus = (tasks: Task[]): StatusGroup[] => {
    const statusMap = new Map<TaskStatus, Task[]>();

    // Initialize all status groups
    Object.keys(statusConfig).forEach(status => {
      statusMap.set(status as TaskStatus, []);
    });

    // Group tasks by status
    tasks.forEach(task => {
      const statusTasks = statusMap.get(task.status) || [];
      statusTasks.push(task);
      statusMap.set(task.status, statusTasks);
    });

    // Convert to StatusGroup array, filtering out empty groups
    return Array.from(statusMap.entries())
      .map(([status, statusTasks]) => ({
        ...statusConfig[status],
        tasks: statusTasks,
      }))
      .filter(group => group.tasks.length > 0)
      .sort((a, b) => {
        // Sort order: in_progress, todo, blocked, done
        const order = ['in_progress', 'todo', 'blocked', 'done'];
        return order.indexOf(a.status) - order.indexOf(b.status);
      });
  };

  const getPriorityStats = (tasks: Task[]) => {
    const urgent = tasks.filter(t => t.priority === 'urgent').length;
    const high = tasks.filter(t => t.priority === 'high').length;
    const medium = tasks.filter(t => t.priority === 'medium').length;
    const low = tasks.filter(t => t.priority === 'low').length;

    return { urgent, high, medium, low };
  };

  const getOverdueCount = (tasks: Task[]) => {
    const now = new Date();
    return tasks.filter(task =>
      task.due_date &&
      new Date(task.due_date) < now &&
      task.status !== 'done'
    ).length;
  };

  const statusGroups = groupTasksByStatus(tasks);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (statusGroups.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Archive className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Tasks Found</h3>
          <p className="text-muted-foreground text-center">
            Create some tasks to see them organized by status here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Status Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <PlayCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => t.status === 'todo').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Blocked/Overdue</p>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => t.status === 'blocked').length + getOverdueCount(tasks)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Groups */}
      <div className="space-y-6">
        {statusGroups.map((group) => {
          const Icon = group.icon;
          const priorityStats = getPriorityStats(group.tasks);
          const overdueCount = getOverdueCount(group.tasks);

          return (
            <Card key={group.status} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      group.bgColor
                    )}>
                      <Icon className={cn('h-5 w-5', group.color)} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1 flex items-center gap-2">
                        {group.name}
                        <Badge variant="secondary">{group.tasks.length}</Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mb-3">
                        {group.description}
                      </p>

                      {/* Status Metadata */}
                      <div className="flex items-center space-x-4 text-sm">
                        {priorityStats.urgent > 0 && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                            <span>{priorityStats.urgent} urgent</span>
                          </div>
                        )}
                        {priorityStats.high > 0 && (
                          <div className="flex items-center space-x-1 text-orange-600">
                            <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                            <span>{priorityStats.high} high</span>
                          </div>
                        )}
                        {overdueCount > 0 && group.status !== 'done' && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span>{overdueCount} overdue</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {group.status === 'in_progress' && group.tasks.length > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Focus Mode</p>
                      <Badge variant="outline" className="text-blue-600 border-blue-300">
                        Active
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Progress indicator for completed vs remaining */}
                {group.status !== 'done' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Priority Distribution</span>
                    </div>
                    <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
                      {priorityStats.urgent > 0 && (
                        <div
                          className="bg-red-500 h-full"
                          style={{ width: `${(priorityStats.urgent / group.tasks.length) * 100}%` }}
                        />
                      )}
                      {priorityStats.high > 0 && (
                        <div
                          className="bg-orange-500 h-full"
                          style={{ width: `${(priorityStats.high / group.tasks.length) * 100}%` }}
                        />
                      )}
                      {priorityStats.medium > 0 && (
                        <div
                          className="bg-yellow-500 h-full"
                          style={{ width: `${(priorityStats.medium / group.tasks.length) * 100}%` }}
                        />
                      )}
                      {priorityStats.low > 0 && (
                        <div
                          className="bg-green-500 h-full"
                          style={{ width: `${(priorityStats.low / group.tasks.length) * 100}%` }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                {/* Task Grid */}
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {group.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      compact={true}
                      showStatus={false}
                    />
                  ))}
                </div>

                {/* Show more button if many tasks */}
                {group.tasks.length > 6 && (
                  <div className="mt-4 text-center">
                    <button className="text-sm text-primary hover:underline">
                      View all {group.tasks.length} {group.name.toLowerCase()} tasks →
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