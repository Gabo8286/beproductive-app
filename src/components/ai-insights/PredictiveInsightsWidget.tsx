import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Zap,
  Activity,
  Calendar,
  BarChart,
  Lightbulb,
  Shield,
  Eye,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  Star,
  Flame,
} from "lucide-react";
import { usePredictiveInsights, useProductivityPredictions, useWellbeingPredictions } from "@/hooks/usePredictiveInsights";
import { PredictionResult, PredictionType } from "@/services/ai/predictiveInsights";
import { EnhancedBaseWidget } from "@/components/widgets/EnhancedBaseWidget";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const predictionIcons: Partial<Record<PredictionType, React.ComponentType<{ className?: string }>>> = {
  productivity_forecasting: TrendingUp,
  burnout_detection: AlertTriangle,
  optimal_timing: Clock,
  goal_achievement_likelihood: Target,
};

const predictionColors: Partial<Record<PredictionType, string>> = {
  productivity_forecasting: "text-green-600",
  burnout_detection: "text-red-600",
  optimal_timing: "text-blue-600",
  goal_achievement_likelihood: "text-purple-600",
};

const predictionBadgeColors: Partial<Record<PredictionType, string>> = {
  productivity_forecasting: "bg-green-100 text-green-800",
  burnout_detection: "bg-red-100 text-red-800",
  optimal_timing: "bg-blue-100 text-blue-800",
  goal_achievement_likelihood: "bg-purple-100 text-purple-800",
};

interface PredictiveInsightsWidgetProps {
  widgetId: string;
  className?: string;
  variant?: "overview" | "detailed" | "productivity" | "wellbeing";
  maxPredictions?: number;
  showCategories?: boolean;
  autoRefresh?: boolean;
  compactMode?: boolean;
}

