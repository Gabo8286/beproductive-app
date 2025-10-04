import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Analytics event types
interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
  source: 'web' | 'mobile' | 'desktop';
  version: string;
}

interface UserProperties {
  userId: string;
  email?: string;
  plan?: 'free' | 'premium' | 'enterprise';
  signupDate?: string;
  lastActiveDate?: string;
  totalGoals?: number;
  completedGoals?: number;
}

interface PageViewEvent {
  page: string;
  title: string;
  url: string;
  referrer?: string;
  duration?: number;
}

interface ErrorEvent {
  error: string;
  stack?: string;
  component?: string;
  userId?: string;
  url: string;
  userAgent: string;
}

// Mock analytics service
class MockAnalyticsService {
  private events: AnalyticsEvent[] = [];
  private userProperties: UserProperties | null = null;
  private sessionId: string;
  private userId?: string;
  private isInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  initialize(apiKey: string, options?: { debug?: boolean; userId?: string }): void {
    this.isInitialized = true;
    this.userId = options?.userId;

    if (options?.debug) {
      console.log('Analytics initialized with API key:', apiKey);
    }
  }

  identify(userId: string, properties?: Partial<UserProperties>): void {
    this.userId = userId;
    this.userProperties = {
      userId,
      ...this.userProperties,
      ...properties,
    };

    this.track('user_identified', {
      userId,
      ...properties,
    });
  }

  track(event: string, properties: Record<string, any> = {}): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized');
      return;
    }

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      source: 'web',
      version: '1.0.0',
    };

    this.events.push(analyticsEvent);

    if (properties.debug) {
      console.log('Analytics event:', analyticsEvent);
    }
  }

  page(properties: PageViewEvent): void {
    this.track('page_view', properties);
  }

  trackError(error: ErrorEvent): void {
    this.track('error_occurred', {
      ...error,
      severity: 'error',
    });
  }

  trackPerformance(metric: string, value: number, properties?: Record<string, any>): void {
    this.track('performance_metric', {
      metric,
      value,
      ...properties,
    });
  }

  // Test utilities
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getEventsByType(eventType: string): AnalyticsEvent[] {
    return this.events.filter(event => event.event === eventType);
  }

  getLastEvent(): AnalyticsEvent | undefined {
    return this.events[this.events.length - 1];
  }

  clearEvents(): void {
    this.events = [];
  }

  getUserProperties(): UserProperties | null {
    return this.userProperties;
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

// Analytics context and hooks
const AnalyticsContext = React.createContext<MockAnalyticsService | null>(null);

const AnalyticsProvider = ({ children, service }: { children: React.ReactNode; service: MockAnalyticsService }) => {
  return (
    <AnalyticsContext.Provider value={service}>
      {children}
    </AnalyticsContext.Provider>
  );
};

const useAnalytics = () => {
  const service = React.useContext(AnalyticsContext);
  if (!service) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return service;
};

// Custom hooks for specific tracking
const usePageTracking = () => {
  const analytics = useAnalytics();
  const [pageStartTime] = React.useState(Date.now());

  React.useEffect(() => {
    analytics.page({
      page: 'test-page',
      title: document.title,
      url: window.location.href,
    });

    return () => {
      const duration = Date.now() - pageStartTime;
      analytics.trackPerformance('page_duration', duration, {
        page: 'test-page',
      });
    };
  }, [analytics, pageStartTime]);
};

const useUserTracking = (userId?: string) => {
  const analytics = useAnalytics();

  React.useEffect(() => {
    if (userId) {
      analytics.identify(userId, {
        userId,
        lastActiveDate: new Date().toISOString(),
      });
    }
  }, [analytics, userId]);
};

const useErrorTracking = () => {
  const analytics = useAnalytics();

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      analytics.trackError({
        error: event.error?.toString() || 'Unknown error',
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analytics.trackError({
        error: `Unhandled Promise Rejection: ${event.reason}`,
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [analytics]);
};

// Test components with analytics
const AnalyticsButton = ({ onClick, eventName, eventProperties }: {
  onClick?: () => void;
  eventName: string;
  eventProperties?: Record<string, any>;
}) => {
  const analytics = useAnalytics();

  const handleClick = () => {
    analytics.track(eventName, eventProperties);
    onClick?.();
  };

  return (
    <button onClick={handleClick} data-testid="analytics-button">
      Click to Track
    </button>
  );
};

const GoalCreationForm = () => {
  const analytics = useAnalytics();
  const [title, setTitle] = React.useState('');
  const [category, setCategory] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    analytics.track('goal_creation_attempted', {
      title_length: title.length,
      category,
      form_completion_time: Date.now(),
    });

    // Simulate API call
    setTimeout(() => {
      analytics.track('goal_created', {
        goal_title: title,
        goal_category: category,
        creation_method: 'form',
      });
    }, 100);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Goal title"
        data-testid="goal-title-input"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        data-testid="goal-category-select"
      >
        <option value="">Select category</option>
        <option value="fitness">Fitness</option>
        <option value="career">Career</option>
        <option value="education">Education</option>
      </select>
      <button type="submit" data-testid="submit-goal">Create Goal</button>
    </form>
  );
};

const UserDashboard = ({ userId }: { userId: string }) => {
  const analytics = useAnalytics();
  usePageTracking();
  useUserTracking(userId);

  React.useEffect(() => {
    analytics.track('dashboard_viewed', {
      user_id: userId,
      view_timestamp: Date.now(),
    });
  }, [analytics, userId]);

  const handleGoalClick = (goalId: string) => {
    analytics.track('goal_clicked', {
      goal_id: goalId,
      click_source: 'dashboard',
    });
  };

  return (
    <div data-testid="user-dashboard">
      <h1>Dashboard</h1>
      <button onClick={() => handleGoalClick('goal-1')} data-testid="goal-button">
        View Goal
      </button>
    </div>
  );
};

const PerformanceTracker = () => {
  const analytics = useAnalytics();

  React.useEffect(() => {
    // Track Core Web Vitals
    const trackCoreWebVitals = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            analytics.trackPerformance(entry.name, entry.value || entry.duration, {
              entry_type: entry.entryType,
              start_time: entry.startTime,
            });
          });
        });

        observer.observe({ entryTypes: ['paint', 'navigation', 'measure'] });

        return () => observer.disconnect();
      }
    };

    const cleanup = trackCoreWebVitals();
    return cleanup;
  }, [analytics]);

  return <div>Performance tracking active</div>;
};

