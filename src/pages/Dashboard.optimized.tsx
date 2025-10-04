import React, { lazy, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  CheckSquare,
  StickyNote,
  Repeat,
  BookOpen,
  Sparkles,
  Users,
  TrendingUp,
  Calendar,
  Brain
} from "lucide-react";
import { useModules } from "@/contexts/ModulesContext";
import {
  GoalsWidget,
  TasksWidget,
  HabitsWidget,
  ReflectionsWidget,
  NewQuickTodosWidget,
  GamificationWidget,
  ProductivityProfileWidget
} from "@/components/widgets";
import { LoadingSkeleton } from "@/components/ai/LoadingSkeleton";

// Lazy load AI components
const TimeTrackingWidget = lazy(() =>
  import("@/components/widgets/TimeTrackingWidget").then(module => ({
    default: module.TimeTrackingWidget
  }))
);

const SmartRecommendationsWidget = lazy(() =>
  import("@/components/widgets/SmartRecommendationsWidget").then(module => ({
    default: module.SmartRecommendationsWidget
  }))
);

// Widget loading fallback
const WidgetLoading = ({ type = "widget" }: { type?: string }) => (
  <div className="h-48 flex items-center justify-center">
    <LoadingSkeleton type={type} />
  </div>
);

interface ModuleItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  status: "active" | "coming_soon" | "inactive";
}

const MODULES: ModuleItem[] = [
  {
    icon: Target,
    title: "Destinations",
    subtitle: "Goals",
    description: "Set meaningful destinations for your journey",
    color: "text-primary",
    status: "active" as const,
  },
  {
    icon: CheckSquare,
    title: "Next Steps",
    subtitle: "Tasks",
    description: "Organize the steps needed to move forward",
    color: "text-warning",
    status: "active" as const,
  },
  {
    icon: StickyNote,
    title: "Travel Notes",
    subtitle: "Quick To-Dos",
    description: "Capture quick thoughts and reminders",
    color: "text-warning",
    status: "active" as const,
  },
  {
    icon: Repeat,
    title: "Daily Routines",
    subtitle: "Habits",
    description: "Build consistent practices that power progress",
    color: "text-secondary",
    status: "active" as const,
  },
  {
    icon: BookOpen,
    title: "Route Adjustments",
    subtitle: "Reflections",
    description: "Learn from experiences and adjust your path",
    color: "text-success",
    status: "active" as const,
  },
  {
    icon: Sparkles,
    title: "Journey Insights",
    subtitle: "AI Guidance",
    description: "Receive intelligent recommendations for your path",
    color: "text-primary",
    status: "coming_soon" as const,
  },
  {
    icon: Users,
    title: "Travel Companions",
    subtitle: "Team",
    description: "Collaborate with others on shared goals",
    color: "text-success",
    status: "coming_soon" as const,
  },
  {
    icon: TrendingUp,
    title: "Journey Insights",
    subtitle: "Analytics",
    description: "Track your progress and identify patterns",
    color: "text-info",
    status: "coming_soon" as const,
  },
];

const Dashboard: React.FC = () => {
  const {
    enabledModules,
    isLoading: modulesLoading
  } = useModules();

  // Helper function to check if module is enabled
  const isModuleEnabled = (moduleKey: string) => {
    return enabledModules.includes(moduleKey);
  };

  if (modulesLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-lg animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-card rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-4 p-6 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-lg">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome to Your Productivity Journey
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your personal command center for building productive habits and achieving meaningful goals.
          Every journey begins with a single step, and every step brings you closer to becoming your best self.
        </p>
      </div>

      {/* Journey Modules Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Your Journey Modules
          </CardTitle>
          <CardDescription>
            Essential tools for your productivity journey. Each module is designed to support different aspects of personal growth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((module, index) => {
              const IconComponent = module.icon;
              return (
                <div
                  key={index}
                  className="group p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg bg-accent/10`}>
                      <IconComponent className={`h-4 w-4 ${module.color}`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{module.subtitle}</h4>
                        <Badge
                          variant={module.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {module.status === 'active' ? 'Active' : 'Soon'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Primary Widgets Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Core Productivity Widgets */}
        {isModuleEnabled('goals') && <GoalsWidget />}
        {isModuleEnabled('tasks') && <TasksWidget />}
        {isModuleEnabled('quick_todos') && <NewQuickTodosWidget />}

        {/* AI-Enhanced Widgets (Lazy Loaded) */}
        <Suspense fallback={<WidgetLoading />}>
          <TimeTrackingWidget />
        </Suspense>

        <Suspense fallback={<WidgetLoading />}>
          <SmartRecommendationsWidget />
        </Suspense>

        {/* Additional Productivity Tools */}
        {isModuleEnabled('habits') && <HabitsWidget />}
        {isModuleEnabled('reflections') && <ReflectionsWidget />}
        {isModuleEnabled('gamification') && <GamificationWidget />}
        <ProductivityProfileWidget />
      </div>

      {/* Coming Soon Teaser */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Brain className="h-5 w-5" />
            Advanced AI Features Coming Soon
          </CardTitle>
          <CardDescription>
            We're working on intelligent automation, deeper insights, and personalized coaching features.
            Your productivity journey is about to get even more powerful.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default Dashboard;