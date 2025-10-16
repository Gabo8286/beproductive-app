import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types for admin metrics
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastCheck: string;
}

export interface DatabaseMetrics {
  storageUsed: number;
  storageLimit: number;
  connectionCount: number;
  queryPerformance: number;
}

export interface UserMetrics {
  activeUsers24h: number;
  activeUsers7d: number;
  totalUsers: number;
  newUsers24h: number;
  userGrowthRate: number;
}

export interface AdminActivity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
  status: 'success' | 'warning' | 'error';
}

export interface AdminMetrics {
  systemHealth: SystemHealth;
  database: DatabaseMetrics;
  users: UserMetrics;
  recentActivity: AdminActivity[];
  lastUpdated: string;
}

// Custom hook for admin metrics
export const useAdminMetrics = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch system health metrics
  const {
    data: metrics,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['adminMetrics', refreshKey],
    queryFn: async (): Promise<AdminMetrics> => {
      // In production, this would call your actual admin API endpoints
      // For now, we'll simulate the data with some real Supabase integration where possible

      try {
        // Get some real user statistics from the database
        const { data: userStats, error: userError } = await supabase
          .from('profiles')
          .select('created_at')
          .order('created_at', { ascending: false });

        if (userError) {
          console.warn('Could not fetch user stats:', userError);
        }

        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const recentUsers = userStats?.filter(user =>
          new Date(user.created_at) > yesterday
        ).length || 0;

        const weeklyUsers = userStats?.filter(user =>
          new Date(user.created_at) > weekAgo
        ).length || 0;

        // Calculate growth rate (simplified)
        const previousWeekUsers = userStats?.filter(user => {
          const createdAt = new Date(user.created_at);
          const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
          return createdAt > twoWeeksAgo && createdAt <= weekAgo;
        }).length || 0;

        const growthRate = previousWeekUsers > 0
          ? ((weeklyUsers - previousWeekUsers) / previousWeekUsers) * 100
          : 0;

        // Generate mock data with some real elements
        const mockMetrics: AdminMetrics = {
          systemHealth: {
            status: 'healthy',
            uptime: 99.9,
            responseTime: Math.floor(Math.random() * 100) + 200, // Random response time 200-300ms
            errorRate: Math.random() * 0.5, // Random error rate 0-0.5%
            lastCheck: new Date().toISOString(),
          },
          database: {
            storageUsed: 2.3, // GB
            storageLimit: 10, // GB
            connectionCount: Math.floor(Math.random() * 20) + 15, // 15-35 connections
            queryPerformance: Math.floor(Math.random() * 50) + 150, // 150-200ms avg query time
          },
          users: {
            activeUsers24h: Math.floor(Math.random() * 50) + 200, // 200-250 active users
            activeUsers7d: Math.floor(Math.random() * 200) + 800, // 800-1000 weekly active
            totalUsers: userStats?.length || 1247,
            newUsers24h: recentUsers,
            userGrowthRate: Math.round(growthRate * 10) / 10, // Round to 1 decimal
          },
          recentActivity: [
            {
              id: '1',
              action: 'Beta signup approved',
              user: 'Super Admin',
              timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
              details: 'Approved sarah.developer@gmail.com',
              status: 'success',
            },
            {
              id: '2',
              action: 'API key rotated',
              user: 'System',
              timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
              details: 'OpenAI API key updated',
              status: 'success',
            },
            {
              id: '3',
              action: 'System backup completed',
              user: 'System',
              timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
              details: 'Daily database backup successful',
              status: 'success',
            },
            {
              id: '4',
              action: 'Email delivery warning',
              user: 'System',
              timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
              details: 'Email service rate limit approaching',
              status: 'warning',
            },
          ],
          lastUpdated: new Date().toISOString(),
        };

        return mockMetrics;

      } catch (error) {
        console.error('Error fetching admin metrics:', error);
        throw error;
      }
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  // Manual refresh function
  const refreshMetrics = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Get formatted uptime string
  const getUptimeString = (uptime?: number) => {
    if (!uptime) return 'Unknown';
    return `${uptime.toFixed(1)}%`;
  };

  // Get system status color
  const getSystemStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get storage usage percentage
  const getStorageUsagePercentage = () => {
    if (!metrics?.database) return 0;
    return (metrics.database.storageUsed / metrics.database.storageLimit) * 100;
  };

  // Get user growth trend
  const getUserGrowthTrend = () => {
    if (!metrics?.users.userGrowthRate) return 'stable';
    if (metrics.users.userGrowthRate > 5) return 'up';
    if (metrics.users.userGrowthRate < -5) return 'down';
    return 'stable';
  };

  // Get activity status counts
  const getActivityStatusCounts = () => {
    if (!metrics?.recentActivity) return { success: 0, warning: 0, error: 0 };

    return metrics.recentActivity.reduce(
      (counts, activity) => {
        counts[activity.status]++;
        return counts;
      },
      { success: 0, warning: 0, error: 0 }
    );
  };

  return {
    // Data
    metrics,
    systemHealth: metrics?.systemHealth,
    database: metrics?.database,
    users: metrics?.users,
    recentActivity: metrics?.recentActivity || [],

    // Loading states
    isLoading,
    error,

    // Actions
    refreshMetrics,
    refetch,

    // Computed values
    uptimeString: getUptimeString(metrics?.systemHealth.uptime),
    systemStatusColor: getSystemStatusColor(metrics?.systemHealth.status),
    storageUsagePercentage: getStorageUsagePercentage(),
    userGrowthTrend: getUserGrowthTrend(),
    activityStatusCounts: getActivityStatusCounts(),

    // Flags
    hasWarnings: metrics?.recentActivity.some(a => a.status === 'warning') || false,
    hasErrors: metrics?.recentActivity.some(a => a.status === 'error') || false,
    isSystemHealthy: metrics?.systemHealth.status === 'healthy',
  };
};

// Hook for real-time system alerts
export const useSystemAlerts = () => {
  const { metrics } = useAdminMetrics();

  const alerts = [];

  // Check for various alert conditions
  if (metrics?.systemHealth.responseTime && metrics.systemHealth.responseTime > 500) {
    alerts.push({
      id: 'high-response-time',
      type: 'warning',
      message: 'High API response time detected',
      value: `${metrics.systemHealth.responseTime}ms`,
    });
  }

  if (metrics?.database.storageUsed && metrics.database.storageLimit) {
    const usage = (metrics.database.storageUsed / metrics.database.storageLimit) * 100;
    if (usage > 80) {
      alerts.push({
        id: 'high-storage-usage',
        type: usage > 90 ? 'error' : 'warning',
        message: 'High database storage usage',
        value: `${usage.toFixed(1)}%`,
      });
    }
  }

  if (metrics?.systemHealth.errorRate && metrics.systemHealth.errorRate > 1) {
    alerts.push({
      id: 'high-error-rate',
      type: 'error',
      message: 'Elevated error rate detected',
      value: `${metrics.systemHealth.errorRate.toFixed(2)}%`,
    });
  }

  return {
    alerts,
    hasAlerts: alerts.length > 0,
    criticalAlerts: alerts.filter(a => a.type === 'error'),
    warningAlerts: alerts.filter(a => a.type === 'warning'),
  };
};