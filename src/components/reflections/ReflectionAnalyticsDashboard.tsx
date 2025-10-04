import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  TrendingUp,
  Calendar,
  Target,
  Heart,
  Sparkles,
} from "lucide-react";
import MoodAnalytics from "./MoodAnalytics";
import StreakAnalytics from "./StreakAnalytics";
import PersonalGrowthMetrics from "./PersonalGrowthMetrics";
import ContentAnalytics from "./ContentAnalytics";
import ImpactAnalysis from "./ImpactAnalysis";

interface ReflectionAnalyticsDashboardProps {
  workspaceId: string;
}

export default function ReflectionAnalyticsDashboard({
  workspaceId,
}: ReflectionAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Reflection Analytics
          </h2>
          <p className="text-muted-foreground">
            Discover patterns, track growth, and gain insights from your
            reflections
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="gap-2">
            <Brain className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="mood" className="gap-2">
            <Heart className="h-4 w-4" />
            Mood
          </TabsTrigger>
          <TabsTrigger value="growth" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Growth
          </TabsTrigger>
          <TabsTrigger value="consistency" className="gap-2">
            <Calendar className="h-4 w-4" />
            Consistency
          </TabsTrigger>
          <TabsTrigger value="impact" className="gap-2">
            <Target className="h-4 w-4" />
            Impact
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StreakAnalytics workspaceId={workspaceId} compact />
            <PersonalGrowthMetrics workspaceId={workspaceId} compact />
            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Quick Stats
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold">87%</p>
                    <p className="text-xs text-muted-foreground">
                      Consistency Score
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-xs text-muted-foreground">
                      Total Reflections
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <MoodAnalytics workspaceId={workspaceId} />
            <ContentAnalytics workspaceId={workspaceId} />
          </div>
        </TabsContent>

        <TabsContent value="mood" className="space-y-6">
          <MoodAnalytics workspaceId={workspaceId} detailed />
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <PersonalGrowthMetrics workspaceId={workspaceId} detailed />
        </TabsContent>

        <TabsContent value="consistency" className="space-y-6">
          <StreakAnalytics workspaceId={workspaceId} detailed />
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <ImpactAnalysis workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Personal Insights</h3>
            <p className="text-muted-foreground">
              AI-powered insights coming soon. We're analyzing your reflection
              patterns to provide meaningful personal growth recommendations.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
