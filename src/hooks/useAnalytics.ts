import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CustomDashboard,
  AnalyticsDataset,
  AnalyticsMetric,
  ScheduledReport,
  AnalyticsAlert,
  AnalyticsExport,
  PredictiveAnalytics,
  AnalyticsInsight,
  ExecutiveDashboard,
  ReportTemplate,
  AnalyticsTimeframe,
  DataSource,
  AnalyticsAPIResponse
} from '@/types/analytics';

// Mock data for development
const mockMetrics: AnalyticsMetric[] = [
  {
    id: 'metric_1',
    name: 'Task Completion Rate',
    description: 'Percentage of tasks completed on time',
    type: 'percentage',
    data_source: 'tasks',
    calculation_method: 'completed_tasks / total_tasks * 100',
    unit: '%',
    format: 'percentage',
    is_real_time: true,
    aggregation_level: 'user',
    tags: ['productivity', 'tasks', 'performance'],
    created_at: '2024-09-01T00:00:00Z',
    updated_at: '2024-10-02T12:00:00Z'
  },
  {
    id: 'metric_2',
    name: 'Goal Achievement Score',
    description: 'Overall goal completion performance',
    type: 'gauge',
    data_source: 'goals',
    calculation_method: 'weighted_average(goal_progress)',
    unit: 'score',
    format: 'number',
    is_real_time: true,
    aggregation_level: 'user',
    tags: ['goals', 'achievement', 'performance'],
    created_at: '2024-09-01T00:00:00Z',
    updated_at: '2024-10-02T12:00:00Z'
  },
  {
    id: 'metric_3',
    name: 'AI Usage Hours',
    description: 'Total hours of AI feature usage',
    type: 'counter',
    data_source: 'ai_usage',
    calculation_method: 'sum(ai_session_duration)',
    unit: 'hours',
    format: 'duration',
    is_real_time: true,
    aggregation_level: 'organization',
    tags: ['ai', 'usage', 'productivity'],
    created_at: '2024-09-01T00:00:00Z',
    updated_at: '2024-10-02T12:00:00Z'
  },
  {
    id: 'metric_4',
    name: 'Team Collaboration Index',
    description: 'Measure of team interaction and collaboration',
    type: 'summary',
    data_source: 'team',
    calculation_method: 'collaboration_score_algorithm',
    unit: 'index',
    format: 'number',
    is_real_time: false,
    aggregation_level: 'team',
    tags: ['team', 'collaboration', 'communication'],
    created_at: '2024-09-01T00:00:00Z',
    updated_at: '2024-10-02T12:00:00Z'
  }
];

const mockDashboards: CustomDashboard[] = [
  {
    id: 'dashboard_1',
    name: 'Personal Productivity Dashboard',
    description: 'Track your personal productivity metrics and goals',
    user_id: 'user_123',
    is_public: false,
    is_template: false,
    layout: {
      columns: 12,
      rows: 8,
      gap: 16,
      responsive_breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1440
      }
    },
    widgets: [
      {
        id: 'widget_1',
        title: 'Task Completion Rate',
        type: 'metric_card',
        position: { x: 0, y: 0, width: 3, height: 2 },
        data_config: {
          metric_ids: ['metric_1'],
          timeframe: '30d',
          aggregation: 'avg'
        },
        display_config: {
          colors: ['#10B981'],
          show_legend: false,
          show_grid: false,
          show_axes: false,
          show_values: true,
          show_trend: true,
          decimal_places: 1,
          suffix: '%',
          theme: 'light',
          font_size: 'large'
        },
        filters: [],
        is_real_time: true
      },
      {
        id: 'widget_2',
        title: 'Weekly Goal Progress',
        type: 'bar',
        position: { x: 3, y: 0, width: 6, height: 4 },
        data_config: {
          metric_ids: ['metric_2'],
          timeframe: '7d',
          aggregation: 'avg',
          group_by: ['day']
        },
        display_config: {
          colors: ['#3B82F6', '#8B5CF6'],
          show_legend: true,
          show_grid: true,
          show_axes: true,
          show_values: false,
          show_trend: false,
          decimal_places: 0,
          theme: 'light',
          font_size: 'medium'
        },
        filters: [],
        is_real_time: false
      }
    ],
    filters: [],
    refresh_interval: 300,
    created_at: '2024-09-15T10:30:00Z',
    updated_at: '2024-10-02T14:20:00Z',
    shared_with: [],
    tags: ['personal', 'productivity']
  }
];

