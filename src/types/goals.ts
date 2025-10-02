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
