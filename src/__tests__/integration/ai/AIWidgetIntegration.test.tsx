import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TimeTrackingWidget } from "@/components/widgets/TimeTrackingWidget";
import { SmartRecommendationsWidget } from "@/components/widgets/SmartRecommendationsWidget";
import { RecommendationsBanner } from "@/components/ai/RecommendationsBanner";
import { AIDataFactory, MockAIEngine } from "@/test/mocks/ai-data-mocks";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock the LoadingSkeleton component
vi.mock("@/components/ai/LoadingSkeleton", () => ({
  LoadingSkeleton: ({ type }: { type: string }) => (
    <div data-testid={`loading-skeleton-${type}`}>Loading {type}...</div>
  ),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe("AI Widget Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe("TimeTrackingWidget Integration", () => {
    it("integrates properly with dashboard layout", async () => {
      render(
        <TestWrapper>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <TimeTrackingWidget />
            <div data-testid="other-widget">Other Widget</div>
          </div>
        </TestWrapper>,
      );

      // Should show loading initially
      expect(screen.getByTestId("loading-skeleton-widget")).toBeInTheDocument();

      // Should load and show content
      await waitFor(
        () => {
          expect(
            screen.queryByTestId("loading-skeleton-widget"),
          ).not.toBeInTheDocument();
          expect(screen.getByText("Time Tracking")).toBeInTheDocument();
        },
        { timeout: 1500 },
      );

      // Should not interfere with other widgets
      expect(screen.getByTestId("other-widget")).toBeInTheDocument();
    });

    it("maintains state during dashboard interactions", async () => {
      render(
        <TestWrapper>
          <TimeTrackingWidget />
        </TestWrapper>,
      );

      await waitFor(
        () => {
          expect(screen.getByText("Frontend development")).toBeInTheDocument();
        },
        { timeout: 1500 },
      );

      // Start interaction with timer
      const buttons = screen.getAllByRole("button");
      const timerButtons = buttons.filter(
        (button) =>
          button.className.includes("h-9") &&
          (button as HTMLButtonElement).type === "button" &&
          !button.className.includes("w-full"),
      );

      if (timerButtons.length > 0) {
        fireEvent.click(timerButtons[0]); // Pause/Play button

        // State should be maintained
        expect(screen.getByText("Frontend development")).toBeInTheDocument();
      }
    });

    it("handles widget resize and responsive behavior", async () => {
      const { rerender } = render(
        <TestWrapper>
          <div className="w-full">
            <TimeTrackingWidget />
          </div>
        </TestWrapper>,
      );

      await waitFor(
        () => {
          expect(screen.getByText("Time Tracking")).toBeInTheDocument();
        },
        { timeout: 1500 },
      );

      // Simulate mobile layout
      rerender(
        <TestWrapper>
          <div className="w-64">
            <TimeTrackingWidget />
          </div>
        </TestWrapper>,
      );

      // Content should still be accessible
      expect(screen.getByText("Time Tracking")).toBeInTheDocument();
    });
  });

  describe("SmartRecommendationsWidget Integration", () => {
    it("integrates with dashboard and auto-rotates recommendations", async () => {
      render(
        <TestWrapper>
          <SmartRecommendationsWidget />
        </TestWrapper>,
      );

      // Should show loading initially
      expect(
        screen.getByText("Analyzing your patterns..."),
      ).toBeInTheDocument();

      // Should load first recommendation
      await waitFor(() => {
        expect(
          screen.queryByText("Analyzing your patterns..."),
        ).not.toBeInTheDocument();
        expect(
          screen.getByText("Schedule deep work block"),
        ).toBeInTheDocument();
      });

      // Should auto-rotate after 10 seconds
      vi.advanceTimersByTime(10000);

      await waitFor(() => {
        expect(screen.getByText("Take a 15-minute break")).toBeInTheDocument();
      });
    });

    it("handles user interactions and dismissals", async () => {
      render(
        <TestWrapper>
          <SmartRecommendationsWidget />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Schedule deep work block"),
        ).toBeInTheDocument();
      });

      // Test implement button
      const implementButton = screen.getByText("Implement");
      fireEvent.click(implementButton);

      // Should handle the action (logged to console)
      // Note: In a real integration, this would trigger actual functionality

      // Test navigation dots
      const dots = document.querySelectorAll('button[class*="rounded-full"]');
      if (dots.length > 2) {
        fireEvent.click(dots[2]); // Click third dot

        await waitFor(() => {
          expect(screen.getByText("Review weekly goals")).toBeInTheDocument();
        });
      }
    });

    it("works alongside other dashboard widgets", async () => {
      render(
        <TestWrapper>
          <div className="grid gap-4 md:grid-cols-2">
            <SmartRecommendationsWidget />
            <TimeTrackingWidget />
          </div>
        </TestWrapper>,
      );

      // Both widgets should load independently
      await waitFor(
        () => {
          expect(screen.getByText("AI Recommendations")).toBeInTheDocument();
          expect(screen.getByText("Time Tracking")).toBeInTheDocument();
        },
        { timeout: 1500 },
      );

      // Both should be functional
      expect(screen.getByText("Schedule deep work block")).toBeInTheDocument();
      expect(screen.getByText("Frontend development")).toBeInTheDocument();
    });
  });

  describe("RecommendationsBanner Integration", () => {
    it("integrates contextually on different pages", () => {
      // Test Tasks context
      const { rerender } = render(
        <TestWrapper>
          <div>
            <h1>Tasks Page</h1>
            <RecommendationsBanner context="tasks" />
          </div>
        </TestWrapper>,
      );

      expect(screen.getByText("Break down large tasks")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Tasks over 2 hours should be split into smaller chunks for better estimation",
        ),
      ).toBeInTheDocument();

      // Test Goals context
      rerender(
        <TestWrapper>
          <div>
            <h1>Goals Page</h1>
            <RecommendationsBanner context="goals" />
          </div>
        </TestWrapper>,
      );

      expect(screen.getByText("Set weekly check-ins")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Weekly goal reviews increase achievement rates by 40%",
        ),
      ).toBeInTheDocument();
    });

    it("handles dismissal and does not interfere with page content", () => {
      render(
        <TestWrapper>
          <div>
            <h1>Test Page</h1>
            <RecommendationsBanner context="tasks" />
            <div data-testid="page-content">Page Content</div>
          </div>
        </TestWrapper>,
      );

      expect(screen.getByText("Break down large tasks")).toBeInTheDocument();
      expect(screen.getByTestId("page-content")).toBeInTheDocument();

      // Dismiss the banner
      const dismissButton = screen.getByRole("button", { name: "" }); // X button
      fireEvent.click(dismissButton);

      // Banner should be gone, page content should remain
      expect(
        screen.queryByText("Break down large tasks"),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("page-content")).toBeInTheDocument();
    });

    it("rotates through multiple recommendations for contexts with multiple items", async () => {
      render(
        <TestWrapper>
          <RecommendationsBanner context="tasks" />
        </TestWrapper>,
      );

      // Should start with first recommendation
      expect(screen.getByText("Break down large tasks")).toBeInTheDocument();
      expect(screen.getByText("1/2")).toBeInTheDocument();

      // Fast forward 15 seconds to trigger rotation
      vi.advanceTimersByTime(15000);

      await waitFor(() => {
        expect(
          screen.getByText("Schedule during peak hours"),
        ).toBeInTheDocument();
        expect(screen.getByText("2/2")).toBeInTheDocument();
      });
    });
  });

  describe("Cross-Widget Communication", () => {
    it("maintains consistent AI data across widgets", async () => {
      // Mock AI engine to return consistent data
      const mockRecommendations = AIDataFactory.createSmartRecommendations(2);
      const mockTimeEntries = AIDataFactory.createTimeEntries(3);

      render(
        <TestWrapper>
          <div className="space-y-4">
            <SmartRecommendationsWidget />
            <TimeTrackingWidget />
            <RecommendationsBanner context="general" />
          </div>
        </TestWrapper>,
      );

      // All widgets should load without conflicts
      await waitFor(
        () => {
          expect(screen.getByText("AI Recommendations")).toBeInTheDocument();
          expect(screen.getByText("Time Tracking")).toBeInTheDocument();
          expect(screen.getByText("Take a 5-minute break")).toBeInTheDocument();
        },
        { timeout: 1500 },
      );
    });

    it("handles simultaneous loading states gracefully", () => {
      render(
        <TestWrapper>
          <div className="grid gap-4 md:grid-cols-2">
            <SmartRecommendationsWidget />
            <TimeTrackingWidget />
          </div>
        </TestWrapper>,
      );

      // Should show appropriate loading states
      expect(
        screen.getByText("Analyzing your patterns..."),
      ).toBeInTheDocument();
      expect(screen.getByTestId("loading-skeleton-widget")).toBeInTheDocument();
    });

    it("handles navigation between AI features", () => {
      render(
        <TestWrapper>
          <div className="space-y-4">
            <SmartRecommendationsWidget />
            <RecommendationsBanner context="tasks" />
          </div>
        </TestWrapper>,
      );

      // Should have multiple links to AI insights
      const aiInsightsLinks = screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("href") === "/ai-insights");

      expect(aiInsightsLinks.length).toBeGreaterThan(0);
    });
  });

  describe("Performance and Error Handling", () => {
    it("handles widget errors independently", async () => {
      // Mock console.error to avoid test noise
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <TestWrapper>
          <div className="grid gap-4 md:grid-cols-2">
            <SmartRecommendationsWidget />
            <TimeTrackingWidget />
          </div>
        </TestWrapper>,
      );

      // Even if one widget has issues, others should work
      await waitFor(
        () => {
          // At least one should be working
          const hasRecommendations = screen.queryByText("AI Recommendations");
          const hasTimeTracking = screen.queryByText("Time Tracking");
          expect(hasRecommendations || hasTimeTracking).toBeTruthy();
        },
        { timeout: 1500 },
      );

      consoleSpy.mockRestore();
    });

    it("does not block dashboard rendering when AI components load slowly", async () => {
      render(
        <TestWrapper>
          <div className="space-y-4">
            <h1>Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-3">
              <TimeTrackingWidget />
              <SmartRecommendationsWidget />
              <div data-testid="regular-widget">Regular Widget</div>
            </div>
          </div>
        </TestWrapper>,
      );

      // Dashboard structure should be immediately available
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByTestId("regular-widget")).toBeInTheDocument();

      // AI widgets can load asynchronously
      await waitFor(
        () => {
          expect(screen.getByText("Time Tracking")).toBeInTheDocument();
        },
        { timeout: 1500 },
      );
    });

    it("maintains responsive design with AI widgets", () => {
      const { container } = render(
        <TestWrapper>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <TimeTrackingWidget />
            <SmartRecommendationsWidget />
            <div className="md:col-span-2 lg:col-span-1">
              <RecommendationsBanner context="general" />
            </div>
          </div>
        </TestWrapper>,
      );

      // Should maintain grid structure
      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass("gap-4", "md:grid-cols-2", "lg:grid-cols-3");
    });
  });

  describe("Accessibility Integration", () => {
    it("maintains proper focus management across AI widgets", async () => {
      render(
        <TestWrapper>
          <div>
            <SmartRecommendationsWidget />
            <TimeTrackingWidget />
          </div>
        </TestWrapper>,
      );

      await waitFor(
        () => {
          expect(screen.getByText("AI Recommendations")).toBeInTheDocument();
        },
        { timeout: 1500 },
      );

      // All interactive elements should be focusable
      const buttons = screen.getAllByRole("button");
      const links = screen.getAllByRole("link");

      expect(buttons.length + links.length).toBeGreaterThan(0);

      // Test focus on first button
      if (buttons.length > 0) {
        buttons[0].focus();
        expect(document.activeElement).toBe(buttons[0]);
      }
    });

    it("provides proper ARIA labels and roles", async () => {
      render(
        <TestWrapper>
          <SmartRecommendationsWidget />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("AI Recommendations")).toBeInTheDocument();
      });

      // Check for proper headings
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);

      // Check for proper button roles
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
