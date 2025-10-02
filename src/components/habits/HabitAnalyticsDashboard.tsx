import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHabitAnalytics, useHabitTrends } from "@/hooks/useHabitAnalytics";
import { TrendingUp, Target, Zap, Award } from "lucide-react";
import { Line, LineChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart } from "recharts";
import { format, subDays } from "date-fns";

interface HabitAnalyticsDashboardProps {
  habitId: string;
}

export function HabitAnalyticsDashboard({ habitId }: HabitAnalyticsDashboardProps) {
  const { data: weekAnalytics } = useHabitAnalytics(habitId, 'week');
  const { data: monthAnalytics } = useHabitAnalytics(habitId, 'month');
  const { data: trends30 } = useHabitTrends(habitId, 30);
  const { data: trends90 } = useHabitTrends(habitId, 90);

  const trendChartData = trends30?.map(t => ({
    date: format(new Date(t.date), 'MMM dd'),
    rate: t.completion_rate,
    streak: t.streak,
  })) || [];

  const weeklyData = trends30?.reduce((acc, t) => {
    const week = Math.floor((new Date().getTime() - new Date(t.date).getTime()) / (7 * 24 * 60 * 60 * 1000));
    const weekKey = `Week ${Math.max(0, 4 - week)}`;
    if (!acc[weekKey]) {
      acc[weekKey] = { week: weekKey, completions: 0, total: 0 };
    }
    acc[weekKey].total++;
    if (t.completions > 0) acc[weekKey].completions++;
    return acc;
  }, {} as Record<string, { week: string; completions: number; total: number }>) || {};

  const weeklyChartData = Object.values(weeklyData).map(d => ({
    week: d.week,
    rate: d.total > 0 ? (d.completions / d.total) * 100 : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">This Week</span>
            </div>
            <div className="text-2xl font-bold">
              {weekAnalytics?.completion_rate.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {weekAnalytics?.total_completions} completions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">This Month</span>
            </div>
            <div className="text-2xl font-bold">
              {monthAnalytics?.completion_rate.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {monthAnalytics?.total_completions} completions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Mood</span>
            </div>
            <div className="text-2xl font-bold">
              {monthAnalytics?.average_mood?.toFixed(1) || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              out of 5.0
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Consistency</span>
            </div>
            <div className="text-2xl font-bold">
              {weekAnalytics?.total_completions && weekAnalytics.total_completions >= 5 ? "High" : "Medium"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {weekAnalytics?.total_misses || 0} misses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trend" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trend">Trend Analysis</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Performance</TabsTrigger>
          <TabsTrigger value="cumulative">Cumulative Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="trend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>30-Day Completion Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendChartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyChartData}>
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="rate"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cumulative" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cumulative Completions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={trendChartData.map((d, i, arr) => ({
                    ...d,
                    cumulative: arr.slice(0, i + 1).reduce((sum, item) => sum + (item.rate > 0 ? 1 : 0), 0),
                  }))}
                >
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
