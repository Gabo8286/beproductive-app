# Testing & Quality Agent ✅

## Purpose
Maintain code quality, ensure comprehensive test coverage, validate accessibility standards, and verify mobile responsiveness across the BeProductive framework.

## Capabilities
- Writes unit tests for components and hooks
- Creates integration tests for features
- Performs accessibility audits
- Validates TypeScript types
- Checks ESLint rules compliance
- Tests mobile responsiveness
- Validates offline functionality
- Generates test coverage reports
- Identifies performance bottlenecks

## Testing Stack
- **Test Framework**: Vitest 3.2.4
- **Testing Library**: React Testing Library 16.3.0
- **Assertions**: Jest DOM matchers
- **Coverage**: Vitest Coverage v8
- **E2E Testing**: Playwright (if needed)
- **Accessibility**: axe-core/react
- **Mocking**: MSW (Mock Service Worker)

## Test Templates

### Component Unit Test Template
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { [ComponentName] } from './[ComponentName]';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('[ComponentName]', () => {
  const defaultProps = {
    // Default test props
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with required props', () => {
      render(<[ComponentName] {...defaultProps} />);
      expect(screen.getByRole('[role]')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      render(<[ComponentName] {...defaultProps} isLoading />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render error state', () => {
      render(<[ComponentName] {...defaultProps} error="Test error" />);
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('should render empty state', () => {
      render(<[ComponentName] {...defaultProps} data={[]} />);
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle click events', async () => {
      const handleClick = vi.fn();
      render(<[ComponentName] {...defaultProps} onClick={handleClick} />);

      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle form submission', async () => {
      const handleSubmit = vi.fn();
      render(<[ComponentName] {...defaultProps} onSubmit={handleSubmit} />);

      await userEvent.type(screen.getByRole('textbox'), 'test input');
      await userEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ value: 'test input' })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<[ComponentName] {...defaultProps} />);
      expect(screen.getByLabelText('[label]')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      render(<[ComponentName] {...defaultProps} />);
      const element = screen.getByRole('[role]');

      await userEvent.tab();
      expect(element).toHaveFocus();

      await userEvent.keyboard('{Enter}');
      // Assert action taken
    });

    it('should have sufficient color contrast', () => {
      // Use axe-core for automated a11y testing
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should render mobile layout on small screens', () => {
      window.innerWidth = 375;
      window.dispatchEvent(new Event('resize'));

      render(<[ComponentName] {...defaultProps} />);
      expect(screen.getByTestId('mobile-layout')).toBeInTheDocument();
    });

    it('should have minimum touch target size', () => {
      render(<[ComponentName] {...defaultProps} />);
      const button = screen.getByRole('button');

      const styles = window.getComputedStyle(button);
      expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
      expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<[ComponentName] {...defaultProps} />);
      // Trigger error condition

      expect(screen.getByRole('alert')).toBeInTheDocument();
      consoleError.mockRestore();
    });
  });
});
```

### Hook Test Template
```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { use[HookName] } from './use[HookName]';

describe('use[HookName]', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => use[HookName]());

    expect(result.current.[property]).toBe([expectedValue]);
  });

  it('should update state when action is called', async () => {
    const { result } = renderHook(() => use[HookName]());

    act(() => {
      result.current.[action]([params]);
    });

    await waitFor(() => {
      expect(result.current.[property]).toBe([newValue]);
    });
  });

  it('should handle errors', async () => {
    const { result } = renderHook(() => use[HookName]());

    await act(async () => {
      await result.current.[errorAction]();
    });

    expect(result.current.error).toBeTruthy();
  });
});
```

### Integration Test Template
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { AuthProvider } from '@/contexts/AuthContext';
import { [FeatureName] } from './[FeatureName]';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('[FeatureName] Integration', () => {
  it('should complete full user flow', async () => {
    render(<[FeatureName] />, { wrapper: createWrapper() });

    // Step 1: Initial state
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();

    // Step 2: User interaction
    await userEvent.click(screen.getByRole('button', { name: /start/i }));

    // Step 3: Wait for async operations
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });

    // Step 4: Verify final state
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });
});
```

