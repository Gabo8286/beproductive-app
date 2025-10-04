import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Star,
  TrendingUp,
  Zap,
  ArrowRight,
  Repeat,
} from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export function GamificationWidget() {
  const { profile, stats, achievements, isLoading } = useGamification();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <CardTitle>Journey Progress</CardTitle>
          </div>
          <CardDescription>
            Track your productivity achievements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile || !stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">
            Complete your first task to start your productivity journey!
          </p>
        </CardContent>
      </Card>
    );
  }

  const levelInfo = {
    level: profile.level,
    current_xp: profile.total_xp,
    xp_to_next_level: stats.xp_to_next_level,
    progress_percentage:
      profile.level >= 50
        ? 100
        : ((profile.total_xp -
            Math.floor(100 * Math.pow(profile.level - 1, 1.5) * 10)) /
            (Math.floor(100 * Math.pow(profile.level, 1.5) * 10) -
              Math.floor(100 * Math.pow(profile.level - 1, 1.5) * 10))) *
          100,
  };

  const recentAchievements = achievements
    .filter((a) => a.is_unlocked)
    .slice(0, 2);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <CardTitle>Journey Progress</CardTitle>
          </div>
          <Link to="/gamification">
            <Button variant="ghost" size="sm">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <CardDescription>
          Your productivity achievements and level
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="px-2 py-1">
                Level {profile.level}
              </Badge>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">
              {stats.total_points_earned.toLocaleString()} XP
            </span>
          </div>

          {levelInfo.xp_to_next_level > 0 && (
            <div className="space-y-1">
              <Progress
                value={Math.max(
                  0,
                  Math.min(100, levelInfo.progress_percentage),
                )}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  {levelInfo.xp_to_next_level.toLocaleString()} XP to next level
                </span>
                <span>{Math.round(levelInfo.progress_percentage)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
              <Zap className="h-4 w-4" />
              <span className="text-lg font-semibold">
                {stats.points_this_week.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-blue-700">This Week</p>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
              <Repeat className="h-4 w-4" />
              <span className="text-lg font-semibold">
                {stats.longest_streak}
              </span>
            </div>
            <p className="text-xs text-green-700">Best Streak</p>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 text-yellow-600 mb-1">
              <Trophy className="h-4 w-4" />
              <span className="text-lg font-semibold">
                {stats.achievements_unlocked}
              </span>
            </div>
            <p className="text-xs text-yellow-700">Achievements</p>
          </div>

          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
              <Repeat className="h-4 w-4" />
              <span className="text-lg font-semibold">
                {(profile.metadata as any)?.total_habits_completed || 0}
              </span>
            </div>
            <p className="text-xs text-purple-700">Habits Done</p>
          </div>
        </div>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              Recent Achievements
            </h4>
            <div className="space-y-2">
              {recentAchievements.map((achievement) => (
                <div
                  key={achievement.achievement.id}
                  className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg"
                >
                  <Trophy className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {achievement.achievement.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      +{achievement.achievement.points_reward} XP
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="pt-2 border-t border-gray-100">
          <Link to="/gamification" className="block">
            <Button variant="outline" className="w-full" size="sm">
              View Full Progress
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
