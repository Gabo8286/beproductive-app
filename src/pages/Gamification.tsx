import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Star, Target, Zap, Calendar, Award, TrendingUp, Activity } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { formatDistanceToNow } from 'date-fns';

const RARITY_COLORS = {
  common: 'bg-gray-100 text-gray-800 border-gray-200',
  rare: 'bg-blue-100 text-blue-800 border-blue-200',
  epic: 'bg-purple-100 text-purple-800 border-purple-200',
  legendary: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

const RARITY_ICONS = {
  common: Star,
  rare: Award,
  epic: Trophy,
  legendary: Crown
};

function Crown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16L3 8l5.5 2L12 4l3.5 6L21 8l-2 8H5zm2.7-2h8.6l.9-4.4L14 11l-2-3.4L10 11l-3.2-1.4L7.7 14z"/>
    </svg>
  );
}

export default function Gamification() {
  const {
    profile,
    achievements,
    recentActivity,
    stats,
    isLoading
  } = useGamification();

  const [selectedTab, setSelectedTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !stats) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Failed to load gamification data. Please try refreshing the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const levelInfo = profile ? {
    level: profile.level,
    current_xp: profile.total_xp,
    xp_required: stats.xp_to_next_level + (profile.total_xp - Math.floor(100 * Math.pow(profile.level - 1, 1.5) * 10)),
    xp_to_next_level: stats.xp_to_next_level,
    progress_percentage: ((profile.total_xp - Math.floor(100 * Math.pow(profile.level - 1, 1.5) * 10)) / stats.xp_to_next_level) * 100
  } : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journey Progress</h1>
          <p className="text-gray-600 mt-1">Track your productivity growth and achievements</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-3 py-1">
            Level {profile.level}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            {stats.total_points_earned.toLocaleString()} XP
          </Badge>
        </div>
      </div>

      {/* Level Progress Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Current Level: {profile.level}</span>
          </CardTitle>
          <CardDescription>
            {levelInfo && levelInfo.xp_to_next_level > 0
              ? `${levelInfo.xp_to_next_level.toLocaleString()} XP to level ${profile.level + 1}`
              : 'Maximum level reached!'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {levelInfo && levelInfo.xp_to_next_level > 0 && (
            <div className="space-y-2">
              <Progress
                value={Math.max(0, Math.min(100, levelInfo.progress_percentage))}
                className="h-3"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{(profile.total_xp - Math.floor(100 * Math.pow(profile.level - 1, 1.5) * 10)).toLocaleString()} XP</span>
                <span>{levelInfo.xp_required.toLocaleString()} XP needed</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.points_this_week.toLocaleString()}</p>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.points_this_month.toLocaleString()}</p>
                <p className="text-sm text-gray-600">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.achievements_unlocked}</p>
                <p className="text-sm text-gray-600">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.longest_streak}</p>
                <p className="text-sm text-gray-600">Longest Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span>Recent Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements
                    .filter(a => a.is_unlocked)
                    .slice(0, 5)
                    .map((achievement) => {
                      const RarityIcon = RARITY_ICONS[achievement.achievement.rarity as keyof typeof RARITY_ICONS] || Star;
                      return (
                        <div key={achievement.achievement.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                          <RarityIcon className="h-6 w-6 text-yellow-600" />
                          <div className="flex-1">
                            <p className="font-medium">{achievement.achievement.title}</p>
                            <p className="text-sm text-gray-600">{achievement.achievement.description}</p>
                          </div>
                          <Badge className={RARITY_COLORS[achievement.achievement.rarity as keyof typeof RARITY_COLORS]}>
                            {achievement.achievement.rarity}
                          </Badge>
                        </div>
                      );
                    })}
                  {achievements.filter(a => a.is_unlocked).length === 0 && (
                    <p className="text-gray-500 text-center py-4">No achievements unlocked yet. Keep going!</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progress Towards Next Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>In Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements
                    .filter(a => !a.is_unlocked && a.current_progress > 0)
                    .slice(0, 5)
                    .map((achievement) => (
                      <div key={achievement.achievement.id} className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{achievement.achievement.title}</p>
                            <p className="text-sm text-gray-600">{achievement.achievement.description}</p>
                          </div>
                          <Badge variant="outline">
                            {achievement.current_progress}/{achievement.achievement.requirement_value}
                          </Badge>
                        </div>
                        <Progress
                          value={achievement.progress_percentage}
                          className="h-2"
                        />
                      </div>
                    ))}
                  {achievements.filter(a => !a.is_unlocked && a.current_progress > 0).length === 0 && (
                    <p className="text-gray-500 text-center py-4">Start your productivity journey to see progress!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const RarityIcon = RARITY_ICONS[achievement.achievement.rarity as keyof typeof RARITY_ICONS] || Star;
              return (
                <Card
                  key={achievement.achievement.id}
                  className={`transition-all duration-200 ${
                    achievement.is_unlocked
                      ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
                      : 'hover:shadow-md'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <RarityIcon
                        className={`h-8 w-8 ${
                          achievement.is_unlocked ? 'text-yellow-600' : 'text-gray-400'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-semibold ${
                              achievement.is_unlocked ? 'text-gray-900' : 'text-gray-600'
                            }`}>
                              {achievement.achievement.title}
                            </h3>
                            <p className={`text-sm ${
                              achievement.is_unlocked ? 'text-gray-700' : 'text-gray-500'
                            }`}>
                              {achievement.achievement.description}
                            </p>
                          </div>
                          <Badge className={RARITY_COLORS[achievement.achievement.rarity as keyof typeof RARITY_COLORS]}>
                            {achievement.achievement.rarity}
                          </Badge>
                        </div>

                        {!achievement.is_unlocked && (
                          <div className="mt-3 space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{achievement.current_progress}/{achievement.achievement.requirement_value}</span>
                            </div>
                            <Progress value={achievement.progress_percentage} className="h-2" />
                          </div>
                        )}

                        {achievement.is_unlocked && achievement.unlocked_at && (
                          <p className="text-xs text-gray-600 mt-2">
                            Unlocked {formatDistanceToNow(new Date(achievement.unlocked_at), { addSuffix: true })}
                          </p>
                        )}

                        <div className="flex justify-between items-center mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {achievement.achievement.category}
                          </Badge>
                          <span className="text-sm font-medium text-blue-600">
                            +{achievement.achievement.points_reward} XP
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Your latest productivity achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium">{activity.description || activity.action_type}</p>
                      <p className="text-sm text-gray-600">
                        {formatDistanceToNow(new Date(activity.earned_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">+{activity.points} XP</p>
                      <p className="text-xs text-gray-500">{activity.source_module}</p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No recent activity. Start completing tasks and setting goals to see your progress here!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}