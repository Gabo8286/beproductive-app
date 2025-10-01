import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@/types/goals";
import { format } from "date-fns";
import { Calendar, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'active':
        return 'bg-primary text-primary-foreground';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'archived':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={() => navigate(`/goals/${goal.id}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">{goal.title}</CardTitle>
          </div>
          <Badge className={getStatusColor(goal.status)}>
            {goal.status}
          </Badge>
        </div>
        {goal.description && (
          <CardDescription className="line-clamp-2">
            {goal.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} />
        </div>
        
        {(goal.timeline_start || goal.timeline_end) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {goal.timeline_start && format(new Date(goal.timeline_start), 'MMM d, yyyy')}
              {goal.timeline_start && goal.timeline_end && ' - '}
              {goal.timeline_end && format(new Date(goal.timeline_end), 'MMM d, yyyy')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
