import { useState } from "react";
import { useAIInsights } from "@/hooks/useAIInsights";
import { useAIRecommendations } from "@/hooks/useAIRecommendations";
import { useGenerateAIInsights } from "@/hooks/useGenerateAIInsights";
import { AIInsightCard } from "./AIInsightCard";
import { AIRecommendationCard } from "./AIRecommendationCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Lightbulb, RefreshCw, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AIInsightsDashboard() {
  const [activeTab, setActiveTab] = useState("insights");
  
  const { insights, isLoading: insightsLoading, markAsRead, archiveInsight, deleteInsight } = useAIInsights({
    isArchived: false,
  });

  const { recommendations, isLoading: recsLoading, updateStatus } = useAIRecommendations();
  const { generateInsights, isGenerating } = useGenerateAIInsights();

  const unreadInsights = insights.filter(i => !i.is_read).length;
  const pendingRecs = recommendations.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Insights</h1>
          <p className="text-muted-foreground">AI-powered productivity analysis and recommendations</p>
        </div>
        <Button
          onClick={() => generateInsights()}
          disabled={isGenerating}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Generate Insights'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
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
            <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
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
            <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Coming soon
            </p>
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
                onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
