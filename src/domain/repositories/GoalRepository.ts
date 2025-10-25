import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { SupabaseUserScopedRepository } from '@/domain/repositories/BaseRepository';

/**
 * Goal Entity Types
 */
export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  target_date?: string;
  completion_date?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  progress?: number;
  tags?: string[];
  parent_goal_id?: string;
  sub_goals?: Goal[];
}

export interface GoalInsert {
  title: string;
  description?: string;
  category: string;
  status?: 'active' | 'completed' | 'paused' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  target_date?: string;
  progress?: number;
  tags?: string[];
  parent_goal_id?: string;
}

export interface GoalUpdate {
  title?: string;
  description?: string;
  category?: string;
  status?: 'active' | 'completed' | 'paused' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  target_date?: string;
  completion_date?: string;
  progress?: number;
  tags?: string[];
  parent_goal_id?: string;
}

export interface GoalFilters {
  category?: string;
  status?: string | string[];
  priority?: string | string[];
  target_date_from?: string;
  target_date_to?: string;
  has_target_date?: boolean;
  search?: string;
  parent_goal_id?: string;
  tags?: string[];
}

/**
 * Goal Repository Interface
 */
export interface IGoalRepository {
  // Basic CRUD operations
  findByUserId(userId: string, filters?: GoalFilters): Promise<Goal[]>;
  findUserItemById(userId: string, id: string): Promise<Goal | null>;
  createForUser(userId: string, data: GoalInsert): Promise<Goal>;
  updateUserItem(userId: string, id: string, data: GoalUpdate): Promise<Goal>;
  deleteUserItem(userId: string, id: string): Promise<boolean>;

  // Specialized goal queries
  findByCategory(userId: string, category: string): Promise<Goal[]>;
  findByStatus(userId: string, status: string): Promise<Goal[]>;
  findByPriority(userId: string, priority: string): Promise<Goal[]>;
  findActiveGoals(userId: string): Promise<Goal[]>;
  findCompletedGoals(userId: string, limit?: number): Promise<Goal[]>;
  findOverdueGoals(userId: string): Promise<Goal[]>;
  findUpcomingGoals(userId: string, days?: number): Promise<Goal[]>;
  findGoalHierarchy(userId: string, parentId?: string): Promise<Goal[]>;

  // Goal analytics
  getGoalProgress(userId: string, goalId: string): Promise<number>;
  getCompletionRate(userId: string, timeframe?: 'week' | 'month' | 'year'): Promise<number>;
  getCategoryDistribution(userId: string): Promise<{ category: string; count: number }[]>;

  // Goal operations
  markCompleted(userId: string, goalId: string): Promise<Goal>;
  updateProgress(userId: string, goalId: string, progress: number): Promise<Goal>;
  archiveGoal(userId: string, goalId: string): Promise<Goal>;
}

/**
 * Enhanced Goal Repository Implementation
 * Uses the new base repository to eliminate duplication
 */
