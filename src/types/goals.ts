export type GoalStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type GoalCategory = 'personal' | 'professional' | 'health' | 'financial' | 'learning' | 'relationship' | 'other';

export interface Goal {
  id: string;
  workspace_id: string;
  title: string;
  description?: string | null;
  category: GoalCategory;
  status: GoalStatus;
  priority: number;
  progress: number;
  target_value?: number | null;
  current_value?: number | null;
  unit?: string | null;
  start_date?: string | null;
  target_date?: string | null;
  completed_at?: string | null;
  parent_goal_id?: string | null;
  created_by: string;
  assigned_to?: string | null;
  tags: string[];
  metadata: Record<string, any>;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  title: string;
  description?: string | null;
  target_date?: string | null;
  completed_at?: string | null;
  progress_percentage: number;
  priority?: number | null;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  tags?: string[] | null;
  metadata?: Record<string, any> | null;
  completion_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalInput {
  workspace_id: string;
  title: string;
  description?: string;
  category?: GoalCategory;
  status?: GoalStatus;
  priority?: number;
  target_value?: number;
  current_value?: number;
  unit?: string;
  start_date?: Date;
  target_date?: Date;
  parent_goal_id?: string;
  assigned_to?: string;
  tags?: string[];
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  category?: GoalCategory;
  status?: GoalStatus;
  priority?: number;
  progress?: number;
  target_value?: number;
  current_value?: number;
  unit?: string;
  start_date?: Date;
  target_date?: Date;
  parent_goal_id?: string;
  assigned_to?: string;
  tags?: string[];
}

export interface SharedGoal {
  id: string;
  team_id: string;
  title: string;
  description?: string | null;
  category: GoalCategory;
  status: GoalStatus;
  priority: number;
  progress: number;
  target_value?: number | null;
  current_value?: number | null;
  unit?: string | null;
  start_date?: string | null;
  target_date?: string | null;
  completed_at?: string | null;
  created_by: string;
  assigned_members: string[];
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SharedGoalMember {
  id: string;
  shared_goal_id: string;
  user_id: string;
  role: 'owner' | 'contributor' | 'viewer';
  assigned_at: string;
}

export interface CreateSharedGoalInput {
  team_id: string;
  title: string;
  description?: string;
  category?: GoalCategory;
  priority?: number;
  target_value?: number;
  current_value?: number;
  unit?: string;
  start_date?: Date;
  target_date?: Date;
  assigned_members?: string[];
  tags?: string[];
}
