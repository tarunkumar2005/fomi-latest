"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw, Home, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  resetKeys?: Array<string | number>;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showErrorDetails: boolean;
  errorCount: number;
}

/**
 * ErrorBoundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 * 
 * Usage:
 * <ErrorBoundary componentName="FormCanvas">
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showErrorDetails: false,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console (in production, you'd send this to an error reporting service)
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Update state with error details
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, send to error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to error tracking service
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state if resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const prevKeys = prevProps.resetKeys || [];
      const currentKeys = this.props.resetKeys || [];

      const hasChanged = currentKeys.some(
        (key, index) => key !== prevKeys[index]
      );

      if (hasChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showErrorDetails: false,
    });
  };

  toggleErrorDetails = () => {
    this.setState((prevState) => ({
      showErrorDetails: !prevState.showErrorDetails,
    }));
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      const { error, errorInfo, showErrorDetails, errorCount } = this.state;
      const { componentName, showDetails = true } = this.props;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-background">
          <div className="max-w-2xl w-full space-y-6">
            {/* Error Alert */}
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="ml-2">
                <div className="space-y-2">
                  <p className="font-semibold text-base">
                    {componentName
                      ? `Something went wrong in ${componentName}`
                      : "Something went wrong"}
                  </p>
                  <p className="text-sm text-destructive/90">
                    {error?.message || "An unexpected error occurred"}
                  </p>
                  {errorCount > 1 && (
                    <p className="text-xs text-destructive/70">
                      This error has occurred {errorCount} times
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={this.resetErrorBoundary}
                className="flex-1"
                size="lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = "/dashboard"}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>

            {/* Error Details (Developer Mode) */}
            {showDetails && (error || errorInfo) && (
              <div className="rounded-lg border border-border bg-card">
                <button
                  onClick={this.toggleErrorDetails}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-t-lg"
                >
                  <span className="text-sm font-medium text-muted-foreground">
                    Error Details (for developers)
                  </span>
                  {showErrorDetails ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {showErrorDetails && (
                  <div className="px-4 py-3 border-t border-border space-y-4">
                    {error && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                          Error Message:
                        </h4>
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                          {error.toString()}
                        </pre>
                      </div>
                    )}

                    {error?.stack && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                          Stack Trace:
                        </h4>
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-64 overflow-y-auto">
                          {error.stack}
                        </pre>
                      </div>
                    )}

                    {errorInfo?.componentStack && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                          Component Stack:
                        </h4>
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-64 overflow-y-auto">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Help Text */}
            <div className="text-center text-sm text-muted-foreground">
              <p>
                If this problem persists, please{" "}
                <a
                  href="mailto:support@example.com"
                  className="text-primary hover:underline"
                >
                  contact support
                </a>{" "}
                or try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