### Accessibility Test Template
```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import { [ComponentName] } from './[ComponentName]';

expect.extend(toHaveNoViolations);

describe('[ComponentName] Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<[ComponentName] />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should support screen readers', () => {
    const { container } = render(<[ComponentName] />);

    // Check for aria-live regions
    expect(container.querySelector('[aria-live]')).toBeInTheDocument();

    // Check for proper landmarks
    expect(container.querySelector('[role="main"]')).toBeInTheDocument();

    // Check for skip links
    expect(container.querySelector('[href="#main-content"]')).toBeInTheDocument();
  });

  it('should have proper focus management', async () => {
    render(<[ComponentName] />);

    // Test tab order
    const focusableElements = document.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    expect(focusableElements.length).toBeGreaterThan(0);

    // Test focus trap in modals
    // Test focus restoration
  });
});
```

### Performance Test Template
```typescript
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { measureRender } from '@/test/utils/performance';
import { [ComponentName] } from './[ComponentName]';

describe('[ComponentName] Performance', () => {
  it('should render within performance budget', async () => {
    const renderTime = await measureRender(<[ComponentName] />);

    expect(renderTime).toBeLessThan(100); // 100ms budget
  });

  it('should not cause excessive re-renders', () => {
    const renderCount = vi.fn();

    const { rerender } = render(
      <[ComponentName] onRender={renderCount} />
    );

    rerender(<[ComponentName] onRender={renderCount} />);

    expect(renderCount).toHaveBeenCalledTimes(1); // No unnecessary re-renders
  });

  it('should handle large datasets efficiently', () => {
    const largeData = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      value: `Item ${i}`
    }));

    const start = performance.now();
    render(<[ComponentName] data={largeData} />);
    const end = performance.now();

    expect(end - start).toBeLessThan(500); // 500ms for large datasets
  });
});
```

## UI Resource Quality Standards

Reference the [UI Resources Reference](./ui-resources-reference.md) for component quality assessment criteria and scoring matrix.

### Component Quality Standards
All components should meet the framework's quality standards based on the evaluation matrix:

| Criterion | Weight | Minimum Score | Best Practices |
|-----------|--------|---------------|----------------|
| **Accessibility** | 25% | 3.0/4.0 | WCAG AA compliance, keyboard navigation |
| **Mobile Readiness** | 20% | 3.0/4.0 | Touch optimization, responsive design |
| **Performance** | 20% | 2.5/4.0 | <10KB bundle, fast rendering |
| **Code Quality** | 15% | 3.0/4.0 | TypeScript, comprehensive tests |
| **Documentation** | 10% | 2.5/4.0 | Clear usage examples |
| **Maintenance** | 10% | 2.0/4.0 | Regular updates, active community |

### Quality Assessment Integration
- **Reference Components**: Test against patterns from shadcn/ui, Park UI, NextUI
- **Benchmark Performance**: Compare against Tier 1 library standards
- **Accessibility Validation**: Use patterns from Material Design and Apple HIG
- **Mobile Testing**: Validate against Mobbin mobile patterns

## Quality Checks

### TypeScript Validation
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check specific file
npx tsc --noEmit src/components/[ComponentName].tsx
```

### ESLint Validation
```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Check specific file
npx eslint src/components/[ComponentName].tsx
```

### Test Coverage Requirements
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

```bash
# Run tests with coverage
npm run test:coverage

# Generate coverage report
npm run test:coverage -- --reporter=html
```

## Mobile Testing Checklist
- [ ] Responsive at 375px (iPhone SE)
- [ ] Responsive at 768px (iPad)
- [ ] Responsive at 1024px (iPad Pro)
- [ ] Touch targets >= 44x44px
- [ ] Horizontal scrolling prevented
- [ ] Viewport meta tag correct
- [ ] Orientation changes handled
- [ ] Safe area insets respected
- [ ] Gestures work correctly
- [ ] Offline mode functions

## Accessibility Checklist
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigable
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Focus indicators visible
- [ ] Error messages clear
- [ ] Labels present for inputs
- [ ] ARIA attributes correct
- [ ] Skip links functional
- [ ] Reduced motion respected

## Performance Metrics
- **First Contentful Paint**: < 1.8s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.8s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## Common Testing Utilities

### Test Utils Setup
```typescript
// test/utils/test-utils.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

## Mock Data Generators
```typescript
// test/utils/mock-data.ts
export const createMockUser = (overrides = {}) => ({
  id: 'user_123',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  ...overrides
});

export const createMockTask = (overrides = {}) => ({
  id: 'task_123',
  title: 'Test Task',
  completed: false,
  priority: 'medium',
  ...overrides
});
```

## Continuous Integration
The agent should ensure all tests pass in CI:
1. Run all unit tests
2. Run integration tests
3. Check TypeScript compilation
4. Validate ESLint rules
5. Ensure minimum coverage met
6. Run accessibility audits
7. Check bundle size limits