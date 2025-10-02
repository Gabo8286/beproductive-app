import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StickyNote, Trash2 } from "lucide-react";
import { useQuickTodos, useClearCompletedQuickTodos } from "@/hooks/quickTodos";
import { QuickTodoItem } from "@/components/quickTodos/QuickTodoItem";
import { QuickTodoForm } from "@/components/quickTodos/QuickTodoForm";
import { useAuth } from "@/contexts/AuthContext";

export default function QuickTodos() {
  const [showCompleted, setShowCompleted] = useState(false);
  const { profile } = useAuth();
  const { data: quickTodos = [], isLoading } = useQuickTodos({
    includeCompleted: showCompleted
  });
  const clearCompleted = useClearCompletedQuickTodos();

  const activeCount = quickTodos.filter(todo => !todo.completed_at).length;
  const completedCount = quickTodos.filter(todo => todo.completed_at).length;

  // Get workspace ID for clearing completed
  const getWorkspaceId = async () => {
    if (!profile?.id) return null;
    
    const { data } = await import("@/integrations/supabase/client").then(
      mod => mod.supabase
        .from("workspaces")
        .select("id")
        .eq("owner_id", profile.id)
        .eq("type", "personal")
        .limit(1)
    );
    
    return data?.[0]?.id || null;
  };

  const handleClearCompleted = async () => {
    const workspaceId = await getWorkspaceId();
    if (workspaceId) {
      clearCompleted.mutate(workspaceId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="journey-card p-6 bg-gradient-mesh">
        <div className="flex items-center gap-3 mb-2">
          <StickyNote className="h-6 w-6 text-warning journey-float" />
          <h1 className="text-3xl font-bold text-gradient-brand">
            Travel Notes
          </h1>
        </div>
        <p className="text-muted-foreground">
          Quick thoughts and reminders for your productivity journey
        </p>
      </div>

      {/* Quick Add Form */}
      <Card className="journey-card apple-hover">
        <CardContent className="pt-6">
          <QuickTodoForm />
        </CardContent>
      </Card>

      {/* Stats & Actions */}
      {(activeCount > 0 || completedCount > 0) && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {activeCount} active notes
            {completedCount > 0 && `, ${completedCount} completed`}
          </div>
          <div className="flex gap-2">
            {completedCount > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="apple-button"
                >
                  {showCompleted ? "Hide Completed" : "Show Completed"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCompleted}
                  disabled={clearCompleted.isPending}
                  className="apple-button text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear Completed
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Quick To-Dos List */}
      {quickTodos.length > 0 ? (
        <div className="space-y-2 animate-fade-in">
          {quickTodos.map((todo) => (
            <QuickTodoItem
              key={todo.id}
              todo={todo}
              className={todo.completed_at ? "opacity-60" : ""}
            />
          ))}
        </div>
      ) : (
        <Card className="journey-card text-center py-12">
          <StickyNote className="h-12 w-12 text-muted-foreground mx-auto mb-4 journey-float" />
          <h3 className="text-lg font-medium mb-2">No travel notes yet</h3>
          <p className="text-muted-foreground mb-4">
            Jot down quick thoughts and reminders as they come to mind
          </p>
        </Card>
      )}
    </div>
  );
}
