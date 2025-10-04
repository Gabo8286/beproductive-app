import { motion } from "framer-motion";
import { Target, CheckCircle2, Flame, StickyNote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoUserData } from "@/types/demo";
import { useState } from "react";

interface LiveDashboardDemoProps {
  userData: DemoUserData;
  onInteraction?: (type: string, id: string) => void;
}

export function LiveDashboardDemo({
  userData,
  onInteraction,
}: LiveDashboardDemoProps) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const handleComplete = (type: string, id: string) => {
    setCompletedItems((prev) => new Set([...prev, `${type}-${id}`]));
    onInteraction?.(type, id);
  };

  const isCompleted = (type: string, id: string) =>
    completedItems.has(`${type}-${id}`);

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      data-demo="dashboard"
    >
      {/* Goals Widget */}
      <Card className="glass-card p-6" data-demo="goals">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-heading font-bold text-lg">Active Goals</h3>
        </div>

        <div className="space-y-3">
          {userData.goals.slice(0, 2).map((goal) => (
            <motion.div
              key={goal.id}
              data-demo="goal-card"
              whileHover={{ scale: 1.02 }}
              className="p-3 rounded-lg bg-background/50 cursor-pointer"
              onClick={() => handleComplete("goal", goal.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm">{goal.title}</h4>
                <Badge variant="secondary" className="text-xs">
                  {goal.category}
                </Badge>
              </div>
              <Progress value={goal.progress} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                {goal.progress}% complete
              </p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Habits Widget */}
      <Card className="glass-card p-6" data-demo="habits">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
            <Flame className="w-4 h-4 text-secondary" />
          </div>
          <h3 className="font-heading font-bold text-lg">Daily Habits</h3>
        </div>

        <div className="space-y-3">
          {userData.habits.slice(0, 3).map((habit) => (
            <motion.div
              key={habit.id}
              data-demo="habit-complete"
              whileHover={{ scale: 1.02 }}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                isCompleted("habit", habit.id)
                  ? "bg-success/20 border border-success/30"
                  : "bg-background/50"
              }`}
              onClick={() => handleComplete("habit", habit.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isCompleted("habit", habit.id)
                        ? "bg-success text-white"
                        : "bg-muted"
                    }`}
                  >
                    {isCompleted("habit", habit.id) && (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{habit.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-warning" />
                  <span className="text-sm font-bold">{habit.streak}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Tasks Widget */}
      <Card className="glass-card p-6" data-demo="tasks">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-warning" />
          </div>
          <h3 className="font-heading font-bold text-lg">Today's Tasks</h3>
        </div>

        <div className="space-y-2">
          {userData.tasks.slice(0, 3).map((task) => (
            <motion.div
              key={task.id}
              data-demo="task-complete"
              whileHover={{ scale: 1.02 }}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                isCompleted("task", task.id)
                  ? "bg-success/20 border border-success/30"
                  : "bg-background/50"
              }`}
              onClick={() => handleComplete("task", task.id)}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    isCompleted("task", task.id)
                      ? "border-success bg-success"
                      : "border-muted-foreground"
                  }`}
                >
                  {isCompleted("task", task.id) && (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm ${isCompleted("task", task.id) ? "line-through text-muted-foreground" : ""}`}
                  >
                    {task.title}
                  </p>
                </div>
                <Badge
                  variant={
                    task.priority === "high"
                      ? "destructive"
                      : task.priority === "medium"
                        ? "default"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {task.priority}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Quick Todos Widget */}
      <Card className="glass-card p-6" data-demo="quick-todos">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <StickyNote className="w-4 h-4 text-accent" />
          </div>
          <h3 className="font-heading font-bold text-lg">Travel Notes</h3>
        </div>

        <div className="space-y-2 mb-3">
          {userData.quickTodos.slice(0, 3).map((todo) => (
            <motion.div
              key={todo.id}
              whileHover={{ scale: 1.02 }}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                todo.completed || isCompleted("todo", todo.id)
                  ? "bg-success/20 border border-success/30"
                  : "bg-background/50"
              }`}
              onClick={() => handleComplete("todo", todo.id)}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    todo.completed || isCompleted("todo", todo.id)
                      ? "border-success bg-success"
                      : "border-muted-foreground"
                  }`}
                >
                  {(todo.completed || isCompleted("todo", todo.id)) && (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  )}
                </div>
                <p
                  className={`text-sm flex-1 ${
                    todo.completed || isCompleted("todo", todo.id)
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  {todo.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <input
          data-demo="quick-input"
          type="text"
          placeholder="Add a quick note..."
          className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.currentTarget.value) {
              handleComplete("quick-add", "new");
              e.currentTarget.value = "";
            }
          }}
        />
      </Card>
    </div>
  );
}
