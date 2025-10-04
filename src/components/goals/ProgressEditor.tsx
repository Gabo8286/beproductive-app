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
import { Slider } from "@/components/ui/slider";
import { Goal } from "@/types/goals";
import {
  useAdvancedProgressUpdate,
  useCalculateAutoProgress,
} from "@/hooks/useGoalProgress";
import { Zap } from "lucide-react";

interface ProgressEditorProps {
  goal: Goal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProgressEditor({
  goal,
  open,
  onOpenChange,
}: ProgressEditorProps) {
  const [progress, setProgress] = useState(goal.progress || 0);
  const [notes, setNotes] = useState("");
  const updateProgressMutation = useAdvancedProgressUpdate();
  const autoProgressMutation = useCalculateAutoProgress();

  const handleSave = async () => {
    await updateProgressMutation.mutateAsync({
      goalId: goal.id,
      progress,
      notes: notes.trim() || undefined,
      changeType: "manual",
    });
    onOpenChange(false);
  };

  const handleAutoCalculate = async () => {
    await autoProgressMutation.mutateAsync(goal.id);
    onOpenChange(false);
  };

  const getProgressColor = () => {
    if (progress >= 100) return "text-green-500";
    if (progress >= 75) return "text-blue-500";
    if (progress >= 50) return "text-yellow-500";
    if (progress >= 25) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Progress</DialogTitle>
          <DialogDescription>
            Track your progress for "{goal.title}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Progress Value Display */}
          <div className="text-center">
            <div className={`text-5xl font-bold ${getProgressColor()}`}>
              {Math.round(progress)}%
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Current progress
            </p>
          </div>

          {/* Progress Slider */}
          <div className="space-y-2">
            <Label>Progress</Label>
            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Manual Input */}
          <div className="space-y-2">
            <Label htmlFor="progress-input">Enter exact value</Label>
            <Input
              id="progress-input"
              type="number"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val >= 0 && val <= 100) {
                  setProgress(val);
                }
              }}
              placeholder="0-100"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note about this progress update..."
              rows={3}
            />
          </div>

          {/* Auto-calculate Option */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Auto-calculate</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Calculate progress from milestones and sub-goals
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoCalculate}
                disabled={autoProgressMutation.isPending}
              >
                Calculate
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateProgressMutation.isPending}
          >
            Save Progress
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
