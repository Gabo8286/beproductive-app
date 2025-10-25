import React, { useState, useCallback } from 'react';
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
  Brain,
  Zap,
  BarChart3,
  Play,
  Pause,
  Stop,
  Calendar,
  Tag,
  Flag,
  ArrowRight,
  ArrowLeft,
  Save,
  Edit3,
  Trash2,
  RefreshCw
} from 'lucide-react';

/**
 * Productivity Cycle Types
 */
type CyclePhase = 'capture' | 'plan' | 'engage' | 'execute' | 'reflect';

type Priority = 'low' | 'medium' | 'high' | 'urgent';

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  category?: string;
  tags?: string[];
  estimatedTime?: number;
  actualTime?: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  category: string;
  targetDate?: Date;
  createdAt: Date;
  tasks: Task[];
}

interface CycleSession {
  id: string;
  phase: CyclePhase;
  startTime: Date;
  endTime?: Date;
  tasks: Task[];
  goals: Goal[];
  notes?: string;
  mood?: number;
  energy?: number;
  focus?: number;
}

/**
 * Unified Productivity Interface Props
 */
interface UnifiedProductivityInterfaceProps {
  initialPhase?: CyclePhase;
  onPhaseChange?: (phase: CyclePhase) => void;
  onTaskCreate?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete?: (taskId: string) => void;
  onGoalCreate?: (goal: Omit<Goal, 'id' | 'createdAt' | 'tasks'>) => void;
  onGoalUpdate?: (goalId: string, updates: Partial<Goal>) => void;
  onSessionStart?: (phase: CyclePhase) => void;
  onSessionEnd?: (session: Partial<CycleSession>) => void;
  className?: string;
}

/**
 * Unified Productivity Interface Component
 * Consolidates all duplicate productivity cycle components into a single, reusable interface
 */
