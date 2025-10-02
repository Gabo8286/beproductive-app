# Error Handling System

## Overview

This application includes a comprehensive error handling system with error boundaries, contextual fallbacks, API error handling, and recovery strategies.

## Components

### Error Boundaries

Error boundaries catch JavaScript errors anywhere in the component tree and display fallback UI.

#### Usage

```tsx
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { PageErrorFallback } from '@/components/errors/ErrorFallbacks';

// Wrap your component
<ErrorBoundary fallback={PageErrorFallback} level="page">
  <YourComponent />
</ErrorBoundary>
```

#### Levels

- `page`: Page-level errors (full screen fallback)
- `section`: Section-level errors (partial page fallback)
- `component`: Component-level errors (inline fallback)

### Error Fallbacks

Pre-built fallback components for different scenarios:

- `PageErrorFallback`: Full-page error display
- `SectionErrorFallback`: Section error with reload option
- `WidgetErrorFallback`: Compact widget error display

## API Error Handling

### ApiError Class

```tsx
import { ApiError, handleApiError, getErrorMessage } from '@/utils/errors/apiErrors';

try {
  const response = await fetch('/api/data');
  if (!response.ok) {
    throw new Error('API request failed');
  }
} catch (error) {
  const apiError = handleApiError(error);
  console.error(getErrorMessage(apiError));
}
```

### Error Codes

- `AUTH_EXPIRED`: Session expired
- `PERMISSION_DENIED`: Insufficient permissions
- `RATE_LIMITED`: Too many requests
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `NETWORK_ERROR`: Connection problem
- `SERVER_ERROR`: Server error

## Form Error Handling

```tsx
import { useFormError } from '@/hooks/useFormError';

const MyForm = () => {
  const form = useForm();
  const { handleFormError } = useFormError();

  const onSubmit = async (data) => {
    try {
      await submitData(data);
    } catch (error) {
      handleFormError(error, form);
    }
  };
};
```

## Offline Detection

```tsx
import { useOfflineDetection } from '@/hooks/useOfflineDetection';

const MyComponent = () => {
  const { isOffline } = useOfflineDetection();

  return (
    <div>
      {isOffline && <div>You are offline</div>}
    </div>
  );
};
```

## Error Recovery

### Retry with Exponential Backoff

```tsx
import { withRetry } from '@/utils/errors/recovery';

const fetchData = async () => {
  return await withRetry(
    () => fetch('/api/data').then(r => r.json()),
    {
      maxAttempts: 3,
      delay: 1000,
      backoff: true,
      onRetry: (attempt, error) => {
        console.log(`Retry attempt ${attempt}:`, error);
      }
    }
  );
};
```

### Optimistic Updates

```tsx
import { optimisticUpdate } from '@/utils/errors/recovery';

const updateItem = async (newData) => {
  await optimisticUpdate({
    optimisticData: newData,
    update: () => api.updateItem(newData),
    rollback: () => setData(originalData),
    onError: (error) => toast.error('Update failed')
  });
};
```

## Error Logging

```tsx
import { logger } from '@/utils/errors/logger';

// Log levels
logger.debug('Debug message', { component: 'MyComponent' });
logger.info('Info message');
logger.warn('Warning message', error);
logger.error('Error message', error, { userId: '123' });
logger.fatal('Fatal error', error);
```

## Error Reporting

```tsx
import { ErrorReportDialog } from '@/components/errors/ErrorReportDialog';

const [showErrorReport, setShowErrorReport] = useState(false);

<ErrorReportDialog
  error={error}
  open={showErrorReport}
  onOpenChange={setShowErrorReport}
/>
```

## Best Practices

1. **Always wrap async operations with try-catch**
2. **Use error boundaries for component errors**
3. **Provide user-friendly error messages**
4. **Log errors for debugging**
5. **Implement retry logic for transient failures**
6. **Show loading states during recovery**
7. **Test error scenarios**

## Testing Errors

```tsx
// Trigger an error boundary
const BuggyComponent = () => {
  throw new Error('Test error');
};

// Test API errors
const response = await fetch('/api/test-error');
```

## Production Considerations

- Error reports are sent to `/api/errors/report`
- Logs are sent to `/api/errors/log` in production
- Sensitive data is never logged
- Stack traces are only shown in development
- Error boundaries prevent full app crashes

## Monitoring

In production, errors are:
- Logged to the backend
- Tracked with timestamps and context
- Analyzed for patterns
- Used to improve reliability
