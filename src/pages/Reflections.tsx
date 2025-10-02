import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Calendar, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReflections } from "@/hooks/useReflections";
import { useReflectionStreak } from "@/hooks/useReflectionAnalytics";
import { supabase } from "@/integrations/supabase/client";
import ReflectionCard from "@/components/reflections/ReflectionCard";
import ReflectionFilters from "@/components/reflections/ReflectionFilters";
import ReflectionCalendar from "@/components/reflections/ReflectionCalendar";
import ReflectionTimeline from "@/components/reflections/ReflectionTimeline";
import DailyReflectionForm from "@/components/reflections/DailyReflectionForm";
import ReflectionAnalyticsDashboard from "@/components/reflections/ReflectionAnalyticsDashboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ReflectionFilters as Filters } from "@/types/reflections";

export default function Reflections() {
  const [showNewReflection, setShowNewReflection] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar' | 'analytics'>('timeline');

  // Get current workspace
  const { data: workspaceData } = useQuery({
    queryKey: ['current-workspace'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const workspaceId = workspaceData?.workspace_id || '';
  
  const { data: reflections, isLoading } = useReflections(workspaceId, filters);
  const { data: streakData } = useReflectionStreak(workspaceId);

  // Calculate this week's count
  const thisWeekCount = reflections?.filter(r => {
    const reflectionDate = new Date(r.reflection_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return reflectionDate >= weekAgo;
  }).length || 0;

  // Calculate average mood this month
  const avgMood = reflections
    ?.filter(r => {
      const reflectionDate = new Date(r.reflection_date);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return reflectionDate >= monthAgo && r.mood;
    })
    .reduce((sum, r) => {
      const moodScores = { amazing: 6, great: 5, good: 4, neutral: 3, bad: 2, terrible: 1 };
      return sum + (r.mood ? moodScores[r.mood] : 0);
    }, 0) / (reflections?.filter(r => r.mood).length || 1) || 0;

  const moodEmoji = avgMood >= 5 ? '😊' : avgMood >= 4 ? '🙂' : avgMood >= 3 ? '😐' : avgMood >= 2 ? '😔' : '😢';

  if (!workspaceId) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reflections</h1>
          <p className="text-muted-foreground mt-1">
            Track your daily journey and personal growth
          </p>
        </div>
        <Button onClick={() => setShowNewReflection(true)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          New Reflection
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 hover-scale">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold">{streakData?.current_streak || 0} days</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover-scale">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">{thisWeekCount} reflections</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover-scale">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <span className="text-2xl">{moodEmoji}</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Mood</p>
              <p className="text-2xl font-bold">{avgMood.toFixed(1)}/6</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover-scale">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
              <p className="text-2xl font-bold">{streakData?.longest_streak || 0} days</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <ReflectionFilters filters={filters} onFiltersChange={setFilters} />

      {/* View Toggle & Content */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          <ReflectionTimeline
            reflections={reflections || []}
            isLoading={isLoading}
            workspaceId={workspaceId}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <ReflectionCalendar
            reflections={reflections || []}
            workspaceId={workspaceId}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <ReflectionAnalyticsDashboard workspaceId={workspaceId} />
        </TabsContent>
      </Tabs>

      {/* New Reflection Dialog */}
      <Dialog open={showNewReflection} onOpenChange={setShowNewReflection}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Daily Reflection</DialogTitle>
          </DialogHeader>
          <DailyReflectionForm
            workspaceId={workspaceId}
            onSuccess={() => setShowNewReflection(false)}
            onCancel={() => setShowNewReflection(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
