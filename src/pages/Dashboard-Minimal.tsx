import React, { useEffect } from "react";
import { performanceMonitor, trackPageLoad } from "@/utils/performanceMonitor";

// Minimal Dashboard with zero dependencies for performance testing
const DashboardMinimal: React.FC = () => {
  const today = new Date();

  useEffect(() => {
    // Track minimal dashboard load performance
    trackPageLoad('dashboard-minimal');
    performanceMonitor.startMeasure('minimal-dashboard-render');

    return () => {
      performanceMonitor.endMeasure('minimal-dashboard-render');
      performanceMonitor.logSummary();
    };
  }, []);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Static mock data - identical to original Dashboard
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
    },
    {
      id: 'sport',
      name: 'Sport',
      description: 'Workouts & progress',
      icon: '🏋️',
      taskCount: 2,
    },
    {
      id: 'home',
      name: 'Home',
      description: 'Chores & upkeep',
      icon: '🏠',
      taskCount: 7,
    },
    {
      id: 'personal',
      name: 'Personal',
      description: 'Notes just for you',
      icon: 'P',
      taskCount: 12,
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-8">

      {/* Simple Date Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          Today, {formatDate(today)}
        </h1>
      </div>

      {/* Simple Featured Task Card */}
      <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white/90">Today Tasks</h2>
          <span className="text-sm text-white/70">See All</span>
        </div>

        <div className="mb-4">
          <span className="bg-orange-100 text-orange-800 border-0 font-medium px-3 py-1 rounded">
            {featuredTask.priority}
          </span>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-2 leading-tight">
            {featuredTask.title}
          </h3>
          <p className="text-white/70 text-sm leading-relaxed">
            {featuredTask.description}
          </p>
        </div>

        <div className="mb-6">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${featuredTask.progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {featuredTask.teamMembers.slice(0, 4).map((member, index) => (
              <div key={member.id} className="h-8 w-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-xs border-2 border-white/20">
                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-2 text-white/70">
            <span className="text-sm font-medium">
              Due: Feb 24
            </span>
          </div>
        </div>
      </div>

      {/* Simple Task Categories List */}
      <div className="space-y-3">
        {taskCategories.map((category) => (
          <div key={category.id} className="bg-white dark:bg-card rounded-2xl p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-lg">{category.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {category.name}
                    </h3>
                    <span className="text-sm font-medium text-muted-foreground">{category.taskCount}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {category.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Testing Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-8">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          🔬 Minimal Dashboard Test
        </h3>
        <p className="text-xs text-blue-700 dark:text-blue-200">
          This is a minimal version with no contexts, hooks, or external dependencies.
          Load time: {Date.now()}ms since page start.
        </p>
      </div>
    </div>
  );
};

export default DashboardMinimal;