export function PredictiveInsightsWidget({
  widgetId,
  className,
  variant = "overview",
  maxPredictions = 4,
  showCategories = true,
  autoRefresh = true,
  compactMode = false,
}: PredictiveInsightsWidgetProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [expandedPredictions, setExpandedPredictions] = useState<Set<string>>(new Set());
  const [hiddenPredictions, setHiddenPredictions] = useState<Set<string>>(new Set());
  const [appliedActions, setAppliedActions] = useState<Set<string>>(new Set());

  // Use appropriate hook based on variant
  const insights = variant === "productivity"
    ? useProductivityPredictions()
    : variant === "wellbeing"
    ? useWellbeingPredictions()
    : usePredictiveInsights({
        autoRefresh,
        confidenceThreshold: 0.6,
        showNotifications: false,
      });

  const {
    predictions,
    isLoading,
    isRefreshing,
    error,
    getHighConfidencePredictions,
    getPredictionsByCategory,
    getActionableInsights,
    getPredictionSummary,
    refresh,
    trackPredictionInteraction,
  } = insights;

  const summary = getPredictionSummary();
  const actionableInsights = getActionableInsights().slice(0, maxPredictions);

  const togglePredictionExpansion = useCallback((predictionId: string) => {
    setExpandedPredictions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(predictionId)) {
        newSet.delete(predictionId);
      } else {
        newSet.add(predictionId);
      }
      return newSet;
    });
  }, []);

  const hidePrediction = useCallback((predictionId: string) => {
    setHiddenPredictions(prev => new Set(prev).add(predictionId));
    trackPredictionInteraction(predictionId, "dismiss");
    toast.info("Prediction hidden. You can show it again from settings.");
  }, [trackPredictionInteraction]);

  const applyAction = useCallback((predictionId: string, actionIndex: number) => {
    const actionKey = `${predictionId}_${actionIndex}`;
    setAppliedActions(prev => new Set(prev).add(actionKey));
    trackPredictionInteraction(predictionId, "apply", { actionIndex });
    toast.success("Action applied! We'll track how this helps your productivity.");
  }, [trackPredictionInteraction]);

  const provideFeedback = useCallback(
    (predictionId: string, feedback: "helpful" | "not_helpful") => {
      trackPredictionInteraction(predictionId, "feedback", { feedback });
      toast.success("Thank you for your feedback!");
    },
    [trackPredictionInteraction]
  );

  const getConfidenceColor = useCallback((confidence: number) => {
    if (confidence >= 0.9) return "text-green-600";
    if (confidence >= 0.7) return "text-yellow-600";
    return "text-red-600";
  }, []);

  const getConfidenceBadge = useCallback((confidence: number) => {
    if (confidence >= 0.9) return "High";
    if (confidence >= 0.7) return "Medium";
    return "Low";
  }, []);

  const renderPredictionCard = useCallback((prediction: PredictionResult) => {
    if (hiddenPredictions.has(prediction.id)) return null;

    const Icon = predictionIcons[prediction.model_type] || Brain;
    const iconColor = predictionColors[prediction.model_type] || "text-gray-600";
    const isExpanded = expandedPredictions.has(prediction.id);
    const predictionValue = String(prediction.prediction_value || "No prediction available");

    return (
      <Card key={prediction.id} className="border-l-4 border-l-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className={cn("mt-1", iconColor)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <CardTitle className="text-base font-medium">
                    {prediction.model_type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {predictionValue.slice(0, 100)}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={predictionBadgeColors[prediction.model_type] || "bg-gray-100 text-gray-800"}>
                    {prediction.model_type.replace("_", " ")}
                  </Badge>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Brain className="h-3 w-3" />
                    <span className={getConfidenceColor(prediction.confidence_score)}>
                      {Math.round(prediction.confidence_score * 100)}% confident
                    </span>
                  </div>

                  <Badge variant="outline" className="text-xs">
                    {getConfidenceBadge(prediction.confidence_score)}
                  </Badge>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(prediction.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => hidePrediction(prediction.id)}
                className="h-6 w-6 p-0"
              >
                <EyeOff className="h-3 w-3" />
              </Button>

              {(prediction.contributing_factors.length > 0 || prediction.recommended_actions.length > 0) && (
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePredictionExpansion(prediction.predictionId)}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronDown
                        className={cn(
                          "h-3 w-3 transition-transform",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              )}
            </div>
          </div>
        </CardHeader>

        <Collapsible open={isExpanded}>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <Separator className="mb-3" />

              {/* Full prediction details */}
              {prediction.prediction.length > 2 && (
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <BarChart className="h-4 w-4" />
                    Detailed Analysis
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {prediction.prediction.slice(2).map((detail, idx) => (
                      <p key={idx}>{detail}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Contributing factors */}
              {prediction.contributingFactors.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Key Factors
                  </h4>
                  <div className="space-y-1">
                    {prediction.contributingFactors.slice(0, 3).map((factor, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended actions */}
              {prediction.recommendedActions.length > 0 && (
                <div className="space-y-3 mb-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Recommended Actions
                  </h4>
                  <div className="space-y-2">
                    {prediction.recommendedActions.map((action, idx) => {
                      const actionKey = `${prediction.predictionId}_${idx}`;
                      const isApplied = appliedActions.has(actionKey);

                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-muted/50 space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-sm flex-1">{action}</p>
                            {!isApplied && (
                              <Button
                                size="sm"
                                onClick={() => applyAction(prediction.predictionId, idx)}
                                className="h-7 text-xs ml-2"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Apply
                              </Button>
                            )}
                            {isApplied && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Applied
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Feedback section */}
              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Was this prediction helpful?
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => provideFeedback(prediction.predictionId, "helpful")}
                    className="h-6 w-6 p-0"
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => provideFeedback(prediction.predictionId, "not_helpful")}
                    className="h-6 w-6 p-0"
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  }, [
    hiddenPredictions,
    expandedPredictions,
    togglePredictionExpansion,
    hidePrediction,
    applyAction,
    appliedActions,
    provideFeedback,
    getConfidenceColor,
    getConfidenceBadge,
  ]);

  const renderSummaryStats = useCallback(() => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <Card className="p-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <div>
            <div className="text-lg font-bold">{summary.totalPredictions}</div>
            <div className="text-xs text-muted-foreground">Predictions</div>
          </div>
        </div>
      </Card>

      <Card className="p-3">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-600" />
          <div>
            <div className="text-lg font-bold">{Math.round(summary.averageConfidence * 100)}%</div>
            <div className="text-xs text-muted-foreground">Confidence</div>
          </div>
        </div>
      </Card>

      <Card className="p-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <div>
            <div className="text-lg font-bold">{summary.riskCount}</div>
            <div className="text-xs text-muted-foreground">Risks</div>
          </div>
        </div>
      </Card>

      <Card className="p-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-green-600" />
          <div>
            <div className="text-lg font-bold">{summary.opportunityCount}</div>
            <div className="text-xs text-muted-foreground">Opportunities</div>
          </div>
        </div>
      </Card>
    </div>
  ), [summary]);

  const renderTabContent = useCallback((category: string) => {
    let predictions: PredictionResult[] = [];

    switch (category) {
      case "all":
        predictions = getHighConfidencePredictions().slice(0, maxPredictions);
        break;
      case "risk":
        predictions = getPredictionsByCategory("risk");
        break;
      case "opportunity":
        predictions = getPredictionsByCategory("opportunity");
        break;
      case "optimization":
        predictions = getPredictionsByCategory("optimization");
        break;
    }

    if (predictions.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            No {category === "all" ? "" : category} predictions available yet.
          </p>
          <p className="text-xs mt-1">
            Keep using the app to generate insights!
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {predictions.map(renderPredictionCard)}
      </div>
    );
  }, [getHighConfidencePredictions, getPredictionsByCategory, maxPredictions, renderPredictionCard]);

  if (error) {
    return (
      <EnhancedBaseWidget
        widgetId={widgetId}
        widgetType="predictive-insights"
        title="Predictive Insights"
        icon={<Brain className="h-5 w-5" />}
        className={className}
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unable to load predictions</AlertTitle>
          <AlertDescription>
            Please try again later or contact support if the issue persists.
          </AlertDescription>
        </Alert>
      </EnhancedBaseWidget>
    );
  }

  return (
    <EnhancedBaseWidget
      widgetId={widgetId}
      widgetType="predictive-insights"
      title="AI Predictive Insights"
      subtitle={`${summary.totalPredictions} insights available`}
      icon={<Brain className="h-5 w-5" />}
      isLoading={isLoading}
      className={className}
      size={compactMode ? "medium" : "large"}
      actions={
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={isRefreshing}
          className="h-8"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Summary stats (if not compact) */}
        {!compactMode && variant === "overview" && renderSummaryStats()}

        {/* Category tabs (if enabled) */}
        {showCategories && variant === "overview" ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="risk" className="text-xs">Risks</TabsTrigger>
              <TabsTrigger value="opportunity" className="text-xs">Opportunities</TabsTrigger>
              <TabsTrigger value="optimization" className="text-xs">Optimization</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              {renderTabContent("all")}
            </TabsContent>
            <TabsContent value="risk" className="mt-4">
              {renderTabContent("risk")}
            </TabsContent>
            <TabsContent value="opportunity" className="mt-4">
              {renderTabContent("opportunity")}
            </TabsContent>
            <TabsContent value="optimization" className="mt-4">
              {renderTabContent("optimization")}
            </TabsContent>
          </Tabs>
        ) : (
          // Simple list view
          renderTabContent("all")
        )}

        {/* Last update info */}
        {summary.lastUpdate && !compactMode && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Last updated: {summary.lastUpdate.toLocaleTimeString()}
            {summary.nextUpdate && (
              <span className="ml-2">
                • Next update: {summary.nextUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        )}
      </div>
    </EnhancedBaseWidget>
  );
}