import type { Database } from "@/integrations/supabase/types";

// Extract enums from database types
export type APIProviderType = Database["public"]["Enums"]["api_provider_type"];
export type APIKeyStatus = Database["public"]["Enums"]["api_key_status"];

// Main API Key interface
export interface APIKey {
  id: string;
  provider: APIProviderType;
  key_name: string;
  encrypted_key: string;
  key_hash: string;
  status: APIKeyStatus;

  // Usage limits and monitoring
  monthly_limit_usd: number;
  current_month_cost: number;
  total_lifetime_cost: number;

  // Request limits
  daily_request_limit: number;
  current_day_requests: number;

  // Token limits
  monthly_token_limit: number;
  current_month_tokens: number;

  // Provider-specific configuration
  model_name?: string;
  api_version?: string;
  base_url?: string;
  additional_headers: Record<string, any>;
  provider_config: Record<string, any>;

  // Security and auditing
  created_by?: string;
  last_used_at?: string;
  last_rotated_at?: string;
  expires_at?: string;

  // Metadata
  description?: string;
  tags: string[];
  metadata: Record<string, any>;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// System-wide limits configuration
export interface APISystemLimits {
  id: string;
  provider: APIProviderType;

  // Global limits
  global_monthly_limit_usd: number;
  global_daily_request_limit: number;
  global_monthly_token_limit: number;

  // Per-user default limits
  default_user_monthly_limit_usd: number;
  default_user_daily_request_limit: number;
  default_user_monthly_token_limit: number;

  // Rate limiting
  requests_per_minute: number;
  requests_per_hour: number;

  // Provider status
  is_enabled: boolean;
  maintenance_mode: boolean;
  maintenance_message?: string;

  // Cost management
  cost_per_1k_tokens: number;
  cost_multiplier: number;

  // Metadata
  metadata: Record<string, any>;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Usage analytics interface
export interface APIUsageAnalytics {
  id: string;
  api_key_id?: string;
  user_id?: string;
  provider: APIProviderType;

  // Request details
  endpoint?: string;
  method: string;
  model_name?: string;

  // Usage metrics
  tokens_prompt: number;
  tokens_completion: number;
  tokens_total: number;
  estimated_cost: number;

  // Performance metrics
  response_time_ms?: number;
  request_size_bytes?: number;
  response_size_bytes?: number;

  // Success/failure tracking
  success: boolean;
  error_code?: string;
  error_message?: string;

  // Request metadata
  user_agent?: string;
  ip_address?: string;
  request_metadata: Record<string, any>;

  // Timestamps
  requested_at: string;
}

// Audit log interface
export interface APIKeyAuditLog {
  id: string;
  api_key_id?: string;
  action:
    | "created"
    | "updated"
    | "activated"
    | "deactivated"
    | "rotated"
    | "revoked"
    | "expired"
    | "limit_exceeded";

  // Audit details
  performed_by?: string;
  old_values: Record<string, any>;
  new_values: Record<string, any>;

  // Context
  reason?: string;
  user_agent?: string;
  ip_address?: string;

  // Timestamps
  created_at: string;
}

// System configuration interface
export interface APISystemConfig {
  id: string;
  config_key: string;
  config_value: any;
  description?: string;
  is_encrypted: boolean;

  // Access control
  access_level: "super_admin" | "admin";

