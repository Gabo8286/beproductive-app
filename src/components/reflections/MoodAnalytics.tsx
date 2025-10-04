import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useReflectionTrends } from "@/hooks/useReflectionAnalytics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays } from "date-fns";

interface MoodAnalyticsProps {
  workspaceId: string;
  detailed?: boolean;
}

const MOOD_COLORS = {
  amazing: "hsl(142, 76%, 36%)",
  great: "hsl(142, 71%, 45%)",
  good: "hsl(47, 96%, 53%)",
  neutral: "hsl(215, 16%, 47%)",
  bad: "hsl(25, 95%, 53%)",
  terrible: "hsl(0, 84%, 60%)",
};

export default function MoodAnalytics({
  workspaceId,
  detailed = false,
}: MoodAnalyticsProps) {
  const endDate = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const startDate = useMemo(
    () => format(subDays(new Date(), 30), "yyyy-MM-dd"),
    [],
  );

  const { data: trends, isLoading } = useReflectionTrends(
    workspaceId,
    startDate,
    endDate,
  );

  const moodData = useMemo(() => {
    if (!trends) return [];
    return trends.map((trend) => ({
      date: format(new Date(trend.date), "MMM dd"),
      mood: trend.mood || 0,
      energy: trend.energy || 0,
      stress: trend.stress || 0,
    }));
  }, [trends]);

  const averageMood = useMemo(() => {
    if (!trends || trends.length === 0) return 0;
    const sum = trends.reduce((acc, t) => acc + (t.mood || 0), 0);
    return (sum / trends.length).toFixed(1);
  }, [trends]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-[300px] w-full" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Mood Trends</h3>
            <p className="text-sm text-muted-foreground">
              Your emotional patterns over time
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{averageMood}</p>
            <p className="text-xs text-muted-foreground">Avg Mood (30d)</p>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                domain={[0, 6]}
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
              {detailed && (
                <>
                  <Line
                    type="monotone"
                    dataKey="energy"
                    stroke="hsl(142, 76%, 36%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(142, 76%, 36%)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="stress"
                    stroke="hsl(0, 84%, 60%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(0, 84%, 60%)" }}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {detailed && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Mood Variance</p>
              <p className="text-xl font-semibold">Low</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Best Day</p>
              <p className="text-xl font-semibold">Monday</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Improvement</p>
              <p className="text-xl font-semibold text-green-600">+12%</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