export class SupabaseGoalRepository
  extends SupabaseUserScopedRepository<Goal, GoalInsert, GoalUpdate>
  implements IGoalRepository {

  constructor(client: SupabaseClient<Database>) {
    super(client, 'goals', `
      *,
      sub_goals:goals!parent_goal_id(
        id, title, status, priority, progress, target_date
      )
    `);
  }

  // Domain-specific query methods

  async findByCategory(userId: string, category: string): Promise<Goal[]> {
    return this.findByUserId(userId, { category });
  }

  async findByStatus(userId: string, status: string): Promise<Goal[]> {
    return this.findByUserId(userId, { status });
  }

  async findByPriority(userId: string, priority: string): Promise<Goal[]> {
    return this.findByUserId(userId, { priority });
  }

  async findActiveGoals(userId: string): Promise<Goal[]> {
    return this.findByStatus(userId, 'active');
  }

  async findCompletedGoals(userId: string, limit?: number): Promise<Goal[]> {
    const filters: GoalFilters = {
      status: 'completed',
      orderBy: 'completion_date',
      orderDirection: 'desc'
    };

    if (limit) {
      filters.limit = limit;
    }

    return this.findByUserId(userId, filters);
  }

  async findOverdueGoals(userId: string): Promise<Goal[]> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await this.client
        .from('goals')
        .select(this.selectFields)
        .eq('user_id', userId)
        .eq('status', 'active')
        .not('target_date', 'is', null)
        .lt('target_date', today)
        .order('target_date', { ascending: true });

      if (error) {
        throw new Error(`Failed to find overdue goals: ${error.message}`);
      }

      return (data || []).map(goal => this.transformData(goal));
    } catch (error) {
      console.error('Error finding overdue goals:', error);
      throw error;
    }
  }

  async findUpcomingGoals(userId: string, days = 7): Promise<Goal[]> {
    try {
      const today = new Date();
      const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

      const todayStr = today.toISOString().split('T')[0];
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const { data, error } = await this.client
        .from('goals')
        .select(this.selectFields)
        .eq('user_id', userId)
        .eq('status', 'active')
        .not('target_date', 'is', null)
        .gte('target_date', todayStr)
        .lte('target_date', futureDateStr)
        .order('target_date', { ascending: true });

      if (error) {
        throw new Error(`Failed to find upcoming goals: ${error.message}`);
      }

      return (data || []).map(goal => this.transformData(goal));
    } catch (error) {
      console.error('Error finding upcoming goals:', error);
      throw error;
    }
  }

  async findGoalHierarchy(userId: string, parentId?: string): Promise<Goal[]> {
    const filters: GoalFilters = {};

    if (parentId) {
      filters.parent_goal_id = parentId;
    } else {
      // Find root goals (no parent)
      filters.parent_goal_id = null;
    }

    return this.findByUserId(userId, filters);
  }

  // Goal analytics methods

  async getGoalProgress(userId: string, goalId: string): Promise<number> {
    const goal = await this.findUserItemById(userId, goalId);
    return goal?.progress || 0;
  }

  async getCompletionRate(userId: string, timeframe: 'week' | 'month' | 'year' = 'month'): Promise<number> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (timeframe) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      const [totalGoals, completedGoals] = await Promise.all([
        this.countForUser(userId, {
          created_at_gte: startDate.toISOString()
        }),
        this.countForUser(userId, {
          status: 'completed',
          completion_date_gte: startDate.toISOString()
        })
      ]);

      return totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    } catch (error) {
      console.error('Error calculating completion rate:', error);
      return 0;
    }
  }

  async getCategoryDistribution(userId: string): Promise<{ category: string; count: number }[]> {
    try {
      const { data, error } = await this.client
        .from('goals')
        .select('category')
        .eq('user_id', userId)
        .neq('status', 'archived');

      if (error) {
        throw new Error(`Failed to get category distribution: ${error.message}`);
      }

      // Group by category and count
      const distribution = (data || []).reduce((acc, goal) => {
        const category = goal.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(distribution).map(([category, count]) => ({
        category,
        count
      }));
    } catch (error) {
      console.error('Error getting category distribution:', error);
      return [];
    }
  }

  // Goal operation methods

  async markCompleted(userId: string, goalId: string): Promise<Goal> {
    return this.updateUserItem(userId, goalId, {
      status: 'completed',
      completion_date: new Date().toISOString(),
      progress: 100
    });
  }

  async updateProgress(userId: string, goalId: string, progress: number): Promise<Goal> {
    const updateData: GoalUpdate = { progress };

    // Auto-complete if progress reaches 100%
    if (progress >= 100) {
      updateData.status = 'completed';
      updateData.completion_date = new Date().toISOString();
    }

    return this.updateUserItem(userId, goalId, updateData);
  }

  async archiveGoal(userId: string, goalId: string): Promise<Goal> {
    return this.updateUserItem(userId, goalId, {
      status: 'archived'
    });
  }

  // Override base methods for goal-specific transformations

  protected transformData(data: any): Goal {
    return {
      ...data,
      tags: data.tags || [],
      sub_goals: data.sub_goals || []
    } as Goal;
  }

  protected applyFilters(query: any, filters: Record<string, any>): any {
    // Apply base filters first
    query = super.applyFilters(query, filters);

    // Apply goal-specific filters
    const {
      target_date_from,
      target_date_to,
      has_target_date,
      search,
      tags,
      created_at_gte,
      completion_date_gte
    } = filters;

    if (target_date_from) {
      query = query.gte('target_date', target_date_from);
    }

    if (target_date_to) {
      query = query.lte('target_date', target_date_to);
    }

    if (has_target_date !== undefined) {
      if (has_target_date) {
        query = query.not('target_date', 'is', null);
      } else {
        query = query.is('target_date', null);
      }
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    if (created_at_gte) {
      query = query.gte('created_at', created_at_gte);
    }

    if (completion_date_gte) {
      query = query.gte('completion_date', completion_date_gte);
    }

    return query;
  }
}