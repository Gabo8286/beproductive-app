import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { IBaseRepository, IRealtimeRepository, IUserScopedRepository } from '@/services/repositories/interfaces/IBaseRepository';

/**
 * Base Supabase Repository
 * Provides common implementation for Supabase-based repositories
 */
export abstract class SupabaseBaseRepository<T, TInsert = Partial<T>, TUpdate = Partial<T>>
  implements IBaseRepository<T, TInsert, TUpdate> {

  constructor(
    protected client: SupabaseClient<Database>,
    protected tableName: string
  ) {}

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(this.tableName as any)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to find ${this.tableName} by ID: ${error.message}`);
    }

    return data as T;
  }

  async findMany(filters: Record<string, any> = {}): Promise<T[]> {
    let query = this.client.from(this.tableName as any).select('*');

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find ${this.tableName}: ${error.message}`);
    }

    return (data || []) as T[];
  }

  async findByIds(ids: string[]): Promise<T[]> {
    if (ids.length === 0) return [];

    const { data, error } = await this.client
      .from(this.tableName as any)
      .select('*')
      .in('id', ids);

    if (error) {
      throw new Error(`Failed to find ${this.tableName} by IDs: ${error.message}`);
    }

    return (data || []) as T[];
  }

  async create(data: TInsert): Promise<T> {
    const { data: result, error } = await this.client
      .from(this.tableName as any)
      .insert(data as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create ${this.tableName}: ${error.message}`);
    }

    return result as T;
  }

  async createMany(data: TInsert[]): Promise<T[]> {
    if (data.length === 0) return [];

    const { data: result, error } = await this.client
      .from(this.tableName as any)
      .insert(data as any)
      .select();

    if (error) {
      throw new Error(`Failed to create multiple ${this.tableName}: ${error.message}`);
    }

    return (result || []) as T[];
  }

  async update(id: string, data: TUpdate): Promise<T> {
    const { data: result, error } = await this.client
      .from(this.tableName as any)
      .update(data as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update ${this.tableName}: ${error.message}`);
    }

    return result as T;
  }

  async updateMany(ids: string[], data: TUpdate): Promise<T[]> {
    if (ids.length === 0) return [];

    const { data: result, error } = await this.client
      .from(this.tableName as any)
      .update(data as any)
      .in('id', ids)
      .select();

    if (error) {
      throw new Error(`Failed to update multiple ${this.tableName}: ${error.message}`);
    }

    return (result || []) as T[];
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName as any)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete ${this.tableName}: ${error.message}`);
    }
  }

  async deleteMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    const { error } = await this.client
      .from(this.tableName as any)
      .delete()
      .in('id', ids);

    if (error) {
      throw new Error(`Failed to delete multiple ${this.tableName}: ${error.message}`);
    }
  }

  async count(filters: Record<string, any> = {}): Promise<number> {
    let query = this.client
      .from(this.tableName as any)
      .select('*', { count: 'exact', head: true });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count ${this.tableName}: ${error.message}`);
    }

    return count || 0;
  }

  async exists(id: string): Promise<boolean> {
    const { count, error } = await this.client
      .from(this.tableName as any)
      .select('id', { count: 'exact', head: true })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to check existence of ${this.tableName}: ${error.message}`);
    }

    return (count || 0) > 0;
  }
}

/**
 * User-scoped Supabase Repository
 * Adds user-scoped operations to the base repository
 */
export abstract class SupabaseUserScopedRepository<T, TInsert = Partial<T>, TUpdate = Partial<T>>
  extends SupabaseBaseRepository<T, TInsert, TUpdate>
  implements IUserScopedRepository<T, TInsert, TUpdate>, IRealtimeRepository<T> {

  async findByUserId(userId: string, filters: Record<string, any> = {}): Promise<T[]> {
    let query = this.client.from(this.tableName as any).select('*').eq('user_id', userId);

    // Apply additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find ${this.tableName} for user: ${error.message}`);
    }

    return (data || []) as T[];
  }

  async findUserItemById(userId: string, id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(this.tableName as any)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to find ${this.tableName} for user: ${error.message}`);
    }

    return data as T;
  }

  async createForUser(userId: string, data: TInsert): Promise<T> {
    const dataWithUserId = { ...data, user_id: userId } as any;
    return this.create(dataWithUserId);
  }

  async updateUserItem(userId: string, id: string, data: TUpdate): Promise<T> {
    const { data: result, error } = await this.client
      .from(this.tableName as any)
      .update(data as any)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update ${this.tableName} for user: ${error.message}`);
    }

    return result as T;
  }

  async deleteUserItem(userId: string, id: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName as any)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete ${this.tableName} for user: ${error.message}`);
    }
  }

  async countUserItems(userId: string, filters: Record<string, any> = {}): Promise<number> {
    let query = this.client
      .from(this.tableName as any)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Apply additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count ${this.tableName} for user: ${error.message}`);
    }

    return count || 0;
  }

  // Real-time subscription methods
  subscribe(
    callback: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new?: T; old?: T }) => void
  ): () => void {
    const channel = this.client
      .channel(`${this.tableName}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName,
        },
        (payload) => {
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as T,
            old: payload.old as T,
          });
        }
      )
      .subscribe();

    return () => {
      this.client.removeChannel(channel);
    };
  }

  subscribeToChanges(
    filters: Record<string, any>,
    callback: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new?: T; old?: T }) => void
  ): () => void {
    const channel = this.client
      .channel(`${this.tableName}-filtered-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName,
          filter: Object.entries(filters)
            .map(([key, value]) => `${key}=eq.${value}`)
            .join(','),
        },
        (payload) => {
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as T,
            old: payload.old as T,
          });
        }
      )
      .subscribe();

    return () => {
      this.client.removeChannel(channel);
    };
  }
}