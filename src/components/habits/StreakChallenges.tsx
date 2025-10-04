import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Users, Calendar, TrendingUp } from "lucide-react";
import { Habit } from "@/types/habits";

interface StreakChallengesProps {
  habit: Habit;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target: number;
  progress: number;
  reward: string;
  type: "personal" | "community" | "seasonal";
  difficulty: "easy" | "medium" | "hard";
}

export function StreakChallenges({ habit }: StreakChallengesProps) {
  const currentStreak = habit.current_streak;
  const longestStreak = habit.longest_streak;

  const getChallenges = (): Challenge[] => {
    return [
      {
        id: "perfect-week",
        title: "Perfect Week",
        description: "Complete your habit 7 days in a row",
        icon: <Target className="h-5 w-5" />,
        target: 7,
        progress: Math.min(currentStreak, 7),
        reward: "🔥 Week Warrior Badge",
        type: "personal",
        difficulty: "easy",
      },
      {
        id: "habit-month",
        title: "Habit Month",
        description: "Build a 30-day streak",
        icon: <Calendar className="h-5 w-5" />,
        target: 30,
        progress: Math.min(currentStreak, 30),
        reward: "⭐ Month Master Badge",
        type: "personal",
        difficulty: "medium",
      },
      {
        id: "streak-recovery",
        title: "Comeback Kid",
        description: "Get back to a 7-day streak after breaking one",
        icon: <TrendingUp className="h-5 w-5" />,
        target: 7,
        progress: longestStreak > 7 && currentStreak < 7 ? currentStreak : 0,
        reward: "💪 Resilience Badge",
        type: "personal",
        difficulty: "medium",
      },
      {
        id: "century-challenge",
        title: "Century Challenge",
        description: "Achieve a 100-day streak",
        icon: <Target className="h-5 w-5" />,
        target: 100,
        progress: Math.min(currentStreak, 100),
        reward: "💯 Century Club Badge",
        type: "community",
        difficulty: "hard",
      },
    ];
  };

  const challenges = getChallenges();
  const activeChallenges = challenges.filter((c) => c.progress < c.target);
  const completedChallenges = challenges.filter((c) => c.progress >= c.target);

  const getDifficultyColor = (difficulty: Challenge["difficulty"]) => {
    switch (difficulty) {
      case "easy":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "hard":
        return "text-red-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Challenges
          </CardTitle>
          <Badge variant="secondary">
            {completedChallenges.length}/{challenges.length} completed
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Active Challenges */}
          {activeChallenges.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Active Challenges</h4>
              {activeChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="p-4 rounded-lg border bg-accent/50"
                >
                  <div className="flex items-start gap-3">
                    <div className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.icon}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-semibold">{challenge.title}</h5>
                        <Badge variant="outline" className="capitalize">
                          {challenge.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {challenge.description}
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>
                            {challenge.progress}/{challenge.target} days
                          </span>
                        </div>
                        <Progress
                          value={(challenge.progress / challenge.target) * 100}
                          className="h-2"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Reward:</span>
                        <span className="font-medium">{challenge.reward}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed Challenges */}
          {completedChallenges.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Completed Challenges</h4>
              {completedChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="p-4 rounded-lg border bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-green-500">{challenge.icon}</div>
                      <div>
                        <h5 className="font-semibold">{challenge.title}</h5>
                        <p className="text-sm text-muted-foreground">
                          {challenge.reward}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-500">✓ Completed</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeChallenges.length === 0 &&
            completedChallenges.length === challenges.length && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎉</div>
                <p className="font-semibold">All Challenges Complete!</p>
                <p className="text-sm text-muted-foreground">
                  You've mastered all available challenges
                </p>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
