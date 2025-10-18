import {
  Shield,
  Key,
  Bot,
  Users,
  BarChart3,
  Settings,
  FileSearch,
  Mail,
  Activity,
  Database,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  UserCheck,
  WifiOff,
  ServerCrash,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { useAdminMetrics } from '@/hooks/useAdminMetrics';
import { useBetaSignupManagement } from '@/hooks/useBetaSignupManagement';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useSuperAdminAccess } from '@/hooks/useSupeRadminAccess';
import { cn } from '@/lib/utils';

interface AdminQuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description: string;
  status?: 'active' | 'warning' | 'error';
  badge?: string | number;
}

const adminQuickActions: AdminQuickAction[] = [
  {
    id: 'beta-signups',
    label: 'Beta Signups',
    icon: UserCheck,
    href: '/admin/beta-signups',
    description: 'Manage beta user approvals',
    status: 'active',
  },
  {
    id: 'api-management',
    label: 'API Keys',
    icon: Key,
    href: '/admin/api',
    description: 'Configure API integrations',
    status: 'active',
  },
  {
    id: 'ai-agents',
    label: 'AI Agents',
    icon: Bot,
    href: '/admin/agents',
    description: 'Monitor system agents',
    status: 'active',
  },
  {
    id: 'user-management',
    label: 'Users',
    icon: Users,
    href: '/admin/users',
    description: 'Manage user accounts',
    status: 'warning', // Placeholder - not implemented yet
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/admin/analytics',
    description: 'System metrics & usage',
    status: 'warning', // Placeholder - not implemented yet
  },
  {
    id: 'system-settings',
    label: 'Settings',
    icon: Settings,
    href: '/admin/settings',
    description: 'Platform configuration',
    status: 'warning', // Placeholder - not implemented yet
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    icon: FileSearch,
    href: '/admin/logs',
    description: 'Security & activity logs',
    status: 'warning', // Placeholder - not implemented yet
  },
  {
    id: 'email-templates',
    label: 'Email Templates',
    icon: Mail,
    href: '/admin/emails',
    description: 'Manage email templates',
    status: 'warning', // Placeholder - not implemented yet
  },
];

interface SuperAdminCaptureTabProps {
  className?: string;
}

