import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StickyNote, ArrowRight } from "lucide-react";
import { useQuickTodos } from "@/hooks/quickTodos";
import { QuickTodoForm } from "@/components/quickTodos/QuickTodoForm";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function QuickTodosWidget() {
  const { data: quickTodos = [] } = useQuickTodos();
  const activeCount = quickTodos.filter((todo) => !todo.completed_at).length;
  const recentTodos = quickTodos.slice(0, 3);

  return (
    <Card className="journey-card apple-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-warning" />
            <CardTitle className="text-lg">Travel Notes</CardTitle>
          </div>
          <Link to="/quick-todos">
            <Button variant="ghost" size="sm" className="apple-button">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {activeCount > 0 && (
          <p className="text-sm text-muted-foreground">
            {activeCount} active notes
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <QuickTodoForm placeholder="Quick note..." />

        {recentTodos.length > 0 && (
          <div className="space-y-2">
            {recentTodos.map((todo) => (
              <div
                key={todo.id}
                className={cn(
                  "text-sm p-2 rounded border bg-muted/30 transition-opacity",
                  todo.completed_at &&
                    "line-through text-muted-foreground opacity-60",
                )}
              >
                {todo.content}
              </div>
            ))}
          </div>
        )}

        {quickTodos.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No travel notes yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
