import { Card } from "@/components/ui/card";
import { useReflectionInsights } from "@/hooks/useReflectionAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  Heart,
  Target,
  Lightbulb,
  TrendingUp,
  Smile,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PersonalGrowthMetricsProps {
  workspaceId: string;
  compact?: boolean;
  detailed?: boolean;
}

export default function PersonalGrowthMetrics({
  workspaceId,
  compact = false,
  detailed = false,
}: PersonalGrowthMetricsProps) {
  const { data: insights, isLoading } = useReflectionInsights(workspaceId, 30);

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-[200px] w-full" />
      </Card>
    );
  }

  const growthMetrics = [
    {
      icon: Brain,
      label: "Self-Awareness",
      score: 85,
      color: "text-purple-500",
      description: "Understanding your thoughts and emotions",
    },
    {
      icon: Heart,
      label: "Emotional Intelligence",
      score: 78,
      color: "text-pink-500",
      description: "Managing emotions effectively",
    },
    {
      icon: Target,
      label: "Goal Alignment",
      score: 92,
      color: "text-blue-500",
      description: "Reflections supporting goals",
    },
    {
      icon: Lightbulb,
      label: "Insight Generation",
      score: 88,
      color: "text-yellow-500",
      description: "Quality of learnings and discoveries",
    },
    {
      icon: TrendingUp,
      label: "Growth Velocity",
      score: 82,
      color: "text-green-500",
      description: "Rate of personal development",
    },
    {
      icon: Smile,
      label: "Life Satisfaction",
      score: 86,
      color: "text-orange-500",
      description: "Overall happiness and fulfillment",
    },
  ];

  if (compact) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <p className="text-sm font-medium text-muted-foreground">
              Personal Growth
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold">85%</p>
            <p className="text-sm text-muted-foreground">overall score</p>
          </div>
          <div className="space-y-2">
            {growthMetrics.slice(0, 3).map((metric) => (
              <div key={metric.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{metric.label}</span>
                  <span className="font-medium">{metric.score}%</span>
                </div>
                <Progress value={metric.score} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Personal Growth Metrics
          </h3>
          <p className="text-sm text-muted-foreground">
            Track your personal development across key dimensions
          </p>
        </div>

        <div className="grid gap-4">
          {growthMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <span className="text-sm font-bold">{metric.score}%</span>
                </div>
                {detailed && (
                  <p className="text-xs text-muted-foreground pl-6">
                    {metric.description}
                  </p>
                )}
                <Progress value={metric.score} className="h-2" />
              </div>
            );
          })}
        </div>

        {insights && insights.length > 0 && (
          <div className="pt-4 border-t space-y-3">
            <h4 className="font-semibold text-sm">Recent Insights</h4>
            {insights.slice(0, detailed ? 5 : 2).map((insight, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">{insight.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
