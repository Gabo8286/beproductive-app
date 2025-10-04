# API Integration Agent 🔌

## Purpose
Handle API connections, data flow, offline synchronization, and Supabase database operations for the BeProductive framework, ensuring robust error handling and optimal performance.

## Capabilities
- Creates new API endpoints and service layers
- Implements offline sync capabilities with IndexedDB
- Sets up proper error handling and retry logic
- Manages Supabase database operations
- Handles authentication and authorization
- Implements real-time subscriptions
- Creates API response caching strategies
- Manages file uploads and storage

## Tech Stack
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **HTTP Client**: Fetch API with custom wrapper
- **State Management**: Tanstack Query for server state
- **Offline Storage**: IndexedDB via custom hooks
- **Real-time**: Supabase Realtime subscriptions
- **Authentication**: Supabase Auth with JWT
- **File Storage**: Supabase Storage buckets

## API Service Templates

### Base API Service Template
```typescript
// src/services/[resource]Service.ts
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type [Resource] = Database['public']['Tables']['[table_name]']['Row'];
type [Resource]Insert = Database['public']['Tables']['[table_name]']['Insert'];
type [Resource]Update = Database['public']['Tables']['[table_name]']['Update'];

export class [Resource]Service {
  private static instance: [Resource]Service;

  private constructor() {}

  static getInstance(): [Resource]Service {
    if (!this.instance) {
      this.instance = new [Resource]Service();
    }
    return this.instance;
  }

  async getAll(userId: string): Promise<[Resource][]> {
    const { data, error } = await supabase
      .from('[table_name]')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<[Resource] | null> {
    const { data, error } = await supabase
      .from('[table_name]')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async create(data: [Resource]Insert): Promise<[Resource]> {
    const { data: created, error } = await supabase
      .from('[table_name]')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return created;
  }

  async update(id: string, updates: [Resource]Update): Promise<[Resource]> {
    const { data: updated, error } = await supabase
      .from('[table_name]')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('[table_name]')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async batchCreate(items: [Resource]Insert[]): Promise<[Resource][]> {
    const { data, error } = await supabase
      .from('[table_name]')
      .insert(items)
      .select();

    if (error) throw error;
    return data || [];
  }

  async search(query: string): Promise<[Resource][]> {
    const { data, error } = await supabase
      .from('[table_name]')
      .select('*')
      .textSearch('title', query, {
        type: 'websearch',
        config: 'english'
      });

    if (error) throw error;
    return data || [];
  }
}

export const [resource]Service = [Resource]Service.getInstance();
```

### React Query Hook Template
```typescript
// src/hooks/api/use[Resource].ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { [resource]Service } from '@/services/[resource]Service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export function use[Resource]s() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['[resources]', user?.id],
    queryFn: () => [resource]Service.getAll(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function use[Resource](id: string) {
  return useQuery({
    queryKey: ['[resource]', id],
    queryFn: () => [resource]Service.getById(id),
    enabled: !!id,
  });
}

export function useCreate[Resource]() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { queueAction } = useOfflineSync();

  return useMutation({
    mutationFn: async (data: [Resource]Insert) => {
      if (!navigator.onLine) {
        // Queue for offline sync
        await queueAction('CREATE', '[resources]', data);
        return data as [Resource];
      }
      return [resource]Service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['[resources]'] });
      toast({
        title: '[Resource] created',
        description: 'Your [resource] has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdate[Resource]() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { queueAction } = useOfflineSync();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: [Resource]Update }) => {
      if (!navigator.onLine) {
        await queueAction('UPDATE', '[resources]', { id, ...updates });
        return { id, ...updates } as [Resource];
      }
      return [resource]Service.update(id, updates);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['[resources]'] });
      queryClient.invalidateQueries({ queryKey: ['[resource]', data.id] });
      toast({
        title: '[Resource] updated',
        description: 'Your changes have been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDelete[Resource]() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { queueAction } = useOfflineSync();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!navigator.onLine) {
        await queueAction('DELETE', '[resources]', { id });
        return;
      }
      return [resource]Service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['[resources]'] });
      toast({
        title: '[Resource] deleted',
        description: 'The [resource] has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
```

### Real-time Subscription Template
```typescript
// src/hooks/api/use[Resource]Subscription.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function use[Resource]Subscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('[resources]_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: '[table_name]',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: RealtimePostgresChangesPayload<[Resource]>) => {
          // Handle different event types
          switch (payload.eventType) {
            case 'INSERT':
              queryClient.setQueryData(
                ['[resources]', user.id],
                (old: [Resource][] = []) => [payload.new, ...old]
              );
              break;

            case 'UPDATE':
              queryClient.setQueryData(
                ['[resources]', user.id],
                (old: [Resource][] = []) =>
                  old.map(item => item.id === payload.new.id ? payload.new : item)
              );
              queryClient.setQueryData(['[resource]', payload.new.id], payload.new);
              break;

            case 'DELETE':
              queryClient.setQueryData(
                ['[resources]', user.id],
                (old: [Resource][] = []) =>
                  old.filter(item => item.id !== payload.old.id)
              );
              queryClient.removeQueries({ queryKey: ['[resource]', payload.old.id] });
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}
```

