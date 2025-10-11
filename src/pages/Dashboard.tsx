import React from "react";
import {
  CommandPalette,
  useCommandPalette,
} from "@/components/widgets/CommandPalette";
import { DateHeader } from "@/components/dashboard/DateHeader";
import { FeaturedTaskCard } from "@/components/dashboard/FeaturedTaskCard";
import { TodayTasksList } from "@/components/dashboard/TodayTasksList";
import { ProductivityStateIndicator } from "@/components/dashboard/ProductivityStateIndicator";
import { AdaptiveInsightsPanel } from "@/components/dashboard/AdaptiveInsightsPanel";
import { AdaptiveTaskRecommendations } from "@/components/dashboard/AdaptiveTaskRecommendations";
import { EnergyLevelWidget } from "@/components/dashboard/EnergyLevelWidget";
import { CycleNavigation } from "@/components/productivity/CycleNavigation";
import { usePerformanceTracking } from "@/hooks/usePerformanceTracking";
import { useAdaptiveInterface } from "@/hooks/useAdaptiveInterface";

const Dashboard: React.FC = () => {
  const commandPalette = useCommandPalette();
  const { adaptiveUI, isInFocusMode, shouldShowWidget } = useAdaptiveInterface();

  // Track dashboard performance
  usePerformanceTracking('Dashboard');

  // Mock data for featured task - in real app this would come from API/state
  const featuredTask = {
    id: "task-1",
    title: "New UI Design Project",
    description: "Finalize sketches for a new mobile application that simplifies the booking process",
    priority: "High" as const,
    progress: 65,
    dueDate: "2024-02-24",
    teamMembers: [
      { id: "1", name: "John Doe", avatar: "" },
      { id: "2", name: "Jane Smith", avatar: "" },
      { id: "3", name: "Mike Johnson", avatar: "" },
      { id: "4", name: "Sarah Wilson", avatar: "" },
    ]
  };

  // Mock data for task categories - in real app this would come from API/state
  const taskCategories = [
    {
      id: 'finance',
      name: 'Finance',
      description: 'Budgets & bills',
      icon: '💰',
      taskCount: 1,
      isFavorite: true,
      href: '/tasks?category=finance',
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 'sport',
      name: 'Sport',
      description: 'Workouts & progress',
      icon: '🏋️',
      taskCount: 2,
      isFavorite: false,
      href: '/tasks?category=sport',
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'home',
      name: 'Home',
      description: 'Chores & upkeep',
      icon: '🏠',
      taskCount: 7,
      isFavorite: false,
      href: '/tasks?category=home',
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      id: 'personal',
      name: 'Personal',
      description: 'Notes just for you',
      icon: 'P',
      taskCount: 12,
      isFavorite: false,
      href: '/notes',
      iconBgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-8">
      {/* Date Header */}
      <DateHeader />

      {/* Context-Aware Intelligence Section */}
      <div className={`grid gap-6 ${isInFocusMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}`}>
        {/* Productivity State Indicator - Always visible */}
        <ProductivityStateIndicator />

        {/* Energy Level Widget - High priority for wellness */}
        {shouldShowWidget('energy-widget') && (
          <EnergyLevelWidget />
        )}

        {/* Adaptive Insights Panel - Hidden in deep focus mode */}
        {shouldShowWidget('insights-panel') && (
          <AdaptiveInsightsPanel />
        )}
      </div>

      {/* Adaptive Task Recommendations - High priority widget */}
      {shouldShowWidget('task-recommendations') && (
        <AdaptiveTaskRecommendations />
      )}

      {/* Traditional Dashboard Content */}
      {!isInFocusMode && (
        <>
          {/* Featured Task Card */}
          <FeaturedTaskCard task={featuredTask} />

          {/* Today's Tasks List */}
          <TodayTasksList categories={taskCategories} />
        </>
      )}

      {/* Simplified view for focus mode */}
      {isInFocusMode && shouldShowWidget('essential-tasks') && (
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <h3 className="font-medium text-card-foreground mb-4">Essential Tasks Only</h3>
          <div className="space-y-2">
            <div className="p-3 rounded-lg border border-border/30">
              <div className="font-medium text-sm">Current Priority Task</div>
              <div className="text-xs text-muted-foreground mt-1">
                {featuredTask.title}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPalette.isOpen}
        onOpenChange={commandPalette.close}
      />
    </div>
  );
};

export default Dashboard;
