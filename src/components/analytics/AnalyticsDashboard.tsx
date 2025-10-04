import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  Plus,
  Search,
  Filter,
  Settings,
  Share,
  Copy,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Target,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle,
  Star,
  Building
} from "lucide-react";
import {
  CustomDashboard,
  AnalyticsMetric,
  AnalyticsDataset,
  AnalyticsTimeframe,
  ReportTemplate
} from "@/types/analytics";
import {
  useAnalyticsDashboards,
  useAnalyticsMetrics,
  useMetricData,
  useDeleteDashboard,
  useAnalyticsInsights,
  useReportTemplates
} from "@/hooks/useAnalytics";
import { DashboardBuilder } from "./DashboardBuilder";

export function AnalyticsDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<AnalyticsTimeframe>('30d');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDashboard, setSelectedDashboard] = useState<CustomDashboard | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState<CustomDashboard | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: dashboardsResponse, isLoading: dashboardsLoading } = useAnalyticsDashboards();
  const { data: metricsResponse, isLoading: metricsLoading } = useAnalyticsMetrics();
  const { data: insightsData } = useAnalyticsInsights();
  const { data: templatesResponse } = useReportTemplates();
  const deleteDashboard = useDeleteDashboard();

  // Sample metric data queries for overview
  const { data: taskCompletionData } = useMetricData('metric_1', selectedTimeframe);
  const { data: goalAchievementData } = useMetricData('metric_2', selectedTimeframe);
  const { data: aiUsageData } = useMetricData('metric_3', selectedTimeframe);

  const dashboards = dashboardsResponse?.data || [];
  const metrics = metricsResponse?.data || [];
  const insights = insightsData || [];
  const templates = templatesResponse?.data || [];

  const filteredDashboards = dashboards.filter(dashboard =>
    dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dashboard.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateDashboard = () => {
    setEditingDashboard(null);
    setBuilderOpen(true);
  };

  const handleEditDashboard = (dashboard: CustomDashboard) => {
    setEditingDashboard(dashboard);
    setBuilderOpen(true);
  };

  const handleDeleteDashboard = async (dashboardId: string) => {
    try {
      await deleteDashboard.mutateAsync(dashboardId);
    } catch (error) {
      console.error('Failed to delete dashboard:', error);
    }
  };

  const handleCloneDashboard = (dashboard: CustomDashboard) => {
    const clonedDashboard: CustomDashboard = {
      ...dashboard,
      id: '',
      name: `${dashboard.name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingDashboard(clonedDashboard);
    setBuilderOpen(true);
  };

  const MetricCard = ({ title, value, change, trend, color = "blue" }: {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'stable';
    color?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`h-4 w-4 text-${color}-600`}>
          {trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
           trend === 'down' ? <TrendingUp className="h-4 w-4 rotate-180" /> :
           <Activity className="h-4 w-4" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
          {change} from last period
        </p>
      </CardContent>
    </Card>
  );

  const InsightCard = ({ insight }: { insight: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {insight.type === 'trend' && <TrendingUp className="h-4 w-4 text-blue-600" />}
            {insight.type === 'anomaly' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
            {insight.type === 'recommendation' && <Target className="h-4 w-4 text-green-600" />}
            <CardTitle className="text-base">{insight.title}</CardTitle>
          </div>
          <Badge variant={insight.severity === 'high' ? 'destructive' : insight.severity === 'medium' ? 'default' : 'secondary'}>
            {insight.severity}
          </Badge>
        </div>
        <CardDescription>{insight.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span>Confidence: {Math.round(insight.confidence_score * 100)}%</span>
          </div>
          {insight.is_actionable && (
            <Badge variant="outline" className="text-xs">
              Actionable
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (builderOpen) {
    return (
      <DashboardBuilder
        dashboard={editingDashboard || undefined}
        onSave={() => setBuilderOpen(false)}
        onCancel={() => setBuilderOpen(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Advanced Analytics & Reporting
          </h1>
          <p className="text-muted-foreground">
            Create custom dashboards, track KPIs, and gain insights from your productivity data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeframe} onValueChange={(value: AnalyticsTimeframe) => setSelectedTimeframe(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCreateDashboard}>
            <Plus className="h-4 w-4 mr-2" />
            Create Dashboard
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dashboards">My Dashboards</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Task Completion Rate"
              value={taskCompletionData ? `${Math.round(taskCompletionData.data.aggregated_value)}%` : "Loading..."}
              change={taskCompletionData ? `${taskCompletionData.data.trend_percentage > 0 ? '+' : ''}${taskCompletionData.data.trend_percentage.toFixed(1)}%` : ""}
              trend={taskCompletionData?.data.trend_direction || 'stable'}
              color="green"
            />
            <MetricCard
              title="Goal Achievement"
              value={goalAchievementData ? `${Math.round(goalAchievementData.data.aggregated_value)}` : "Loading..."}
              change={goalAchievementData ? `${goalAchievementData.data.trend_percentage > 0 ? '+' : ''}${goalAchievementData.data.trend_percentage.toFixed(1)}%` : ""}
              trend={goalAchievementData?.data.trend_direction || 'stable'}
              color="blue"
            />
            <MetricCard
              title="AI Usage Hours"
              value={aiUsageData ? `${Math.round(aiUsageData.data.aggregated_value)}h` : "Loading..."}
              change={aiUsageData ? `${aiUsageData.data.trend_percentage > 0 ? '+' : ''}${aiUsageData.data.trend_percentage.toFixed(1)}%` : ""}
              trend={aiUsageData?.data.trend_direction || 'stable'}
              color="purple"
            />
            <MetricCard
              title="Active Dashboards"
              value={dashboards.length.toString()}
              change={`${dashboards.filter(d => d.widgets.length > 0).length} configured`}
              trend="stable"
              color="orange"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>
                  Key performance indicators for the selected timeframe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Total Data Points</span>
                    </div>
                    <span className="font-semibold">
                      {(taskCompletionData?.data.total_count || 0) +
                       (goalAchievementData?.data.total_count || 0) +
                       (aiUsageData?.data.total_count || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Tracked Metrics</span>
                    </div>
                    <span className="font-semibold">{metrics.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Custom Dashboards</span>
                    </div>
                    <span className="font-semibold">{dashboards.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Available Templates</span>
                    </div>
                    <span className="font-semibold">{templates.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest analytics and dashboard activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboards.slice(0, 3).map((dashboard) => (
                    <div key={dashboard.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{dashboard.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Updated {new Date(dashboard.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedDashboard(dashboard)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {dashboards.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No dashboards created yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search dashboards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Dashboards Grid */}
          {dashboardsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-48 animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDashboards.map((dashboard) => (
                <Card key={dashboard.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {dashboard.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {dashboard.description || "No description provided"}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setSelectedDashboard(dashboard)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditDashboard(dashboard)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCloneDashboard(dashboard)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Clone
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteDashboard(dashboard.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      {/* Dashboard Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3 text-muted-foreground" />
                          <span>{dashboard.widgets.length} widgets</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <RefreshCw className="h-3 w-3 text-muted-foreground" />
                          <span>{dashboard.refresh_interval / 60}min</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {dashboard.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {dashboard.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {dashboard.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{dashboard.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Last Updated */}
                      <div className="text-xs text-muted-foreground">
                        Updated {new Date(dashboard.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Empty State */}
              {filteredDashboards.length === 0 && !dashboardsLoading && (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No dashboards found</h3>
                      <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                        {searchQuery ? 'Try adjusting your search criteria' : 'Create your first custom dashboard to start visualizing your data'}
                      </p>
                      <Button onClick={handleCreateDashboard}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            {insights.length > 0 ? (
              insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Zap className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No insights available</h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                    AI insights will appear here as we analyze your productivity data patterns
                  </p>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Insights
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {template.description}
                      </CardDescription>
                    </div>
                    {template.is_verified && (
                      <Badge variant="secondary" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{template.popularity_score}/100</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{template.estimated_setup_time_minutes}min</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Scheduled Reports</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                Create and manage automated report generation and delivery
              </p>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}