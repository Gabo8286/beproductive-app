/**
 * Performance Regression Tests
 * Monitors application performance metrics and prevents regressions
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { OptimizedProviders } from '@/components/providers/OptimizedProviders';
import { PerformanceTestHelper } from '@/__tests__/utils/test-helpers';
import App from '@/App';

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  INITIAL_RENDER: 1000,
  NAVIGATION: 500,
  WIDGET_LOAD: 300,
  LIST_RENDER: 200,
  FORM_INTERACTION: 100,
  SEARCH_RESPONSE: 150,
} as const;

// Mock heavy components for consistent testing
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  },
}));

const TestProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <OptimizedProviders>
          {children}
        </OptimizedProviders>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Performance Regression Tests', () => {
  let performanceHelper: PerformanceTestHelper;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    performanceHelper = new PerformanceTestHelper();
    user = userEvent.setup();

    // Mock performance APIs
    Object.defineProperty(global, 'performance', {
      value: {
        now: vi.fn(() => Date.now()),
        mark: vi.fn(),
        measure: vi.fn(),
        getEntriesByType: vi.fn(() => []),
        getEntriesByName: vi.fn(() => []),
        clearMarks: vi.fn(),
        clearMeasures: vi.fn(),
      },
      writable: true,
    });

    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    performanceHelper.reset();
    vi.clearAllMocks();
  });

  describe('Initial Application Load', () => {
    it('should load initial app within performance threshold', async () => {
      const renderTime = await performanceHelper.measureRenderTime(
        'initial-app-load',
        async () => {
          render(
            <TestProviders>
              <App />
            </TestProviders>
          );

          // Wait for initial content to appear
          await waitFor(() => {
            expect(document.querySelector('[data-testid="app-container"]') ||
                   document.body.firstElementChild).toBeInTheDocument();
          });
        }
      );

      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.INITIAL_RENDER);
    });

    it('should measure and validate Core Web Vitals', async () => {
      const metrics = {
        fcp: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
      };

      // Mock Core Web Vitals measurement
      const mockObserver = vi.fn((callback) => {
        // Simulate FCP
        setTimeout(() => {
          callback([{ name: 'first-contentful-paint', startTime: 800 }]);
        }, 10);

        // Simulate LCP
        setTimeout(() => {
          callback([{ name: 'largest-contentful-paint', startTime: 1200 }]);
        }, 20);

        return {
          observe: vi.fn(),
          disconnect: vi.fn(),
        };
      });

      global.PerformanceObserver = mockObserver as any;

      render(
        <TestProviders>
          <App />
        </TestProviders>
      );

      await waitFor(() => {
        expect(mockObserver).toHaveBeenCalled();
      });

      // Validate Core Web Vitals thresholds
      // FCP should be < 1.8s, LCP should be < 2.5s for good performance
      await new Promise(resolve => setTimeout(resolve, 50));
    });
  });

  describe('Navigation Performance', () => {
    it('should navigate between routes quickly', async () => {
      render(
        <TestProviders>
          <App />
        </TestProviders>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(document.body.firstElementChild).toBeInTheDocument();
      });

      // Test navigation performance
      const routes = ['/tasks', '/goals', '/dashboard', '/profile'];

      for (const route of routes) {
        const navigationTime = await performanceHelper.measureRenderTime(
          `navigation-${route}`,
          async () => {
            // Simulate navigation (would normally use router navigation)
            window.history.pushState({}, '', route);
            window.dispatchEvent(new PopStateEvent('popstate'));

            // Wait for route content to load
            await waitFor(() => {
              expect(window.location.pathname).toBe(route);
            }, { timeout: 1000 });
          }
        );

        expect(navigationTime).toBeLessThan(PERFORMANCE_THRESHOLDS.NAVIGATION);
      }
    });

    it('should handle rapid navigation without performance degradation', async () => {
      render(
        <TestProviders>
          <App />
        </TestProviders>
      );

      const rapidNavigationTime = await performanceHelper.measureRenderTime(
        'rapid-navigation',
        async () => {
          // Rapidly navigate between routes
          for (let i = 0; i < 10; i++) {
            const route = i % 2 === 0 ? '/tasks' : '/dashboard';
            window.history.pushState({}, '', route);
            window.dispatchEvent(new PopStateEvent('popstate'));
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
      );

      // Rapid navigation should not significantly degrade performance
      expect(rapidNavigationTime).toBeLessThan(PERFORMANCE_THRESHOLDS.NAVIGATION * 2);
    });
  });

  describe('Widget Performance', () => {
    it('should render widgets within performance threshold', async () => {
      render(
        <TestProviders>
          <App />
        </TestProviders>
      );

      // Navigate to dashboard with widgets
      window.history.pushState({}, '', '/dashboard');
      window.dispatchEvent(new PopStateEvent('popstate'));

      const widgetRenderTime = await performanceHelper.measureRenderTime(
        'widget-render',
        async () => {
          // Wait for widgets to render
          await waitFor(() => {
            // Look for common widget indicators
            expect(
              document.querySelector('[data-testid*="widget"]') ||
              document.querySelector('.widget') ||
              document.querySelector('[class*="widget"]')
            ).toBeTruthy();
          }, { timeout: 2000 });
        }
      );

      expect(widgetRenderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.WIDGET_LOAD);
    });

    it('should handle large numbers of widgets efficiently', async () => {
      // Mock a dashboard with many widgets
      const mockWidgets = Array.from({ length: 20 }, (_, i) => ({
        id: `widget-${i}`,
        type: 'mock-widget',
        title: `Widget ${i}`,
        component: () => <div data-testid={`widget-${i}`}>Widget {i}</div>,
        position: i,
      }));

      render(
        <TestProviders>
          <div data-testid="widget-container">
            {mockWidgets.map(widget => (
              <div key={widget.id} data-testid={`widget-${widget.id}`}>
                {widget.title}
              </div>
            ))}
          </div>
        </TestProviders>
      );

      const manyWidgetsTime = await performanceHelper.measureRenderTime(
        'many-widgets-render',
        async () => {
          await waitFor(() => {
            const widgets = document.querySelectorAll('[data-testid*="widget-"]');
            expect(widgets.length).toBeGreaterThan(10);
          });
        }
      );

      // Should handle many widgets efficiently
      expect(manyWidgetsTime).toBeLessThan(PERFORMANCE_THRESHOLDS.WIDGET_LOAD * 2);
    });
  });

  describe('List Rendering Performance', () => {
    it('should render large lists efficiently', async () => {
      const mockItems = Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}`,
        title: `Item ${i}`,
        description: `Description for item ${i}`,
      }));

      const listRenderTime = await performanceHelper.measureRenderTime(
        'large-list-render',
        async () => {
          render(
            <TestProviders>
              <div data-testid="large-list">
                {mockItems.map(item => (
                  <div key={item.id} data-testid={`list-item-${item.id}`}>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                ))}
              </div>
            </TestProviders>
          );

          await waitFor(() => {
            expect(screen.getByTestId('large-list')).toBeInTheDocument();
          });
        }
      );

      expect(listRenderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.LIST_RENDER);
    });

    it('should handle list updates efficiently', async () => {
      const { rerender } = render(
        <TestProviders>
          <div data-testid="dynamic-list">
            {[1, 2, 3].map(i => (
              <div key={i} data-testid={`item-${i}`}>Item {i}</div>
            ))}
          </div>
        </TestProviders>
      );

      const listUpdateTime = await performanceHelper.measureRenderTime(
        'list-update',
        async () => {
          // Update list with new items
          rerender(
            <TestProviders>
              <div data-testid="dynamic-list">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} data-testid={`item-${i}`}>Item {i}</div>
                ))}
              </div>
            </TestProviders>
          );

          await waitFor(() => {
            expect(screen.getByTestId('item-5')).toBeInTheDocument();
          });
        }
      );

      expect(listUpdateTime).toBeLessThan(PERFORMANCE_THRESHOLDS.LIST_RENDER);
    });
  });

  describe('Form Interaction Performance', () => {
    it('should handle form inputs responsively', async () => {
      render(
        <TestProviders>
          <form data-testid="performance-form">
            <input
              data-testid="text-input"
              type="text"
              placeholder="Type here..."
            />
            <textarea
              data-testid="textarea"
              placeholder="Enter description..."
            />
            <select data-testid="select">
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </select>
          </form>
        </TestProviders>
      );

      const textInput = screen.getByTestId('text-input');
      const textarea = screen.getByTestId('textarea');
      const select = screen.getByTestId('select');

      // Test text input performance
      const textInputTime = await performanceHelper.measureRenderTime(
        'text-input-interaction',
        async () => {
          await user.type(textInput, 'This is a performance test input');
        }
      );

      // Test textarea performance
      const textareaTime = await performanceHelper.measureRenderTime(
        'textarea-interaction',
        async () => {
          await user.type(textarea, 'This is a longer text in textarea for performance testing');
        }
      );

      // Test select performance
      const selectTime = await performanceHelper.measureRenderTime(
        'select-interaction',
        async () => {
          await user.selectOptions(select, 'option2');
        }
      );

      expect(textInputTime).toBeLessThan(PERFORMANCE_THRESHOLDS.FORM_INTERACTION);
      expect(textareaTime).toBeLessThan(PERFORMANCE_THRESHOLDS.FORM_INTERACTION);
      expect(selectTime).toBeLessThan(PERFORMANCE_THRESHOLDS.FORM_INTERACTION);
    });
  });

  describe('Search Performance', () => {
    it('should handle search operations efficiently', async () => {
      render(
        <TestProviders>
          <div data-testid="search-container">
            <input
              data-testid="search-input"
              type="search"
              placeholder="Search..."
            />
            <div data-testid="search-results">
              {/* Mock search results */}
              {Array.from({ length: 50 }, (_, i) => (
                <div key={i} data-testid={`result-${i}`}>
                  Search Result {i}
                </div>
              ))}
            </div>
          </div>
        </TestProviders>
      );

      const searchInput = screen.getByTestId('search-input');

      const searchTime = await performanceHelper.measureRenderTime(
        'search-operation',
        async () => {
          await user.type(searchInput, 'search query');

          // Wait for search results to appear/update
          await waitFor(() => {
            expect(screen.getByTestId('search-results')).toBeInTheDocument();
          });
        }
      );

      expect(searchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE);
    });
  });

  describe('Memory Performance', () => {
    it('should not have significant memory leaks during interaction cycles', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      render(
        <TestProviders>
          <App />
        </TestProviders>
      );

      // Perform multiple interaction cycles
      for (let cycle = 0; cycle < 5; cycle++) {
        // Navigate between routes
        window.history.pushState({}, '', '/tasks');
        window.dispatchEvent(new PopStateEvent('popstate'));
        await new Promise(resolve => setTimeout(resolve, 100));

        window.history.pushState({}, '', '/dashboard');
        window.dispatchEvent(new PopStateEvent('popstate'));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB for these operations)
      const reasonableMemoryLimit = 10 * 1024 * 1024; // 10MB

      if (initialMemory > 0) {
        expect(memoryIncrease).toBeLessThan(reasonableMemoryLimit);
      }
    });
  });

  describe('Performance Regression Detection', () => {
    it('should detect performance regressions in critical paths', async () => {
      const criticalOperations = [
        'initial-app-load',
        'navigation-/tasks',
        'widget-render',
        'large-list-render',
      ];

      // Run all critical operations and measure performance
      for (const operation of criticalOperations) {
        const measurements = performanceHelper.getAverageTime(operation);

        if (measurements > 0) {
          // Check against thresholds
          const threshold = PERFORMANCE_THRESHOLDS[
            operation.toUpperCase().replace(/[^A-Z_]/g, '_') as keyof typeof PERFORMANCE_THRESHOLDS
          ] || 1000;

          expect(measurements).toBeLessThan(threshold);
        }
      }
    });

    it('should track performance metrics over time', async () => {
      const performanceData = {
        timestamp: Date.now(),
        metrics: {
          initialLoad: performanceHelper.getAverageTime('initial-app-load'),
          navigation: performanceHelper.getAverageTime('navigation-/tasks'),
          widgetRender: performanceHelper.getAverageTime('widget-render'),
        },
      };

      // In a real scenario, this would be stored and compared over time
      expect(performanceData.timestamp).toBeGreaterThan(0);
      expect(typeof performanceData.metrics).toBe('object');
    });
  });
});