  // Metadata
  created_by?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Request/Response interfaces for API operations

export interface CreateAPIKeyRequest {
  provider: APIProviderType;
  key_name: string;
  api_key: string; // Plain text key to be encrypted
  description?: string;
  model_name?: string;
  api_version?: string;
  base_url?: string;
  additional_headers?: Record<string, any>;
  provider_config?: Record<string, any>;
  monthly_limit_usd?: number;
  daily_request_limit?: number;
  monthly_token_limit?: number;
  tags?: string[];
  expires_at?: string;
}

export interface UpdateAPIKeyRequest {
  key_name?: string;
  description?: string;
  status?: APIKeyStatus;
  monthly_limit_usd?: number;
  daily_request_limit?: number;
  monthly_token_limit?: number;
  model_name?: string;
  api_version?: string;
  base_url?: string;
  additional_headers?: Record<string, any>;
  provider_config?: Record<string, any>;
  tags?: string[];
  expires_at?: string;
}

export interface RotateAPIKeyRequest {
  new_api_key: string; // Plain text key to be encrypted
  reason?: string;
}

// Analytics and reporting interfaces

export interface UsageStatsFilter {
  provider?: APIProviderType;
  api_key_id?: string;
  user_id?: string;
  date_from?: Date;
  date_to?: Date;
  success_only?: boolean;
}

export interface UsageStats {
  total_cost: number;
  total_tokens: number;
  total_requests: number;
  unique_users: number;
  success_rate: number;
  avg_response_time?: number;
  by_provider: Record<
    APIProviderType,
    {
      cost: number;
      tokens: number;
      requests: number;
      users: number;
    }
  >;
  by_model?: Record<
    string,
    {
      cost: number;
      tokens: number;
      requests: number;
    }
  >;
}

export interface APIKeyUsageStats {
  total_cost: number;
  total_tokens: number;
  total_requests: number;
  success_rate: number;
  avg_response_time: number;
  daily_usage: Array<{
    date: string;
    cost: number;
    tokens: number;
    requests: number;
  }>;
  hourly_usage: Array<{
    hour: number;
    requests: number;
  }>;
}

export interface CostAlert {
  api_key_id: string;
  provider: APIProviderType;
  key_name: string;
  current_cost: number;
  limit: number;
  percentage_used: number;
  alert_type: "warning" | "critical" | "exceeded";
}

export interface SystemHealthMetrics {
  total_api_keys: number;
  active_api_keys: number;
  total_monthly_cost: number;
  total_monthly_requests: number;
  total_monthly_tokens: number;
  provider_health: Record<
    APIProviderType,
    {
      status: "healthy" | "warning" | "critical";
      cost_usage_percentage: number;
      request_usage_percentage: number;
      token_usage_percentage: number;
      error_rate: number;
    }
  >;
  cost_alerts: CostAlert[];
  recent_errors: Array<{
    provider: APIProviderType;
    error_message: string;
    count: number;
    last_occurred: string;
  }>;
}

// Provider configuration templates
export interface ProviderConfig {
  provider: APIProviderType;
  display_name: string;
  default_model?: string;
  available_models: string[];
  base_url?: string;
  api_version?: string;
  required_headers: string[];
  cost_per_1k_tokens: number;
  supports_streaming: boolean;
  max_tokens_per_request: number;
  rate_limits: {
    requests_per_minute: number;
    requests_per_hour: number;
    requests_per_day: number;
  };
}

// Dashboard view models
export interface APIDashboardData {
  system_health: SystemHealthMetrics;
  usage_stats: UsageStats;
  recent_activity: APIUsageAnalytics[];
  cost_trends: Array<{
    date: string;
    cost: number;
    requests: number;
    tokens: number;
  }>;
  top_users: Array<{
    user_id: string;
    user_name: string;
    cost: number;
    requests: number;
    tokens: number;
  }>;
}

// Provider configuration constants
export const PROVIDER_CONFIGS: Record<APIProviderType, ProviderConfig> = {
  openai: {
    provider: "openai",
    display_name: "OpenAI",
    default_model: "gpt-4",
    available_models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
    base_url: "https://api.openai.com/v1",
    required_headers: ["Authorization"],
    cost_per_1k_tokens: 0.03,
    supports_streaming: true,
    max_tokens_per_request: 4096,
    rate_limits: {
      requests_per_minute: 60,
      requests_per_hour: 3600,
      requests_per_day: 86400,
    },
  },
  claude: {
    provider: "claude",
    display_name: "Anthropic Claude",
    default_model: "claude-3-sonnet",
    available_models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    base_url: "https://api.anthropic.com/v1",
    api_version: "2023-06-01",
    required_headers: ["Authorization", "anthropic-version"],
    cost_per_1k_tokens: 0.015,
    supports_streaming: true,
    max_tokens_per_request: 4096,
    rate_limits: {
      requests_per_minute: 60,
      requests_per_hour: 3600,
      requests_per_day: 86400,
    },
  },
  gemini: {
    provider: "gemini",
    display_name: "Google Gemini",
    default_model: "gemini-pro",
    available_models: ["gemini-pro", "gemini-pro-vision"],
    base_url: "https://generativelanguage.googleapis.com/v1",
    required_headers: ["Authorization"],
    cost_per_1k_tokens: 0.001,
    supports_streaming: true,
    max_tokens_per_request: 4096,
    rate_limits: {
      requests_per_minute: 60,
      requests_per_hour: 3600,
      requests_per_day: 86400,
    },
  },
  lovable: {
    provider: "lovable",
    display_name: "Lovable AI",
    default_model: "lovable-v1",
    available_models: ["lovable-v1"],
    required_headers: ["Authorization"],
    cost_per_1k_tokens: 0.002,
    supports_streaming: false,
    max_tokens_per_request: 2048,
    rate_limits: {
      requests_per_minute: 30,
      requests_per_hour: 1800,
      requests_per_day: 43200,
    },
  },
  custom: {
    provider: "custom",
    display_name: "Custom Provider",
    available_models: [],
    required_headers: ["Authorization"],
    cost_per_1k_tokens: 0.01,
    supports_streaming: false,
    max_tokens_per_request: 4096,
    rate_limits: {
      requests_per_minute: 60,
      requests_per_hour: 3600,
      requests_per_day: 86400,
    },
  },
};

export const API_KEY_STATUS_LABELS: Record<APIKeyStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  revoked: "Revoked",
  expired: "Expired",
};

export const PROVIDER_LABELS: Record<APIProviderType, string> = {
  openai: "OpenAI",
  claude: "Anthropic Claude",
  gemini: "Google Gemini",
  lovable: "Lovable AI",
  custom: "Custom Provider",
};
