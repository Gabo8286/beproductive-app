# Testing Guide for BeProductive

## Overview

This project uses **Vitest** as the testing framework with **React Testing Library** for component testing. We maintain comprehensive test coverage across unit, integration, and E2E tests.

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Structure

```
src/
├── __tests__/
│   ├── unit/              # Unit tests for isolated components/functions
│   │   ├── hooks/         # Hook tests
│   │   ├── utils/         # Utility function tests
│   │   └── components/    # Component tests
│   ├── integration/       # Integration tests for feature flows
│   │   ├── auth/          # Authentication flows
│   │   ├── goals/         # Goal management
│   │   └── tasks/         # Task management
│   └── e2e/              # End-to-end user journey tests
│       ├── user-journeys/
│       └── critical-paths/
├── test/
│   ├── setup.ts          # Global test setup
│   ├── utils/            # Test utilities
│   │   └── test-utils.tsx  # Custom render with providers
│   ├── mocks/            # MSW handlers and mocks
│   │   └── handlers.ts
│   └── fixtures/         # Mock data factories
│       └── mockData.ts
```

## Writing Tests

### Unit Tests

Unit tests should test isolated functionality:

```typescript
import { describe, it, expect } from 'vitest';
import { formatTime } from '@/lib/utils';

describe('formatTime', () => {
  it('should format seconds correctly', () => {
    expect(formatTime(65)).toBe('1:05');
  });
});
```

### Component Tests

Use `renderWithProviders` for components that need context:

```typescript
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils/test-utils';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Integration Tests

Test feature flows across multiple components:

```typescript
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils/test-utils';

describe('Task Creation Flow', () => {
  it('should create a new task', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskPage />);
    
    await user.click(screen.getByRole('button', { name: /new task/i }));
    await user.type(screen.getByLabelText(/title/i), 'New Task');
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });
});
```

### Using Mock Data

Use factories from `test/fixtures/mockData.ts`:

```typescript
import { createMockUser, createMockTask } from '@/test/fixtures/mockData';

const user = createMockUser({ email: 'custom@example.com' });
const task = createMockTask({ title: 'Custom Task' });
```

## Best Practices

### 1. Test Naming

Use descriptive test names that explain the behavior:

```typescript
// ✅ Good
it('should show error message when email is invalid', () => {});

// ❌ Bad
it('test email', () => {});
```

### 2. Arrange-Act-Assert Pattern

Structure tests clearly:

```typescript
it('should update task status', async () => {
  // Arrange
  const task = createMockTask({ status: 'todo' });
  renderWithProviders(<TaskCard task={task} />);
  
  // Act
  await userEvent.click(screen.getByRole('button', { name: /complete/i }));
  
  // Assert
  expect(screen.getByText(/completed/i)).toBeInTheDocument();
});
```

### 3. Test User Behavior, Not Implementation

```typescript
// ✅ Good - tests user behavior
it('should display success message after saving', async () => {
  await userEvent.click(screen.getByRole('button', { name: /save/i }));
  expect(await screen.findByText(/saved successfully/i)).toBeInTheDocument();
});

// ❌ Bad - tests implementation details
it('should call handleSave when button clicked', async () => {
  const handleSave = vi.fn();
  // ...
});
```

### 4. Avoid Test Interdependence

Each test should be independent and not rely on others:

```typescript
// ✅ Good
describe('TaskList', () => {
  it('should render empty state', () => {
    renderWithProviders(<TaskList tasks={[]} />);
  });
  
  it('should render tasks', () => {
    renderWithProviders(<TaskList tasks={[createMockTask()]} />);
  });
});
```

### 5. Use waitFor for Async Operations

```typescript
import { waitFor } from '@testing-library/react';

it('should load data', async () => {
  renderWithProviders(<MyComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Loaded Data')).toBeInTheDocument();
  });
});
```

## Coverage Requirements

- **Minimum Coverage**: 80% for all metrics (lines, functions, branches, statements)
- **New Code**: Must include tests before merging
- **Critical Paths**: 100% coverage required (auth, payment, data loss scenarios)

### Checking Coverage

```bash
npm run test:coverage
```

View detailed HTML report: `coverage/index.html`

## Mocking

### Mocking Hooks

```typescript
import * as useAuthModule from '@/hooks/useAuth';

vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
  user: createMockUser(),
  loading: false,
});
```

### Mocking API Calls

API mocking is handled by MSW in `test/mocks/handlers.ts`. Add new handlers as needed:

```typescript
export const handlers = [
  http.get('/api/tasks', () => {
    return HttpResponse.json([createMockTask()]);
  }),
];
```

## Continuous Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Pull requests (GitHub Actions)
- Before deployment

### CI Requirements

- All tests must pass
- Coverage thresholds must be met
- No test warnings or errors

## Debugging Tests

### Run Single Test File

```bash
npm test src/__tests__/unit/utils/utils.test.ts
```

### Run Tests Matching Pattern

```bash
npm test -- -t "formatTime"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test"],
  "console": "integratedTerminal"
}
```

## Common Patterns

### Testing Forms

```typescript
it('should submit form with valid data', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  
  renderWithProviders(<MyForm onSubmit={onSubmit} />);
  
  await user.type(screen.getByLabelText(/name/i), 'John Doe');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(onSubmit).toHaveBeenCalledWith({ name: 'John Doe' });
});
```

### Testing Loading States

```typescript
it('should show loading spinner', () => {
  renderWithProviders(<MyComponent />, {
    authValue: { ...mockAuth, loading: true }
  });
  
  expect(screen.getByRole('status')).toBeInTheDocument();
});
```

### Testing Error States

```typescript
it('should display error message', async () => {
  // Mock failed API call
  server.use(
    http.get('/api/tasks', () => {
      return HttpResponse.error();
    })
  );
  
  renderWithProviders(<TaskList />);
  
  expect(await screen.findByText(/error loading tasks/i)).toBeInTheDocument();
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Getting Help

- Check existing tests for patterns
- Review this guide for best practices
- Ask in team chat for testing questions
- Pair program on complex test scenarios
