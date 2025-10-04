import { Goal } from "@/types/goals";
import { Habit } from "@/types/habits";
import { Profile } from "@/types/database";
import { vi } from "vitest";

// Mock User data
export const createMockUser = (overrides: Partial<Profile> = {}): Profile => ({
  id: "user_123456",
  email: "test@example.com",
  full_name: "Test User",
  avatar_url: "https://example.com/avatar.jpg",
  role: "user",
  subscription_tier: "free",
  preferences: {},
  onboarding_completed: true,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

// Mock Goal data
export const createMockGoal = (overrides: Partial<Goal> = {}): Goal => ({
  id: "goal_123456",
  workspace_id: "workspace_123456",
  title: "Test Goal",
  description: "This is a test goal for unit testing",
  category: "personal",
  status: "active",
  priority: 2,
  progress: 50,
  target_value: 100,
  current_value: 50,
  unit: "tasks",
  start_date: "2024-01-01",
  target_date: "2024-12-31",
  completed_at: null,
  parent_goal_id: null,
  created_by: "user_123456",
  assigned_to: null,
  tags: ["test", "development"],
  metadata: {},
  position: 0,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

// Mock Task data (simplified version since we don't have full Task type)
export const createMockTask = (overrides = {}) => ({
  id: "task_123456",
  workspace_id: "workspace_123456",
  title: "Test Task",
  description: "This is a test task for unit testing",
  completed: false,
  priority: "medium",
  due_date: "2024-12-31",
  category: "work",
  tags: ["test", "development"],
  goal_id: null,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  completed_at: null,
  ...overrides,
});

// Mock Habit data
export const createMockHabit = (overrides: Partial<Habit> = {}): Habit => ({
  id: "habit_123456",
  workspace_id: "workspace_123456",
  title: "Test Habit",
  description: "This is a test habit for unit testing",
  category: "health",
  type: "build",
  frequency: "daily",
  custom_frequency: undefined,
  target_streak: 30,
  current_streak: 5,
  longest_streak: 10,
  difficulty: "medium",
  time_of_day: "morning",
  duration_minutes: 30,
  reminder_time: "08:00",
  reminder_enabled: true,
  start_date: "2024-01-01",
  end_date: null,
  is_public: false,
  tags: ["health", "fitness"],
  color: "#3B82F6",
  icon: "🏃",
  created_by: "user_123456",
  archived_at: null,
  metadata: {},
  position: 0,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

// Mock Milestone data
export const createMockMilestone = (overrides = {}) => ({
  id: "milestone_123456",
  goal_id: "goal_123456",
  title: "Test Milestone",
  description: "This is a test milestone",
  target_date: "2024-06-30",
  completed: false,
  progress: 25,
  order_index: 0,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

// Mock Progress Entry data
export const createMockProgressEntry = (overrides = {}) => ({
  id: "progress_123456",
  goal_id: "goal_123456",
  value: 10,
  notes: "Made good progress today",
  date: "2024-01-01",
  created_at: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

// Mock Habit Completion data
export const createMockHabitCompletion = (overrides = {}) => ({
  id: "completion_123456",
  habit_id: "habit_123456",
  user_id: "user_123456",
  completed_at: "2024-01-01T10:00:00.000Z",
  value: 1,
  notes: "Completed successfully",
  created_at: "2024-01-01T10:00:00.000Z",
  ...overrides,
});

// Mock Notification data
export const createMockNotification = (overrides = {}) => ({
  id: "notification_123456",
  user_id: "user_123456",
  title: "Test Notification",
  message: "This is a test notification",
  type: "info",
  read: false,
  action_url: "/dashboard",
  created_at: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

// Mock Analytics data
export const createMockAnalyticsData = (overrides = {}) => ({
  goals: {
    total: 10,
    completed: 3,
    in_progress: 5,
    overdue: 2,
  },
  tasks: {
    total: 25,
    completed: 18,
    pending: 7,
    overdue: 3,
  },
  habits: {
    total: 8,
    active: 6,
    completed_today: 4,
    average_streak: 12,
  },
  productivity: {
    score: 85,
    trend: "up",
    weekly_average: 82,
  },
  ...overrides,
});

// Create arrays of mock data
export const createMockGoals = (count: number = 5): Goal[] =>
  Array.from({ length: count }, (_, index) =>
    createMockGoal({
      id: `goal_${index + 1}`,
      title: `Test Goal ${index + 1}`,
      progress: Math.floor(Math.random() * 100),
      priority: Math.floor(Math.random() * 3) + 1,
    }),
  );

export const createMockTasks = (count: number = 10) =>
  Array.from({ length: count }, (_, index) =>
    createMockTask({
      id: `task_${index + 1}`,
      title: `Test Task ${index + 1}`,
      completed: Math.random() > 0.7,
      priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
    }),
  );

export const createMockHabits = (count: number = 8): Habit[] =>
  Array.from({ length: count }, (_, index) =>
    createMockHabit({
      id: `habit_${index + 1}`,
      title: `Test Habit ${index + 1}`,
      current_streak: Math.floor(Math.random() * 30),
      longest_streak: Math.floor(Math.random() * 100),
    }),
  );

// Form test data
export const validGoalFormData = {
  title: "Learn React Testing",
  description: "Master React testing with Vitest and Testing Library",
  category: "learning",
  priority: "high",
  target_date: "2024-12-31",
};

export const validTaskFormData = {
  title: "Write unit tests",
  description: "Create comprehensive unit tests for components",
  priority: "medium",
  due_date: "2024-06-30",
  category: "development",
};

export const validHabitFormData = {
  name: "Daily Exercise",
  description: "30 minutes of physical activity",
  category: "health",
  frequency: "daily",
  target_count: 1,
  icon: "🏃",
  color: "#3B82F6",
};

// Error scenarios
export const mockApiError = {
  message: "Network error occurred",
  status: 500,
  code: "NETWORK_ERROR",
};

export const mockValidationError = {
  message: "Validation failed",
  status: 400,
  code: "VALIDATION_ERROR",
  details: {
    title: ["Title is required"],
    email: ["Invalid email format"],
  },
};

// Authentication states
export const mockAuthStates = {
  authenticated: {
    user: createMockUser(),
    session: {
      access_token: "mock_access_token",
      refresh_token: "mock_refresh_token",
      expires_at: Date.now() + 3600000, // 1 hour from now
    },
    profile: createMockUser(),
    loading: false,
    authError: null,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    signInWithGoogle: vi.fn(),
    resetPassword: vi.fn(),
    updateProfile: vi.fn(),
    clearAuthError: vi.fn(),
  },
  unauthenticated: {
    user: null,
    session: null,
    profile: null,
    loading: false,
    authError: null,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    signInWithGoogle: vi.fn(),
    resetPassword: vi.fn(),
    updateProfile: vi.fn(),
    clearAuthError: vi.fn(),
  },
  loading: {
    user: null,
    session: null,
    profile: null,
    loading: true,
    authError: null,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    signInWithGoogle: vi.fn(),
    resetPassword: vi.fn(),
    updateProfile: vi.fn(),
    clearAuthError: vi.fn(),
  },
  error: {
    user: null,
    session: null,
    profile: null,
    loading: false,
    authError: "Authentication failed",
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    signInWithGoogle: vi.fn(),
    resetPassword: vi.fn(),
    updateProfile: vi.fn(),
    clearAuthError: vi.fn(),
  },
};

// Mobile test data
export const mockTouchEvent = {
  touches: [{ clientX: 100, clientY: 100 }],
  changedTouches: [{ clientX: 100, clientY: 100 }],
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
};

export const mockGestureEvent = {
  deltaX: 50,
  deltaY: 0,
  velocityX: 0.5,
  velocityY: 0,
  direction: "right",
  distance: 50,
};

// Performance test data
export const mockPerformanceEntry = {
  name: "component-render",
  entryType: "measure",
  startTime: 0,
  duration: 16.7, // 60fps target
};

// Accessibility test scenarios
export const accessibilityTestCases = [
  {
    name: "Keyboard navigation",
    keys: ["Tab", "Enter", "Space", "Escape"],
  },
  {
    name: "Screen reader support",
    attributes: ["aria-label", "aria-describedby", "role"],
  },
  {
    name: "Color contrast",
    ratios: { normal: 4.5, large: 3.0 },
  },
  {
    name: "Focus management",
    indicators: ["outline", "ring", "highlight"],
  },
];

export default {
  createMockUser,
  createMockGoal,
  createMockTask,
  createMockHabit,
  createMockMilestone,
  createMockProgressEntry,
  createMockHabitCompletion,
  createMockNotification,
  createMockAnalyticsData,
  createMockGoals,
  createMockTasks,
  createMockHabits,
  validGoalFormData,
  validTaskFormData,
  validHabitFormData,
  mockApiError,
  mockValidationError,
  mockAuthStates,
  mockTouchEvent,
  mockGestureEvent,
  mockPerformanceEntry,
  accessibilityTestCases,
};
