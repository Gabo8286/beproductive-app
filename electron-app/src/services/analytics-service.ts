import { v4 as uuidv4 } from 'uuid';

export interface AnalyticsEvent {
  id: string;
  userId: string;
  sessionId: string;
  event: string;
  category: 'app' | 'feature' | 'ai' | 'project' | 'performance' | 'error';
  properties: Record<string, any>;
  timestamp: Date;
  version: string;
  platform: string;
  userAgent: string;
  buildId?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  features: string[];
  projects: number;
  aiInteractions: number;
  errors: number;
  performance: {
    appStartTime: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
}

export interface FeedbackData {
  id: string;
  userId: string;
  sessionId: string;
  type: 'bug' | 'feature' | 'improvement' | 'praise' | 'complaint';
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  screenshot?: string;
  logs?: string;
  context: {
    currentView: string;
    recentActions: string[];
    systemInfo: Record<string, any>;
  };
  timestamp: Date;
  status: 'pending' | 'reviewed' | 'implemented' | 'rejected';
  tags: string[];
}

class AnalyticsService {
  private userId: string;
  private sessionId: string;
  private session: UserSession;
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean = true;
  private offlineMode: boolean = true; // Start in offline mode for privacy

  constructor() {
    this.userId = this.getOrCreateUserId();
    this.sessionId = uuidv4();
    this.session = this.initializeSession();
    this.setupEventListeners();
  }

  private getOrCreateUserId(): string {
    let userId = localStorage.getItem('beproductive_user_id');
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem('beproductive_user_id', userId);
    }
    return userId;
  }

  private initializeSession(): UserSession {
    return {
      id: this.sessionId,
      userId: this.userId,
      startTime: new Date(),
      features: [],
      projects: 0,
      aiInteractions: 0,
      errors: 0,
      performance: {
        appStartTime: performance.now()
      }
    };
  }

  private setupEventListeners(): void {
    // Track app lifecycle
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.trackError(event.error, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(event.reason, {
        type: 'unhandled_promise_rejection',
        reason: event.reason
      });
    });

