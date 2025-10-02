import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStreakLeaderboard } from "@/hooks/useHabitStreaks";
import { Trophy, Medal, Award } from "lucide-react";

interface StreakLeaderboardProps {
  workspaceId: string;
}

export function StreakLeaderboard({ workspaceId }: StreakLeaderboardProps) {
  const { data: leaderboard, isLoading } = useStreakLeaderboard(workspaceId);

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div>Loading leaderboard...</div>;
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Streak Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No habits with streaks yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Streak Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.habit.id}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 text-center">
                  {getMedalIcon(entry.rank) || (
                    <span className="text-muted-foreground font-semibold">#{entry.rank}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {entry.habit.icon && <span>{entry.habit.icon}</span>}
                    <span className="font-medium">{entry.habit.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Best: {entry.longest_streak} days
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">{entry.current_streak} 🔥</div>
                <Badge variant="secondary" className="text-xs">
                  {entry.completion_rate.toFixed(0)}% rate
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
