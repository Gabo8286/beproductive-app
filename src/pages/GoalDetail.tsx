import { useParams, useNavigate } from "react-router-dom";
import { useGoal, useUpdateGoal, useDeleteGoal } from "@/hooks/useGoals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Calendar, Edit, Trash2, Trophy } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: goal, isLoading } = useGoal(id!);
  const updateGoalMutation = useUpdateGoal(id!);
  const deleteGoalMutation = useDeleteGoal();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (goal) {
      setProgress(goal.progress);
    }
  }, [goal]);

  // Check for milestone achievements
  useEffect(() => {
    if (goal && progress !== goal.progress) {
      const milestones = [25, 50, 75, 100];
      const crossedMilestone = milestones.find(
        milestone => goal.progress < milestone && progress >= milestone
      );

      if (crossedMilestone) {
        const messages = {
          25: "Great start! You're 25% there! 🎯",
          50: "Halfway there! Keep up the momentum! 🚀",
          75: "Almost there! You're 75% complete! 💪",
          100: "Congratulations! Goal achieved! 🎉",
        };
        toast.success(messages[crossedMilestone as keyof typeof messages], {
          duration: 5000,
          icon: <Trophy className="h-5 w-5 text-yellow-500" />,
        });
      }
    }
  }, [progress, goal]);

  const handleProgressUpdate = () => {
    updateGoalMutation.mutate({ progress });
  };

  const handleStatusUpdate = (status: 'active' | 'completed' | 'archived') => {
    const progressValue = status === 'completed' ? 100 : progress;
    updateGoalMutation.mutate({ status, progress: progressValue });
    if (status === 'completed') {
      setProgress(100);
    }
  };

  const handleDelete = () => {
    deleteGoalMutation.mutate(id!, {
      onSuccess: () => {
        navigate('/goals');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CardTitle className="mb-2">Goal not found</CardTitle>
            <Button onClick={() => navigate('/goals')}>
              Back to Goals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: typeof goal.status) => {
    switch (status) {
      case 'active':
        return 'bg-primary text-primary-foreground';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'archived':
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <Button variant="ghost" onClick={() => navigate('/goals')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Goals
      </Button>

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2">{goal.title}</h1>
          <Badge className={getStatusColor(goal.status)}>
            {goal.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this goal? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {goal.description || "No description provided"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>Track and update your goal progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Current Progress</span>
                <span className="font-bold text-xl">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Adjust Progress
                </label>
                <Slider
                  value={[progress]}
                  onValueChange={(value) => setProgress(value[0])}
                  max={100}
                  step={5}
                  className="mb-2"
                  aria-label="Goal progress slider"
                />
              </div>
              <Button 
                onClick={handleProgressUpdate}
                disabled={progress === goal.progress || updateGoalMutation.isPending}
                className="w-full"
              >
                {updateGoalMutation.isPending ? "Updating..." : "Update Progress"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Change the goal status</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={goal.status}
              onValueChange={(value) => handleStatusUpdate(value as typeof goal.status)}
            >
              <SelectTrigger aria-label="Goal status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {(goal.timeline_start || goal.timeline_end) && (
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>
                {goal.timeline_start && format(new Date(goal.timeline_start), 'MMMM d, yyyy')}
                {goal.timeline_start && goal.timeline_end && ' - '}
                {goal.timeline_end && format(new Date(goal.timeline_end), 'MMMM d, yyyy')}
              </span>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Linked Tasks</CardTitle>
            <CardDescription>
              Tasks linked to this goal (coming soon with Tasks module)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Task linking will be available once the Tasks module is enabled.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
