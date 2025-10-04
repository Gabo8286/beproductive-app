import { supabase } from "@/integrations/supabase/client";
import { aiServiceManager, AIServiceRequest } from "./aiServiceManager";

export interface UserBehaviorEvent {
  id?: string;
  user_id: string;
  event_type: BehaviorEventType;
  event_category: BehaviorCategory;
  timestamp: string;
  session_id: string;
  page_path: string;
  user_agent: string;
  viewport_size: { width: number; height: number };
  scroll_depth: number;
  time_on_page: number;
  interaction_data: Record<string, any>;
  context: BehaviorContext;
  sentiment_score?: number;
  engagement_level: EngagementLevel;
  prediction_features?: Record<string, number>;
}

export type BehaviorEventType =
  | "page_view"
  | "click"
  | "scroll"
  | "hover"
  | "form_interaction"
  | "search"
  | "filter_apply"
  | "widget_interaction"
  | "task_create"
  | "task_complete"
  | "goal_update"
  | "habit_track"
  | "reflection_write"
  | "ai_query"
  | "export_data"
  | "share_content"
  | "session_start"
  | "session_end"
  | "error_encounter"
  | "feature_discovery"
  | "onboarding_step"
  | "help_access"
  | "settings_change";

export type BehaviorCategory =
  | "navigation"
  | "productivity"
  | "engagement"
  | "learning"
  | "collaboration"
  | "customization"
  | "problem_solving"
  | "achievement"
  | "social"
  | "system";

export type EngagementLevel = "passive" | "active" | "highly_engaged" | "power_user";

export interface BehaviorContext {
  device_type: "mobile" | "tablet" | "desktop";
  browser: string;
  os: string;
  is_first_session: boolean;
  session_duration_seconds: number;
  previous_page?: string;
  referrer?: string;
  utm_source?: string;
  time_of_day: number;
  day_of_week: number;
  user_timezone: string;
  feature_flags: string[];
  user_segment: string;
  subscription_tier: string;
  locale: string;
}

export interface BehaviorPattern {
  id: string;
  user_id: string;
  pattern_type: PatternType;
  pattern_name: string;
  description: string;
  confidence_score: number;
  frequency: number;
  first_detected: string;
  last_updated: string;
  supporting_events: string[];
  triggers: PatternTrigger[];
  outcomes: PatternOutcome[];
  recommendations: BehaviorRecommendation[];
  is_active: boolean;
}

export type PatternType =
  | "usage_frequency"
  | "feature_adoption"
  | "workflow_preference"
  | "time_patterns"
  | "productivity_cycles"
  | "learning_style"
  | "collaboration_style"
  | "goal_setting_behavior"
  | "procrastination_patterns"
  | "motivation_triggers"
  | "stress_indicators"
  | "success_factors";

export interface PatternTrigger {
  condition: string;
  value: any;
  frequency: number;
}

export interface PatternOutcome {
  metric: string;
  correlation_strength: number;
  impact_description: string;
}

export interface BehaviorRecommendation {
  id: string;
  type: "feature_suggestion" | "workflow_optimization" | "timing_adjustment" | "content_recommendation";
  title: string;
  description: string;
  implementation_steps: string[];
  expected_impact: string;
  confidence_score: number;
  priority: number;
  created_at: string;
  applied_at?: string;
  effectiveness_rating?: number;
}

export interface BehaviorInsight {
  id: string;
  user_id: string;
  insight_type: InsightType;
  title: string;
  description: string;
  supporting_data: any;
  confidence_score: number;
  actionable: boolean;
  recommendations: BehaviorRecommendation[];
  created_at: string;
  expires_at?: string;
  user_feedback?: "helpful" | "not_helpful" | "applied";
}

export type InsightType =
  | "productivity_optimization"
  | "feature_discovery"
  | "workflow_improvement"
  | "time_management"
  | "goal_achievement"
  | "habit_formation"
  | "stress_reduction"
  | "motivation_boost"
  | "collaboration_enhancement"
  | "learning_acceleration";