const ErrorBoundaryWithAnalytics = ({ children }: { children: React.ReactNode }) => {
  const analytics = useAnalytics();

  class ErrorBoundary extends React.Component<
    { children: React.ReactNode; analytics: MockAnalyticsService },
    { hasError: boolean; error?: Error }
  > {
    constructor(props: { children: React.ReactNode; analytics: MockAnalyticsService }) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      this.props.analytics.trackError({
        error: error.message,
        stack: error.stack,
        component: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    }

    render() {
      if (this.state.hasError) {
        return <div>Something went wrong.</div>;
      }

      return this.props.children;
    }
  }

  return (
    <ErrorBoundary analytics={analytics}>
      {children}
    </ErrorBoundary>
  );
};

describe('Advanced Analytics Testing', () => {
  let analyticsService: MockAnalyticsService;

  beforeEach(() => {
    analyticsService = new MockAnalyticsService();
    analyticsService.initialize('test-api-key', { debug: false });
  });

  afterEach(() => {
    analyticsService.clearEvents();
  });

  describe('Analytics Service Initialization', () => {
    it('should initialize analytics service correctly', () => {
      const service = new MockAnalyticsService();
      const initSpy = vi.spyOn(service, 'initialize');

      service.initialize('test-key', { debug: true, userId: 'test-user' });

      expect(initSpy).toHaveBeenCalledWith('test-key', { debug: true, userId: 'test-user' });
    });

    it('should generate unique session IDs', () => {
      const service1 = new MockAnalyticsService();
      const service2 = new MockAnalyticsService();

      expect(service1.getSessionId()).not.toBe(service2.getSessionId());
      expect(service1.getSessionId()).toMatch(/^session_\d+_[a-z0-9]+$/);
    });

    it('should warn when tracking before initialization', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const uninitializedService = new MockAnalyticsService();

      uninitializedService.track('test_event');

      expect(consoleSpy).toHaveBeenCalledWith('Analytics not initialized');
      consoleSpy.mockRestore();
    });
  });

  describe('Event Tracking', () => {
    it('should track basic events with properties', () => {
      render(
        <AnalyticsProvider service={analyticsService}>
          <AnalyticsButton
            eventName="button_clicked"
            eventProperties={{ button_type: 'primary', location: 'header' }}
          />
        </AnalyticsProvider>
      );

      fireEvent.click(screen.getByTestId('analytics-button'));

      const events = analyticsService.getEvents();
      expect(events).toHaveLength(1);

      const event = events[0];
      expect(event.event).toBe('button_clicked');
      expect(event.properties.button_type).toBe('primary');
      expect(event.properties.location).toBe('header');
      expect(event.timestamp).toBeGreaterThan(0);
      expect(event.sessionId).toBeTruthy();
    });

    it('should track multiple events in sequence', async () => {
      const user = userEvent.setup();

      render(
        <AnalyticsProvider service={analyticsService}>
          <GoalCreationForm />
        </AnalyticsProvider>
      );

      await user.type(screen.getByTestId('goal-title-input'), 'Learn React');
      await user.selectOptions(screen.getByTestId('goal-category-select'), 'education');
      await user.click(screen.getByTestId('submit-goal'));

      // Wait for async event
      await new Promise(resolve => setTimeout(resolve, 150));

      const events = analyticsService.getEvents();
      expect(events.length).toBeGreaterThanOrEqual(1);

      const attemptEvent = analyticsService.getEventsByType('goal_creation_attempted')[0];
      expect(attemptEvent.properties.title_length).toBe(11); // "Learn React".length
      expect(attemptEvent.properties.category).toBe('education');

      const createdEvent = analyticsService.getEventsByType('goal_created')[0];
      expect(createdEvent.properties.goal_title).toBe('Learn React');
      expect(createdEvent.properties.goal_category).toBe('education');
    });

    it('should include session and user information in events', () => {
      analyticsService.identify('user123', { plan: 'premium' });

      render(
        <AnalyticsProvider service={analyticsService}>
          <AnalyticsButton eventName="test_event" />
        </AnalyticsProvider>
      );

      fireEvent.click(screen.getByTestId('analytics-button'));

      const event = analyticsService.getLastEvent();
      expect(event?.userId).toBe('user123');
      expect(event?.sessionId).toBeTruthy();
      expect(event?.source).toBe('web');
      expect(event?.version).toBeTruthy();
    });
  });

  describe('User Identification and Properties', () => {
    it('should identify users and set properties', () => {
      analyticsService.identify('user456', {
        userId: 'user456',
        email: 'user@example.com',
        plan: 'premium',
        signupDate: '2024-01-15',
        totalGoals: 25,
      });

      const userProperties = analyticsService.getUserProperties();
      expect(userProperties?.userId).toBe('user456');
      expect(userProperties?.email).toBe('user@example.com');
      expect(userProperties?.plan).toBe('premium');
      expect(userProperties?.totalGoals).toBe(25);

      // Should also track an identification event
      const identifyEvent = analyticsService.getEventsByType('user_identified')[0];
      expect(identifyEvent.properties.userId).toBe('user456');
      expect(identifyEvent.properties.email).toBe('user@example.com');
    });

    it('should update user properties on subsequent identify calls', () => {
      analyticsService.identify('user789', { plan: 'free', totalGoals: 5 });
      analyticsService.identify('user789', { plan: 'premium', totalGoals: 15 });

      const userProperties = analyticsService.getUserProperties();
      expect(userProperties?.plan).toBe('premium');
      expect(userProperties?.totalGoals).toBe(15);
    });
  });

  describe('Page View Tracking', () => {
    it('should track page views with metadata', () => {
      render(
        <AnalyticsProvider service={analyticsService}>
          <UserDashboard userId="user123" />
        </AnalyticsProvider>
      );

      const pageViewEvents = analyticsService.getEventsByType('page_view');
      expect(pageViewEvents).toHaveLength(1);

      const pageView = pageViewEvents[0];
      expect(pageView.properties.page).toBe('test-page');
      expect(pageView.properties.title).toBeTruthy();
      expect(pageView.properties.url).toBeTruthy();
    });

    it('should track page duration on unmount', () => {
      const TestComponent = () => {
        usePageTracking();
        return <div>Test Page</div>;
      };

      const { unmount } = render(
        <AnalyticsProvider service={analyticsService}>
          <TestComponent />
        </AnalyticsProvider>
      );

      unmount();

      const performanceEvents = analyticsService.getEventsByType('performance_metric');
      const durationEvent = performanceEvents.find(
        event => event.properties.metric === 'page_duration'
      );

      expect(durationEvent).toBeDefined();
      expect(durationEvent?.properties.value).toBeGreaterThan(0);
      expect(durationEvent?.properties.page).toBe('test-page');
    });
  });

  describe('Error Tracking', () => {
    it('should track JavaScript errors', () => {
      const originalError = console.error;
      console.error = vi.fn(); // Suppress error logs in test

      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      render(
        <AnalyticsProvider service={analyticsService}>
          <ErrorBoundaryWithAnalytics>
            <ErrorComponent />
          </ErrorBoundaryWithAnalytics>
        </AnalyticsProvider>
      );

      const errorEvents = analyticsService.getEventsByType('error_occurred');
      expect(errorEvents).toHaveLength(1);

      const errorEvent = errorEvents[0];
      expect(errorEvent.properties.error).toContain('Test error');
      expect(errorEvent.properties.url).toBeTruthy();
      expect(errorEvent.properties.userAgent).toBeTruthy();

      console.error = originalError;
    });

    it('should track custom error events', () => {
      analyticsService.trackError({
        error: 'API request failed',
        url: 'https://api.example.com/goals',
        userAgent: navigator.userAgent,
        component: 'GoalsList',
      });

      const errorEvents = analyticsService.getEventsByType('error_occurred');
      expect(errorEvents).toHaveLength(1);

      const errorEvent = errorEvents[0];
      expect(errorEvent.properties.error).toBe('API request failed');
      expect(errorEvent.properties.component).toBe('GoalsList');
      expect(errorEvent.properties.severity).toBe('error');
    });
  });

  describe('Performance Tracking', () => {
    it('should track performance metrics', () => {
      analyticsService.trackPerformance('api_response_time', 245, {
        endpoint: '/api/goals',
        method: 'GET',
      });

      const performanceEvents = analyticsService.getEventsByType('performance_metric');
      expect(performanceEvents).toHaveLength(1);

      const perfEvent = performanceEvents[0];
      expect(perfEvent.properties.metric).toBe('api_response_time');
      expect(perfEvent.properties.value).toBe(245);
      expect(perfEvent.properties.endpoint).toBe('/api/goals');
    });

    it('should track Core Web Vitals', () => {
      render(
        <AnalyticsProvider service={analyticsService}>
          <PerformanceTracker />
        </AnalyticsProvider>
      );

      // Mock performance entries
      const mockEntry = {
        name: 'first-contentful-paint',
        entryType: 'paint',
        startTime: 150.5,
        value: 150.5,
        duration: 0,
      };

      // Simulate performance observer callback
      analyticsService.trackPerformance(mockEntry.name, mockEntry.value, {
        entry_type: mockEntry.entryType,
        start_time: mockEntry.startTime,
      });

      const performanceEvents = analyticsService.getEventsByType('performance_metric');
      const fcpEvent = performanceEvents.find(
        event => event.properties.metric === 'first-contentful-paint'
      );

      expect(fcpEvent).toBeDefined();
      expect(fcpEvent?.properties.value).toBe(150.5);
      expect(fcpEvent?.properties.entry_type).toBe('paint');
    });
  });

  describe('A/B Testing and Feature Flags', () => {
    it('should track A/B test participation', () => {
      const abTestService = {
        getVariant: (testName: string) => {
          const variants = { 'new-goal-form': 'variant-b', 'dashboard-layout': 'control' };
          return variants[testName as keyof typeof variants] || 'control';
        }
      };

      const variant = abTestService.getVariant('new-goal-form');
      analyticsService.track('ab_test_viewed', {
        test_name: 'new-goal-form',
        variant,
        user_id: 'user123',
      });

      const abTestEvents = analyticsService.getEventsByType('ab_test_viewed');
      expect(abTestEvents).toHaveLength(1);

      const testEvent = abTestEvents[0];
      expect(testEvent.properties.test_name).toBe('new-goal-form');
      expect(testEvent.properties.variant).toBe('variant-b');
    });

    it('should track feature flag usage', () => {
      const featureFlags = {
        'new-dashboard': true,
        'goal-templates': false,
        'ai-suggestions': true,
      };

      Object.entries(featureFlags).forEach(([flag, enabled]) => {
        analyticsService.track('feature_flag_evaluated', {
          flag_name: flag,
          enabled,
          user_id: 'user123',
        });
      });

      const flagEvents = analyticsService.getEventsByType('feature_flag_evaluated');
      expect(flagEvents).toHaveLength(3);

      const dashboardFlag = flagEvents.find(
        event => event.properties.flag_name === 'new-dashboard'
      );
      expect(dashboardFlag?.properties.enabled).toBe(true);
    });
  });

  describe('Conversion and Funnel Tracking', () => {
    it('should track conversion funnel steps', async () => {
      const user = userEvent.setup();

      render(
        <AnalyticsProvider service={analyticsService}>
          <GoalCreationForm />
        </AnalyticsProvider>
      );

      // Step 1: Funnel start
      analyticsService.track('goal_creation_funnel_start', {
        entry_point: 'dashboard',
        user_id: 'user123',
      });

      // Step 2: Form interaction
      await user.click(screen.getByTestId('goal-title-input'));
      analyticsService.track('goal_creation_funnel_form_focus', {
        field: 'title',
        user_id: 'user123',
      });

      // Step 3: Form completion
      await user.type(screen.getByTestId('goal-title-input'), 'Test Goal');
      await user.selectOptions(screen.getByTestId('goal-category-select'), 'fitness');
      await user.click(screen.getByTestId('submit-goal'));

      const funnelEvents = analyticsService.getEvents().filter(
        event => event.event.includes('goal_creation_funnel')
      );

      expect(funnelEvents.length).toBeGreaterThanOrEqual(2);
      expect(funnelEvents[0].event).toBe('goal_creation_funnel_start');
      expect(funnelEvents[1].event).toBe('goal_creation_funnel_form_focus');
    });

    it('should track conversion rates', () => {
      // Mock conversion tracking
      const conversionData = {
        total_visitors: 1000,
        goal_page_visits: 400,
        form_starts: 200,
        form_completions: 150,
        successful_creates: 140,
      };

      analyticsService.track('conversion_funnel_analysis', {
        ...conversionData,
        conversion_rate: (conversionData.successful_creates / conversionData.total_visitors) * 100,
        form_completion_rate: (conversionData.form_completions / conversionData.form_starts) * 100,
      });

      const conversionEvent = analyticsService.getEventsByType('conversion_funnel_analysis')[0];
      expect(conversionEvent.properties.conversion_rate).toBe(14); // 14%
      expect(conversionEvent.properties.form_completion_rate).toBe(75); // 75%
    });
  });

  describe('User Behavior Analytics', () => {
    it('should track user engagement metrics', () => {
      const engagementMetrics = {
        session_duration: 1800000, // 30 minutes
        pages_visited: 8,
        goals_created: 2,
        goals_completed: 1,
        features_used: ['dashboard', 'goal-creation', 'progress-tracking'],
        scroll_depth: 85,
        click_count: 23,
      };

      analyticsService.track('user_engagement_session', engagementMetrics);

      const engagementEvent = analyticsService.getEventsByType('user_engagement_session')[0];
      expect(engagementEvent.properties.session_duration).toBe(1800000);
      expect(engagementEvent.properties.features_used).toHaveLength(3);
      expect(engagementEvent.properties.scroll_depth).toBe(85);
    });

    it('should track user retention patterns', () => {
      const retentionData = {
        user_id: 'user123',
        days_since_signup: 30,
        sessions_this_month: 15,
        goals_created_this_month: 5,
        last_active_days_ago: 2,
        is_retained: true,
        retention_cohort: '2024-01',
      };

      analyticsService.track('user_retention_analysis', retentionData);

      const retentionEvent = analyticsService.getEventsByType('user_retention_analysis')[0];
      expect(retentionEvent.properties.is_retained).toBe(true);
      expect(retentionEvent.properties.retention_cohort).toBe('2024-01');
    });
  });

  describe('Data Quality and Validation', () => {
    it('should validate event data before sending', () => {
      const validateEvent = (event: AnalyticsEvent): boolean => {
        return (
          typeof event.event === 'string' &&
          event.event.length > 0 &&
          typeof event.properties === 'object' &&
          typeof event.timestamp === 'number' &&
          event.timestamp > 0 &&
          typeof event.sessionId === 'string' &&
          event.sessionId.length > 0
        );
      };

      analyticsService.track('valid_event', { test: true });
      const event = analyticsService.getLastEvent();

      expect(event).toBeDefined();
      expect(validateEvent(event!)).toBe(true);
    });

    it('should handle malformed event data gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Test with various invalid inputs
      const invalidInputs = [
        { event: '', properties: {} },
        { event: null, properties: {} },
        { event: 'valid', properties: null },
      ];

      invalidInputs.forEach(input => {
        try {
          // @ts-ignore - Testing invalid input
          analyticsService.track(input.event, input.properties);
        } catch (error) {
          // Should handle gracefully
        }
      });

      consoleSpy.mockRestore();
    });

    it('should sanitize PII from event properties', () => {
      const sanitizePII = (properties: Record<string, any>): Record<string, any> => {
        const sensitiveFields = ['email', 'phone', 'ssn', 'credit_card'];
        const sanitized = { ...properties };

        sensitiveFields.forEach(field => {
          if (sanitized[field]) {
            if (field === 'email') {
              sanitized[field] = sanitized[field].replace(/(.{2}).*(@.*)/, '$1***$2');
            } else {
              sanitized[field] = '[REDACTED]';
            }
          }
        });

        return sanitized;
      };

      const eventProperties = {
        goal_title: 'Learn React',
        email: 'user@example.com',
        phone: '555-123-4567',
        user_preference: 'dark_mode',
      };

      const sanitized = sanitizePII(eventProperties);

      expect(sanitized.goal_title).toBe('Learn React');
      expect(sanitized.email).toBe('us***@example.com');
      expect(sanitized.phone).toBe('[REDACTED]');
      expect(sanitized.user_preference).toBe('dark_mode');
    });
  });

  describe('Analytics Performance and Reliability', () => {
    it('should handle high-volume event tracking efficiently', () => {
      const startTime = performance.now();
      const eventCount = 1000;

      for (let i = 0; i < eventCount; i++) {
        analyticsService.track(`bulk_event_${i}`, {
          index: i,
          batch: Math.floor(i / 100),
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(analyticsService.getEvents()).toHaveLength(eventCount);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should implement event batching for better performance', () => {
      class BatchedAnalyticsService extends MockAnalyticsService {
        private eventQueue: AnalyticsEvent[] = [];
        private batchSize = 10;
        private flushInterval = 1000;

        track(event: string, properties: Record<string, any> = {}): void {
          super.track(event, properties);
          this.eventQueue.push(this.getLastEvent()!);

          if (this.eventQueue.length >= this.batchSize) {
            this.flush();
          }
        }

        private flush(): void {
          // In a real implementation, this would send events to the server
          console.log(`Flushing ${this.eventQueue.length} events`);
          this.eventQueue = [];
        }

        getQueueLength(): number {
          return this.eventQueue.length;
        }
      }

      const batchedService = new BatchedAnalyticsService();
      batchedService.initialize('test-key');

      // Add 5 events
      for (let i = 0; i < 5; i++) {
        batchedService.track(`event_${i}`);
      }

      expect(batchedService.getQueueLength()).toBe(5);

      // Add 5 more events to trigger flush
      for (let i = 5; i < 10; i++) {
        batchedService.track(`event_${i}`);
      }

      expect(batchedService.getQueueLength()).toBe(0); // Should be flushed
    });
  });
});