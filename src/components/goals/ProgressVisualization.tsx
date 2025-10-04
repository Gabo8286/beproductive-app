import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Goal } from "@/types/goals";
import {
  useGoalProgressHistory,
  useGoalProgressAnalytics,
  useProgressSuggestions,
} from "@/hooks/useGoalProgress";
import { ProgressChart } from "./ProgressChart";
import { ProgressSuggestions } from "./ProgressSuggestions";
import { ProgressHistory } from "./ProgressHistory";
import { ProgressEditor } from "./ProgressEditor";
import { TrendingUp, TrendingDown, Minus, Target, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface ProgressVisualizationProps {
  goal: Goal;
  showEditor?: boolean;
}

export function ProgressVisualization({
  goal,
  showEditor = true,
}: ProgressVisualizationProps) {
  const { data: progressHistory } = useGoalProgressHistory(goal.id);
  const { data: analytics } = useGoalProgressAnalytics(goal.id);
  const { data: suggestions } = useProgressSuggestions(goal.id);
  const [showProgressEditor, setShowProgressEditor] = useState(false);

  const getProgressColor = () => {
    const progress = goal.progress || 0;
    if (progress >= 100) return "text-green-500";
    if (progress >= 75) return "text-blue-500";
    if (progress >= 50) return "text-yellow-500";
    if (progress >= 25) return "text-orange-500";
    return "text-red-500";
  };

  const getTrendIcon = () => {
    if (!analytics) return <Minus className="h-4 w-4" />;
    switch (analytics.progressTrend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getVelocityColor = (velocity: number) => {
    if (velocity > 5) return "text-green-500";
    if (velocity > 2) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Progress Overview</CardTitle>
            {showEditor && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProgressEditor(true)}
              >
                Update Progress
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className={`text-4xl font-bold ${getProgressColor()}`}>
              {Math.round(goal.progress || 0)}%
            </div>
            <Progress value={goal.progress || 0} className="h-4" />
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              {getTrendIcon()}
              <span>
                {analytics?.progressTrend === "increasing" && "Trending up"}
                {analytics?.progressTrend === "decreasing" && "Trending down"}
                {analytics?.progressTrend === "stable" && "Stable progress"}
              </span>
            </div>
          </div>

          {analytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div
                  className={`text-lg font-semibold ${getVelocityColor(analytics.weeklyVelocity)}`}
                >
                  {analytics.weeklyVelocity.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Weekly Velocity
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-500">
                  {analytics.milestoneCompletion.toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">Milestones</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-500">
                  {analytics.subGoalCompletion.toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">Sub-Goals</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-500">
                  {analytics.confidenceScore}%
                </div>
                <div className="text-xs text-muted-foreground">Confidence</div>
              </div>
            </div>
          )}

          {goal.target_value && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target Progress</span>
                <span className="font-medium">
                  {goal.current_value || 0} / {goal.target_value} {goal.unit}
                </span>
              </div>
              <Progress
                value={
                  goal.target_value > 0
                    ? ((goal.current_value || 0) / goal.target_value) * 100
                    : 0
                }
                className="h-2"
              />
            </div>
          )}

          {analytics && analytics.projectedCompletion && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Projected Completion
                </span>
              </div>
              <div className="text-sm text-right">
                {format(analytics.projectedCompletion, "MMM d, yyyy")}
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(analytics.projectedCompletion)} from now
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="suggestions">
            Suggestions
            {suggestions && suggestions.length > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center"
              >
                {suggestions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <ProgressChart goal={goal} progressHistory={progressHistory || []} />
        </TabsContent>

        <TabsContent value="history">
          <ProgressHistory progressHistory={progressHistory || []} />
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Progress Insights</CardTitle>
              <CardDescription>
                Detailed analytics and trends for your goal progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Velocity Analysis</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Daily Average:</span>
                          <span>
                            {analytics.averageDailyProgress.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Weekly Velocity:</span>
                          <span
                            className={getVelocityColor(
                              analytics.weeklyVelocity,
                            )}
                          >
                            {analytics.weeklyVelocity.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Velocity:</span>
                          <span
                            className={getVelocityColor(
                              analytics.monthlyVelocity,
                            )}
                          >
                            {analytics.monthlyVelocity.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Completion Analysis</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Milestone Progress:</span>
                          <span>
                            {analytics.milestoneCompletion.toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sub-Goal Progress:</span>
                          <span>{analytics.subGoalCompletion.toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence Score:</span>
                          <span>{analytics.confidenceScore}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {analytics.timeToTarget && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-blue-700 dark:text-blue-300">
                          Time to Target
                        </span>
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        At current velocity, you'll reach your target in{" "}
                        {analytics.timeToTarget} days
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">
                    Calculating insights...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions">
          <ProgressSuggestions suggestions={suggestions || []} goal={goal} />
        </TabsContent>
      </Tabs>

      {showProgressEditor && (
        <ProgressEditor
          goal={goal}
          open={showProgressEditor}
          onOpenChange={setShowProgressEditor}
        />
      )}
    </div>
  );
}
