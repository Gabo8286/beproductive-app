import { useCallback, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  predictiveInsights,
  PredictionType,
  PredictionResult,
  PredictionContext,
  PredictionConfig
} from "@/services/ai/predictiveInsights";
import { useAuth } from "@/contexts/AuthContext";
import { useBehavioralAnalytics } from "@/hooks/useBehavioralAnalytics";
import { toast } from "sonner";

export interface PredictiveInsightsState {
  predictions: Record<PredictionType, PredictionResult | null>;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdate: Date | null;
  configuredTypes: PredictionType[];
}

export interface PredictiveInsightsConfig {
  enabledPredictions?: PredictionType[];
  autoRefresh?: boolean;
  refreshInterval?: number; // minutes
  cacheTime?: number; // minutes
  showNotifications?: boolean;
  confidenceThreshold?: number; // 0-1
}

export function usePredictiveInsights(config: PredictiveInsightsConfig = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { trackEvent } = useBehavioralAnalytics();

  const defaultConfig: Required<PredictiveInsightsConfig> = {
    enabledPredictions: ["productivity_forecast", "burnout_risk", "optimal_timing", "goal_achievement"],
    autoRefresh: true,
    refreshInterval: 30,
    cacheTime: 60,
    showNotifications: true,
    confidenceThreshold: 0.7,
  };

  const finalConfig = { ...defaultConfig, ...config };

  const [state, setState] = useState<PredictiveInsightsState>({
    predictions: {} as Record<PredictionType, PredictionResult | null>,
    isLoading: false,
    isRefreshing: false,
    error: null,
    lastUpdate: null,
    configuredTypes: finalConfig.enabledPredictions,
  });

  // Query for predictions
  const {
    data: predictionData,
    isLoading: queryLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["predictive-insights", user?.id, finalConfig.enabledPredictions],
    queryFn: async () => {
      if (!user?.id) return {};

      const predictions: Record<string, PredictionResult> = {};

      // Generate context for predictions
      const context: PredictionContext = {
        userId: user.id,
        timestamp: new Date(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          viewport: { width: window.innerWidth, height: window.innerHeight },
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        sessionContext: {
          sessionId: sessionStorage.getItem("session_id") || crypto.randomUUID(),
          pageUrl: window.location.href,
          referrer: document.referrer,
        },
      };

      // Generate predictions for each enabled type
      for (const predictionType of finalConfig.enabledPredictions) {
        try {
          const prediction = await predictiveInsights.generatePrediction(
            predictionType,
            user.id,
            context
          );
          predictions[predictionType] = prediction;
        } catch (error) {
          console.error(`Failed to generate ${predictionType} prediction:`, error);
        }
      }

      return predictions;
    },
    enabled: !!user?.id && finalConfig.enabledPredictions.length > 0,
    staleTime: finalConfig.cacheTime * 60 * 1000,
    refetchInterval: finalConfig.autoRefresh ? finalConfig.refreshInterval * 60 * 1000 : false,
    refetchIntervalInBackground: false,
  });

  // Update state when query data changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      predictions: predictionData || {},
      isLoading: queryLoading,
      error: queryError?.message || null,
      lastUpdate: predictionData ? new Date() : prev.lastUpdate,
    }));
  }, [predictionData, queryLoading, queryError]);

  // Manual refresh mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      setState(prev => ({ ...prev, isRefreshing: true }));
      return refetch();
    },
    onSuccess: () => {
      setState(prev => ({ ...prev, isRefreshing: false }));
      if (finalConfig.showNotifications) {
        toast.success("Insights updated successfully");
      }
      trackEvent("ai_insights_refresh", "engagement", {
        prediction_types: finalConfig.enabledPredictions,
        timestamp: new Date().toISOString(),
      });
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        isRefreshing: false,
        error: error.message,
      }));
      if (finalConfig.showNotifications) {
        toast.error("Failed to update insights");
      }
    },
  });

  // Get specific prediction with confidence filtering
  const getPrediction = useCallback(
    (type: PredictionType): PredictionResult | null => {
      const prediction = state.predictions[type];
      if (!prediction || prediction.confidence < finalConfig.confidenceThreshold) {
        return null;
      }
      return prediction;
    },
    [state.predictions, finalConfig.confidenceThreshold]
  );

  // Get high-confidence predictions
  const getHighConfidencePredictions = useCallback((): PredictionResult[] => {
    return Object.values(state.predictions)
      .filter((prediction): prediction is PredictionResult =>
        prediction !== null && prediction.confidence >= finalConfig.confidenceThreshold
      )
      .sort((a, b) => b.confidence - a.confidence);
  }, [state.predictions, finalConfig.confidenceThreshold]);

  // Get predictions by category
  const getPredictionsByCategory = useCallback((category: "risk" | "opportunity" | "optimization") => {
    return getHighConfidencePredictions().filter(prediction => {
      switch (category) {
        case "risk":
          return prediction.type === "burnout_risk" ||
                 prediction.prediction.some(p => p.includes("risk") || p.includes("warning"));
        case "opportunity":
          return prediction.type === "optimal_timing" ||
                 prediction.contributingFactors.some(f => f.includes("opportunity"));
        case "optimization":
          return prediction.type === "productivity_forecast" ||
                 prediction.type === "goal_achievement";
        default:
          return true;
      }
    });
  }, [getHighConfidencePredictions]);

  // Get actionable insights from predictions
  const getActionableInsights = useCallback(() => {
    const insights = getHighConfidencePredictions()
      .filter(prediction => prediction.recommendedActions.length > 0)
      .map(prediction => ({
        id: `${prediction.type}_${prediction.predictionId}`,
        type: prediction.type,
        title: getPredictionTitle(prediction.type),
        description: prediction.prediction.join(" "),
        actions: prediction.recommendedActions,
        confidence: prediction.confidence,
        priority: getPredictionPriority(prediction),
        category: getPredictionCategory(prediction.type),
      }));

    return insights.sort((a, b) => b.priority - a.priority);
  }, [getHighConfidencePredictions]);

  // Generate prediction summary
  const getPredictionSummary = useCallback(() => {
    const predictions = getHighConfidencePredictions();
    const riskPredictions = getPredictionsByCategory("risk");
    const opportunityPredictions = getPredictionsByCategory("opportunity");

    return {
      totalPredictions: predictions.length,
      averageConfidence: predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length || 0,
      riskCount: riskPredictions.length,
      opportunityCount: opportunityPredictions.length,
      lastUpdate: state.lastUpdate,
      nextUpdate: state.lastUpdate ?
        new Date(state.lastUpdate.getTime() + finalConfig.refreshInterval * 60 * 1000) : null,
    };
  }, [getHighConfidencePredictions, getPredictionsByCategory, state.lastUpdate, finalConfig.refreshInterval]);

  // Track prediction interactions
  const trackPredictionInteraction = useCallback(
    (predictionId: string, action: "view" | "apply" | "dismiss" | "feedback", metadata?: any) => {
      trackEvent("prediction_interaction", "engagement", {
        prediction_id: predictionId,
        action,
        metadata,
        confidence_threshold: finalConfig.confidenceThreshold,
        timestamp: new Date().toISOString(),
      });
    },
    [trackEvent, finalConfig.confidenceThreshold]
  );

  // Configure prediction types
  const updateConfiguration = useCallback((newConfig: Partial<PredictiveInsightsConfig>) => {
    const updatedConfig = { ...finalConfig, ...newConfig };
    setState(prev => ({
      ...prev,
      configuredTypes: updatedConfig.enabledPredictions || prev.configuredTypes,
    }));
    queryClient.invalidateQueries({ queryKey: ["predictive-insights", user?.id] });
  }, [finalConfig, queryClient, user?.id]);

  // Refresh predictions manually
  const refresh = useCallback(() => {
    refreshMutation.mutate();
  }, [refreshMutation]);

  return {
    // State
    ...state,
    isRefreshing: refreshMutation.isPending || state.isRefreshing,

    // Data accessors
    getPrediction,
    getHighConfidencePredictions,
    getPredictionsByCategory,
    getActionableInsights,
    getPredictionSummary,

    // Actions
    refresh,
    updateConfiguration,
    trackPredictionInteraction,

    // Configuration
    config: finalConfig,
  };
}

