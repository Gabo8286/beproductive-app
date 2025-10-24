/**
 * Navigation Analytics Dashboard
 * Comprehensive analytics dashboard for Luna Enhanced Navigation system
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  MousePointer,
  Zap,
  Eye,
  Download,
  RefreshCw,
  Settings,
  HeatmapIcon,
  PieChart,
  Activity,
  Target,
  Filter,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnalyticsDashboard } from '@/hooks/useNavigationAnalytics';
import { NavigationHubId } from '@/types/navigation';

interface NavigationAnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function NavigationAnalyticsDashboard({
  isOpen,
  onClose,
  className = '',
}: NavigationAnalyticsDashboardProps) {
  const {
    dashboardData,
    chartsData,
    metrics,
    isLoading,
    error,
    refreshMetrics,
    getHeatmapData,
  } = useAnalyticsDashboard();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedHub, setSelectedHub] = useState<NavigationHubId>('capture');

  // Generate sample heatmap data
  const heatmapData = useMemo(() => {
    return getHeatmapData(selectedHub);
  }, [selectedHub, getHeatmapData]);

  const downloadAnalytics = () => {
    // Export functionality would be implemented here
    console.log('Downloading analytics...');
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000)}m`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 ${className}`}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="fixed inset-4 bg-background rounded-lg shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Navigation Analytics</h2>
                <p className="text-muted-foreground">
                  Comprehensive insights into Luna navigation performance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={refreshMetrics}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={downloadAnalytics}
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading analytics...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="text-destructive">Error loading analytics: {error}</p>
                  <Button variant="outline" size="sm" onClick={refreshMetrics} className="mt-2">
                    Retry
                  </Button>
                </div>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-4 mt-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="behavior">User Behavior</TabsTrigger>
                  <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                  <TabsTrigger value="roles">Role Analysis</TabsTrigger>
                </TabsList>

                <div className="p-6">
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Hub Clicks</CardTitle>
                          <MousePointer className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {formatNumber(dashboardData?.overview.totalHubClicks || 0)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            +12% from last period
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                          <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {formatNumber(dashboardData?.overview.totalQuickActions || 0)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            +8% from last period
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {formatNumber(dashboardData?.overview.activeUsers || 0)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            +15% from last period
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {formatDuration(dashboardData?.overview.averageSessionDuration || 0)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            +5% from last period
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Top Hubs */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Most Popular Hubs</CardTitle>
                        <CardDescription>
                          Navigation hubs ranked by total interactions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {dashboardData?.topHubs.map((hub, index) => (
                            <div key={hub.hubId} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary">#{index + 1}</Badge>
                                <div>
                                  <p className="font-medium capitalize">{hub.hubId}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {hub.uniqueUsers} unique users
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatNumber(hub.totalClicks)}</p>
                                <Progress
                                  value={(hub.totalClicks / (dashboardData?.topHubs[0]?.totalClicks || 1)) * 100}
                                  className="w-20 h-2"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Top Quick Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Most Used Quick Actions</CardTitle>
                        <CardDescription>
                          Quick actions ranked by usage frequency
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {dashboardData?.topActions.map((action, index) => (
                            <div key={action.actionId} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary">#{index + 1}</Badge>
                                <div>
                                  <p className="font-medium">{action.actionId}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {action.uniqueUsers} unique users
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatNumber(action.totalUses)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDuration(action.averageCompletionTime)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Performance Tab */}
                  <TabsContent value="performance" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Load Time</CardTitle>
                          <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {formatDuration(dashboardData?.performance.averageLoadTime || 0)}
                          </div>
                          <Progress value={75} className="mt-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Target: &lt;2s
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Render Time</CardTitle>
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {formatDuration(dashboardData?.performance.averageRenderTime || 0)}
                          </div>
                          <Progress value={85} className="mt-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Target: &lt;500ms
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                          <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {Math.round((dashboardData?.performance.memoryUsage || 0) / 1024 / 1024)}MB
                          </div>
                          <Progress value={60} className="mt-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Target: &lt;50MB
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {((dashboardData?.performance.errorRate || 0) * 100).toFixed(2)}%
                          </div>
                          <Progress value={5} className="mt-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Target: &lt;1%
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Performance Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Metrics Trend</CardTitle>
                        <CardDescription>
                          Historical performance data over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                          <div className="text-center text-muted-foreground">
                            <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                            <p>Performance chart visualization</p>
                            <p className="text-sm">Would show load time, render time, and error rate trends</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* User Behavior Tab */}
                  <TabsContent value="behavior" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Usage Patterns */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Most Common Navigation Paths</CardTitle>
                          <CardDescription>
                            Top user journey patterns through the navigation
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {dashboardData?.usagePatterns.map((pattern, index) => (
                              <div key={index} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline">Path #{index + 1}</Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {pattern.frequency} users
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  {pattern.path.map((hub, i) => (
                                    <React.Fragment key={i}>
                                      <span className="px-2 py-1 bg-muted rounded capitalize">
                                        {hub}
                                      </span>
                                      {i < pattern.path.length - 1 && (
                                        <span className="text-muted-foreground">→</span>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Avg duration: {formatDuration(pattern.averageDuration)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Time-based Usage */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Usage by Time of Day</CardTitle>
                          <CardDescription>
                            Peak usage hours and activity patterns
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                            <div className="text-center text-muted-foreground">
                              <Clock className="h-12 w-12 mx-auto mb-2" />
                              <p>Hourly usage chart</p>
                              <p className="text-sm">Would show activity by hour of day</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Heatmap Tab */}
                  <TabsContent value="heatmap" className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Select value={selectedHub} onValueChange={(value) => setSelectedHub(value as NavigationHubId)}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="capture">Capture Hub</SelectItem>
                          <SelectItem value="planning">Planning Hub</SelectItem>
                          <SelectItem value="engage">Engage Hub</SelectItem>
                          <SelectItem value="profile">Profile Hub</SelectItem>
                          <SelectItem value="insights">Insights Hub</SelectItem>
                          <SelectItem value="admin">Admin Hub</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HeatmapIcon className="h-5 w-5" />
                          Interaction Heatmap - {selectedHub}
                        </CardTitle>
                        <CardDescription>
                          Visual representation of user interaction hotspots
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-96 relative border-2 border-dashed border-muted-foreground/25 rounded-lg overflow-hidden">
                          {/* Simulated heatmap visualization */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-red-500/20" />
                          {heatmapData.map((point, index) => (
                            <div
                              key={index}
                              className="absolute w-8 h-8 rounded-full bg-red-500 opacity-50"
                              style={{
                                left: `${point.x}%`,
                                top: `${point.y}%`,
                                transform: 'translate(-50%, -50%)',
                                opacity: point.intensity,
                              }}
                            />
                          ))}
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <Eye className="h-12 w-12 mx-auto mb-2" />
                              <p>Interactive heatmap visualization</p>
                              <p className="text-sm">Red areas indicate high interaction zones</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Role Analysis Tab */}
                  <TabsContent value="roles" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {dashboardData?.roleDistribution.map((roleData) => (
                        <Card key={roleData.role}>
                          <CardHeader>
                            <CardTitle className="capitalize">{roleData.role} Users</CardTitle>
                            <CardDescription>
                              Navigation patterns and preferences
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Most Used Hubs</h4>
                              <div className="flex gap-2">
                                {roleData.mostUsedHubs.map((hub) => (
                                  <Badge key={hub} variant="secondary" className="capitalize">
                                    {hub}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Performance Metrics</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm">Avg Task Completion</span>
                                  <span className="text-sm font-medium">
                                    {formatDuration(roleData.averageTaskCompletionTime)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Feature Adoption</span>
                                  <span className="text-sm font-medium">
                                    {Math.round(roleData.featureAdoptionRate * 100)}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Customization Usage</span>
                                  <span className="text-sm font-medium">
                                    {Math.round(roleData.customizationUsage * 100)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}