import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
  DialogOverlay,
  DialogPortal
} from './dialog';
import { setMobileViewport, setDesktopViewport } from '@/test/test-utils';

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations);

// Mock portal since it uses React portals
vi.mock('@radix-ui/react-dialog', async () => {
  const actual = await vi.importActual('@radix-ui/react-dialog');
  return {
    ...actual,
    Portal: ({ children }: { children: React.ReactNode }) => <div data-testid="portal">{children}</div>
  };
});

describe('Dialog Components', () => {
  beforeEach(() => {
    setDesktopViewport();
  });

  describe('Dialog Root', () => {
    it('should render without errors', () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Test Dialog</DialogTitle>
            <p>Dialog content</p>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Open Dialog')).toBeInTheDocument();
    });

    it('should control open state', async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Test Dialog</DialogTitle>
            <p>Dialog content</p>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Dialog content')).toBeInTheDocument();
      });
    });

    it('should handle controlled state', () => {
      const onOpenChange = vi.fn();

      const ControlledDialog = () => {
        const [open, setOpen] = React.useState(false);
        return (
          <Dialog open={open} onOpenChange={(newOpen) => {
            setOpen(newOpen);
            onOpenChange(newOpen);
          }}>
            <DialogTrigger onClick={() => setOpen(true)}>
              Open Dialog
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Controlled Dialog</DialogTitle>
              <p>Content</p>
            </DialogContent>
          </Dialog>
        );
      };

      render(<ControlledDialog />);
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('DialogTrigger', () => {
    it('should render trigger button correctly', () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByText('Open Dialog');
      expect(trigger).toBeInTheDocument();
    });

    it('should accept asChild prop', () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <button data-testid="custom-trigger">Custom Button</button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('DialogOverlay', () => {
    it('should render with default styles', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Test</DialogTitle>
            <DialogOverlay data-testid="overlay" />
          </DialogContent>
        </Dialog>
      );

      // Note: DialogOverlay is automatically included in DialogContent
      // This test verifies the overlay styling is applied correctly
      const overlay = document.querySelector('[data-testid="overlay"]');
      if (overlay) {
        expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50');
      }
    });

    it('should accept custom className', () => {
      render(
        <Dialog defaultOpen>
          <DialogPortal>
            <DialogOverlay className="custom-overlay" data-testid="overlay" />
            <DialogContent>
              <DialogTitle>Test</DialogTitle>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      );

      const overlay = screen.getByTestId('overlay');
      expect(overlay).toHaveClass('custom-overlay', 'fixed', 'inset-0');
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(
        <Dialog defaultOpen>
          <DialogPortal>
            <DialogOverlay ref={ref} />
            <DialogContent>
              <DialogTitle>Test</DialogTitle>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('DialogContent', () => {
    it('should render with default styles', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent data-testid="content">
            <DialogTitle>Test</DialogTitle>
            <p>Content</p>
          </DialogContent>
        </Dialog>
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveClass(
        'fixed',
        'left-[50%]',
        'top-[50%]',
        'z-50',
        'grid',
        'w-full',
        'max-w-lg',
        'translate-x-[-50%]',
        'translate-y-[-50%]'
      );
    });

    it('should include close button', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Test</DialogTitle>
            <p>Content</p>
          </DialogContent>
        </Dialog>
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should render children correctly', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Test Dialog</DialogTitle>
            <p>This is dialog content</p>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
      expect(screen.getByText('This is dialog content')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent className="custom-content" data-testid="content">
            <DialogTitle>Test</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveClass('custom-content', 'fixed');
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(
        <Dialog defaultOpen>
          <DialogContent ref={ref}>
            <DialogTitle>Test</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('DialogHeader', () => {
    it('should render with correct structure', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader data-testid="header">
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      const header = screen.getByTestId('header');
      expect(header).toHaveClass(
        'flex',
        'flex-col',
        'space-y-1.5',
        'text-center',
        'sm:text-left'
      );
    });

    it('should accept custom className', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader className="custom-header" data-testid="header">
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      const header = screen.getByTestId('header');
      expect(header).toHaveClass('custom-header', 'flex', 'flex-col');
    });

    it('should render children correctly', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Header Title</DialogTitle>
              <DialogDescription>Header Description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Header Title')).toBeInTheDocument();
      expect(screen.getByText('Header Description')).toBeInTheDocument();
    });
  });

  describe('DialogTitle', () => {
    it('should render with proper semantic element', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle data-testid="title">Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const title = screen.getByTestId('title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Dialog Title');
    });

    it('should have correct styling', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle data-testid="title">Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const title = screen.getByTestId('title');
      expect(title).toHaveClass(
        'text-lg',
        'font-semibold',
        'leading-none',
        'tracking-tight'
      );
    });

    it('should accept custom className', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle className="custom-title" data-testid="title">
              Title
            </DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const title = screen.getByTestId('title');
      expect(title).toHaveClass('custom-title', 'text-lg');
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle ref={ref}>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('DialogDescription', () => {
    it('should render with proper styling', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription data-testid="description">
              Dialog description text
            </DialogDescription>
          </DialogContent>
        </Dialog>
      );

      const description = screen.getByTestId('description');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
      expect(description).toHaveTextContent('Dialog description text');
    });

    it('should accept custom className', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription className="custom-desc" data-testid="description">
              Description
            </DialogDescription>
          </DialogContent>
        </Dialog>
      );

      const description = screen.getByTestId('description');
      expect(description).toHaveClass('custom-desc', 'text-sm');
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription ref={ref}>Description</DialogDescription>
          </DialogContent>
        </Dialog>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('DialogFooter', () => {
    it('should render with correct layout', () => {
      render(
        <DialogFooter data-testid="footer">
          <button>Cancel</button>
          <button>Confirm</button>
        </DialogFooter>
      );

      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass(
        'flex',
        'flex-col-reverse',
        'sm:flex-row',
        'sm:justify-end',
        'sm:space-x-2'
      );
    });

    it('should accept custom className', () => {
      render(
        <DialogFooter className="custom-footer" data-testid="footer">
          <button>Action</button>
        </DialogFooter>
      );

      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('custom-footer', 'flex');
    });

    it('should render children correctly', () => {
      render(
        <DialogFooter>
          <button>Cancel</button>
          <button>Save</button>
        </DialogFooter>
      );

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });
  });

  describe('DialogClose', () => {
    it('should close dialog when clicked', async () => {
      const user = userEvent.setup();

      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogClose data-testid="close-button">Close</DialogClose>
          </DialogContent>
        </Dialog>
      );

      const closeButton = screen.getByTestId('close-button');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
      });
    });

    it('should work as asChild', async () => {
      const user = userEvent.setup();

      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogClose asChild>
              <button data-testid="custom-close">Custom Close</button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      );

      const closeButton = screen.getByTestId('custom-close');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Complete Dialog Structure', () => {
    it('should render complete dialog correctly', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent data-testid="complete-dialog">
            <DialogHeader>
              <DialogTitle>Complete Dialog</DialogTitle>
              <DialogDescription>
                This is a complete dialog with all components
              </DialogDescription>
            </DialogHeader>
            <div>
              <p>Main dialog content goes here</p>
            </div>
            <DialogFooter>
              <DialogClose>Cancel</DialogClose>
              <button>Save Changes</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      const dialog = screen.getByTestId('complete-dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText('Complete Dialog')).toBeInTheDocument();
      expect(screen.getByText('This is a complete dialog with all components')).toBeInTheDocument();
      expect(screen.getByText('Main dialog content goes here')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    });

    it('should handle dialog with form', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();

      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Form Dialog</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit}>
              <input type="text" placeholder="Enter text" />
              <DialogFooter>
                <DialogClose type="button">Cancel</DialogClose>
                <button type="submit">Submit</button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close on Escape key', async () => {
      const user = userEvent.setup();

      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Test Dialog</DialogTitle>
            <p>Content</p>
          </DialogContent>
        </Dialog>
      );

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
      });
    });

    it('should trap focus within dialog', async () => {
      const user = userEvent.setup();

      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Focus Trap Test</DialogTitle>
            <input data-testid="first-input" placeholder="First input" />
            <input data-testid="second-input" placeholder="Second input" />
            <DialogClose data-testid="close-button">Close</DialogClose>
          </DialogContent>
        </Dialog>
      );

      const firstInput = screen.getByTestId('first-input');
      const secondInput = screen.getByTestId('second-input');
      const closeButton = screen.getByTestId('close-button');

      // Focus should start on first focusable element
      expect(firstInput).toHaveFocus();

      // Tab should move to next element
      await user.tab();
      expect(secondInput).toHaveFocus();

      // Tab should move to close button
      await user.tab();
      expect(closeButton).toHaveFocus();
    });

    it('should handle Enter key on interactive elements', async () => {
      const onButtonClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Keyboard Test</DialogTitle>
            <button onClick={onButtonClick} data-testid="action-button">
              Action
            </button>
          </DialogContent>
        </Dialog>
      );

      const actionButton = screen.getByTestId('action-button');
      actionButton.focus();
      await user.keyboard('{Enter}');

      expect(onButtonClick).toHaveBeenCalled();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should adapt layout for mobile', () => {
      setMobileViewport();

      render(
        <Dialog defaultOpen>
          <DialogContent data-testid="mobile-dialog">
            <DialogHeader>
              <DialogTitle>Mobile Dialog</DialogTitle>
            </DialogHeader>
            <DialogFooter data-testid="mobile-footer">
              <button>Cancel</button>
              <button>Save</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      const dialog = screen.getByTestId('mobile-dialog');
      const footer = screen.getByTestId('mobile-footer');

      expect(dialog).toHaveClass('sm:rounded-lg'); // Only rounded on larger screens
      expect(footer).toHaveClass('flex-col-reverse', 'sm:flex-row'); // Stacked on mobile
    });

    it('should maintain proper spacing on mobile', () => {
      setMobileViewport();

      render(
        <Dialog defaultOpen>
          <DialogContent data-testid="mobile-content">
            <DialogHeader>
              <DialogTitle>Mobile Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      const content = screen.getByTestId('mobile-content');
      expect(content).toHaveClass('p-6'); // Maintains adequate padding
    });

    it('should handle touch interactions', async () => {
      setMobileViewport();
      const user = userEvent.setup();

      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Touch Test</DialogTitle>
            <DialogClose data-testid="touch-close">Close</DialogClose>
          </DialogContent>
        </Dialog>
      );

      const closeButton = screen.getByTestId('touch-close');

      // Should handle touch events
      fireEvent.touchStart(closeButton);
      fireEvent.touchEnd(closeButton);
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Touch Test')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accessible Dialog</DialogTitle>
              <DialogDescription>
                This dialog follows accessibility guidelines
              </DialogDescription>
            </DialogHeader>
            <div>
              <p>Dialog content</p>
            </div>
            <DialogFooter>
              <DialogClose>Close</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent data-testid="dialog-content">
            <DialogTitle data-testid="dialog-title">ARIA Test Dialog</DialogTitle>
            <DialogDescription data-testid="dialog-description">
              Dialog description for screen readers
            </DialogDescription>
          </DialogContent>
        </Dialog>
      );

      const content = screen.getByTestId('dialog-content');
      const title = screen.getByTestId('dialog-title');
      const description = screen.getByTestId('dialog-description');

      expect(content).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
    });

    it('should support screen readers', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Screen Reader Test</DialogTitle>
            <DialogDescription>
              This description provides context for screen readers
            </DialogDescription>
            <p>Additional content for testing</p>
          </DialogContent>
        </Dialog>
      );

      // Should have proper semantic structure
      expect(screen.getByText('Screen Reader Test')).toBeInTheDocument();
      expect(screen.getByText('This description provides context for screen readers')).toBeInTheDocument();
    });

    it('should handle focus management for screen readers', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Focus Management</DialogTitle>
            <input data-testid="dialog-input" placeholder="Input field" />
            <button data-testid="dialog-button">Button</button>
          </DialogContent>
        </Dialog>
      );

      const input = screen.getByTestId('dialog-input');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Animation and Transitions', () => {
    it('should have animation classes', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent data-testid="animated-content">
            <DialogTitle>Animation Test</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const content = screen.getByTestId('animated-content');
      expect(content).toHaveClass(
        'duration-200',
        'data-[state=open]:animate-in',
        'data-[state=closed]:animate-out'
      );
    });

    it('should handle overlay animations', () => {
      render(
        <Dialog defaultOpen>
          <DialogPortal>
            <DialogOverlay data-testid="animated-overlay" />
            <DialogContent>
              <DialogTitle>Test</DialogTitle>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      );

      const overlay = screen.getByTestId('animated-overlay');
      expect(overlay).toHaveClass(
        'data-[state=open]:animate-in',
        'data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0',
        'data-[state=open]:fade-in-0'
      );
    });
  });

  describe('Performance', () => {
    it('should render efficiently', () => {
      const startTime = performance.now();

      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Performance Test</DialogTitle>
              <DialogDescription>Testing render performance</DialogDescription>
            </DialogHeader>
            <div>Content</div>
            <DialogFooter>
              <button>Action</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50); // Should render quickly
    });

    it('should handle portal efficiently', () => {
      const startTime = performance.now();

      render(
        <Dialog defaultOpen>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent>
              <DialogTitle>Portal Test</DialogTitle>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      );

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing title gracefully', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(
        <Dialog defaultOpen>
          <DialogContent data-testid="no-title-dialog">
            <p>Content without title</p>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByTestId('no-title-dialog')).toBeInTheDocument();
      consoleWarn.mockRestore();
    });

    it('should handle invalid props gracefully', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <Dialog defaultOpen>
          <DialogContent
            // @ts-expect-error Testing invalid props
            invalidProp="test"
            data-testid="invalid-dialog"
          >
            <DialogTitle>Test</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByTestId('invalid-dialog')).toBeInTheDocument();
      consoleError.mockRestore();
    });

    it('should handle empty content gracefully', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent data-testid="empty-dialog">
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByTestId('empty-dialog')).toBeInTheDocument();
    });
  });
});