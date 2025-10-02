import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHabitTrends } from "@/hooks/useHabitAnalytics";
import { Line, LineChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { format } from "date-fns";
import { TrendingUp, Calendar, Clock } from "lucide-react";

interface CompletionTrendsProps {
  habitId: string;
}

export function CompletionTrends({ habitId }: CompletionTrendsProps) {
  const { data: trends7 } = useHabitTrends(habitId, 7);
  const { data: trends30 } = useHabitTrends(habitId, 30);
  const { data: trends90 } = useHabitTrends(habitId, 90);

  const formatChartData = (data: any[] | undefined) => {
    return data?.map(t => ({
      date: format(new Date(t.date), 'MMM dd'),
      fullDate: t.date,
      rate: t.completion_rate,
      streak: t.streak,
      mood: t.mood,
    })) || [];
  };

  const weekData = formatChartData(trends7);
  const monthData = formatChartData(trends30);
  const quarterData = formatChartData(trends90);

  // Calculate day of week patterns
  const dayOfWeekData = trends30?.reduce((acc, t) => {
    const day = new Date(t.date).getDay();
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day];
    
    if (!acc[dayName]) {
      acc[dayName] = { day: dayName, completions: 0, total: 0 };
    }
    
    acc[dayName].total++;
    if (t.completions > 0) acc[dayName].completions++;
    
    return acc;
  }, {} as Record<string, { day: string; completions: number; total: number }>) || {};

  const dayPatternData = Object.values(dayOfWeekData).map(d => ({
    day: d.day,
    rate: d.total > 0 ? (d.completions / d.total) * 100 : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Completion Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="week" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="week">7 Days</TabsTrigger>
            <TabsTrigger value="month">30 Days</TabsTrigger>
            <TabsTrigger value="quarter">90 Days</TabsTrigger>
            <TabsTrigger value="pattern">Patterns</TabsTrigger>
          </TabsList>

          <TabsContent value="week">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-4">Weekly Overview</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weekData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="month">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-4">Monthly Trend</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      name="Completion Rate"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="streak"
                      name="Streak"
                      stroke="hsl(var(--destructive))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quarter">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-4">Quarterly Analysis</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={quarterData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pattern">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Day of Week Patterns
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dayPatternData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="rate"
                      fill="hsl(var(--primary))"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground mt-2">
                  Shows which days you're most consistent
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
