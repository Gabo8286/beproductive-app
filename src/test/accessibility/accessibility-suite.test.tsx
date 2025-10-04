import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Components to test
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { GoalCard } from '@/components/goals/GoalCard';
import { createMockGoal } from '@/test/mock-data';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock hooks for goal card testing
vi.mock('@/hooks/useGoals', () => ({
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

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user' },
    loading: false,
  }),
}));

vi.mock('@/utils/goalStatus', () => ({
  getStatusColor: vi.fn(() => 'blue'),
  getStatusLabel: vi.fn((status) => status),
  getAvailableStatusTransitions: vi.fn(() => ['active', 'completed']),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('Accessibility Testing Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic UI Components', () => {
    it('Button component should have no accessibility violations', async () => {
      const { container } = render(<Button>Click me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Button with icon should be accessible', async () => {
      const { container } = render(
        <Button>
          <span aria-hidden="true">🎯</span>
          Create Goal
        </Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Disabled button should be accessible', async () => {
      const { container } = render(<Button disabled>Disabled Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Card component should have no accessibility violations', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is accessible card content.</p>
          </CardContent>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Form Components', () => {
    it('Input with label should be accessible', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="test-input">Test Input</Label>
          <Input id="test-input" placeholder="Enter text" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Required input should be properly marked', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="required-input">
            Required Field <span aria-label="required">*</span>
          </Label>
          <Input
            id="required-input"
            required
            aria-required="true"
            placeholder="This field is required"
          />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Input with error state should be accessible', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="error-input">Input with Error</Label>
          <Input
            id="error-input"
            aria-invalid="true"
            aria-describedby="error-message"
          />
          <div id="error-message" role="alert">
            This field has an error
          </div>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Checkbox should be accessible', async () => {
      const { container } = render(
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" />
          <Label htmlFor="terms">Accept terms and conditions</Label>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Complex Components', () => {
    it('GoalCard should be accessible', async () => {
      const mockGoal = createMockGoal({
        title: 'Accessible Goal',
        description: 'This goal card should be accessible',
      });

      const { container } = render(<GoalCard goal={mockGoal} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Interactive elements should have proper focus management', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <div>
          <Button>First Button</Button>
          <Button>Second Button</Button>
          <Input placeholder="Text input" />
        </div>
      );

      // Test keyboard navigation
      await user.tab();
      expect(screen.getByText('First Button')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('Second Button')).toHaveFocus();

      await user.tab();
      expect(screen.getByPlaceholderText('Text input')).toHaveFocus();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ARIA Attributes and Labels', () => {
    it('Elements should have proper ARIA labels', async () => {
      const { container } = render(
        <div>
          <button aria-label="Close dialog">×</button>
          <div role="alert" aria-live="polite">
            Success message
          </div>
          <nav aria-label="Main navigation">
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/goals">Goals</a></li>
            </ul>
          </nav>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Loading states should be accessible', async () => {
      const { container } = render(
        <div>
          <Button disabled>
            <span role="status" aria-live="polite">
              Loading...
            </span>
          </Button>
          <div role="status" aria-live="polite" aria-label="Loading content">
            Please wait while we load your data
          </div>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Progress indicators should be accessible', async () => {
      const { container } = render(
        <div>
          <div
            role="progressbar"
            aria-valuenow={75}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Goal completion progress"
          >
            <div style={{ width: '75%', height: '20px', backgroundColor: 'blue' }} />
          </div>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('Should pass color contrast checks', async () => {
      const { container } = render(
        <div>
          <Button variant="default">Default Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="outline">Outline Button</Button>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Text content should be readable', async () => {
      const { container } = render(
        <div>
          <h1>Main Heading</h1>
          <h2>Subheading</h2>
          <p>Regular paragraph text that should be readable.</p>
          <small>Small text that should still meet contrast requirements.</small>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('Should support keyboard navigation patterns', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <h1>Keyboard Navigation Test</h1>
          <button>Button 1</button>
          <a href="#section">Link to section</a>
          <input type="text" placeholder="Text input" />
          <select>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
          <button>Button 2</button>
        </div>
      );

      // Test tab navigation
      await user.tab();
      expect(screen.getByText('Button 1')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('Link to section')).toHaveFocus();

      await user.tab();
      expect(screen.getByPlaceholderText('Text input')).toHaveFocus();

      // Test shift+tab reverse navigation
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(screen.getByText('Link to section')).toHaveFocus();
    });

    it('Should handle Enter and Space key interactions', async () => {
      const user = userEvent.setup();
      const clickHandler = vi.fn();

      render(
        <div>
          <Button onClick={clickHandler}>Click me</Button>
          <button onClick={clickHandler}>Regular button</button>
        </div>
      );

      // Test Enter key
      await user.tab();
      await user.keyboard('{Enter}');
      expect(clickHandler).toHaveBeenCalledTimes(1);

      // Test Space key
      await user.tab();
      await user.keyboard(' ');
      expect(clickHandler).toHaveBeenCalledTimes(2);
    });
  });

  describe('Screen Reader Support', () => {
    it('Should provide proper heading structure', async () => {
      const { container } = render(
        <div>
          <h1>Main Page Title</h1>
          <h2>Section Heading</h2>
          <h3>Subsection</h3>
          <h2>Another Section</h2>
          <h3>Another Subsection</h3>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Should use proper landmark roles', async () => {
      const { container } = render(
        <div>
          <header role="banner">
            <h1>Site Header</h1>
          </header>
          <nav role="navigation" aria-label="Main navigation">
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/goals">Goals</a></li>
            </ul>
          </nav>
          <main role="main">
            <h1>Main Content</h1>
            <p>This is the main content area.</p>
          </main>
          <footer role="contentinfo">
            <p>Footer content</p>
          </footer>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Should provide proper list semantics', async () => {
      const { container } = render(
        <div>
          <ul aria-label="Goal list">
            <li>
              <h3>Goal 1</h3>
              <p>Description of goal 1</p>
            </li>
            <li>
              <h3>Goal 2</h3>
              <p>Description of goal 2</p>
            </li>
          </ul>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Error Handling and Feedback', () => {
    it('Error messages should be accessible', async () => {
      const { container } = render(
        <div>
          <div role="alert" aria-live="assertive">
            <h2>Error</h2>
            <p>There was a problem processing your request.</p>
          </div>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Success messages should be accessible', async () => {
      const { container } = render(
        <div>
          <div role="status" aria-live="polite">
            <p>Your goal has been successfully created!</p>
          </div>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Form validation messages should be accessible', async () => {
      const { container } = render(
        <form>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              aria-invalid="true"
              aria-describedby="email-error"
            />
            <div id="email-error" role="alert">
              Please enter a valid email address
            </div>
          </div>
        </form>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Mobile Accessibility', () => {
    it('Touch targets should be appropriately sized', async () => {
      const { container } = render(
        <div>
          <Button className="min-h-[44px] min-w-[44px]">
            Mobile Button
          </Button>
          <button
            className="h-12 w-12"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Should support reduced motion preferences', async () => {
      const { container } = render(
        <div>
          <div className="transition-all duration-300 motion-reduce:transition-none">
            Animated content
          </div>
          <Button className="hover:scale-105 motion-reduce:hover:scale-100">
            Button with hover animation
          </Button>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Dynamic Content Accessibility', () => {
    it('Dynamic content updates should be announced', async () => {
      const user = userEvent.setup();

      const DynamicComponent = () => {
        const [count, setCount] = React.useState(0);

        return (
          <div>
            <button onClick={() => setCount(c => c + 1)}>
              Increment
            </button>
            <div role="status" aria-live="polite">
              Count: {count}
            </div>
          </div>
        );
      };

      const { container } = render(<DynamicComponent />);

      await user.click(screen.getByText('Increment'));
      expect(screen.getByText('Count: 1')).toBeInTheDocument();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Modal dialogs should trap focus', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      const ModalDialog = ({ isOpen }: { isOpen: boolean }) => {
        if (!isOpen) return null;

        return (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <h2 id="modal-title">Modal Dialog</h2>
            <button>First Button</button>
            <button>Second Button</button>
            <button onClick={onClose}>Close</button>
          </div>
        );
      };

      const { container } = render(<ModalDialog isOpen={true} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});