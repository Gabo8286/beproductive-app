import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoalForm } from "@/components/goals/GoalForm";
import { useGoals } from "@/hooks/useGoals";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CreateGoalInput } from "@/types/goals";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function NewGoal() {
  const navigate = useNavigate();
  const { createGoal, isCreating } = useGoals();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkspace = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: workspaces } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .eq('type', 'personal')
        .limit(1)
        .single();

      if (workspaces) {
        setWorkspaceId(workspaces.id);
      }
    };

    fetchWorkspace();
  }, []);

  const handleSubmit = (data: CreateGoalInput) => {
    if (!workspaceId) {
      toast.error("No workspace found. Please create a workspace first.");
      return;
    }

    createGoal({ ...data, workspace_id: workspaceId }, {
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
