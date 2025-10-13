/**
 * Advanced Test Utilities and Helpers
 * Provides comprehensive testing utilities for integration and unit tests
 */
import { render, RenderOptions, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { vi, MockedFunction } from 'vitest';
import { OptimizedProviders } from '@/components/providers/OptimizedProviders';

// Types
export interface TestUser {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  aud: string;
  role: string;
}

export interface TestSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: TestUser;
  expires_at: number;
}

export interface MockSupabaseClient {
  auth: {
    getSession: MockedFunction<any>;
    onAuthStateChange: MockedFunction<any>;
    signInWithPassword: MockedFunction<any>;
    signUp: MockedFunction<any>;
    signOut: MockedFunction<any>;
    getUser: MockedFunction<any>;
  };
  from: MockedFunction<any>;
  rpc: MockedFunction<any>;
}

// Mock data factories
export const createMockUser = (overrides: Partial<TestUser> = {}): TestUser => ({
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  role: 'authenticated',
  ...overrides,
});

export const createMockSession = (user?: Partial<TestUser>): TestSession => {
  const mockUser = createMockUser(user);
  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  };
};

export const createMockTask = (overrides: Record<string, any> = {}) => ({
  id: `task-${Date.now()}`,
  title: 'Test Task',
  description: 'Test task description',
  status: 'pending',
  priority: 'medium',
  due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user_id: 'test-user-id',
  tags: ['test'],
  ...overrides,
});

export const createMockGoal = (overrides: Record<string, any> = {}) => ({
  id: `goal-${Date.now()}`,
  title: 'Test Goal',
  description: 'Test goal description',
  status: 'active',
  target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  progress: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user_id: 'test-user-id',
  category: 'personal',
  ...overrides,
});

// Test environment setup
export class TestEnvironment {
  private mockSupabase: MockSupabaseClient;
  private queryClient: QueryClient;

  constructor() {
    this.mockSupabase = this.createMockSupabase();
    this.queryClient = this.createTestQueryClient();
  }

  private createMockSupabase(): MockSupabaseClient {
    return {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } }
        }),
        signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: null }),
        signUp: vi.fn().mockResolvedValue({ data: null, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
  }

  private createTestQueryClient(): QueryClient {
    return new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });
  }

  // Authentication helpers
  setAuthenticatedUser(user?: Partial<TestUser>): void {
    const session = createMockSession(user);
    this.mockSupabase.auth.getSession.mockResolvedValue({
      data: { session },
      error: null,
    });
    this.mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: session.user },
      error: null,
    });
  }

  setUnauthenticatedUser(): void {
    this.mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    this.mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });
  }

  // Database helpers
  mockDatabaseResponse(table: string, operation: string, response: any): void {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(response),
    };

    this.mockSupabase.from.mockReturnValue(mockChain);
  }

  mockDatabaseError(table: string, error: any): void {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error }),
    };

    this.mockSupabase.from.mockReturnValue(mockChain);
  }

  // Test data seeding
  seedTasks(count: number = 3): any[] {
    const tasks = Array.from({ length: count }, (_, i) =>
      createMockTask({
        id: `task-${i}`,
        title: `Test Task ${i + 1}`,
        priority: ['low', 'medium', 'high'][i % 3],
      })
    );

    this.mockDatabaseResponse('tasks', 'select', { data: tasks, error: null });
    return tasks;
  }

  seedGoals(count: number = 2): any[] {
    const goals = Array.from({ length: count }, (_, i) =>
      createMockGoal({
        id: `goal-${i}`,
        title: `Test Goal ${i + 1}`,
        progress: (i + 1) * 25,
      })
    );

    this.mockDatabaseResponse('goals', 'select', { data: goals, error: null });
    return goals;
  }

  // Network simulation
  simulateNetworkDelay(delay: number = 1000): void {
    const originalFrom = this.mockSupabase.from;
    this.mockSupabase.from = vi.fn().mockImplementation((...args) => {
      const chain = originalFrom(...args);
      return {
        ...chain,
        single: vi.fn().mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, delay));
          return chain.single();
        }),
      };
    });
  }

  simulateNetworkError(): void {
    this.mockSupabase.from.mockImplementation(() => {
      throw new Error('Network error');
    });
  }

  // Cleanup
  reset(): void {
    vi.clearAllMocks();
    this.queryClient.clear();
    this.mockSupabase = this.createMockSupabase();
  }

  getQueryClient(): QueryClient {
    return this.queryClient;
  }

  getMockSupabase(): MockSupabaseClient {
    return this.mockSupabase;
  }
}

