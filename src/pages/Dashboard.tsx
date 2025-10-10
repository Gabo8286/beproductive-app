import React from "react";
import {
  CommandPalette,
  useCommandPalette,
} from "@/components/widgets/CommandPalette";
import { DateHeader } from "@/components/dashboard/DateHeader";
import { FeaturedTaskCard } from "@/components/dashboard/FeaturedTaskCard";
import { TodayTasksList } from "@/components/dashboard/TodayTasksList";
import { CycleNavigation } from "@/components/productivity/CycleNavigation";

const Dashboard: React.FC = () => {
  const commandPalette = useCommandPalette();

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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Productivity Cycle Navigation */}
      <CycleNavigation showProgress={false} />

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
    </div>
  );
};

export default Dashboard;
