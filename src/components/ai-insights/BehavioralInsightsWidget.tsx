import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Brain,
  TrendingUp,
  Clock,
  Target,
  ChevronDown,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Activity,
  Zap,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { useBehavioralAnalytics } from "@/hooks/useBehavioralAnalytics";
import { BehaviorInsight, BehaviorRecommendation, InsightType } from "@/services/ai/behavioralAnalytics";
import { EnhancedBaseWidget } from "@/components/widgets/EnhancedBaseWidget";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const insightIcons: Record<InsightType, React.ComponentType<{ className?: string }>> = {
  productivity_optimization: TrendingUp,
  feature_discovery: Lightbulb,
  workflow_improvement: Activity,
  time_management: Clock,
  goal_achievement: Target,
  habit_formation: CheckCircle,
  stress_reduction: Zap,
  motivation_boost: ThumbsUp,
  collaboration_enhancement: Eye,
  learning_acceleration: Brain,
};

const insightColors: Record<InsightType, string> = {
  productivity_optimization: "text-green-600",
  feature_discovery: "text-yellow-600",
  workflow_improvement: "text-blue-600",
  time_management: "text-purple-600",
  goal_achievement: "text-orange-600",
  habit_formation: "text-emerald-600",
  stress_reduction: "text-red-600",
  motivation_boost: "text-pink-600",
  collaboration_enhancement: "text-indigo-600",
  learning_acceleration: "text-violet-600",
};

interface BehavioralInsightsWidgetProps {
  widgetId: string;
  className?: string;
  maxInsights?: number;
  showPatterns?: boolean;
  autoRefresh?: boolean;
}

