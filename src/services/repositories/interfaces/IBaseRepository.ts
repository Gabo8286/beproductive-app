/**
 * Base Repository Interface
 * Provides common CRUD operations that all repositories should implement
 */
export interface IBaseRepository<T, TInsert = Partial<T>, TUpdate = Partial<T>> {
  // Read operations
  findById(id: string): Promise<T | null>;
  findMany(filters?: Record<string, any>): Promise<T[]>;
  findByIds(ids: string[]): Promise<T[]>;

  // Write operations
  create(data: TInsert): Promise<T>;
  createMany(data: TInsert[]): Promise<T[]>;
  update(id: string, data: TUpdate): Promise<T>;
  updateMany(ids: string[], data: TUpdate): Promise<T[]>;
  delete(id: string): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;

  // Utility operations
  count(filters?: Record<string, any>): Promise<number>;
  exists(id: string): Promise<boolean>;
}

/**
 * Repository with real-time capabilities
 */
export interface IRealtimeRepository<T> {
  // Real-time subscriptions
  subscribe(
    callback: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new?: T; old?: T }) => void
  ): () => void;

  subscribeToChanges(
    filters: Record<string, any>,
    callback: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new?: T; old?: T }) => void
  ): () => void;
}

/**
 * Repository with user-scoped operations
 */
export interface IUserScopedRepository<T, TInsert = Partial<T>, TUpdate = Partial<T>>
  extends IBaseRepository<T, TInsert, TUpdate> {

  // User-scoped operations
  findByUserId(userId: string, filters?: Record<string, any>): Promise<T[]>;
  findUserItemById(userId: string, id: string): Promise<T | null>;
  createForUser(userId: string, data: TInsert): Promise<T>;
  updateUserItem(userId: string, id: string, data: TUpdate): Promise<T>;
  deleteUserItem(userId: string, id: string): Promise<void>;
  countUserItems(userId: string, filters?: Record<string, any>): Promise<number>;
}