import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useDeleteTask, useToggleTaskCompletion } from '@/hooks/useTasks';
import { TaskForm } from './TaskForm';
import { Database } from '@/integrations/supabase/types';
import { TagBadge } from '@/components/tags/TagBadge';
import { useTags } from '@/hooks/useTags';
import { Link } from 'react-router-dom';
import { DraggableTask } from '@/components/dnd/DraggableTask';
import { DragAndDropProvider } from '@/components/dnd/DragAndDropProvider';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';
import { useUpdateTaskPositions } from '@/hooks/useDragAndDrop';
import { QuickTaskInput } from './QuickTaskInput';
import { useState } from 'react';
import { Plus } from 'lucide-react';

type Task = Database['public']['Tables']['tasks']['Row'] & {
  assigned_to_profile?: { full_name: string | null; avatar_url: string | null };
  created_by_profile?: { full_name: string | null; avatar_url: string | null };
};

interface TaskListViewProps {
  tasks: Task[];
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

function TaskListItem({ task }: { task: Task }) {
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
      <div className={`flex items-center gap-4 p-4 pl-12 border rounded-lg hover:bg-accent/50 transition-colors ${
        task.status === 'done' ? 'opacity-75' : ''
      }`}>
      {/* Checkbox */}
      <Checkbox
        checked={task.status === 'done'}
        onCheckedChange={handleToggleCompletion}
      />

      {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Link to={`/tasks/${task.id}`} className="hover:text-primary transition-colors">
                <h3 className={`font-medium truncate ${task.status === 'done' ? 'line-through' : ''}`}>
                  {task.title}
                </h3>
              </Link>
            {task.description && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                {task.description}
              </p>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 ml-4">
            <Badge className={priorityInfo.color} variant="secondary">
              {priorityInfo.icon}
            </Badge>
            <Badge className={statusInfo.color} variant="secondary">
              {statusInfo.icon}
            </Badge>
          </div>
        </div>

        {/* Task Details */}
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(task.due_date), 'MMM d')}</span>
            </div>
          )}

          {task.estimated_duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{task.estimated_duration}m</span>
            </div>
          )}

          {task.assigned_to_profile && (
            <div className="flex items-center gap-1">
              <Avatar className="w-4 h-4">
                <AvatarImage src={task.assigned_to_profile.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {task.assigned_to_profile.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[100px]">
                {task.assigned_to_profile.full_name || 'Unassigned'}
              </span>
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="flex gap-1">
              {task.tags.slice(0, 2).map((tagName, index) => {
                const tagData = tags.find(t => t.name === tagName);
                return (
                  <TagBadge 
                    key={index} 
                    name={tagName}
                    color={tagData?.color || undefined}
                    size="sm"
                  />
                );
              })}
              {task.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
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
    </DraggableTask>
  );
}

export function TaskListView({ tasks }: TaskListViewProps) {
  const updatePositions = useUpdateTaskPositions();
  const [showQuickCreate, setShowQuickCreate] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeIndex = tasks.findIndex((t) => t.id === active.id);
    const overIndex = tasks.findIndex((t) => t.id === over.id);

    if (activeIndex === -1 || overIndex === -1) return;

    // Create reordered array
    const reordered = [...tasks];
    const [movedTask] = reordered.splice(activeIndex, 1);
    reordered.splice(overIndex, 0, movedTask);

    // Update positions
    const updates = reordered.map((task, index) => ({
      id: task.id,
      position: index * 100,
    }));

    updatePositions.mutate(updates);
  };

  return (
    <DragAndDropProvider 
      onDragEnd={handleDragEnd}
      overlay={
        <Card className="opacity-50 rotate-3">
          <CardContent className="p-4">
            Reordering...
          </CardContent>
        </Card>
      }
    >
      <div className="space-y-4">
        {/* Quick Create Input */}
        {showQuickCreate ? (
          <QuickTaskInput
            onCancel={() => setShowQuickCreate(false)}
            onSuccess={() => setShowQuickCreate(false)}
            placeholder="Quick task title..."
          />
        ) : (
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => setShowQuickCreate(true)}
          >
            <Plus className="h-4 w-4" />
            Add task
          </Button>
        )}

        {/* Task List */}
        <Card>
          <CardContent className="p-0">
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="divide-y">
                {tasks.map((task) => (
                  <TaskListItem key={task.id} task={task} />
                ))}
              </div>
            </SortableContext>
          </CardContent>
        </Card>
      </div>
    </DragAndDropProvider>
  );
}