export function BehavioralInsightsWidget({
  widgetId,
  className,
  maxInsights = 5,
  showPatterns = true,
  autoRefresh = true,
}: BehavioralInsightsWidgetProps) {
  const {
    insights,
    patterns,
    isLoading,
    error,
    getActionableInsights,
    getEngagementLevel,
    getTopPatterns,
  } = useBehavioralAnalytics();

  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());
  const [appliedRecommendations, setAppliedRecommendations] = useState<Set<string>>(new Set());
  const [hiddenInsights, setHiddenInsights] = useState<Set<string>>(new Set());

  const actionableInsights = getActionableInsights().slice(0, maxInsights);
  const topPatterns = getTopPatterns(3);
  const engagementLevel = getEngagementLevel();

  const toggleInsightExpansion = useCallback((insightId: string) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(insightId)) {
        newSet.delete(insightId);
      } else {
        newSet.add(insightId);
      }
      return newSet;
    });
  }, []);

  const handleRecommendationAction = useCallback(
    async (recommendation: BehaviorRecommendation, action: "apply" | "dismiss") => {
      setAppliedRecommendations(prev => new Set(prev).add(recommendation.id));

      try {
        // Track the interaction
        // This would be handled by the analytics service
        toast.success(
          action === "apply"
            ? "Recommendation applied! We'll track how this helps."
            : "Recommendation dismissed."
        );
      } catch (error) {
        console.error("Failed to process recommendation action:", error);
      }
    },
    []
  );

  const hideInsight = useCallback((insightId: string) => {
    setHiddenInsights(prev => new Set(prev).add(insightId));
    toast.info("Insight hidden. You can show it again from settings.");
  }, []);

  const provideFeedback = useCallback(
    async (insightId: string, feedback: "helpful" | "not_helpful") => {
      try {
        // Store feedback in backend
        toast.success("Thank you for your feedback!");
      } catch (error) {
        console.error("Failed to submit feedback:", error);
      }
    },
    []
  );

  const renderInsightCard = (insight: BehaviorInsight) => {
    if (hiddenInsights.has(insight.id)) return null;

    const Icon = insightIcons[insight.insight_type];
    const iconColor = insightColors[insight.insight_type];
    const isExpanded = expandedInsights.has(insight.id);

    return (
      <Card key={insight.id} className="border-l-4 border-l-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={cn("mt-1", iconColor)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base font-medium">
                  {insight.title}
                </CardTitle>
                <CardDescription className="mt-1 text-sm">
                  {insight.description}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="secondary"
                    className="text-xs"
                  >
                    {insight.insight_type.replace("_", " ")}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Brain className="h-3 w-3" />
                    {Math.round(insight.confidence_score * 100)}% confident
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => hideInsight(insight.id)}
                className="h-6 w-6 p-0"
              >
                <EyeOff className="h-3 w-3" />
              </Button>
              {insight.recommendations.length > 0 && (
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleInsightExpansion(insight.id)}
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

        {insight.recommendations.length > 0 && (
          <Collapsible open={isExpanded}>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <Separator className="mb-3" />
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Recommendations
                  </h4>
                  {insight.recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 rounded-lg bg-muted/50 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{rec.title}</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            {rec.description}
                          </p>
                        </div>
                        <Badge
                          variant={rec.priority >= 4 ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          P{rec.priority}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs">
                          <span className="font-medium">Impact:</span> {rec.expected_impact}
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Confidence:</span>{" "}
                          <Progress
                            value={rec.confidence_score * 100}
                            className="h-1 w-16 inline-block ml-1"
                          />
                          {Math.round(rec.confidence_score * 100)}%
                        </div>
                      </div>

                      {rec.implementation_steps.length > 0 && (
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 text-xs">
                              Show steps <ChevronDown className="h-3 w-3 ml-1" />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <ul className="text-xs space-y-1 mt-2 pl-4">
                              {rec.implementation_steps.map((step, idx) => (
                                <li key={idx} className="list-disc">
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </CollapsibleContent>
                        </Collapsible>
                      )}

                      {!appliedRecommendations.has(rec.id) && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleRecommendationAction(rec, "apply")}
                            className="h-7 text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Apply
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRecommendationAction(rec, "dismiss")}
                            className="h-7 text-xs"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Was this insight helpful?
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => provideFeedback(insight.id, "helpful")}
                      className="h-6 w-6 p-0"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => provideFeedback(insight.id, "not_helpful")}
                      className="h-6 w-6 p-0"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        )}
      </Card>
    );
  };

  const renderEngagementLevel = () => {
    const levelConfig = {
      power_user: { color: "text-green-600", bg: "bg-green-100", label: "Power User" },
      highly_engaged: { color: "text-blue-600", bg: "bg-blue-100", label: "Highly Engaged" },
      active: { color: "text-yellow-600", bg: "bg-yellow-100", label: "Active" },
      passive: { color: "text-gray-600", bg: "bg-gray-100", label: "Getting Started" },
    };

    const config = levelConfig[engagementLevel];

    return (
      <div className={cn("rounded-lg p-3 border", config.bg)}>
        <div className="flex items-center gap-2">
          <Activity className={cn("h-4 w-4", config.color)} />
          <span className="text-sm font-medium">Engagement Level</span>
        </div>
        <div className="mt-1">
          <span className={cn("text-lg font-bold", config.color)}>
            {config.label}
          </span>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <EnhancedBaseWidget
        widgetId={widgetId}
        widgetType="behavioral-insights"
        title="Behavioral Insights"
        icon={<Brain className="h-5 w-5" />}
        className={className}
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unable to load insights</AlertTitle>
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
      widgetType="behavioral-insights"
      title="AI Behavioral Insights"
      subtitle={`${actionableInsights.length} insights available`}
      icon={<Brain className="h-5 w-5" />}
      isLoading={isLoading}
      className={className}
      size="large"
    >
      <div className="space-y-4">
        {/* Engagement Level Display */}
        {renderEngagementLevel()}

        {/* Behavioral Patterns Summary */}
        {showPatterns && topPatterns.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Patterns Detected
            </h3>
            <div className="space-y-2">
              {topPatterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className="p-2 rounded bg-muted/30 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{pattern.pattern_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(pattern.confidence_score * 100)}%
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {pattern.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actionable Insights */}
        {actionableInsights.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Actionable Insights
            </h3>
            {actionableInsights.map(renderInsightCard)}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              Keep using the app to generate personalized insights!
            </p>
          </div>
        )}
      </div>
    </EnhancedBaseWidget>
  );
}