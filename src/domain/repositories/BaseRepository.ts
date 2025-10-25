import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

/**
 * Base Repository Interface
 * Defines common repository operations for all entities
 */
export interface IBaseRepository<T, TInsert, TUpdate> {
  findById(id: string): Promise<T | null>;
  findAll(filters?: Record<string, any>): Promise<T[]>;
  create(data: TInsert): Promise<T>;
  update(id: string, data: TUpdate): Promise<T>;
  delete(id: string): Promise<boolean>;
  count(filters?: Record<string, any>): Promise<number>;
}

/**
 * User-scoped Repository Interface
 * For entities that belong to specific users
 */
export interface IUserScopedRepository<T, TInsert, TUpdate> extends IBaseRepository<T, TInsert, TUpdate> {
  findByUserId(userId: string, filters?: Record<string, any>): Promise<T[]>;
  findUserItemById(userId: string, id: string): Promise<T | null>;
  createForUser(userId: string, data: TInsert): Promise<T>;
  updateUserItem(userId: string, id: string, data: TUpdate): Promise<T>;
  deleteUserItem(userId: string, id: string): Promise<boolean>;
  countForUser(userId: string, filters?: Record<string, any>): Promise<number>;
}

/**
 * Enhanced Base Repository Implementation
 * Eliminates duplication across all Supabase repositories
 */
export abstract class SupabaseBaseRepository<T, TInsert, TUpdate> implements IBaseRepository<T, TInsert, TUpdate> {
  protected client: SupabaseClient<Database>;
  protected tableName: string;
  protected selectFields: string;

  constructor(client: SupabaseClient<Database>, tableName: string, selectFields = '*') {
    this.client = client;
    this.tableName = tableName;
    this.selectFields = selectFields;
  }

