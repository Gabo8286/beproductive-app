import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Calendar,
  Activity,
  BarChart3,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { smartGoalTracker, GoalProgress, GoalSuggestion, GoalContext } from '@/services/ai/smartGoalTracker';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface GoalTrackingData {
  progress: GoalProgress[];
  suggestions: GoalSuggestion[];
  insights: any[];
}

export function SmartGoalTracker() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<GoalContext[]>([]);
  const [trackingData, setTrackingData] = useState<GoalTrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadGoals();
    }
  }, [user?.id]);

  const loadGoals = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        tasks:tasks(*)
      `)
      .eq('created_by', user.id)
      .eq('status', 'active')
      .order('priority', { ascending: false });

    if (error) {
      console.error('Failed to load goals:', error);
      return;
    }

    const goalsWithTasks = data.map(goal => ({
      ...goal,
      tasks: goal.tasks || [],
      milestones: goal.metadata?.milestones || []
    }));

    setGoals(goalsWithTasks);
  };

  const analyzeGoals = async () => {
    if (!user?.id || goals.length === 0) return;

    setIsLoading(true);
    try {
      const analysisResult = await smartGoalTracker.analyzeGoals({
        userId: user.id,
        goals,
        lookbackDays: 30,
        includeTaskAnalysis: true,
        includeMilestoneAnalysis: true
      });

      setTrackingData(analysisResult);

      // Save recommendations to database
      if (analysisResult.suggestions.length > 0) {
        await smartGoalTracker.saveGoalRecommendations(analysisResult.suggestions, user.id);
      }

      toast.success('Goal analysis completed successfully');
    } catch (error) {
      console.error('Failed to analyze goals:', error);
      toast.error('Failed to analyze goals');
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressColor = (probability: number) => {
    if (probability >= 0.8) return 'text-green-600';
    if (probability >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressIcon = (probability: number) => {
    if (probability >= 0.8) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (probability >= 0.5) return <Activity className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <Target className="h-4 w-4" />;
      case 'task': return <CheckCircle className="h-4 w-4" />;
      case 'deadline': return <Clock className="h-4 w-4" />;
      case 'priority': return <AlertTriangle className="h-4 w-4" />;
      case 'resource': return <Settings className="h-4 w-4" />;
      case 'strategy': return <Lightbulb className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Smart Goal Tracker</h2>
          <p className="text-muted-foreground">
            AI-powered goal progress analysis and recommendations
          </p>
        </div>
        <Button onClick={analyzeGoals} disabled={isLoading || goals.length === 0}>
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <BarChart3 className="h-4 w-4 mr-2" />
          )}
          Analyze Goals
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Goals</h3>
            <p className="text-muted-foreground text-center">
              Create some goals to start tracking your progress with AI insights.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress Analysis</TabsTrigger>
            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{goals.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {goals.filter(g => g.priority >= 4).length} high priority
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {trackingData
                      ? Math.round(trackingData.progress.reduce((sum, p) => sum + p.currentProgress, 0) / trackingData.progress.length)
                      : '--'
                    }%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all active goals
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">On Track</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {trackingData
                      ? trackingData.progress.filter(p => p.completionProbability > 0.7).length
                      : '--'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Goals likely to succeed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">At Risk</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {trackingData
                      ? trackingData.progress.filter(p => p.completionProbability < 0.3).length
                      : '--'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Goals needing attention
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Goal Overview</CardTitle>
                  <CardDescription>Current status of all active goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {goals.map((goal) => {
                      const progressData = trackingData?.progress.find(p => p.goalId === goal.id);
                      return (
                        <div key={goal.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{goal.title}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">
                                  Priority {goal.priority}
                                </Badge>
                                {goal.target_date && (
                                  <Badge variant="outline" className="gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(goal.target_date), 'MMM dd')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Progress value={progressData?.currentProgress || 0} className="mb-2" />
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>{Math.round(progressData?.currentProgress || 0)}% complete</span>
                              {progressData && (
                                <div className="flex items-center space-x-2">
                                  {getProgressIcon(progressData.completionProbability)}
                                  <span className={getProgressColor(progressData.completionProbability)}>
                                    {Math.round(progressData.completionProbability * 100)}% likely to succeed
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            {trackingData?.progress.map((progress) => {
              const goal = goals.find(g => g.id === progress.goalId);
              if (!goal) return null;

              return (
                <Card key={progress.goalId}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {goal.title}
                      <div className="flex items-center space-x-2">
                        {getProgressIcon(progress.completionProbability)}
                        <span className={`text-sm ${getProgressColor(progress.completionProbability)}`}>
                          {Math.round(progress.completionProbability * 100)}% success probability
                        </span>
                      </div>
                    </CardTitle>
                    <CardDescription>{goal.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Current Progress</div>
                        <div className="text-2xl font-bold">{Math.round(progress.currentProgress)}%</div>
                        <Progress value={progress.currentProgress} className="mt-2" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Daily Velocity</div>
                        <div className="text-2xl font-bold">{progress.progressVelocity.toFixed(2)}%</div>
                        <div className="text-xs text-muted-foreground">per day</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Time Remaining</div>
                        <div className="text-2xl font-bold">
                          {progress.timeRemaining === Infinity ? '∞' : progress.timeRemaining}
                        </div>
                        <div className="text-xs text-muted-foreground">days</div>
                      </div>
                    </div>

                    {(progress.blockers.length > 0 || progress.accelerators.length > 0) && (
                      <div className="grid gap-4 md:grid-cols-2">
                        {progress.blockers.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Blockers
                            </h4>
                            <ul className="space-y-1">
                              {progress.blockers.map((blocker, index) => (
                                <li key={index} className="text-sm text-muted-foreground">
                                  • {blocker}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {progress.accelerators.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Accelerators
                            </h4>
                            <ul className="space-y-1">
                              {progress.accelerators.map((accelerator, index) => (
                                <li key={index} className="text-sm text-muted-foreground">
                                  • {accelerator}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            {trackingData?.suggestions && trackingData.suggestions.length > 0 ? (
              <div className="space-y-4">
                {trackingData.suggestions.map((suggestion, index) => {
                  const goal = goals.find(g => g.id === suggestion.goalId);
                  return (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getSuggestionIcon(suggestion.type)}
                            {suggestion.title}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(suggestion.priority)}>
                              {suggestion.priority}
                            </Badge>
                            <Badge variant="outline">
                              {Math.round(suggestion.confidence * 100)}% confident
                            </Badge>
                          </div>
                        </CardTitle>
                        <CardDescription>
                          For goal: {goal?.title} • {suggestion.type} suggestion
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm">{suggestion.description}</p>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-semibold mb-2">Why this helps:</h4>
                            <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Expected Impact:</h4>
                            <p className="text-sm text-muted-foreground">{suggestion.expectedImpact}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Implementation Steps:</h4>
                          <ol className="list-decimal list-inside space-y-1">
                            {suggestion.implementationSteps.map((step, stepIndex) => (
                              <li key={stepIndex} className="text-sm text-muted-foreground">
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge variant="outline">Effort: {suggestion.effort}</Badge>
                          <Badge variant="outline">Type: {suggestion.type}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Suggestions Yet</h3>
                  <p className="text-muted-foreground text-center">
                    Run goal analysis to get AI-powered suggestions for improving your progress.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {trackingData?.insights && trackingData.insights.length > 0 ? (
              <div className="space-y-4">
                {trackingData.insights.map((insight, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{insight.title}</CardTitle>
                      <CardDescription>Portfolio-level insight</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{insight.description}</p>
                      {insight.recommendations && (
                        <div>
                          <h4 className="font-semibold mb-2">Recommendations:</h4>
                          <ul className="space-y-1">
                            {insight.recommendations.map((rec: string, recIndex: number) => (
                              <li key={recIndex} className="text-sm text-muted-foreground">
                                • {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
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
                    Run goal analysis to generate strategic insights about your goal portfolio.
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