import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MilestoneAnalytics as MilestoneAnalyticsType } from "@/hooks/useGoalMilestones";
import { GoalMilestone } from "@/types/goals";
import {
  BarChart,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface MilestoneAnalyticsProps {
  analytics: MilestoneAnalyticsType | undefined;
  milestones: GoalMilestone[];
}

export function MilestoneAnalytics({
  analytics,
  milestones,
}: MilestoneAnalyticsProps) {
  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">
                  {analytics.totalMilestones}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total Milestones
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {analytics.completedMilestones}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold">
                  {analytics.overdueMilestones}
                </div>
                <div className="text-xs text-muted-foreground">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">
                  {analytics.upcomingMilestones}
                </div>
                <div className="text-xs text-muted-foreground">
                  Due This Week
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Milestone Performance</CardTitle>
          <CardDescription>
            Insights into milestone completion and progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Completion Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Completion Rate</span>
              <span className="text-muted-foreground">
                {analytics.completionRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={analytics.completionRate} className="h-2" />
          </div>

          {/* Velocity */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">Weekly Velocity</div>
                <div className="text-xs text-muted-foreground">
                  Milestones completed per week
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold">
              {analytics.milestoneVelocity.toFixed(1)}
            </div>
          </div>

          {/* Average Completion Time */}
          {analytics.averageCompletionTime > 0 && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="text-sm font-medium">
                    Average Completion Time
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Days from creation to completion
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {Math.round(analytics.averageCompletionTime)}d
              </div>
            </div>
          )}

          {/* Progress Summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-500">
                {analytics.completedMilestones}
              </div>
              <div className="text-xs text-muted-foreground">Done</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {analytics.totalMilestones -
                  analytics.completedMilestones -
                  analytics.overdueMilestones}
              </div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">
                {analytics.overdueMilestones}
              </div>
              <div className="text-xs text-muted-foreground">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
