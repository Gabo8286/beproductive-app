import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHabitAnalytics, useHabitTrends } from "@/hooks/useHabitAnalytics";
import { useHabitEntries } from "@/hooks/useHabitEntries";
import { Lightbulb, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { format, subDays, getDay } from "date-fns";

interface HabitInsightsEngineProps {
  habitId: string;
}

interface Insight {
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function HabitInsightsEngine({ habitId }: HabitInsightsEngineProps) {
  const { data: weekAnalytics } = useHabitAnalytics(habitId, 'week');
  const { data: monthAnalytics } = useHabitAnalytics(habitId, 'month');
  const { data: trends30 } = useHabitTrends(habitId, 30);
  const { data: allEntries } = useHabitEntries(habitId);

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];

    // High completion rate insight
    if (weekAnalytics && weekAnalytics.completion_rate >= 80) {
      insights.push({
        type: 'success',
        title: 'Excellent Consistency!',
        description: `You've maintained an ${weekAnalytics.completion_rate.toFixed(0)}% completion rate this week. Keep up the great work!`,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });
    }

    // Declining trend warning
    if (trends30 && trends30.length >= 7) {
      const recentWeek = trends30.slice(-7);
      const previousWeek = trends30.slice(-14, -7);
      const recentRate = recentWeek.reduce((sum, t) => sum + t.completion_rate, 0) / recentWeek.length;
      const previousRate = previousWeek.reduce((sum, t) => sum + t.completion_rate, 0) / previousWeek.length;

      if (recentRate < previousRate - 20) {
        insights.push({
          type: 'warning',
          title: 'Declining Consistency',
          description: `Your completion rate has dropped ${(previousRate - recentRate).toFixed(0)}% this week. Consider reviewing what changed.`,
          icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
        });
      }
    }

    // Best day pattern
    if (allEntries && allEntries.length >= 14) {
      const dayStats: Record<number, { completed: number; total: number }> = {};
      allEntries.forEach(entry => {
        const day = getDay(new Date(entry.date));
        if (!dayStats[day]) dayStats[day] = { completed: 0, total: 0 };
        dayStats[day].total++;
        if (entry.status === 'completed') dayStats[day].completed++;
      });

      const bestDay = Object.entries(dayStats)
        .map(([day, stats]) => ({
          day: parseInt(day),
          rate: (stats.completed / stats.total) * 100,
        }))
        .sort((a, b) => b.rate - a.rate)[0];

      if (bestDay && bestDay.rate > 70) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        insights.push({
          type: 'info',
          title: 'Best Performing Day',
          description: `${dayNames[bestDay.day]} is your most consistent day with a ${bestDay.rate.toFixed(0)}% completion rate!`,
          icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
        });
      }
    }

    // Mood correlation
    if (monthAnalytics && monthAnalytics.average_mood && monthAnalytics.average_mood >= 4) {
      insights.push({
        type: 'success',
        title: 'Positive Mood Impact',
        description: `This habit correlates with high mood levels (avg ${monthAnalytics.average_mood.toFixed(1)}/5). It's benefiting your wellbeing!`,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });
    }

    // Time optimization tip
    if (allEntries && allEntries.some(e => e.duration_minutes)) {
      const avgDuration = allEntries
        .filter(e => e.duration_minutes)
        .reduce((sum, e) => sum + (e.duration_minutes || 0), 0) / 
        allEntries.filter(e => e.duration_minutes).length;

      if (avgDuration > 0) {
        insights.push({
          type: 'tip',
          title: 'Time Investment',
          description: `You typically spend ${Math.round(avgDuration)} minutes on this habit. Consider optimizing if needed.`,
          icon: <Clock className="h-5 w-5 text-purple-500" />,
        });
      }
    }

    // Consistency streak tip
    if (weekAnalytics && weekAnalytics.total_completions < 3) {
      insights.push({
        type: 'tip',
        title: 'Build Momentum',
        description: 'Try to complete this habit at least 3 times this week to build consistency.',
        icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
      });
    }

    return insights;
  };

  const insights = generateInsights();

  if (insights.length === 0) {
    return null;
  }

  const getTypeStyles = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-500/50 bg-green-50 dark:bg-green-950';
      case 'warning':
        return 'border-orange-500/50 bg-orange-50 dark:bg-orange-950';
      case 'info':
        return 'border-blue-500/50 bg-blue-50 dark:bg-blue-950';
      case 'tip':
        return 'border-purple-500/50 bg-purple-50 dark:bg-purple-950';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Insights & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getTypeStyles(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                {insight.icon}
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {insight.type}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
