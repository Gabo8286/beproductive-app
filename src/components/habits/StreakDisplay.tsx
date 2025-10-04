import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, TrendingUp } from "lucide-react";
import { Habit, HabitStreak } from "@/types/habits";

interface StreakDisplayProps {
  habit: Habit;
  streaks: HabitStreak[];
}

export function StreakDisplay({ habit, streaks }: StreakDisplayProps) {
  const currentStreak = habit.current_streak;
  const longestStreak = habit.longest_streak;
  const targetStreak = habit.target_streak;

  const getMotivationMessage = (streak: number) => {
    if (streak === 0) return "Start your journey today!";
    if (streak < 7) return "Great start! Keep it up!";
    if (streak < 21) return "You're building momentum!";
    if (streak < 66) return "Amazing consistency!";
    return "You're a habit master! 🎉";
  };

  const getMilestones = (streak: number) => {
    const milestones = [7, 21, 30, 66, 100, 365];
    return milestones.filter((m) => m <= streak);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold">
                  {currentStreak} days 🔥
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {getMotivationMessage(currentStreak)}
                </p>
              </div>
              {targetStreak && (
                <div className="text-right">
                  <div className="text-2xl font-semibold text-muted-foreground">
                    {targetStreak - currentStreak > 0
                      ? targetStreak - currentStreak
                      : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    days to target
                  </p>
                </div>
              )}
            </div>

            {targetStreak && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to target</span>
                  <span>
                    {Math.min(
                      100,
                      (currentStreak / targetStreak) * 100,
                    ).toFixed(0)}
                    %
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (currentStreak / targetStreak) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Longest Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{longestStreak} days</div>
            {currentStreak === longestStreak && currentStreak > 0 && (
              <Badge variant="secondary" className="mt-2">
                <TrendingUp className="h-3 w-3 mr-1" />
                Personal Best!
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getMilestones(longestStreak).map((milestone) => (
                <Badge key={milestone} variant="outline">
                  {milestone} days
                </Badge>
              ))}
              {getMilestones(longestStreak).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Reach 7 days for your first milestone!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {streaks.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Streak History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {streaks.slice(0, 5).map((streak) => (
                <div
                  key={streak.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <span className="font-medium">{streak.length} days</span>
                    {streak.broken_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(streak.start_date).toLocaleDateString()} -{" "}
                        {new Date(streak.broken_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {streak.reason && (
                    <Badge variant="outline">{streak.reason}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
