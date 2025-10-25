import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw,
  Brain,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePromptAnalytics, useUsageTrends, useIntentAccuracy } from '@/hooks/usePromptAnalytics';

interface PromptAnalyticsDashboardProps {
  className?: string;
  onClose?: () => void;
}

export const PromptAnalyticsDashboard: React.FC<PromptAnalyticsDashboardProps> = ({
  className,
  onClose
}) => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [activeTab, setActiveTab] = useState('overview');

  const {
    dashboardData,
    isLoading,
    refreshDashboardData,
    exportAnalytics
  } = usePromptAnalytics();

  const { trends, refreshTrends } = useUsageTrends(timeframe);
  const { accuracy, refreshAccuracy } = useIntentAccuracy();

  useEffect(() => {
    refreshDashboardData();
  }, [refreshDashboardData]);

  const handleExportData = () => {
    try {
      const data = exportAnalytics();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompt-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  const handleRefresh = () => {
    refreshDashboardData();
    refreshTrends();
    refreshAccuracy();
  };

  if (isLoading || !dashboardData) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const { overview, performance, insights } = dashboardData;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Prompt Analytics</h2>
            <p className="text-sm text-muted-foreground">
              Performance insights and usage statistics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalPrompts}</div>
            <p className="text-xs text-muted-foreground">
              Available templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalUsage}</div>
            <p className="text-xs text-muted-foreground">
              Prompt executions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(overview.averageSuccessRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average across all prompts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intent Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accuracy.length > 0
                ? (accuracy.reduce((sum, acc) => sum + acc.accuracy, 0) / accuracy.length * 100).toFixed(1)
                : '0.0'
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              Recognition accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="accuracy">Intent Accuracy</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Prompts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Performing Prompts</CardTitle>
                <CardDescription>
                  Most popular and successful prompt templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {overview.topPerformingPrompts.map((prompt, index) => (
                      <div key={prompt.promptId} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{prompt.promptId}</p>
                            <p className="text-xs text-muted-foreground">
                              {prompt.totalUsage} uses • {(prompt.successRate * 100).toFixed(1)}% success
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {prompt.popularityScore.toFixed(2)}
                          </Badge>
                          <Star className="h-4 w-4 text-yellow-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <CardDescription>
                  Latest prompt usage events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {overview.recentActivity.map((event) => (
                      <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full text-xs",
                          event.outcome === 'successful'
                            ? "bg-green-100 text-green-600"
                            : event.outcome === 'failed'
                            ? "bg-red-100 text-red-600"
                            : "bg-gray-100 text-gray-600"
                        )}>
                          {event.outcome === 'successful' && <CheckCircle className="h-4 w-4" />}
                          {event.outcome === 'failed' && <AlertTriangle className="h-4 w-4" />}
                          {!event.outcome && <Clock className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.promptId}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {event.userInput}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {(event.confidence * 100).toFixed(0)}% confidence
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Usage Trends</CardTitle>
                <CardDescription>
                  Prompt usage over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {(['day', 'week', 'month'] as const).map((period) => (
                      <Button
                        key={period}
                        variant={timeframe === period ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeframe(period)}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </Button>
                    ))}
                  </div>

                  <div className="h-[200px] flex items-end justify-between gap-2">
                    {trends.map((trend, index) => (
                      <div key={trend.date} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-primary/20 rounded-t"
                          style={{
                            height: `${Math.max((trend.usage / Math.max(...trends.map(t => t.usage))) * 160, 4)}px`
                          }}
                        />
                        <div
                          className="w-full bg-primary rounded-b"
                          style={{
                            height: `${Math.max((trend.success / Math.max(...trends.map(t => t.success))) * 160, 2)}px`
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-2 transform -rotate-45 origin-left">
                          {new Date(trend.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded" />
                      <span>Successful</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary/20 rounded" />
                      <span>Total Usage</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Breakdown</CardTitle>
                <CardDescription>
                  Detailed metrics by prompt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {performance.promptMetrics.slice(0, 10).map((metric) => (
                      <div key={metric.promptId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{metric.promptId}</p>
                          <Badge variant="outline" className="text-xs">
                            {metric.totalUsage} uses
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Success Rate</span>
                            <span>{(metric.successRate * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={metric.successRate * 100} className="h-2" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Avg Confidence</span>
                            <span>{(metric.averageConfidence * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={metric.averageConfidence * 100} className="h-2" />
                        </div>

                        {metric.userSatisfaction.helpful + metric.userSatisfaction.notHelpful > 0 && (
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3 text-green-600" />
                              <span>{metric.userSatisfaction.helpful}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsDown className="h-3 w-3 text-red-600" />
                              <span>{metric.userSatisfaction.notHelpful}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Intent Accuracy Tab */}
        <TabsContent value="accuracy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Intent Recognition Accuracy</CardTitle>
              <CardDescription>
                Performance by category and common misclassifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {accuracy.map((acc) => (
                  <div key={acc.category} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium capitalize">
                        {acc.category.replace('_', ' ')} Category
                      </h4>
                      <Badge variant={acc.accuracy > 0.8 ? "default" : acc.accuracy > 0.6 ? "secondary" : "destructive"}>
                        {(acc.accuracy * 100).toFixed(1)}% accurate
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Predictions</p>
                        <p className="font-medium">{acc.totalPredictions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Correct</p>
                        <p className="font-medium text-green-600">{acc.correctPredictions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Confidence</p>
                        <p className="font-medium">{(acc.averageConfidence * 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    <Progress value={acc.accuracy * 100} className="h-2" />

                    {acc.commonMisclassifications.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Common Misclassifications:</p>
                        <div className="space-y-1">
                          {acc.commonMisclassifications.slice(0, 3).map((misc, index) => (
                            <div key={index} className="text-xs p-2 bg-muted rounded">
                              <span className="text-red-600">{misc.predicted}</span>
                              {' → '}
                              <span className="text-green-600">{misc.actual}</span>
                              <span className="text-muted-foreground ml-2">({misc.count} times)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommendations</CardTitle>
                <CardDescription>
                  AI-powered suggestions for improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {insights.recommendations.map((rec, index) => (
                      <div key={index} className="p-3 rounded-lg border">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium",
                            rec.priority === 'high'
                              ? "bg-red-100 text-red-600"
                              : rec.priority === 'medium'
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-blue-100 text-blue-600"
                          )}>
                            {rec.priority === 'high' && <AlertTriangle className="h-4 w-4" />}
                            {rec.priority === 'medium' && <Clock className="h-4 w-4" />}
                            {rec.priority === 'low' && <TrendingUp className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{rec.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{rec.impact}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {rec.type.replace('_', ' ')}
                              </Badge>
                              <Badge
                                variant={rec.priority === 'high' ? "destructive" : rec.priority === 'medium' ? "default" : "secondary"}
                                className="text-xs capitalize"
                              >
                                {rec.priority} priority
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Usage Patterns</CardTitle>
                <CardDescription>
                  Discovered behavioral insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.patterns.map((pattern, index) => (
                    <div key={index} className="p-3 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{pattern.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {pattern.type.replace('_', ' ')}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Target className="h-3 w-3" />
                              {(pattern.confidence * 100).toFixed(0)}% confidence
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};