// AI Agents Configuration
export interface AgentConfig {
  // Claude API Configuration
  claudeApiKey: string;
  claudeModel: string;

  // Supabase Configuration
  supabaseUrl: string;
  supabaseKey: string;
  supabaseServiceKey?: string;

  // Notification Configuration
  emailConfig?: {
    service: string;
    user: string;
    pass: string;
    recipients: string[];
  };

  slackConfig?: {
    webhookUrl: string;
    channel: string;
  };

  // Monitoring Thresholds
  thresholds: {
    responseTime: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    uptimeThreshold: number;
    alertResponseTime: number;
  };

  // Agent Intervals (in milliseconds)
  intervals: {
    monitoring: number;
    security: number;
    backup: number;
  };

  // Environment
  environment: 'development' | 'staging' | 'production';
  enableLogging: boolean;
}

export const defaultConfig: AgentConfig = {
  claudeApiKey: process.env.CLAUDE_API_KEY || '',
  claudeModel: 'claude-3-haiku-20240307',

  supabaseUrl: process.env.VITE_SUPABASE_URL || '',
  supabaseKey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  thresholds: {
    responseTime: 2000, // 2 seconds
    errorRate: 5, // 5% error rate
    cpuUsage: 80, // 80% CPU usage
    memoryUsage: 85, // 85% memory usage
    diskUsage: 90, // 90% disk usage
    uptimeThreshold: 99.9, // 99.9% uptime
    alertResponseTime: 30000, // 30 seconds
  },

  intervals: {
    monitoring: 5 * 60 * 1000, // 5 minutes
    security: 15 * 60 * 1000, // 15 minutes
    backup: 24 * 60 * 60 * 1000, // 24 hours
  },

  environment: (process.env.VITE_APP_ENVIRONMENT as any) || 'development',
  enableLogging: true,
};

export function validateConfig(config: Partial<AgentConfig>): boolean {
  const required = ['claudeApiKey', 'supabaseUrl', 'supabaseKey'];
  return required.every(key => Boolean(config[key as keyof AgentConfig]));
}

export function getConfig(): AgentConfig {
  const config = { ...defaultConfig };

  if (!validateConfig(config)) {
    throw new Error('Missing required configuration. Please check environment variables.');
  }

  return config;
}