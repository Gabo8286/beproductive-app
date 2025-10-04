import { Card } from "@/components/ui/card";
import { Target, TrendingUp, Heart, Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ImpactAnalysisProps {
  workspaceId: string;
}

export default function ImpactAnalysis({ workspaceId }: ImpactAnalysisProps) {
  const impactMetrics = [
    {
      icon: Target,
      label: "Goal Achievement",
      score: 89,
      description: "Reflections linked to completed goals",
      color: "text-blue-500",
      insight: "Your reflections are highly correlated with goal completion",
    },
    {
      icon: TrendingUp,
      label: "Habit Consistency",
      score: 76,
      description: "Impact on habit formation and maintenance",
      color: "text-green-500",
      insight: "Reflecting regularly improves habit streaks by 34%",
    },
    {
      icon: Heart,
      label: "Mood Improvement",
      score: 82,
      description: "Positive emotional changes over time",
      color: "text-pink-500",
      insight: "Average mood increased 15% since starting reflections",
    },
    {
      icon: Brain,
      label: "Decision Quality",
      score: 91,
      description: "Better choices through self-awareness",
      color: "text-purple-500",
      insight: "Reflections lead to more thoughtful decision-making",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Reflection Impact</h3>
            <p className="text-sm text-muted-foreground">
              Measuring the effectiveness of your reflection practice
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {impactMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${metric.color}`} />
                      <div>
                        <p className="font-medium">{metric.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {metric.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold">{metric.score}%</span>
                  </div>
                  <Progress value={metric.score} className="h-2" />
                  <p className="text-xs text-muted-foreground italic">
                    {metric.insight}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Time Investment</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Avg. reflection time
              </span>
              <span className="font-medium">12 min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Total time invested
              </span>
              <span className="font-medium">31 hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Value generated
              </span>
              <span className="font-medium text-green-600">Priceless</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-4">Life Satisfaction</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Overall Happiness</span>
                <span className="font-medium">8.4/10</span>
              </div>
              <Progress value={84} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground">
              +1.2 point improvement since starting reflections
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
