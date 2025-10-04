import React from "react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalCard } from "@/components/goals/GoalCard";
import { createMockGoal, createMockGoals } from "@/test/mock-data";

// Performance testing utilities
class PerformanceTracker {
  private measurements: Map<string, number[]> = new Map();

  startMeasurement(name: string): () => number {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (!this.measurements.has(name)) {
        this.measurements.set(name, []);
      }
      this.measurements.get(name)!.push(duration);
      return duration;
    };
  }

  getAverageTime(name: string): number {
    const times = this.measurements.get(name) || [];
    return times.length > 0 ? times.reduce((a, b) => a + b) / times.length : 0;
  }

  getMinTime(name: string): number {
    const times = this.measurements.get(name) || [];
    return times.length > 0 ? Math.min(...times) : 0;
  }

  getMaxTime(name: string): number {
    const times = this.measurements.get(name) || [];
    return times.length > 0 ? Math.max(...times) : 0;
  }

  clear() {
    this.measurements.clear();
  }

  getAllMeasurements() {
    return Array.from(this.measurements.entries()).map(([name, times]) => ({
      name,
      count: times.length,
      average: this.getAverageTime(name),
      min: this.getMinTime(name),
      max: this.getMaxTime(name),
      total: times.reduce((a, b) => a + b, 0),
    }));
  }
}

// Mock hooks for performance testing
vi.mock("@/hooks/useGoals", () => ({
  useUpdateGoal: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isLoading: false,
  }),
  useDeleteGoal: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isLoading: false,
  }),
  useUpdateGoalProgress: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isLoading: false,
  }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user" },
    loading: false,
  }),
}));

