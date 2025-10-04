import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHabits } from "@/hooks/useHabits";
import { useTodayEntries } from "@/hooks/useHabitEntries";
import { useCreateEntry } from "@/hooks/useHabitEntries";
import { CreateHabitEntryInput } from "@/types/habits";
import { format } from "date-fns";
import { CheckCircle2, Circle, XCircle } from "lucide-react";

interface TodayTrackerProps {
  workspaceId: string;
}

export function TodayTracker({ workspaceId }: TodayTrackerProps) {
  const { data: habits } = useHabits(workspaceId, { archived: false });
  const { data: todayEntries } = useTodayEntries(workspaceId);
  const createEntry = useCreateEntry();

  const dailyHabits =
    habits?.filter((h) => h.frequency === "daily" && !h.archived_at) || [];
  const completedCount =
    todayEntries?.filter((e) => e.status === "completed").length || 0;
  const totalCount = dailyHabits.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleQuickComplete = (
    habitId: string,
    status: "completed" | "skipped",
  ) => {
    const input: CreateHabitEntryInput = {
      habit_id: habitId,
      date: format(new Date(), "yyyy-MM-dd"),
      status,
    };

    createEntry.mutate(input);
  };

  const getHabitEntry = (habitId: string) => {
    return todayEntries?.find((e) => e.habit?.id === habitId);
  };

  if (dailyHabits.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Today's Habits</CardTitle>
          <Badge variant={progress === 100 ? "default" : "secondary"}>
            {completedCount}/{totalCount} completed
          </Badge>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 mt-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {dailyHabits.map((habit) => {
            const entry = getHabitEntry(habit.id);
            const isCompleted = entry?.status === "completed";
            const isSkipped = entry?.status === "skipped";

            return (
              <div
                key={habit.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : isSkipped ? (
                    <XCircle className="h-5 w-5 text-orange-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      {habit.icon && <span>{habit.icon}</span>}
                      <span
                        className={
                          isCompleted
                            ? "line-through text-muted-foreground"
                            : ""
                        }
                      >
                        {habit.title}
                      </span>
                    </div>
                    {habit.duration_minutes && (
                      <p className="text-xs text-muted-foreground">
                        {habit.duration_minutes} minutes
                      </p>
                    )}
                  </div>
                </div>

                {!entry && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleQuickComplete(habit.id, "completed")}
                    >
                      ✓ Done
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickComplete(habit.id, "skipped")}
                    >
                      Skip
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
