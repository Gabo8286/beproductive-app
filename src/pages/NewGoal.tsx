import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoalForm } from "@/components/goals/GoalForm";
import { useGoals } from "@/hooks/useGoals";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CreateGoalInput } from "@/types/goals";

export default function NewGoal() {
  const navigate = useNavigate();
  const { createGoal, isCreating } = useGoals();

  const handleSubmit = (data: CreateGoalInput) => {
    createGoal(data, {
      onSuccess: () => {
        navigate('/goals');
      },
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/goals')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Goals
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Create New Goal</CardTitle>
          <CardDescription>
            Define your goal with a clear title, description, and timeline to track your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoalForm onSubmit={handleSubmit} isSubmitting={isCreating} />
        </CardContent>
      </Card>
    </div>
  );
}
