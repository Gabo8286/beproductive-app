import { UserRole } from '@/types/roles';

export type WorkspaceType = "personal" | "team" | "organization";
export type MemberRole = "member" | "admin" | "owner";
export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type SubscriptionTier = "free" | "pro" | "team" | "enterprise";
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing";

// Base profile interface matching actual database schema (no role field)
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: string;
  preferences: Record<string, any>;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Enhanced profile interface with role data (from get_user_profile_with_role function)
export interface ProfileWithRole extends Profile {
  role: UserRole;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  type: WorkspaceType;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  estimated_duration: number | null;
  actual_duration: number | null;
  assigned_to: string | null;
  created_by: string;
  parent_task_id: string | null;
  tags: string[];
  position: number;
  completed_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}
