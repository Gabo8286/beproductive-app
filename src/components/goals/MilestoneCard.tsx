import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { GoalMilestone } from "@/types/goals";
import { useCompleteMilestone, useDeleteMilestone } from "@/hooks/useGoalMilestones";
import { format } from "date-fns";
import { Calendar, CheckCircle, Trash } from "lucide-react";

interface MilestoneCardProps {
  milestone: GoalMilestone;
}

export function MilestoneCard({ milestone }: MilestoneCardProps) {
  const completeMilestone = useCompleteMilestone();
  const deleteMilestone = useDeleteMilestone();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    if (milestone.completed_at) return;

    setIsCompleting(true);
    try {
      await completeMilestone.mutateAsync(milestone.id);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = () => {
    deleteMilestone.mutate(milestone.id);
  };

  return (
    <Card className={`transition-all ${milestone.completed_at ? 'bg-muted/50' : 'hover:shadow-sm'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Checkbox
              checked={!!milestone.completed_at}
              onCheckedChange={handleComplete}
              disabled={isCompleting || !!milestone.completed_at}
              className="mt-1"
            />
            <div className="flex-1">
              <h4 className={`font-medium ${milestone.completed_at ? 'line-through text-muted-foreground' : ''}`}>
                {milestone.title}
              </h4>
              {milestone.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {milestone.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2">
                {milestone.target_date && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(milestone.target_date), 'MMM d, yyyy')}
                  </div>
                )}
                {milestone.completed_at && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed {format(new Date(milestone.completed_at), 'MMM d')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDelete}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