  /**
   * Find entity by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select(this.selectFields)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(`Failed to find ${this.tableName} by ID: ${error.message}`);
      }

      return this.transformData(data);
    } catch (error) {
      console.error(`Error finding ${this.tableName} by ID:`, error);
      throw error;
    }
  }

  /**
   * Find all entities with optional filters
   */
  async findAll(filters: Record<string, any> = {}): Promise<T[]> {
    try {
      let query = this.client
        .from(this.tableName)
        .select(this.selectFields);

      // Apply filters
      query = this.applyFilters(query, filters);

      // Apply sorting
      query = this.applySorting(query, filters);

      // Apply pagination
      query = this.applyPagination(query, filters);

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to find ${this.tableName}: ${error.message}`);
      }

      return (data || []).map(item => this.transformData(item));
    } catch (error) {
      console.error(`Error finding ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Create new entity
   */
  async create(data: TInsert): Promise<T> {
    try {
      const insertData = this.prepareInsertData(data);

      const { data: result, error } = await this.client
        .from(this.tableName)
        .insert(insertData)
        .select(this.selectFields)
        .single();

      if (error) {
        throw new Error(`Failed to create ${this.tableName}: ${error.message}`);
      }

      return this.transformData(result);
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Update existing entity
   */
  async update(id: string, data: TUpdate): Promise<T> {
    try {
      const updateData = this.prepareUpdateData(data);

      const { data: result, error } = await this.client
        .from(this.tableName)
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(this.selectFields)
        .single();

      if (error) {
        throw new Error(`Failed to update ${this.tableName}: ${error.message}`);
      }

      return this.transformData(result);
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Delete entity
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete ${this.tableName}: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      return false;
    }
  }

  /**
   * Count entities with optional filters
   */
  async count(filters: Record<string, any> = {}): Promise<number> {
    try {
      let query = this.client
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      query = this.applyFilters(query, filters);

      const { count, error } = await query;

      if (error) {
        throw new Error(`Failed to count ${this.tableName}: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      console.error(`Error counting ${this.tableName}:`, error);
      throw error;
    }
  }

  // Protected helper methods that can be overridden by subclasses

  /**
   * Apply filters to query
   */
  protected applyFilters(query: any, filters: Record<string, any>): any {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !this.isSpecialFilter(key)) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === 'string' && value.includes('%')) {
          query = query.like(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    });
    return query;
  }

  /**
   * Apply sorting to query
   */
  protected applySorting(query: any, filters: Record<string, any>): any {
    const { orderBy, orderDirection = 'desc' } = filters;
    if (orderBy) {
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });
    } else {
      // Default sorting by updated_at
      query = query.order('updated_at', { ascending: false });
    }
    return query;
  }

  /**
   * Apply pagination to query
   */
  protected applyPagination(query: any, filters: Record<string, any>): any {
    const { limit, offset } = filters;
    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.range(offset, offset + (limit || 50) - 1);
    }
    return query;
  }

  /**
   * Check if filter key is special (not a column filter)
   */
  protected isSpecialFilter(key: string): boolean {
    return ['orderBy', 'orderDirection', 'limit', 'offset'].includes(key);
  }

  /**
   * Transform raw data from database
   * Override in subclasses for custom transformations
   */
  protected transformData(data: any): T {
    return data as T;
  }

  /**
   * Prepare data for insert
   * Override in subclasses for custom preparations
   */
  protected prepareInsertData(data: TInsert): any {
    return {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Prepare data for update
   * Override in subclasses for custom preparations
   */
  protected prepareUpdateData(data: TUpdate): any {
    return data;
  }
}

/**
 * User-Scoped Repository Implementation
 * For entities that belong to specific users
 */
export abstract class SupabaseUserScopedRepository<T, TInsert, TUpdate>
  extends SupabaseBaseRepository<T, TInsert, TUpdate>
  implements IUserScopedRepository<T, TInsert, TUpdate> {

  protected userIdField: string;

  constructor(client: SupabaseClient<Database>, tableName: string, selectFields = '*', userIdField = 'user_id') {
    super(client, tableName, selectFields);
    this.userIdField = userIdField;
  }

  /**
   * Find entities by user ID with optional filters
   */
  async findByUserId(userId: string, filters: Record<string, any> = {}): Promise<T[]> {
    const userFilters = { ...filters, [this.userIdField]: userId };
    return this.findAll(userFilters);
  }

  /**
   * Find specific user's entity by ID
   */
  async findUserItemById(userId: string, id: string): Promise<T | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select(this.selectFields)
        .eq('id', id)
        .eq(this.userIdField, userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`Failed to find ${this.tableName} for user: ${error.message}`);
      }

      return this.transformData(data);
    } catch (error) {
      console.error(`Error finding ${this.tableName} for user:`, error);
      throw error;
    }
  }

  /**
   * Create entity for specific user
   */
  async createForUser(userId: string, data: TInsert): Promise<T> {
    const userScopedData = { ...data, [this.userIdField]: userId } as TInsert;
    return this.create(userScopedData);
  }

  /**
   * Update user's specific entity
   */
  async updateUserItem(userId: string, id: string, data: TUpdate): Promise<T> {
    try {
      const updateData = this.prepareUpdateData(data);

      const { data: result, error } = await this.client
        .from(this.tableName)
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq(this.userIdField, userId)
        .select(this.selectFields)
        .single();

      if (error) {
        throw new Error(`Failed to update ${this.tableName} for user: ${error.message}`);
      }

      return this.transformData(result);
    } catch (error) {
      console.error(`Error updating ${this.tableName} for user:`, error);
      throw error;
    }
  }

  /**
   * Delete user's specific entity
   */
  async deleteUserItem(userId: string, id: string): Promise<boolean> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .eq(this.userIdField, userId);

      if (error) {
        throw new Error(`Failed to delete ${this.tableName} for user: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting ${this.tableName} for user:`, error);
      return false;
    }
  }

  /**
   * Count user's entities with optional filters
   */
  async countForUser(userId: string, filters: Record<string, any> = {}): Promise<number> {
    const userFilters = { ...filters, [this.userIdField]: userId };
    return this.count(userFilters);
  }

  /**
   * Override to add user_id to insert data
   */
  protected prepareInsertData(data: TInsert): any {
    return {
      ...super.prepareInsertData(data),
      created_by: this.extractUserId(data),
    };
  }

  /**
   * Extract user ID from data (can be overridden)
   */
  protected extractUserId(data: any): string {
    return data[this.userIdField] || data.user_id || data.created_by;
  }
}

/**
 * Repository Factory
 * Centralizes repository creation and management
 */
export class RepositoryFactory {
  private static instance: RepositoryFactory;
  private repositories: Map<string, any> = new Map();

  private constructor(private client: SupabaseClient<Database>) {}

  static getInstance(client: SupabaseClient<Database>): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory(client);
    }
    return RepositoryFactory.instance;
  }

  register<T>(name: string, repository: T): void {
    this.repositories.set(name, repository);
  }

  get<T>(name: string): T {
    const repository = this.repositories.get(name);
    if (!repository) {
      throw new Error(`Repository '${name}' not found`);
    }
    return repository;
  }

  clear(): void {
    this.repositories.clear();
  }
}