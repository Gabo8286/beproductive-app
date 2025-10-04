import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Download,
  Filter,
  BarChart3,
  Activity
} from 'lucide-react';
import { useTeamAnalytics, useWorkspaceInsights } from '@/hooks/useTeamAnalytics';
import { useTeamReportExport } from '@/hooks/useTeamReportExport';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TeamAnalyticsDashboardProps {
  workspaceId: string;
  periodDays?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function TeamAnalyticsDashboard({ workspaceId, periodDays = 30 }: TeamAnalyticsDashboardProps) {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [exportSections, setExportSections] = useState({
    overview: true,
    memberPerformance: true,
    goalAnalytics: true,
    taskAnalytics: true,
    productivityTrends: true,
    activityHeatmap: false
  });

  const { analytics, isLoading, error } = useTeamAnalytics(workspaceId, periodDays);
  const { insights, isLoading: insightsLoading } = useWorkspaceInsights(workspaceId);
  const { exportReport } = useTeamReportExport(workspaceId);

  if (isLoading || insightsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <p>Unable to load analytics data</p>
            <p className="text-sm">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleExport = () => {
    exportReport.mutate({
      format: exportFormat,
      sections: exportSections,
      periodDays
    });
    setExportDialogOpen(false);
  };

  const handleSectionToggle = (section: keyof typeof exportSections) => {
    setExportSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInsightColor = (type: 'positive' | 'warning' | 'neutral') => {
    switch (type) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'warning':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Analytics</h2>
          <p className="text-muted-foreground">
            Performance overview for the last {periodDays} days
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Export Team Report</DialogTitle>
                <DialogDescription>
                  Choose the format and sections to include in your team analytics report.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Export Format</Label>
                  <Select value={exportFormat} onValueChange={(value: 'csv' | 'json' | 'pdf') => setExportFormat(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                      <SelectItem value="json">JSON (Data)</SelectItem>
                      <SelectItem value="pdf" disabled>PDF (Coming Soon)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>Include Sections</Label>
                  <div className="space-y-2">
                    {Object.entries(exportSections).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={value}
                          onCheckedChange={() => handleSectionToggle(key as keyof typeof exportSections)}
                        />
                        <Label htmlFor={key} className="text-sm font-normal">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleExport} disabled={exportReport.isPending}>
                  {exportReport.isPending ? 'Exporting...' : 'Export Report'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold">{analytics.overview.active_members}</p>
                <p className="text-xs text-muted-foreground">
                  of {analytics.overview.total_members} total
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Task Completion</p>
                <p className="text-2xl font-bold">{analytics.overview.task_completion_rate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  {analytics.overview.completed_tasks} of {analytics.overview.total_tasks} tasks
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Goal Progress</p>
                <p className="text-2xl font-bold">{analytics.overview.goal_completion_rate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  {analytics.overview.completed_goals} of {analytics.overview.total_goals} goals
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Task Time</p>
                <p className="text-2xl font-bold">{analytics.overview.avg_task_completion_time.toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground">completion time</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Warnings */}
      {insights && insights.insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>AI-generated insights about your team's performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    {insight.trend && getTrendIcon(insight.trend)}
                    <Badge className={getInsightColor(insight.type)}>
                      {insight.type}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    {insight.metric && (
                      <p className="text-lg font-bold mt-1">{insight.metric}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Suggested actions to improve team performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.recommendations.map((rec, index) => (
                <div key={index} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{rec.title}</h4>
                    <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                  <Button size="sm" variant="outline">
                    {rec.action}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Productivity Trends</CardTitle>
            <CardDescription>Daily task and goal completion over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.productivity_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                />
                <Area
                  type="monotone"
                  dataKey="tasks_completed"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="Tasks Completed"
                />
                <Area
                  type="monotone"
                  dataKey="goals_completed"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  name="Goals Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>Current state of all team tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.task_analytics.status_distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }) => `${status}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                >
                  {analytics.task_analytics.status_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Member Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Member Performance</CardTitle>
          <CardDescription>Individual productivity and task completion rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.member_performance.map((member) => (
              <div key={member.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback>
                      {member.user_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.user_name}</p>
                    <p className="text-sm text-muted-foreground">{member.user_email}</p>
                    <p className="text-xs text-muted-foreground">
                      Last active: {format(new Date(member.last_activity), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold">{member.tasks_completed}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{member.completion_rate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{member.avg_task_time.toFixed(1)}h</p>
                      <p className="text-xs text-muted-foreground">Avg Time</p>
                    </div>
                  </div>
                  <Progress value={member.completion_rate} className="w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goal Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Performance</CardTitle>
          <CardDescription>Progress and velocity of active goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.goal_analytics.map((goal) => (
              <div key={goal.goal_id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{goal.goal_title}</h4>
                  <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                    {goal.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Progress</p>
                    <div className="flex items-center gap-2">
                      <Progress value={goal.progress} className="flex-1" />
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tasks</p>
                    <p className="font-medium">{goal.completed_tasks}/{goal.tasks_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Team Size</p>
                    <p className="font-medium">{goal.assigned_members} members</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Velocity</p>
                    <p className="font-medium">{goal.completion_velocity.toFixed(1)}%/day</p>
                  </div>
                  {goal.days_remaining !== undefined && (
                    <div>
                      <p className="text-muted-foreground">Time Left</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {goal.days_remaining > 0 ? `${goal.days_remaining} days` : 'Overdue'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}