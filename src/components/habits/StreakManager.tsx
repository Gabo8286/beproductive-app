import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Flame, Trophy, TrendingUp, Award, Zap } from "lucide-react";
import { Habit, HabitStreak } from "@/types/habits";
import { formatDistanceToNow } from "date-fns";

interface StreakManagerProps {
  habit: Habit;
  streaks: HabitStreak[];
}

export function StreakManager({ habit, streaks }: StreakManagerProps) {
  const [showHistory, setShowHistory] = useState(false);
  
  const currentStreak = habit.current_streak;
  const longestStreak = habit.longest_streak;
  const targetStreak = habit.target_streak;
  
  const getMilestones = () => {
    const milestones = [
      { days: 7, label: "Week Warrior", icon: "🔥", achieved: longestStreak >= 7 },
      { days: 21, label: "Habit Former", icon: "💪", achieved: longestStreak >= 21 },
      { days: 30, label: "Month Master", icon: "🌟", achieved: longestStreak >= 30 },
      { days: 66, label: "Neural Pathway", icon: "🧠", achieved: longestStreak >= 66 },
      { days: 100, label: "Century Club", icon: "💯", achieved: longestStreak >= 100 },
      { days: 365, label: "Year Legend", icon: "👑", achieved: longestStreak >= 365 },
    ];
    return milestones;
  };

  const getStreakLevel = (days: number) => {
    if (days >= 365) return { color: "text-purple-500", size: "text-6xl" };
    if (days >= 100) return { color: "text-orange-500", size: "text-5xl" };
    if (days >= 66) return { color: "text-red-500", size: "text-4xl" };
    if (days >= 30) return { color: "text-yellow-500", size: "text-3xl" };
    if (days >= 7) return { color: "text-orange-400", size: "text-2xl" };
    return { color: "text-gray-400", size: "text-xl" };
  };

  const getMotivationMessage = (streak: number) => {
    if (streak === 0) return "Start your journey today!";
    if (streak < 7) return `${7 - streak} days until Week Warrior!`;
    if (streak < 21) return `${21 - streak} days until Habit Former!`;
    if (streak < 30) return `${30 - streak} days until Month Master!`;
    if (streak < 66) return `${66 - streak} days until Neural Pathway!`;
    if (streak < 100) return `${100 - streak} days until Century Club!`;
    if (streak < 365) return `${365 - streak} days until Year Legend!`;
    return "You're a Legend! Keep it going! 🎉";
  };

  const streakLevel = getStreakLevel(currentStreak);
  const milestones = getMilestones();
  const progressToNext = targetStreak 
    ? Math.min(100, (currentStreak / targetStreak) * 100)
    : milestones.find(m => !m.achieved) 
      ? (currentStreak / milestones.find(m => !m.achieved)!.days) * 100
      : 100;

  return (
    <div className="space-y-4">
      {/* Main Streak Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className={`h-6 w-6 ${streakLevel.color}`} />
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className={`${streakLevel.size} font-bold flex items-center justify-center gap-2`}>
              {currentStreak}
              <span className={streakLevel.color}>🔥</span>
            </div>
            <p className="text-lg font-medium">
              {currentStreak === 1 ? "day" : "days"}
            </p>
            <p className="text-sm text-muted-foreground">
              {getMotivationMessage(currentStreak)}
            </p>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentStreak} days</span>
                <span>{targetStreak || milestones.find(m => !m.achieved)?.days || longestStreak} days</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 bg-accent rounded-lg">
                <Trophy className="h-6 w-6 mx-auto mb-1 text-yellow-500" />
                <div className="text-2xl font-bold">{longestStreak}</div>
                <p className="text-xs text-muted-foreground">Longest Streak</p>
              </div>
              <div className="text-center p-3 bg-accent rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-1 text-green-500" />
                <div className="text-2xl font-bold">{streaks.length}</div>
                <p className="text-xs text-muted-foreground">Total Streaks</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowHistory(true)}
            >
              View Streak History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {milestones.map((milestone) => (
              <div
                key={milestone.days}
                className={`p-3 rounded-lg border text-center ${
                  milestone.achieved
                    ? "bg-accent border-primary"
                    : "bg-muted/50 border-muted opacity-50"
                }`}
              >
                <div className="text-2xl mb-1">{milestone.icon}</div>
                <div className="font-semibold text-sm">{milestone.label}</div>
                <div className="text-xs text-muted-foreground">{milestone.days} days</div>
                {milestone.achieved && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Unlocked
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Streak History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Streak History</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {streaks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No previous streaks yet. Start building your first one!
              </p>
            ) : (
              streaks.map((streak, index) => (
                <div
                  key={streak.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {index === 0 ? "🏆" : "🔥"}
                    </div>
                    <div>
                      <div className="font-semibold">
                        {streak.length} day streak
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(streak.start_date).toLocaleDateString()} -{" "}
                        {streak.end_date
                          ? new Date(streak.end_date).toLocaleDateString()
                          : "Present"}
                      </p>
                      {streak.reason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Reason: {streak.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  {index === 0 && (
                    <Badge variant="secondary">Best Streak</Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
