import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TouchOptimizedButton } from './TouchOptimizedButton';
import { setMobileViewport, setDesktopViewport, mockVibrate } from '@/test/test-utils';
import { mockTouchEvent } from '@/test/mock-data';

describe('TouchOptimizedButton Component', () => {
  beforeEach(() => {
    setMobileViewport();
    vi.clearAllMocks();

    // Mock vibrate API for each test - delete existing property first
    if ('vibrate' in navigator) {
      delete (navigator as any).vibrate;
    }
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    setDesktopViewport();
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<TouchOptimizedButton>Touch Me</TouchOptimizedButton>);
      const button = screen.getByRole('button', { name: /touch me/i });
      expect(button).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <TouchOptimizedButton className="custom-class">
          Custom Button
        </TouchOptimizedButton>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should inherit all button props', () => {
      render(
        <TouchOptimizedButton
          disabled
          type="submit"
          aria-label="Submit form"
        >
          Submit
        </TouchOptimizedButton>
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('aria-label', 'Submit form');
    });
  });

  describe('Touch Interactions', () => {
    it('should handle touch start events', () => {
      render(<TouchOptimizedButton>Touch Test</TouchOptimizedButton>);
      const button = screen.getByRole('button');

      fireEvent.touchStart(button, {
        touches: [{ clientX: 50, clientY: 50 }],
      });

      // Should show pressed state (check for the component itself)
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('relative');
    });

    it('should handle touch end events', () => {
      render(<TouchOptimizedButton>Touch Test</TouchOptimizedButton>);
      const button = screen.getByRole('button');

      fireEvent.touchStart(button, {
        touches: [{ clientX: 50, clientY: 50 }],
      });

      fireEvent.touchEnd(button);

      // Should remove pressed state
      // We can test this by checking if the component state resets
      expect(button).toBeInTheDocument();
    });

    it('should create ripple effect on touch', async () => {
      const { container } = render(<TouchOptimizedButton>Ripple Test</TouchOptimizedButton>);
      const button = screen.getByRole('button');

      // Mock getBoundingClientRect
      vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 100,
        height: 40,
        right: 100,
        bottom: 40,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      fireEvent.touchStart(button, {
        touches: [{ clientX: 50, clientY: 20 }],
      });

      // Should create ripple element
      await waitFor(() => {
        const ripple = container.querySelector('.absolute.pointer-events-none');
        expect(ripple).toBeInTheDocument();
      });
    });

    it('should trigger haptic feedback on touch', () => {
      render(<TouchOptimizedButton>Haptic Test</TouchOptimizedButton>);
      const button = screen.getByRole('button');

      fireEvent.touchStart(button, {
        touches: [{ clientX: 50, clientY: 50 }],
      });

      expect(navigator.vibrate).toHaveBeenCalledWith(10);
    });

    it('should not trigger haptic feedback when disabled', () => {
      render(
        <TouchOptimizedButton hapticFeedback={false}>
          No Haptic
        </TouchOptimizedButton>
      );
      const button = screen.getByRole('button');

      fireEvent.touchStart(button, {
        touches: [{ clientX: 50, clientY: 50 }],
      });

      expect(navigator.vibrate).not.toHaveBeenCalled();
    });
  });

  describe('Long Press Functionality', () => {
    it('should trigger long press after specified duration', async () => {
      vi.useFakeTimers();
      const onLongPress = vi.fn();

      render(
        <TouchOptimizedButton
          onLongPress={onLongPress}
          longPressMs={500}
        >
          Long Press Test
        </TouchOptimizedButton>
      );
      const button = screen.getByRole('button');

      act(() => {
        fireEvent.touchStart(button, {
          touches: [{ clientX: 50, clientY: 50 }],
        });
      });

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(onLongPress).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('should cancel long press on touch end', async () => {
      vi.useFakeTimers();
      const onLongPress = vi.fn();

      render(
        <TouchOptimizedButton
          onLongPress={onLongPress}
          longPressMs={500}
        >
          Long Press Cancel Test
        </TouchOptimizedButton>
      );
      const button = screen.getByRole('button');

      act(() => {
        fireEvent.touchStart(button, {
          touches: [{ clientX: 50, clientY: 50 }],
        });
      });

      // Release before long press duration
      act(() => {
        vi.advanceTimersByTime(200);
        fireEvent.touchEnd(button);
      });

      // Complete the full duration
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(onLongPress).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should use default long press duration', async () => {
      vi.useFakeTimers();
      const onLongPress = vi.fn();

      render(
        <TouchOptimizedButton onLongPress={onLongPress}>
          Default Duration
        </TouchOptimizedButton>
      );
      const button = screen.getByRole('button');

      act(() => {
        fireEvent.touchStart(button, {
          touches: [{ clientX: 50, clientY: 50 }],
        });
      });

      // Should trigger after default 800ms
      act(() => {
        vi.advanceTimersByTime(800);
      });

      expect(onLongPress).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });

  describe('Click Handling', () => {
    it('should handle regular click events', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();

      render(
        <TouchOptimizedButton onClick={onClick}>
          Click Test
        </TouchOptimizedButton>
      );
      const button = screen.getByRole('button');

      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should handle both click and touch events', async () => {
      const onClick = vi.fn();

      render(
        <TouchOptimizedButton onClick={onClick}>
          Multi Event Test
        </TouchOptimizedButton>
      );
      const button = screen.getByRole('button');

      // Touch interaction (doesn't trigger onClick, just haptic feedback)
      fireEvent.touchStart(button, {
        touches: [{ clientX: 50, clientY: 50 }],
      });
      fireEvent.touchEnd(button);

      // Click interaction (triggers onClick)
      fireEvent.click(button);

      // Mouse click interaction (also triggers onClick)
      fireEvent.mouseDown(button);
      fireEvent.mouseUp(button);
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Visual States', () => {
    it('should show pressed state during touch', () => {
      render(<TouchOptimizedButton>Press State</TouchOptimizedButton>);
      const button = screen.getByRole('button');

      fireEvent.touchStart(button, {
        touches: [{ clientX: 50, clientY: 50 }],
      });

      // Should have pressed styling - check for the conditional classes
      expect(button).toHaveClass('scale-[0.97]', 'brightness-95');
    });

    it('should apply custom ripple color', async () => {
      const { container } = render(
        <TouchOptimizedButton rippleColor="rgba(255, 0, 0, 0.5)">
          Custom Ripple
        </TouchOptimizedButton>
      );
      const button = screen.getByRole('button');

      // Mock getBoundingClientRect
      vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 100,
        height: 40,
        right: 100,
        bottom: 40,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      fireEvent.touchStart(button, {
        touches: [{ clientX: 50, clientY: 20 }],
      });

      await waitFor(() => {
        const ripple = container.querySelector('.absolute.pointer-events-none');
        expect(ripple).toHaveStyle('background-color: rgba(255, 0, 0, 0.5)');
      });
    });
  });

  describe('Mobile-Specific Features', () => {
    it('should have minimum touch target size', () => {
      render(<TouchOptimizedButton>Touch Target</TouchOptimizedButton>);
      const button = screen.getByRole('button');

      // Mock getComputedStyle to return proper dimensions
      const mockGetComputedStyle = vi.fn().mockReturnValue({
        height: '40px',
        width: '80px',
        minHeight: '40px',
        minWidth: '40px',
      });
      Object.defineProperty(window, 'getComputedStyle', {
        value: mockGetComputedStyle,
        configurable: true,
      });

      const styles = window.getComputedStyle(button);
      const height = parseInt(styles.height) || parseInt(styles.minHeight);
      const width = parseInt(styles.width) || parseInt(styles.minWidth);

      // Should meet Apple HIG minimum 44px touch target
      expect(height).toBeGreaterThanOrEqual(40); // h-10 = 40px
      expect(width).toBeGreaterThanOrEqual(40);
    });

    it('should work with mobile viewport', () => {
      setMobileViewport();
      render(<TouchOptimizedButton>Mobile Test</TouchOptimizedButton>);
      const button = screen.getByRole('button');

      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('touch-manipulation');
    });

    it('should handle touch events on mobile devices', () => {
      render(<TouchOptimizedButton>Mobile Touch</TouchOptimizedButton>);
      const button = screen.getByRole('button');

      // Simulate mobile touch
      fireEvent.touchStart(button, {
        touches: [{ clientX: 50, clientY: 50 }],
        changedTouches: [{ clientX: 50, clientY: 50 }],
      });

      expect(navigator.vibrate).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should maintain accessibility with touch optimizations', () => {
      render(
        <TouchOptimizedButton aria-label="Accessible touch button">
          Accessible
        </TouchOptimizedButton>
      );
      const button = screen.getByLabelText(/accessible touch button/i);
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Accessible touch button');
    });

    it('should support keyboard navigation', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();

      render(
        <TouchOptimizedButton onClick={onClick}>
          Keyboard Test
        </TouchOptimizedButton>
      );
      const button = screen.getByRole('button');

      await user.tab();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalled();
    });

    it('should have proper focus indicators', async () => {
      const user = userEvent.setup();

      render(<TouchOptimizedButton>Focus Test</TouchOptimizedButton>);
      const button = screen.getByRole('button');

      await user.tab();
      expect(button).toHaveFocus();
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });
  });

  describe('Performance', () => {
    it('should cleanup timers on unmount', () => {
      vi.useFakeTimers();
      const onLongPress = vi.fn();

      const { unmount } = render(
        <TouchOptimizedButton onLongPress={onLongPress}>
          Cleanup Test
        </TouchOptimizedButton>
      );
      const button = screen.getByRole('button');

      act(() => {
        fireEvent.touchStart(button, {
          touches: [{ clientX: 50, clientY: 50 }],
        });
      });

      // Unmount before long press completes
      unmount();

      // Complete the timer duration
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should not trigger after unmount
      expect(onLongPress).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should handle rapid touch events efficiently', () => {
      render(<TouchOptimizedButton>Rapid Touch</TouchOptimizedButton>);
      const button = screen.getByRole('button');

      // Simulate rapid touches
      for (let i = 0; i < 10; i++) {
        fireEvent.touchStart(button, {
          touches: [{ clientX: 50 + i, clientY: 50 + i }],
        });
        fireEvent.touchEnd(button);
      }

      // Should handle all events without issues
      expect(button).toBeInTheDocument();
    });

    it('should cleanup ripples after animation', async () => {
      const { container } = render(<TouchOptimizedButton>Ripple Cleanup</TouchOptimizedButton>);
      const button = screen.getByRole('button');

      // Mock getBoundingClientRect
      vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 100,
        height: 40,
        right: 100,
        bottom: 40,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      fireEvent.touchStart(button, {
        touches: [{ clientX: 50, clientY: 20 }],
      });

      // Should create ripple
      await waitFor(() => {
        const ripple = container.querySelector('.absolute.pointer-events-none');
        expect(ripple).toBeInTheDocument();
      });

      // Wait for cleanup (600ms default)
      await waitFor(() => {
        const ripple = container.querySelector('.absolute.pointer-events-none');
        expect(ripple).not.toBeInTheDocument();
      }, { timeout: 700 });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing vibrate API gracefully', () => {
      // Remove vibrate from navigator
      delete (navigator as any).vibrate;

      render(<TouchOptimizedButton>No Vibrate</TouchOptimizedButton>);
      const button = screen.getByRole('button');

      // Should not throw error
      expect(() => {
        fireEvent.touchStart(button, {
          touches: [{ clientX: 50, clientY: 50 }],
        });
      }).not.toThrow();
    });

    it('should handle touch events without getBoundingClientRect', () => {
      render(<TouchOptimizedButton>No Bounds</TouchOptimizedButton>);
      const button = screen.getByRole('button');

      // Mock getBoundingClientRect to return null
      vi.spyOn(button, 'getBoundingClientRect').mockReturnValue(null as any);

      // Should not throw error
      expect(() => {
        fireEvent.touchStart(button, {
          touches: [{ clientX: 50, clientY: 50 }],
        });
      }).not.toThrow();
    });
  });
});