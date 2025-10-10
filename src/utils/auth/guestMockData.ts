// Mock data for guest mode users - simulates real application data
import { Goal } from "@/types/goals";
import { Habit } from "@/types/habits";
import { Profile } from "@/types/database";
import { GuestUserType } from "./guestMode";

// Generate consistent IDs based on user type
const generateId = (type: GuestUserType, entity: string, index: number = 0): string => {
  return `${type}_${entity}_${index.toString().padStart(3, '0')}`;
};

// Guest Admin Mock Data
export const createGuestAdminMockData = () => {
  const adminId = "guest-admin-id";
  const workspaceId = generateId('admin', 'workspace', 1);

  // Admin Goals - More comprehensive and strategic
  const adminGoals: Goal[] = [
    {
      id: generateId('admin', 'goal', 1),
      workspace_id: workspaceId,
      title: "Launch BeProductive v2.0",
      description: "Complete development and launch of the new BeProductive platform with all advanced features",
      category: "business",
      status: "active",
      priority: 3,
      progress: 75,
      target_value: 100,
      current_value: 75,
      unit: "percent",
      start_date: "2024-01-01",
      target_date: "2024-12-31",
      completed_at: null,
      parent_goal_id: null,
      created_by: adminId,
      assigned_to: null,
      tags: ["product", "launch", "strategic"],
      metadata: { strategic_priority: "high", revenue_impact: "major" },
      position: 0,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-10-09T00:00:00.000Z",
    },
    {
      id: generateId('admin', 'goal', 2),
      workspace_id: workspaceId,
      title: "Scale Team to 50 Members",
      description: "Grow engineering and product teams to support rapid expansion",
      category: "business",
      status: "active",
      priority: 2,
      progress: 45,
      target_value: 50,
      current_value: 23,
      unit: "people",
      start_date: "2024-01-01",
      target_date: "2024-06-30",
      completed_at: null,
      parent_goal_id: null,
      created_by: adminId,
      assigned_to: null,
      tags: ["hiring", "growth", "team"],
      metadata: { department: "all", budget_allocated: "2M" },
      position: 1,
      created_at: "2024-01-15T00:00:00.000Z",
      updated_at: "2024-10-09T00:00:00.000Z",
    },
    {
      id: generateId('admin', 'goal', 3),
      workspace_id: workspaceId,
      title: "Achieve $10M ARR",
      description: "Reach 10 million dollars in Annual Recurring Revenue",
      category: "business",
      status: "active",
      priority: 3,
      progress: 62,
      target_value: 10000000,
      current_value: 6200000,
      unit: "dollars",
      start_date: "2024-01-01",
      target_date: "2024-12-31",
      completed_at: null,
      parent_goal_id: null,
      created_by: adminId,
      assigned_to: null,
      tags: ["revenue", "growth", "milestone"],
      metadata: { quarterly_targets: [2500000, 2500000, 2500000, 2500000] },
      position: 2,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-10-09T00:00:00.000Z",
    },
    {
      id: generateId('admin', 'goal', 4),
      workspace_id: workspaceId,
      title: "Implement AI-Driven Analytics",
      description: "Deploy Luna AI across all productivity modules with advanced analytics",
      category: "technology",
      status: "active",
      priority: 2,
      progress: 80,
      target_value: 100,
      current_value: 80,
      unit: "percent",
      start_date: "2024-03-01",
      target_date: "2024-11-30",
      completed_at: null,
      parent_goal_id: generateId('admin', 'goal', 1),
      created_by: adminId,
      assigned_to: null,
      tags: ["ai", "analytics", "innovation"],
      metadata: { ai_models: ["GPT-4", "Claude"], integration_points: 12 },
      position: 3,
      created_at: "2024-03-01T00:00:00.000Z",
      updated_at: "2024-10-09T00:00:00.000Z",
    }
  ];

  // Admin Habits - Leadership and strategic habits
  const adminHabits: Habit[] = [
    {
      id: generateId('admin', 'habit', 1),
      workspace_id: workspaceId,
      title: "Daily Strategic Review",
      description: "Review key metrics, team progress, and strategic initiatives every morning",
      category: "productivity",
      type: "build",
      frequency: "daily",
      custom_frequency: undefined,
      target_streak: 365,
      current_streak: 89,
      longest_streak: 127,
      difficulty: "medium",
      time_of_day: "morning",
      duration_minutes: 30,
      reminder_time: "07:00",
      reminder_enabled: true,
      start_date: "2024-01-01",
      end_date: null,
      is_public: false,
      tags: ["leadership", "strategy", "review"],
      color: "#8B5CF6",
      icon: "📊",
      created_by: adminId,
      archived_at: null,
      metadata: { impact_score: 95, business_critical: true },
      position: 0,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-10-09T00:00:00.000Z",
    },
    {
      id: generateId('admin', 'habit', 2),
      workspace_id: workspaceId,
      title: "Team One-on-Ones",
      description: "Conduct weekly one-on-one meetings with direct reports",
      category: "leadership",
      type: "build",
      frequency: "weekly",
      custom_frequency: undefined,
      target_streak: 52,
      current_streak: 12,
      longest_streak: 24,
      difficulty: "medium",
      time_of_day: "afternoon",
      duration_minutes: 45,
      reminder_time: "14:00",
      reminder_enabled: true,
      start_date: "2024-01-01",
      end_date: null,
      is_public: false,
      tags: ["leadership", "team", "communication"],
      color: "#10B981",
      icon: "👥",
      created_by: adminId,
      archived_at: null,
      metadata: { team_size: 8, satisfaction_score: 4.7 },
      position: 1,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-10-09T00:00:00.000Z",
    },
    {
      id: generateId('admin', 'habit', 3),
      workspace_id: workspaceId,
      title: "Industry Research",
      description: "Stay updated with latest productivity and AI trends",
      category: "learning",
      type: "build",
      frequency: "daily",
      custom_frequency: undefined,
      target_streak: 365,
      current_streak: 156,
      longest_streak: 203,
      difficulty: "easy",
      time_of_day: "evening",
      duration_minutes: 20,
      reminder_time: "19:00",
      reminder_enabled: true,
      start_date: "2024-01-01",
      end_date: null,
      is_public: false,
      tags: ["research", "innovation", "trends"],
      color: "#3B82F6",
      icon: "🔬",
      created_by: adminId,
      archived_at: null,
      metadata: { sources: ["TechCrunch", "ProductHunt", "Hacker News"], insights_count: 47 },
      position: 2,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-10-09T00:00:00.000Z",
    }
  ];

  return {
    goals: adminGoals,
    habits: adminHabits,
    analytics: {
      goals: {
        total: 4,
        completed: 0,
        in_progress: 4,
        overdue: 0,
      },
      tasks: {
        total: 47,
        completed: 32,
        pending: 12,
        overdue: 3,
      },
      habits: {
        total: 3,
        active: 3,
        completed_today: 2,
        average_streak: 119,
      },
      productivity: {
        score: 92,
        trend: "up",
        weekly_average: 89,
      },
    }
  };
};

