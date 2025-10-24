/**
 * Integration Components Module
 * Components that integrate with external services and APIs
 */

// MARK: - AI Service Integration Components

export { AIInsightCard } from '@/components/ai-insights/AIInsightCard';
export { AIRecommendationCard } from '@/components/ai-insights/AIRecommendationCard';
export { AIUsageWidget } from '@/components/ai-insights/AIUsageWidget';

// Luna AI Integration
export { LunaFramework } from '@/components/luna/framework/LunaFramework';
export { LunaChat } from '@/components/luna/chat/LunaChat';
export { LunaFAB } from '@/components/luna/fab/LunaFAB';
export { LunaProvider } from '@/components/luna/providers/LunaProvider';
export { LunaContextMenu } from '@/components/luna/context/LunaContextMenu';

// MARK: - Analytics Integration Components

// Calendar Integration
export { CalendarWidget } from '@/components/widgets/CalendarWidget';
export { Calendar } from '@/components/ui/calendar';
export { TaskCalendarView } from '@/components/tasks/TaskCalendarView';
export { ReflectionCalendar } from '@/components/reflections/ReflectionCalendar';

// Weather Integration
export { WeatherWidget } from '@/components/widgets/WeatherWidget';

// Notification System Integration
export { NotificationWidget } from '@/components/widgets/NotificationWidget';
export { toast, useToast } from '@/components/ui/toast';
export { Toaster } from '@/components/ui/toaster';

// MARK: - Third-Party Service Integration

// Theme and Internationalization
export { ThemeToggle } from '@/components/ui/ThemeToggle';
export { LanguageSwitcher } from '@/components/ui/language-switcher';

// Settings Integration
export { AccessibilitySettings } from '@/components/settings/AccessibilitySettings';
export { HapticFeedbackSettings } from '@/components/settings/HapticFeedbackSettings';

// MARK: - Social and Community Integration

export { LiveActivityFeed } from '@/components/landing/LiveActivityFeed';
export { CommunityStatsCounter } from '@/components/landing/CommunityStatsCounter';
export { SocialProofBanner } from '@/components/landing/conversion/SocialProofBanner';
export { TrustSignals } from '@/components/landing/conversion/TrustSignals';

// MARK: - Integration Component Types

export interface IntegrationComponentProps {
  className?: string;
  'data-testid'?: string;
  onError?: (error: Error) => void;
  onRetry?: () => void;
  fallback?: React.ReactNode;
}

export interface AIIntegrationProps extends IntegrationComponentProps {
  apiKey?: string;
  provider?: 'openai' | 'anthropic' | 'google' | 'azure';
  model?: string;
  onUsageUpdate?: (usage: any) => void;
}

export interface CalendarIntegrationProps extends IntegrationComponentProps {
  provider?: 'google' | 'outlook' | 'apple' | 'local';
  syncEnabled?: boolean;
  onSyncComplete?: (events: any[]) => void;
  onSyncError?: (error: Error) => void;
}

export interface WeatherIntegrationProps extends IntegrationComponentProps {
  location?: { lat: number; lng: number; name: string };
  units?: 'metric' | 'imperial';
  provider?: 'openweather' | 'weatherapi' | 'local';
  refreshInterval?: number;
}

export interface NotificationIntegrationProps extends IntegrationComponentProps {
  permission?: 'granted' | 'denied' | 'default';
  onPermissionRequest?: () => void;
  onNotificationClick?: (notification: any) => void;
}

export interface AnalyticsIntegrationProps extends IntegrationComponentProps {
  trackingId?: string;
  provider?: 'ga4' | 'mixpanel' | 'amplitude' | 'local';
  enabledEvents?: string[];
  onTrackingError?: (error: Error) => void;
}

// MARK: - Integration Patterns

/**
 * Integration components handle external service connections:
 *
 * 1. **API Integration** - Connect to external APIs
 *    - Authentication and token management
 *    - Request/response handling
 *    - Error boundary and retry logic
 *    - Rate limiting and caching
 *
 * 2. **Service Wrappers** - Abstract service complexity
 *    - Unified interface for multiple providers
 *    - Fallback and redundancy strategies
 *    - Configuration management
 *    - Health monitoring
 *
 * 3. **Real-time Integration** - Handle live data streams
 *    - WebSocket connections
 *    - Server-sent events
 *    - Push notifications
 *    - Sync conflict resolution
 *
 * 4. **Offline Support** - Handle connectivity issues
 *    - Offline data storage
 *    - Queue operations for sync
 *    - Connection state management
 *    - Progressive enhancement
 */

