import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Award, Star, Zap } from "lucide-react";
import { Habit } from "@/types/habits";

interface StreakAchievementsProps {
  habit: Habit;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  progress: number;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export function StreakAchievements({ habit }: StreakAchievementsProps) {
  const getAchievements = (): Achievement[] => {
    const streak = habit.current_streak;
    const longest = habit.longest_streak;

    return [
      {
        id: 'first-step',
        title: 'First Step',
        description: 'Complete your habit for the first time',
        icon: <Star className="h-5 w-5" />,
        requirement: 1,
        progress: Math.min(longest, 1),
        unlocked: longest >= 1,
        rarity: 'common',
      },
      {
        id: 'week-warrior',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: <Zap className="h-5 w-5" />,
        requirement: 7,
        progress: Math.min(longest, 7),
        unlocked: longest >= 7,
        rarity: 'common',
      },
      {
        id: 'habit-former',
        title: 'Habit Former',
        description: 'Reach a 21-day streak (habit formation)',
        icon: <Award className="h-5 w-5" />,
        requirement: 21,
        progress: Math.min(longest, 21),
        unlocked: longest >= 21,
        rarity: 'rare',
      },
      {
        id: 'month-master',
        title: 'Month Master',
        description: 'Complete 30 consecutive days',
        icon: <Medal className="h-5 w-5" />,
        requirement: 30,
        progress: Math.min(longest, 30),
        unlocked: longest >= 30,
        rarity: 'rare',
      },
      {
        id: 'neural-pathway',
        title: 'Neural Pathway',
        description: 'Build a 66-day streak (automatic habit)',
        icon: <Trophy className="h-5 w-5" />,
        requirement: 66,
        progress: Math.min(longest, 66),
        unlocked: longest >= 66,
        rarity: 'epic',
      },
      {
        id: 'century-club',
        title: 'Century Club',
        description: 'Achieve a 100-day streak',
        icon: <Trophy className="h-5 w-5" />,
        requirement: 100,
        progress: Math.min(longest, 100),
        unlocked: longest >= 100,
        rarity: 'epic',
      },
      {
        id: 'year-legend',
        title: 'Year Legend',
        description: 'Complete a full 365-day streak',
        icon: <Trophy className="h-5 w-5" />,
        requirement: 365,
        progress: Math.min(longest, 365),
        unlocked: longest >= 365,
        rarity: 'legendary',
      },
    ];
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-500';
      case 'rare':
        return 'text-blue-500';
      case 'epic':
        return 'text-purple-500';
      case 'legendary':
        return 'text-yellow-500';
    }
  };

  const getRarityBg = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 dark:bg-gray-900';
      case 'rare':
        return 'bg-blue-100 dark:bg-blue-950';
      case 'epic':
        return 'bg-purple-100 dark:bg-purple-950';
      case 'legendary':
        return 'bg-yellow-100 dark:bg-yellow-950';
    }
  };

  const achievements = getAchievements();
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
          <Badge variant="secondary">
            {unlockedCount}/{totalCount}
          </Badge>
        </div>
        <Progress value={(unlockedCount / totalCount) * 100} className="h-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border ${
                achievement.unlocked
                  ? getRarityBg(achievement.rarity)
                  : 'bg-muted/50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={achievement.unlocked ? getRarityColor(achievement.rarity) : 'text-muted-foreground'}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{achievement.title}</h4>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${
                        achievement.unlocked ? '' : 'opacity-50'
                      }`}
                    >
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  {!achievement.unlocked && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>
                          {achievement.progress}/{achievement.requirement} days
                        </span>
                      </div>
                      <Progress
                        value={(achievement.progress / achievement.requirement) * 100}
                        className="h-1"
                      />
                    </div>
                  )}
                  {achievement.unlocked && (
                    <Badge variant="secondary" className="text-xs">
                      ✓ Unlocked
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
