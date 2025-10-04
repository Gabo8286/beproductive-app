import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GoalMilestone } from "@/types/goals";
import { useCompleteMilestone } from "@/hooks/useGoalMilestones";

interface MilestoneCompletionProps {
  milestone: GoalMilestone;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MilestoneCompletion({
  milestone,
  open,
  onOpenChange,
}: MilestoneCompletionProps) {
  const completeMilestone = useCompleteMilestone();
  const [notes, setNotes] = useState("");
  const [actualHours, setActualHours] = useState<number | undefined>(
    milestone.estimated_hours || undefined,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await completeMilestone.mutateAsync({
      milestoneId: milestone.id,
      notes: notes.trim() || undefined,
      actualHours,
    });
    onOpenChange(false);
    setNotes("");
    setActualHours(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Complete Milestone</DialogTitle>
            <DialogDescription>
              Mark "{milestone.title}" as completed
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {milestone.estimated_hours && (
              <div className="space-y-2">
                <Label htmlFor="actual-hours">Actual Hours Spent</Label>
                <Input
                  id="actual-hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={actualHours || ""}
                  onChange={(e) =>
                    setActualHours(
                      e.target.value ? parseFloat(e.target.value) : undefined,
                    )
                  }
                  placeholder={`Estimated: ${milestone.estimated_hours}h`}
                />
                {milestone.estimated_hours && actualHours && (
                  <p className="text-sm text-muted-foreground">
                    {actualHours > milestone.estimated_hours
                      ? `${(actualHours - milestone.estimated_hours).toFixed(1)}h over estimate`
                      : `${(milestone.estimated_hours - actualHours).toFixed(1)}h under estimate`}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Completion Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about completing this milestone (optional)"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={completeMilestone.isPending}>
              {completeMilestone.isPending
                ? "Completing..."
                : "Complete Milestone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
