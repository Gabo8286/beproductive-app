import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { ITaskRepository } from './interfaces/ITaskRepository';
import { IGoalRepository } from './interfaces/IGoalRepository';
import { SupabaseTaskRepository } from './supabase/SupabaseTaskRepository';
import { SupabaseGoalRepository } from './supabase/SupabaseGoalRepository';

/**
 * Repository Factory
 * Provides a centralized way to create repository instances
 * This abstraction makes it easy to switch between different implementations
 */
export class RepositoryFactory {
  constructor(private client: SupabaseClient<Database>) {}

  createTaskRepository(): ITaskRepository {
    return new SupabaseTaskRepository(this.client);
  }

  createGoalRepository(): IGoalRepository {
    return new SupabaseGoalRepository(this.client);
  }
}

/**
 * Repository Manager
 * Provides singleton access to repositories and manages their lifecycle
 */
export class RepositoryManager {
  private static instance: RepositoryManager;
  private factory: RepositoryFactory;
  private repositories: Map<string, any> = new Map();

  private constructor(client: SupabaseClient<Database>) {
    this.factory = new RepositoryFactory(client);
  }

  static getInstance(client: SupabaseClient<Database>): RepositoryManager {
    if (!RepositoryManager.instance) {
      RepositoryManager.instance = new RepositoryManager(client);
    }
    return RepositoryManager.instance;
  }

  static resetInstance(): void {
    RepositoryManager.instance = null as any;
  }

  getTaskRepository(): ITaskRepository {
    if (!this.repositories.has('tasks')) {
      this.repositories.set('tasks', this.factory.createTaskRepository());
    }
    return this.repositories.get('tasks');
  }

  getGoalRepository(): IGoalRepository {
    if (!this.repositories.has('goals')) {
      this.repositories.set('goals', this.factory.createGoalRepository());
    }
    return this.repositories.get('goals');
  }

  // Method to clear repositories (useful for testing or when switching clients)
  clearRepositories(): void {
    this.repositories.clear();
  }
}

/**
 * Helper function to get repository manager with current Supabase client
 */
export function getRepositoryManager(client: SupabaseClient<Database>): RepositoryManager {
  return RepositoryManager.getInstance(client);
}