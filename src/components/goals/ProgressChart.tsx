import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Goal } from "@/types/goals";
import { ProgressEntry } from "@/hooks/useGoalProgress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";
import { format, parseISO, startOfDay, eachDayOfInterval } from "date-fns";

interface ProgressChartProps {
  goal: Goal;
  progressHistory: ProgressEntry[];
}

export function ProgressChart({ goal, progressHistory }: ProgressChartProps) {
  const chartData = useMemo(() => {
    if (!progressHistory.length) return [];

    const dataPoints = progressHistory
      .map((entry) => ({
        date: startOfDay(parseISO(entry.created_at)),
        progress: entry.new_progress,
        change: entry.new_progress - entry.previous_progress,
        type: entry.change_type,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (dataPoints.length > 0) {
      const startDate = dataPoints[0].date;
      const endDate = new Date();
      const allDays = eachDayOfInterval({ start: startDate, end: endDate });

      let lastProgress = 0;
      const completeData = allDays.map((day) => {
        const dayData = dataPoints.find(
          (point) => point.date.getTime() === startOfDay(day).getTime(),
        );

        if (dayData) {
          lastProgress = dayData.progress;
          return {
            date: format(day, "MMM d"),
            fullDate: day,
            progress: dayData.progress,
            change: dayData.change,
            type: dayData.type,
          };
        }

        return {
          date: format(day, "MMM d"),
          fullDate: day,
          progress: lastProgress,
          change: 0,
          type: "none",
        };
      });

      return completeData;
    }

    return [];
  }, [progressHistory]);

  const getChangeColor = (change: number) => {
    if (change > 0) return "#10b981";
    if (change < 0) return "#ef4444";
    return "#6b7280";
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            Progress: <span className="font-medium">{data.progress}%</span>
          </p>
          {data.change !== 0 && (
            <p className="text-sm">
              Change:{" "}
              <span
                className="font-medium"
                style={{ color: getChangeColor(data.change) }}
              >
                {data.change > 0 ? "+" : ""}
                {data.change.toFixed(1)}%
              </span>
            </p>
          )}
          {data.type !== "none" && (
            <p className="text-xs text-muted-foreground capitalize">
              {data.type.replace("_", " ")}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Timeline</CardTitle>
        <CardDescription>
          Visual representation of your goal progress over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="progress"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="progress"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>No progress data available yet</p>
              <p className="text-sm">
                Progress will appear here as you update your goal
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
