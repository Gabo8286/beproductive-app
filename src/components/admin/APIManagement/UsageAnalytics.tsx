import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  Activity,
  DollarSign,
  Users,
  Clock,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { useSystemAIUsageStats, useAIUsageLimits, useRecentAIActivity } from '@/hooks/useAIUsageStats';
import { PROVIDER_LABELS } from '@/types/api-management';
import { Skeleton } from '@/components/ui/skeleton';

export const UsageAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState(30);

  const { data: systemStats, isLoading: statsLoading, refetch: refetchStats } = useSystemAIUsageStats(timeRange);
  const { data: limitsData, isLoading: limitsLoading } = useAIUsageLimits();
  const { data: recentActivity, isLoading: activityLoading } = useRecentAIActivity(20);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatNumber = (num: number) => num.toLocaleString();

  const getProviderBadgeColor = (provider: string) => {
    const colors = {
      openai: 'bg-green-100 text-green-800',
      claude: 'bg-blue-100 text-blue-800',
      gemini: 'bg-purple-100 text-purple-800',
      lovable: 'bg-orange-100 text-orange-800',
      custom: 'bg-gray-100 text-gray-800',
    };
    return colors[provider as keyof typeof colors] || colors.custom;
  };

  const alertsCount = limitsData?.filter(limit => limit.warnings?.length > 0).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Usage Analytics</h2>
          <p className="text-gray-600 mt-1">
            Real-time analytics and monitoring for AI service usage across the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => refetchStats()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Alerts Banner */}
      {alertsCount > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-amber-800 font-medium">
                  {alertsCount} API key{alertsCount > 1 ? 's' : ''} approaching limits
                </p>
                <p className="text-amber-700 text-sm">
                  Some API keys are nearing their usage limits. Review the limits tab for details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {formatNumber(systemStats?.total_requests || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Last {timeRange} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(systemStats?.total_cost || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Last {timeRange} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {formatNumber(systemStats?.unique_users || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Unique users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {(systemStats?.success_rate || 0).toFixed(1)}%
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Request success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {formatNumber(systemStats?.total_tokens || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Total tokens
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">By Provider</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="limits">Usage Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
                <CardDescription>
                  Daily usage patterns over the selected time period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>Interactive charts coming soon</p>
                    <p className="text-sm">Cost trends, request volume, and performance metrics</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Users</CardTitle>
                <CardDescription>
                  Highest usage by individual users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[150px]" />
                          <Skeleton className="h-4 w-[100px]" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Users className="h-12 w-12 mx-auto mb-4" />
                      <p>User analytics available soon</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-24" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              Object.entries(systemStats?.by_provider || {}).map(([provider, stats]) => (
                <Card key={provider}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {PROVIDER_LABELS[provider as keyof typeof PROVIDER_LABELS]}
                      </CardTitle>
                      <Badge className={getProviderBadgeColor(provider)}>
                        {provider}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold">{formatCurrency(stats.cost)}</p>
                        <p className="text-sm text-gray-500">Total Cost</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{formatNumber(stats.requests)}</p>
                        <p className="text-sm text-gray-500">Requests</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tokens:</span>
                        <span>{formatNumber(stats.tokens)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Users:</span>
                        <span>{formatNumber(stats.users)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent AI Requests
              </CardTitle>
              <CardDescription>
                Latest AI service requests across all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <Skeleton className="h-8 w-8 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[150px]" />
                      </div>
                      <Skeleton className="h-4 w-[80px]" />
                    </div>
                  ))
                ) : recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Badge className={getProviderBadgeColor(activity.provider)}>
                        {activity.provider}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {activity.request_metadata?.request_type || 'AI Request'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.profiles?.full_name || activity.profiles?.email || 'Unknown User'} •
                          {formatCurrency(activity.estimated_cost)} •
                          {formatNumber(activity.tokens_total)} tokens
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {activity.success ? '✅' : '❌'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.requested_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4" />
                    <p>No recent activity found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {limitsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : limitsData && limitsData.length > 0 ? (
              limitsData.map((limit) => (
                <Card key={limit.api_key_id} className={limit.warnings?.length > 0 ? 'border-amber-200' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{limit.key_name}</CardTitle>
                      <Badge className={getProviderBadgeColor(limit.provider)}>
                        {limit.provider}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Cost Usage</span>
                          <span>{limit.cost_usage_percent?.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              (limit.cost_usage_percent || 0) > 90 ? 'bg-red-500' :
                              (limit.cost_usage_percent || 0) > 75 ? 'bg-amber-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(limit.cost_usage_percent || 0, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Daily Requests</span>
                          <span>{limit.request_usage_percent?.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              (limit.request_usage_percent || 0) > 90 ? 'bg-red-500' :
                              (limit.request_usage_percent || 0) > 75 ? 'bg-amber-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(limit.request_usage_percent || 0, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Token Usage</span>
                          <span>{limit.token_usage_percent?.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              (limit.token_usage_percent || 0) > 90 ? 'bg-red-500' :
                              (limit.token_usage_percent || 0) > 75 ? 'bg-amber-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(limit.token_usage_percent || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {limit.warnings && limit.warnings.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-amber-800">Warnings</p>
                            <ul className="text-sm text-amber-700 mt-1">
                              {limit.warnings.map((warning, idx) => (
                                <li key={idx}>• {warning}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>No API key limit data available</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};