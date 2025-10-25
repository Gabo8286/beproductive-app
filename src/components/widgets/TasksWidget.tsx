import { CheckSquare, Plus, Calendar } from "lucide-react";
import { BaseWidget } from "@/components/widgets/BaseWidget";
import { WidgetActions } from "@/components/widgets/WidgetActions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTasks } from "@/hooks/useTasks";
import { useNavigate } from "react-router-dom";

export function TasksWidget() {
  const navigate = useNavigate();
  const { data: tasks = [], isLoading, refetch } = useTasks();

  const pendingTasks = tasks.filter((task) => task.status !== "done");
  const todayTasks = tasks.filter((task) => {
    if (!task.due_date) return false;
    const today = new Date().toDateString();
    return new Date(task.due_date).toDateString() === today;
  });
  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date() && task.status !== "done";
  });

  const priorityTasks = pendingTasks
    .filter((task) => task.priority === "high" || task.priority === "urgent")
    .slice(0, 3);

  return (
    <BaseWidget
      title="Next Steps"
      subtitle="What needs to be done"
      icon={<CheckSquare className="h-4 w-4" />}
      size="medium"
      variant="glass"
      isLoading={isLoading}
      actions={
        <WidgetActions onRefresh={() => refetch()} isRefreshing={isLoading} />
      }
    >
      <div className="space-y-4">
        {/* Task Overview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1 text-center">
            <div className="text-xl font-bold text-warning">
              {pendingTasks.length}
            </div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="space-y-1 text-center">
            <div className="text-xl font-bold text-primary">
              {todayTasks.length}
            </div>
            <div className="text-xs text-muted-foreground">Due Today</div>
          </div>
          <div className="space-y-1 text-center">
            <div className="text-xl font-bold text-destructive">
              {overdueTasks.length}
            </div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </div>
        </div>

        {/* Priority Tasks */}
        {priorityTasks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              High Priority
            </h4>
            <div className="space-y-2">
              {priorityTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {task.title}
                    </div>
                    {task.due_date && (
                      <div className="text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Badge
                    variant={
                      task.priority === "urgent" ? "destructive" : "secondary"
                    }
                    className="text-xs"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => navigate("/tasks")}
            className="flex-1 apple-button"
          >
            View All Tasks
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/tasks")}
            className="apple-button"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </BaseWidget>
  );
}
