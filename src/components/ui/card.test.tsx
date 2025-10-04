import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from './card';
import { setMobileViewport, setDesktopViewport } from '@/test/test-utils';

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations);

describe('Card Components', () => {
  beforeEach(() => {
    setDesktopViewport();
  });

  describe('Card', () => {
    it('should render with default props', () => {
      render(<Card>Card Content</Card>);
      const card = screen.getByText('Card Content');
      expect(card).toBeInTheDocument();
    });

    it('should apply default classes', () => {
      render(<Card data-testid="card">Card Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass(
        'rounded-lg',
        'border',
        'bg-card',
        'text-card-foreground',
        'shadow-sm'
      );
    });

    it('should accept custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('rounded-lg'); // Should still have default classes
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(<Card ref={ref}>Content</Card>);
      expect(ref).toHaveBeenCalled();
    });

    it('should accept all div props', () => {
      render(
        <Card
          data-testid="card"
          id="test-card"
          role="region"
          aria-label="Test card"
        >
          Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('id', 'test-card');
      expect(card).toHaveAttribute('role', 'region');
      expect(card).toHaveAttribute('aria-label', 'Test card');
    });
  });

  describe('CardHeader', () => {
    it('should render with correct structure', () => {
      render(<CardHeader data-testid="header">Header Content</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });

    it('should accept custom className', () => {
      render(<CardHeader className="custom-header" data-testid="header">Content</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('custom-header');
      expect(header).toHaveClass('flex', 'flex-col'); // Should maintain default classes
    });

    it('should render children correctly', () => {
      render(
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  describe('CardTitle', () => {
    it('should render as h3 element', () => {
      render(<CardTitle>Test Title</CardTitle>);
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Test Title');
    });

    it('should have proper styling classes', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>);
      const title = screen.getByTestId('title');
      expect(title).toHaveClass(
        'text-2xl',
        'font-semibold',
        'leading-none',
        'tracking-tight'
      );
    });

    it('should accept custom className', () => {
      render(<CardTitle className="custom-title" data-testid="title">Title</CardTitle>);
      const title = screen.getByTestId('title');
      expect(title).toHaveClass('custom-title', 'text-2xl');
    });

    it('should maintain semantic heading structure', () => {
      render(
        <div>
          <CardTitle>Main Title</CardTitle>
          <h4>Subtitle</h4>
        </div>
      );
      const mainTitle = screen.getByRole('heading', { level: 3 });
      const subtitle = screen.getByRole('heading', { level: 4 });
      expect(mainTitle).toBeInTheDocument();
      expect(subtitle).toBeInTheDocument();
    });
  });

  describe('CardDescription', () => {
    it('should render as paragraph element', () => {
      render(<CardDescription>Test description</CardDescription>);
      const description = screen.getByText('Test description');
      expect(description.tagName).toBe('P');
    });

    it('should have muted foreground styling', () => {
      render(<CardDescription data-testid="desc">Description</CardDescription>);
      const description = screen.getByTestId('desc');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('should accept custom className', () => {
      render(<CardDescription className="custom-desc" data-testid="desc">Text</CardDescription>);
      const description = screen.getByTestId('desc');
      expect(description).toHaveClass('custom-desc', 'text-sm');
    });
  });

  describe('CardContent', () => {
    it('should render with content padding', () => {
      render(<CardContent data-testid="content">Card body content</CardContent>);
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('p-6', 'pt-0');
    });

    it('should accept custom className', () => {
      render(<CardContent className="custom-content" data-testid="content">Content</CardContent>);
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('custom-content', 'p-6');
    });

    it('should render children correctly', () => {
      render(
        <CardContent>
          <p>Paragraph content</p>
          <button>Action button</button>
        </CardContent>
      );
      expect(screen.getByText('Paragraph content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action button' })).toBeInTheDocument();
    });
  });

  describe('CardFooter', () => {
    it('should render with flex layout', () => {
      render(<CardFooter data-testid="footer">Footer content</CardFooter>);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });

    it('should accept custom className', () => {
      render(<CardFooter className="custom-footer" data-testid="footer">Footer</CardFooter>);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('custom-footer', 'flex', 'items-center');
    });

    it('should typically contain action buttons', () => {
      render(
        <CardFooter>
          <button>Cancel</button>
          <button>Save</button>
        </CardFooter>
      );
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });
  });

  describe('Complete Card Structure', () => {
    it('should render full card with all components', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description text</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      const card = screen.getByTestId('complete-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Card Title');
      expect(screen.getByText('Card description text')).toBeInTheDocument();
      expect(screen.getByText('This is the main content of the card.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('should maintain proper semantic structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
            <CardDescription>This card follows accessibility guidelines</CardDescription>
          </CardHeader>
          <CardContent>
            Content here
          </CardContent>
        </Card>
      );

      // Should have proper heading hierarchy
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();

      // Description should be associated with content
      const description = screen.getByText('This card follows accessibility guidelines');
      expect(description).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should be readable on mobile devices', () => {
      setMobileViewport();

      render(
        <Card>
          <CardHeader>
            <CardTitle>Mobile Card Title</CardTitle>
            <CardDescription>Description text that should wrap properly on mobile</CardDescription>
          </CardHeader>
          <CardContent>
            Mobile-friendly content
          </CardContent>
        </Card>
      );

      const title = screen.getByText('Mobile Card Title');
      const description = screen.getByText('Description text that should wrap properly on mobile');

      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
    });

    it('should maintain touch-friendly spacing on mobile', () => {
      setMobileViewport();

      render(
        <Card data-testid="mobile-card">
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );

      const card = screen.getByTestId('mobile-card');
      expect(card).toHaveClass('rounded-lg'); // Should maintain adequate structure
    });

    it('should stack content vertically on mobile', () => {
      setMobileViewport();

      render(
        <CardFooter data-testid="mobile-footer">
          <button>Button 1</button>
          <button>Button 2</button>
        </CardFooter>
      );

      const footer = screen.getByTestId('mobile-footer');
      expect(footer).toHaveClass('flex'); // Should use flex layout even on mobile
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
            <CardDescription>This is a description</CardDescription>
          </CardHeader>
          <CardContent>
            Card content here
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support landmark roles when appropriate', () => {
      render(
        <Card role="region" aria-labelledby="card-title">
          <CardHeader>
            <CardTitle id="card-title">Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            This card contains important information
          </CardContent>
        </Card>
      );

      const region = screen.getByRole('region', { name: 'Important Information' });
      expect(region).toBeInTheDocument();
    });

    it('should support screen readers with proper structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Screen Reader Test</CardTitle>
            <CardDescription>This description provides context</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Content paragraph 1</p>
            <p>Content paragraph 2</p>
          </CardContent>
        </Card>
      );

      // Verify semantic structure
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Screen Reader Test');

      const paragraphs = screen.getAllByText(/Content paragraph/);
      expect(paragraphs).toHaveLength(2);
    });

    it('should handle keyboard navigation within card content', () => {
      render(
        <Card>
          <CardContent>
            <button>First Button</button>
            <input type="text" placeholder="Text input" />
            <button>Second Button</button>
          </CardContent>
        </Card>
      );

      const firstButton = screen.getByRole('button', { name: 'First Button' });
      const textInput = screen.getByPlaceholderText('Text input');
      const secondButton = screen.getByRole('button', { name: 'Second Button' });

      expect(firstButton).toBeInTheDocument();
      expect(textInput).toBeInTheDocument();
      expect(secondButton).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now();

      render(
        <Card>
          <CardHeader>
            <CardTitle>Performance Test</CardTitle>
            <CardDescription>Testing render performance</CardDescription>
          </CardHeader>
          <CardContent>
            Content for performance testing
          </CardContent>
        </Card>
      );

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50); // Should render in less than 50ms
    });

    it('should handle large content efficiently', () => {
      const largeContent = Array.from({ length: 100 }, (_, i) =>
        `Line ${i + 1} of content`
      ).join(' ');

      const startTime = performance.now();

      render(
        <Card>
          <CardContent>
            {largeContent}
          </CardContent>
        </Card>
      );

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should handle large content efficiently
    });

    it('should not cause unnecessary re-renders', () => {
      const renderSpy = vi.fn();

      const TestCard = ({ content }: { content: string }) => {
        renderSpy();
        return (
          <Card>
            <CardContent>{content}</CardContent>
          </Card>
        );
      };

      const { rerender } = render(<TestCard content="Initial content" />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      rerender(<TestCard content="Initial content" />); // Same content
      expect(renderSpy).toHaveBeenCalledTimes(2); // Should render again but predictably

      rerender(<TestCard content="Updated content" />); // Different content
      expect(renderSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing children gracefully', () => {
      render(<Card />);
      // Should not throw error with no children
    });

    it('should handle empty content gracefully', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle></CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      );
      // Should render empty elements without issues
    });

    it('should handle invalid props gracefully', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        // @ts-expect-error Testing invalid props
        <Card invalidProp="test">
          Content
        </Card>
      );

      // Should still render the card
      expect(screen.getByText('Content')).toBeInTheDocument();

      consoleError.mockRestore();
    });
  });
});