import { Card } from "@/components/ui/card";
import { useReflectionStreak } from "@/hooks/useReflectionAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Trophy, Target, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StreakAnalyticsProps {
  workspaceId: string;
  compact?: boolean;
  detailed?: boolean;
}

export default function StreakAnalytics({
  workspaceId,
  compact = false,
  detailed = false,
}: StreakAnalyticsProps) {
  const { data: streakData, isLoading } = useReflectionStreak(workspaceId);

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-[200px] w-full" />
      </Card>
    );
  }

  const currentStreak = streakData?.current_streak || 0;
  const longestStreak = streakData?.longest_streak || 0;
  const nextMilestone = streakData?.next_milestone || 7;
  const progressToMilestone = (currentStreak / nextMilestone) * 100;

  if (compact) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <p className="text-sm font-medium text-muted-foreground">
              Reflection Streak
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold">{currentStreak}</p>
            <p className="text-sm text-muted-foreground">days in a row</p>
          </div>
          <Progress value={progressToMilestone} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {nextMilestone - currentStreak} days to next milestone
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Reflection Consistency</h3>
          <p className="text-sm text-muted-foreground">
            Track your reflection practice and build lasting habits
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <p className="text-sm font-medium text-muted-foreground">
                Current Streak
              </p>
            </div>
            <p className="text-3xl font-bold">{currentStreak}</p>
            <p className="text-sm text-muted-foreground">consecutive days</p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <p className="text-sm font-medium text-muted-foreground">
                Longest Streak
              </p>
            </div>
            <p className="text-3xl font-bold">{longestStreak}</p>
            <p className="text-sm text-muted-foreground">personal best</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Next Milestone</span>
            </div>
            <span className="font-medium">{nextMilestone} days</span>
          </div>
          <Progress value={progressToMilestone} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {nextMilestone - currentStreak} more days to go
          </p>
        </div>

        {detailed && (
          <div className="pt-4 border-t space-y-4">
            <h4 className="font-semibold">Streak Achievements</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">7-Day Warrior</p>
                  <p className="text-xs text-muted-foreground">
                    Reflected for a full week
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-muted-foreground">
                    30-Day Champion
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Not yet achieved
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