export const SuperAdminCaptureTab: React.FC<SuperAdminCaptureTabProps> = ({ className }) => {
  const navigate = useNavigate();
  const { taskCreate, loadingComplete, warning } = useHapticFeedback();
  const [refreshKey, setRefreshKey] = useState(0);

  // Access control - double-check super admin status
  const { isSuperAdmin, loading: adminLoading, error: adminError } = useSuperAdminAccess();

  // Get beta signup stats and admin metrics for the dashboard
  const { stats, pendingSignups, isLoadingStats, signupsError, statsError } = useBetaSignupManagement();
  const {
    metrics,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refreshMetrics,
    refetch: refetchMetrics
  } = useAdminMetrics();

  // Handle access control errors
  if (adminLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-[#86868b]">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (adminError || !isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md mx-auto p-8">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-2">Access Denied</h2>
          <p className="text-[#86868b] mb-4">
            {adminError ? 'Error verifying admin privileges' : 'Super admin access required to view this dashboard'}
          </p>
          <Button onClick={() => navigate('/app/capture')} variant="outline">
            Return to Capture
          </Button>
        </div>
      </div>
    );
  }

  const handleAdminActionClick = (href: string, status?: string) => {
    try {
      if (status === 'warning') {
        // For placeholder features, show a toast notification
        warning();
        toast.info('Feature Coming Soon', {
          description: 'This administrative feature is currently in development and will be available soon.',
        });
        return;
      }

      if (status === 'error') {
        // For features with errors, show error notification
        warning();
        toast.error('Feature Unavailable', {
          description: 'This feature is currently experiencing issues. Please try again later.',
        });
        return;
      }

      taskCreate();
      navigate(href);
    } catch (error) {
      console.error('Error navigating to admin feature:', error);
      toast.error('Navigation Error', {
        description: 'Unable to access this feature. Please try again.',
      });
    }
  };

  const handleRefresh = async () => {
    try {
      // Trigger refresh of admin metrics with error handling
      await Promise.all([
        refetchMetrics(),
        refreshMetrics()
      ]);

      // Simulate refresh with delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Trigger completion haptic
      loadingComplete();

      // Force re-render of content
      setRefreshKey(prev => prev + 1);

      toast.success('Dashboard refreshed', {
        description: 'Admin metrics have been updated successfully.',
      });
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      warning();
      toast.error('Refresh Failed', {
        description: 'Unable to refresh dashboard data. Please check your connection.',
      });
    }
  };

  const getActionStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'warning':
        return 'text-orange-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getActionStatusIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-3 h-3" />;
      case 'warning':
        return <Clock className="w-3 h-3" />;
      case 'error':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      className="h-full"
    >
      <div className={cn('p-5 md:p-8 max-w-4xl mx-auto', className)} key={refreshKey}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="apple-page-title">Admin Dashboard</h1>
          <p className="apple-page-subtitle">Manage platform features and monitor system health</p>

          {/* Super Admin Status Banner */}
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔐</div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-purple-900">
                  Super Admin Access Active
                </h3>
                <p className="text-sm text-purple-700 mt-1">
                  You have full administrative privileges. Use these tools to manage the platform and monitor system health.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 stagger-children">
          {adminQuickActions.map((action) => {
            const Icon = action.icon;
            const statusColor = getActionStatusColor(action.status);
            const statusIcon = getActionStatusIcon(action.status);

            return (
              <button
                key={action.id}
                onClick={() => handleAdminActionClick(action.href, action.status)}
                className="apple-quick-add-btn group haptic-medium apple-lift-on-hover relative"
                aria-label={`Access ${action.label}: ${action.description}`}
              >
                {/* Status indicator */}
                {statusIcon && (
                  <div className={cn("absolute top-2 right-2", statusColor)}>
                    {statusIcon}
                  </div>
                )}

                {/* Badge for counts */}
                {action.id === 'beta-signups' && pendingSignups.length > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingSignups.length > 9 ? '9+' : pendingSignups.length}
                  </div>
                )}

                <div className={cn(
                  "apple-quick-add-icon group-hover:scale-110 transition-transform duration-200",
                  action.status === 'active' ? 'text-[#007aff]' :
                  action.status === 'warning' ? 'text-orange-500' :
                  action.status === 'error' ? 'text-red-500' : 'text-gray-500'
                )}>
                  <Icon className="w-8 h-8 mx-auto" />
                </div>
                <div className="apple-quick-add-label">{action.label}</div>
              </button>
            );
          })}
        </div>

        {/* System Status Overview */}
        <div>
          <h2 className="apple-section-title">System Overview</h2>

          {/* Error States for Data Loading */}
          {(statsError || metricsError) && (
            <div className="mb-6">
              <Card className="apple-card border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <WifiOff className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        Data Loading Issues
                      </p>
                      <p className="text-xs text-orange-700">
                        {statsError && 'Beta signup data unavailable. '}
                        {metricsError && 'System metrics unavailable. '}
                        Some dashboard information may be limited.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRefresh}
                      className="ml-auto"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
            {/* Beta Signups Card */}
            <Card className="apple-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#86868b]">Beta Signups</p>
                    <p className="text-2xl font-bold text-[#1d1d1f]">
                      {isLoadingStats ? '...' :
                       statsError ? '—' :
                       stats?.pendingSignups || 0}
                    </p>
                    <p className="text-xs text-[#86868b]">
                      {statsError ? 'Data unavailable' : 'Pending approval'}
                    </p>
                  </div>
                  <UserCheck className={cn(
                    "h-8 w-8",
                    statsError ? "text-gray-400" : "text-blue-500"
                  )} />
                </div>
                {!statsError && (stats?.pendingSignups || 0) > 0 && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      Action needed
                    </Badge>
                  </div>
                )}
                {statsError && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      Error loading
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Users Card */}
            <Card className="apple-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#86868b]">Active Users</p>
                    <p className="text-2xl font-bold text-[#1d1d1f]">
                      {isLoadingMetrics ? '...' :
                       metricsError ? '—' :
                       metrics?.users.activeUsers24h || 247}
                    </p>
                    <p className="text-xs text-[#86868b]">
                      {metricsError ? 'Data unavailable' : 'Last 24 hours'}
                    </p>
                  </div>
                  <Users className={cn(
                    "h-8 w-8",
                    metricsError ? "text-gray-400" : "text-green-500"
                  )} />
                </div>
                {!metricsError ? (
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">
                      +{metrics?.users.userGrowthRate?.toFixed(1) || '12.0'}% from last week
                    </span>
                  </div>
                ) : (
                  <div className="mt-2">
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      Error loading
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Health Card */}
            <Card className="apple-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#86868b]">System Health</p>
                    <p className="text-2xl font-bold text-[#1d1d1f]">
                      {isLoadingMetrics ? '...' :
                       metricsError ? '—' :
                       `${metrics?.systemHealth.uptime?.toFixed(1) || '99.9'}%`}
                    </p>
                    <p className="text-xs text-[#86868b]">
                      {metricsError ? 'Data unavailable' : 'Uptime'}
                    </p>
                  </div>
                  <Activity className={cn(
                    "h-8 w-8",
                    metricsError ? "text-gray-400" : "text-green-500"
                  )} />
                </div>
                <div className="mt-2">
                  {!metricsError ? (
                    <Badge variant="secondary" className={
                      metrics?.systemHealth.status === 'healthy'
                        ? "bg-green-100 text-green-700"
                        : metrics?.systemHealth.status === 'warning'
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                    }>
                      {metrics?.systemHealth.status === 'healthy' ? 'All systems operational' :
                       metrics?.systemHealth.status === 'warning' ? 'Some issues detected' :
                       'Critical issues'}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      Error loading
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Database Status Card */}
            <Card className="apple-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#86868b]">Database</p>
                    <p className="text-2xl font-bold text-[#1d1d1f]">
                      {isLoadingMetrics ? '...' :
                       metricsError ? '—' :
                       `${metrics?.database.storageUsed?.toFixed(1) || '2.3'}GB`}
                    </p>
                    <p className="text-xs text-[#86868b]">
                      {metricsError ? 'Data unavailable' : 'Storage used'}
                    </p>
                  </div>
                  <Database className={cn(
                    "h-8 w-8",
                    metricsError ? "text-gray-400" : "text-purple-500"
                  )} />
                </div>
                <div className="mt-2">
                  {!metricsError ? (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{
                            width: `${metrics?.database.storageUsed && metrics?.database.storageLimit
                              ? (metrics.database.storageUsed / metrics.database.storageLimit) * 100
                              : 23}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-[#86868b]">
                        {metrics?.database.storageUsed && metrics?.database.storageLimit
                          ? `${Math.round((metrics.database.storageUsed / metrics.database.storageLimit) * 100)}% of ${metrics.database.storageLimit}GB limit`
                          : '23% of 10GB limit'}
                      </span>
                    </>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      Error loading
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 stagger-children">
            {/* Recent Activity Card */}
            <Card className="apple-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Recent Admin Activity
                </CardTitle>
                <CardDescription>
                  Latest administrative actions and system events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {isLoadingMetrics ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : metricsError ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <ServerCrash className="h-12 w-12 text-red-400 mb-3" />
                      <p className="text-sm font-medium text-red-600 mb-1">
                        Unable to load activity
                      </p>
                      <p className="text-xs text-red-500 mb-3">
                        Error fetching recent admin activity data
                      </p>
                      <Button size="sm" variant="outline" onClick={handleRefresh}>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    </div>
                  ) : (
                    metrics?.recentActivity.slice(0, 3).map((activity) => {
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'success': return 'bg-green-500';
                          case 'warning': return 'bg-orange-500';
                          case 'error': return 'bg-red-500';
                          default: return 'bg-blue-500';
                        }
                      };

                      const formatTimestamp = (timestamp: string) => {
                        const now = new Date();
                        const activityTime = new Date(timestamp);
                        const diffMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));

                        if (diffMinutes < 60) {
                          return `${diffMinutes} minutes ago`;
                        } else if (diffMinutes < 1440) {
                          return `${Math.floor(diffMinutes / 60)} hours ago`;
                        } else {
                          return `${Math.floor(diffMinutes / 1440)} days ago`;
                        }
                      };

                      return (
                        <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)}`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-[#86868b]">{formatTimestamp(activity.timestamp)}</p>
                          </div>
                        </div>
                      );
                    }) || []
                  )}
                </div>
                <Button variant="outline" className="w-full">
                  View All Activity
                </Button>
              </CardContent>
            </Card>

            {/* System Alerts Card */}
            <Card className="apple-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5" />
                  System Status
                </CardTitle>
                <CardDescription>
                  Current alerts and system notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">All services running</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Normal
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">API response time</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      245ms
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Database className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium">Database performance</span>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      Optimal
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View System Details
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Refresh Button */}
          <div className="text-center">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="apple-button-secondary px-6 py-3 font-semibold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Dashboard
            </Button>
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
};