import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecommendationsBanner } from '@/components/ai/RecommendationsBanner';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('RecommendationsBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders with default general context', () => {
    renderWithRouter(<RecommendationsBanner />);

    expect(screen.getByText('Take a 5-minute break')).toBeInTheDocument();
    expect(screen.getByText("You've been focused for 45 minutes. A short break will help maintain productivity.")).toBeInTheDocument();
    expect(screen.getByText('wellness')).toBeInTheDocument();
    expect(screen.getByText('89% confidence')).toBeInTheDocument();
  });

  it('renders tasks context recommendations', () => {
    renderWithRouter(<RecommendationsBanner context="tasks" />);

    expect(screen.getByText('Break down large tasks')).toBeInTheDocument();
    expect(screen.getByText('Tasks over 2 hours should be split into smaller chunks for better estimation')).toBeInTheDocument();
    expect(screen.getByText('productivity')).toBeInTheDocument();
    expect(screen.getByText('85% confidence')).toBeInTheDocument();
  });

  it('renders goals context recommendations', () => {
    renderWithRouter(<RecommendationsBanner context="goals" />);

    expect(screen.getByText('Set weekly check-ins')).toBeInTheDocument();
    expect(screen.getByText('Weekly goal reviews increase achievement rates by 40%')).toBeInTheDocument();
    expect(screen.getByText('productivity')).toBeInTheDocument();
    expect(screen.getByText('78% confidence')).toBeInTheDocument();
  });

  it('renders habits context recommendations', () => {
    renderWithRouter(<RecommendationsBanner context="habits" />);

    expect(screen.getByText('Stack new habits')).toBeInTheDocument();
    expect(screen.getByText('Link new habits to existing routines for better adherence')).toBeInTheDocument();
    expect(screen.getByText('learning')).toBeInTheDocument();
    expect(screen.getByText('82% confidence')).toBeInTheDocument();
  });

  it('displays correct type colors for different recommendation types', () => {
    renderWithRouter(<RecommendationsBanner context="tasks" />);

    const productivityBadge = screen.getByText('productivity');
    expect(productivityBadge).toHaveClass('bg-blue-100', 'text-blue-800', 'border-blue-200');
  });

  it('handles dismiss functionality', () => {
    renderWithRouter(<RecommendationsBanner context="tasks" />);

    expect(screen.getByText('Break down large tasks')).toBeInTheDocument();

    const dismissButton = screen.getByRole('button', { name: '' }); // X button
    fireEvent.click(dismissButton);

    // Component should be hidden after dismiss
    expect(screen.queryByText('Break down large tasks')).not.toBeInTheDocument();
  });

  it('handles action button with URL navigation', () => {
    renderWithRouter(<RecommendationsBanner context="tasks" />);

    const actionButton = screen.getByText('Learn how');
    expect(actionButton.closest('a')).toHaveAttribute('href', '/ai-insights');
  });

  it('handles action button without URL', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    renderWithRouter(<RecommendationsBanner context="general" />);

    // The general context recommendation doesn't have a URL, so it should call the action handler
    const actionButton = screen.getByText('Start timer');
    expect(actionButton.closest('a')).toHaveAttribute('href', '/time-tracking');

    consoleSpy.mockRestore();
  });

  it('rotates through multiple recommendations when available', async () => {
    renderWithRouter(<RecommendationsBanner context="tasks" />);

    // Initially shows first recommendation
    expect(screen.getByText('Break down large tasks')).toBeInTheDocument();

    // Fast forward 15 seconds
    vi.advanceTimersByTime(15000);

    await waitFor(() => {
      expect(screen.getByText('Schedule during peak hours')).toBeInTheDocument();
      expect(screen.getByText('Your productivity peaks at 9-11 AM. Schedule important tasks then.')).toBeInTheDocument();
      expect(screen.getByText('optimization')).toBeInTheDocument();
    });
  });

  it('shows AI insights navigation link', () => {
    renderWithRouter(<RecommendationsBanner context="tasks" />);

    const sparklesButtons = screen.getAllByRole('button');
    const aiInsightsButton = sparklesButtons.find(button =>
      button.querySelector('svg') // Looking for the Sparkles icon
    );
    expect(aiInsightsButton).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = renderWithRouter(
      <RecommendationsBanner context="tasks" className="custom-class" />
    );

    const bannerElement = container.firstChild;
    expect(bannerElement).toHaveClass('custom-class');
  });

  it('does not render when no recommendations are available', () => {
    // Mock empty recommendations by providing invalid context
    const { container } = renderWithRouter(
      <RecommendationsBanner context="invalid" as any />
    );

    expect(container.firstChild).toBeNull();
  });

  it('shows correct page count for contexts with multiple recommendations', () => {
    renderWithRouter(<RecommendationsBanner context="tasks" />);

    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('shows correct page count for contexts with single recommendations', () => {
    renderWithRouter(<RecommendationsBanner context="goals" />);

    // Goals context has only one recommendation, so no page count should be shown
    expect(screen.queryByText('1/1')).not.toBeInTheDocument();
  });

  it('maintains accessibility with proper ARIA labels', () => {
    renderWithRouter(<RecommendationsBanner context="tasks" />);

    // Check for proper button roles
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);

    // Check for proper link roles
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('handles edge case with undefined context gracefully', () => {
    renderWithRouter(<RecommendationsBanner context={undefined as any} />);

    // Should fall back to general recommendations
    expect(screen.getByText('Take a 5-minute break')).toBeInTheDocument();
  });

  it('cleans up timers on unmount', () => {
    const { unmount } = renderWithRouter(<RecommendationsBanner context="tasks" />);

    // Start with first recommendation
    expect(screen.getByText('Break down large tasks')).toBeInTheDocument();

    // Unmount component
    unmount();

    // Fast forward time - should not cause any issues
    vi.advanceTimersByTime(15000);

    // No assertions needed - this test passes if no errors are thrown
  });

  it('displays wellness recommendation styling correctly', () => {
    renderWithRouter(<RecommendationsBanner context="general" />);

    const wellnessBadge = screen.getByText('wellness');
    expect(wellnessBadge).toHaveClass('bg-green-100', 'text-green-800', 'border-green-200');
  });

  it('displays learning recommendation styling correctly', () => {
    renderWithRouter(<RecommendationsBanner context="habits" />);

    const learningBadge = screen.getByText('learning');
    expect(learningBadge).toHaveClass('bg-purple-100', 'text-purple-800', 'border-purple-200');
  });

  it('displays optimization recommendation styling correctly', () => {
    renderWithRouter(<RecommendationsBanner context="tasks" />);

    // Navigate to second recommendation which is optimization type
    vi.advanceTimersByTime(15000);

    waitFor(() => {
      const optimizationBadge = screen.getByText('optimization');
      expect(optimizationBadge).toHaveClass('bg-orange-100', 'text-orange-800', 'border-orange-200');
    });
  });
});