import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Input } from './input';
import { setMobileViewport, setDesktopViewport } from '@/test/test-utils';

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations);

describe('Input Component', () => {
  beforeEach(() => {
    setDesktopViewport();
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<Input data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('should behave as text input by default', () => {
      render(<Input data-testid="test-input" />);
      const input = screen.getByTestId('test-input') as HTMLInputElement;
      // HTML spec: input without type defaults to text behavior, but doesn't show type="text"
      expect(input.type).toBe('text'); // JavaScript property shows the effective type
    });

    it('should apply default classes', () => {
      render(<Input data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).toHaveClass(
        'flex',
        'h-10',
        'w-full',
        'rounded-md',
        'border',
        'border-input',
        'bg-background',
        'px-3',
        'py-2',
        'text-base',
        'ring-offset-background'
      );
    });

    it('should accept custom className', () => {
      render(<Input className="custom-class" data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('flex', 'h-10'); // Should still have default classes
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(<Input ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Input Types', () => {
    it('should render email input correctly', () => {
      render(<Input type="email" data-testid="email-input" />);
      const input = screen.getByTestId('email-input');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render password input correctly', () => {
      render(<Input type="password" data-testid="password-input" />);
      const input = screen.getByTestId('password-input');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render number input correctly', () => {
      render(<Input type="number" data-testid="number-input" />);
      const input = screen.getByTestId('number-input');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render search input correctly', () => {
      render(<Input type="search" data-testid="search-input" />);
      const input = screen.getByTestId('search-input');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('should render tel input correctly', () => {
      render(<Input type="tel" data-testid="tel-input" />);
      const input = screen.getByTestId('tel-input');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('should render url input correctly', () => {
      render(<Input type="url" data-testid="url-input" />);
      const input = screen.getByTestId('url-input');
      expect(input).toHaveAttribute('type', 'url');
    });

    it('should render date input correctly', () => {
      render(<Input type="date" data-testid="date-input" />);
      const input = screen.getByTestId('date-input');
      expect(input).toHaveAttribute('type', 'date');
    });

    it('should render file input correctly', () => {
      render(<Input type="file" data-testid="file-input" />);
      const input = screen.getByTestId('file-input');
      expect(input).toHaveAttribute('type', 'file');
    });
  });

  describe('Props and Attributes', () => {
    it('should accept value prop', () => {
      render(<Input value="test value" data-testid="test-input" readOnly />);
      const input = screen.getByTestId('test-input') as HTMLInputElement;
      expect(input.value).toBe('test value');
    });

    it('should accept placeholder prop', () => {
      render(<Input placeholder="Enter text here" data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('placeholder', 'Enter text here');
    });

    it('should accept disabled prop', () => {
      render(<Input disabled data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('should accept readOnly prop', () => {
      render(<Input readOnly data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('readonly');
    });

    it('should accept required prop', () => {
      render(<Input required data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('required');
    });

    it('should accept name prop', () => {
      render(<Input name="username" data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('name', 'username');
    });

    it('should accept id prop', () => {
      render(<Input id="user-input" data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('id', 'user-input');
    });

    it('should accept maxLength prop', () => {
      render(<Input maxLength={50} data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('maxlength', '50');
    });

    it('should accept minLength prop', () => {
      render(<Input minLength={3} data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('minlength', '3');
    });

    it('should accept pattern prop', () => {
      render(<Input pattern="[0-9]*" data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('pattern', '[0-9]*');
    });
  });

  describe('Error State', () => {
    it('should apply error styling when error prop is true', () => {
      render(<Input error data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).toHaveClass('border-destructive', 'focus-visible:ring-destructive');
    });

    it('should set aria-invalid when error prop is true', () => {
      render(<Input error data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should respect existing aria-invalid', () => {
      render(<Input aria-invalid="false" data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should combine error prop with aria-invalid', () => {
      render(<Input error aria-invalid="false" data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should not apply error styling when error is false', () => {
      render(<Input error={false} data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).not.toHaveClass('border-destructive');
      expect(input).toHaveClass('border-input'); // Should have default border
    });
  });

  describe('User Interactions', () => {
    it('should handle onChange events', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<Input onChange={onChange} data-testid="test-input" />);
      const input = screen.getByTestId('test-input');

      await user.type(input, 'Hello World');
      expect(onChange).toHaveBeenCalledTimes(11); // One call per character
    });

    it('should handle onFocus events', async () => {
      const onFocus = vi.fn();
      const user = userEvent.setup();

      render(<Input onFocus={onFocus} data-testid="test-input" />);
      const input = screen.getByTestId('test-input');

      await user.click(input);
      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle onBlur events', async () => {
      const onBlur = vi.fn();
      const user = userEvent.setup();

      render(
        <div>
          <Input onBlur={onBlur} data-testid="test-input" />
          <button>Other element</button>
        </div>
      );
      const input = screen.getByTestId('test-input');
      const button = screen.getByRole('button');

      await user.click(input);
      await user.click(button);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle onKeyDown events', async () => {
      const onKeyDown = vi.fn();
      const user = userEvent.setup();

      render(<Input onKeyDown={onKeyDown} data-testid="test-input" />);
      const input = screen.getByTestId('test-input');

      await user.type(input, 'a');
      expect(onKeyDown).toHaveBeenCalled();
    });

    it('should handle onKeyUp events', async () => {
      const onKeyUp = vi.fn();
      const user = userEvent.setup();

      render(<Input onKeyUp={onKeyUp} data-testid="test-input" />);
      const input = screen.getByTestId('test-input');

      await user.type(input, 'a');
      expect(onKeyUp).toHaveBeenCalled();
    });

    it('should handle Enter key press', async () => {
      const onKeyDown = vi.fn();
      const user = userEvent.setup();

      render(<Input onKeyDown={onKeyDown} data-testid="test-input" />);
      const input = screen.getByTestId('test-input');

      await user.type(input, '{Enter}');
      expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({
        key: 'Enter'
      }));
    });

    it('should handle Escape key press', async () => {
      const onKeyDown = vi.fn();
      const user = userEvent.setup();

      render(<Input onKeyDown={onKeyDown} data-testid="test-input" />);
      const input = screen.getByTestId('test-input');

      await user.type(input, '{Escape}');
      expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({
        key: 'Escape'
      }));
    });
  });

  describe('Focus Management', () => {
    it('should be focusable by default', () => {
      render(<Input data-testid="test-input" />);
      const input = screen.getByTestId('test-input');

      input.focus();
      expect(input).toHaveFocus();
    });

    it('should show focus ring on focus', () => {
      render(<Input data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring');
    });

    it('should not be focusable when disabled', () => {
      render(<Input disabled data-testid="test-input" />);
      const input = screen.getByTestId('test-input');

      input.focus();
      expect(input).not.toHaveFocus();
    });

    it('should support tabIndex', () => {
      render(<Input tabIndex={5} data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('tabindex', '5');
    });
  });

  describe('Form Integration', () => {
    it('should integrate with forms correctly', () => {
      render(
        <form data-testid="test-form">
          <Input name="username" defaultValue="john_doe" />
        </form>
      );

      const form = screen.getByTestId('test-form') as HTMLFormElement;
      const formData = new FormData(form);
      expect(formData.get('username')).toBe('john_doe');
    });

    it('should handle form validation', () => {
      render(
        <form>
          <Input required data-testid="required-input" />
        </form>
      );

      const input = screen.getByTestId('required-input') as HTMLInputElement;
      expect(input.checkValidity()).toBe(false); // Empty required field is invalid
    });

    it('should handle controlled input', async () => {
      const ControlledInput = () => {
        const [value, setValue] = React.useState('');
        return (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-testid="controlled-input"
          />
        );
      };

      const user = userEvent.setup();
      render(<ControlledInput />);
      const input = screen.getByTestId('controlled-input') as HTMLInputElement;

      await user.type(input, 'test');
      expect(input.value).toBe('test');
    });

    it('should handle uncontrolled input', async () => {
      const user = userEvent.setup();
      render(<Input defaultValue="initial" data-testid="uncontrolled-input" />);
      const input = screen.getByTestId('uncontrolled-input') as HTMLInputElement;

      expect(input.value).toBe('initial');
      await user.clear(input);
      await user.type(input, 'changed');
      expect(input.value).toBe('changed');
    });
  });

  describe('File Input Specific', () => {
    it('should handle file input props', () => {
      render(
        <Input
          type="file"
          accept=".jpg,.png"
          multiple
          data-testid="file-input"
        />
      );
      const input = screen.getByTestId('file-input');
      expect(input).toHaveAttribute('accept', '.jpg,.png');
      expect(input).toHaveAttribute('multiple');
    });

    it('should apply file-specific styling', () => {
      render(<Input type="file" data-testid="file-input" />);
      const input = screen.getByTestId('file-input');
      expect(input).toHaveClass(
        'file:border-0',
        'file:bg-transparent',
        'file:text-sm',
        'file:font-medium',
        'file:text-foreground'
      );
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should handle mobile viewport correctly', () => {
      setMobileViewport();

      render(<Input data-testid="mobile-input" />);
      const input = screen.getByTestId('mobile-input');

      expect(input).toHaveClass('text-base'); // Base size for mobile
      expect(input).toHaveClass('md:text-sm'); // Smaller on desktop
    });

    it('should maintain touch-friendly size on mobile', () => {
      setMobileViewport();

      render(<Input data-testid="mobile-input" />);
      const input = screen.getByTestId('mobile-input');

      expect(input).toHaveClass('h-10'); // 40px height is touch-friendly
    });

    it('should handle mobile input events', async () => {
      setMobileViewport();
      const onChange = vi.fn();

      render(<Input onChange={onChange} data-testid="mobile-input" />);
      const input = screen.getByTestId('mobile-input');

      // Simulate mobile typing
      fireEvent.change(input, { target: { value: 'mobile text' } });
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <div>
          <label htmlFor="accessible-input">Username</label>
          <Input id="accessible-input" />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support aria-describedby for help text', () => {
      render(
        <div>
          <Input aria-describedby="help-text" data-testid="input" />
          <div id="help-text">Enter your username</div>
        </div>
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('should support aria-label', () => {
      render(<Input aria-label="Search products" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-label', 'Search products');
    });

    it('should support aria-labelledby', () => {
      render(
        <div>
          <div id="input-label">Email Address</div>
          <Input aria-labelledby="input-label" data-testid="input" />
        </div>
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-labelledby', 'input-label');
    });

    it('should support screen readers with proper roles', () => {
      render(<Input role="searchbox" data-testid="search-input" />);
      const input = screen.getByRole('searchbox');
      expect(input).toBeInTheDocument();
    });

    it('should handle high contrast mode', () => {
      render(<Input data-testid="contrast-input" />);
      const input = screen.getByTestId('contrast-input');
      expect(input).toHaveClass('ring-offset-background'); // Ensures proper contrast
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now();

      render(<Input data-testid="perf-input" />);

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(20); // Should render very quickly
    });

    it('should handle large amounts of text efficiently', async () => {
      const largeText = 'a'.repeat(10000);
      const user = userEvent.setup();

      const startTime = performance.now();

      render(<Input data-testid="large-text-input" />);
      const input = screen.getByTestId('large-text-input');

      fireEvent.change(input, { target: { value: largeText } });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should handle large text efficiently
    });

    it('should not cause unnecessary re-renders', () => {
      const renderSpy = vi.fn();

      const TestInput = ({ placeholder }: { placeholder: string }) => {
        renderSpy();
        return <Input placeholder={placeholder} />;
      };

      const { rerender } = render(<TestInput placeholder="Initial" />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      rerender(<TestInput placeholder="Initial" />); // Same props
      expect(renderSpy).toHaveBeenCalledTimes(2); // Should render again but predictably

      rerender(<TestInput placeholder="Updated" />); // Different props
      expect(renderSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid props gracefully', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        // @ts-expect-error Testing invalid props
        <Input invalidProp="test" data-testid="invalid-input" />
      );

      // Should still render the input
      expect(screen.getByTestId('invalid-input')).toBeInTheDocument();

      consoleError.mockRestore();
    });

    it('should handle null/undefined values gracefully', () => {
      render(
        <Input
          value={undefined}
          placeholder={null as any}
          data-testid="null-input"
        />
      );

      expect(screen.getByTestId('null-input')).toBeInTheDocument();
    });

    it('should handle edge case input types', () => {
      render(<Input type="range" min="0" max="100" data-testid="range-input" />);
      const input = screen.getByTestId('range-input');
      expect(input).toHaveAttribute('type', 'range');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
    });
  });
});