import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  DollarSign,
  Activity,
  TrendingUp,
  Clock,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useAIUsageStats, useCostProjections } from '@/hooks/useAIUsageStats';
import { PROVIDER_LABELS } from '@/types/api-management';
import { Skeleton } from '@/components/ui/skeleton';

export const AIUsageWidget: React.FC = () => {
  const { data: usageStats, isLoading: usageLoading } = useAIUsageStats(30);
  const { data: projections, isLoading: projectionsLoading } = useCostProjections();

  const formatCurrency = (amount: number) => `$${amount.toFixed(3)}`;
  const formatNumber = (num: number) => num.toLocaleString();

  // Advanced Analytics Calculations
  const getUsagePatterns = () => {
    if (!usageStats?.daily_breakdown || usageStats.daily_breakdown.length === 0) return null;

    const recent7Days = usageStats.daily_breakdown.slice(-7);
    const avgDailyCost = recent7Days.reduce((sum, day) => sum + day.cost, 0) / recent7Days.length;
    const avgDailyRequests = recent7Days.reduce((sum, day) => sum + day.requests, 0) / recent7Days.length;

    // Find peak usage day
    const peakDay = recent7Days.reduce((peak, day) =>
      day.cost > peak.cost ? day : peak
    );

    // Calculate efficiency (tokens per dollar)
    const totalTokens = usageStats.total_tokens || 0;
    const totalCost = usageStats.total_cost || 0;
    const efficiency = totalCost > 0 ? totalTokens / totalCost : 0;

    // Trend analysis (comparing first half vs second half of period)
    const firstHalf = recent7Days.slice(0, Math.floor(recent7Days.length / 2));
    const secondHalf = recent7Days.slice(Math.floor(recent7Days.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.cost, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.cost, 0) / secondHalf.length;
    const trendDirection = secondHalfAvg > firstHalfAvg ? 'increasing' : secondHalfAvg < firstHalfAvg ? 'decreasing' : 'stable';

    return {
      avgDailyCost,
      avgDailyRequests,
      peakDay,
      efficiency,
      trendDirection
    };
  };

  const patterns = getUsagePatterns();

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

  const projectedExceedsLimit = projections && projections.projected_month_end > 10; // $10 default user limit

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">AI Usage This Month</CardTitle>
          </div>
          {projectedExceedsLimit && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Projected Over Budget
            </Badge>
          )}
        </div>
        <CardDescription>
          Your AI service usage and cost breakdown
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            {usageLoading ? (
              <Skeleton className="h-6 w-16 mx-auto mb-1" />
            ) : (
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(usageStats?.total_cost || 0)}
              </p>
            )}
            <p className="text-xs text-gray-500">Total Cost</p>
          </div>

          <div className="text-center">
            {usageLoading ? (
              <Skeleton className="h-6 w-16 mx-auto mb-1" />
            ) : (
              <p className="text-2xl font-bold text-green-600">
                {formatNumber(usageStats?.total_requests || 0)}
              </p>
            )}
            <p className="text-xs text-gray-500">Requests</p>
          </div>

          <div className="text-center">
            {usageLoading ? (
              <Skeleton className="h-6 w-16 mx-auto mb-1" />
            ) : (
              <p className="text-2xl font-bold text-purple-600">
                {formatNumber(usageStats?.total_tokens || 0)}
              </p>
            )}
            <p className="text-xs text-gray-500">Tokens</p>
          </div>

          <div className="text-center">
            {usageLoading ? (
              <Skeleton className="h-6 w-16 mx-auto mb-1" />
            ) : (
              <p className="text-2xl font-bold text-orange-600">
                {(usageStats?.success_rate || 0).toFixed(1)}%
              </p>
            )}
            <p className="text-xs text-gray-500">Success Rate</p>
          </div>
        </div>

        {/* Cost Projection */}
        {!projectionsLoading && projections && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-900">Cost Projection Analysis</h4>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="text-gray-600">Current month:</p>
                <p className="font-bold">{formatCurrency(projections.current_month_cost)}</p>
              </div>
              <div>
                <p className="text-gray-600">Projected total:</p>
                <p className={`font-bold ${projectedExceedsLimit ? 'text-amber-600' : 'text-green-600'}`}>
                  {formatCurrency(projections.projected_month_end)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Daily average:</p>
                <p className="font-bold">{formatCurrency(projections.daily_average)}</p>
              </div>
              <div>
                <p className="text-gray-600">Days remaining:</p>
                <p className="font-bold">{projections.days_remaining} days</p>
              </div>
            </div>

            {/* Projection Timeline Chart */}
            <div className="mb-3">
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={[
                  { day: 'Today', actual: projections.current_month_cost, projected: projections.current_month_cost },
                  { day: 'Mid-month', actual: null, projected: projections.current_month_cost + (projections.daily_average * Math.floor(projections.days_remaining / 2)) },
                  { day: 'Month-end', actual: null, projected: projections.projected_month_end }
                ]}>
                  <XAxis dataKey="day" hide />
                  <YAxis hide />
                  <Tooltip formatter={(value, name) => [formatCurrency(value), name === 'actual' ? 'Actual' : 'Projected']} />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#10b981" }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Monthly budget usage</span>
                <span>{((projections.projected_month_end / 10) * 100).toFixed(0)}%</span>
              </div>
              <Progress
                value={Math.min((projections.projected_month_end / 10) * 100, 100)}
                className="h-2"
              />
              {projectedExceedsLimit && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠ Projected to exceed $10 budget by {formatCurrency(projections.projected_month_end - 10)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Provider Comparison */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Provider Performance Analysis
          </h4>
          <div className="space-y-3">
            {usageLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-16" />
                    <div>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))
            ) : usageStats && Object.keys(usageStats.by_provider).length > 0 ? (
              (() => {
                const providers = Object.entries(usageStats.by_provider);
                const totalCost = providers.reduce((sum, [, stats]) => sum + stats.cost, 0);
                const totalRequests = providers.reduce((sum, [, stats]) => sum + stats.requests, 0);

                return providers
                  .sort((a, b) => b[1].cost - a[1].cost) // Sort by cost descending
                  .map(([provider, stats]) => {
                    const costPercentage = totalCost > 0 ? (stats.cost / totalCost) * 100 : 0;
                    const requestPercentage = totalRequests > 0 ? (stats.requests / totalRequests) * 100 : 0;
                    const costPerRequest = stats.requests > 0 ? stats.cost / stats.requests : 0;
                    const costPerToken = stats.tokens > 0 ? stats.cost / stats.tokens : 0;

                    return (
                      <div key={provider} className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={getProviderBadgeColor(provider)}>
                              {provider}
                            </Badge>
                            <div>
                              <p className="font-medium text-sm">
                                {PROVIDER_LABELS[provider as keyof typeof PROVIDER_LABELS]}
                              </p>
                              <p className="text-xs text-gray-500">
                                {costPercentage.toFixed(1)}% of total spend
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{formatCurrency(stats.cost)}</p>
                            <p className="text-xs text-gray-500">
                              {formatCurrency(costPerRequest)}/req
                            </p>
                          </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="text-center">
                            <p className="font-medium">{formatNumber(stats.requests)}</p>
                            <p className="text-gray-500">{requestPercentage.toFixed(1)}% requests</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{formatNumber(stats.tokens)}</p>
                            <p className="text-gray-500">{formatCurrency(costPerToken * 1000)}/1K tokens</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium flex items-center justify-center gap-1">
                              {stats.avg_response_time ? (
                                <>
                                  <Clock className="h-3 w-3" />
                                  {stats.avg_response_time.toFixed(0)}ms
                                </>
                              ) : (
                                'N/A'
                              )}
                            </p>
                            <p className="text-gray-500">avg response</p>
                          </div>
                        </div>

                        {/* Cost efficiency indicator */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                costPerRequest < 0.01 ? 'bg-green-500' :
                                costPerRequest < 0.05 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(costPercentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {costPerRequest < 0.01 ? 'Efficient' :
                             costPerRequest < 0.05 ? 'Moderate' : 'Expensive'}
                          </span>
                        </div>
                      </div>
                    );
                  });
              })()
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Sparkles className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No AI usage this month</p>
                <p className="text-xs">Generate some insights to see your usage here!</p>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Pattern Analysis */}
        {patterns && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-900">Usage Pattern Analysis</h4>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Daily Average:</p>
                <p className="font-bold">{formatCurrency(patterns.avgDailyCost)}</p>
                <p className="text-xs text-gray-500">{Math.round(patterns.avgDailyRequests)} requests/day</p>
              </div>
              <div>
                <p className="text-gray-600">Efficiency Score:</p>
                <p className="font-bold">{Math.round(patterns.efficiency)} tokens/$</p>
                <p className="text-xs text-gray-500">
                  {patterns.efficiency > 1000 ? 'Excellent' : patterns.efficiency > 500 ? 'Good' : 'Consider optimization'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Peak Usage:</p>
                <p className="font-bold">{new Date(patterns.peakDay.date).toLocaleDateString('en', { weekday: 'short' })}</p>
                <p className="text-xs text-gray-500">{formatCurrency(patterns.peakDay.cost)}</p>
              </div>
              <div>
                <p className="text-gray-600">Trend:</p>
                <p className={`font-bold ${
                  patterns.trendDirection === 'increasing' ? 'text-orange-600' :
                  patterns.trendDirection === 'decreasing' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {patterns.trendDirection === 'increasing' ? '↗ Increasing' :
                   patterns.trendDirection === 'decreasing' ? '↘ Decreasing' : '→ Stable'}
                </p>
                <p className="text-xs text-gray-500">7-day trend</p>
              </div>
            </div>
          </div>
        )}

        {/* Usage Tips */}
        {usageStats && usageStats.total_cost > 5 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Usage Tip</p>
                <p className="text-xs text-amber-700 mt-1">
                  You're approaching higher usage levels. Consider reviewing your AI insight generation frequency
                  or focusing on specific insight types to optimize costs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Trend */}
        {usageStats && usageStats.daily_breakdown && usageStats.daily_breakdown.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Usage Trend (Last 14 Days)
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={usageStats.daily_breakdown.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={[
                    (value, name) => [
                      name === 'cost' ? formatCurrency(value) : formatNumber(value),
                      name === 'cost' ? 'Cost' : name === 'requests' ? 'Requests' : 'Tokens'
                    ]
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Cost"
                />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Requests"
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};