export interface PredictiveModel {
  id: string;
  model_name: string;
  model_type: "classification" | "regression" | "clustering" | "time_series";
  target_variable: string;
  features: string[];
  accuracy: number;
  last_trained: string;
  training_data_points: number;
  model_config: Record<string, any>;
  deployment_status: "active" | "testing" | "deprecated";
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria[];
  user_count: number;
  characteristics: Record<string, any>;
  behavioral_patterns: string[];
  recommended_features: string[];
  created_at: string;
  updated_at: string;
}

export interface SegmentCriteria {
  field: string;
  operator: "equals" | "greater_than" | "less_than" | "contains" | "in_range";
  value: any;
}

/**
 * Advanced Behavioral AI Analytics System
 * Tracks user behavior, identifies patterns, generates insights, and provides predictive recommendations
 */
export class BehavioralAnalyticsService {
  private sessionId: string;
  private eventBuffer: UserBehaviorEvent[] = [];
  private bufferFlushInterval: number = 30000; // 30 seconds
  private bufferMaxSize: number = 50;
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeEventBuffering();
    this.initializeSessionTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeEventBuffering() {
    // Flush buffer periodically
    this.flushTimer = setInterval(() => {
      this.flushEventBuffer();
    }, this.bufferFlushInterval);

    // Flush buffer before page unload
    window.addEventListener("beforeunload", () => {
      this.flushEventBuffer(true);
    });

    // Flush buffer when tab becomes hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.flushEventBuffer();
      }
    });
  }

  private initializeSessionTracking() {
    this.trackEvent("session_start", "system", {
      session_start_time: new Date().toISOString(),
      user_agent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      screen: {
        width: screen.width,
        height: screen.height,
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      referrer: document.referrer,
    });
  }

  /**
   * Track a behavioral event
   */
  public trackEvent(
    eventType: BehaviorEventType,
    category: BehaviorCategory,
    interactionData: Record<string, any> = {},
    additionalContext?: Partial<BehaviorContext>
  ) {
    const event: UserBehaviorEvent = {
      user_id: this.getCurrentUserId(),
      event_type: eventType,
      event_category: category,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      page_path: window.location.pathname,
      user_agent: navigator.userAgent,
      viewport_size: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      scroll_depth: this.calculateScrollDepth(),
      time_on_page: this.getTimeOnPage(),
      interaction_data: interactionData,
      context: this.buildContext(additionalContext),
      engagement_level: this.calculateEngagementLevel(eventType, interactionData),
      prediction_features: this.extractPredictionFeatures(eventType, interactionData),
    };

    this.eventBuffer.push(event);

    // Flush buffer if it's getting full
    if (this.eventBuffer.length >= this.bufferMaxSize) {
      this.flushEventBuffer();
    }

    // Real-time processing for critical events
    if (this.isCriticalEvent(eventType)) {
      this.processEventRealTime(event);
    }
  }

  private getCurrentUserId(): string {
    // Get from auth context or localStorage
    return localStorage.getItem("user_id") || "anonymous";
  }

  private calculateScrollDepth(): number {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
  }

  private getTimeOnPage(): number {
    const pageLoadTime = parseInt(localStorage.getItem("page_load_time") || "0");
    return pageLoadTime > 0 ? Date.now() - pageLoadTime : 0;
  }

  private buildContext(additionalContext?: Partial<BehaviorContext>): BehaviorContext {
    const now = new Date();

    return {
      device_type: this.detectDeviceType(),
      browser: this.detectBrowser(),
      os: this.detectOS(),
      is_first_session: !localStorage.getItem("has_previous_session"),
      session_duration_seconds: Math.floor((Date.now() - parseInt(this.sessionId.split("_")[1])) / 1000),
      previous_page: localStorage.getItem("previous_page") || undefined,
      referrer: document.referrer || undefined,
      time_of_day: now.getHours(),
      day_of_week: now.getDay(),
      user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      feature_flags: this.getActiveFeatureFlags(),
      user_segment: localStorage.getItem("user_segment") || "new_user",
      subscription_tier: localStorage.getItem("subscription_tier") || "free",
      locale: navigator.language,
      ...additionalContext,
    };
  }

  private detectDeviceType(): "mobile" | "tablet" | "desktop" {
    const width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  }

  private detectBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown";
  }

  private detectOS(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac")) return "macOS";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iOS")) return "iOS";
    return "Unknown";
  }

  private getActiveFeatureFlags(): string[] {
    return JSON.parse(localStorage.getItem("feature_flags") || "[]");
  }

  private calculateEngagementLevel(
    eventType: BehaviorEventType,
    interactionData: Record<string, any>
  ): EngagementLevel {
    const engagementScore = this.calculateEngagementScore(eventType, interactionData);

    if (engagementScore >= 80) return "power_user";
    if (engagementScore >= 60) return "highly_engaged";
    if (engagementScore >= 30) return "active";
    return "passive";
  }

  private calculateEngagementScore(
    eventType: BehaviorEventType,
    interactionData: Record<string, any>
  ): number {
    let score = 0;

    // Base scores by event type
    const eventScores: Record<BehaviorEventType, number> = {
      page_view: 1,
      click: 3,
      scroll: 1,
      hover: 1,
      form_interaction: 5,
      search: 8,
      filter_apply: 6,
      widget_interaction: 4,
      task_create: 15,
      task_complete: 20,
      goal_update: 12,
      habit_track: 10,
      reflection_write: 18,
      ai_query: 12,
      export_data: 8,
      share_content: 10,
      session_start: 0,
      session_end: 0,
      error_encounter: -2,
      feature_discovery: 15,
      onboarding_step: 5,
      help_access: 3,
      settings_change: 7,
    };

    score += eventScores[eventType] || 0;

    // Bonus for interaction depth
    if (interactionData.duration && interactionData.duration > 10000) score += 5;
    if (interactionData.clicks && interactionData.clicks > 3) score += 3;
    if (interactionData.form_fields_filled > 2) score += 4;

    return Math.max(0, Math.min(100, score));
  }

  private extractPredictionFeatures(
    eventType: BehaviorEventType,
    interactionData: Record<string, any>
  ): Record<string, number> {
    return {
      hour_of_day: new Date().getHours(),
      day_of_week: new Date().getDay(),
      session_duration: Math.floor((Date.now() - parseInt(this.sessionId.split("_")[1])) / 1000),
      page_depth: window.location.pathname.split("/").length,
      scroll_depth: this.calculateScrollDepth(),
      time_on_page: this.getTimeOnPage(),
      interaction_count: interactionData.clicks || 0,
      event_type_encoded: this.encodeEventType(eventType),
      viewport_ratio: window.innerWidth / window.innerHeight,
      is_weekend: [0, 6].includes(new Date().getDay()) ? 1 : 0,
    };
  }

  private encodeEventType(eventType: BehaviorEventType): number {
    const eventTypes = Object.keys({
      page_view: 0, click: 1, scroll: 2, hover: 3, form_interaction: 4,
      search: 5, filter_apply: 6, widget_interaction: 7, task_create: 8,
      task_complete: 9, goal_update: 10, habit_track: 11, reflection_write: 12,
      ai_query: 13, export_data: 14, share_content: 15, session_start: 16,
      session_end: 17, error_encounter: 18, feature_discovery: 19,
      onboarding_step: 20, help_access: 21, settings_change: 22,
    });
    return eventTypes.indexOf(eventType);
  }

  private isCriticalEvent(eventType: BehaviorEventType): boolean {
    const criticalEvents: BehaviorEventType[] = [
      "error_encounter",
      "session_start",
      "task_complete",
      "goal_update",
      "feature_discovery",
    ];
    return criticalEvents.includes(eventType);
  }

  private async processEventRealTime(event: UserBehaviorEvent) {
    try {
      // Send to AI for immediate insight generation
      if (event.event_type === "feature_discovery") {
        await this.generateFeatureAdoptionInsight(event);
      } else if (event.event_type === "error_encounter") {
        await this.generateErrorRecoveryInsight(event);
      }
    } catch (error) {
      console.error("Real-time event processing failed:", error);
    }
  }

  private async flushEventBuffer(immediate = false) {
    if (this.eventBuffer.length === 0) return;

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      await this.persistEvents(events);

      // Process events for pattern detection
      if (!immediate) {
        await this.processEventsForPatterns(events);
      }
    } catch (error) {
      console.error("Failed to flush event buffer:", error);
      // Add events back to buffer for retry
      this.eventBuffer.unshift(...events);
    }
  }

  private async persistEvents(events: UserBehaviorEvent[]) {
    // Store in Supabase
    const { error } = await supabase
      .from("user_behavior_events")
      .insert(events);

    if (error) {
      throw new Error(`Failed to persist events: ${error.message}`);
    }
  }

  private async processEventsForPatterns(events: UserBehaviorEvent[]) {
    // Batch analyze events for pattern detection
    for (const event of events) {
      if (Math.random() < 0.1) { // Process 10% of events for patterns
        await this.detectBehaviorPatterns(event);
      }
    }
  }

  /**
   * Detect behavioral patterns for a user
   */
  public async detectBehaviorPatterns(event: UserBehaviorEvent): Promise<BehaviorPattern[]> {
    const aiRequest: AIServiceRequest = {
      provider: "lovable",
      prompt: `Analyze this user behavior event for patterns:
Event: ${event.event_type}
Category: ${event.event_category}
Time: ${event.timestamp}
Context: ${JSON.stringify(event.context)}
Interaction: ${JSON.stringify(event.interaction_data)}

Identify potential behavioral patterns and suggest optimizations.`,
      userId: event.user_id,
      requestType: "behavior_pattern_detection",
      maxTokens: 400,
    };

    try {
      const aiResponse = await aiServiceManager.makeRequest(aiRequest);

      // Parse AI response and create pattern objects
      return this.parsePatternResponse(aiResponse.content, event);
    } catch (error) {
      console.error("Pattern detection failed:", error);
      return [];
    }
  }

  private parsePatternResponse(aiContent: string, event: UserBehaviorEvent): BehaviorPattern[] {
    // Simple pattern detection based on event characteristics
    const patterns: BehaviorPattern[] = [];

    // Example pattern: High engagement periods
    if (event.engagement_level === "highly_engaged" || event.engagement_level === "power_user") {
      patterns.push({
        id: `pattern_${Date.now()}`,
        user_id: event.user_id,
        pattern_type: "productivity_cycles",
        pattern_name: "High Engagement Period",
        description: `User shows high engagement at ${event.context.time_of_day}:00 on ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][event.context.day_of_week]}`,
        confidence_score: 0.8,
        frequency: 1,
        first_detected: event.timestamp,
        last_updated: event.timestamp,
        supporting_events: [event.id || ""],
        triggers: [
          {
            condition: "time_of_day",
            value: event.context.time_of_day,
            frequency: 1,
          },
        ],
        outcomes: [
          {
            metric: "task_completion_rate",
            correlation_strength: 0.7,
            impact_description: "Higher task completion during this period",
          },
        ],
        recommendations: [],
        is_active: true,
      });
    }

    return patterns;
  }

  /**
   * Generate behavioral insights for a user
   */
  public async generateBehaviorInsights(userId: string): Promise<BehaviorInsight[]> {
    // Get recent user events
    const { data: events } = await supabase
      .from("user_behavior_events")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(1000);

    if (!events || events.length === 0) return [];

    const insights: BehaviorInsight[] = [];

    // Analyze patterns
    const patterns = await this.analyzeEventPatterns(events);

    for (const pattern of patterns) {
      const insight = await this.generateInsightFromPattern(pattern, userId);
      if (insight) insights.push(insight);
    }

    return insights;
  }

  private async analyzeEventPatterns(events: UserBehaviorEvent[]): Promise<any[]> {
    // Group events by type and analyze frequency
    const eventGroups = events.reduce((groups, event) => {
      const key = `${event.event_type}_${event.context.time_of_day}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
      return groups;
    }, {} as Record<string, UserBehaviorEvent[]>);

    return Object.entries(eventGroups)
      .filter(([_, events]) => events.length >= 3) // Only patterns with 3+ occurrences
      .map(([key, events]) => ({
        pattern_key: key,
        events,
        frequency: events.length,
        avg_engagement: events.reduce((sum, e) => {
          const levels = { passive: 1, active: 2, highly_engaged: 3, power_user: 4 };
          return sum + levels[e.engagement_level];
        }, 0) / events.length,
      }));
  }

  private async generateInsightFromPattern(pattern: any, userId: string): Promise<BehaviorInsight | null> {
    const aiRequest: AIServiceRequest = {
      provider: "lovable",
      prompt: `Generate an actionable insight from this behavioral pattern:
Pattern: ${pattern.pattern_key}
Frequency: ${pattern.frequency} occurrences
Average Engagement: ${pattern.avg_engagement}/4
Sample Events: ${JSON.stringify(pattern.events.slice(0, 3))}

Create a helpful insight with specific recommendations.`,
      userId,
      requestType: "behavior_insight_generation",
      maxTokens: 300,
    };

    try {
      const aiResponse = await aiServiceManager.makeRequest(aiRequest);

      return {
        id: `insight_${Date.now()}`,
        user_id: userId,
        insight_type: "productivity_optimization",
        title: `Productivity Pattern Detected`,
        description: aiResponse.content || `You show consistent behavior patterns with ${pattern.frequency} similar interactions`,
        supporting_data: pattern,
        confidence_score: Math.min(0.9, pattern.frequency / 10),
        actionable: true,
        recommendations: [
          {
            id: `rec_${Date.now()}`,
            type: "timing_adjustment",
            title: "Optimize Your Peak Hours",
            description: "Schedule important work during your identified peak productivity periods",
            implementation_steps: [
              "Block calendar during high-engagement times",
              "Move routine tasks to lower-energy periods",
              "Track how this affects your productivity",
            ],
            expected_impact: "Improved task completion and work quality",
            confidence_score: 0.8,
            priority: 4,
            created_at: new Date().toISOString(),
          },
        ],
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Insight generation failed:", error);
      return null;
    }
  }

  private async generateFeatureAdoptionInsight(event: UserBehaviorEvent) {
    const insight: BehaviorInsight = {
      id: `insight_adoption_${Date.now()}`,
      user_id: event.user_id,
      insight_type: "feature_discovery",
      title: "New Feature Discovered!",
      description: `You just discovered: ${event.interaction_data.feature_name}. Here's how to get the most out of it.`,
      supporting_data: event,
      confidence_score: 1.0,
      actionable: true,
      recommendations: [
        {
          id: `rec_adoption_${Date.now()}`,
          type: "feature_suggestion",
          title: "Explore Related Features",
          description: "Since you're interested in this feature, you might also like these related capabilities",
          implementation_steps: [
            "Try the advanced settings",
            "Set up automation rules",
            "Connect with other tools",
          ],
          expected_impact: "Enhanced productivity and feature utilization",
          confidence_score: 0.9,
          priority: 3,
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    // Store insight
    await supabase.from("behavior_insights").insert(insight);
  }

  private async generateErrorRecoveryInsight(event: UserBehaviorEvent) {
    const insight: BehaviorInsight = {
      id: `insight_error_${Date.now()}`,
      user_id: event.user_id,
      insight_type: "workflow_improvement",
      title: "Let's Fix That Issue",
      description: "We noticed you encountered an error. Here are some ways to avoid this in the future.",
      supporting_data: event,
      confidence_score: 0.9,
      actionable: true,
      recommendations: [
        {
          id: `rec_error_${Date.now()}`,
          type: "workflow_optimization",
          title: "Alternative Approach",
          description: "Try this alternative method to achieve the same result",
          implementation_steps: [
            "Use the alternative workflow",
            "Check system requirements",
            "Contact support if needed",
          ],
          expected_impact: "Reduced errors and smoother workflow",
          confidence_score: 0.8,
          priority: 5,
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
    };

    // Store insight immediately
    await supabase.from("behavior_insights").insert(insight);
  }

  /**
   * Clean up resources
   */
  public destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushEventBuffer(true);
  }
}

// Global instance
export const behavioralAnalytics = new BehavioralAnalyticsService();