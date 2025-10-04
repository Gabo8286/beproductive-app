import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GoalMilestone } from "@/types/goals";
import {
  useCompleteMilestone,
  useDeleteMilestone,
} from "@/hooks/useGoalMilestones";
import { format, differenceInDays, isPast } from "date-fns";
import {
  Calendar,
  CheckCircle,
  Clock,
  MoreVertical,
  Edit,
  Trash,
  AlertTriangle,
} from "lucide-react";
import { MilestoneEditor } from "./MilestoneEditor";
import { MilestoneCompletion } from "./MilestoneCompletion";

interface MilestoneCardProps {
  milestone: GoalMilestone & {
    dependencies?: {
      depends_on_milestone: {
        id: string;
        title: string;
        completed_at: string | null;
      };
    }[];
  };
  showDependencies?: boolean;
}

export function MilestoneCard({
  milestone,
  showDependencies = true,
}: MilestoneCardProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const completeMilestone = useCompleteMilestone();
  const deleteMilestone = useDeleteMilestone();

  const isCompleted = !!milestone.completed_at;
  const isOverdue =
    milestone.target_date &&
    isPast(new Date(milestone.target_date)) &&
    !isCompleted;
  const daysUntilDue = milestone.target_date
    ? differenceInDays(new Date(milestone.target_date), new Date())
    : null;

  const blockedByDependencies =
    milestone.dependencies?.some(
      (dep) => !dep.depends_on_milestone.completed_at,
    ) || false;

  const handleQuickComplete = async () => {
    if (isCompleted || blockedByDependencies) return;

    if (milestone.estimated_hours || milestone.progress_percentage) {
      setShowCompletion(true);
    } else {
      await completeMilestone.mutateAsync({ milestoneId: milestone.id });
    }
  };

  const handleDelete = () => {
    if (confirm(`Delete milestone "${milestone.title}"?`)) {
      deleteMilestone.mutate(milestone.id);
    }
  };

  const getPriorityColor = () => {
    switch (milestone.priority) {
      case 5:
        return "bg-red-500 text-white";
      case 4:
        return "bg-orange-500 text-white";
      case 3:
        return "bg-yellow-500 text-white";
      case 2:
        return "bg-blue-500 text-white";
      case 1:
        return "bg-green-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityLabel = () => {
    switch (milestone.priority) {
      case 5:
        return "Critical";
      case 4:
        return "High";
      case 3:
        return "Medium";
      case 2:
        return "Low";
      case 1:
        return "Lowest";
      default:
        return "Normal";
    }
  };

  return (
    <>
      <Card
        className={`transition-all group hover:shadow-sm ${
          isCompleted
            ? "bg-muted/50"
            : isOverdue
              ? "border-red-500/50 bg-red-50/50 dark:bg-red-900/10"
              : blockedByDependencies
                ? "border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10"
                : "hover:shadow-md"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <Checkbox
                checked={isCompleted}
                onCheckedChange={handleQuickComplete}
                disabled={blockedByDependencies || completeMilestone.isPending}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <CardTitle
                  className={`text-base leading-tight ${
                    isCompleted ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {milestone.title}
                </CardTitle>
                {milestone.description && (
                  <CardDescription className="mt-1 text-sm">
                    {milestone.description}
                  </CardDescription>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {milestone.priority && milestone.priority !== 3 && (
                <Badge variant="outline" className={getPriorityColor()}>
                  {getPriorityLabel()}
                </Badge>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditor(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {!isCompleted && !blockedByDependencies && (
                    <DropdownMenuItem onClick={() => setShowCompletion(true)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Status Indicators */}
          <div className="flex flex-wrap gap-2">
            {isCompleted && (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed {format(new Date(milestone.completed_at!), "MMM d")}
              </Badge>
            )}

            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {Math.abs(daysUntilDue!)} days overdue
              </Badge>
            )}

            {blockedByDependencies && (
              <Badge
                variant="outline"
                className="text-xs border-yellow-500 text-yellow-700"
              >
                <Clock className="h-3 w-3 mr-1" />
                Waiting for dependencies
              </Badge>
            )}

            {daysUntilDue !== null && daysUntilDue > 0 && !isCompleted && (
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {daysUntilDue} days remaining
              </Badge>
            )}
          </div>

          {/* Target Date */}
          {milestone.target_date && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>
                Due {format(new Date(milestone.target_date), "MMM d, yyyy")}
              </span>
            </div>
          )}

          {/* Target Progress */}
          {milestone.progress_percentage > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {milestone.progress_percentage}%
                </span>
              </div>
              <Progress
                value={milestone.progress_percentage || 0}
                className="h-2"
              />
            </div>
          )}

          {/* Estimated vs Actual Hours */}
          {milestone.estimated_hours && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>
                {milestone.estimated_hours}h estimated
                {milestone.actual_hours &&
                  ` (${milestone.actual_hours}h actual)`}
              </span>
            </div>
          )}

          {/* Dependencies */}
          {showDependencies &&
            milestone.dependencies &&
            milestone.dependencies.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Dependencies:
                </div>
                <div className="space-y-1">
                  {milestone.dependencies.map((dep, index) => (
                    <div key={index} className="flex items-center text-xs">
                      <CheckCircle
                        className={`h-3 w-3 mr-2 ${
                          dep.depends_on_milestone.completed_at
                            ? "text-green-500"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={
                          dep.depends_on_milestone.completed_at
                            ? "line-through text-muted-foreground"
                            : ""
                        }
                      >
                        {dep.depends_on_milestone.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Tags */}
          {milestone.tags && milestone.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {milestone.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {milestone.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{milestone.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Milestone Editor Dialog */}
      {showEditor && (
        <MilestoneEditor
          milestone={milestone}
          open={showEditor}
          onOpenChange={setShowEditor}
        />
      )}

      {/* Milestone Completion Dialog */}
      {showCompletion && (
        <MilestoneCompletion
          milestone={milestone}
          open={showCompletion}
          onOpenChange={setShowCompletion}
        />
      )}
    </>
  );
}