export const UnifiedProductivityInterface: React.FC<UnifiedProductivityInterfaceProps> = ({
  initialPhase = 'capture',
  onPhaseChange,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  onGoalCreate,
  onGoalUpdate,
  onSessionStart,
  onSessionEnd,
  className = ''
}) => {
  // State management
  const [currentPhase, setCurrentPhase] = useState<CyclePhase>(initialPhase);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentSession, setCurrentSession] = useState<CycleSession | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Form states
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    category: '',
    estimatedTime: 30,
    dueDate: ''
  });

  const [newGoalForm, setNewGoalForm] = useState({
    title: '',
    description: '',
    category: '',
    targetDate: ''
  });

  // Phase configuration
  const phaseConfig = {
    capture: {
      title: 'Capture & Record',
      icon: Brain,
      description: 'Collect thoughts, ideas, and tasks',
      color: 'bg-blue-50 border-blue-200',
      actions: ['Add Task', 'Add Goal', 'Quick Note']
    },
    plan: {
      title: 'Plan & Organize',
      icon: Target,
      description: 'Structure and prioritize your work',
      color: 'bg-green-50 border-green-200',
      actions: ['Set Priorities', 'Schedule', 'Group Tasks']
    },
    engage: {
      title: 'Engage & Control',
      icon: Zap,
      description: 'Review and adjust your approach',
      color: 'bg-yellow-50 border-yellow-200',
      actions: ['Review Progress', 'Adjust Plan', 'Set Focus']
    },
    execute: {
      title: 'Execute & Monitor',
      icon: Play,
      description: 'Work on tasks and track progress',
      color: 'bg-orange-50 border-orange-200',
      actions: ['Start Task', 'Track Time', 'Update Status']
    },
    reflect: {
      title: 'Reflect & Learn',
      icon: BarChart3,
      description: 'Review outcomes and plan improvements',
      color: 'bg-purple-50 border-purple-200',
      actions: ['Review Session', 'Log Insights', 'Plan Next']
    }
  };

  // Event handlers
  const handlePhaseChange = useCallback((newPhase: CyclePhase) => {
    setCurrentPhase(newPhase);
    onPhaseChange?.(newPhase);
  }, [onPhaseChange]);

  const handleSessionStart = useCallback(() => {
    const session: CycleSession = {
      id: `session-${Date.now()}`,
      phase: currentPhase,
      startTime: new Date(),
      tasks: [...tasks],
      goals: [...goals]
    };

    setCurrentSession(session);
    setIsSessionActive(true);
    onSessionStart?.(currentPhase);
  }, [currentPhase, tasks, goals, onSessionStart]);

  const handleSessionEnd = useCallback(() => {
    if (currentSession) {
      const endedSession = {
        ...currentSession,
        endTime: new Date()
      };

      setCurrentSession(null);
      setIsSessionActive(false);
      onSessionEnd?.(endedSession);
    }
  }, [currentSession, onSessionEnd]);

  const handleTaskCreate = useCallback(() => {
    if (!newTaskForm.title.trim()) return;

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTaskForm.title,
      description: newTaskForm.description,
      priority: newTaskForm.priority,
      status: 'pending',
      category: newTaskForm.category,
      estimatedTime: newTaskForm.estimatedTime,
      dueDate: newTaskForm.dueDate ? new Date(newTaskForm.dueDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTasks(prev => [...prev, task]);
    onTaskCreate?.(task);

    // Reset form
    setNewTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      estimatedTime: 30,
      dueDate: ''
    });
  }, [newTaskForm, onTaskCreate]);

  const handleGoalCreate = useCallback(() => {
    if (!newGoalForm.title.trim()) return;

    const goal: Goal = {
      id: `goal-${Date.now()}`,
      title: newGoalForm.title,
      description: newGoalForm.description,
      status: 'active',
      progress: 0,
      category: newGoalForm.category,
      targetDate: newGoalForm.targetDate ? new Date(newGoalForm.targetDate) : undefined,
      createdAt: new Date(),
      tasks: []
    };

    setGoals(prev => [...prev, goal]);
    onGoalCreate?.(goal);

    // Reset form
    setNewGoalForm({
      title: '',
      description: '',
      category: '',
      targetDate: ''
    });
  }, [newGoalForm, onGoalCreate]);

  const handleTaskStatusUpdate = useCallback((taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, status, updatedAt: new Date() }
        : task
    ));
    onTaskUpdate?.(taskId, { status });
  }, [onTaskUpdate]);

  // Render methods
  const renderPhaseNavigation = () => {
    const phases: CyclePhase[] = ['capture', 'plan', 'engage', 'execute', 'reflect'];

    return (
      <div className="flex flex-wrap gap-2 mb-6">
        {phases.map((phase) => {
          const config = phaseConfig[phase];
          const Icon = config.icon;
          const isActive = currentPhase === phase;

          return (
            <Button
              key={phase}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePhaseChange(phase)}
              className={`flex items-center gap-2 ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
            >
              <Icon className="w-4 h-4" />
              {config.title}
            </Button>
          );
        })}
      </div>
    );
  };

  const renderSessionControls = () => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Session Control</CardTitle>
          <div className="flex items-center gap-2">
            {isSessionActive ? (
              <>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Active Session
                </Badge>
                <Button size="sm" variant="outline" onClick={handleSessionEnd}>
                  <Stop className="w-4 h-4 mr-1" />
                  End Session
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={handleSessionStart}>
                <Play className="w-4 h-4 mr-1" />
                Start Session
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      {isSessionActive && currentSession && (
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Started: {currentSession.startTime.toLocaleTimeString()}
          </div>
        </CardContent>
      )}
    </Card>
  );

  const renderPhaseContent = () => {
    const config = phaseConfig[currentPhase];
    const Icon = config.icon;

    return (
      <Card className={`${config.color} border-2`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="w-6 h-6" />
            {config.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </CardHeader>
        <CardContent>
          {currentPhase === 'capture' && renderCaptureContent()}
          {currentPhase === 'plan' && renderPlanContent()}
          {currentPhase === 'engage' && renderEngageContent()}
          {currentPhase === 'execute' && renderExecuteContent()}
          {currentPhase === 'reflect' && renderReflectContent()}
        </CardContent>
      </Card>
    );
  };

  const renderCaptureContent = () => (
    <div className="space-y-6">
      {/* Task Creation Form */}
      <div className="space-y-4">
        <h3 className="font-medium">Capture New Task</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Task title"
            value={newTaskForm.title}
            onChange={(e) => setNewTaskForm(prev => ({ ...prev, title: e.target.value }))}
          />
          <Select
            value={newTaskForm.priority}
            onValueChange={(value: Priority) => setNewTaskForm(prev => ({ ...prev, priority: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Textarea
          placeholder="Task description (optional)"
          value={newTaskForm.description}
          onChange={(e) => setNewTaskForm(prev => ({ ...prev, description: e.target.value }))}
        />
        <div className="flex gap-2">
          <Button onClick={handleTaskCreate}>
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </Button>
        </div>
      </div>

      <Separator />

      {/* Goal Creation Form */}
      <div className="space-y-4">
        <h3 className="font-medium">Capture New Goal</h3>
        <Input
          placeholder="Goal title"
          value={newGoalForm.title}
          onChange={(e) => setNewGoalForm(prev => ({ ...prev, title: e.target.value }))}
        />
        <Textarea
          placeholder="Goal description (optional)"
          value={newGoalForm.description}
          onChange={(e) => setNewGoalForm(prev => ({ ...prev, description: e.target.value }))}
        />
        <Button onClick={handleGoalCreate}>
          <Target className="w-4 h-4 mr-1" />
          Add Goal
        </Button>
      </div>
    </div>
  );

  const renderPlanContent = () => (
    <div className="space-y-6">
      <h3 className="font-medium">Organize & Prioritize</h3>
      {tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <Flag className={`w-4 h-4 ${getPriorityColor(task.priority)}`} />
                <span className="font-medium">{task.title}</span>
                <Badge variant="outline">{task.priority}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost">
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No tasks to organize. Start by capturing some tasks.</p>
      )}
    </div>
  );

  const renderEngageContent = () => (
    <div className="space-y-6">
      <h3 className="font-medium">Review & Adjust</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Progress Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Tasks Completed</span>
                <span>{tasks.filter(t => t.status === 'completed').length}/{tasks.length}</span>
              </div>
              <Progress value={(tasks.filter(t => t.status === 'completed').length / Math.max(tasks.length, 1)) * 100} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Current Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {tasks.filter(t => t.status === 'in_progress').length > 0
                ? `Working on ${tasks.filter(t => t.status === 'in_progress').length} task(s)`
                : 'No active tasks'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderExecuteContent = () => (
    <div className="space-y-6">
      <h3 className="font-medium">Execute Tasks</h3>
      {tasks.filter(t => t.status !== 'completed').length > 0 ? (
        <div className="space-y-3">
          {tasks.filter(t => t.status !== 'completed').map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleTaskStatusUpdate(task.id, task.status === 'in_progress' ? 'pending' : 'in_progress')}
                >
                  {task.status === 'in_progress' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {task.estimatedTime && `Est. ${task.estimatedTime}min`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={task.status === 'in_progress' ? 'default' : 'outline'}>
                  {task.status.replace('_', ' ')}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleTaskStatusUpdate(task.id, 'completed')}
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">All tasks completed! Great work!</p>
      )}
    </div>
  );

  const renderReflectContent = () => (
    <div className="space-y-6">
      <h3 className="font-medium">Session Reflection</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.status === 'completed').length}
            </div>
            <p className="text-sm text-muted-foreground">tasks finished</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {tasks.filter(t => t.status === 'in_progress').length}
            </div>
            <p className="text-sm text-muted-foreground">tasks ongoing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {tasks.filter(t => t.status === 'pending').length}
            </div>
            <p className="text-sm text-muted-foreground">tasks remaining</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Helper functions
  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case 'urgent': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {renderPhaseNavigation()}
      {renderSessionControls()}
      {renderPhaseContent()}
    </div>
  );
};

export default UnifiedProductivityInterface;