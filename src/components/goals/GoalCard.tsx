import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Goal } from "@/types/goals";
import { useNavigate } from "react-router-dom";
import {
  useUpdateGoal,
  useDeleteGoal,
  useUpdateGoalProgress,
} from "@/hooks/useGoals";
import {
  getStatusColor,
  getStatusLabel,
  getAvailableStatusTransitions,
} from "@/utils/goalStatus";
import {
  MoreVertical,
  Calendar,
  Tag,
  Play,
  Pause,
  CheckCircle,
  Archive,
  Trash,
  Edit,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const navigate = useNavigate();
  const updateGoalMutation = useUpdateGoal(goal.id);
  const deleteGoalMutation = useDeleteGoal();
  const updateProgressMutation = useUpdateGoalProgress();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const availableTransitions = getAvailableStatusTransitions(goal.status);

  const handleStatusChange = async (newStatus: Goal["status"]) => {
    setIsUpdating(true);
    try {
      await updateGoalMutation.mutateAsync({ status: newStatus });
      toast.success(
        `Goal ${newStatus === "completed" ? "completed" : "updated"}!`,
      );
    } catch (error) {
      console.error("Failed to update goal status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProgressUpdate = async (progress: number) => {
    try {
      await updateProgressMutation.mutateAsync({ goalId: goal.id, progress });
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGoalMutation.mutateAsync(goal.id);
      setShowDeleteDialog(false);
      toast.success("Goal deleted successfully");
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  const getStatusIcon = (status: Goal["status"]) => {
    switch (status) {
      case "draft":
        return <FileText className="h-3 w-3" />;
      case "active":
        return <Play className="h-3 w-3" />;
      case "paused":
        return <Pause className="h-3 w-3" />;
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "archived":
        return <Archive className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
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

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 5:
        return "Urgent";
      case 4:
        return "High";
      case 3:
        return "Medium";
      case 2:
        return "Low";
      case 1:
        return "Lowest";
      default:
        return "Unknown";
    }
  };

  return (
    <>
      <Card
        className="journey-card apple-hover milestone-marker group cursor-pointer"
        onClick={() => navigate(`/goals/${goal.id}`)}
      >
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold leading-none tracking-tight group-hover:text-gradient-brand transition-all">
              {goal.title}
            </CardTitle>
            {goal.description && (
              <CardDescription className="mt-1 text-sm line-clamp-2">
                {goal.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/goals/${goal.id}`);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {availableTransitions.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(status);
                  }}
                  disabled={isUpdating}
                >
                  {getStatusIcon(status)}
                  <span className="ml-2">Mark as {getStatusLabel(status)}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
                className="text-destructive"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Status and Priority */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(goal.status)}>
              {getStatusIcon(goal.status)}
              <span className="ml-1">
                {goal.status === "completed"
                  ? "Reached"
                  : getStatusLabel(goal.status)}
              </span>
            </Badge>
            {goal.priority && (
              <Badge
                variant="outline"
                className={getPriorityColor(goal.priority)}
              >
                {getPriorityLabel(goal.priority)}
              </Badge>
            )}
          </div>

          {/* Journey Progress */}
          <div className="space-y-2 journey-progress">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Journey Progress</span>
              <span className="font-medium">
                {Math.round(goal.progress || 0)}%
              </span>
            </div>
            <Progress
              value={goal.progress || 0}
              className="h-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const width = rect.width;
                const newProgress = Math.round((x / width) * 100);
                handleProgressUpdate(newProgress);
              }}
            />
          </div>

          {/* Target Value */}
          {goal.target_value && (
            <div className="text-sm">
              <span className="text-muted-foreground">Target: </span>
              <span className="font-medium">
                {goal.current_value || 0} / {goal.target_value}
                {goal.unit && ` ${goal.unit}`}
              </span>
            </div>
          )}

          {/* Timeline */}
          {(goal.start_date || goal.target_date) && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>
                {goal.start_date && format(new Date(goal.start_date), "MMM d")}
                {goal.start_date && goal.target_date && " - "}
                {goal.target_date &&
                  format(new Date(goal.target_date), "MMM d, yyyy")}
              </span>
            </div>
          )}

          {/* Tags */}
          {goal.tags && goal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {goal.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Tag className="h-2 w-2 mr-1" />
                  {tag}
                </Badge>
              ))}
              {goal.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{goal.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Sub-goals indicator */}
          {(goal as any).children && (goal as any).children.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {(goal as any).children.length} sub-goal
              {(goal as any).children.length !== 1 ? "s" : ""}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Remove Destination</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{goal.title}" from your journey?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="apple-button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="apple-button"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
