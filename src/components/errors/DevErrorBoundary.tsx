/**
 * Development Error Boundary
 * Shows detailed error information in development mode
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class DevErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DevErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Development Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                An error occurred while rendering this component. This detailed error is only shown in development mode.
              </div>

              {this.state.error && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Error Message:</h4>
                  <pre className="bg-red-50 text-red-900 p-3 rounded text-xs overflow-auto">
                    {this.state.error.message}
                  </pre>
                </div>
              )}

              {this.props.showDetails && this.state.error?.stack && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Stack Trace:</h4>
                  <pre className="bg-gray-50 text-gray-900 p-3 rounded text-xs overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}

              {this.props.showDetails && this.state.errorInfo?.componentStack && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Component Stack:</h4>
                  <pre className="bg-blue-50 text-blue-900 p-3 rounded text-xs overflow-auto max-h-40">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={this.handleReset} size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DevErrorBoundary;