import { IUserScopedRepository, IRealtimeRepository } from './IBaseRepository';
import { Database } from '@/integrations/supabase/types';

// Type definitions
export type Task = Database['public']['Tables']['tasks']['Row'] & {
  assigned_to_profile?: { full_name: string | null; avatar_url: string | null };
  created_by_profile?: { full_name: string | null; avatar_url: string | null };
};

export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export interface TaskFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  project?: string;
  tags?: string[];
  dueDate?: {
    before?: string;
    after?: string;
  };
  search?: string;
}

export interface ITaskRepository
  extends IUserScopedRepository<Task, TaskInsert, TaskUpdate>,
          IRealtimeRepository<Task> {

  // Task-specific operations
  findByProject(userId: string, projectId: string): Promise<Task[]>;
  findByStatus(userId: string, status: string): Promise<Task[]>;
  findByPriority(userId: string, priority: string): Promise<Task[]>;
  findByAssignee(userId: string, assigneeId: string): Promise<Task[]>;
  findByTags(userId: string, tags: string[]): Promise<Task[]>;
  findDueTasks(userId: string, beforeDate: string): Promise<Task[]>;
  findOverdueTasks(userId: string): Promise<Task[]>;
  findCompletedTasks(userId: string, limit?: number): Promise<Task[]>;

  // Bulk operations
  markAsCompleted(userId: string, taskId: string): Promise<Task>;
  markAsIncomplete(userId: string, taskId: string): Promise<Task>;
  assignTask(userId: string, taskId: string, assigneeId: string): Promise<Task>;
  updateTaskPositions(userId: string, taskUpdates: Array<{ id: string; position: number }>): Promise<void>;

  // Search and filtering
  searchTasks(userId: string, query: string, filters?: TaskFilters): Promise<Task[]>;
  getTaskStats(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  }>;
}