import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Target,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
} from "lucide-react";
import { useAI } from "@/hooks/useAI";
import { useI18n } from "@/hooks/useI18n";
import type { ProductivityInsight } from "@/lib/ai-service";

interface AIQuickActionsProps {
  onActionTaken?: (action: string, result: any) => void;
}

export const AIQuickActions: React.FC<AIQuickActionsProps> = ({
  onActionTaken,
}) => {
  const { t } = useI18n("ai");
  const { generateInsights, suggestNextAction, isLoading } = useAI();

  const quickActions = [
    {
      id: "next-action",
      title: t("suggestNextAction", "What should I work on next?"),
      icon: Target,
      color: "bg-blue-500",
      action: async () => {
        const suggestion = await suggestNextAction();
        onActionTaken?.("next-action", suggestion);
        return suggestion;
      },
    },
    {
      id: "productivity-insights",
      title: t("getInsights", "Show productivity insights"),
      icon: TrendingUp,
      color: "bg-green-500",
      action: async () => {
        const insights = await generateInsights();
        onActionTaken?.("insights", insights);
        return insights;
      },
    },
    {
      id: "peak-hours",
      title: t("findPeakHours", "Find my peak hours"),
      icon: Clock,
      color: "bg-purple-500",
      action: async () => {
        const analysis = await generateInsights();
        const peakHours = analysis.find((i) => i.type === "pattern");
        onActionTaken?.("peak-hours", peakHours);
        return peakHours;
      },
    },
    {
      id: "workload-check",
      title: t("checkWorkload", "Check my workload"),
      icon: AlertTriangle,
      color: "bg-orange-500",
      action: async () => {
        const insights = await generateInsights();
        const workloadWarning = insights.find((i) => i.type === "warning");
        onActionTaken?.("workload", workloadWarning);
        return workloadWarning;
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          {t("aiQuickActions", "AI Quick Actions")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Button
              key={action.id}
              variant="outline"
              className="w-full justify-start h-auto p-3"
              disabled={isLoading}
              onClick={action.action}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                  action.color,
                )}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-left">
                {action.title}
              </span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

// AI Insights Display Component
interface AIInsightDisplayProps {
  insights: ProductivityInsight[];
  className?: string;
}

export const AIInsightDisplay: React.FC<AIInsightDisplayProps> = ({
  insights,
  className,
}) => {
  const { t } = useI18n("ai");

  const getInsightIcon = (type: ProductivityInsight["type"]) => {
    switch (type) {
      case "achievement":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      case "recommendation":
        return Lightbulb;
      case "pattern":
        return TrendingUp;
      default:
        return Brain;
    }
  };

  const getInsightColor = (type: ProductivityInsight["type"]) => {
    switch (type) {
      case "achievement":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-orange-600 bg-orange-50";
      case "recommendation":
        return "text-blue-600 bg-blue-50";
      case "pattern":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (insights.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {t(
              "noInsights",
              "No insights available yet. Start using the app to generate insights!",
            )}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {insights.map((insight, index) => {
        const Icon = getInsightIcon(insight.type);
        const colorClass = getInsightColor(insight.type);

        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-full", colorClass)}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(insight.confidence * 100)}% confident
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {insight.description}
                  </p>

                  {insight.suggestedActions &&
                    insight.suggestedActions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          {t("suggestedActions", "Suggested Actions:")}
                        </p>
                        <ul className="text-xs space-y-1">
                          {insight.suggestedActions.map(
                            (action, actionIndex) => (
                              <li
                                key={actionIndex}
                                className="flex items-center gap-2"
                              >
                                <div className="w-1 h-1 bg-current rounded-full" />
                                {action}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export { AIQuickActions, AIInsightDisplay };
