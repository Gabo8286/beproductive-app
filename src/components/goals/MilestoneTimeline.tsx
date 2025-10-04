import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Goal, GoalMilestone } from "@/types/goals";
import { format, parseISO, isPast, isFuture } from "date-fns";
import { CheckCircle, Circle, Clock, AlertTriangle } from "lucide-react";

interface MilestoneTimelineProps {
  milestones: GoalMilestone[];
  goal: Goal;
}

export function MilestoneTimeline({
  milestones,
  goal,
}: MilestoneTimelineProps) {
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (!a.target_date && !b.target_date) return 0;
    if (!a.target_date) return 1;
    if (!b.target_date) return -1;
    return (
      new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
    );
  });

  const getStatusIcon = (milestone: GoalMilestone) => {
    if (milestone.completed_at) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (milestone.target_date && isPast(new Date(milestone.target_date))) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    if (milestone.target_date && isFuture(new Date(milestone.target_date))) {
      return <Clock className="h-5 w-5 text-blue-500" />;
    }
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  const getStatusColor = (milestone: GoalMilestone) => {
    if (milestone.completed_at) return "border-green-500";
    if (milestone.target_date && isPast(new Date(milestone.target_date)))
      return "border-red-500";
    if (milestone.target_date && isFuture(new Date(milestone.target_date)))
      return "border-blue-500";
    return "border-muted";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestone Timeline</CardTitle>
        <CardDescription>
          Visual timeline of all milestones for this goal
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedMilestones.length > 0 ? (
          <div className="relative space-y-6 before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-border">
            {sortedMilestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className="relative flex items-start gap-4 pl-12"
              >
                <div
                  className={`absolute left-0 top-1 p-1.5 rounded-full border-2 bg-background ${getStatusColor(milestone)}`}
                >
                  {getStatusIcon(milestone)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-medium ${milestone.completed_at ? "line-through text-muted-foreground" : ""}`}
                      >
                        {milestone.title}
                      </h4>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {milestone.priority && milestone.priority !== 3 && (
                        <Badge variant="outline" className="text-xs">
                          Priority {milestone.priority}
                        </Badge>
                      )}
                      {milestone.target_date && (
                        <span className="text-sm text-muted-foreground">
                          {format(
                            new Date(milestone.target_date),
                            "MMM d, yyyy",
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  {milestone.completed_at && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Completed{" "}
                      {format(new Date(milestone.completed_at), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No milestones in the timeline yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
