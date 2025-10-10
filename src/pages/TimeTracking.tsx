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
  Timer,
  Play,
  Pause,
  Square,
  BarChart3,
  Calendar,
  Clock,
  TrendingUp,
  Target,
  Settings,
  Download,
  Brain,
  Zap,
} from "lucide-react";

interface TimeEntry {
  id: string;
  project: string;
  task: string;
  duration: number; // in minutes
  date: string;
  category: "development" | "meetings" | "planning" | "review";
  billable: boolean;
}

const timeEntries: TimeEntry[] = [
  {
    id: "1",
    project: "BeProductive v2",
    task: "Navigation component development",
    duration: 120,
    date: "2024-10-10",
    category: "development",
    billable: true,
  },
  {
    id: "2",
    project: "BeProductive v2",
    task: "Team standup meeting",
    duration: 30,
    date: "2024-10-10",
    category: "meetings",
    billable: false,
  },
  {
    id: "3",
    project: "BeProductive v2",
    task: "Sprint planning",
    duration: 90,
    date: "2024-10-09",
    category: "planning",
    billable: true,
  },
  {
    id: "4",
    project: "BeProductive v2",
    task: "Code review",
    duration: 45,
    date: "2024-10-09",
    category: "review",
    billable: true,
  },
];

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "development":
      return "bg-blue-100 text-blue-800";
    case "meetings":
      return "bg-purple-100 text-purple-800";
    case "planning":
      return "bg-green-100 text-green-800";
    case "review":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function TimeTracking() {
  const [activeTab, setActiveTab] = useState("tracker");
  const [isTracking, setIsTracking] = useState(false);
  const [currentTask, setCurrentTask] = useState("Feature development");
  const [elapsedTime, setElapsedTime] = useState(0);

  const totalMinutes = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const billableMinutes = timeEntries
    .filter((entry) => entry.billable)
    .reduce((sum, entry) => sum + entry.duration, 0);

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
          <p className="text-muted-foreground">
            AI-powered time insights and productivity analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Time Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Today's Total
              </p>
              <p className="text-2xl font-bold">{formatDuration(285)}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Billable Hours
              </p>
              <p className="text-2xl font-bold">{formatDuration(billableMinutes)}</p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                This Week
              </p>
              <p className="text-2xl font-bold">{formatDuration(1260)}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Productivity Score
              </p>
              <p className="text-2xl font-bold">89%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </CardContent>
        </Card>
      </div>

      {/* Active Timer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Active Timer
          </CardTitle>
          <CardDescription>
            Track time for your current task
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-3xl font-mono font-bold mb-2">
                {formatDuration(elapsedTime)}
              </div>
              <div className="text-muted-foreground">
                Working on: {currentTask}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isTracking ? "destructive" : "default"}
                size="lg"
                onClick={toggleTracking}
              >
                {isTracking ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button variant="outline" size="lg">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tracker">Time Tracker</TabsTrigger>
          <TabsTrigger value="entries">Time Entries</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Time Entry</CardTitle>
              <CardDescription>
                Manually log time for completed tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Smart Time Tracking</h3>
                  <p className="text-muted-foreground">
                    Use the timer above or manually log time entries for your tasks
                  </p>
                  <Button className="mt-4">
                    <Play className="h-4 w-4 mr-2" />
                    Add Manual Entry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries" className="space-y-4">
          <div className="grid gap-4">
            {timeEntries.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{entry.task}</h3>
                        <Badge className={getCategoryColor(entry.category)}>
                          {entry.category}
                        </Badge>
                        {entry.billable && (
                          <Badge variant="secondary">Billable</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.project} • {entry.date}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {formatDuration(entry.duration)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Analytics</CardTitle>
              <CardDescription>
                Detailed insights into your time usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Time Analytics Dashboard</h3>
                  <p className="text-muted-foreground">
                    View charts, trends, and detailed breakdowns of your time usage
                  </p>
                  <Button className="mt-4">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Detailed Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>
                Smart recommendations to optimize your time and productivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Smart Time Insights</h3>
                  <p className="text-muted-foreground">
                    Get AI-powered recommendations on time allocation, productivity patterns, and optimization opportunities
                  </p>
                  <Button className="mt-4">
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Insights
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}