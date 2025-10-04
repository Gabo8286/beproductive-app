// Advanced Analytics & Reporting Types

export type AnalyticsTimeframe = "1d" | "7d" | "30d" | "90d" | "1y" | "custom";
export type ReportFrequency =
  | "real_time"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly";
export type MetricType =
  | "counter"
  | "gauge"
  | "histogram"
  | "summary"
  | "rate"
  | "percentage";
export type VisualizationType =
  | "line"
  | "bar"
  | "pie"
  | "donut"
  | "area"
  | "scatter"
  | "heatmap"
  | "table"
  | "metric_card"
  | "gauge";
export type DataSource =
  | "tasks"
  | "goals"
  | "habits"
  | "integrations"
  | "ai_usage"
  | "team"
  | "processes"
  | "automation"
  | "custom";

export interface AnalyticsMetric {
  id: string;
  name: string;
  description: string;
  type: MetricType;
  data_source: DataSource;
  calculation_method: string;
  unit: string;
  format: "number" | "percentage" | "currency" | "duration" | "bytes";
  is_real_time: boolean;
  aggregation_level: "user" | "team" | "organization" | "global";
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface DataPoint {
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
  dimensions?: Record<string, string>;
}

export interface AnalyticsDataset {
  metric_id: string;
  timeframe: AnalyticsTimeframe;
  data_points: DataPoint[];
  total_count: number;
  aggregated_value: number;
  trend_direction: "up" | "down" | "stable";
  trend_percentage: number;
  last_updated: string;
}

export interface CustomDashboard {
  id: string;
  name: string;
  description: string;
  user_id: string;
  workspace_id?: string;
  is_public: boolean;
  is_template: boolean;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  refresh_interval: number; // in seconds
  created_at: string;
  updated_at: string;
  shared_with: string[];
  tags: string[];
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gap: number;
  responsive_breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export interface DashboardWidget {
  id: string;
  title: string;
  description?: string;
  type: VisualizationType;
  position: WidgetPosition;
  data_config: WidgetDataConfig;
  display_config: WidgetDisplayConfig;
  filters: WidgetFilter[];
  is_real_time: boolean;
  refresh_interval?: number;
  conditional_formatting?: ConditionalFormatting[];
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  min_width?: number;
  min_height?: number;
}

export interface WidgetDataConfig {
  metric_ids: string[];
  timeframe: AnalyticsTimeframe;
  custom_timeframe?: {
    start_date: string;
    end_date: string;
  };
  aggregation: "sum" | "avg" | "min" | "max" | "count" | "distinct";
  group_by?: string[];
  sort_by?: {
    field: string;
    direction: "asc" | "desc";
  };
  limit?: number;
}

export interface WidgetDisplayConfig {
  colors: string[];
  show_legend: boolean;
  show_grid: boolean;
  show_axes: boolean;
  show_values: boolean;
  show_trend: boolean;
  decimal_places: number;
  prefix?: string;
  suffix?: string;
  theme: "light" | "dark" | "auto";
  font_size: "small" | "medium" | "large";
}

export interface WidgetFilter {
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "greater_than"
    | "less_than"
    | "contains"
    | "in"
    | "between";
  value: any;
  is_dynamic: boolean;
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: "text" | "select" | "multi_select" | "date_range" | "number_range";
  field: string;
  options?: FilterOption[];
  default_value?: any;
  applies_to_widgets: string[];
}

export interface FilterOption {
  label: string;
  value: any;
}

export interface ConditionalFormatting {
  condition: {
    field: string;
    operator: "greater_than" | "less_than" | "equals" | "between";
    value: any;
  };
  format: {
    color?: string;
    background_color?: string;
    font_weight?: "normal" | "bold";
    icon?: string;
  };
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: "dashboard" | "scheduled_report" | "alert";
  template_data: CustomDashboard | ScheduledReport | AnalyticsAlert;
  preview_image?: string;
  popularity_score: number;
  created_by: "system" | "community" | "enterprise";
  is_verified: boolean;
  tags: string[];
  required_permissions: string[];
  estimated_setup_time_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  dashboard_id: string;
  frequency: ReportFrequency;
  schedule_config: ScheduleConfig;
  delivery_config: DeliveryConfig;
  is_active: boolean;
  last_run_at?: string;
  next_run_at: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleConfig {
  frequency: ReportFrequency;
  time_of_day?: string; // HH:mm format
  day_of_week?: number; // 0-6, Sunday = 0
  day_of_month?: number; // 1-31
  timezone: string;
  custom_cron?: string;
}

export interface DeliveryConfig {
  email_recipients: string[];
  slack_channels?: string[];
  webhook_urls?: string[];
  file_format: "pdf" | "excel" | "csv" | "png";
  include_data: boolean;
  custom_message?: string;
}

export interface AnalyticsAlert {
  id: string;
  name: string;
  description: string;
  metric_id: string;
  condition: AlertCondition;
  notification_config: AlertNotificationConfig;
  is_active: boolean;
  last_triggered_at?: string;
  trigger_count: number;
  created_at: string;
  updated_at: string;
}

export interface AlertCondition {
  type: "threshold" | "anomaly" | "trend" | "comparison";
  threshold_config?: {
    operator: "greater_than" | "less_than" | "equals";
    value: number;
    duration_minutes?: number;
  };
  anomaly_config?: {
    sensitivity: "low" | "medium" | "high";
    lookback_period_days: number;
  };
  trend_config?: {
    direction: "increasing" | "decreasing";
    percentage_change: number;
    time_window_hours: number;
  };
  comparison_config?: {
    compare_to: "previous_period" | "same_period_last_year" | "baseline";
    percentage_change: number;
  };
}

export interface AlertNotificationConfig {
  email_recipients: string[];
  slack_channels: string[];
  webhook_urls: string[];
  in_app_notification: boolean;
  notification_frequency: "immediate" | "hourly" | "daily";
  escalation_rules?: EscalationRule[];
}

export interface EscalationRule {
  delay_minutes: number;
  additional_recipients: string[];
  escalation_message?: string;
}

export interface AnalyticsExport {
  id: string;
  name: string;
  type: "dashboard" | "raw_data" | "custom_query";
  format: "pdf" | "excel" | "csv" | "json";
  timeframe: AnalyticsTimeframe;
  custom_timeframe?: {
    start_date: string;
    end_date: string;
  };
  filters: Record<string, any>;
  status: "pending" | "processing" | "completed" | "failed";
  file_url?: string;
  file_size_bytes?: number;
  progress_percentage: number;
  error_message?: string;
  requested_by: string;
  created_at: string;
  completed_at?: string;
  expires_at: string;
}

export interface PredictiveAnalytics {
  id: string;
  name: string;
  description: string;
  model_type:
    | "linear_regression"
    | "time_series"
    | "classification"
    | "clustering";
  target_metric: string;
  input_features: string[];
  prediction_horizon_days: number;
  confidence_interval: number;
  last_trained_at: string;
  model_accuracy: number;
  predictions: PredictionResult[];
  training_data_points: number;
  created_at: string;
  updated_at: string;
}

export interface PredictionResult {
  date: string;
  predicted_value: number;
  confidence_lower: number;
  confidence_upper: number;
  actual_value?: number;
  prediction_accuracy?: number;
}

export interface AnalyticsInsight {
  id: string;
  type: "trend" | "anomaly" | "correlation" | "recommendation";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  confidence_score: number;
  related_metrics: string[];
  data_sources: DataSource[];
  insight_data: {
    trend_direction?: "up" | "down" | "stable";
    percentage_change?: number;
    time_period?: string;
    correlation_coefficient?: number;
    anomaly_score?: number;
    recommendation_actions?: string[];
  };
  is_actionable: boolean;
  actions_taken?: string[];
  created_at: string;
  expires_at?: string;
}

export interface AnalyticsConfiguration {
  retention_policy: {
    raw_data_days: number;
    aggregated_data_days: number;
    report_history_days: number;
  };
  processing_config: {
    batch_size: number;
    processing_interval_minutes: number;
    parallel_workers: number;
  };
  privacy_settings: {
    anonymize_user_data: boolean;
    data_sharing_enabled: boolean;
    export_restrictions: string[];
  };
  performance_settings: {
    cache_duration_minutes: number;
    max_concurrent_queries: number;
    query_timeout_seconds: number;
  };
}

export interface AnalyticsPermissions {
  user_id: string;
  workspace_id?: string;
  permissions: {
    can_view_dashboards: boolean;
    can_create_dashboards: boolean;
    can_edit_dashboards: boolean;
    can_delete_dashboards: boolean;
    can_share_dashboards: boolean;
    can_create_reports: boolean;
    can_schedule_reports: boolean;
    can_export_data: boolean;
    can_view_raw_data: boolean;
    can_create_alerts: boolean;
    can_manage_analytics_config: boolean;
    accessible_data_sources: DataSource[];
    max_export_rows: number;
  };
}

export interface AnalyticsAuditLog {
  id: string;
  user_id: string;
  action:
    | "view_dashboard"
    | "create_dashboard"
    | "edit_dashboard"
    | "delete_dashboard"
    | "export_data"
    | "create_report"
    | "share_dashboard"
    | "create_alert";
  resource_type: "dashboard" | "report" | "alert" | "export" | "metric";
  resource_id: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

export interface AnalyticsAPIResponse<T> {
  data: T;
  metadata: {
    total_count?: number;
    page?: number;
    per_page?: number;
    execution_time_ms: number;
    cache_hit: boolean;
    data_freshness_seconds: number;
  };
  errors?: string[];
  warnings?: string[];
}

// Executive Dashboard Types
export interface ExecutiveDashboard {
  id: string;
  name: string;
  description: string;
  organization_id: string;
  executive_summary: ExecutiveSummary;
  kpi_sections: KPISection[];
  trend_analysis: TrendAnalysis[];
  comparative_analysis: ComparativeAnalysis[];
  predictive_insights: PredictiveInsight[];
  action_items: ActionItem[];
  last_updated: string;
  refresh_schedule: string;
}

export interface ExecutiveSummary {
  period: string;
  headline_metrics: {
    productivity_score: number;
    productivity_change: number;
    team_efficiency: number;
    efficiency_change: number;
    goal_completion_rate: number;
    goal_completion_change: number;
    total_users: number;
    active_users: number;
    user_growth_rate: number;
  };
  key_achievements: string[];
  areas_for_improvement: string[];
  strategic_insights: string[];
}

export interface KPISection {
  id: string;
  title: string;
  description: string;
  metrics: ExecutiveKPI[];
  visualization_type: VisualizationType;
  target_audience: "ceo" | "cto" | "coo" | "hr" | "all";
}

export interface ExecutiveKPI {
  id: string;
  name: string;
  current_value: number;
  target_value: number;
  previous_value: number;
  unit: string;
  format: string;
  trend: "up" | "down" | "stable";
  performance_rating: "excellent" | "good" | "needs_improvement" | "critical";
  benchmark_comparison?: {
    industry_average: number;
    top_quartile: number;
    percentile_rank: number;
  };
}

export interface TrendAnalysis {
  metric_name: string;
  time_series_data: DataPoint[];
  trend_summary: string;
  correlation_factors: string[];
  projected_value: number;
  confidence_level: number;
}

export interface ComparativeAnalysis {
  dimension: string;
  comparison_type: "period_over_period" | "cohort" | "segment";
  data_points: {
    label: string;
    current_period: number;
    previous_period: number;
    change_percentage: number;
  }[];
  insights: string[];
}

export interface PredictiveInsight {
  model_name: string;
  prediction_horizon: string;
  confidence_score: number;
  predicted_outcomes: {
    scenario: "optimistic" | "realistic" | "pessimistic";
    probability: number;
    description: string;
    impact_level: "low" | "medium" | "high";
  }[];
  recommended_actions: string[];
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  category: "productivity" | "efficiency" | "growth" | "risk_mitigation";
  assigned_to?: string;
  due_date?: string;
  status: "pending" | "in_progress" | "completed";
  impact_estimation: string;
  effort_estimation: string;
  created_at: string;
}
