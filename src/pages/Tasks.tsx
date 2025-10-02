import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';
import { useTasks, useSortedTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskListView } from '@/components/tasks/TaskListView';
import { TaskBoardView } from '@/components/tasks/TaskBoardView';
import { TaskCalendarView } from '@/components/tasks/TaskCalendarView';
import { TaskForm } from '@/components/tasks/TaskForm';
import { ViewModeSelector } from '@/components/tasks/ViewModeSelector';
import { TaskViewProvider, useTaskView } from '@/contexts/TaskViewContext';
import { Database } from '@/integrations/supabase/types';

type TaskStatus = Database['public']['Enums']['task_status'];
type TaskPriority = Database['public']['Enums']['task_priority'];

function TasksContent() {
  const { data: tasks, isLoading, error } = useTasks();
  const { sortTasks, groupTasks } = useSortedTasks();
  const { viewMode, sortBy, sortOrder, groupBy } = useTaskView();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');

  // Filter and sort tasks
  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  const sortedTasks = sortTasks(filteredTasks, sortBy, sortOrder);
  const groupedTasks = groupTasks(sortedTasks, groupBy);

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(task => task.status === 'done').length || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your daily tasks and to-dos
          </p>
        </div>
        <TaskForm trigger={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        } />
      </div>

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
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Badge variant="secondary">{sortedTasks.filter(t => t.status === 'in_progress').length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {sortedTasks.filter(t => t.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Badge variant="secondary">{completionRate}%</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Selector */}
      <ViewModeSelector />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatus | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">📋 To Do</SelectItem>
                <SelectItem value="in_progress">⚡ In Progress</SelectItem>
                <SelectItem value="blocked">🚫 Blocked</SelectItem>
                <SelectItem value="done">✅ Done</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as TaskPriority | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">🟢 Low</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="high">🟠 High</SelectItem>
                <SelectItem value="urgent">🔴 Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Display */}
      {sortedTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first task to get started'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
                <TaskForm trigger={
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Task
                  </Button>
                } />
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'list' && <TaskListView tasks={sortedTasks} />}
          {viewMode === 'board' && <TaskBoardView tasks={sortedTasks} />}
          {viewMode === 'calendar' && <TaskCalendarView tasks={sortedTasks} />}
          {viewMode === 'grid' && (
            groupBy === 'none' ? (
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
            )
          )}
        </>
      )}
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