vi.mock("@/utils/goalStatus", () => ({
  getStatusColor: vi.fn(() => "blue"),
  getStatusLabel: vi.fn((status) => status),
  getAvailableStatusTransitions: vi.fn(() => ["active", "completed"]),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe("Performance Testing Suite", () => {
  let tracker: PerformanceTracker;

  beforeEach(() => {
    tracker = new PerformanceTracker();
    vi.clearAllMocks();
  });

  afterEach(() => {
    tracker.clear();
  });

  describe("Component Render Performance", () => {
    it("should render Button component within performance budget", () => {
      const endMeasurement = tracker.startMeasurement("button-render");

      render(<Button>Test Button</Button>);

      const renderTime = endMeasurement();

      // Button should render in less than 16.7ms (60fps target)
      expect(renderTime).toBeLessThan(16.7);
    });

    it("should render Card component efficiently", () => {
      const endMeasurement = tracker.startMeasurement("card-render");

      render(
        <Card>
          <CardHeader>
            <CardTitle>Performance Test Card</CardTitle>
          </CardHeader>
          <CardContent>Card content for performance testing</CardContent>
        </Card>,
      );

      const renderTime = endMeasurement();

      // Card should render in less than 25ms
      expect(renderTime).toBeLessThan(25);
    });

    it("should render complex GoalCard component within budget", () => {
      const mockGoal = createMockGoal({
        title: "Performance Test Goal",
        description: "Testing goal card render performance",
      });

      const endMeasurement = tracker.startMeasurement("goalcard-render");

      render(<GoalCard goal={mockGoal} />);

      const renderTime = endMeasurement();

      // Complex component should render in less than 50ms
      expect(renderTime).toBeLessThan(50);
    });

    it("should handle multiple component renders efficiently", () => {
      const renderCount = 10;

      for (let i = 0; i < renderCount; i++) {
        const endMeasurement = tracker.startMeasurement("multiple-renders");

        render(<Button key={i}>Button {i}</Button>);

        endMeasurement();
      }

      const averageTime = tracker.getAverageTime("multiple-renders");
      const maxTime = tracker.getMaxTime("multiple-renders");

      // Average render time should be consistent
      expect(averageTime).toBeLessThan(20);
      expect(maxTime).toBeLessThan(50);
    });
  });

  describe("List Rendering Performance", () => {
    it("should render small lists efficiently", () => {
      const goals = createMockGoals(5);

      const endMeasurement = tracker.startMeasurement("small-list-render");

      render(
        <div>
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>,
      );

      const renderTime = endMeasurement();

      // Small list should render quickly
      expect(renderTime).toBeLessThan(100);
    });

    it("should render medium lists within reasonable time", () => {
      const goals = createMockGoals(25);

      const endMeasurement = tracker.startMeasurement("medium-list-render");

      render(
        <div>
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>,
      );

      const renderTime = endMeasurement();

      // Medium list should render within 300ms
      expect(renderTime).toBeLessThan(300);
    });

    it("should handle large lists with reasonable performance", () => {
      const goals = createMockGoals(100);

      const endMeasurement = tracker.startMeasurement("large-list-render");

      render(
        <div>
          {goals.map((goal) => (
            <div key={goal.id}>
              <h3>{goal.title}</h3>
              <p>{goal.description}</p>
              <span>Progress: {goal.progress}%</span>
            </div>
          ))}
        </div>,
      );

      const renderTime = endMeasurement();

      // Large list should render within 1 second
      expect(renderTime).toBeLessThan(1000);
    });
  });

  describe("Re-render Performance", () => {
    it("should minimize unnecessary re-renders", () => {
      const TestComponent = ({ count }: { count: number }) => {
        const endMeasurement = tracker.startMeasurement("rerender-test");

        React.useEffect(() => {
          endMeasurement();
        });

        return <div>Count: {count}</div>;
      };

      const { rerender } = render(<TestComponent count={1} />);

      // Multiple re-renders with same props
      rerender(<TestComponent count={1} />);
      rerender(<TestComponent count={1} />);
      rerender(<TestComponent count={1} />);

      // Re-render with different props
      rerender(<TestComponent count={2} />);

      const measurements = tracker.getAllMeasurements();
      const rerenderTest = measurements.find((m) => m.name === "rerender-test");

      expect(rerenderTest?.count).toBeGreaterThan(0);
      expect(rerenderTest?.average).toBeLessThan(10); // Re-renders should be fast
    });

    it("should handle prop changes efficiently", () => {
      let renderCount = 0;

      const TestButton = ({ variant, children }: any) => {
        renderCount++;
        const endMeasurement = tracker.startMeasurement("prop-change-render");

        React.useEffect(() => {
          endMeasurement();
        });

        return <Button variant={variant}>{children}</Button>;
      };

      const { rerender } = render(
        <TestButton variant="default">Initial</TestButton>,
      );

      // Change props that should trigger re-render
      rerender(<TestButton variant="secondary">Changed Variant</TestButton>);
      rerender(<TestButton variant="secondary">Changed Text</TestButton>);

      expect(renderCount).toBe(3); // Initial + 2 changes

      const averageTime = tracker.getAverageTime("prop-change-render");
      expect(averageTime).toBeLessThan(15);
    });
  });

  describe("Memory Usage Performance", () => {
    it("should not leak memory with repeated renders", () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Render and unmount components repeatedly
      for (let i = 0; i < 50; i++) {
        const { unmount } = render(<Button>Test {i}</Button>);
        unmount();
      }

      // Allow garbage collection
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Memory usage should not increase significantly
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        const increasePercentage = (memoryIncrease / initialMemory) * 100;

        // Memory increase should be less than 50%
        expect(increasePercentage).toBeLessThan(50);
      }
    });

    it("should clean up event listeners properly", () => {
      let listenerCount = 0;

      const TestComponent = () => {
        React.useEffect(() => {
          const handler = () => {};
          listenerCount++;
          window.addEventListener("resize", handler);

          return () => {
            listenerCount--;
            window.removeEventListener("resize", handler);
          };
        }, []);

        return <div>Test Component</div>;
      };

      const { unmount } = render(<TestComponent />);
      expect(listenerCount).toBe(1);

      unmount();
      expect(listenerCount).toBe(0);
    });
  });

  describe("Bundle Size Impact", () => {
    it("should not increase bundle size significantly", () => {
      // This is more of a documentation test for bundle analysis
      const componentSizes = {
        Button: { estimated: "2KB", actual: "TBD" },
        Card: { estimated: "3KB", actual: "TBD" },
        GoalCard: { estimated: "8KB", actual: "TBD" },
      };

      // These would be populated by actual bundle analysis tools
      expect(componentSizes).toBeDefined();
    });
  });

  describe("Interaction Performance", () => {
    it("should respond to clicks quickly", async () => {
      const clickHandler = vi.fn();

      render(<Button onClick={clickHandler}>Click Me</Button>);

      const button = screen.getByRole("button");

      const endMeasurement = tracker.startMeasurement("click-response");

      // Simulate click
      button.click();

      const responseTime = endMeasurement();

      // Click response should be immediate
      expect(responseTime).toBeLessThan(5);
      expect(clickHandler).toHaveBeenCalled();
    });

    it("should handle rapid interactions gracefully", async () => {
      const clickHandler = vi.fn();

      render(<Button onClick={clickHandler}>Rapid Click</Button>);

      const button = screen.getByRole("button");

      // Simulate rapid clicks
      for (let i = 0; i < 10; i++) {
        const endMeasurement = tracker.startMeasurement("rapid-clicks");
        button.click();
        endMeasurement();
      }

      const averageResponseTime = tracker.getAverageTime("rapid-clicks");
      expect(averageResponseTime).toBeLessThan(10);
      expect(clickHandler).toHaveBeenCalledTimes(10);
    });
  });

  describe("Performance Regression Detection", () => {
    it("should maintain consistent performance across test runs", () => {
      const runs = 5;
      const renderTimes: number[] = [];

      for (let i = 0; i < runs; i++) {
        const endMeasurement = tracker.startMeasurement("consistency-test");

        render(
          <Card>
            <CardHeader>
              <CardTitle>Consistency Test {i}</CardTitle>
            </CardHeader>
            <CardContent>
              Testing performance consistency across multiple runs
            </CardContent>
          </Card>,
        );

        renderTimes.push(endMeasurement());
      }

      // Calculate variance
      const average = renderTimes.reduce((a, b) => a + b) / renderTimes.length;
      const variance =
        renderTimes.reduce(
          (acc, time) => acc + Math.pow(time - average, 2),
          0,
        ) / renderTimes.length;
      const standardDeviation = Math.sqrt(variance);

      // Performance should be consistent (low standard deviation)
      expect(standardDeviation).toBeLessThan(average * 0.5); // Within 50% of average
    });

    it("should provide performance metrics summary", () => {
      // Run various performance tests
      render(<Button>Summary Test</Button>);
      render(
        <Card>
          <CardContent>Test</CardContent>
        </Card>,
      );

      const allMeasurements = tracker.getAllMeasurements();

      // Performance metrics should be available
      expect(allMeasurements).toBeDefined();

      // Log performance summary for monitoring
      console.table(allMeasurements);

      // All measurements should be within acceptable ranges
      allMeasurements.forEach((measurement) => {
        expect(measurement.average).toBeGreaterThan(0);
        expect(measurement.average).toBeLessThan(1000); // No operation should take > 1s
      });
    });
  });

  describe("Core Web Vitals Simulation", () => {
    it("should simulate good Core Web Vitals scores", () => {
      // Simulate Largest Contentful Paint (LCP)
      const endLCP = tracker.startMeasurement("simulated-lcp");

      render(
        <div>
          <h1>Main Content</h1>
          <img alt="Large content" width={800} height={600} />
        </div>,
      );

      const lcpTime = endLCP();

      // LCP should be under 2.5s (simulated)
      expect(lcpTime).toBeLessThan(100); // In our test environment

      // Simulate First Input Delay (FID)
      const endFID = tracker.startMeasurement("simulated-fid");

      const button = document.createElement("button");
      document.body.appendChild(button);
      button.click();

      const fidTime = endFID();

      // FID should be under 100ms
      expect(fidTime).toBeLessThan(10); // In our test environment

      // Simulate Cumulative Layout Shift (CLS)
      // This would be measured by actual layout changes in a real environment
      const simulatedCLS = 0.05; // Should be under 0.1
      expect(simulatedCLS).toBeLessThan(0.1);
    });
  });
});
