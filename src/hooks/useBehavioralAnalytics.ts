import { useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  behavioralAnalytics,
  BehaviorEventType,
  BehaviorCategory,
  BehaviorInsight,
  BehaviorPattern,
} from "@/services/ai/behavioralAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TrackingOptions {
  category?: BehaviorCategory;
  immediate?: boolean;
  includeContext?: Record<string, any>;
  skipIfRecentlySame?: boolean;
}

export interface AnalyticsState {
  isTracking: boolean;
  insights: BehaviorInsight[];
  patterns: BehaviorPattern[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for behavioral analytics tracking and insights
 * Provides easy-to-use methods for tracking user behavior and accessing AI-generated insights
 */
export function useBehavioralAnalytics() {
  const { user } = useAuth();
  const pageLoadTime = useRef<number>(Date.now());
  const lastTrackedEvents = useRef<Map<string, number>>(new Map());
  const elementRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Initialize page tracking
  useEffect(() => {
    if (user) {
      // Track page view
      trackEvent("page_view", "navigation", {
        page_title: document.title,
        page_url: window.location.href,
        load_time: Date.now() - pageLoadTime.current,
      });

      // Store page load time for time-on-page calculations
      localStorage.setItem("page_load_time", pageLoadTime.current.toString());
      localStorage.setItem("previous_page", localStorage.getItem("current_page") || "");
      localStorage.setItem("current_page", window.location.pathname);
    }
  }, [user, window.location.pathname]);

  // Track events with deduplication
  const trackEvent = useCallback(
    (
      eventType: BehaviorEventType,
      category: BehaviorCategory,
      interactionData: Record<string, any> = {},
      options: TrackingOptions = {}
    ) => {
      if (!user) return;

      const eventKey = `${eventType}_${category}_${JSON.stringify(interactionData)}`;
      const now = Date.now();

      // Skip if same event was tracked recently (within 1 second)
      if (options.skipIfRecentlySame !== false) {
        const lastTracked = lastTrackedEvents.current.get(eventKey);
        if (lastTracked && now - lastTracked < 1000) {
          return;
        }
      }

      lastTrackedEvents.current.set(eventKey, now);

      try {
        behavioralAnalytics.trackEvent(
          eventType,
          options.category || category,
          {
            ...interactionData,
            ...options.includeContext,
          }
        );
      } catch (error) {
        console.error("Failed to track event:", error);
      }
    },
    [user]
  );

  // Enhanced tracking methods for common interactions
  const trackClick = useCallback(
    (element: string, additionalData?: Record<string, any>, options?: TrackingOptions) => {
      trackEvent(
        "click",
        "engagement",
        {
          element_name: element,
          element_type: "button",
          timestamp: new Date().toISOString(),
          ...additionalData,
        },
        options
      );
    },
    [trackEvent]
  );

  const trackFormInteraction = useCallback(
    (formName: string, action: string, fieldName?: string, options?: TrackingOptions) => {
      trackEvent(
        "form_interaction",
        "engagement",
        {
          form_name: formName,
          action, // "focus", "blur", "change", "submit"
          field_name: fieldName,
          timestamp: new Date().toISOString(),
        },
        options
      );
    },
    [trackEvent]
  );

  const trackSearch = useCallback(
    (query: string, resultsCount?: number, options?: TrackingOptions) => {
      trackEvent(
        "search",
        "engagement",
        {
          search_query: query,
          results_count: resultsCount,
          query_length: query.length,
          timestamp: new Date().toISOString(),
        },
        options
      );
    },
    [trackEvent]
  );

  const trackFeatureDiscovery = useCallback(
    (featureName: string, discoveryMethod: string, options?: TrackingOptions) => {
      trackEvent(
        "feature_discovery",
        "learning",
        {
          feature_name: featureName,
          discovery_method: discoveryMethod, // "click", "hover", "tutorial", "search"
          timestamp: new Date().toISOString(),
        },
        options
      );

      // Show congratulatory message for significant feature discoveries
      if (["ai_query", "export_data", "automation"].includes(featureName)) {
        toast.success(`Great! You discovered ${featureName.replace("_", " ")}`, {
          description: "This feature can really boost your productivity!",
          duration: 3000,
        });
      }
    },
    [trackEvent]
  );

  const trackProductivityAction = useCallback(
    (
      actionType: "task_create" | "task_complete" | "goal_update" | "habit_track" | "reflection_write",
      entityId: string,
      metadata?: Record<string, any>,
      options?: TrackingOptions
    ) => {
      trackEvent(
        actionType,
        "productivity",
        {
          entity_id: entityId,
          metadata,
          timestamp: new Date().toISOString(),
        },
        options
      );
    },
    [trackEvent]
  );

  const trackWidgetInteraction = useCallback(
    (widgetType: string, action: string, duration?: number, options?: TrackingOptions) => {
      trackEvent(
        "widget_interaction",
        "engagement",
        {
          widget_type: widgetType,
          action, // "view", "interact", "configure", "minimize", "expand"
          interaction_duration: duration,
          timestamp: new Date().toISOString(),
        },
        options
      );
    },
    [trackEvent]
  );

  const trackError = useCallback(
    (errorType: string, errorMessage: string, context?: Record<string, any>, options?: TrackingOptions) => {
      trackEvent(
        "error_encounter",
        "system",
        {
          error_type: errorType,
          error_message: errorMessage,
          error_context: context,
          user_action_before_error: localStorage.getItem("last_user_action"),
          timestamp: new Date().toISOString(),
        },
        options
      );
    },
    [trackEvent]
  );

  // Auto-tracking hooks for common patterns
  const useElementTracking = useCallback(
    (elementId: string, trackingConfig: {
      trackClicks?: boolean;
      trackHovers?: boolean;
      trackScroll?: boolean;
      category?: BehaviorCategory;
    } = {}) => {
      const elementRef = useCallback((element: HTMLElement | null) => {
        if (!element || !user) return;

        const existingElement = elementRefs.current.get(elementId);
        if (existingElement === element) return;

        // Remove old listeners
        if (existingElement) {
          // Clean up old event listeners
          elementRefs.current.delete(elementId);
        }

        elementRefs.current.set(elementId, element);

        const config = {
          trackClicks: true,
          trackHovers: false,
          trackScroll: false,
          category: "engagement" as BehaviorCategory,
          ...trackingConfig,
        };

        // Add event listeners
        if (config.trackClicks) {
          const clickHandler = (e: Event) => {
            trackClick(elementId, {
              element_tag: element.tagName.toLowerCase(),
              element_classes: element.className,
              click_position: e instanceof MouseEvent ? { x: e.clientX, y: e.clientY } : null,
            });
          };
          element.addEventListener("click", clickHandler);
        }

        if (config.trackHovers) {
          const hoverHandler = () => {
            trackEvent("hover", config.category, {
              element_id: elementId,
              element_tag: element.tagName.toLowerCase(),
            });
          };
          element.addEventListener("mouseenter", hoverHandler);
        }

        if (config.trackScroll) {
          const scrollHandler = () => {
            trackEvent("scroll", config.category, {
              element_id: elementId,
              scroll_position: element.scrollTop,
              scroll_percentage: (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100,
            });
          };
          element.addEventListener("scroll", scrollHandler);
        }
      }, [elementId, trackingConfig, user]);

      return elementRef;
    },
    [trackEvent, trackClick, user]
  );

  // Get insights and patterns
  const {
    data: insights = [],
    isLoading: insightsLoading,
    error: insightsError,
  } = useQuery({
    queryKey: ["behavioral-insights", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return behavioralAnalytics.generateBehaviorInsights(user.id);
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  });

  const {
    data: patterns = [],
    isLoading: patternsLoading,
    error: patternsError,
  } = useQuery({
    queryKey: ["behavioral-patterns", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      // This would fetch stored patterns from the database
      const { data } = await supabase
        .from("behavior_patterns")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("confidence_score", { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Utility functions
  const getEngagementLevel = useCallback(() => {
    const recentEvents = insights
      .filter(insight =>
        new Date(insight.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      )
      .length;

    if (recentEvents >= 20) return "power_user";
    if (recentEvents >= 10) return "highly_engaged";
    if (recentEvents >= 5) return "active";
    return "passive";
  }, [insights]);

  const getTopPatterns = useCallback((limit = 5) => {
    return patterns
      .sort((a, b) => b.confidence_score - a.confidence_score)
      .slice(0, limit);
  }, [patterns]);

  const getActionableInsights = useCallback(() => {
    return insights.filter(insight => insight.actionable && !insight.user_feedback);
  }, [insights]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      elementRefs.current.clear();
      lastTrackedEvents.current.clear();
    };
  }, []);

  return {
    // Tracking methods
    trackEvent,
    trackClick,
    trackFormInteraction,
    trackSearch,
    trackFeatureDiscovery,
    trackProductivityAction,
    trackWidgetInteraction,
    trackError,
    useElementTracking,

    // Data
    insights,
    patterns,
    isLoading: insightsLoading || patternsLoading,
    error: insightsError || patternsError,

    // Utilities
    getEngagementLevel,
    getTopPatterns,
    getActionableInsights,

    // State
    isTracking: !!user,
  };
}

// Specialized hooks for specific use cases
export function useProductivityTracking() {
  const { trackProductivityAction, trackWidgetInteraction } = useBehavioralAnalytics();

  const trackTaskCreated = useCallback((taskId: string, taskData: any) => {
    trackProductivityAction("task_create", taskId, {
      priority: taskData.priority,
      estimated_duration: taskData.estimated_duration,
      category: taskData.category,
      has_due_date: !!taskData.due_date,
    });
  }, [trackProductivityAction]);

  const trackTaskCompleted = useCallback((taskId: string, taskData: any, completionTime: number) => {
    trackProductivityAction("task_complete", taskId, {
      actual_duration: completionTime,
      completion_method: taskData.completion_method || "manual",
      was_overdue: taskData.was_overdue,
    });
  }, [trackProductivityAction]);

  const trackGoalUpdated = useCallback((goalId: string, oldProgress: number, newProgress: number) => {
    trackProductivityAction("goal_update", goalId, {
      progress_change: newProgress - oldProgress,
      new_progress: newProgress,
      progress_velocity: (newProgress - oldProgress) / 100,
    });
  }, [trackProductivityAction]);

  return {
    trackTaskCreated,
    trackTaskCompleted,
    trackGoalUpdated,
    trackWidgetInteraction,
  };
}

export function useAIInteractionTracking() {
  const { trackEvent } = useBehavioralAnalytics();

  const trackAIQuery = useCallback((query: string, responseTime: number, satisfaction?: number) => {
    trackEvent("ai_query", "engagement", {
      query_length: query.length,
      query_complexity: query.split(" ").length,
      response_time_ms: responseTime,
      user_satisfaction: satisfaction,
      timestamp: new Date().toISOString(),
    });
  }, [trackEvent]);

  const trackAIRecommendationInteraction = useCallback((
    recommendationId: string,
    action: "view" | "apply" | "dismiss" | "feedback",
    feedback?: "helpful" | "not_helpful"
  ) => {
    trackEvent("ai_query", "learning", {
      recommendation_id: recommendationId,
      action,
      feedback,
      timestamp: new Date().toISOString(),
    });
  }, [trackEvent]);

  return {
    trackAIQuery,
    trackAIRecommendationInteraction,
  };
}