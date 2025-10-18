import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { SupabaseUserScopedRepository } from './SupabaseBaseRepository';
import { ITaskRepository, Task, TaskInsert, TaskUpdate, TaskFilters } from '../interfaces/ITaskRepository';

export class SupabaseTaskRepository
  extends SupabaseUserScopedRepository<Task, TaskInsert, TaskUpdate>
  implements ITaskRepository {

  constructor(client: SupabaseClient<Database>) {
    super(client, 'tasks');
  }

  // Override to include profile joins
  async findUserItemById(userId: string, id: string): Promise<Task | null> {
    const { data, error } = await (this.client
      .from('tasks')
      .select(`
        *,
        assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name, avatar_url),
        created_by_profile:profiles!tasks_created_by_fkey(full_name, avatar_url)
      `) as any)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find task for user: ${error.message}`);
    }

    return data as Task;
  }

  async findByUserId(userId: string, filters: Record<string, any> = {}): Promise<Task[]> {
    let query: any = (this.client as any)
      .from('tasks')
      .select(`
        *,
        assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name, avatar_url),
        created_by_profile:profiles!tasks_created_by_fkey(full_name, avatar_url)
      `)
      .eq('user_id', userId);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find tasks for user: ${error.message}`);
    }

    return (data || []) as Task[];
  }

  async findByProject(userId: string, projectId: string): Promise<Task[]> {
    return this.findByUserId(userId, { project_id: projectId });
  }

  async findByStatus(userId: string, status: string): Promise<Task[]> {
    return this.findByUserId(userId, { status });
  }

  async findByPriority(userId: string, priority: string): Promise<Task[]> {
    return this.findByUserId(userId, { priority });
  }

  async findByAssignee(userId: string, assigneeId: string): Promise<Task[]> {
    return this.findByUserId(userId, { assigned_to: assigneeId });
  }

  async findByTags(userId: string, tags: string[]): Promise<Task[]> {
    if (tags.length === 0) return [];

    const { data, error } = await ((this.client as any)
      .from('tasks')
      .select(`
        *,
        assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name, avatar_url),
        created_by_profile:profiles!tasks_created_by_fkey(full_name, avatar_url)
      `)
      .eq('user_id', userId)
      .overlaps('tags', tags));

    if (error) {
      throw new Error(`Failed to find tasks by tags: ${error.message}`);
    }

    return (data || []) as Task[];
  }

  async findDueTasks(userId: string, beforeDate: string): Promise<Task[]> {
    const { data, error } = await ((this.client as any)
      .from('tasks')
      .select(`
        *,
        assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name, avatar_url),
        created_by_profile:profiles!tasks_created_by_fkey(full_name, avatar_url)
      `)
      .eq('user_id', userId)
      .lte('due_date', beforeDate)
      .neq('status', 'done'));

    if (error) {
      throw new Error(`Failed to find due tasks: ${error.message}`);
    }

    return (data || []) as Task[];
  }

  async findOverdueTasks(userId: string): Promise<Task[]> {
    const now = new Date().toISOString();
    return this.findDueTasks(userId, now);
  }

  async findCompletedTasks(userId: string, limit?: number): Promise<Task[]> {
    let query: any = (this.client as any)
      .from('tasks')
      .select(`
        *,
        assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name, avatar_url),
        created_by_profile:profiles!tasks_created_by_fkey(full_name, avatar_url)
      `)
      .eq('user_id', userId)
      .eq('status', 'done')
      .order('completed_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find completed tasks: ${error.message}`);
    }

    return (data || []) as Task[];
  }

  async markAsCompleted(userId: string, taskId: string): Promise<Task> {
    return this.updateUserItem(userId, taskId, {
      status: 'done',
      completed_at: new Date().toISOString(),
    } as any);
  }

  async markAsIncomplete(userId: string, taskId: string): Promise<Task> {
    return this.updateUserItem(userId, taskId, {
      status: 'todo',
      completed_at: null,
    });
  }

  async assignTask(userId: string, taskId: string, assigneeId: string): Promise<Task> {
    return this.updateUserItem(userId, taskId, {
      assigned_to: assigneeId,
    });
  }

  async updateTaskPositions(
    userId: string,
    taskUpdates: Array<{ id: string; position: number }>
  ): Promise<void> {
    const updates = taskUpdates.map(({ id, position }) => ({
      id,
      position,
      user_id: userId,
    }));

    const { error } = await this.client
      .from('tasks')
      .upsert(updates as any);

    if (error) {
      throw new Error(`Failed to update task positions: ${error.message}`);
    }
  }

  async searchTasks(userId: string, query: string, filters?: TaskFilters): Promise<Task[]> {
    let dbQuery: any = (this.client as any)
      .from('tasks')
      .select(`
        *,
        assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name, avatar_url),
        created_by_profile:profiles!tasks_created_by_fkey(full_name, avatar_url)
      `)
      .eq('user_id', userId);

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
      if (filters.assignedTo) {
        dbQuery = dbQuery.eq('assigned_to', filters.assignedTo);
      }
      if (filters.project) {
        dbQuery = dbQuery.eq('project_id', filters.project);
      }
      if (filters.tags && filters.tags.length > 0) {
        dbQuery = dbQuery.overlaps('tags', filters.tags);
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
      throw new Error(`Failed to search tasks: ${error.message}`);
    }

    return (data || []) as Task[];
  }

  async getTaskStats(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  }> {
    const now = new Date().toISOString();

    const [
      { count: total },
      { count: completed },
      { count: pending },
      { count: overdue },
    ] = await Promise.all([
      (this.client as any)
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      (this.client as any)
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'done'),
      (this.client as any)
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .neq('status', 'done'),
      (this.client as any)
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .lt('due_date', now)
        .neq('status', 'done'),
    ].map(async (promise: any) => {
      const { count, error } = await promise;
      if (error) throw new Error(`Failed to get task stats: ${error.message}`);
      return { count: count || 0 };
    }));

    return {
      total: total || 0,
      completed: completed || 0,
      pending: pending || 0,
      overdue: overdue || 0,
    };
  }
}