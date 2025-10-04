import { useState } from "react";
import { useAIInsights } from "@/hooks/useAIInsights";
import { useAIRecommendations } from "@/hooks/useAIRecommendations";
import { useGenerateAIInsights } from "@/hooks/useGenerateAIInsights";
import { useAuth } from "@/contexts/AuthContext";
import { AIInsightCard } from "./AIInsightCard";
import { AIRecommendationCard } from "./AIRecommendationCard";
import { AIUsageWidget } from "./AIUsageWidget";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Lightbulb,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AIInsightsDashboard() {
  const [activeTab, setActiveTab] = useState("insights");
  const { user, loading: authLoading } = useAuth();

  const {
    insights,
    isLoading: insightsLoading,
    error: insightsError,
    markAsRead,
    archiveInsight,
    deleteInsight,
  } = useAIInsights({
    isArchived: false,
  });

  const {
    recommendations,
    isLoading: recsLoading,
    error: recsError,
    updateStatus,
  } = useAIRecommendations();
  const { generateInsights, isGenerating } = useGenerateAIInsights();

  console.log("AIInsightsDashboard: Auth state:", {
    user: user?.id,
    authLoading,
    insightsLoading,
    insightsError: insightsError?.message,
    recsError: recsError?.message,
    insightsCount: insights?.length || 0,
    recsCount: recommendations?.length || 0,
  });

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">
            Loading your AI insights...
          </span>
        </div>
      </div>
    );
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <Alert className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please sign in to view your AI insights and recommendations.
        </AlertDescription>
      </Alert>
    );
  }

  // Show error if there are query errors
  if (insightsError || recsError) {
    return (
      <Alert className="max-w-2xl mx-auto border-red-200">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertTitle className="text-red-700">
          Error Loading AI Insights
        </AlertTitle>
        <AlertDescription className="text-red-600">
          {insightsError?.message ||
            recsError?.message ||
            "Failed to load AI insights data. Please try refreshing the page."}
          <div className="mt-3">
            <Button onClick={() => window.location.reload()} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  const unreadInsights = insights.filter((i) => !i.is_read).length;
  const pendingRecs = recommendations.filter(
    (r) => r.status === "pending",
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Insights</h1>
          <p className="text-muted-foreground">
            AI-powered productivity analysis and recommendations
          </p>
        </div>
        <Button
          onClick={() => generateInsights(undefined)}
          disabled={isGenerating}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`}
          />
          {isGenerating ? "Generating..." : "Generate Insights"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Insights
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground">
              {unreadInsights} unread
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recommendations
            </CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendations.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingRecs} pending action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Productivity Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                // Calculate productivity score based on insights
                if (insights.length === 0) return "--";

                const scores = insights.map((insight) => {
                  const confidence = insight.confidence_score || 0.5;
                  let baseScore = 50; // neutral score

                  // Adjust score based on insight type and content
                  if (
                    insight.type === "goal_progress" &&
                    insight.content.includes("excellent")
                  )
                    baseScore = 85;
                  else if (
                    insight.type === "habit_analysis" &&
                    insight.content.includes("consistency")
                  )
                    baseScore = 80;
                  else if (
                    insight.type === "burnout_risk" &&
                    insight.title.includes("HIGH")
                  )
                    baseScore = 30;
                  else if (insight.type === "achievement_opportunity")
                    baseScore = 75;
                  else if (insight.type === "productivity_pattern")
                    baseScore = 70;

                  return baseScore * confidence;
                });

                const avgScore =
                  scores.reduce((a, b) => a + b, 0) / scores.length;
                return Math.round(avgScore);
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              {insights.length > 0
                ? `Based on ${insights.length} insights`
                : "Generate insights to see score"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <AIUsageWidget />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => generateInsights(undefined)}
              disabled={isGenerating}
              className="w-full"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`}
              />
              {isGenerating ? "Generating..." : "Generate All Insights"}
            </Button>
            <Button
              onClick={() =>
                generateInsights(["productivity_pattern", "burnout_risk"])
              }
              disabled={isGenerating}
              variant="outline"
              className="w-full"
            >
              Quick Health Check
            </Button>
            <Button
              onClick={() =>
                generateInsights(["achievement_opportunity", "goal_progress"])
              }
              disabled={isGenerating}
              variant="outline"
              className="w-full"
            >
              Find Opportunities
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="insights">
            Insights {unreadInsights > 0 && `(${unreadInsights})`}
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            Recommendations {pendingRecs > 0 && `(${pendingRecs})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {insightsLoading ? (
            <>
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </>
          ) : insights.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No insights yet</CardTitle>
                <CardDescription>
                  Click "Generate Insights" to analyze your productivity data
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            insights.map((insight) => (
              <AIInsightCard
                key={insight.id}
                insight={insight}
                onMarkAsRead={(id) => markAsRead.mutate(id)}
                onArchive={(id) => archiveInsight.mutate(id)}
                onDelete={(id) => deleteInsight.mutate(id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {recsLoading ? (
            <>
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </>
          ) : recommendations.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No recommendations yet</CardTitle>
                <CardDescription>
                  Generate insights to receive personalized recommendations
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            recommendations.map((rec) => (
              <AIRecommendationCard
                key={rec.id}
                recommendation={rec}
                onUpdateStatus={(id, status) =>
                  updateStatus.mutate({ id, status })
                }
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
