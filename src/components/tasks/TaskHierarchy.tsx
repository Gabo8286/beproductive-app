import { useState } from 'react';
import { useTaskHierarchy } from '@/hooks/useSubtasks';
import { ChevronDown, ChevronRight, Circle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'] & {
  subtasks?: Task[];
};

interface TaskHierarchyProps {
  taskId: string;
}

interface TaskNodeProps {
  task: Task;
  level: number;
}

function TaskNode({ task, level }: TaskNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const isCompleted = task.status === 'done';

  const priorityColors = {
    low: 'bg-blue-500/10 text-blue-500',
    medium: 'bg-yellow-500/10 text-yellow-500',
    high: 'bg-orange-500/10 text-orange-500',
    urgent: 'bg-red-500/10 text-red-500',
  };

  return (
    <div className="space-y-1">
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-accent transition-colors group"
        style={{ marginLeft: `${level * 20}px` }}
      >
        {hasSubtasks ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-5 w-5 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="h-5 w-5" />
        )}

        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
        )}

        <Link
          to={`/tasks/${task.id}`}
          className="flex-1 min-w-0 hover:underline"
        >
          <span className={isCompleted ? 'line-through text-muted-foreground' : ''}>
            {task.title}
          </span>
        </Link>

        <Badge
          variant="secondary"
          className={`${priorityColors[task.priority as keyof typeof priorityColors]} text-xs shrink-0`}
        >
          {task.priority}
        </Badge>

        {hasSubtasks && (
          <span className="text-xs text-muted-foreground shrink-0">
            {task.subtasks!.length}
          </span>
        )}
      </div>

      {hasSubtasks && isExpanded && (
        <div className="space-y-1">
          {task.subtasks!.map((subtask) => (
            <TaskNode key={subtask.id} task={subtask} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TaskHierarchy({ taskId }: TaskHierarchyProps) {
  const { data: hierarchy, isLoading } = useTaskHierarchy(taskId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full ml-6" />
        <Skeleton className="h-10 w-full ml-12" />
      </div>
    );
  }

  if (!hierarchy) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Task not found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <TaskNode task={hierarchy} level={0} />
    </div>
  );
}
