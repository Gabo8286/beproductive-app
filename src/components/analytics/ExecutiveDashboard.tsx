import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
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
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from "recharts";
import {
  Crown,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  DollarSign,
  Activity,
  Award,
  Building,
  Briefcase,
  Calendar,
  FileText,
  Download,
  Share,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";
import {
  ExecutiveDashboard as ExecutiveDashboardType,
  ExecutiveSummary,
  ExecutiveKPI,
  KPISection,
  TrendAnalysis,
  ActionItem,
  AnalyticsTimeframe
} from "@/types/analytics";

// Mock executive data
const mockExecutiveSummary: ExecutiveSummary = {
  period: "Q3 2024",
  headline_metrics: {
    productivity_score: 87.5,
    productivity_change: 12.3,
    team_efficiency: 92.1,
    efficiency_change: 8.7,
    goal_completion_rate: 78.9,
    goal_completion_change: 15.2,
    total_users: 1247,
    active_users: 1089,
    user_growth_rate: 18.4
  },
  key_achievements: [
    "Productivity score increased by 12.3% this quarter",
    "Team collaboration efficiency up 8.7%",
    "Goal completion rate improved by 15.2%",
    "User adoption increased by 18.4%",
    "AI feature usage grew by 245%"
  ],
  areas_for_improvement: [
    "Meeting efficiency could be optimized",
    "Task delegation patterns need refinement",
    "Cross-team communication gaps identified"
  ],
  strategic_insights: [
    "AI-powered features show highest ROI",
    "Remote teams outperforming office teams",
    "Goal-setting automation reduces completion time by 23%"
  ]
};

const mockKPISections: KPISection[] = [
  {
    id: "operational",
    title: "Operational Excellence",
    description: "Core operational metrics and performance indicators",
    target_audience: "coo",
    visualization_type: "bar",
    metrics: [
      {
        id: "productivity_score",
        name: "Overall Productivity Score",
        current_value: 87.5,
        target_value: 85,
        previous_value: 75.2,
        unit: "score",
        format: "number",
        trend: "up",
        performance_rating: "excellent",
        benchmark_comparison: {
          industry_average: 72.3,
          top_quartile: 84.2,
          percentile_rank: 89
        }
      },
      {
        id: "task_completion",
        name: "Task Completion Rate",
        current_value: 92.1,
        target_value: 90,
        previous_value: 88.7,
        unit: "%",
        format: "percentage",
        trend: "up",
        performance_rating: "excellent"
      },
      {
        id: "response_time",
        name: "Avg Response Time",
        current_value: 2.3,
        target_value: 4,
        previous_value: 3.1,
        unit: "hours",
        format: "number",
        trend: "up",
        performance_rating: "good"
      }
    ]
  },
  {
    id: "financial",
    title: "Financial Impact",
    description: "Revenue and cost efficiency metrics",
    target_audience: "ceo",
    visualization_type: "line",
    metrics: [
      {
        id: "roi",
        name: "Platform ROI",
        current_value: 245,
        target_value: 200,
        previous_value: 180,
        unit: "%",
        format: "percentage",
        trend: "up",
        performance_rating: "excellent"
      },
      {
        id: "cost_savings",
        name: "Cost Savings",
        current_value: 187500,
        target_value: 150000,
        previous_value: 125000,
        unit: "$",
        format: "currency",
        trend: "up",
        performance_rating: "excellent"
      }
    ]
  },
  {
    id: "team",
    title: "Team Performance",
    description: "Employee engagement and team effectiveness",
    target_audience: "hr",
    visualization_type: "gauge",
    metrics: [
      {
        id: "engagement",
        name: "Employee Engagement",
        current_value: 8.7,
        target_value: 8.5,
        previous_value: 7.9,
        unit: "/10",
        format: "number",
        trend: "up",
        performance_rating: "excellent"
      },
      {
        id: "retention",
        name: "Team Retention",
        current_value: 94.2,
        target_value: 90,
        previous_value: 91.5,
        unit: "%",
        format: "percentage",
        trend: "up",
        performance_rating: "excellent"
      }
    ]
  }
];

const mockTrendData = [
  { month: "Jan", productivity: 72, efficiency: 68, goals: 65 },
  { month: "Feb", productivity: 75, efficiency: 72, goals: 70 },
  { month: "Mar", productivity: 78, efficiency: 75, goals: 73 },
  { month: "Apr", productivity: 81, efficiency: 79, goals: 76 },
  { month: "May", productivity: 83, efficiency: 82, goals: 78 },
  { month: "Jun", productivity: 85, efficiency: 85, goals: 81 },
  { month: "Jul", productivity: 86, efficiency: 88, goals: 83 },
  { month: "Aug", productivity: 87, efficiency: 90, goals: 86 },
  { month: "Sep", productivity: 88, efficiency: 92, goals: 89 }
];

const mockActionItems: ActionItem[] = [
  {
    id: "action_1",
    title: "Optimize Meeting Efficiency",
    description: "Implement AI-powered meeting analytics to reduce average meeting time by 25%",
    priority: "high",
    category: "efficiency",
    assigned_to: "Operations Team",
    due_date: "2024-11-15",
    status: "in_progress",
    impact_estimation: "High - Potential 15% productivity increase",
    effort_estimation: "Medium - 2-3 weeks implementation",
    created_at: "2024-10-01T00:00:00Z"
  },
  {
    id: "action_2",
    title: "Enhance Cross-Team Communication",
    description: "Deploy automated workflow notifications to improve inter-team coordination",
    priority: "medium",
    category: "productivity",
    assigned_to: "IT Department",
    due_date: "2024-12-01",
    status: "pending",
    impact_estimation: "Medium - Improved collaboration scores",
    effort_estimation: "Low - 1 week setup",
    created_at: "2024-10-01T00:00:00Z"
  },
  {
    id: "action_3",
    title: "Scale AI Feature Adoption",
    description: "Increase AI feature utilization across all departments to maximize ROI",
    priority: "critical",
    category: "growth",
    assigned_to: "Product Team",
    due_date: "2024-10-30",
    status: "in_progress",
    impact_estimation: "Very High - 30% efficiency gain potential",
    effort_estimation: "High - 4-6 weeks rollout",
    created_at: "2024-10-01T00:00:00Z"
  }
];

export function ExecutiveDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("Q3 2024");
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'ceo' | 'cto' | 'coo' | 'hr'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredKPISections = selectedAudience === 'all'
    ? mockKPISections
    : mockKPISections.filter(section => section.target_audience === selectedAudience || section.target_audience === 'all');

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getPerformanceColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'needs_improvement': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPerformanceIcon = (rating: string) => {
    switch (rating) {
      case 'excellent': return <Award className="h-4 w-4" />;
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'needs_improvement': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="h-8 w-8 text-purple-600" />
            Executive Dashboard
          </h1>
          <p className="text-muted-foreground">
            Strategic insights and key performance indicators for leadership
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedAudience} onValueChange={(value: any) => setSelectedAudience(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="ceo">CEO</SelectItem>
              <SelectItem value="cto">CTO</SelectItem>
              <SelectItem value="coo">COO</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q3 2024">Q3 2024</SelectItem>
              <SelectItem value="Q2 2024">Q2 2024</SelectItem>
              <SelectItem value="Q1 2024">Q1 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-purple-600" />
            Executive Summary - {mockExecutiveSummary.period}
          </CardTitle>
          <CardDescription>
            High-level organizational performance overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {mockExecutiveSummary.headline_metrics.productivity_score.toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">Productivity Score</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">
                  +{mockExecutiveSummary.headline_metrics.productivity_change.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {mockExecutiveSummary.headline_metrics.team_efficiency.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Team Efficiency</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">
                  +{mockExecutiveSummary.headline_metrics.efficiency_change.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {mockExecutiveSummary.headline_metrics.goal_completion_rate.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Goal Completion</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">
                  +{mockExecutiveSummary.headline_metrics.goal_completion_change.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {mockExecutiveSummary.headline_metrics.total_users.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">
                  +{mockExecutiveSummary.headline_metrics.user_growth_rate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="kpis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="kpis">Key Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Strategic Insights</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="kpis" className="space-y-6">
          {filteredKPISections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {section.title}
                  <Badge variant="outline" className="capitalize">
                    {section.target_audience === 'all' ? 'All Roles' : section.target_audience.toUpperCase()}
                  </Badge>
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {section.metrics.map((metric) => (
                    <Card key={metric.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{metric.name}</CardTitle>
                          <div className={`flex items-center gap-1 ${getPerformanceColor(metric.performance_rating)}`}>
                            {getPerformanceIcon(metric.performance_rating)}
                            <Badge variant="outline" className={getPerformanceColor(metric.performance_rating)}>
                              {metric.performance_rating}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-2xl font-bold">
                            {metric.format === 'currency'
                              ? formatCurrency(metric.current_value)
                              : metric.format === 'percentage'
                              ? `${metric.current_value.toFixed(1)}%`
                              : `${metric.current_value.toFixed(1)}${metric.unit}`
                            }
                          </div>

                          {/* Progress towards target */}
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Target: {metric.format === 'currency'
                                ? formatCurrency(metric.target_value)
                                : `${metric.target_value}${metric.unit}`
                              }</span>
                              <span>{Math.round((metric.current_value / metric.target_value) * 100)}%</span>
                            </div>
                            <Progress
                              value={(metric.current_value / metric.target_value) * 100}
                              className="h-2"
                            />
                          </div>

                          {/* Change from previous */}
                          <div className="flex items-center gap-2 text-sm">
                            {metric.trend === 'up' ? (
                              <TrendingUp className="h-3 w-3 text-green-600" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-600" />
                            )}
                            <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                              {((metric.current_value - metric.previous_value) / metric.previous_value * 100).toFixed(1)}%
                            </span>
                            <span className="text-muted-foreground">vs previous period</span>
                          </div>

                          {/* Benchmark comparison */}
                          {metric.benchmark_comparison && (
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>Industry avg: {metric.benchmark_comparison.industry_average}</div>
                              <div>Top quartile: {metric.benchmark_comparison.top_quartile}</div>
                              <div>Your percentile: {metric.benchmark_comparison.percentile_rank}th</div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Quarter-over-quarter performance analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="productivity"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    name="Productivity Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    name="Team Efficiency"
                  />
                  <Line
                    type="monotone"
                    dataKey="goals"
                    stroke="#10B981"
                    strokeWidth={3}
                    name="Goal Completion"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Achievements</CardTitle>
                <CardDescription>Major wins this quarter</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockExecutiveSummary.key_achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm">{achievement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Areas for Improvement</CardTitle>
                <CardDescription>Focus areas for next quarter</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockExecutiveSummary.areas_for_improvement.map((area, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Strategic Insights</CardTitle>
              <CardDescription>
                AI-powered analysis and recommendations for strategic decision-making
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockExecutiveSummary.strategic_insights.map((insight, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <p className="font-medium mb-1">Strategic Insight #{index + 1}</p>
                        <p className="text-sm text-muted-foreground">{insight}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid gap-4">
            {mockActionItems.map((action) => (
              <Card key={action.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(action.priority)}>
                        {action.priority}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {action.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Assigned To</p>
                      <p>{action.assigned_to}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Due Date</p>
                      <p>{action.due_date ? new Date(action.due_date).toLocaleDateString() : 'Not set'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Category</p>
                      <p className="capitalize">{action.category}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div>
                      <p className="font-medium text-sm">Expected Impact</p>
                      <p className="text-sm text-muted-foreground">{action.impact_estimation}</p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Effort Required</p>
                      <p className="text-sm text-muted-foreground">{action.effort_estimation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmarks</CardTitle>
              <CardDescription>
                Compare your performance against industry standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Benchmark Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  Detailed industry benchmark comparisons and competitive analysis
                </p>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}