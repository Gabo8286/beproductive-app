import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Target,
  CheckCircle,
  Clock,
  Zap,
  ArrowRight,
  Trash2,
  Edit,
  Filter,
  SortAsc,
  Calendar,
  AlertCircle,
  FileText,
  Lightbulb
} from 'lucide-react';
import { useProductivityCycle } from '@/modules/productivity-cycle/hooks/useProductivityCycle';
import { useTasks } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

interface CaptureTaskForm {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_time: number;
  energy_required: 'low' | 'medium' | 'high';
}

interface PriorityMatrix {
  urgent_important: any[];
  not_urgent_important: any[];
  urgent_not_important: any[];
  not_urgent_not_important: any[];
}

export const CaptureAndRecordView: React.FC = () => {
  const { state, addDailyGoal, completeCapture, addAdjustment } = useProductivityCycle();
  const { data: allTasks = [] } = useTasks();

  const [captureForm, setCaptureForm] = useState<CaptureTaskForm>({
    title: '',
    description: '',
    priority: 'medium',
    estimated_time: 30,
    energy_required: 'medium',
  });

  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'capture' | 'organize' | 'review'>('capture');
  const [yesterdayReview, setYesterdayReview] = useState('');

  // Filter available tasks (not completed, not already in today's goals)
  const availableTasks = allTasks.filter(task =>
    task.status !== 'done' &&
    !state.dailyGoals.some(goal => goal.task_id === task.id)
  );

  // Create priority matrix for organization
  const createPriorityMatrix = (tasks: any[]): PriorityMatrix => {
    return tasks.reduce((matrix, task) => {
      const isUrgent = task.priority === 'urgent' || (task.due_date && new Date(task.due_date) <= new Date(Date.now() + 24 * 60 * 60 * 1000));
      const isImportant = task.priority === 'high' || task.priority === 'urgent';

      if (isUrgent && isImportant) {
        matrix.urgent_important.push(task);
      } else if (!isUrgent && isImportant) {
        matrix.not_urgent_important.push(task);
      } else if (isUrgent && !isImportant) {
        matrix.urgent_not_important.push(task);
      } else {
        matrix.not_urgent_not_important.push(task);
      }

      return matrix;
    }, {
      urgent_important: [],
      not_urgent_important: [],
      urgent_not_important: [],
      not_urgent_not_important: []
    });
  };

  const priorityMatrix = createPriorityMatrix(availableTasks);

  const handleQuickCapture = () => {
    if (!captureForm.title.trim()) return;

    // Create a quick task entry - in real app this would create an actual task
    const quickTask = {
      id: Date.now().toString(),
      title: captureForm.title,
      description: captureForm.description,
      priority: captureForm.priority,
      estimated_time: captureForm.estimated_time,
      energy_required: captureForm.energy_required,
      status: 'todo' as const,
      created_at: new Date().toISOString(),
    };

    // Add to daily goals immediately
    addDailyGoal({
      id: Date.now().toString(),
      task_id: quickTask.id,
      priority: state.dailyGoals.length + 1,
      estimated_time: captureForm.estimated_time,
      energy_required: captureForm.energy_required,
      date: state.currentDate,
    });

    // Reset form
    setCaptureForm({
      title: '',
      description: '',
      priority: 'medium',
      estimated_time: 30,
      energy_required: 'medium',
    });
  };

  const handleSelectTask = (taskId: string) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    } else {
      setSelectedTasks(prev => [...prev, taskId]);
    }
  };

  const handleAddSelectedTasks = () => {
    selectedTasks.forEach((taskId, index) => {
      const task = availableTasks.find(t => t.id === taskId);
      if (task) {
        addDailyGoal({
          id: Date.now().toString() + index,
          task_id: taskId,
          priority: state.dailyGoals.length + index + 1,
          estimated_time: 30, // Default estimate
          energy_required: 'medium',
          date: state.currentDate,
        });
      }
    });
    setSelectedTasks([]);
  };

  const handleCompleteCapture = () => {
    if (yesterdayReview) {
      // Apply learnings as adjustments
      addAdjustment({
        id: Date.now().toString(),
        date: state.currentDate,
        type: 'workload_balance',
        description: yesterdayReview,
        applied: true,
        created_at: new Date().toISOString(),
      });
    }
    completeCapture();
  };

  const getViewProgress = () => {
    switch (viewMode) {
      case 'capture':
        return 33;
      case 'organize':
        return 66;
      case 'review':
        return 100;
      default:
        return 0;
    }
  };

  const getPriorityMatrixQuadrant = (key: keyof PriorityMatrix, title: string, description: string, color: string) => (
    <Card key={key} className={cn('h-64 overflow-y-auto', color)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {priorityMatrix[key].map((task: any) => (
            <div
              key={task.id}
              className={cn(
                'p-2 rounded border cursor-pointer transition-colors text-xs',
                selectedTasks.includes(task.id)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-accent'
              )}
              onClick={() => handleSelectTask(task.id)}
            >
              <div className="font-medium truncate">{task.title}</div>
              <div className="text-muted-foreground truncate">{task.description}</div>
            </div>
          ))}
          {priorityMatrix[key].length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No tasks in this category</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Capture & Record</h1>
        <p className="text-muted-foreground">
          Sort, clean, and prioritize your work for the day
        </p>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Capture Progress</span>
            <span className="text-sm text-muted-foreground">{getViewProgress()}%</span>
          </div>
          <Progress value={getViewProgress()} className="h-2" />
          <div className="flex justify-between mt-2">
            <Button
              variant={viewMode === 'capture' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('capture')}
            >
              📝 Capture
            </Button>
            <Button
              variant={viewMode === 'organize' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('organize')}
            >
              🎯 Organize
            </Button>
            <Button
              variant={viewMode === 'review' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('review')}
            >
              ✅ Review
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Capture Phase */}
      {viewMode === 'capture' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quick Capture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Capture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="What needs to be done?"
                value={captureForm.title}
                onChange={(e) => setCaptureForm(prev => ({ ...prev, title: e.target.value }))}
              />

              <Textarea
                placeholder="Additional details..."
                value={captureForm.description}
                onChange={(e) => setCaptureForm(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[80px]"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={captureForm.priority}
                    onValueChange={(value: any) => setCaptureForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Low</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="high">🟠 High</SelectItem>
                      <SelectItem value="urgent">🔴 Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Est. Time (min)</label>
                  <Input
                    type="number"
                    min="5"
                    max="480"
                    step="5"
                    value={captureForm.estimated_time}
                    onChange={(e) => setCaptureForm(prev => ({ ...prev, estimated_time: parseInt(e.target.value) || 30 }))}
                  />
                </div>
              </div>

              <Button onClick={handleQuickCapture} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Capture Task
              </Button>
            </CardContent>
          </Card>

          {/* Yesterday's Review */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Yesterday's Learnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="What did you learn yesterday? What adjustments should you make today?"
                value={yesterdayReview}
                onChange={(e) => setYesterdayReview(e.target.value)}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Reflections from yesterday will be applied as adjustments for today's planning.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Organize Phase - Priority Matrix */}
      {viewMode === 'organize' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Eisenhower Priority Matrix</h3>
            <p className="text-muted-foreground">Organize tasks by urgency and importance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getPriorityMatrixQuadrant(
              'urgent_important',
              '🔥 DO (Urgent + Important)',
              'Crisis, emergencies, deadline-driven projects',
              'border-red-200 bg-red-50'
            )}

            {getPriorityMatrixQuadrant(
              'not_urgent_important',
              '📅 SCHEDULE (Important + Not Urgent)',
              'Prevention, planning, development, relationships',
              'border-green-200 bg-green-50'
            )}

            {getPriorityMatrixQuadrant(
              'urgent_not_important',
              '👥 DELEGATE (Urgent + Not Important)',
              'Interruptions, some emails, some meetings',
              'border-yellow-200 bg-yellow-50'
            )}

            {getPriorityMatrixQuadrant(
              'not_urgent_not_important',
              '🗑️ DELETE (Not Urgent + Not Important)',
              'Time wasters, excessive social media, trivial activities',
              'border-gray-200 bg-gray-50'
            )}
          </div>

          {selectedTasks.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedTasks.length} tasks selected
                  </span>
                  <Button onClick={handleAddSelectedTasks}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Today's Goals
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Review Phase */}
      {viewMode === 'review' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Today's Goals Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{state.dailyGoals.length}</div>
                  <div className="text-sm text-muted-foreground">Goals Set</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {state.dailyGoals.reduce((acc, goal) => acc + goal.estimated_time, 0)}m
                  </div>
                  <div className="text-sm text-muted-foreground">Estimated Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {state.dailyGoals.filter(g => g.energy_required === 'high').length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Energy Tasks</div>
                </div>
              </div>

              <div className="space-y-3">
                {state.dailyGoals.map((goal, index) => (
                  <div key={goal.id} className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                    <Badge variant="outline">{index + 1}</Badge>
                    <div className="flex-1">
                      <div className="font-medium">Goal {index + 1}</div>
                      <div className="text-sm text-muted-foreground">
                        {goal.estimated_time}m • {goal.energy_required} energy
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={goal.energy_required === 'high' ? 'destructive' : 'secondary'}>
                        {goal.energy_required}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {state.dailyGoals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No goals set yet. Go back to capture some tasks!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {state.dailyGoals.length > 0 && (
            <div className="text-center">
              <Button onClick={handleCompleteCapture} size="lg" className="gap-2">
                <CheckCircle className="h-5 w-5" />
                Complete Capture & Start Execution
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};