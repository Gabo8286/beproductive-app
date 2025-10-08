import { useState } from 'react';
import { Target, Activity, CheckSquare, TrendingUp, Calendar, ChevronRight, Sparkles, Filter } from 'lucide-react';
import { BaseWidget } from './BaseWidget';
import { WidgetActions } from './WidgetActions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoals } from '@/hooks/useGoals';
import { useHabits } from '@/hooks/useHabits';
import { useTasks } from '@/hooks/useTasks';
import { useHabitGoalLinks } from '@/hooks/useHabitGoalLinks';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProgressData {
  goals: {
    total: number;
    active: number;
    completed: number;
    averageProgress: number;
  };
  habits: {
    total: number;
    active: number;
    completedToday: number;
    currentStreaks: number;
  };
  tasks: {
    total: number;
    completed: number;
    overdue: number;
    todayTasks: number;
    habitTasks: number;
  };
  connections: {
    linkedHabits: number;
    aiSuggestions: number;
    totalConnections: number;
  };
}

interface GoalProgressItem {
  id: string;
  title: string;
  progress: number;
  status: string;
  linkedHabits: number;
  dueDate?: string;
  category: string;
}

export function UnifiedProgressWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const workspaceId = user?.id || '';

  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [showDetails, setShowDetails] = useState(false);

  const { goals = [], isLoading: goalsLoading } = useGoals();
  const { data: habits = [], isLoading: habitsLoading } = useHabits(workspaceId);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: habitGoalLinks = [] } = useHabitGoalLinks();

  const isLoading = goalsLoading || habitsLoading || tasksLoading;

  // Calculate progress data
  const progressData: ProgressData = {
    goals: {
      total: goals.length,
      active: goals.filter(g => g.status === 'active').length,
      completed: goals.filter(g => g.status === 'completed').length,
      averageProgress: goals.length > 0
        ? goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length
        : 0
    },
    habits: {
      total: habits.filter(h => !h.archived_at).length,
      active: habits.filter(h => !h.archived_at && h.current_streak > 0).length,
      completedToday: 0, // This would need to be calculated from habit_entries
      currentStreaks: habits.reduce((sum, h) => sum + (h.current_streak || 0), 0)
    },
    tasks: {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'done').length,
      overdue: tasks.filter(t =>
        t.due_date &&
        new Date(t.due_date) < new Date() &&
        t.status !== 'done'
      ).length,
      todayTasks: tasks.filter(t =>
        t.due_date && isToday(new Date(t.due_date))
      ).length,
      habitTasks: tasks.filter(t => t.habit_id && t.auto_generated).length
    },
    connections: {
      linkedHabits: habitGoalLinks.length,
      aiSuggestions: 0, // This would need to be calculated from ai_habit_suggestions
      totalConnections: habitGoalLinks.length
    }
  };

  // Get top goals with their progress and connections
  const topGoals: GoalProgressItem[] = goals
    .filter(g => g.status === 'active')
    .map(goal => ({
      id: goal.id,
      title: goal.title,
      progress: goal.progress || 0,
      status: goal.status,
      linkedHabits: habitGoalLinks.filter(link => link.goal_id === goal.id).length,
      dueDate: goal.target_date,
      category: goal.category
    }))
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  const getFilteredTasks = () => {
    const now = new Date();
    switch (timeFilter) {
      case 'today':
        return tasks.filter(t => t.due_date && isToday(new Date(t.due_date)));
      case 'week':
        return tasks.filter(t => t.due_date && isThisWeek(new Date(t.due_date)));
      case 'month':
        return tasks.filter(t => t.due_date && isThisMonth(new Date(t.due_date)));
      default:
        return tasks;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-blue-600';
    if (progress >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOverallScore = () => {
    const goalScore = progressData.goals.averageProgress * 0.4;
    const habitScore = progressData.habits.total > 0
      ? (progressData.habits.active / progressData.habits.total) * 100 * 0.3
      : 0;
    const taskScore = progressData.tasks.total > 0
      ? (progressData.tasks.completed / progressData.tasks.total) * 100 * 0.3
      : 0;

    return Math.round(goalScore + habitScore + taskScore);
  };

  return (
    <BaseWidget
      title="Progress Interconnect"
      subtitle="Your holistic achievement view"
      icon={<TrendingUp className="h-4 w-4" />}
      size="large"
      variant="glass"
      isLoading={isLoading}
      actions={
        <WidgetActions
          onRefresh={() => window.location.reload()}
          isRefreshing={isLoading}
        />
      }
    >
      <div className="space-y-6">
        {/* Overall Score */}
        <div className="text-center space-y-2">
          <div className={cn("text-4xl font-bold", getProgressColor(getOverallScore()))}>
            {getOverallScore()}%
          </div>
          <p className="text-sm text-muted-foreground">Overall Progress Score</p>
          <Progress value={getOverallScore()} className="h-2" />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center space-y-1 p-3 bg-muted/30 rounded-lg">
            <Target className="h-5 w-5 mx-auto text-primary" />
            <div className="text-lg font-semibold">{progressData.goals.active}</div>
            <div className="text-xs text-muted-foreground">Active Goals</div>
          </div>

          <div className="text-center space-y-1 p-3 bg-muted/30 rounded-lg">
            <Activity className="h-5 w-5 mx-auto text-green-600" />
            <div className="text-lg font-semibold">{progressData.habits.active}</div>
            <div className="text-xs text-muted-foreground">Active Habits</div>
          </div>

          <div className="text-center space-y-1 p-3 bg-muted/30 rounded-lg">
            <CheckSquare className="h-5 w-5 mx-auto text-blue-600" />
            <div className="text-lg font-semibold">{progressData.tasks.todayTasks}</div>
            <div className="text-xs text-muted-foreground">Today's Tasks</div>
          </div>
        </div>

        <Separator />

        {/* Time Filter */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Recent Progress</h4>
          <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Top Goals Progress */}
        {topGoals.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Top Active Goals
            </h4>
            {topGoals.map((goal) => (
              <div
                key={goal.id}
                className="p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/goals/${goal.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium truncate">{goal.title}</h5>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {goal.category}
                      </Badge>
                      {goal.linkedHabits > 0 && (
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {goal.linkedHabits} habits
                        </span>
                      )}
                      {goal.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(goal.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-medium", getProgressColor(goal.progress))}>
                      {Math.round(goal.progress)}%
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <Progress value={goal.progress} className="h-1.5" />
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Habit Streaks</span>
              <span className="font-medium">{progressData.habits.currentStreaks} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completed Tasks</span>
              <span className="font-medium">
                {progressData.tasks.completed}/{progressData.tasks.total}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Connected Habits</span>
              <span className="font-medium">{progressData.connections.linkedHabits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Overdue Tasks</span>
              <span className={cn("font-medium", progressData.tasks.overdue > 0 && "text-red-600")}>
                {progressData.tasks.overdue}
              </span>
            </div>
          </div>
        </div>

        {/* AI Insights Hint */}
        {progressData.goals.active > 0 && progressData.connections.linkedHabits === 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 text-sm">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">AI Suggestion</span>
            </div>
            <p className="text-blue-600 text-xs mt-1">
              Connect habits to your goals or get AI suggestions to accelerate progress.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 text-blue-700 border-blue-300 hover:bg-blue-100"
              onClick={() => navigate('/goals')}
            >
              Explore AI Suggestions
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex-1"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Full Dashboard
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Detailed View */}
        {showDetails && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium">Detailed Breakdown</h4>

            <div className="grid grid-cols-1 gap-3 text-xs">
              <div className="p-2 bg-muted/30 rounded">
                <div className="font-medium">Goals ({progressData.goals.total})</div>
                <div className="text-muted-foreground">
                  {progressData.goals.completed} completed, {progressData.goals.active} active
                </div>
              </div>

              <div className="p-2 bg-muted/30 rounded">
                <div className="font-medium">Habits ({progressData.habits.total})</div>
                <div className="text-muted-foreground">
                  {progressData.habits.active} with active streaks
                </div>
              </div>

              <div className="p-2 bg-muted/30 rounded">
                <div className="font-medium">Tasks ({progressData.tasks.total})</div>
                <div className="text-muted-foreground">
                  {progressData.tasks.habitTasks} auto-generated from habits
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseWidget>
  );
}