const mockReportTemplates: ReportTemplate[] = [
  {
    id: 'template_1',
    name: 'Executive Summary Report',
    description: 'High-level overview of organizational productivity and performance',
    category: 'Executive',
    type: 'dashboard',
    template_data: mockDashboards[0],
    popularity_score: 95,
    created_by: 'system',
    is_verified: true,
    tags: ['executive', 'summary', 'kpi'],
    required_permissions: ['view_organization_data'],
    estimated_setup_time_minutes: 5,
    created_at: '2024-09-01T00:00:00Z',
    updated_at: '2024-10-01T12:00:00Z'
  }
];

// API functions (mock implementations)
const analyticsAPI = {
  getMetrics: async (): Promise<AnalyticsAPIResponse<AnalyticsMetric[]>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: mockMetrics,
      metadata: {
        total_count: mockMetrics.length,
        execution_time_ms: 45,
        cache_hit: false,
        data_freshness_seconds: 120
      }
    };
  },

  getMetricData: async (metricId: string, timeframe: AnalyticsTimeframe): Promise<AnalyticsAPIResponse<AnalyticsDataset>> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Generate mock data points
    const now = new Date();
    const dataPoints = [];
    const days = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dataPoints.push({
        timestamp: date.toISOString(),
        value: Math.random() * 100 + Math.sin(i * 0.1) * 20 + 50,
        metadata: { source: 'calculated' }
      });
    }

    return {
      data: {
        metric_id: metricId,
        timeframe,
        data_points: dataPoints,
        total_count: dataPoints.length,
        aggregated_value: dataPoints.reduce((sum, dp) => sum + dp.value, 0) / dataPoints.length,
        trend_direction: Math.random() > 0.5 ? 'up' : 'down',
        trend_percentage: Math.random() * 20 - 10,
        last_updated: new Date().toISOString()
      },
      metadata: {
        execution_time_ms: 120,
        cache_hit: true,
        data_freshness_seconds: 60
      }
    };
  },

  getDashboards: async (): Promise<AnalyticsAPIResponse<CustomDashboard[]>> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      data: mockDashboards,
      metadata: {
        total_count: mockDashboards.length,
        execution_time_ms: 80,
        cache_hit: false,
        data_freshness_seconds: 300
      }
    };
  },

  createDashboard: async (dashboard: Omit<CustomDashboard, 'id' | 'created_at' | 'updated_at'>): Promise<CustomDashboard> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newDashboard: CustomDashboard = {
      ...dashboard,
      id: `dashboard_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newDashboard;
  },

  updateDashboard: async (id: string, updates: Partial<CustomDashboard>): Promise<CustomDashboard> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const existing = mockDashboards.find(d => d.id === id);
    if (!existing) throw new Error('Dashboard not found');

    return {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };
  },

  deleteDashboard: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  getReportTemplates: async (): Promise<AnalyticsAPIResponse<ReportTemplate[]>> => {
    await new Promise(resolve => setTimeout(resolve, 350));
    return {
      data: mockReportTemplates,
      metadata: {
        total_count: mockReportTemplates.length,
        execution_time_ms: 60,
        cache_hit: true,
        data_freshness_seconds: 1800
      }
    };
  },

  createReport: async (report: Omit<ScheduledReport, 'id' | 'created_at' | 'updated_at'>): Promise<ScheduledReport> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return {
      ...report,
      id: `report_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  exportData: async (exportConfig: Omit<AnalyticsExport, 'id' | 'status' | 'progress_percentage' | 'created_at'>): Promise<AnalyticsExport> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      ...exportConfig,
      id: `export_${Date.now()}`,
      status: 'processing',
      progress_percentage: 0,
      created_at: new Date().toISOString()
    };
  }
};

// React Query hooks
export function useAnalyticsMetrics() {
  return useQuery({
    queryKey: ['analytics', 'metrics'],
    queryFn: analyticsAPI.getMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000 // 10 minutes
  });
}

