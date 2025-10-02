import { Plus, Target, CheckSquare, Repeat, BookOpen } from "lucide-react";
import { BaseWidget } from "./BaseWidget";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function QuickActionsWidget() {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: Target,
      label: "New Goal",
      path: "/goals/new",
      color: "text-primary"
    },
    {
      icon: CheckSquare,
      label: "Add Task",
      path: "/tasks",
      color: "text-warning"
    },
    {
      icon: Repeat,
      label: "Track Habit",
      path: "/habits",
      color: "text-secondary"
    },
    {
      icon: BookOpen,
      label: "Write Reflection",
      path: "/reflections",
      color: "text-success"
    }
  ];

  return (
    <BaseWidget
      title="Quick Actions"
      subtitle="Jump to your next step"
      icon={<Plus className="h-4 w-4" />}
      size="small"
      variant="glass"
    >
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center justify-center h-20 apple-button hover:bg-primary/5"
          >
            <action.icon className={`h-5 w-5 mb-1 ${action.color}`} />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </div>
    </BaseWidget>
  );
}
