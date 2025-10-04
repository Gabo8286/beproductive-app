import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  CheckCircle,
  Clock,
  Zap,
  Calendar,
  Users,
  Award,
  Eye,
  MoreHorizontal,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useMobile } from "@/hooks/useMobile";
import { TouchOptimizedCard } from "@/components/mobile/TouchOptimizedButton";

// Sample data for mobile analytics
const mobileMetrics = [
  {
    id: "productivity",
    title: "Productivity Score",
    value: 87,
    change: +12,
    icon: Activity,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "goals",
    title: "Goals Completed",
    value: 24,
    change: +8,
    icon: Target,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    id: "tasks",
    title: "Tasks Finished",
    value: 156,
    change: -5,
    icon: CheckCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    id: "time",
    title: "Focus Time",
    value: "4.2h",
    change: +15,
    icon: Clock,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

const weeklyData = [
  { day: "Mon", tasks: 12, goals: 2, time: 6.5 },
  { day: "Tue", tasks: 19, goals: 3, time: 8.2 },
  { day: "Wed", tasks: 8, goals: 1, time: 4.1 },
  { day: "Thu", tasks: 15, goals: 2, time: 7.3 },
  { day: "Fri", tasks: 22, goals: 4, time: 9.1 },
  { day: "Sat", tasks: 6, goals: 1, time: 2.8 },
  { day: "Sun", tasks: 4, goals: 1, time: 1.9 },
];

const categoryData = [
  { name: "Work", value: 45, color: "#3b82f6" },
  { name: "Personal", value: 30, color: "#10b981" },
  { name: "Learning", value: 15, color: "#f59e0b" },
  { name: "Health", value: 10, color: "#ef4444" },
];

export function MobileAnalyticsDashboard() {
  const [selectedMetric, setSelectedMetric] = useState("productivity");
  const [refreshing, setRefreshing] = useState(false);
  const { isMobile, orientation } = useMobile();

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getChartHeight = () => {
    if (!isMobile) return 300;
    return orientation === "landscape" ? 200 : 250;
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Your productivity insights
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-9"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {mobileMetrics.map((metric) => (
          <TouchOptimizedCard
            key={metric.id}
            onPress={() => setSelectedMetric(metric.id)}
            className={`p-4 rounded-lg border transition-all ${
              selectedMetric === metric.id
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:shadow-md"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
                <div className="flex items-center gap-1">
                  {metric.change > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      metric.change > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {metric.change > 0 ? "+" : ""}
                    {metric.change}%
                  </span>
                </div>
              </div>
              <div>
                <div className="text-lg font-bold">{metric.value}</div>
                <div className="text-xs text-muted-foreground">
                  {metric.title}
                </div>
              </div>
            </div>
          </TouchOptimizedCard>
        ))}
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Weekly Overview</CardTitle>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tasks" className="text-xs">
                Tasks
              </TabsTrigger>
              <TabsTrigger value="goals" className="text-xs">
                Goals
              </TabsTrigger>
              <TabsTrigger value="time" className="text-xs">
                Time
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="mt-4">
              <ResponsiveContainer width="100%" height={getChartHeight()}>
                <BarChart data={weeklyData}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="goals" className="mt-4">
              <ResponsiveContainer width="100%" height={getChartHeight()}>
                <LineChart data={weeklyData}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="goals"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="time" className="mt-4">
              <ResponsiveContainer width="100%" height={getChartHeight()}>
                <AreaChart data={weeklyData}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="time"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Task Categories</CardTitle>
          <CardDescription className="text-sm">
            Distribution of your completed tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 pl-4 space-y-2">
              {categoryData.map((category) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {category.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <TouchOptimizedCard
          className="p-4 border rounded-lg hover:shadow-md transition-all"
          onPress={() => {}}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">View Reports</div>
              <div className="text-xs text-muted-foreground">
                Detailed analytics
              </div>
            </div>
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
        </TouchOptimizedCard>

        <TouchOptimizedCard
          className="p-4 border rounded-lg hover:shadow-md transition-all"
          onPress={() => {}}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Export Data</div>
              <div className="text-xs text-muted-foreground">
                Download insights
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-green-600" />
          </div>
        </TouchOptimizedCard>
      </div>

      {/* Recent Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                icon: Award,
                title: "Goal Achiever",
                description: "Completed 5 goals this week",
                color: "text-yellow-600",
              },
              {
                icon: Zap,
                title: "Productivity Boost",
                description: "20% increase in daily tasks",
                color: "text-blue-600",
              },
              {
                icon: Calendar,
                title: "Streak Master",
                description: "7-day completion streak",
                color: "text-green-600",
              },
            ].map((achievement, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <achievement.icon
                    className={`h-4 w-4 ${achievement.color}`}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{achievement.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {achievement.description}
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  New
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
