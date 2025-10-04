import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Goal, GoalMilestone } from "@/types/goals";
import { format } from "date-fns";
import { Calendar, CheckCircle, Target, Flag } from "lucide-react";

interface GoalTimelineProps {
  goal: Goal;
  milestones: GoalMilestone[];
}

export function GoalTimeline({ goal, milestones }: GoalTimelineProps) {
  type TimelineEvent = {
    date: string;
    title: string;
    type: string;
    icon: typeof Target | typeof Flag | typeof CheckCircle | typeof Calendar;
    completed?: boolean;
  };

  const timelineEvents: TimelineEvent[] = [
    {
      date: goal.created_at,
      title: "Goal Created",
      type: "created",
      icon: Target,
    },
    ...(goal.start_date
      ? [
          {
            date: goal.start_date,
            title: "Start Date",
            type: "start",
            icon: Flag,
          },
        ]
      : []),
    ...milestones.map((milestone) => ({
      date: milestone.target_date || milestone.created_at,
      title: milestone.title,
      type: milestone.completed_at ? "milestone-completed" : "milestone",
      icon: CheckCircle,
      completed: !!milestone.completed_at,
    })),
    ...(goal.target_date
      ? [
          {
            date: goal.target_date,
            title: "Target Date",
            type: "target",
            icon: Calendar,
          },
        ]
      : []),
    ...(goal.completed_at
      ? [
          {
            date: goal.completed_at,
            title: "Goal Completed",
            type: "completed",
            icon: CheckCircle,
          },
        ]
      : []),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getEventColor = (type: string, completed?: boolean) => {
    switch (type) {
      case "created":
        return "bg-blue-500";
      case "start":
        return "bg-green-500";
      case "milestone":
        return completed ? "bg-green-500" : "bg-yellow-500";
      case "milestone-completed":
        return "bg-green-500";
      case "target":
        return "bg-orange-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timelineEvents.map((event, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div
                className={`w-2 h-2 rounded-full ${getEventColor(event.type, event.completed)} mt-2 flex-shrink-0`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <event.icon className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium">{event.title}</h4>
                  {event.completed && (
                    <Badge variant="secondary" className="text-xs">
                      Completed
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.date), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
