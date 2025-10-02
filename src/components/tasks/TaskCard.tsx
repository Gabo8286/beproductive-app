import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, MoreHorizontal, User, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useDeleteTask, useToggleTaskCompletion } from '@/hooks/useTasks';
import { TaskForm } from './TaskForm';
import { Database } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';
import { TagBadge } from '@/components/tags/TagBadge';
import { useTags } from '@/hooks/useTags';
import { DraggableTask } from '@/components/dnd/DraggableTask';

type Task = Database['public']['Tables']['tasks']['Row'] & {
  assigned_to_profile?: { full_name: string | null; avatar_url: string | null };
  created_by_profile?: { full_name: string | null; avatar_url: string | null };
};

interface TaskCardProps {
  task: Task;
}

const priorityConfig = {
  low: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: '🟢' },
  medium: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: '🟡' },
  high: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', icon: '🟠' },
  urgent: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: '🔴' },
};

const statusConfig = {
  todo: { color: 'bg-secondary text-secondary-foreground', icon: '📋' },
  in_progress: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: '⚡' },
  blocked: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: '🚫' },
  done: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: '✅' },
};

export function TaskCard({ task }: TaskCardProps) {
  const deleteTask = useDeleteTask();
  const toggleCompletion = useToggleTaskCompletion();
  const { data: tags = [] } = useTags();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask.mutate(task.id);
    }
  };

  const handleToggleCompletion = () => {
    toggleCompletion.mutate(task);
  };

  const priorityInfo = priorityConfig[task.priority as keyof typeof priorityConfig];
  const statusInfo = statusConfig[task.status as keyof typeof statusConfig];

  return (
    <DraggableTask task={task}>
      <Card className={`transition-all hover:shadow-md ${task.status === 'done' ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Checkbox
              checked={task.status === 'done'}
              onCheckedChange={handleToggleCompletion}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <Link to={`/tasks/${task.id}`} className="hover:text-primary transition-colors">
                <CardTitle className={`text-lg leading-6 ${task.status === 'done' ? 'line-through' : ''}`}>
                  {task.title}
                </CardTitle>
              </Link>
              {task.description && (
                <CardDescription className="mt-1">
                  {task.description}
                </CardDescription>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <TaskForm 
                task={task} 
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge className={priorityInfo.color}>
            {priorityInfo.icon} {task.priority}
          </Badge>
          <Badge className={statusInfo.color}>
            {statusInfo.icon} {task.status?.replace('_', ' ')}
          </Badge>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          {task.due_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Due: {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
            </div>
          )}

          {task.estimated_duration && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Estimated: {task.estimated_duration} minutes</span>
            </div>
          )}

          {task.assigned_to_profile && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <div className="flex items-center gap-2">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={task.assigned_to_profile.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {task.assigned_to_profile.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span>{task.assigned_to_profile.full_name || 'Unassigned'}</span>
              </div>
            </div>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {task.tags.map((tagName, index) => {
              const tagData = tags.find(t => t.name === tagName);
              return (
                <TagBadge 
                  key={index} 
                  name={tagName}
                  color={tagData?.color || undefined}
                />
              );
            })}
          </div>
        )}
      </CardContent>
      </Card>
    </DraggableTask>
  );
}
