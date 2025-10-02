import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateMilestone, CreateMilestoneInput } from "@/hooks/useGoalMilestones";
import { GoalMilestone } from "@/types/goals";

interface MilestoneCreatorProps {
  goalId: string;
  existingMilestones: GoalMilestone[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MilestoneCreator({ goalId, existingMilestones, open, onOpenChange }: MilestoneCreatorProps) {
  const createMilestone = useCreateMilestone();
  const [formData, setFormData] = useState<Partial<CreateMilestoneInput>>({
    goal_id: goalId,
    priority: 3,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    await createMilestone.mutateAsync(formData as CreateMilestoneInput);
    setFormData({ goal_id: goalId, priority: 3 });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Milestone</DialogTitle>
            <DialogDescription>
              Add a new milestone to track progress toward your goal
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title*</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Milestone title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Milestone description (optional)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target-date">Target Date</Label>
                <Input
                  id="target-date"
                  type="date"
                  value={formData.target_date?.toISOString().split('T')[0] || ""}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value ? new Date(e.target.value) : undefined })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, priority: parseInt(value) as 1 | 2 | 3 | 4 | 5 })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Lowest</SelectItem>
                    <SelectItem value="2">Low</SelectItem>
                    <SelectItem value="3">Medium</SelectItem>
                    <SelectItem value="4">High</SelectItem>
                    <SelectItem value="5">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated-hours">Estimated Hours</Label>
              <Input
                id="estimated-hours"
                type="number"
                min="0"
                value={formData.estimated_hours || ""}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Estimated hours to complete"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMilestone.isPending || !formData.title?.trim()}>
              {createMilestone.isPending ? "Creating..." : "Create Milestone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}