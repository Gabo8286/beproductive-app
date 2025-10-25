import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGoals } from "@/hooks/useGoals";
import { GoalCard } from "@/components/goals/GoalCard";
import { Plus } from "lucide-react";

interface SubGoalsListProps {
  parentGoalId: string;
}

export function SubGoalsList({ parentGoalId }: SubGoalsListProps) {
  const { goals, createGoal, isCreating } = useGoals();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");

  const subGoals = goals.filter((goal) => goal.parent_goal_id === parentGoalId);

  const handleCreateSubGoal = () => {
    if (!newGoalTitle.trim()) return;

    createGoal({
      title: newGoalTitle.trim(),
      parent_goal_id: parentGoalId,
      workspace_id: "", // Will be auto-filled by the hook
    });
    setNewGoalTitle("");
    setShowCreateDialog(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Sub-Goals</CardTitle>
          <CardDescription>
            Break down this goal into smaller, manageable objectives
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subGoals.length > 0 ? (
            <div className="space-y-4">
              {subGoals.map((subGoal) => (
                <GoalCard key={subGoal.id} goal={subGoal} />
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Sub-Goal
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No sub-goals yet</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Sub-Goal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Sub-Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="Sub-goal title"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateSubGoal();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubGoal}
              disabled={!newGoalTitle.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
