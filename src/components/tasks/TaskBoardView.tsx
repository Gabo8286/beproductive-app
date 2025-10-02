import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from './TaskCard';
import { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'] & {
  assigned_to_profile?: { full_name: string | null; avatar_url: string | null };
  created_by_profile?: { full_name: string | null; avatar_url: string | null };
};

interface TaskBoardViewProps {
  tasks: Task[];
}

const statusColumns = [
  { id: 'todo', title: 'To Do', icon: '📋' },
  { id: 'in_progress', title: 'In Progress', icon: '⚡' },
  { id: 'blocked', title: 'Blocked', icon: '🚫' },
  { id: 'done', title: 'Done', icon: '✅' },
];

export function TaskBoardView({ tasks }: TaskBoardViewProps) {
  const tasksByStatus = statusColumns.reduce((acc, status) => {
    acc[status.id] = tasks.filter(task => task.status === status.id);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statusColumns.map((column) => (
        <Card key={column.id} className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span>{column.icon}</span>
                {column.title}
              </span>
              <Badge variant="secondary" className="ml-2">
                {tasksByStatus[column.id]?.length || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasksByStatus[column.id]?.length > 0 ? (
              tasksByStatus[column.id].map((task) => (
                <div key={task.id} className="transform scale-95">
                  <TaskCard task={task} />
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-sm">No tasks</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
