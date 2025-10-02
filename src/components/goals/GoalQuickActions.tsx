import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Goal } from "@/types/goals";
import { useUpdateGoal, useUpdateGoalProgress } from "@/hooks/useGoals";
import { getAvailableStatusTransitions, getStatusLabel } from "@/utils/goalStatus";
import { Percent } from "lucide-react";

interface GoalQuickActionsProps {
  goal: Goal;
}

export function GoalQuickActions({ goal }: GoalQuickActionsProps) {
  const updateGoalMutation = useUpdateGoal(goal.id);
  const updateProgressMutation = useUpdateGoalProgress();
  const [newProgress, setNewProgress] = useState(goal.progress?.toString() || "0");

  const availableTransitions = getAvailableStatusTransitions(goal.status);

  const handleStatusChange = (status: Goal['status']) => {
    updateGoalMutation.mutate({ status });
  };

  const handleProgressUpdate = () => {
    const progress = parseInt(newProgress);
    if (!isNaN(progress) && progress >= 0 && progress <= 100) {
      updateProgressMutation.mutate({ goalId: goal.id, progress });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Quick Progress Update */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Percent className="h-3 w-3 mr-1" />
            {Math.round(goal.progress || 0)}%
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <h4 className="font-medium">Update Progress</h4>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="100"
                value={newProgress}
                onChange={(e) => setNewProgress(e.target.value)}
                placeholder="0-100"
              />
              <Button size="sm" onClick={handleProgressUpdate}>
                Update
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Quick Status Change */}
      {availableTransitions.length > 0 && (
        <Select value={goal.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={goal.status}>{getStatusLabel(goal.status)}</SelectItem>
            {availableTransitions.map((status) => (
              <SelectItem key={status} value={status}>
                {getStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
