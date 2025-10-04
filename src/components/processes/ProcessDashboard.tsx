import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Workflow,
  Plus,
  Settings,
  BarChart3,
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Filter
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useProcesses, useProcessAnalytics } from "@/hooks/useProcesses";
import { ProcessStatus, ProcessCategory } from "@/types/processes";
import { CreateProcessDialog } from "./CreateProcessDialog";

const statusColors = {
  draft: "#94a3b8",
  review: "#f59e0b",
  approved: "#10b981",
  active: "#3b82f6",
  deprecated: "#ef4444",
  archived: "#6b7280"
};

const categoryIcons = {
  operational: "⚙️",
  administrative: "📋",
  strategic: "🎯",
  compliance: "⚖️",
  quality: "✨",
  hr: "👥",
  finance: "💰",
  it: "💻",
  other: "📁"
};

export function ProcessDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState<ProcessStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ProcessCategory | 'all'>('all');
  const [createProcessOpen, setCreateProcessOpen] = useState(false);

  const { user, profile, loading: authLoading } = useAuth();
  const { processes, isLoading: processesLoading, updateProcessStatus } = useProcesses(
    statusFilter === 'all' ? undefined : statusFilter
  );
  const { data: analytics, isLoading: analyticsLoading } = useProcessAnalytics();

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="space-y-2 text-center">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert>
        <Workflow className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please sign in to access process management features.
        </AlertDescription>
      </Alert>
    );
  }

  const filteredProcesses = processes.filter(process => {
    const statusMatch = statusFilter === 'all' || process.status === statusFilter;
    const categoryMatch = categoryFilter === 'all' || process.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Workflow className="h-8 w-8 text-blue-600" />
            Process Inventory
          </h1>
          <p className="text-muted-foreground mt-1">
            Document, manage, and optimize your business processes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreateProcessOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Process
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Process Settings
          </Button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      {analyticsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Processes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_processes}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.by_status.active || 0} currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.pending_approvals}</div>
              <p className="text-xs text-muted-foreground">
                Require review and approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.compliance_score}%</div>
              <p className="text-xs text-muted-foreground">
                Approved processes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(analytics.avg_completion_time)}m
              </div>
              <p className="text-xs text-muted-foreground">
                Average completion time
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="processes">All Processes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Process Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Process Status Distribution</CardTitle>
                <CardDescription>
                  Current status of all processes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(analytics.by_status).map(([status, count]) => ({
                          name: status.charAt(0).toUpperCase() + status.slice(1),
                          value: count,
                          fill: statusColors[status as ProcessStatus]
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {Object.entries(analytics.by_status).map((_, index) => (
                          <Cell key={`cell-${index}`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Process Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Process Categories</CardTitle>
                <CardDescription>
                  Distribution by business area
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(analytics.by_category).map(([category, count]) => ({
                      category: category.charAt(0).toUpperCase() + category.slice(1),
                      count,
                      icon: categoryIcons[category as ProcessCategory] || "📁"
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Updated Processes</CardTitle>
              <CardDescription>
                Latest process modifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.recently_updated && analytics.recently_updated.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recently_updated.map((process) => (
                    <div key={process.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-lg">
                          {categoryIcons[process.category]}
                        </div>
                        <div>
                          <h4 className="font-medium">{process.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {process.category} • v{process.version}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          style={{ borderColor: statusColors[process.status] }}
                        >
                          {process.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(process.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processes" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProcessStatus | 'all')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as ProcessCategory | 'all')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="administrative">Administrative</SelectItem>
                <SelectItem value="strategic">Strategic</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="quality">Quality</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="it">IT</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Processes List */}
          {processesLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : filteredProcesses.length > 0 ? (
            <div className="grid gap-4">
              {filteredProcesses.map((process) => (
                <Card key={process.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {categoryIcons[process.category]}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{process.title}</h3>
                            {process.description && (
                              <p className="text-sm text-muted-foreground mt-1">{process.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {process.category}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {process.complexity}
                          </Badge>
                          <Badge
                            variant="outline"
                            style={{ borderColor: statusColors[process.status] }}
                            className="capitalize"
                          >
                            {process.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span>Version {process.version}</span>
                          <span>{process.steps.length} steps</span>
                          <span>{process.stakeholders.length} stakeholders</span>
                        </div>
                        <span>Updated {new Date(process.updated_at).toLocaleDateString()}</span>
                      </div>

                      {process.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {process.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No processes found</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your filters or create a new process.'
                  : 'Create your first process to start documenting your workflows.'
                }
              </p>
              <Button onClick={() => setCreateProcessOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Process
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Complexity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Process Complexity</CardTitle>
                <CardDescription>
                  Distribution by complexity level
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(analytics.by_complexity).map(([complexity, count]) => ({
                      complexity: complexity.charAt(0).toUpperCase() + complexity.slice(1),
                      count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="complexity" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Most Executed Processes</CardTitle>
                <CardDescription>
                  Top processes by execution count
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.most_executed && analytics.most_executed.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.most_executed.map((process, index) => (
                      <div key={process.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center">
                            {index + 1}
                          </div>
                          <span className="font-medium">{process.title}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {process.metrics?.total_executions || 0} executions
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No execution data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Process Templates</h3>
            <p className="text-muted-foreground mb-4">
              Pre-built process templates coming soon. Start with common business processes.
            </p>
            <Button variant="outline" disabled>
              <Plus className="h-4 w-4 mr-2" />
              Browse Templates
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Process Dialog */}
      <CreateProcessDialog
        open={createProcessOpen}
        onOpenChange={setCreateProcessOpen}
      />
    </div>
  );
}