    // Track performance
    if ('performance' in window) {
      this.trackPerformance();
    }
  }

  // Core tracking methods
  track(event: string, properties: Record<string, any> = {}, category: AnalyticsEvent['category'] = 'feature'): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      id: uuidv4(),
      userId: this.userId,
      sessionId: this.sessionId,
      event,
      category,
      properties: {
        ...properties,
        sessionDuration: Date.now() - this.session.startTime.getTime()
      },
      timestamp: new Date(),
      version: '1.0.0', // Get from package.json
      platform: navigator.platform,
      userAgent: navigator.userAgent
    };

    this.events.push(analyticsEvent);
    this.updateSession(event);

    // Store locally for offline capability
    this.storeEventLocally(analyticsEvent);

    console.log('📊 Analytics:', event, properties);
  }

  // Feature usage tracking
  trackFeatureUsage(feature: string, context?: Record<string, any>): void {
    this.track(`feature_used_${feature}`, {
      feature,
      ...context
    }, 'feature');

    if (!this.session.features.includes(feature)) {
      this.session.features.push(feature);
    }
  }

  // AI interaction tracking
  trackAIInteraction(action: string, provider: string, prompt?: string, response?: string): void {
    this.session.aiInteractions++;

    this.track('ai_interaction', {
      action,
      provider,
      promptLength: prompt?.length || 0,
      responseLength: response?.length || 0,
      hasPrompt: !!prompt,
      hasResponse: !!response
    }, 'ai');
  }

  // Project tracking
  trackProjectAction(action: string, projectType: string, metadata?: Record<string, any>): void {
    this.track('project_action', {
      action,
      projectType,
      ...metadata
    }, 'project');

    if (action === 'create') {
      this.session.projects++;
    }
  }

  // Performance tracking
  private trackPerformance(): void {
    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.session.performance.memoryUsage = memory.usedJSHeapSize;
    }

    // Navigation timing
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.track('app_performance', {
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          firstPaint: this.getFirstPaint(),
          memoryUsed: this.session.performance.memoryUsage
        }, 'performance');
      }
    }, 1000);
  }

  private getFirstPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  // Error tracking
  trackError(error: Error | any, context?: Record<string, any>): void {
    this.session.errors++;

    this.track('error_occurred', {
      message: error.message || String(error),
      stack: error.stack,
      name: error.name,
      ...context
    }, 'error');
  }

  // Session management
  private updateSession(event: string): void {
    this.session.endTime = new Date();
    this.session.duration = this.session.endTime.getTime() - this.session.startTime.getTime();
  }

  private endSession(): void {
    this.updateSession('session_end');
    this.track('session_end', {
      duration: this.session.duration,
      featuresUsed: this.session.features.length,
      uniqueFeatures: this.session.features,
      projectsWorkedOn: this.session.projects,
      aiInteractions: this.session.aiInteractions,
      errorsEncountered: this.session.errors
    }, 'app');

    // Store session summary
    this.storeSessionLocally(this.session);
  }

  // Feedback system
  async submitFeedback(feedback: Omit<FeedbackData, 'id' | 'userId' | 'sessionId' | 'timestamp' | 'status'>): Promise<boolean> {
    const feedbackData: FeedbackData = {
      id: uuidv4(),
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      status: 'pending',
      ...feedback
    };

    try {
      // Store locally first
      this.storeFeedbackLocally(feedbackData);

      // Track the feedback submission
      this.track('feedback_submitted', {
        type: feedback.type,
        rating: feedback.rating,
        hasScreenshot: !!feedback.screenshot
      }, 'feature');

      return true;
    } catch (error) {
      this.trackError(error, { context: 'feedback_submission' });
      return false;
    }
  }

  // Local storage for offline capability
  private storeEventLocally(event: AnalyticsEvent): void {
    try {
      const events = this.getStoredEvents();
      events.push(event);

      // Keep only last 1000 events to prevent storage bloat
      if (events.length > 1000) {
        events.splice(0, events.length - 1000);
      }

      localStorage.setItem('beproductive_analytics_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to store analytics event locally:', error);
    }
  }

  private storeSessionLocally(session: UserSession): void {
    try {
      const sessions = this.getStoredSessions();
      sessions.push(session);

      // Keep only last 30 sessions
      if (sessions.length > 30) {
        sessions.splice(0, sessions.length - 30);
      }

      localStorage.setItem('beproductive_analytics_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.warn('Failed to store session locally:', error);
    }
  }

  private storeFeedbackLocally(feedback: FeedbackData): void {
    try {
      const feedbacks = this.getStoredFeedback();
      feedbacks.push(feedback);

      localStorage.setItem('beproductive_feedback', JSON.stringify(feedbacks));
    } catch (error) {
      console.warn('Failed to store feedback locally:', error);
    }
  }

  // Data retrieval
  getStoredEvents(): AnalyticsEvent[] {
    try {
      const events = localStorage.getItem('beproductive_analytics_events');
      return events ? JSON.parse(events) : [];
    } catch {
      return [];
    }
  }

  getStoredSessions(): UserSession[] {
    try {
      const sessions = localStorage.getItem('beproductive_analytics_sessions');
      return sessions ? JSON.parse(sessions) : [];
    } catch {
      return [];
    }
  }

  getStoredFeedback(): FeedbackData[] {
    try {
      const feedback = localStorage.getItem('beproductive_feedback');
      return feedback ? JSON.parse(feedback) : [];
    } catch {
      return [];
    }
  }

  // Usage statistics
  getUsageStats(): {
    totalSessions: number;
    totalDuration: number;
    featuresUsed: string[];
    projectsCreated: number;
    aiInteractions: number;
    averageSessionLength: number;
    mostUsedFeatures: Array<{ feature: string; count: number }>;
  } {
    const sessions = this.getStoredSessions();
    const events = this.getStoredEvents();

    const featuresUsed = events
      .filter(e => e.category === 'feature')
      .map(e => e.properties.feature)
      .filter(Boolean);

    const featureCounts = featuresUsed.reduce((acc, feature) => {
      acc[feature] = (acc[feature] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedFeatures = Object.entries(featureCounts)
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalSessions: sessions.length,
      totalDuration: sessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      featuresUsed: [...new Set(featuresUsed)],
      projectsCreated: sessions.reduce((sum, s) => sum + s.projects, 0),
      aiInteractions: sessions.reduce((sum, s) => sum + s.aiInteractions, 0),
      averageSessionLength: sessions.length > 0
        ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length
        : 0,
      mostUsedFeatures
    };
  }

  // Privacy controls
  setAnalyticsEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem('beproductive_analytics_enabled', enabled.toString());

    if (enabled) {
      this.track('analytics_enabled', {}, 'app');
    }
  }

  isAnalyticsEnabled(): boolean {
    const stored = localStorage.getItem('beproductive_analytics_enabled');
    return stored !== null ? stored === 'true' : true;
  }

  clearAllData(): void {
    localStorage.removeItem('beproductive_analytics_events');
    localStorage.removeItem('beproductive_analytics_sessions');
    localStorage.removeItem('beproductive_feedback');
    this.events = [];
    console.log('📊 All analytics data cleared');
  }

  // Export data for user
  exportUserData(): {
    userId: string;
    events: AnalyticsEvent[];
    sessions: UserSession[];
    feedback: FeedbackData[];
    stats: ReturnType<typeof this.getUsageStats>;
  } {
    return {
      userId: this.userId,
      events: this.getStoredEvents(),
      sessions: this.getStoredSessions(),
      feedback: this.getStoredFeedback(),
      stats: this.getUsageStats()
    };
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();

// Initialize analytics
analyticsService.track('app_started', {
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
  language: navigator.language,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
}, 'app');