// React Testing Library custom render
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  testEnvironment?: TestEnvironment;
}

export const createTestProviders = (options: {
  initialEntries?: string[];
  queryClient?: QueryClient;
} = {}) => {
  const { initialEntries = ['/'], queryClient = new QueryClient() } = options;

  const TestProviders = ({ children }: { children: React.ReactNode }) => {
    const Router = initialEntries.length > 1 ? MemoryRouter : BrowserRouter;
    const routerProps = initialEntries.length > 1 ? { initialEntries } : {};

    return (
      <QueryClientProvider client={queryClient}>
        <Router {...routerProps}>
          <OptimizedProviders>
            {children}
          </OptimizedProviders>
        </Router>
      </QueryClientProvider>
    );
  };

  return TestProviders;
};

export const renderWithTestEnvironment = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialEntries = ['/'], testEnvironment, ...renderOptions } = options;

  const env = testEnvironment || new TestEnvironment();
  const TestProviders = createTestProviders({
    initialEntries,
    queryClient: env.getQueryClient(),
  });

  const result = render(ui, {
    wrapper: TestProviders,
    ...renderOptions,
  });

  return {
    ...result,
    user: userEvent.setup(),
    testEnvironment: env,
  };
};

// Custom matchers and assertions
export const expectElementToBeVisible = async (text: string | RegExp) => {
  await waitFor(() => {
    expect(screen.getByText(text)).toBeInTheDocument();
  });
};

export const expectElementNotToBeVisible = async (text: string | RegExp) => {
  await waitFor(() => {
    expect(screen.queryByText(text)).not.toBeInTheDocument();
  });
};

export const waitForLoadingToFinish = async () => {
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
};

export const waitForErrorToAppear = async () => {
  await waitFor(() => {
    expect(screen.getByText(/error|something went wrong/i)).toBeInTheDocument();
  });
};

// Performance testing utilities
export class PerformanceTestHelper {
  private measurements: Record<string, number[]> = {};

  async measureRenderTime<T>(
    name: string,
    renderFn: () => Promise<T> | T
  ): Promise<T> {
    const start = performance.now();
    const result = await renderFn();
    const end = performance.now();
    const duration = end - start;

    if (!this.measurements[name]) {
      this.measurements[name] = [];
    }
    this.measurements[name].push(duration);

    return result;
  }

  getAverageTime(name: string): number {
    const times = this.measurements[name] || [];
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  expectPerformance(name: string, maxTime: number): void {
    const avgTime = this.getAverageTime(name);
    expect(avgTime).toBeLessThan(maxTime);
  }

  reset(): void {
    this.measurements = {};
  }
}

// Accessibility testing utilities
export const checkAccessibility = async (container: HTMLElement) => {
  const { axe } = await import('axe-core');

  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'focus-management': { enabled: true },
      'aria-labels': { enabled: true },
    },
  });

  return results;
};

export const expectNoAccessibilityViolations = async (container: HTMLElement) => {
  const results = await checkAccessibility(container);
  expect(results.violations).toHaveLength(0);
};

// Utility functions
export const mockIntersectionObserver = () => {
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
};

export const mockResizeObserver = () => {
  global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
};

export const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Export singleton instance for convenience
export const testEnvironment = new TestEnvironment();
export const performanceHelper = new PerformanceTestHelper();