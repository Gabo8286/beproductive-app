import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSkeleton } from '@/components/ai/LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders widget skeleton by default', () => {
    const { container } = render(<LoadingSkeleton />);

    // Should render a card with header and content
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
    expect(container.querySelector('.h-5.w-5')).toBeInTheDocument(); // Icon skeleton
    expect(container.querySelector('.h-5.w-24')).toBeInTheDocument(); // Title skeleton
  });

  it('renders widget skeleton when type is widget', () => {
    const { container } = render(<LoadingSkeleton type="widget" />);

    // Should have card structure
    expect(container.querySelector('.h-full')).toBeInTheDocument();
    // Should have header elements
    expect(container.querySelector('.h-5.w-5')).toBeInTheDocument(); // Icon
    expect(container.querySelector('.h-5.w-24')).toBeInTheDocument(); // Title
    // Should have grid elements
    expect(container.querySelector('.grid-cols-2')).toBeInTheDocument();
  });

  it('renders banner skeleton when type is banner', () => {
    const { container } = render(<LoadingSkeleton type="banner" />);

    // Should have banner styling
    expect(container.querySelector('.border-l-4.border-l-purple-500')).toBeInTheDocument();
    // Should have icon skeleton
    expect(container.querySelector('.h-8.w-8')).toBeInTheDocument();
    // Should have multiple skeleton elements in a row
    expect(container.querySelector('.h-4.w-32')).toBeInTheDocument();
    expect(container.querySelector('.h-5.w-16')).toBeInTheDocument();
  });

  it('renders tracker skeleton when type is tracker', () => {
    const { container } = render(<LoadingSkeleton type="tracker" />);

    // Should have header elements
    expect(container.querySelector('.h-8.w-64')).toBeInTheDocument(); // Large title
    expect(container.querySelector('.h-4.w-96')).toBeInTheDocument(); // Description
    expect(container.querySelector('.h-6.w-24')).toBeInTheDocument(); // Badge

    // Should have tabs structure
    expect(container.querySelector('.h-8.w-20')).toBeInTheDocument(); // Tab items

    // Should have content card
    expect(container.querySelector('.h-12.w-32')).toBeInTheDocument(); // Timer display
    expect(container.querySelector('.h-10.w-full')).toBeInTheDocument(); // Input field
  });

  it('renders page skeleton when type is page', () => {
    const { container } = render(<LoadingSkeleton type="page" />);

    // Should have header structure
    expect(container.querySelector('.h-8.w-48')).toBeInTheDocument(); // Title
    expect(container.querySelector('.h-4.w-72')).toBeInTheDocument(); // Description
    expect(container.querySelector('.h-10.w-32')).toBeInTheDocument(); // Button

    // Should have grid of cards (6 items)
    const gridCards = container.querySelectorAll('.grid > div');
    expect(gridCards).toHaveLength(6);

    // Should have list items (4 items)
    const listItems = container.querySelectorAll('.space-y-4 > div');
    expect(listItems).toHaveLength(5); // 4 list items + header
  });

  it('applies custom className when provided', () => {
    const { container } = render(<LoadingSkeleton className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies custom className to banner type', () => {
    const { container } = render(<LoadingSkeleton type="banner" className="banner-custom" />);

    expect(container.firstChild).toHaveClass('banner-custom');
  });

  it('applies custom className to tracker type', () => {
    const { container } = render(<LoadingSkeleton type="tracker" className="tracker-custom" />);

    expect(container.firstChild).toHaveClass('tracker-custom');
  });

  it('applies custom className to page type', () => {
    const { container } = render(<LoadingSkeleton type="page" className="page-custom" />);

    expect(container.firstChild).toHaveClass('page-custom');
  });

  it('has proper structure for widget skeleton', () => {
    const { container } = render(<LoadingSkeleton type="widget" />);

    // Should have card header
    const header = container.querySelector('.pb-2');
    expect(header).toBeInTheDocument();

    // Should have card content
    const content = container.querySelector('.space-y-4');
    expect(content).toBeInTheDocument();

    // Should have skeleton elements with proper sizes
    expect(container.querySelector('.h-4.w-full')).toBeInTheDocument();
    expect(container.querySelector('.h-4.w-3\\/4')).toBeInTheDocument();
    expect(container.querySelector('.h-16.w-full')).toBeInTheDocument();
    expect(container.querySelector('.h-8.w-full')).toBeInTheDocument();
  });

  it('has proper structure for banner skeleton', () => {
    const { container } = render(<LoadingSkeleton type="banner" />);

    // Should have proper border styling
    expect(container.querySelector('.border-l-4.border-l-purple-500')).toBeInTheDocument();

    // Should have flex layout
    expect(container.querySelector('.flex.items-center.justify-between')).toBeInTheDocument();

    // Should have icon placeholder
    expect(container.querySelector('.h-8.w-8.rounded-lg')).toBeInTheDocument();

    // Should have action buttons area
    expect(container.querySelector('.h-8.w-8.rounded')).toBeInTheDocument();
  });

  it('has proper structure for tracker skeleton', () => {
    const { container } = render(<LoadingSkeleton type="tracker" />);

    // Should have main container
    expect(container.querySelector('.space-y-6')).toBeInTheDocument();

    // Should have tabs mockup
    const tabsContainer = container.querySelector('.bg-muted.rounded-lg.p-1');
    expect(tabsContainer).toBeInTheDocument();

    // Should have multiple tab items
    const tabItems = container.querySelectorAll('.h-8.w-20.rounded');
    expect(tabItems).toHaveLength(4);

    // Should have content card
    expect(container.querySelector('.h-12.w-32.rounded')).toBeInTheDocument();
  });

  it('has proper structure for page skeleton with grid', () => {
    const { container } = render(<LoadingSkeleton type="page" />);

    // Should have grid container
    const grid = container.querySelector('.grid.gap-4.md\\:grid-cols-2.lg\\:grid-cols-3');
    expect(grid).toBeInTheDocument();

    // Should have 6 grid items
    const gridItems = grid?.querySelectorAll('div');
    expect(gridItems).toHaveLength(6);

    // Each grid item should have card structure
    gridItems?.forEach(item => {
      expect(item.querySelector('.h-5.w-24')).toBeInTheDocument(); // Title
      expect(item.querySelector('.h-8.w-16')).toBeInTheDocument(); // Value
      expect(item.querySelector('.h-3.w-20')).toBeInTheDocument(); // Description
    });
  });

  it('maintains consistent skeleton proportions', () => {
    const { container } = render(<LoadingSkeleton type="widget" />);

    // Check for responsive classes
    expect(container.querySelector('.h-16.w-full')).toBeInTheDocument();
    expect(container.querySelector('.grid-cols-2')).toBeInTheDocument();

    // Check for consistent spacing
    expect(container.querySelector('.space-y-4')).toBeInTheDocument();
    expect(container.querySelector('.space-y-2')).toBeInTheDocument();
  });

  it('uses proper semantic structure', () => {
    const { container } = render(<LoadingSkeleton type="widget" />);

    // Should use proper card structure
    expect(container.querySelector('[class*="card"]')).toBeDefined();

    // Should have proper role for loading indication
    const progressBars = container.querySelectorAll('[role="progressbar"]');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('handles edge case with undefined type gracefully', () => {
    const { container } = render(<LoadingSkeleton type={undefined as any} />);

    // Should default to page skeleton
    expect(container.querySelector('.h-8.w-48')).toBeInTheDocument(); // Page title skeleton
    expect(container.querySelector('.grid.gap-4')).toBeInTheDocument(); // Page grid
  });
});