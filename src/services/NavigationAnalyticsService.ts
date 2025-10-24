/**
 * Navigation Analytics Service
 * Comprehensive analytics system for Luna Enhanced Navigation performance monitoring
 */

import { NavigationHubId, UserRole, NavigationHub, QuickAction } from '@/types/navigation';

export interface NavigationEvent {
  id: string;
  timestamp: number;
  userId: string;
  eventType: 'hub_click' | 'quick_action' | 'gesture' | 'keyboard' | 'hover' | 'focus' | 'preload';
  hubId: NavigationHubId;
  actionId?: string;
  duration?: number;
  gestureType?: string;
  keyboardShortcut?: string;
  fromContext?: string;
  userRole: UserRole;
  sessionId: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browserInfo: string;
  performanceMetrics?: {
    loadTime?: number;
    renderTime?: number;
    interactionTime?: number;
    memoryUsage?: number;
  };
}

export interface NavigationMetrics {
  hubUsage: Record<NavigationHubId, {
    totalClicks: number;
    uniqueUsers: number;
    averageDuration: number;
    bounceRate: number;
    conversionRate: number;
    lastAccessed: number;
  }>;
  quickActionUsage: Record<string, {
    totalUses: number;
    uniqueUsers: number;
    averageCompletionTime: number;
    successRate: number;
  }>;
  gestureUsage: Record<string, {
    totalUses: number;
    successRate: number;
    averageAccuracy: number;
  }>;
  keyboardShortcuts: Record<string, {
    totalUses: number;
    averageResponseTime: number;
  }>;
  userBehavior: {
    averageSessionDuration: number;
    averageHubsPerSession: number;
    mostCommonPaths: Array<{
      path: NavigationHubId[];
      frequency: number;
      averageDuration: number;
    }>;
    peakUsageHours: number[];
    dropOffPoints: NavigationHubId[];
  };
  performance: {
    averageLoadTime: number;
    averageRenderTime: number;
    averageInteractionTime: number;
    errorRate: number;
    memoryUsage: {
      average: number;
      peak: number;
    };
  };
  accessibility: {
    screenReaderUsage: number;
    keyboardNavigationUsage: number;
    highContrastUsage: number;
    voiceControlUsage: number;
  };
  roleBasedMetrics: Record<UserRole, {
    mostUsedHubs: NavigationHubId[];
    averageTaskCompletionTime: number;
    featureAdoptionRate: number;
    customizationUsage: number;
  }>;
}

export interface AnalyticsConfig {
  enableRealTimeTracking: boolean;
  enablePerformanceMonitoring: boolean;
  enableBehaviorAnalysis: boolean;
  enableA11yTracking: boolean;
  samplingRate: number;
  retentionDays: number;
  enablePredictiveAnalytics: boolean;
  enableHeatmapGeneration: boolean;
}

class NavigationAnalyticsService {
  private events: NavigationEvent[] = [];
  private sessionEvents: Map<string, NavigationEvent[]> = new Map();
  private metrics: NavigationMetrics | null = null;
  private config: AnalyticsConfig;
  private currentSessionId: string;
  private isTracking: boolean = false;
  private performanceObserver: PerformanceObserver | null = null;

  constructor() {
    this.config = this.getDefaultConfig();
    this.currentSessionId = this.generateSessionId();
    this.initializeTracking();
    this.startPerformanceMonitoring();
  }

