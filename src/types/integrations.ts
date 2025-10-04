// Enterprise Integration Types
export type IntegrationType =
  | 'slack'
  | 'microsoft_teams'
  | 'google_workspace'
  | 'outlook'
  | 'jira'
  | 'trello'
  | 'asana'
  | 'notion'
  | 'discord'
  | 'zoom'
  | 'calendly'
  | 'github'
  | 'gitlab'
  | 'custom_api'
  | 'webhook'
  | 'zapier'
  | 'power_automate';

export type IntegrationStatus = 'active' | 'inactive' | 'error' | 'pending' | 'expired';
export type SyncFrequency = 'real_time' | 'every_minute' | 'every_5_minutes' | 'every_15_minutes' | 'hourly' | 'daily' | 'manual';
export type AuthType = 'oauth2' | 'api_key' | 'basic_auth' | 'bearer_token' | 'webhook' | 'sso';

export interface IntegrationProvider {
  id: IntegrationType;
  name: string;
  description: string;
  category: 'communication' | 'productivity' | 'development' | 'calendar' | 'storage' | 'custom';
  icon_url: string;
  documentation_url: string;
  auth_type: AuthType;
  supported_features: IntegrationFeature[];
  rate_limits: {
    requests_per_minute: number;
    requests_per_hour: number;
    requests_per_day: number;
  };
  webhooks_supported: boolean;
  real_time_sync: boolean;
  bi_directional: boolean;
  enterprise_features: string[];
  pricing_tier: 'free' | 'premium' | 'enterprise';
}

export interface IntegrationFeature {
  id: string;
  name: string;
  description: string;
  supported_actions: string[];
  supported_triggers: string[];
  data_mapping: Record<string, any>;
  requires_premium: boolean;
}

export interface Integration {
  id: string;
  user_id: string;
  workspace_id: string;
  provider_id: IntegrationType;
  name: string;
  description?: string;
  status: IntegrationStatus;
  auth_data: IntegrationAuth;
  configuration: IntegrationConfig;
  sync_settings: SyncSettings;
  last_sync_at?: string;
  last_error?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  usage_stats: IntegrationUsageStats;
}

export interface IntegrationAuth {
  auth_type: AuthType;
  access_token?: string;
  refresh_token?: string;
  api_key?: string;
  client_id?: string;
  client_secret?: string;
  webhook_secret?: string;
  scopes: string[];
  expires_at?: string;
  user_info?: {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
  };
}

export interface IntegrationConfig {
  enabled_features: string[];
  field_mappings: FieldMapping[];
  filters: IntegrationFilter[];
  transformations: DataTransformation[];
  error_handling: ErrorHandlingConfig;
  notification_settings: NotificationConfig;
}

export interface FieldMapping {
  source_field: string;
  target_field: string;
  transformation?: string;
  required: boolean;
  default_value?: any;
}

export interface IntegrationFilter {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  case_sensitive?: boolean;
}

export interface DataTransformation {
  field: string;
  type: 'format_date' | 'uppercase' | 'lowercase' | 'trim' | 'replace' | 'custom_function';
  parameters: Record<string, any>;
}

export interface ErrorHandlingConfig {
  retry_attempts: number;
  retry_delay_seconds: number;
  ignore_errors: boolean;
  fallback_action?: string;
  alert_on_failure: boolean;
}

export interface NotificationConfig {
  success_notifications: boolean;
  error_notifications: boolean;
  daily_summary: boolean;
  webhook_url?: string;
  email_notifications: boolean;
}

export interface SyncSettings {
  frequency: SyncFrequency;
  direction: 'inbound' | 'outbound' | 'bi_directional';
  auto_sync: boolean;
  batch_size: number;
  last_sync_token?: string;
  sync_history_retention_days: number;
}

export interface IntegrationUsageStats {
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  last_24h_syncs: number;
  data_transferred_mb: number;
  api_calls_this_month: number;
  rate_limit_hits: number;
  average_sync_time_ms: number;
}

export interface WebhookEndpoint {
  id: string;
  integration_id: string;
  url: string;
  secret: string;
  events: string[];
  status: 'active' | 'inactive' | 'failed';
  last_triggered_at?: string;
  success_count: number;
  failure_count: number;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: string;
  integration_id: string;
  sync_type: 'manual' | 'scheduled' | 'webhook' | 'real_time';
  direction: 'inbound' | 'outbound';
  status: 'success' | 'partial' | 'failed';
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  records_processed: number;
  records_successful: number;
  records_failed: number;
  error_message?: string;
  metadata: Record<string, any>;
}

export interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  provider_id: IntegrationType;
  category: string;
  use_case: string;
  popularity_score: number;
  configuration_template: Partial<IntegrationConfig>;
  required_features: string[];
  setup_instructions: string[];
  estimated_setup_time_minutes: number;
  created_by: 'system' | 'community' | 'enterprise';
  is_verified: boolean;
  tags: string[];
}

export interface IntegrationMarketplace {
  featured_integrations: IntegrationProvider[];
  popular_templates: IntegrationTemplate[];
  recent_integrations: Integration[];
  categories: {
    id: string;
    name: string;
    description: string;
    integration_count: number;
  }[];
  usage_statistics: {
    total_active_integrations: number;
    most_popular_providers: Array<{
      provider_id: IntegrationType;
      user_count: number;
    }>;
    sync_volume_24h: number;
  };
}

export interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oidc' | 'oauth2' | 'ldap';
  domain: string;
  configuration: SSOConfig;
  status: 'active' | 'inactive' | 'testing';
  user_count: number;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SSOConfig {
  issuer_url?: string;
  client_id?: string;
  client_secret?: string;
  authorization_url?: string;
  token_url?: string;
  userinfo_url?: string;
  jwks_url?: string;
  scopes: string[];
  attribute_mapping: {
    email: string;
    name: string;
    groups?: string;
    department?: string;
    title?: string;
  };
  auto_provisioning: boolean;
  default_role: string;
  group_role_mapping: Record<string, string>;
}

export interface EnterpriseRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  is_system_role: boolean;
  user_count: number;
  integration_access: {
    allowed_providers: IntegrationType[];
    max_integrations: number;
    can_create_custom: boolean;
    webhook_access: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
  conditions?: Record<string, any>;
}

export interface IntegrationAnalytics {
  overview: {
    total_integrations: number;
    active_integrations: number;
    total_syncs_today: number;
    success_rate: number;
    data_volume_mb: number;
  };
  by_provider: Array<{
    provider_id: IntegrationType;
    integration_count: number;
    sync_count: number;
    success_rate: number;
    avg_response_time_ms: number;
  }>;
  usage_trends: Array<{
    date: string;
    sync_count: number;
    success_rate: number;
    data_volume_mb: number;
    api_calls: number;
  }>;
  error_analysis: Array<{
    error_type: string;
    count: number;
    affected_integrations: string[];
    first_occurrence: string;
    last_occurrence: string;
  }>;
}

export interface CustomIntegration {
  id: string;
  name: string;
  description: string;
  api_base_url: string;
  auth_config: IntegrationAuth;
  endpoints: CustomEndpoint[];
  data_schema: Record<string, any>;
  test_connection_endpoint: string;
  documentation: string;
  version: string;
  created_by: string;
  is_public: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface CustomEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters: EndpointParameter[];
  headers: Record<string, string>;
  request_body_schema?: Record<string, any>;
  response_schema?: Record<string, any>;
  rate_limit?: number;
  requires_auth: boolean;
}

export interface EndpointParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required: boolean;
  description: string;
  default_value?: any;
  validation_rules?: Record<string, any>;
}