// Helper functions
function getPredictionTitle(type: PredictionType): string {
  const titles: Record<PredictionType, string> = {
    productivity_forecast: "Productivity Forecast",
    burnout_risk: "Burnout Risk Assessment",
    optimal_timing: "Optimal Timing Insights",
    goal_achievement: "Goal Achievement Probability",
  };
  return titles[type] || type.replace("_", " ");
}

function getPredictionPriority(prediction: PredictionResult): number {
  // Priority scoring: confidence * urgency factor
  let urgencyFactor = 1;

  if (prediction.type === "burnout_risk") urgencyFactor = 2;
  if (prediction.type === "optimal_timing") urgencyFactor = 1.5;
  if (prediction.type === "goal_achievement") urgencyFactor = 1.2;

  return prediction.confidence * urgencyFactor;
}

function getPredictionCategory(type: PredictionType): "risk" | "opportunity" | "optimization" {
  switch (type) {
    case "burnout_risk":
      return "risk";
    case "optimal_timing":
      return "opportunity";
    case "productivity_forecast":
    case "goal_achievement":
      return "optimization";
    default:
      return "optimization";
  }
}

// Specialized hook for productivity predictions
export function useProductivityPredictions() {
  const insights = usePredictiveInsights({
    enabledPredictions: ["productivity_forecast", "optimal_timing"],
    confidenceThreshold: 0.6,
  });

  const getProductivityForecast = useCallback(() => {
    return insights.getPrediction("productivity_forecast");
  }, [insights]);

  const getOptimalTiming = useCallback(() => {
    return insights.getPrediction("optimal_timing");
  }, [insights]);

  const getProductivityScore = useCallback(() => {
    const forecast = getProductivityForecast();
    if (!forecast) return null;

    // Extract productivity score from prediction data
    const scoreMatch = forecast.prediction.join(" ").match(/(\d+)%/);
    return scoreMatch ? parseInt(scoreMatch[1]) : null;
  }, [getProductivityForecast]);

  return {
    ...insights,
    getProductivityForecast,
    getOptimalTiming,
    getProductivityScore,
  };
}

// Specialized hook for wellbeing predictions
export function useWellbeingPredictions() {
  const insights = usePredictiveInsights({
    enabledPredictions: ["burnout_risk"],
    confidenceThreshold: 0.8,
    showNotifications: true,
  });

  const getBurnoutRisk = useCallback(() => {
    return insights.getPrediction("burnout_risk");
  }, [insights]);

  const getRiskLevel = useCallback((): "low" | "medium" | "high" | null => {
    const risk = getBurnoutRisk();
    if (!risk) return null;

    if (risk.confidence >= 0.9) return "high";
    if (risk.confidence >= 0.8) return "medium";
    return "low";
  }, [getBurnoutRisk]);

  const getWellbeingScore = useCallback(() => {
    const risk = getBurnoutRisk();
    if (!risk) return null;

    // Invert risk confidence to get wellbeing score
    return Math.round((1 - risk.confidence) * 100);
  }, [getBurnoutRisk]);

  return {
    ...insights,
    getBurnoutRisk,
    getRiskLevel,
    getWellbeingScore,
  };
}