// Guest User Mock Data
export const createGuestUserMockData = () => {
  const userId = "guest-user-id";
  const workspaceId = generateId('user', 'workspace', 1);

  // User Goals - Personal and professional development
  const userGoals: Goal[] = [
    {
      id: generateId('user', 'goal', 1),
      workspace_id: workspaceId,
      title: "Complete React Certification",
      description: "Earn React Developer Certification to advance my frontend development skills",
      category: "learning",
      status: "active",
      priority: 2,
      progress: 60,
      target_value: 100,
      current_value: 60,
      unit: "percent",
      start_date: "2024-09-01",
      target_date: "2024-12-15",
      completed_at: null,
      parent_goal_id: null,
      created_by: userId,
      assigned_to: null,
      tags: ["learning", "react", "certification"],
      metadata: { course_provider: "React Training", modules_completed: 6 },
      position: 0,
      created_at: "2024-09-01T00:00:00.000Z",
      updated_at: "2024-10-09T00:00:00.000Z",
    },
    {
      id: generateId('user', 'goal', 2),
      workspace_id: workspaceId,
      title: "Build Personal Portfolio",
      description: "Create a stunning portfolio website showcasing my projects and skills",
      category: "career",
      status: "active",
      priority: 2,
      progress: 35,
      target_value: 10,
      current_value: 4,
      unit: "projects",
      start_date: "2024-08-15",
      target_date: "2024-11-30",
      completed_at: null,
      parent_goal_id: null,
      created_by: userId,
      assigned_to: null,
      tags: ["portfolio", "projects", "career"],
      metadata: { tech_stack: ["React", "TypeScript", "Tailwind"], deployed: false },
      position: 1,
      created_at: "2024-08-15T00:00:00.000Z",
      updated_at: "2024-10-09T00:00:00.000Z",
    },
    {
      id: generateId('user', 'goal', 3),
      workspace_id: workspaceId,
      title: "Run 5K Under 25 Minutes",
      description: "Improve running endurance and speed to achieve a sub-25 minute 5K",
      category: "health",
      status: "active",
      priority: 1,
      progress: 70,
      target_value: 25,
      current_value: 27.5,
      unit: "minutes",
      start_date: "2024-07-01",
      target_date: "2024-12-01",
      completed_at: null,
      parent_goal_id: null,
      created_by: userId,
      assigned_to: null,
      tags: ["fitness", "running", "endurance"],
      metadata: { current_best: "27:30", training_plan: "Couch to 5K", runs_per_week: 3 },
      position: 2,
      created_at: "2024-07-01T00:00:00.000Z",
      updated_at: "2024-10-09T00:00:00.000Z",
    }
  ];

  // User Habits - Personal development and wellness
  const userHabits: Habit[] = [
    {
      id: generateId('user', 'habit', 1),
      workspace_id: workspaceId,
      title: "Morning Coding Practice",
      description: "Practice coding algorithms and data structures for 1 hour each morning",
      category: "learning",
      type: "build",
      frequency: "daily",
      custom_frequency: undefined,
      target_streak: 100,
      current_streak: 23,
      longest_streak: 45,
      difficulty: "medium",
      time_of_day: "morning",
      duration_minutes: 60,
      reminder_time: "08:00",
      reminder_enabled: true,
      start_date: "2024-09-15",
      end_date: null,
      is_public: false,
      tags: ["coding", "algorithms", "practice"],
      color: "#F59E0B",
      icon: "💻",
      created_by: userId,
      archived_at: null,
      metadata: { platforms: ["LeetCode", "HackerRank"], problems_solved: 87 },
      position: 0,
      created_at: "2024-09-15T00:00:00.000Z",
      updated_at: "2024-10-09T00:00:00.000Z",
    },
    {
      id: generateId('user', 'habit', 2),
      workspace_id: workspaceId,
      title: "Evening Jog",
      description: "30-minute jog in the park to build endurance and clear mind",
      category: "health",
      type: "build",
      frequency: "daily",
      custom_frequency: undefined,
      target_streak: 90,
      current_streak: 34,
      longest_streak: 56,
      difficulty: "medium",
      time_of_day: "evening",
      duration_minutes: 30,
      reminder_time: "18:30",
      reminder_enabled: true,
      start_date: "2024-07-01",
      end_date: null,
      is_public: false,
      tags: ["running", "fitness", "cardio"],
      color: "#EF4444",
      icon: "🏃",
      created_by: userId,
      archived_at: null,
      metadata: { average_pace: "6:30/km", total_distance: "245km" },
      position: 1,
      created_at: "2024-07-01T00:00:00.000Z",
      updated_at: "2024-10-09T00:00:00.000Z",
    },
    {
      id: generateId('user', 'habit', 3),
      workspace_id: workspaceId,
      title: "Read Tech Articles",
      description: "Read 3 technical articles daily to stay updated with industry trends",
      category: "learning",
      type: "build",
      frequency: "daily",
      custom_frequency: undefined,
      target_streak: 365,
      current_streak: 67,
      longest_streak: 89,
      difficulty: "easy",
      time_of_day: "evening",
      duration_minutes: 20,
      reminder_time: "20:00",
      reminder_enabled: true,
      start_date: "2024-08-01",
      end_date: null,
      is_public: false,
      tags: ["reading", "technology", "learning"],
      color: "#6366F1",
      icon: "📖",
      created_by: userId,
      archived_at: null,
      metadata: { sources: ["Dev.to", "Medium", "CSS-Tricks"], articles_read: 201 },
      position: 2,
      created_at: "2024-08-01T00:00:00.000Z",
      updated_at: "2024-10-09T00:00:00.000Z",
    },
    {
      id: generateId('user', 'habit', 4),
      workspace_id: workspaceId,
      title: "Meditation",
      description: "10 minutes of mindfulness meditation for mental clarity and stress relief",
      category: "wellness",
      type: "build",
      frequency: "daily",
      custom_frequency: undefined,
      target_streak: 180,
      current_streak: 78,
      longest_streak: 102,
      difficulty: "easy",
      time_of_day: "morning",
      duration_minutes: 10,
      reminder_time: "07:30",
      reminder_enabled: true,
      start_date: "2024-07-20",
      end_date: null,
      is_public: false,
      tags: ["meditation", "mindfulness", "wellness"],
      color: "#059669",
      icon: "🧘",
      created_by: userId,
      archived_at: null,
      metadata: { app: "Headspace", total_sessions: 156, stress_level: "low" },
      position: 3,
      created_at: "2024-07-20T00:00:00.000Z",
      updated_at: "2024-10-09T00:00:00.000Z",
    }
  ];

  return {
    goals: userGoals,
    habits: userHabits,
    analytics: {
      goals: {
        total: 3,
        completed: 0,
        in_progress: 3,
        overdue: 0,
      },
      tasks: {
        total: 18,
        completed: 12,
        pending: 5,
        overdue: 1,
      },
      habits: {
        total: 4,
        active: 4,
        completed_today: 3,
        average_streak: 50,
      },
      productivity: {
        score: 78,
        trend: "up",
        weekly_average: 75,
      },
    }
  };
};

// Main function to get mock data based on guest type
export const getGuestMockData = (type: GuestUserType) => {
  switch (type) {
    case 'admin':
      return createGuestAdminMockData();
    case 'user':
      return createGuestUserMockData();
    default:
      return createGuestUserMockData();
  }
};

// Helper function to check if current user is using mock data
export const isUsingMockData = (userId: string | undefined): boolean => {
  return userId === 'guest-admin-id' || userId === 'guest-user-id';
};

// Get mock data by user ID
export const getMockDataByUserId = (userId: string) => {
  if (userId === 'guest-admin-id') {
    return createGuestAdminMockData();
  } else if (userId === 'guest-user-id') {
    return createGuestUserMockData();
  }
  return null;
};