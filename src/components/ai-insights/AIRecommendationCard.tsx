import { AIRecommendation } from "@/types/ai-insights";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, CheckCircle2, PlayCircle, X } from "lucide-react";

interface AIRecommendationCardProps {
  recommendation: AIRecommendation;
  onUpdateStatus: (
    id: string,
    status: "pending" | "in_progress" | "completed" | "dismissed",
  ) => void;
}

export function AIRecommendationCard({
  recommendation,
  onUpdateStatus,
}: AIRecommendationCardProps) {
  const effortColors = {
    low: "bg-green-500/10 text-green-500",
    medium: "bg-yellow-500/10 text-yellow-500",
    high: "bg-red-500/10 text-red-500",
  };

  const statusLabels = {
    pending: "Not Started",
    in_progress: "In Progress",
    completed: "Completed",
    dismissed: "Dismissed",
  };

  return (
    <Card className={recommendation.status === "completed" ? "opacity-75" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="bg-accent p-2 rounded-lg">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <CardTitle className="text-lg">{recommendation.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="secondary">
                  {statusLabels[recommendation.status]}
                </Badge>
                {recommendation.effort_level && (
                  <Badge className={effortColors[recommendation.effort_level]}>
                    {recommendation.effort_level} effort
                  </Badge>
                )}
                <Badge variant="outline">
                  Priority {recommendation.priority}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {recommendation.description}
        </p>

        {recommendation.expected_impact && (
          <div className="p-3 bg-accent rounded-lg">
            <p className="text-sm font-medium">Expected Impact</p>
            <p className="text-sm text-muted-foreground mt-1">
              {recommendation.expected_impact}
            </p>
          </div>
        )}

        {recommendation.implementation_steps &&
          recommendation.implementation_steps.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Implementation Steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                {recommendation.implementation_steps.map((step, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

        <div className="flex gap-2">
          {recommendation.status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => onUpdateStatus(recommendation.id, "in_progress")}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Start
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus(recommendation.id, "dismissed")}
              >
                <X className="h-4 w-4 mr-2" />
                Dismiss
              </Button>
            </>
          )}
          {recommendation.status === "in_progress" && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(recommendation.id, "completed")}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
