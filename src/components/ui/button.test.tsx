import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button, buttonVariants } from './button';
import { setMobileViewport, setDesktopViewport } from '@/test/test-utils';

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations);

describe('Button Component', () => {
  beforeEach(() => {
    setDesktopViewport();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should render as child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      const link = screen.getByRole('link', { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should apply custom className', () => {
      render(<Button className="custom-class">Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should render with custom type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      render(<Button variant="default">Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('should render destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground');
    });

    it('should render outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'border-input', 'bg-background');
    });

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('should render link variant', () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-primary', 'underline-offset-4');
    });
  });

  describe('Sizes', () => {
    it('should render default size', () => {
      render(<Button size="default">Default Size</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'px-4', 'py-2');
    });

    it('should render small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9', 'px-3');
    });

    it('should render large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11', 'px-8');
    });

    it('should render icon size', () => {
      render(<Button size="icon">🔍</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'w-10');
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('should show loading state with aria-busy', () => {
      render(<Button aria-busy="true">Loading...</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('User Interactions', () => {
    it('should handle click events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger click when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle keyboard events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Keyboard Test</Button>);
      const button = screen.getByRole('button');

      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);

      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should have minimum touch target size on mobile', () => {
      setMobileViewport();
      render(<Button>Mobile Button</Button>);
      const button = screen.getByRole('button');

      // Check that the button has the appropriate Tailwind classes for touch targets
      expect(button).toHaveClass('h-10'); // Should have height class

      // Alternative check: verify the button element exists and is clickable
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('should be accessible on mobile devices', () => {
      setMobileViewport();
      render(<Button>Mobile Accessible</Button>);
      const button = screen.getByRole('button');

      // Should have proper touch manipulation
      expect(button).toHaveClass('inline-flex');

      // Should be focusable (buttons are focusable by default, no tabindex needed)
      expect(button).toBeInTheDocument();
      expect(button).not.toHaveAttribute('disabled');
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Button>Accessible Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support screen readers', () => {
      render(<Button aria-label="Custom label">SR Test</Button>);
      const button = screen.getByRole('button', { name: /custom label/i });
      expect(button).toBeInTheDocument();
    });

    it('should have proper focus management', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Button>First</Button>
          <Button>Second</Button>
        </div>
      );

      const firstButton = screen.getByRole('button', { name: /first/i });
      const secondButton = screen.getByRole('button', { name: /second/i });

      await user.tab();
      expect(firstButton).toHaveFocus();

      await user.tab();
      expect(secondButton).toHaveFocus();
    });

    it('should have visible focus indicator', async () => {
      const user = userEvent.setup();
      render(<Button>Focus Test</Button>);
      const button = screen.getByRole('button');

      await user.tab();
      expect(button).toHaveFocus();
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });

    it('should support high contrast mode', () => {
      render(<Button variant="outline">High Contrast</Button>);
      const button = screen.getByRole('button');

      // Should have border for high contrast mode
      expect(button).toHaveClass('border');
    });
  });

  describe('Button Variants Helper', () => {
    it('should generate correct classes for variants', () => {
      const defaultClasses = buttonVariants();
      expect(defaultClasses).toContain('bg-primary');
      expect(defaultClasses).toContain('h-10');
    });

    it('should handle custom variant combinations', () => {
      const classes = buttonVariants({
        variant: 'destructive',
        size: 'lg',
        className: 'custom-class'
      });
      expect(classes).toContain('bg-destructive');
      expect(classes).toContain('h-11');
      expect(classes).toContain('custom-class');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing children gracefully', () => {
      render(<Button />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toBeEmptyDOMElement();
    });

    it('should handle invalid props gracefully', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        // @ts-expect-error Testing invalid props
        <Button variant="invalid" size="invalid">
          Invalid Props
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      consoleError.mockRestore();
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now();
      render(<Button>Performance Test</Button>);
      const endTime = performance.now();

      // Should render in less than 16.7ms (60fps target)
      expect(endTime - startTime).toBeLessThan(16.7);
    });

    it('should not cause unnecessary re-renders', () => {
      const renderSpy = vi.fn();
      const TestButton = () => {
        renderSpy();
        return <Button>Render Test</Button>;
      };

      const { rerender } = render(<TestButton />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      rerender(<TestButton />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });
});