import React, { useEffect } from "react";
import { performanceMonitor } from "@/utils/performanceMonitor";
import {
  CommandPalette,
  useCommandPalette,
} from "@/components/widgets/CommandPalette";
import { DateHeader } from "@/components/dashboard/DateHeader";
import { FeaturedTaskCard } from "@/components/dashboard/FeaturedTaskCard";
import { TodayTasksList } from "@/components/dashboard/TodayTasksList";

// Dashboard with progressively added contexts for testing
const DashboardContextTester: React.FC = () => {
  const commandPalette = useCommandPalette();

  useEffect(() => {
    performanceMonitor.startMeasure('dashboard-with-contexts-render');
    performanceMonitor.startMeasure('command-palette-hook-init');

    return () => {
      performanceMonitor.endMeasure('dashboard-with-contexts-render');
      performanceMonitor.endMeasure('command-palette-hook-init');
      performanceMonitor.logSummary();
    };
  }, []);

  // Same mock data as original Dashboard
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

      {/* Featured Task Card */}
      <FeaturedTaskCard task={featuredTask} />

      {/* Today's Tasks List */}
      <TodayTasksList categories={taskCategories} />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPalette.isOpen}
        onOpenChange={commandPalette.close}
      />

      {/* Performance Testing Info */}
      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mt-8">
        <h3 className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
          🧪 Context Testing Dashboard
        </h3>
        <p className="text-xs text-orange-700 dark:text-orange-200">
          Dashboard with original components + Command Palette hook. Check console for performance metrics.
        </p>
      </div>
    </div>
  );
};

export default DashboardContextTester;