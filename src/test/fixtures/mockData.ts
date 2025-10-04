import { User, Session } from "@supabase/supabase-js";

// Mock User Factory
export const createMockUser = (overrides: Partial<User> = {}): User =>
  ({
    id: "test-user-id",
    email: "test@example.com",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    ...overrides,
  }) as User;

// Mock Session Factory
export const createMockSession = (overrides: Partial<Session> = {}): Session =>
  ({
    access_token: "test-access-token",
    refresh_token: "test-refresh-token",
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: "bearer",
    user: createMockUser(),
    ...overrides,
  }) as Session;

// Mock Profile Factory
export const createMockProfile = (overrides = {}) => ({
  id: "test-user-id",
  email: "test@example.com",
  full_name: "Test User",
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Mock Task Factory
export const createMockTask = (overrides = {}) => ({
  id: "test-task-id",
  title: "Test Task",
  description: "Test task description",
  status: "todo",
  priority: "medium",
  user_id: "test-user-id",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  due_date: null,
  parent_id: null,
  order: 0,
  ...overrides,
});

// Mock Goal Factory
export const createMockGoal = (overrides = {}) => ({
  id: "test-goal-id",
  title: "Test Goal",
  description: "Test goal description",
  target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  status: "active",
  user_id: "test-user-id",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  progress: 0,
  ...overrides,
});

// Mock Habit Factory
export const createMockHabit = (overrides = {}) => ({
  id: "test-habit-id",
  name: "Test Habit",
  description: "Test habit description",
  frequency: "daily",
  user_id: "test-user-id",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  color: "#3b82f6",
  icon: "✓",
  streak: 0,
  ...overrides,
});

// Mock Quick Todo Factory
export const createMockQuickTodo = (overrides = {}) => ({
  id: "test-todo-id",
  text: "Test Quick Todo",
  completed: false,
  user_id: "test-user-id",
  created_at: new Date().toISOString(),
  order: 0,
  ...overrides,
});