  private getDefaultConfig(): AnalyticsConfig {
    return {
      enableRealTimeTracking: true,
      enablePerformanceMonitoring: true,
      enableBehaviorAnalysis: true,
      enableA11yTracking: true,
      samplingRate: 1.0,
      retentionDays: 30,
      enablePredictiveAnalytics: true,
      enableHeatmapGeneration: true,
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking(): void {
    if (typeof window === 'undefined') return;

    this.isTracking = true;

    // Load persisted events
    this.loadPersistedEvents();

    // Set up session management
    this.setupSessionManagement();
  }

  private startPerformanceMonitoring(): void {
    if (typeof window === 'undefined' || !this.config.enablePerformanceMonitoring) return;

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation' || entry.entryType === 'measure') {
            this.trackPerformanceMetric(entry);
          }
        });
      });

      this.performanceObserver.observe({ entryTypes: ['navigation', 'measure'] });
    } catch (error) {
      console.warn('Performance monitoring not available:', error);
    }
  }

  private trackPerformanceMetric(entry: PerformanceEntry): void {
    // Track performance metrics for analytics
    const performanceData = {
      name: entry.name,
      duration: entry.duration,
      startTime: entry.startTime,
      timestamp: Date.now(),
    };

    // Store performance data for aggregation
    this.storePerformanceData(performanceData);
  }

  private storePerformanceData(data: any): void {
    const key = 'luna_performance_data';
    const stored = localStorage.getItem(key);
    const performanceData = stored ? JSON.parse(stored) : [];

    performanceData.push(data);

    // Keep only last 1000 entries
    if (performanceData.length > 1000) {
      performanceData.splice(0, performanceData.length - 1000);
    }

    localStorage.setItem(key, JSON.stringify(performanceData));
  }

  private loadPersistedEvents(): void {
    try {
      const stored = localStorage.getItem('luna_navigation_events');
      if (stored) {
        this.events = JSON.parse(stored);
        this.cleanupOldEvents();
      }
    } catch (error) {
      console.warn('Failed to load persisted events:', error);
    }
  }

  private persistEvents(): void {
    try {
      localStorage.setItem('luna_navigation_events', JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to persist events:', error);
    }
  }

  private cleanupOldEvents(): void {
    const cutoffTime = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
    this.events = this.events.filter(event => event.timestamp > cutoffTime);
  }

  private setupSessionManagement(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.endSession();
      } else {
        this.startNewSession();
      }
    });

    // Track beforeunload for session end
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  private startNewSession(): void {
    this.currentSessionId = this.generateSessionId();
  }

  private endSession(): void {
    this.persistEvents();
    this.generateSessionSummary();
  }

  private generateSessionSummary(): void {
    const sessionEvents = this.events.filter(e => e.sessionId === this.currentSessionId);
    if (sessionEvents.length === 0) return;

    const summary = {
      sessionId: this.currentSessionId,
      startTime: Math.min(...sessionEvents.map(e => e.timestamp)),
      endTime: Math.max(...sessionEvents.map(e => e.timestamp)),
      totalEvents: sessionEvents.length,
      uniqueHubs: new Set(sessionEvents.map(e => e.hubId)).size,
      deviceType: sessionEvents[0]?.deviceType,
      userRole: sessionEvents[0]?.userRole,
    };

    // Store session summary
    const summaries = JSON.parse(localStorage.getItem('luna_session_summaries') || '[]');
    summaries.push(summary);
    localStorage.setItem('luna_session_summaries', JSON.stringify(summaries));
  }

  public trackEvent(event: Omit<NavigationEvent, 'id' | 'timestamp' | 'sessionId'>): void {
    if (!this.isTracking || Math.random() > this.config.samplingRate) return;

    const fullEvent: NavigationEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      sessionId: this.currentSessionId,
    };

    this.events.push(fullEvent);

    // Add to session events
    if (!this.sessionEvents.has(this.currentSessionId)) {
      this.sessionEvents.set(this.currentSessionId, []);
    }
    this.sessionEvents.get(this.currentSessionId)!.push(fullEvent);

    // Persist periodically
    if (this.events.length % 50 === 0) {
      this.persistEvents();
    }

    // Real-time processing
    if (this.config.enableRealTimeTracking) {
      this.processEventRealTime(fullEvent);
    }
  }

  private processEventRealTime(event: NavigationEvent): void {
    // Real-time anomaly detection
    this.detectUsageAnomalies(event);

    // Real-time performance alerts
    if (event.performanceMetrics?.loadTime && event.performanceMetrics.loadTime > 3000) {
      this.triggerPerformanceAlert(event);
    }
  }

  private detectUsageAnomalies(event: NavigationEvent): void {
    // Detect unusual usage patterns
    const recentEvents = this.events.filter(e =>
      e.timestamp > Date.now() - 300000 && // Last 5 minutes
      e.userId === event.userId
    );

    if (recentEvents.length > 100) {
      console.warn('Unusually high activity detected for user:', event.userId);
    }
  }

  private triggerPerformanceAlert(event: NavigationEvent): void {
    console.warn('Performance threshold exceeded:', {
      hubId: event.hubId,
      loadTime: event.performanceMetrics?.loadTime,
      userRole: event.userRole,
    });
  }

  public getMetrics(): NavigationMetrics {
    if (!this.metrics || this.shouldRecalculateMetrics()) {
      this.metrics = this.calculateMetrics();
    }
    return this.metrics;
  }

  private shouldRecalculateMetrics(): boolean {
    // Recalculate every 5 minutes or when significant events accumulate
    const lastCalculation = parseInt(localStorage.getItem('luna_last_metrics_calculation') || '0');
    return Date.now() - lastCalculation > 300000 || this.events.length % 100 === 0;
  }

  private calculateMetrics(): NavigationMetrics {
    localStorage.setItem('luna_last_metrics_calculation', Date.now().toString());

    const hubIds: NavigationHubId[] = ['capture', 'planning', 'engage', 'profile', 'insights', 'admin'];
    const userRoles: UserRole[] = ['user', 'team_lead', 'admin', 'super_admin', 'enterprise'];

    return {
      hubUsage: this.calculateHubUsage(hubIds),
      quickActionUsage: this.calculateQuickActionUsage(),
      gestureUsage: this.calculateGestureUsage(),
      keyboardShortcuts: this.calculateKeyboardUsage(),
      userBehavior: this.calculateUserBehavior(),
      performance: this.calculatePerformanceMetrics(),
      accessibility: this.calculateAccessibilityMetrics(),
      roleBasedMetrics: this.calculateRoleBasedMetrics(userRoles),
    };
  }

  private calculateHubUsage(hubIds: NavigationHubId[]): NavigationMetrics['hubUsage'] {
    const usage: NavigationMetrics['hubUsage'] = {};

    hubIds.forEach(hubId => {
      const hubEvents = this.events.filter(e => e.hubId === hubId);
      const uniqueUsers = new Set(hubEvents.map(e => e.userId)).size;
      const clickEvents = hubEvents.filter(e => e.eventType === 'hub_click');

      usage[hubId] = {
        totalClicks: clickEvents.length,
        uniqueUsers,
        averageDuration: this.calculateAverageDuration(hubEvents),
        bounceRate: this.calculateBounceRate(hubId),
        conversionRate: this.calculateConversionRate(hubId),
        lastAccessed: Math.max(...hubEvents.map(e => e.timestamp), 0),
      };
    });

    return usage;
  }

  private calculateAverageDuration(events: NavigationEvent[]): number {
    const durationsWithDuration = events.filter(e => e.duration).map(e => e.duration!);
    return durationsWithDuration.length > 0
      ? durationsWithDuration.reduce((sum, d) => sum + d, 0) / durationsWithDuration.length
      : 0;
  }

  private calculateBounceRate(hubId: NavigationHubId): number {
    const sessions = Array.from(this.sessionEvents.values());
    const sessionsWithHub = sessions.filter(events =>
      events.some(e => e.hubId === hubId)
    );

    const bouncedSessions = sessionsWithHub.filter(events =>
      events.filter(e => e.eventType === 'hub_click').length === 1
    );

    return sessionsWithHub.length > 0 ? bouncedSessions.length / sessionsWithHub.length : 0;
  }

  private calculateConversionRate(hubId: NavigationHubId): number {
    const hubClicks = this.events.filter(e => e.hubId === hubId && e.eventType === 'hub_click');
    const conversions = this.events.filter(e =>
      e.hubId === hubId && e.eventType === 'quick_action'
    );

    return hubClicks.length > 0 ? conversions.length / hubClicks.length : 0;
  }

  private calculateQuickActionUsage(): NavigationMetrics['quickActionUsage'] {
    const usage: NavigationMetrics['quickActionUsage'] = {};
    const actionEvents = this.events.filter(e => e.eventType === 'quick_action' && e.actionId);

    actionEvents.forEach(event => {
      const actionId = event.actionId!;
      if (!usage[actionId]) {
        usage[actionId] = {
          totalUses: 0,
          uniqueUsers: 0,
          averageCompletionTime: 0,
          successRate: 0,
        };
      }
      usage[actionId].totalUses++;
    });

    Object.keys(usage).forEach(actionId => {
      const actionEvents = this.events.filter(e => e.actionId === actionId);
      usage[actionId].uniqueUsers = new Set(actionEvents.map(e => e.userId)).size;
      usage[actionId].averageCompletionTime = this.calculateAverageDuration(actionEvents);
      usage[actionId].successRate = 0.95; // Placeholder - would need success tracking
    });

    return usage;
  }

  private calculateGestureUsage(): NavigationMetrics['gestureUsage'] {
    const usage: NavigationMetrics['gestureUsage'] = {};
    const gestureEvents = this.events.filter(e => e.eventType === 'gesture' && e.gestureType);

    gestureEvents.forEach(event => {
      const gestureType = event.gestureType!;
      if (!usage[gestureType]) {
        usage[gestureType] = {
          totalUses: 0,
          successRate: 0,
          averageAccuracy: 0,
        };
      }
      usage[gestureType].totalUses++;
    });

    Object.keys(usage).forEach(gestureType => {
      usage[gestureType].successRate = 0.9; // Placeholder
      usage[gestureType].averageAccuracy = 0.85; // Placeholder
    });

    return usage;
  }

  private calculateKeyboardUsage(): NavigationMetrics['keyboardShortcuts'] {
    const usage: NavigationMetrics['keyboardShortcuts'] = {};
    const keyboardEvents = this.events.filter(e => e.eventType === 'keyboard' && e.keyboardShortcut);

    keyboardEvents.forEach(event => {
      const shortcut = event.keyboardShortcut!;
      if (!usage[shortcut]) {
        usage[shortcut] = {
          totalUses: 0,
          averageResponseTime: 0,
        };
      }
      usage[shortcut].totalUses++;
    });

    Object.keys(usage).forEach(shortcut => {
      const shortcutEvents = this.events.filter(e => e.keyboardShortcut === shortcut);
      usage[shortcut].averageResponseTime = this.calculateAverageDuration(shortcutEvents);
    });

    return usage;
  }

  private calculateUserBehavior(): NavigationMetrics['userBehavior'] {
    const sessions = Array.from(this.sessionEvents.values());

    return {
      averageSessionDuration: this.calculateAverageSessionDuration(sessions),
      averageHubsPerSession: this.calculateAverageHubsPerSession(sessions),
      mostCommonPaths: this.calculateMostCommonPaths(sessions),
      peakUsageHours: this.calculatePeakUsageHours(),
      dropOffPoints: this.calculateDropOffPoints(),
    };
  }

  private calculateAverageSessionDuration(sessions: NavigationEvent[][]): number {
    const durations = sessions.map(events => {
      if (events.length < 2) return 0;
      return Math.max(...events.map(e => e.timestamp)) - Math.min(...events.map(e => e.timestamp));
    });

    return durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;
  }

  private calculateAverageHubsPerSession(sessions: NavigationEvent[][]): number {
    const hubCounts = sessions.map(events =>
      new Set(events.map(e => e.hubId)).size
    );

    return hubCounts.length > 0 ? hubCounts.reduce((sum, c) => sum + c, 0) / hubCounts.length : 0;
  }

  private calculateMostCommonPaths(sessions: NavigationEvent[][]): NavigationMetrics['userBehavior']['mostCommonPaths'] {
    const pathMap = new Map<string, { count: number; totalDuration: number }>();

    sessions.forEach(events => {
      const hubSequence = events
        .filter(e => e.eventType === 'hub_click')
        .map(e => e.hubId);

      if (hubSequence.length > 1) {
        const pathKey = hubSequence.join(' -> ');
        const duration = Math.max(...events.map(e => e.timestamp)) - Math.min(...events.map(e => e.timestamp));

        if (!pathMap.has(pathKey)) {
          pathMap.set(pathKey, { count: 0, totalDuration: 0 });
        }

        const pathData = pathMap.get(pathKey)!;
        pathData.count++;
        pathData.totalDuration += duration;
      }
    });

    return Array.from(pathMap.entries())
      .map(([pathString, data]) => ({
        path: pathString.split(' -> ') as NavigationHubId[],
        frequency: data.count,
        averageDuration: data.totalDuration / data.count,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  private calculatePeakUsageHours(): number[] {
    const hourCounts = new Array(24).fill(0);

    this.events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourCounts[hour]++;
    });

    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map(item => item.hour);
  }

  private calculateDropOffPoints(): NavigationHubId[] {
    const sessions = Array.from(this.sessionEvents.values());
    const lastHubCounts: Record<NavigationHubId, number> = {
      capture: 0, planning: 0, engage: 0, profile: 0, insights: 0, admin: 0
    };

    sessions.forEach(events => {
      const hubClicks = events.filter(e => e.eventType === 'hub_click');
      if (hubClicks.length > 0) {
        const lastHub = hubClicks[hubClicks.length - 1].hubId;
        lastHubCounts[lastHub]++;
      }
    });

    return Object.entries(lastHubCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hubId]) => hubId as NavigationHubId);
  }

  private calculatePerformanceMetrics(): NavigationMetrics['performance'] {
    const performanceEvents = this.events.filter(e => e.performanceMetrics);

    if (performanceEvents.length === 0) {
      return {
        averageLoadTime: 0,
        averageRenderTime: 0,
        averageInteractionTime: 0,
        errorRate: 0,
        memoryUsage: { average: 0, peak: 0 },
      };
    }

    const loadTimes = performanceEvents
      .map(e => e.performanceMetrics?.loadTime)
      .filter(Boolean) as number[];

    const renderTimes = performanceEvents
      .map(e => e.performanceMetrics?.renderTime)
      .filter(Boolean) as number[];

    const interactionTimes = performanceEvents
      .map(e => e.performanceMetrics?.interactionTime)
      .filter(Boolean) as number[];

    const memoryUsages = performanceEvents
      .map(e => e.performanceMetrics?.memoryUsage)
      .filter(Boolean) as number[];

    return {
      averageLoadTime: loadTimes.length > 0 ? loadTimes.reduce((sum, t) => sum + t, 0) / loadTimes.length : 0,
      averageRenderTime: renderTimes.length > 0 ? renderTimes.reduce((sum, t) => sum + t, 0) / renderTimes.length : 0,
      averageInteractionTime: interactionTimes.length > 0 ? interactionTimes.reduce((sum, t) => sum + t, 0) / interactionTimes.length : 0,
      errorRate: 0, // Placeholder
      memoryUsage: {
        average: memoryUsages.length > 0 ? memoryUsages.reduce((sum, m) => sum + m, 0) / memoryUsages.length : 0,
        peak: memoryUsages.length > 0 ? Math.max(...memoryUsages) : 0,
      },
    };
  }

  private calculateAccessibilityMetrics(): NavigationMetrics['accessibility'] {
    // Placeholder implementation - would need specific accessibility tracking
    return {
      screenReaderUsage: 0,
      keyboardNavigationUsage: this.events.filter(e => e.eventType === 'keyboard').length,
      highContrastUsage: 0,
      voiceControlUsage: 0,
    };
  }

  private calculateRoleBasedMetrics(userRoles: UserRole[]): NavigationMetrics['roleBasedMetrics'] {
    const metrics: NavigationMetrics['roleBasedMetrics'] = {};

    userRoles.forEach(role => {
      const roleEvents = this.events.filter(e => e.userRole === role);
      const hubUsage = roleEvents.reduce((acc, event) => {
        acc[event.hubId] = (acc[event.hubId] || 0) + 1;
        return acc;
      }, {} as Record<NavigationHubId, number>);

      const mostUsedHubs = Object.entries(hubUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([hubId]) => hubId as NavigationHubId);

      metrics[role] = {
        mostUsedHubs,
        averageTaskCompletionTime: this.calculateAverageDuration(roleEvents),
        featureAdoptionRate: 0.75, // Placeholder
        customizationUsage: 0.60, // Placeholder
      };
    });

    return metrics;
  }

  public getHeatmapData(hubId: NavigationHubId): Array<{ x: number; y: number; intensity: number }> {
    if (!this.config.enableHeatmapGeneration) return [];

    const hubEvents = this.events.filter(e => e.hubId === hubId);
    const heatmapData: Array<{ x: number; y: number; intensity: number }> = [];

    // Simulate heatmap data based on interaction patterns
    const interactionZones = [
      { x: 50, y: 50, baseIntensity: 0.8 }, // Center
      { x: 25, y: 25, baseIntensity: 0.6 }, // Top-left
      { x: 75, y: 25, baseIntensity: 0.6 }, // Top-right
      { x: 25, y: 75, baseIntensity: 0.4 }, // Bottom-left
      { x: 75, y: 75, baseIntensity: 0.4 }, // Bottom-right
    ];

    interactionZones.forEach(zone => {
      const intensity = zone.baseIntensity * (hubEvents.length / Math.max(this.events.length, 1));
      heatmapData.push({
        x: zone.x,
        y: zone.y,
        intensity: Math.min(intensity, 1),
      });
    });

    return heatmapData;
  }

  public exportAnalytics(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics(),
      config: this.config,
      totalEvents: this.events.length,
      dateRange: {
        start: Math.min(...this.events.map(e => e.timestamp)),
        end: Math.max(...this.events.map(e => e.timestamp)),
      },
    };

    return JSON.stringify(exportData, null, 2);
  }

  public configureAnalytics(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('luna_analytics_config', JSON.stringify(this.config));
  }

  public clearAnalytics(): void {
    this.events = [];
    this.sessionEvents.clear();
    this.metrics = null;
    localStorage.removeItem('luna_navigation_events');
    localStorage.removeItem('luna_session_summaries');
    localStorage.removeItem('luna_performance_data');
  }
}

export const navigationAnalyticsService = new NavigationAnalyticsService();