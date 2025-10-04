import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";

interface UserPreferences {
  theme: "light" | "dark" | "auto";
  enableDragDrop: boolean;
  showMotivationalMessages: boolean;
  refreshInterval: number;
  compactMode: boolean;
  celebrateMilestones: boolean;
}

interface PersonalizedContent {
  priorityTasks: any[];
  todayHabits: any[];
  streakCelebrations: string[];
  insights: string[];
  recommendations: string[];
}

export function usePersonalization() {
  const { profile } = useAuth();
  const { goals = [], isLoading: goalsLoading } = useGoals();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();

  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "auto",
    enableDragDrop: true,
    showMotivationalMessages: true,
    refreshInterval: 300000, // 5 minutes
    compactMode: false,
    celebrateMilestones: true,
  });

  // Load preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem("user-preferences");
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (error) {
        console.error("Failed to load preferences:", error);
      }
    }
  }, []);

  // Save preferences to localStorage
  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    localStorage.setItem("user-preferences", JSON.stringify(updated));
  };

  // Time-based greetings
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const greetings = {
      morning: [
        "Good morning! Ready to seize the day?",
        "Morning, traveler! What destinations await today?",
        "Rise and shine! Your journey continues.",
        "A new day, a new opportunity to grow.",
      ],
      afternoon: [
        "Good afternoon! How's your journey progressing?",
        "Afternoon check-in: You're doing great!",
        "Midday motivation: Keep pushing forward!",
        "Afternoon energy: What's next on your path?",
      ],
      evening: [
        "Good evening! Time to reflect on today's journey.",
        "Evening wind-down: What did you accomplish?",
        "As the day ends, celebrate your progress.",
        "Evening reflection: You've come so far today.",
      ],
    };

    let timeOfDay: keyof typeof greetings;
    if (hour < 12) timeOfDay = "morning";
    else if (hour < 17) timeOfDay = "afternoon";
    else timeOfDay = "evening";

    const messages = greetings[timeOfDay];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Motivational insights based on user data
  const getMotivationalInsight = () => {
    if (goalsLoading || tasksLoading) {
      return "Loading your journey data...";
    }

    const insights = [];

    // Goal progress insights
    const activeGoals = goals.filter((g) => g.status === "active");
    const avgProgress =
      activeGoals.length > 0
        ? activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) /
          activeGoals.length
        : 0;

    if (avgProgress > 75) {
      insights.push("You're crushing your goals! 🚀");
    } else if (avgProgress > 50) {
      insights.push("Great progress on your destinations! 🎯");
    }

    // Task completion
    const completedToday = tasks.filter((t) => {
      return (
        t.completed_at &&
        new Date(t.completed_at).toDateString() === new Date().toDateString()
      );
    });

    if (completedToday.length > 0) {
      insights.push(`${completedToday.length} tasks completed today! ✅`);
    }

    if (activeGoals.length > 0) {
      insights.push(`${activeGoals.length} active destinations in progress 🎯`);
    }

    return insights.length > 0
      ? insights[Math.floor(Math.random() * insights.length)]
      : "Every step forward is progress! 🌟";
  };

  // Personalized content based on user data and patterns
  const personalizedContent: PersonalizedContent = useMemo(() => {
    // Priority tasks based on due dates and importance
    const priorityTasks = tasks
      .filter((t) => t.status !== "done")
      .sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (
          (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
        );
      })
      .slice(0, 3);

    // Today's habits - placeholder since habits need workspace ID
    const todayHabits: any[] = [];

    // Streak celebrations - placeholder
    const streakCelebrations: string[] = [];

    // Personalized insights
    const activeGoals = goals.filter((g) => g.status === "active");
    const avgProgress =
      activeGoals.length > 0
        ? activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) /
          activeGoals.length
        : 0;

    const insights = [
      avgProgress > 50
        ? "You're making excellent progress on your goals!"
        : "Focus on one goal at a time for better results.",
      tasks.length > 0
        ? "Stay organized with your task list!"
        : "Break down your goals into actionable tasks.",
      "Small daily actions create big changes.",
    ];

    // Smart recommendations
    const recommendations = [];

    if (activeGoals.length === 0) {
      recommendations.push(
        "Consider setting a destination (goal) for this month",
      );
    }

    if (tasks.filter((t) => t.status !== "done").length === 0) {
      recommendations.push("Add some next steps to keep your momentum going");
    }

    return {
      priorityTasks,
      todayHabits,
      streakCelebrations,
      insights,
      recommendations,
    };
  }, [goals, tasks]);

  return {
    userPreferences: preferences,
    updatePreferences,
    personalizedContent,
    getTimeBasedGreeting,
    getMotivationalInsight,
  };
}
