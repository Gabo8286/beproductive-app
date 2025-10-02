import { Repeat, Flame, CheckCircle } from "lucide-react";
import { BaseWidget } from "./BaseWidget";
import { WidgetActions } from "./WidgetActions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useHabits } from "@/hooks/useHabits";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function HabitsWidget() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [workspaceId, setWorkspaceId] = useState<string>("");

  useEffect(() => {
    async function fetchWorkspace() {
      if (!profile?.id) return;
      const { data } = await supabase
        .from("workspaces")
        .select("id")
        .eq("owner_id", profile.id)
        .eq("type", "personal")
        .single();
      if (data) setWorkspaceId(data.id);
    }
    fetchWorkspace();
  }, [profile?.id]);

  const { data: habits = [], isLoading } = useHabits(workspaceId);

  const activeHabits = habits.filter(habit => !habit.archived_at);
  const todayCompleted = activeHabits.filter(habit => {
    // Check if habit was completed today
    return habit.last_completed &&
           new Date(habit.last_completed).toDateString() === new Date().toDateString();
  });

  const completionRate = activeHabits.length > 0
    ? (todayCompleted.length / activeHabits.length) * 100
    : 0;

  const longestStreak = activeHabits.reduce((max, habit) =>
    Math.max(max, habit.current_streak || 0), 0
  );

  const todayHabits = activeHabits.slice(0, 3);

  return (
    <BaseWidget
      title="Daily Routines"
      subtitle="Building consistent practices"
      icon={<Repeat className="h-4 w-4" />}
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
        {/* Today's Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Today's Progress</span>
            <span className="font-medium">{Math.round(completionRate)}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-secondary">{activeHabits.length}</div>
            <div className="text-xs text-muted-foreground">Active routines</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold text-orange-500">{longestStreak}</span>
            </div>
            <div className="text-xs text-muted-foreground">Best streak</div>
          </div>
        </div>

        {/* Today's Habits */}
        {todayHabits.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Today's Focus
            </h4>
            <div className="space-y-2">
              {todayHabits.map((habit) => {
                const isCompleted = todayCompleted.some(h => h.id === habit.id);
                return (
                  <div key={habit.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      isCompleted 
                        ? "bg-success border-success" 
                        : "border-muted-foreground/30"
                    )}>
                      {isCompleted && <CheckCircle className="h-3 w-3 text-success-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-sm font-medium truncate",
                        isCompleted && "line-through text-muted-foreground"
                      )}>
                        {habit.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {habit.current_streak || 0} day streak
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            onClick={() => navigate('/habits')}
            className="flex-1 apple-button"
          >
            Track Progress
          </Button>
        </div>
      </div>
    </BaseWidget>
  );
}
