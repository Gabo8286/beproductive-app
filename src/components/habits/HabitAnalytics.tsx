import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHabitAnalytics, useHabitTrends } from "@/hooks/useHabitAnalytics";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

interface HabitAnalyticsProps {
  habitId: string;
}

export function HabitAnalytics({ habitId }: HabitAnalyticsProps) {
  const { data: analytics } = useHabitAnalytics(habitId, "week");
  const { data: trends } = useHabitTrends(habitId, 30);

  const chartData =
    trends?.map((t) => ({
      date: format(new Date(t.date), "MMM dd"),
      rate: t.completion_rate,
    })) || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Completion Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {analytics?.completion_rate.toFixed(0)}%
            </div>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {analytics?.total_completions}
            </div>
            <p className="text-sm text-muted-foreground">Total Completions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{analytics?.total_misses}</div>
            <p className="text-sm text-muted-foreground">Missed Days</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