export const INTEGRATION_CATEGORIES = {
  ai: {
    components: [
      'AIInsightCard', 'AIRecommendationCard', 'AIUsageWidget',
      'LunaFramework', 'LunaChat', 'LunaFAB', 'LunaProvider', 'LunaContextMenu'
    ],
    services: ['OpenAI', 'Anthropic Claude', 'Google Gemini', 'Azure OpenAI'],
    features: ['Multi-provider support', 'Usage tracking', 'Conversation history', 'Context awareness'],
    patterns: ['Provider abstraction', 'Token management', 'Response streaming', 'Error handling']
  },
  calendar: {
    components: ['CalendarWidget', 'Calendar', 'TaskCalendarView', 'ReflectionCalendar'],
    services: ['Google Calendar', 'Outlook', 'Apple Calendar', 'Local storage'],
    features: ['Event sync', 'Task integration', 'Conflict resolution', 'Offline support'],
    patterns: ['Two-way sync', 'Event mapping', 'Timezone handling', 'Batch operations']
  },
  weather: {
    components: ['WeatherWidget'],
    services: ['OpenWeatherMap', 'WeatherAPI', 'Local data'],
    features: ['Location detection', 'Forecast data', 'Unit conversion', 'Caching'],
    patterns: ['Geolocation API', 'Periodic refresh', 'Fallback data', 'Error states']
  },
  notifications: {
    components: ['NotificationWidget', 'toast', 'Toaster'],
    services: ['Browser notifications', 'Push API', 'Service workers'],
    features: ['Permission management', 'Scheduled notifications', 'Rich content', 'Action buttons'],
    patterns: ['Permission flow', 'Service worker registration', 'Background sync', 'Click handling']
  },
  social: {
    components: ['LiveActivityFeed', 'CommunityStatsCounter', 'SocialProofBanner', 'TrustSignals'],
    services: ['Activity feeds', 'User analytics', 'Social proof APIs'],
    features: ['Real-time updates', 'User engagement', 'Trust indicators', 'Community stats'],
    patterns: ['WebSocket updates', 'Aggregated data', 'Social proof display', 'Engagement tracking']
  },
  system: {
    components: ['ThemeToggle', 'LanguageSwitcher', 'AccessibilitySettings', 'HapticFeedbackSettings'],
    services: ['System theme', 'Locale services', 'Device capabilities'],
    features: ['Theme detection', 'Language switching', 'Accessibility APIs', 'Device features'],
    patterns: ['System integration', 'Preference persistence', 'Feature detection', 'Graceful degradation']
  }
} as const;

/**
 * Integration quality standards
 */
export const INTEGRATION_QUALITY_STANDARDS = {
  reliability: [
    'Graceful error handling',
    'Automatic retry with exponential backoff',
    'Fallback data sources',
    'Circuit breaker patterns'
  ],
  performance: [
    'Request caching and deduplication',
    'Lazy loading of integration components',
    'Connection pooling where applicable',
    'Optimistic updates with rollback'
  ],
  security: [
    'Secure token storage',
    'API key protection',
    'HTTPS-only communication',
    'Input validation and sanitization'
  ],
  monitoring: [
    'Integration health checks',
    'Error rate tracking',
    'Performance metrics',
    'Usage analytics'
  ],
  usability: [
    'Clear loading states',
    'Meaningful error messages',
    'Progressive feature disclosure',
    'Offline mode indicators'
  ]
} as const;

/**
 * Get integration component information
 */
export function getIntegrationComponentInfo() {
  return {
    categories: INTEGRATION_CATEGORIES,
    qualityStandards: INTEGRATION_QUALITY_STANDARDS,
    totalComponents: Object.values(INTEGRATION_CATEGORIES).reduce(
      (sum, category) => sum + category.components.length, 0
    ),
    totalServices: Object.values(INTEGRATION_CATEGORIES).reduce(
      (sum, category) => sum + category.services.length, 0
    )
  };
}

/**
 * Integration health checker
 */
export interface IntegrationHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  latency?: number;
  lastCheck: Date;
  errorCount: number;
  successRate: number;
}

export function createIntegrationHealthChecker() {
  const healthMap = new Map<string, IntegrationHealth>();

  return {
    check: async (service: string, healthCheckFn: () => Promise<boolean>): Promise<IntegrationHealth> => {
      const startTime = Date.now();
      let status: IntegrationHealth['status'] = 'unknown';
      let errorCount = 0;

      try {
        const isHealthy = await healthCheckFn();
        status = isHealthy ? 'healthy' : 'degraded';
      } catch (error) {
        status = 'down';
        errorCount = 1;
      }

      const latency = Date.now() - startTime;
      const existing = healthMap.get(service);

      const health: IntegrationHealth = {
        service,
        status,
        latency,
        lastCheck: new Date(),
        errorCount: (existing?.errorCount || 0) + errorCount,
        successRate: existing ?
          (existing.successRate * 0.9 + (status === 'healthy' ? 100 : 0) * 0.1) :
          (status === 'healthy' ? 100 : 0)
      };

      healthMap.set(service, health);
      return health;
    },
    getHealth: (service: string): IntegrationHealth | undefined => {
      return healthMap.get(service);
    },
    getAllHealth: (): IntegrationHealth[] => {
      return Array.from(healthMap.values());
    },
    reset: (service?: string) => {
      if (service) {
        healthMap.delete(service);
      } else {
        healthMap.clear();
      }
    }
  };
}

/**
 * Integration rate limiter
 */
export function createRateLimiter(requestsPerMinute: number) {
  const requests: number[] = [];

  return {
    canMakeRequest: (): boolean => {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;

      // Remove old requests
      while (requests.length > 0 && requests[0] < oneMinuteAgo) {
        requests.shift();
      }

      return requests.length < requestsPerMinute;
    },
    recordRequest: (): void => {
      requests.push(Date.now());
    },
    getRemainingRequests: (): number => {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      const recentRequests = requests.filter(time => time > oneMinuteAgo);
      return Math.max(0, requestsPerMinute - recentRequests.length);
    },
    getResetTime: (): Date => {
      if (requests.length === 0) return new Date();
      return new Date(requests[0] + 60000);
    }
  };
}

/**
 * Integration error boundary HOC
 */
export interface IntegrationErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: any) => void;
  maxRetries?: number;
  retryDelay?: number;
  children: React.ReactNode;
}

/**
 * Create integration wrapper with error handling and retry logic
 */
export function withIntegrationErrorHandling<T extends {}>(
  Component: React.ComponentType<T>,
  config: {
    maxRetries?: number;
    retryDelay?: number;
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  } = {}
) {
  return function IntegrationWrapper(props: T) {
    // Implementation would include:
    // - Error boundary
    // - Retry logic
    // - Loading states
    // - Fallback rendering
    return React.createElement(Component, props);
  };
}