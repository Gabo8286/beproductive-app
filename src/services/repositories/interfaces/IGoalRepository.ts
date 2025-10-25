import { IUserScopedRepository, IRealtimeRepository } from '@/services/repositories/interfaces/IBaseRepository';

// Goal types - simplified from the existing types
export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface GoalInsert {
  user_id: string;
  title: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  due_date?: string;
}

export interface GoalUpdate {
  title?: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  due_date?: string;
}

export interface GoalFilters {
  status?: string;
  priority?: string;
  category?: string;
  dueDate?: {
    before?: string;
    after?: string;
  };
  search?: string;
}

export interface IGoalRepository
  extends IUserScopedRepository<Goal, GoalInsert, GoalUpdate>,
          IRealtimeRepository<Goal> {

  // Goal-specific operations
  findByCategory(userId: string, category: string): Promise<Goal[]>;
  findByStatus(userId: string, status: string): Promise<Goal[]>;
  findByPriority(userId: string, priority: string): Promise<Goal[]>;
  findActiveGoals(userId: string): Promise<Goal[]>;
  findCompletedGoals(userId: string, limit?: number): Promise<Goal[]>;
  findDueGoals(userId: string, beforeDate: string): Promise<Goal[]>;

  // Progress operations
  updateProgress(userId: string, goalId: string, newValue: number): Promise<Goal>;
  incrementProgress(userId: string, goalId: string, increment: number): Promise<Goal>;
  markAsCompleted(userId: string, goalId: string): Promise<Goal>;

  // Search and filtering
  searchGoals(userId: string, query: string, filters?: GoalFilters): Promise<Goal[]>;
  getGoalStats(userId: string): Promise<{
    total: number;
    active: number;
    completed: number;
    overdue: number;
    averageProgress: number;
  }>;
}