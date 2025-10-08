import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarDays, Clock, Play, CheckCircle2, Calendar, RotateCcw, Settings, Zap } from 'lucide-react';
import { useHabitTaskGeneration, HabitTaskRecord } from '@/hooks/useHabitTaskGeneration';
import { format, isToday, isTomorrow, isPast, isFuture } from 'date-fns';
import { cn } from '@/lib/utils';

interface HabitTaskManagerProps {
  habitId: string;
  habitTitle: string;
  habitFrequency: string;
  className?: string;
}

const getTaskStatusColor = (status: string, dueDate?: string) => {
  if (status === 'done') return 'bg-green-500/10 text-green-700 border-green-200';
  if (status === 'in_progress') return 'bg-blue-500/10 text-blue-700 border-blue-200';
  if (status === 'blocked') return 'bg-red-500/10 text-red-700 border-red-200';

  if (dueDate && isPast(new Date(dueDate)) && status !== 'done') {
    return 'bg-red-500/10 text-red-700 border-red-200';
  }

  if (status === 'scheduled') return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
  return 'bg-gray-500/10 text-gray-700 border-gray-200';
};

const getDateDisplay = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM d');
};

function TaskCard({
  task,
  onStatusChange,
  onEdit
}: {
  task: HabitTaskRecord;
  onStatusChange: (taskId: string, status: string) => void;
  onEdit: (task: HabitTaskRecord) => void;
}) {
  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'done';
  const isUpcoming = task.due_date && isFuture(new Date(task.due_date));

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isOverdue && "border-red-200 bg-red-50/50",
      task.status === 'done' && "border-green-200 bg-green-50/50"
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <h4 className={cn(
                "font-medium",
                task.status === 'done' && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h4>
              {task.description && (
                <p className="text-sm text-muted-foreground">{task.description}</p>
              )}
            </div>
            <Badge className={getTaskStatusColor(task.status, task.due_date)}>
              {task.status === 'todo' ? 'pending' : task.status}
            </Badge>
          </div>

          {/* Details */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {task.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className={cn(isOverdue && "text-red-600 font-medium")}>
                  {getDateDisplay(task.due_date)}
                </span>
              </div>
            )}

            {task.estimated_duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{task.estimated_duration}m</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <RotateCcw className="h-3 w-3" />
              <span>Auto-generated</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={task.status === 'done'}
                onCheckedChange={(checked) => {
                  onStatusChange(task.id, checked ? 'done' : 'todo');
                }}
              />
              <span className="text-sm text-muted-foreground">Mark complete</span>
            </div>

            <div className="flex gap-2">
              {task.status !== 'done' && task.status !== 'in_progress' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(task.id, 'in_progress')}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Start
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(task)}
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GenerateTasksDialog({
  open,
  onOpenChange,
  onGenerate,
  isLoading,
  habitTitle
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (params: { startDate: Date; daysAhead: number }) => void;
  isLoading: boolean;
  habitTitle: string;
}) {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [daysAhead, setDaysAhead] = useState(7);

  const handleGenerate = () => {
    onGenerate({
      startDate: new Date(startDate),
      daysAhead
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Recurring Tasks</DialogTitle>
          <DialogDescription>
            Create recurring tasks for the habit "{habitTitle}" based on its frequency pattern.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="days-ahead">Days Ahead</Label>
              <Input
                id="days-ahead"
                type="number"
                min="1"
                max="90"
                value={daysAhead}
                onChange={(e) => setDaysAhead(parseInt(e.target.value) || 7)}
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            This will create tasks for the next {daysAhead} days starting from {format(new Date(startDate), 'MMMM d, yyyy')}.
            Tasks will be generated based on the habit's frequency pattern.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Tasks"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function HabitTaskManager({
  habitId,
  habitTitle,
  habitFrequency,
  className
}: HabitTaskManagerProps) {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<HabitTaskRecord | null>(null);

  const {
    getHabitTasks,
    generateTasks,
    isGeneratingTasks,
    updateRecurringTask,
    isUpdatingRecurringTask
  } = useHabitTaskGeneration();

  const { data: tasks = [], isLoading } = getHabitTasks(habitId);

  const completedTasks = tasks.filter(t => t.status === 'done');
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const overdueTasks = pendingTasks.filter(t =>
    t.due_date && isPast(new Date(t.due_date))
  );

  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  const handleGenerateTasks = (params: { startDate: Date; daysAhead: number }) => {
    generateTasks({
      habitId,
      startDate: params.startDate,
      daysAhead: params.daysAhead
    });
    setShowGenerateDialog(false);
  };

  const handleStatusChange = (taskId: string, status: string) => {
    updateRecurringTask({
      taskId,
      updates: {
        status: status as any,
        completed_at: status === 'done' ? new Date().toISOString() : undefined
      }
    });
  };

  const handleEditTask = (task: HabitTaskRecord) => {
    setEditingTask(task);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Recurring Tasks
          </h3>
          <p className="text-sm text-muted-foreground">
            Auto-generated tasks from "{habitTitle}" ({habitFrequency} frequency)
          </p>
        </div>

        <Button onClick={() => setShowGenerateDialog(true)} disabled={isGeneratingTasks}>
          <CalendarDays className="h-4 w-4 mr-2" />
          {isGeneratingTasks ? "Generating..." : "Generate Tasks"}
        </Button>
      </div>

      {/* Stats */}
      {tasks.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">{tasks.length}</div>
                <div className="text-xs text-muted-foreground">Total Tasks</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
                <div className="text-xs text-muted-foreground">Overdue</div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-medium">{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading tasks...</p>
        </div>
      )}

      {/* Tasks */}
      {tasks.length > 0 ? (
        <div className="space-y-4">
          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-red-600 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Overdue ({overdueTasks.length})
              </h4>
              <div className="space-y-3">
                {overdueTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onEdit={handleEditTask}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Tasks */}
          {pendingTasks.filter(t => !overdueTasks.includes(t)).length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Upcoming ({pendingTasks.filter(t => !overdueTasks.includes(t)).length})
              </h4>
              <div className="space-y-3">
                {pendingTasks
                  .filter(t => !overdueTasks.includes(t))
                  .sort((a, b) => new Date(a.due_date || '').getTime() - new Date(b.due_date || '').getTime())
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onEdit={handleEditTask}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <details className="space-y-3">
              <summary className="font-medium flex items-center gap-2 cursor-pointer">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Completed ({completedTasks.length})
              </summary>
              <div className="space-y-3 mt-3">
                {completedTasks
                  .sort((a, b) => new Date(b.completed_at || '').getTime() - new Date(a.completed_at || '').getTime())
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onEdit={handleEditTask}
                    />
                  ))}
              </div>
            </details>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h4 className="font-medium mb-2">No recurring tasks yet</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Generate recurring tasks based on this habit's frequency to start tracking your progress.
              </p>
              <Button onClick={() => setShowGenerateDialog(true)}>
                <CalendarDays className="h-4 w-4 mr-2" />
                Generate First Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Tasks Dialog */}
      <GenerateTasksDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        onGenerate={handleGenerateTasks}
        isLoading={isGeneratingTasks}
        habitTitle={habitTitle}
      />
    </div>
  );
}