export function useMetricData(metricId: string, timeframe: AnalyticsTimeframe) {
  return useQuery({
    queryKey: ['analytics', 'metric-data', metricId, timeframe],
    queryFn: () => analyticsAPI.getMetricData(metricId, timeframe),
    enabled: !!metricId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000 // 5 minutes
  });
}

export function useAnalyticsDashboards() {
  return useQuery({
    queryKey: ['analytics', 'dashboards'],
    queryFn: analyticsAPI.getDashboards,
    staleTime: 5 * 60 * 1000
  });
}

export function useCreateDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analyticsAPI.createDashboard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboards'] });
    }
  });
}

export function useUpdateDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CustomDashboard> }) =>
      analyticsAPI.updateDashboard(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboards'] });
    }
  });
}

export function useDeleteDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analyticsAPI.deleteDashboard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboards'] });
    }
  });
}

export function useReportTemplates() {
  return useQuery({
    queryKey: ['analytics', 'report-templates'],
    queryFn: analyticsAPI.getReportTemplates,
    staleTime: 15 * 60 * 1000 // 15 minutes
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analyticsAPI.createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'reports'] });
    }
  });
}

export function useExportData() {
  return useMutation({
    mutationFn: analyticsAPI.exportData
  });
}

// Real-time analytics hook
export function useRealTimeMetrics(metricIds: string[], refreshInterval = 30000) {
  return useQuery({
    queryKey: ['analytics', 'real-time', metricIds],
    queryFn: async () => {
      const results = await Promise.all(
        metricIds.map(id => analyticsAPI.getMetricData(id, '1d'))
      );
      return results.map(r => r.data);
    },
    enabled: metricIds.length > 0,
    refetchInterval: refreshInterval,
    staleTime: 0 // Always fetch fresh data for real-time
  });
}

// Analytics insights hook
export function useAnalyticsInsights() {
  return useQuery({
    queryKey: ['analytics', 'insights'],
    queryFn: async (): Promise<AnalyticsInsight[]> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return [
        {
          id: 'insight_1',
          type: 'trend',
          title: 'Task Completion Rate Improving',
          description: 'Your task completion rate has increased by 15% over the last 30 days',
          severity: 'medium',
          confidence_score: 0.87,
          related_metrics: ['metric_1'],
          data_sources: ['tasks'],
          insight_data: {
            trend_direction: 'up',
            percentage_change: 15,
            time_period: 'last_30_days'
          },
          is_actionable: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'insight_2',
          type: 'anomaly',
          title: 'Unusual AI Usage Spike',
          description: 'AI feature usage has increased by 200% this week, indicating high adoption',
          severity: 'low',
          confidence_score: 0.92,
          related_metrics: ['metric_3'],
          data_sources: ['ai_usage'],
          insight_data: {
            anomaly_score: 0.95,
            percentage_change: 200
          },
          is_actionable: false,
          created_at: new Date().toISOString()
        }
      ];
    },
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
}

// Predictive analytics hook
export function usePredictiveAnalytics(metricId: string) {
  return useQuery({
    queryKey: ['analytics', 'predictions', metricId],
    queryFn: async (): Promise<PredictiveAnalytics> => {
      await new Promise(resolve => setTimeout(resolve, 1200));

      const predictions = [];
      const today = new Date();
      for (let i = 1; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        predictions.push({
          date: date.toISOString(),
          predicted_value: Math.random() * 20 + 70 + Math.sin(i * 0.2) * 10,
          confidence_lower: Math.random() * 10 + 60,
          confidence_upper: Math.random() * 10 + 85
        });
      }

      return {
        id: `prediction_${metricId}`,
        name: 'Productivity Forecast',
        description: '30-day productivity prediction based on historical data',
        model_type: 'time_series',
        target_metric: metricId,
        input_features: ['historical_performance', 'seasonal_patterns', 'workload_trends'],
        prediction_horizon_days: 30,
        confidence_interval: 0.85,
        last_trained_at: new Date().toISOString(),
        model_accuracy: 0.89,
        predictions,
        training_data_points: 1000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    },
    enabled: !!metricId,
    staleTime: 60 * 60 * 1000 // 1 hour
  });
}