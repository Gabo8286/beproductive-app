import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, CheckSquare, Repeat, BookOpen, Sparkles, Users, StickyNote } from "lucide-react";
import { DatabaseTest } from "@/components/DatabaseTest";
import { getWelcomeMessage, getMotivationalMessage } from "@/lib/brand";
import { QuickTodosWidget } from "@/components/quickTodos/QuickTodosWidget";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { SmartWidgetGrid } from "@/components/widgets/SmartWidgetGrid";
import { LayoutConfigPanel } from "@/components/widgets/LayoutConfigPanel";
import { PersonalizationPanel } from "@/components/widgets/PersonalizationPanel";
import { JourneyProgressWidget } from "@/components/widgets/JourneyProgressWidget";
import { QuickActionsWidget } from "@/components/widgets/QuickActionsWidget";
import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { usePersonalization } from "@/hooks/usePersonalization";
import { useTheme } from "@/hooks/useTheme";
import {
  GoalsWidget,
  TasksWidget,
  NewQuickTodosWidget,
  HabitsWidget,
  ReflectionsWidget,
  NotesWidget,
  GamificationWidget,
  ProductivityProfileWidget
} from "@/components/widgets";

const journeyFeatures = [
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
    title: "Shared Journeys",
    subtitle: "Team Collaboration",
    description: "Travel together with your team",
    color: "text-secondary",
    status: "coming_soon" as const,
  },
];

export default function Dashboard() {
  const { profile } = useAuth();
  const {
    personalizedContent,
    userPreferences,
    updatePreferences,
    getTimeBasedGreeting,
    getMotivationalInsight
  } = usePersonalization();

  // Apply theme preferences
  useTheme();

  // Get time-based content
  const greeting = getTimeBasedGreeting();
  const insight = getMotivationalInsight();

  return (
    <WidgetProvider>
      <div className="space-y-6 pb-6">
        {/* Personalized Header */}
        <GreetingHeader
          name={profile?.full_name}
          greeting={greeting}
          insight={insight}
        />

        {/* Dashboard Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary journey-float" />
            <span className="text-sm text-muted-foreground">
              Your personalized productivity journey
            </span>
          </div>
          <div className="flex gap-2">
            <PersonalizationPanel />
            <LayoutConfigPanel />
          </div>
        </div>

        {/* Smart Widget Grid */}
        <SmartWidgetGrid enableDragDrop={userPreferences.enableDragDrop}>
          <GoalsWidget />
          <TasksWidget />
          <GamificationWidget />
          <NewQuickTodosWidget />
          <ProductivityProfileWidget />
          <NotesWidget />
          <HabitsWidget />
          <ReflectionsWidget />
        </SmartWidgetGrid>

        <DatabaseTest />
      </div>
    </WidgetProvider>
  );
}
