import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useHabitAnalytics } from "@/hooks/useHabitAnalytics";
import { useHabitEntries } from "@/hooks/useHabitEntries";
import { Target, TrendingUp, Zap, Award } from "lucide-react";
import {
  calculateConsistencyScore,
  calculateMomentum,
} from "@/utils/habitAnalytics";
import { subDays, format } from "date-fns";

interface HabitPerformanceMetricsProps {
  habitId: string;
}

export function HabitPerformanceMetrics({
  habitId,
}: HabitPerformanceMetricsProps) {
  const { data: monthAnalytics } = useHabitAnalytics(habitId, "month");
  const { data: entries } = useHabitEntries(habitId);

  const last30Days =
    entries?.filter((e) => {
      const entryDate = new Date(e.date);
      return entryDate >= subDays(new Date(), 30);
    }) || [];

  const consistencyScore = calculateConsistencyScore(last30Days, 30);
  const momentum = calculateMomentum(last30Days, 7);

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-500" };
    if (score >= 60) return { label: "Good", color: "text-blue-500" };
    if (score >= 40) return { label: "Fair", color: "text-yellow-500" };
    return { label: "Needs Improvement", color: "text-red-500" };
  };

  const consistencyLevel = getScoreLevel(consistencyScore);
  const momentumLevel = getScoreLevel(momentum);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Consistency Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            Consistency Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">
                {consistencyScore.toFixed(0)}
              </span>
              <Badge className={consistencyLevel.color}>
                {consistencyLevel.label}
              </Badge>
            </div>
            <Progress value={consistencyScore} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Based on completion rate and streak stability
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Momentum */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4" />
            Current Momentum
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{momentum.toFixed(0)}</span>
              <Badge className={momentumLevel.color}>
                {momentumLevel.label}
              </Badge>
            </div>
            <Progress value={momentum} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Recent performance trend over last 7 days
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Average Mood */}
      {monthAnalytics?.average_mood && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Mood Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">
                  {monthAnalytics.average_mood.toFixed(1)}
                </span>
                <Badge variant="secondary">out of 5.0</Badge>
              </div>
              <Progress
                value={(monthAnalytics.average_mood / 5) * 100}
                className="h-2"
              />
              <p className="text-sm text-muted-foreground">
                Average mood after completing this habit
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Energy Level */}
      {monthAnalytics?.average_energy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-4 w-4" />
              Energy Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">
                  {monthAnalytics.average_energy.toFixed(1)}
                </span>
                <Badge variant="secondary">out of 10</Badge>
              </div>
              <Progress
                value={(monthAnalytics.average_energy / 10) * 100}
                className="h-2"
              />
              <p className="text-sm text-muted-foreground">
                Average energy level when completing
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
