import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export const PageErrorFallback = ({ error, resetError }: ErrorFallbackProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          We're having trouble loading this page. The issue has been reported to our team.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={resetError} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 text-xs bg-muted p-4 rounded-lg overflow-auto max-h-64">
              {error.stack}
            </pre>
          </details>
        )}
      </Card>
    </div>
  );
};

export const WidgetErrorFallback = ({ error, resetError }: ErrorFallbackProps) => (
  <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
    <div className="flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-destructive">Widget failed to load</p>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {error.message || 'An unexpected error occurred'}
        </p>
        <Button
          size="sm"
          variant="link"
          onClick={resetError}
          className="p-0 h-auto mt-2 text-primary"
        >
          Retry
        </Button>
      </div>
    </div>
  </div>
);

export const SectionErrorFallback = ({ error, resetError }: ErrorFallbackProps) => (
  <div className="p-6 border border-destructive/50 rounded-lg bg-destructive/10">
    <div className="flex items-start gap-3">
      <AlertCircle className="h-6 w-6 text-destructive mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <h3 className="font-semibold text-destructive mb-1">
          This section failed to load
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          {error.message || 'An unexpected error occurred'}
        </p>
        <Button size="sm" onClick={resetError}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reload Section
        </Button>
      </div>
    </div>
  </div>
);
