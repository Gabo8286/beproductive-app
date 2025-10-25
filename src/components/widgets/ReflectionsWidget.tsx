import { BookOpen, TrendingUp } from "lucide-react";
import { BaseWidget } from "@/components/widgets/BaseWidget";
import { WidgetActions } from "@/components/widgets/WidgetActions";
import { Button } from "@/components/ui/button";
import { useReflections } from "@/hooks/useReflections";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function ReflectionsWidget() {
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

  const { data: reflections = [], isLoading } = useReflections(workspaceId);

  const thisWeekReflections = reflections.filter((reflection) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(reflection.created_at) > weekAgo;
  });

  const recentReflection = reflections[0];

  // Convert mood to numeric score for average calculation
  const moodToScore = (mood?: string) => {
    const scores: Record<string, number> = {
      amazing: 10,
      great: 8,
      good: 6,
      neutral: 5,
      bad: 3,
      terrible: 1,
    };
    return mood ? scores[mood] || 5 : 5;
  };

  const averageMood =
    reflections.length > 0
      ? reflections.reduce((sum, r) => sum + moodToScore(r.mood), 0) /
        reflections.length
      : 5;

  const moodEmoji = averageMood >= 8 ? "😊" : averageMood >= 6 ? "😐" : "😔";

  return (
    <BaseWidget
      title="Route Adjustments"
      subtitle="Learning from experiences"
      icon={<BookOpen className="h-4 w-4" />}
      size="small"
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
        {/* Week Overview */}
        <div className="text-center">
          <div className="text-2xl font-bold text-success">
            {thisWeekReflections.length}
          </div>
          <div className="text-xs text-muted-foreground">
            Reflections this week
          </div>
        </div>

        {/* Mood Indicator */}
        <div className="text-center space-y-2">
          <div className="text-2xl">{moodEmoji}</div>
          <div className="text-xs text-muted-foreground">
            Average mood: {averageMood.toFixed(1)}/10
          </div>
        </div>

        {/* Recent Reflection */}
        {recentReflection && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Latest Insight
            </h4>
            <div className="p-2 rounded-lg bg-success/10 border border-success/20">
              <div className="text-xs text-foreground line-clamp-3">
                {recentReflection.content}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(recentReflection.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => navigate("/reflections")}
            className="flex-1 apple-button"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Reflect
          </Button>
        </div>
      </div>
    </BaseWidget>
  );
}
