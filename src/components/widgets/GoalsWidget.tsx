import { Target, Plus, TrendingUp } from "lucide-react";
import { BaseWidget } from "./BaseWidget";
import { WidgetActions } from "./WidgetActions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useGoals } from "@/hooks/useGoals";
import { useNavigate } from "react-router-dom";

export function GoalsWidget() {
  const navigate = useNavigate();
  const { goals = [], isLoading } = useGoals();

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedThisMonth = goals.filter(goal =>
    goal.status === 'completed' &&
    goal.completed_at &&
    new Date(goal.completed_at).getMonth() === new Date().getMonth()
  );

  const averageProgress = activeGoals.length > 0
    ? activeGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / activeGoals.length
    : 0;

  const upcomingDeadlines = activeGoals
    .filter(goal => goal.target_date)
    .sort((a, b) => new Date(a.target_date!).getTime() - new Date(b.target_date!).getTime())
    .slice(0, 3);

  return (
    <BaseWidget
      title="Destinations"
      subtitle="Your journey goals"
      icon={<Target className="h-4 w-4" />}
      size="medium"
      variant="glass"
      isLoading={isLoading}
      actions={
        <WidgetActions
          onRefresh={() => window.location.reload()}
          isRefreshing={isLoading}
        />
      }
    >
      <div className="space-y-4">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{Math.round(averageProgress)}%</span>
          </div>
          <Progress value={averageProgress} className="h-2" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">{activeGoals.length}</div>
            <div className="text-xs text-muted-foreground">Active destinations</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-success">{completedThisMonth.length}</div>
            <div className="text-xs text-muted-foreground">Reached this month</div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        {upcomingDeadlines.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Upcoming Deadlines
            </h4>
            <div className="space-y-2">
              {upcomingDeadlines.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{goal.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(goal.target_date!).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(goal.progress || 0)}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            onClick={() => navigate('/goals')}
            className="flex-1 apple-button"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            View Progress
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate('/goals/new')}
            className="apple-button"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </BaseWidget>
  );
}
