import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Clock,
  Plus,
  GripVertical,
  Trash2,
  CheckCircle,
  AlertCircle,
  Target,
  Calendar,
  Zap
} from 'lucide-react';
import { useProductivityCycle } from '@/modules/productivity-cycle/hooks/useProductivityCycle';
import { DailyGoal } from '@/modules/productivity-cycle/types/cycle';
import { useTasks } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

interface TaskSuggestion {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  estimated_time?: number;
  project?: string;
  due_date?: string;
}

export const DailyPlanningView: React.FC = () => {
  const {
    state,
    addDailyGoal,
    removeDailyGoal,
    updateDailyGoal,
    completePlanning,
    updatePhaseProgress
  } = useProductivityCycle();

  const { tasks } = useTasks();
  const [availableTasks, setAvailableTasks] = useState<TaskSuggestion[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [planningNotes, setPlanningNotes] = useState('');

  // Load available tasks (pending/incomplete tasks)
  useEffect(() => {
    const pendingTasks = tasks?.filter(task =>
      task.status !== 'completed' &&
      !state.dailyGoals.some(goal => goal.task_id === task.id)
    ) || [];

    const taskSuggestions: TaskSuggestion[] = pendingTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority || 'medium',
      estimated_time: task.estimated_time || 30,
      project: task.project_id,
      due_date: task.due_date,
    }));

    setAvailableTasks(taskSuggestions);
  }, [tasks, state.dailyGoals]);

  // Update progress based on planning completeness
  useEffect(() => {
    const hasGoals = state.dailyGoals.length > 0;
    const hasTimeBlocks = state.dailyGoals.some(goal => goal.time_block);
    const hasPriorities = state.dailyGoals.every(goal => goal.priority > 0);

    let progress = 0;
    if (hasGoals) progress += 40;
    if (hasTimeBlocks) progress += 30;
    if (hasPriorities) progress += 30;

    updatePhaseProgress(progress);
  }, [state.dailyGoals, updatePhaseProgress]);

  const handleTaskSelect = (taskId: string, selected: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (selected) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const addSelectedTasks = () => {
    selectedTasks.forEach(taskId => {
      const task = availableTasks.find(t => t.id === taskId);
      if (task) {
        const newGoal: DailyGoal = {
          id: `goal-${Date.now()}-${Math.random()}`,
          task_id: task.id,
          priority: state.dailyGoals.length + 1,
          estimated_time: task.estimated_time || 30,
          energy_required: task.priority === 'high' ? 'high' :
                         task.priority === 'low' ? 'low' : 'medium',
          date: state.currentDate,
        };
        addDailyGoal(newGoal);
      }
    });
    setSelectedTasks(new Set());
  };

  const updateGoalPriority = (goalId: string, newPriority: number) => {
    updateDailyGoal(goalId, { priority: newPriority });
  };

  const updateGoalTime = (goalId: string, time: number) => {
    updateDailyGoal(goalId, { estimated_time: time });
  };

  const updateGoalEnergy = (goalId: string, energy: 'low' | 'medium' | 'high') => {
    updateDailyGoal(goalId, { energy_required: energy });
  };

  const addTimeBlock = (goalId: string, startTime: string, duration: number) => {
    const start = new Date(`${state.currentDate}T${startTime}`);
    const end = new Date(start.getTime() + duration * 60000);

    updateDailyGoal(goalId, {
      time_block: {
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      }
    });
  };

  const finalizePlanning = () => {
    if (state.dailyGoals.length > 0) {
      completePlanning();
    }
  };

  const getTotalEstimatedTime = () => {
    return state.dailyGoals.reduce((total, goal) => total + goal.estimated_time, 0);
  };

  const getEnergyDistribution = () => {
    const distribution = { low: 0, medium: 0, high: 0 };
    state.dailyGoals.forEach(goal => {
      distribution[goal.energy_required]++;
    });
    return distribution;
  };

  const energyDistribution = getEnergyDistribution();
  const totalTime = getTotalEstimatedTime();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Planning Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Plan Your Day</h1>
          <p className="text-muted-foreground mt-1">
            Set priorities and schedule your tasks for {new Date(state.currentDate).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Time</div>
            <div className="text-lg font-semibold">{Math.floor(totalTime / 60)}h {totalTime % 60}m</div>
          </div>

          <Button
            onClick={finalizePlanning}
            disabled={state.dailyGoals.length === 0}
            className="flex items-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Start My Day</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Available Tasks */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Available Tasks</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No pending tasks found. Create some tasks first!
                </p>
              ) : (
                <>
                  {availableTasks.map(task => (
                    <div key={task.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={selectedTasks.has(task.id)}
                        onCheckedChange={(checked) => handleTaskSelect(task.id, !!checked)}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {task.priority}
                          </Badge>
                          {task.estimated_time && (
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {task.estimated_time}m
                            </span>
                          )}
                          {task.due_date && (
                            <span className="text-xs text-orange-600 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {selectedTasks.size > 0 && (
                    <Button
                      onClick={addSelectedTasks}
                      className="w-full flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add {selectedTasks.size} Selected Tasks</span>
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Middle Column: Daily Goals */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Today's Goals ({state.dailyGoals.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.dailyGoals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Select tasks from the left to add to your daily goals
                </p>
              ) : (
                state.dailyGoals
                  .sort((a, b) => a.priority - b.priority)
                  .map((goal, index) => {
                    const task = availableTasks.find(t => t.id === goal.task_id) ||
                                 tasks?.find(t => t.id === goal.task_id);

                    return (
                      <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline" className="text-xs">
                              #{goal.priority}
                            </Badge>
                            <div>
                              <h4 className="font-medium text-sm">{task?.title || 'Unknown Task'}</h4>
                              {task?.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDailyGoal(goal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Goal Configuration */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Time (minutes)</Label>
                            <Input
                              type="number"
                              value={goal.estimated_time}
                              onChange={(e) => updateGoalTime(goal.id, parseInt(e.target.value) || 0)}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Energy</Label>
                            <Select
                              value={goal.energy_required}
                              onValueChange={(value: 'low' | 'medium' | 'high') =>
                                updateGoalEnergy(goal.id, value)
                              }
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Time Block */}
                        {goal.time_block ? (
                          <div className="bg-muted/50 rounded p-2">
                            <div className="text-xs text-muted-foreground">Scheduled</div>
                            <div className="text-sm font-medium">
                              {new Date(goal.time_block.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} -
                              {new Date(goal.time_block.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="time"
                              placeholder="Start time"
                              className="h-8 flex-1"
                              onChange={(e) => {
                                if (e.target.value) {
                                  addTimeBlock(goal.id, e.target.value, goal.estimated_time);
                                }
                              }}
                            />
                            <span className="text-xs text-muted-foreground">+{goal.estimated_time}m</span>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Planning Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Planning Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Time Distribution */}
              <div>
                <h4 className="font-medium text-sm mb-2">Time Allocation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Planned</span>
                    <span className="font-medium">{Math.floor(totalTime / 60)}h {totalTime % 60}m</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Available (8h)</span>
                    <span className={cn(
                      "font-medium",
                      totalTime > 480 ? "text-orange-600" : "text-green-600"
                    )}>
                      {Math.floor((480 - totalTime) / 60)}h {(480 - totalTime) % 60}m
                    </span>
                  </div>
                  {totalTime > 480 && (
                    <div className="flex items-center space-x-1 text-orange-600 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <span>Overcommitted by {Math.floor((totalTime - 480) / 60)}h {(totalTime - 480) % 60}m</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Energy Distribution */}
              <div>
                <h4 className="font-medium text-sm mb-2">Energy Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>High Energy</span>
                    </span>
                    <span className="font-medium">{energyDistribution.high}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Medium Energy</span>
                    </span>
                    <span className="font-medium">{energyDistribution.medium}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Low Energy</span>
                    </span>
                    <span className="font-medium">{energyDistribution.low}</span>
                  </div>
                </div>
              </div>

              {/* Planning Notes */}
              <div>
                <Label className="text-sm font-medium">Planning Notes</Label>
                <Textarea
                  value={planningNotes}
                  onChange={(e) => setPlanningNotes(e.target.value)}
                  placeholder="Any thoughts about today's plan..."
                  className="mt-1 min-h-[80px]"
                />
              </div>

              {/* Planning Status */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Planning Checklist</h4>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className={cn(
                      "h-4 w-4",
                      state.dailyGoals.length > 0 ? "text-green-500" : "text-muted-foreground"
                    )} />
                    <span>Tasks selected ({state.dailyGoals.length})</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className={cn(
                      "h-4 w-4",
                      state.dailyGoals.every(g => g.priority > 0) ? "text-green-500" : "text-muted-foreground"
                    )} />
                    <span>Priorities set</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className={cn(
                      "h-4 w-4",
                      state.dailyGoals.some(g => g.time_block) ? "text-green-500" : "text-muted-foreground"
                    )} />
                    <span>Time blocks added</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};