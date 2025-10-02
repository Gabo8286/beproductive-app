import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Key,
  Activity,
  DollarSign,
  Users,
  AlertTriangle,
  Settings,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  Shield
} from 'lucide-react';
import { withSuperAdminAccess } from '@/hooks/useSupeRadminAccess';
import { APIKeyManagement } from './APIKeyManagement';
import { SystemLimitsConfig } from './SystemLimitsConfig';
import { UsageAnalytics } from './UsageAnalytics';
import { SystemConfig } from './SystemConfig';

interface DashboardStats {
  totalApiKeys: number;
  activeApiKeys: number;
  monthlySpend: number;
  monthlyRequests: number;
  totalUsers: number;
  alertCount: number;
}

interface TrendData {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

const APIManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - will be replaced with real API calls
  const stats: DashboardStats = {
    totalApiKeys: 8,
    activeApiKeys: 6,
    monthlySpend: 247.32,
    monthlyRequests: 15420,
    totalUsers: 156,
    alertCount: 2,
  };

  const trends: Record<string, TrendData> = {
    spend: { value: 247.32, change: 12.5, trend: 'up' },
    requests: { value: 15420, change: -5.2, trend: 'down' },
    users: { value: 156, change: 8.3, trend: 'up' },
  };

  const renderTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4" />;
  };

  const renderTrendBadge = (change: number, trend: 'up' | 'down' | 'stable') => {
    const color = trend === 'up' ? 'bg-green-50 text-green-700' :
                  trend === 'down' ? 'bg-red-50 text-red-700' :
                  'bg-gray-50 text-gray-700';

    return (
      <Badge variant="secondary" className={color}>
        {change > 0 ? '+' : ''}{change.toFixed(1)}%
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Management</h1>
          <p className="text-gray-600 mt-1">
            Manage API connections, monitor usage, and control costs across the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add API Key
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="limits">System Limits</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Alert Banner */}
          {stats.alertCount > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-amber-800 font-medium">
                      {stats.alertCount} cost alert{stats.alertCount > 1 ? 's' : ''} require attention
                    </p>
                    <p className="text-amber-700 text-sm">
                      Some API keys are approaching their monthly limits
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto">
                    View Alerts
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Keys</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.activeApiKeys}/{stats.totalApiKeys}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active / Total keys
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${trends.spend.value.toFixed(2)}</div>
                <div className="flex items-center gap-2 mt-1">
                  {renderTrendIcon(trends.spend.trend)}
                  {renderTrendBadge(trends.spend.change, trends.spend.trend)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Requests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {trends.requests.value.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {renderTrendIcon(trends.requests.trend)}
                  {renderTrendBadge(trends.requests.change, trends.requests.trend)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trends.users.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  {renderTrendIcon(trends.users.trend)}
                  {renderTrendBadge(trends.users.change, trends.users.trend)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest API usage and system events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">OpenAI API key rotated</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Claude usage limit warning</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New API key created</p>
                      <p className="text-xs text-gray-500">3 hours ago</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View All Activity
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Health
                </CardTitle>
                <CardDescription>
                  System security status and health metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">All systems operational</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">API keys encrypted</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      6/6
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-sm font-medium">Keys need rotation</span>
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      2
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View Security Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api-keys">
          <APIKeyManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <UsageAnalytics />
        </TabsContent>

        <TabsContent value="limits">
          <SystemLimitsConfig />
        </TabsContent>

        <TabsContent value="config">
          <SystemConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withSuperAdminAccess(APIManagementDashboard);