import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Repeat,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  RefreshCw,
  Calendar,
  Activity,
  Lightbulb,
  Settings,
  Award,
  Timer
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  habitOptimizer,
  HabitContext,
  HabitPerformance,
  HabitOptimization,
  HabitInsight
} from '@/services/ai/habitOptimizer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface HabitAnalysisData {
  performance: HabitPerformance[];
  optimizations: HabitOptimization[];
  insights: HabitInsight[];
}

export function HabitOptimizerDashboard() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<HabitContext[]>([]);
  const [analysisData, setAnalysisData] = useState<HabitAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadHabits();
    }
  }, [user?.id]);

  const loadHabits = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('habits')
      .select(`
        *,
        habit_completions:habit_completions(*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load habits:', error);
      return;
    }

    // Transform data to match our interface
    const habitsWithCompletions = data.map(habit => ({
      id: habit.id,
      title: habit.title,
      description: habit.description,
      category: habit.category || 'general',
      frequency: habit.frequency || 'daily',
      target_count: habit.target_count || 1,
      is_active: habit.is_active,
      created_at: habit.created_at,
      streak_count: habit.streak_count || 0,
      total_completions: habit.habit_completions?.length || 0,
      reminder_time: habit.reminder_time,
      difficulty_level: habit.difficulty_level || 'medium',
      metadata: habit.metadata
    }));

    setHabits(habitsWithCompletions);
  };

  const analyzeHabits = async () => {
    if (!user?.id || habits.length === 0) return;

    setIsLoading(true);
    try {
      const analysisResult = await habitOptimizer.analyzeHabits({
        userId: user.id,
        habits,
        lookbackDays: 30,
        includeGoalAlignment: true,
        includeLifestyleFactors: true
      });

      setAnalysisData(analysisResult);

      // Save optimizations to database
      if (analysisResult.optimizations.length > 0) {
        await habitOptimizer.saveHabitOptimizations(analysisResult.optimizations, user.id);
      }

      toast.success('Habit analysis completed successfully');
    } catch (error) {
      console.error('Failed to analyze habits:', error);
      toast.error('Failed to analyze habits');
    } finally {
      setIsLoading(false);
    }
  };

  const getMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case 'building': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
      case 'building': return 'text-green-600';
      case 'stable': return 'text-blue-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'too_easy': return 'bg-blue-100 text-blue-800';
      case 'optimal': return 'bg-green-100 text-green-800';
      case 'too_hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'maintain': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'increase': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'decrease': return <TrendingDown className="h-4 w-4 text-orange-600" />;
      case 'redesign': return <Settings className="h-4 w-4 text-purple-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getOptimizationIcon = (type: string) => {
    switch (type) {
      case 'frequency': return <Repeat className="h-4 w-4" />;
      case 'timing': return <Clock className="h-4 w-4" />;
      case 'difficulty': return <Target className="h-4 w-4" />;
      case 'strategy': return <Lightbulb className="h-4 w-4" />;
      case 'environment': return <Settings className="h-4 w-4" />;
      case 'reward': return <Award className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <BarChart3 className="h-4 w-4" />;
      case 'correlation': return <Activity className="h-4 w-4" />;
      case 'bottleneck': return <AlertTriangle className="h-4 w-4" />;
      case 'opportunity': return <Target className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Habit Optimizer</h2>
          <p className="text-muted-foreground">
            AI-powered habit analysis and optimization recommendations
          </p>
        </div>
        <Button onClick={analyzeHabits} disabled={isLoading || habits.length === 0}>
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          Optimize Habits
        </Button>
      </div>

      {habits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Repeat className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Habits</h3>
            <p className="text-muted-foreground text-center">
              Create some habits to start optimizing them with AI insights.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
                  <Repeat className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{habits.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {habits.filter(h => h.frequency === 'daily').length} daily habits
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analysisData
                      ? Math.round(analysisData.performance.reduce((sum, p) => sum + p.completionRate, 0) / analysisData.performance.length)
                      : '--'
                    }%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all habits
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Building Momentum</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analysisData
                      ? analysisData.performance.filter(p => p.momentum === 'building').length
                      : '--'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Habits gaining strength
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Need Attention</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analysisData
                      ? analysisData.performance.filter(p => p.momentum === 'declining' || p.completionRate < 50).length
                      : '--'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Habits needing help
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Habit Overview</CardTitle>
                  <CardDescription>Current status of all active habits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {habits.map((habit) => {
                      const performance = analysisData?.performance.find(p => p.habitId === habit.id);
                      return (
                        <div key={habit.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{habit.title}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">
                                  {habit.frequency}
                                </Badge>
                                <Badge variant="outline">
                                  {habit.target_count}x
                                </Badge>
                                <Badge className={getDifficultyColor(performance?.difficulty || 'optimal')}>
                                  {performance?.difficulty || 'unknown'}
                                </Badge>
                              </div>
                            </div>
                            {performance && (
                              <>
                                <Progress value={performance.completionRate} className="mb-2" />
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                  <span>{Math.round(performance.completionRate)}% completion rate</span>
                                  <div className="flex items-center space-x-2">
                                    {getMomentumIcon(performance.momentum)}
                                    <span className={getMomentumColor(performance.momentum)}>
                                      {performance.momentum}
                                    </span>
                                    {getRecommendationIcon(performance.recommendation)}
                                    <span>{performance.recommendation}</span>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {analysisData?.performance.map((performance) => {
              const habit = habits.find(h => h.id === performance.habitId);
              if (!habit) return null;

              return (
                <Card key={performance.habitId}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {habit.title}
                      <div className="flex items-center space-x-2">
                        {getMomentumIcon(performance.momentum)}
                        <span className={`text-sm ${getMomentumColor(performance.momentum)}`}>
                          {performance.momentum} momentum
                        </span>
                      </div>
                    </CardTitle>
                    <CardDescription>{habit.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Completion Rate</div>
                        <div className="text-2xl font-bold">{Math.round(performance.completionRate)}%</div>
                        <Progress value={performance.completionRate} className="mt-2" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Current Streak</div>
                        <div className="text-2xl font-bold">{performance.streakData.currentStreak}</div>
                        <div className="text-xs text-muted-foreground">
                          Longest: {performance.streakData.longestStreak}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Consistency</div>
                        <div className="text-2xl font-bold">
                          {Math.round(performance.consistency * 100)}%
                        </div>
                        <Progress value={performance.consistency * 100} className="mt-2" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Difficulty</div>
                        <Badge className={getDifficultyColor(performance.difficulty)}>
                          {performance.difficulty}
                        </Badge>
                        <div className="flex items-center mt-2">
                          {getRecommendationIcon(performance.recommendation)}
                          <span className="text-xs text-muted-foreground ml-1">
                            {performance.recommendation}
                          </span>
                        </div>
                      </div>
                    </div>

                    {(performance.patterns.bestDays.length > 0 || performance.patterns.bestTimes.length > 0) && (
                      <div className="grid gap-4 md:grid-cols-2">
                        {performance.patterns.bestDays.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Best Days
                            </h4>
                            <div className="flex gap-2">
                              {performance.patterns.bestDays.map((day, index) => (
                                <Badge key={index} variant="outline">
                                  {day}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {performance.patterns.bestTimes.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                              <Timer className="h-4 w-4" />
                              Best Times
                            </h4>
                            <div className="flex gap-2">
                              {performance.patterns.bestTimes.map((time, index) => (
                                <Badge key={index} variant="outline">
                                  {time}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="optimizations" className="space-y-4">
            {analysisData?.optimizations && analysisData.optimizations.length > 0 ? (
              <div className="space-y-4">
                {analysisData.optimizations.map((optimization, index) => {
                  const habit = habits.find(h => h.id === optimization.habitId);
                  return (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getOptimizationIcon(optimization.type)}
                            {optimization.title}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">
                              {optimization.priority}
                            </Badge>
                            <Badge variant="outline">
                              {Math.round(optimization.confidence * 100)}% confident
                            </Badge>
                          </div>
                        </CardTitle>
                        <CardDescription>
                          For habit: {habit?.title} • {optimization.type} optimization
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm">{optimization.description}</p>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-semibold mb-2">Why this helps:</h4>
                            <p className="text-sm text-muted-foreground">{optimization.reasoning}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Expected Impact:</h4>
                            <p className="text-sm text-muted-foreground">{optimization.expectedImpact}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Implementation Steps:</h4>
                          <ol className="list-decimal list-inside space-y-1">
                            {optimization.implementationSteps.map((step, stepIndex) => (
                              <li key={stepIndex} className="text-sm text-muted-foreground">
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <Badge variant="outline">Effort: {optimization.effort}</Badge>
                          <Badge variant="outline">Results in: {optimization.estimatedTimeToSeeResults}</Badge>
                          <Badge variant="outline">Type: {optimization.type}</Badge>
                        </div>

                        {optimization.metrics.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Success Metrics:</h4>
                            <div className="flex gap-2">
                              {optimization.metrics.map((metric, metricIndex) => (
                                <Badge key={metricIndex} variant="outline">
                                  {metric}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Optimizations Yet</h3>
                  <p className="text-muted-foreground text-center">
                    Run habit analysis to get AI-powered optimization recommendations.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {analysisData?.insights && analysisData.insights.length > 0 ? (
              <div className="space-y-4">
                {analysisData.insights.map((insight, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getInsightIcon(insight.type)}
                        {insight.title}
                      </CardTitle>
                      <CardDescription>
                        {insight.type} insight • {insight.actionable ? 'Actionable' : 'Informational'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{insight.description}</p>

                      {insight.affectedHabits.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Affected Habits:</h4>
                          <div className="flex gap-2">
                            {insight.affectedHabits.map((habitId, habitIndex) => {
                              const habit = habits.find(h => h.id === habitId);
                              return (
                                <Badge key={habitIndex} variant="outline">
                                  {habit?.title || 'Unknown'}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {insight.suggestions.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Suggestions:</h4>
                          <ul className="space-y-1">
                            {insight.suggestions.map((suggestion, suggestionIndex) => (
                              <li key={suggestionIndex} className="text-sm text-muted-foreground">
                                • {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-4">
                        <Badge variant="outline">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Insights Available</h3>
                  <p className="text-muted-foreground text-center">
                    Run habit analysis to generate strategic insights about your habit patterns.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}