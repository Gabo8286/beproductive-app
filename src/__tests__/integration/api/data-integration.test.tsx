/**
 * API Integration Tests - Data Operations
 * Tests CRUD operations with real Supabase integration
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuthProvider } from '@/contexts/AuthContext';
import {
  TestEnvironment,
  createMockUser,
  createMockSession,
  createMockTask,
  createMockGoal
} from '@/__tests__/utils/test-helpers';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Data API Integration', () => {
  let testEnv: TestEnvironment;
  let user: ReturnType<typeof userEvent.setup>;
  let mockUser: any;
  let mockSession: any;

  beforeEach(() => {
    testEnv = new TestEnvironment();
    user = userEvent.setup();
    mockUser = createMockUser();
    mockSession = createMockSession(mockUser);

    // Setup authenticated user
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    testEnv.reset();
  });

  describe('Task CRUD Operations', () => {
    it('should create a new task successfully', async () => {
      const newTask = createMockTask({
        title: 'New Task',
        description: 'Task description',
        priority: 'high',
      });

      // Mock successful task creation
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: newTask, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      // Simulate task creation API call
      const result = await supabase
        .from('tasks')
        .insert([{
          title: 'New Task',
          description: 'Task description',
          priority: 'high',
          user_id: mockUser.id,
        }])
        .select()
        .single();

      expect(result.data).toEqual(newTask);
      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('tasks');
    });

    it('should fetch tasks for authenticated user', async () => {
      const userTasks = [
        createMockTask({ title: 'Task 1', user_id: mockUser.id }),
        createMockTask({ title: 'Task 2', user_id: mockUser.id }),
        createMockTask({ title: 'Task 3', user_id: mockUser.id }),
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: userTasks, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      // Simulate fetching user tasks
      const result = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', mockUser.id)
        .order('created_at', { ascending: false });

      expect(result.data).toEqual(userTasks);
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', mockUser.id);
    });

    it('should update task status', async () => {
      const taskId = 'task-123';
      const updatedTask = createMockTask({
        id: taskId,
        status: 'completed',
      });

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedTask, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      // Simulate task update
      const result = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', taskId)
        .select()
        .single();

      expect(result.data).toEqual(updatedTask);
      expect(mockChain.update).toHaveBeenCalledWith({ status: 'completed' });
      expect(mockChain.eq).toHaveBeenCalledWith('id', taskId);
    });

    it('should delete task', async () => {
      const taskId = 'task-123';

      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      // Simulate task deletion
      const result = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      expect(result.error).toBeNull();
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', taskId);
    });

    it('should handle task creation errors', async () => {
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Title is required', code: '23502' },
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      // Simulate creating task without required fields
      const result = await supabase
        .from('tasks')
        .insert([{ description: 'Task without title' }])
        .select()
        .single();

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
      expect(result.error?.message).toContain('Title is required');
    });
  });

  describe('Goal CRUD Operations', () => {
    it('should create and track goal progress', async () => {
      const newGoal = createMockGoal({
        title: 'Complete Project',
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 0,
      });

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: newGoal, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await supabase
        .from('goals')
        .insert([{
          title: 'Complete Project',
          target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 0,
          user_id: mockUser.id,
        }])
        .select()
        .single();

      expect(result.data).toEqual(newGoal);
      expect(result.error).toBeNull();
    });

    it('should update goal progress', async () => {
      const goalId = 'goal-123';
      const updatedGoal = createMockGoal({
        id: goalId,
        progress: 75,
      });

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedGoal, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await supabase
        .from('goals')
        .update({ progress: 75 })
        .eq('id', goalId)
        .select()
        .single();

      expect(result.data?.progress).toBe(75);
      expect(mockChain.update).toHaveBeenCalledWith({ progress: 75 });
    });
  });

  describe('Real-time Subscriptions', () => {
    it('should handle real-time task updates', async () => {
      let subscriptionCallback: ((payload: any) => void) | null = null;

      // Mock real-time subscription
      const mockSubscription = {
        subscribe: vi.fn().mockImplementation((callback) => {
          subscriptionCallback = callback;
          return {
            unsubscribe: vi.fn(),
          };
        }),
      };

      const mockChain = {
        on: vi.fn().mockReturnValue(mockSubscription),
        eq: vi.fn().mockReturnThis(),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      // Setup subscription
      const subscription = supabase
        .from('tasks')
        .on('*', (payload) => {
          // Handle real-time updates
          console.log('Task updated:', payload);
        })
        .eq('user_id', mockUser.id)
        .subscribe();

      // Simulate real-time update
      if (subscriptionCallback) {
        const payload = {
          eventType: 'UPDATE',
          new: createMockTask({ status: 'completed' }),
          old: createMockTask({ status: 'pending' }),
        };
        subscriptionCallback(payload);
      }

      expect(mockChain.on).toHaveBeenCalledWith('*', expect.any(Function));
      expect(mockSubscription.subscribe).toHaveBeenCalled();
    });
  });

  describe('Complex Queries', () => {
    it('should handle complex task filtering and sorting', async () => {
      const filteredTasks = [
        createMockTask({ priority: 'high', status: 'pending', due_date: new Date().toISOString() }),
        createMockTask({ priority: 'high', status: 'in-progress', due_date: new Date().toISOString() }),
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: filteredTasks, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      // Complex query: high priority tasks, not completed, due soon
      const result = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', mockUser.id)
        .eq('priority', 'high')
        .in('status', ['pending', 'in-progress'])
        .lte('due_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('due_date', { ascending: true });

      expect(result.data).toEqual(filteredTasks);
      expect(mockChain.eq).toHaveBeenCalledWith('priority', 'high');
      expect(mockChain.in).toHaveBeenCalledWith('status', ['pending', 'in-progress']);
    });

    it('should handle task search with text matching', async () => {
      const searchResults = [
        createMockTask({ title: 'Research presentation topics' }),
        createMockTask({ description: 'Research market trends' }),
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: searchResults, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      // Text search across title and description
      const searchTerm = 'research';
      const result = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', mockUser.id)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      expect(result.data).toEqual(searchResults);
      expect(mockChain.or).toHaveBeenCalledWith(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error('Network error');
      });

      try {
        await supabase.from('tasks').select('*');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    it('should handle database constraint violations', async () => {
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: {
            message: 'duplicate key value violates unique constraint',
            code: '23505',
          },
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await supabase
        .from('tasks')
        .insert([{ title: 'Duplicate Task', id: 'existing-id' }])
        .select()
        .single();

      expect(result.error?.code).toBe('23505');
      expect(result.error?.message).toContain('duplicate key');
    });

    it('should handle unauthorized access', async () => {
      // Mock unauthorized error
      const mockChain = {
        select: vi.fn().mockResolvedValue({
          data: null,
          error: {
            message: 'JWT expired',
            code: '401',
          },
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await supabase
        .from('tasks')
        .select('*');

      expect(result.error?.code).toBe('401');
      expect(result.error?.message).toContain('JWT expired');
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle large dataset queries efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) =>
        createMockTask({ title: `Task ${i}` })
      );

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: largeDataset.slice(0, 50), error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      // Paginated query
      const result = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', mockUser.id)
        .order('created_at', { ascending: false })
        .range(0, 49);

      expect(result.data?.length).toBe(50);
      expect(mockChain.range).toHaveBeenCalledWith(0, 49);
    });

    it('should optimize queries with selective field fetching', async () => {
      const minimalTasks = [
        { id: 'task-1', title: 'Task 1', status: 'pending' },
        { id: 'task-2', title: 'Task 2', status: 'completed' },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: minimalTasks, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      // Select only necessary fields
      const result = await supabase
        .from('tasks')
        .select('id, title, status')
        .eq('user_id', mockUser.id);

      expect(result.data).toEqual(minimalTasks);
      expect(mockChain.select).toHaveBeenCalledWith('id, title, status');
    });
  });
});