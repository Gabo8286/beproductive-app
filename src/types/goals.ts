export interface Goal {
  id: string;
  user_id: string;
  workspace_id?: string | null;
  title: string;
  description?: string | null;
  timeline_start?: string | null;
  timeline_end?: string | null;
  status: 'active' | 'completed' | 'archived';
  progress: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  timeline_start?: Date;
  timeline_end?: Date;
  workspace_id?: string;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  timeline_start?: Date;
  timeline_end?: Date;
  status?: 'active' | 'completed' | 'archived';
  progress?: number;
}
