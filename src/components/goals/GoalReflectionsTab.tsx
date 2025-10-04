import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Plus, BookOpen, Lightbulb, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { GoalReflectionType } from "@/types/reflections";

interface GoalReflectionsTabProps {
  goalId: string;
}

export function GoalReflectionsTab({ goalId }: GoalReflectionsTabProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<GoalReflectionType | "all">("all");

  const { data: reflectionLinks, isLoading } = useQuery({
    queryKey: ["goal-reflection-links", goalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reflection_goal_links")
        .select(
          `
          *,
          reflection:reflections(*)
        `,
        )
        .eq("goal_id", goalId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredLinks = reflectionLinks?.filter(
    (link) => filter === "all" || link.reflection_type === filter,
  );

  const getReflectionTypeLabel = (type: GoalReflectionType) => {
    const labels: Record<GoalReflectionType, string> = {
      progress_review: "Progress Review",
      milestone_achieved: "Milestone Achieved",
      challenge_faced: "Challenge Faced",
      strategy_adjustment: "Strategy Adjustment",
      completion_celebration: "Completion Celebration",
    };
    return labels[type];
  };

  const getReflectionTypeColor = (type: GoalReflectionType) => {
    const colors: Record<GoalReflectionType, string> = {
      progress_review: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      milestone_achieved: "bg-green-500/10 text-green-700 dark:text-green-400",
      challenge_faced: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
      strategy_adjustment:
        "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      completion_celebration: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
    };
    return colors[type];
  };

  const getMoodEmoji = (mood: string | null) => {
    if (!mood) return null;
    const emojis: Record<string, string> = {
      amazing: "🤩",
      great: "😊",
      good: "🙂",
      neutral: "😐",
      bad: "😔",
      terrible: "😢",
    };
    return emojis[mood];
  };

  const stats = {
    total: reflectionLinks?.length || 0,
    progressReviews:
      reflectionLinks?.filter((l) => l.reflection_type === "progress_review")
        .length || 0,
    milestones:
      reflectionLinks?.filter((l) => l.reflection_type === "milestone_achieved")
        .length || 0,
    challenges:
      reflectionLinks?.filter((l) => l.reflection_type === "challenge_faced")
        .length || 0,
  };

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading reflections...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Goal Reflections</h3>
          <p className="text-sm text-muted-foreground">
            Track insights and progress through reflections
          </p>
        </div>
        <Button onClick={() => navigate("/reflections")}>
          <Plus className="h-4 w-4 mr-2" />
          New Reflection
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardDescription className="text-xs">Total</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardDescription className="text-xs">Reviews</CardDescription>
            <CardTitle className="text-2xl">{stats.progressReviews}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardDescription className="text-xs">Milestones</CardDescription>
            <CardTitle className="text-2xl">{stats.milestones}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardDescription className="text-xs">Challenges</CardDescription>
            <CardTitle className="text-2xl">{stats.challenges}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          size="sm"
          variant={filter === "progress_review" ? "default" : "outline"}
          onClick={() => setFilter("progress_review")}
        >
          Progress Reviews
        </Button>
        <Button
          size="sm"
          variant={filter === "milestone_achieved" ? "default" : "outline"}
          onClick={() => setFilter("milestone_achieved")}
        >
          Milestones
        </Button>
        <Button
          size="sm"
          variant={filter === "challenge_faced" ? "default" : "outline"}
          onClick={() => setFilter("challenge_faced")}
        >
          Challenges
        </Button>
        <Button
          size="sm"
          variant={filter === "strategy_adjustment" ? "default" : "outline"}
          onClick={() => setFilter("strategy_adjustment")}
        >
          Strategy
        </Button>
      </div>

      {/* Reflections List */}
      {filteredLinks && filteredLinks.length > 0 ? (
        <div className="space-y-4">
          {filteredLinks.map((link) => {
            const reflection = link.reflection;
            if (!reflection) return null;

            return (
              <Card
                key={link.id}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => navigate(`/reflections/${reflection.id}`)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">
                          {reflection.title}
                        </CardTitle>
                        {reflection.mood && (
                          <span className="text-lg">
                            {getMoodEmoji(reflection.mood)}
                          </span>
                        )}
                        <Badge
                          className={getReflectionTypeColor(
                            link.reflection_type,
                          )}
                        >
                          {getReflectionTypeLabel(link.reflection_type)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(
                            new Date(reflection.reflection_date),
                            "MMM d, yyyy",
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {reflection.reflection_type}
                        </Badge>
                      </div>

                      {link.insights && (
                        <CardDescription className="text-sm">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-500" />
                            <div>
                              <strong>Insights:</strong> {link.insights}
                            </div>
                          </div>
                        </CardDescription>
                      )}

                      {link.action_items && link.action_items.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Action Items:
                          </p>
                          <ul className="text-xs text-muted-foreground space-y-0.5 ml-4">
                            {link.action_items.map((item, index) => (
                              <li key={index}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {reflection.content && (
                        <CardDescription className="text-xs line-clamp-2">
                          {reflection.content}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reflections Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {filter === "all"
                ? "Create reflections about this goal to track insights and progress."
                : `No ${getReflectionTypeLabel(filter as GoalReflectionType).toLowerCase()} reflections yet.`}
            </p>
            <Button onClick={() => navigate("/reflections")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Reflection
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
