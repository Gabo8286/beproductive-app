import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { SupabaseUserScopedRepository } from '@/services/repositories/supabase/SupabaseBaseRepository';
import { IGoalRepository, Goal, GoalInsert, GoalUpdate, GoalFilters } from '@/services/repositories/interfaces/IGoalRepository';

export class SupabaseGoalRepository
  extends SupabaseUserScopedRepository<Goal, GoalInsert, GoalUpdate>
  implements IGoalRepository {

  constructor(client: SupabaseClient<Database>) {
    super(client, 'goals');
  }

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
    let query = this.client
      .from('goals')
      .select('*')
      .eq('created_by', userId)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find completed goals: ${error.message}`);
    }

    return (data || []).map(g => ({ ...g, user_id: g.created_by, priority: String(g.priority) })) as unknown as Goal[];
  }

  async findDueGoals(userId: string, beforeDate: string): Promise<Goal[]> {
    const { data, error } = await this.client
      .from('goals')
      .select('*')
      .eq('created_by', userId)
      .lte('due_date', beforeDate)
      .neq('status', 'completed');

    if (error) {
      throw new Error(`Failed to find due goals: ${error.message}`);
    }

    return (data || []).map(g => ({ ...g, user_id: g.created_by, priority: String(g.priority) })) as unknown as Goal[];
  }

  async updateProgress(userId: string, goalId: string, newValue: number): Promise<Goal> {
    return this.updateUserItem(userId, goalId, {
      current_value: newValue,
    } as any);
  }

  async incrementProgress(userId: string, goalId: string, increment: number): Promise<Goal> {
    // First get the current goal to calculate new value
    const goal = await this.findUserItemById(userId, goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    const currentValue = goal.current_value || 0;
    const newValue = currentValue + increment;

    // Check if goal should be marked as completed
    const shouldComplete = goal.target_value && newValue >= goal.target_value;

    return this.updateUserItem(userId, goalId, {
      current_value: newValue,
      status: shouldComplete ? 'completed' : goal.status,
    } as any);
  }

  async markAsCompleted(userId: string, goalId: string): Promise<Goal> {
    return this.updateUserItem(userId, goalId, {
      status: 'completed',
    } as any);
  }

  async searchGoals(userId: string, query: string, filters?: GoalFilters): Promise<Goal[]> {
    let dbQuery = this.client
      .from('goals')
      .select('*')
      .eq('created_by', userId);

    // Text search
    if (query.trim()) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    // Apply filters
    if (filters) {
      if (filters.status) {
        dbQuery = dbQuery.eq('status', filters.status as any);
      }
      if (filters.priority) {
        dbQuery = dbQuery.eq('priority', filters.priority as any);
      }
      if (filters.category) {
        dbQuery = dbQuery.eq('category', filters.category as any);
      }
      if (filters.dueDate) {
        if (filters.dueDate.before) {
          dbQuery = dbQuery.lte('due_date', filters.dueDate.before);
        }
        if (filters.dueDate.after) {
          dbQuery = dbQuery.gte('due_date', filters.dueDate.after);
        }
      }
    }

    const { data, error } = await dbQuery;

    if (error) {
      throw new Error(`Failed to search goals: ${error.message}`);
    }

    return (data || []).map(g => ({ ...g, user_id: g.created_by, priority: String(g.priority) })) as unknown as Goal[];
  }

  async getGoalStats(userId: string): Promise<{
    total: number;
    active: number;
    completed: number;
    overdue: number;
    averageProgress: number;
  }> {
    const now = new Date().toISOString();

    const [
      { count: total },
      { count: active },
      { count: completed },
      { count: overdue },
    ] = await Promise.all([
      this.client
        .from('goals')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId),
      this.client
        .from('goals')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)
        .eq('status', 'active'),
      this.client
        .from('goals')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)
        .eq('status', 'completed'),
      this.client
        .from('goals')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)
        .lt('due_date', now)
        .neq('status', 'completed'),
    ].map(async (promise) => {
      const { count, error } = await promise;
      if (error) throw new Error(`Failed to get goal stats: ${error.message}`);
      return { count: count || 0 };
    }));

    // Calculate average progress
    const { data: goalsWithProgress, error: progressError } = await this.client
      .from('goals')
      .select('current_value, target_value')
      .eq('created_by', userId)
      .not('target_value', 'is', null);

    if (progressError) {
      throw new Error(`Failed to calculate average progress: ${progressError.message}`);
    }

    let averageProgress = 0;
    if (goalsWithProgress && goalsWithProgress.length > 0) {
      const progressValues = goalsWithProgress
        .map((goal) => {
          const current = goal.current_value || 0;
          const target = goal.target_value || 1;
          return (current / target) * 100;
        })
        .filter((progress) => progress <= 100); // Cap at 100%

      averageProgress = progressValues.length > 0
        ? progressValues.reduce((sum, progress) => sum + progress, 0) / progressValues.length
        : 0;
    }

    return {
      total: total || 0,
      active: active || 0,
      completed: completed || 0,
      overdue: overdue || 0,
      averageProgress: Math.round(averageProgress * 100) / 100, // Round to 2 decimal places
    };
  }
}