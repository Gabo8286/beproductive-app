import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Trash2, Clock, Calendar, User, Tag, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useTask, useDeleteTask, useToggleTaskCompletion } from '@/hooks/useTasks';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const priorityConfig = {
  low: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: '🟢' },
  medium: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: '🟡' },
  high: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', icon: '🟠' },
  urgent: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: '🔴' },
};

const statusConfig = {
  todo: { color: 'bg-secondary text-secondary-foreground', icon: '📋', label: 'To Do' },
  in_progress: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: '⚡', label: 'In Progress' },
  blocked: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: '🚫', label: 'Blocked' },
  done: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: '✅', label: 'Done' },
};

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: task, isLoading, error } = useTask(id);
  const deleteTask = useDeleteTask();
  const toggleCompletion = useToggleTaskCompletion();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask.mutate(id!, {
        onSuccess: () => navigate('/tasks'),
      });
    }
  };

  const handleToggleCompletion = () => {
    if (task) {
      toggleCompletion.mutate(task);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-2">Task Not Found</h2>
        <p className="text-muted-foreground mb-4">The task you're looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={() => navigate('/tasks')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tasks
        </Button>
      </div>
    );
  }

  const priorityInfo = priorityConfig[task.priority as keyof typeof priorityConfig];
  const statusInfo = statusConfig[task.status as keyof typeof statusConfig];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/tasks">Tasks</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{task.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/tasks')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <p className="text-muted-foreground">Task Details</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <TaskForm 
            task={task} 
            trigger={
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            }
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleToggleCompletion}
            className={task.status === 'done' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''}
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            {task.status === 'done' ? 'Mark Incomplete' : 'Mark Complete'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Task Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              {statusInfo.icon} {task.title}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={priorityInfo.color}>
                {priorityInfo.icon} {task.priority}
              </Badge>
              <Badge className={statusInfo.color}>
                {statusInfo.icon} {statusInfo.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{task.description}</p>
            </div>
          )}

          <Separator />

          {/* Task Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Task Information</h3>

              <div className="space-y-3">
                {task.due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Due Date:</span>
                    <span className="text-sm">{format(new Date(task.due_date), 'PPP')}</span>
                  </div>
                )}

                {task.estimated_duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Estimated Duration:</span>
                    <span className="text-sm">{task.estimated_duration} minutes</span>
                  </div>
                )}

                {task.actual_duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Actual Duration:</span>
                    <span className="text-sm">{task.actual_duration} minutes</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Created:</span>
                  <span className="text-sm">{format(new Date(task.created_at), 'PPP')}</span>
                </div>

                {task.completed_at && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Completed:</span>
                    <span className="text-sm">{format(new Date(task.completed_at), 'PPP')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">People & Organization</h3>

              <div className="space-y-3">
                {task.assigned_to_profile && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Assigned to:</span>
                    <span className="text-sm">{task.assigned_to_profile.full_name || 'Unassigned'}</span>
                  </div>
                )}

                {task.created_by_profile && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Created by:</span>
                    <span className="text-sm">{task.created_by_profile.full_name || 'Unknown'}</span>
                  </div>
                )}

                {task.tags && task.tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Position:</span>
                  <span className="text-sm">{task.position}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for additional features */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge className={statusInfo.color}>
                    {statusInfo.icon} {statusInfo.label}
                  </Badge>
                </div>

                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      task.status === 'done' ? 'bg-green-500 w-full' :
                      task.status === 'in_progress' ? 'bg-blue-500 w-1/2' :
                      task.status === 'blocked' ? 'bg-red-500 w-1/4' :
                      'bg-muted-foreground w-0'
                    }`}
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  {task.status === 'done' ? 'Task completed successfully!' :
                   task.status === 'in_progress' ? 'Work is currently in progress.' :
                   task.status === 'blocked' ? 'Task is currently blocked.' :
                   'Task is ready to be started.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Task created</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(task.created_at), 'PPP p')}
                    </p>
                  </div>
                </div>

                {task.completed_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Task completed</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(task.completed_at), 'PPP p')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Full activity tracking coming soon...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subtasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subtasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Subtask management coming soon...</p>
                <p className="text-xs mt-2">Break down complex tasks into smaller, manageable pieces.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium mb-1">Estimated Time</p>
                    <p className="text-2xl font-bold">
                      {task.estimated_duration ? `${task.estimated_duration}m` : 'Not set'}
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium mb-1">Actual Time</p>
                    <p className="text-2xl font-bold">
                      {task.actual_duration ? `${task.actual_duration}m` : 'Not tracked'}
                    </p>
                  </div>
                </div>

                {task.estimated_duration && task.actual_duration && (
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium mb-1">Variance</p>
                    <p className={`text-lg font-semibold ${
                      task.actual_duration > task.estimated_duration ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {task.actual_duration > task.estimated_duration ? '+' : ''}
                      {task.actual_duration - task.estimated_duration}m
                    </p>
                  </div>
                )}

                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">Advanced time tracking features coming soon...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
