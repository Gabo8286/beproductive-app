import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-900">Monthly Projection</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
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
            </div>
          </div>
        )}

        {/* Provider Breakdown */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Usage by Provider
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
              Object.entries(usageStats.by_provider).map(([provider, stats]) => (
                <div key={provider} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getProviderBadgeColor(provider)}>
                      {provider}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">
                        {PROVIDER_LABELS[provider as keyof typeof PROVIDER_LABELS]}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatNumber(stats.requests)} requests • {formatNumber(stats.tokens)} tokens
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatCurrency(stats.cost)}</p>
                    {stats.avg_response_time && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {stats.avg_response_time.toFixed(0)}ms
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Sparkles className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No AI usage this month</p>
                <p className="text-xs">Generate some insights to see your usage here!</p>
              </div>
            )}
          </div>
        </div>

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
              Recent Activity (Last 7 Days)
            </h4>
            <div className="grid grid-cols-7 gap-1">
              {usageStats.daily_breakdown.slice(-7).map((day, index) => {
                const maxCost = Math.max(...usageStats.daily_breakdown.slice(-7).map(d => d.cost));
                const height = maxCost > 0 ? (day.cost / maxCost) * 40 : 2;

                return (
                  <div key={index} className="text-center">
                    <div
                      className="bg-blue-200 rounded-sm mx-auto mb-1 tooltip-container"
                      style={{ height: `${Math.max(height, 2)}px`, width: '100%' }}
                      title={`${new Date(day.date).toLocaleDateString()}: ${formatCurrency(day.cost)}`}
                    />
                    <p className="text-xs text-gray-500">
                      {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};