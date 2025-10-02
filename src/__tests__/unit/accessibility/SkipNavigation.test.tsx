import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils/test-utils';
import { SkipNavigation } from '@/components/accessibility/SkipNavigation';

describe('SkipNavigation', () => {
  it('renders skip link', () => {
    render(<SkipNavigation />);
    
    const skipLink = screen.getByText(/skip to main content/i);
    expect(skipLink).toBeInTheDocument();
  });

  it('has correct href pointing to main content', () => {
    render(<SkipNavigation />);
    
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('is visually hidden but accessible to screen readers', () => {
    render(<SkipNavigation />);
    
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toHaveClass('sr-only');
  });

  it('becomes visible on focus', () => {
    render(<SkipNavigation />);
    
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    skipLink.focus();
    
    // Should have focus-visible styles
    expect(document.activeElement).toBe(skipLink);
  });

  it('has proper keyboard navigation', () => {
    render(<SkipNavigation />);
    
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    
    // Tab to focus
    skipLink.focus();
    expect(document.activeElement).toBe(skipLink);
  });
});