### File Upload Service Template
```typescript
// src/services/storageService.ts
import { supabase } from '@/integrations/supabase/client';

export class StorageService {
  private static instance: StorageService;
  private bucketName = '[bucket_name]';

  static getInstance(): StorageService {
    if (!this.instance) {
      this.instance = new StorageService();
    }
    return this.instance;
  }

  async uploadFile(
    file: File,
    path: string,
    options?: { upsert?: boolean; contentType?: string }
  ): Promise<{ url: string; path: string }> {
    const fileName = `${path}/${Date.now()}_${file.name}`;

    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .upload(fileName, file, {
        contentType: options?.contentType || file.type,
        upsert: options?.upsert || false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(data.path);

    return { url: publicUrl, path: data.path };
  }

  async deleteFile(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(this.bucketName)
      .remove([path]);

    if (error) throw error;
  }

  async downloadFile(path: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .download(path);

    if (error) throw error;
    return data;
  }

  async listFiles(path: string = ''): Promise<FileObject[]> {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .list(path);

    if (error) throw error;
    return data || [];
  }

  getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);

    return data.publicUrl;
  }
}

export const storageService = StorageService.getInstance();
```

### Error Handler Template
```typescript
// src/utils/api/errorHandler.ts
export class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleSupabaseError(error: any): never {
  // Handle specific Supabase error codes
  switch (error.code) {
    case '23505':
      throw new APIError('This record already exists', 'DUPLICATE_ENTRY', 409);
    case '23503':
      throw new APIError('Referenced record not found', 'FOREIGN_KEY_VIOLATION', 400);
    case 'PGRST116':
      throw new APIError('Record not found', 'NOT_FOUND', 404);
    case '42501':
      throw new APIError('Insufficient permissions', 'UNAUTHORIZED', 403);
    default:
      throw new APIError(
        error.message || 'An unexpected error occurred',
        error.code || 'UNKNOWN_ERROR',
        error.status || 500,
        error
      );
  }
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i === maxRetries - 1) break;

      // Don't retry on client errors (4xx)
      if (error instanceof APIError && error.status && error.status < 500) {
        throw error;
      }

      // Exponential backoff
      const delay = initialDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
```

### Offline Sync Integration Template
```typescript
// src/services/offlineSyncService.ts
import { supabase } from '@/integrations/supabase/client';

interface SyncQueueItem {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  resource: string;
  data: any;
  timestamp: number;
  retries: number;
}

export class OfflineSyncService {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'offline_sync';
  private readonly storeName = 'sync_queue';

  async init(): Promise<void> {
    const request = indexedDB.open(this.dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('resource', 'resource', { unique: false });
      }
    };

    this.db = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async queueAction(action: SyncQueueItem['action'], resource: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const item: SyncQueueItem = {
      id: `${action}_${resource}_${Date.now()}_${Math.random()}`,
      action,
      resource,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    await new Promise((resolve, reject) => {
      const request = store.add(item);
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error);
    });
  }

  async syncPendingActions(): Promise<void> {
    if (!navigator.onLine) return;
    if (!this.db) await this.init();

    const transaction = this.db!.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    const items: SyncQueueItem[] = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    for (const item of items) {
      try {
        await this.syncItem(item);
        await this.removeItem(item.id);
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
        await this.updateRetryCount(item.id);
      }
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    const { action, resource, data } = item;

    switch (action) {
      case 'CREATE':
        await supabase.from(resource).insert(data);
        break;
      case 'UPDATE':
        await supabase.from(resource).update(data).eq('id', data.id);
        break;
      case 'DELETE':
        await supabase.from(resource).delete().eq('id', data.id);
        break;
    }
  }

  private async removeItem(id: string): Promise<void> {
    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    await new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error);
    });
  }

  private async updateRetryCount(id: string): Promise<void> {
    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const item = await new Promise<SyncQueueItem>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (item && item.retries < 3) {
      item.retries++;
      await new Promise((resolve, reject) => {
        const request = store.put(item);
        request.onsuccess = resolve;
        request.onerror = () => reject(request.error);
      });
    } else if (item) {
      await this.removeItem(id);
    }
  }
}

export const offlineSyncService = new OfflineSyncService();
```

## Authentication Management
```typescript
// src/services/authService.ts
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export class AuthService {
  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data.user;
  }

  async signUp(email: string, password: string, metadata?: any): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('User creation failed');
    return data.user;
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  }

  getSession() {
    return supabase.auth.getSession();
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
  }
}

export const authService = new AuthService();
```

## Database Schema Management
```sql
-- Example migration for new table
CREATE TABLE IF NOT EXISTS public.[table_name] (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.[table_name] ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own records" ON public.[table_name]
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own records" ON public.[table_name]
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records" ON public.[table_name]
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records" ON public.[table_name]
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_[table_name]_user_id ON public.[table_name](user_id);
CREATE INDEX idx_[table_name]_status ON public.[table_name](status);
CREATE INDEX idx_[table_name]_created_at ON public.[table_name](created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_[table_name]_updated_at
  BEFORE UPDATE ON public.[table_name]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## API Rate Limiting & Caching
```typescript
// src/utils/api/rateLimiter.ts
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

export const rateLimiter = new RateLimiter();
```

## Best Practices
1. Always implement optimistic updates for better UX
2. Use proper error boundaries for API failures
3. Implement retry logic with exponential backoff
4. Cache responses appropriately with React Query
5. Use database transactions for related operations
6. Implement proper RLS policies in Supabase
7. Use connection pooling for database connections
8. Implement request deduplication
9. Use proper TypeScript types from database
10. Test offline scenarios thoroughly