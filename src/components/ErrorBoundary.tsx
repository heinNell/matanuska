import { AlertCircle, ArrowLeft, ChevronDown, ChevronUp, Home, RefreshCw } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { normalizeError, safeLogError } from "../utils/error-utils";
import { ErrorCategory, ErrorSeverity, logError } from "../utils/errorHandling";

interface ErrorBoundaryProps extends React.PropsWithChildren<{}> {
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  renderFallback?: (props: { error: Error; resetErrorBoundary: () => void }) => React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Use enhanced error logging with detailed context
    safeLogError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      timestamp: new Date().toISOString(),
    });

    // Also log to existing system for compatibility
    logError(error, {
      category: ErrorCategory.RENDERING,
      severity: ErrorSeverity.ERROR,
      context: {
        componentStack: errorInfo.componentStack,
        normalized: normalizeError(error),
      },
    });

    this.setState({
      errorInfo: errorInfo,
    });

    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset the error boundary when specified props change
    if (this.state.hasError && this.props.resetOnPropsChange && this.props !== prevProps) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  toggleDetails = () => {
    this.setState((prevState) => ({
      showDetails: !prevState.showDetails,
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom render function if provided
      if (this.props.renderFallback) {
        return this.props.renderFallback({
          error: this.state.error!,
          resetErrorBoundary: this.resetErrorBoundary,
        });
      }

      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
          <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>

            <p className="text-gray-600 mb-6">
              {this.state.error?.message ?? "An unexpected error occurred"}
            </p>

            <div className="flex flex-col space-y-3">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </button>

              <Link
                to="/"
                className="flex items-center justify-center px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                onClick={this.resetErrorBoundary}
              >
                <Home className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Link>

              <button
                onClick={() => window.history.back()}
                className="flex items-center justify-center px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </button>

              {this.state.errorInfo && (
                <button
                  onClick={this.toggleDetails}
                  className="flex items-center justify-center px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition mt-2"
                >
                  {this.state.showDetails ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide Technical Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show Technical Details
                    </>
                  )}
                </button>
              )}
            </div>

            {this.state.showDetails && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Error Details:</p>
                <div className="bg-gray-100 p-4 rounded overflow-auto max-h-64 text-left">
                  <p className="text-red-700 font-mono text-sm mb-2">
                    {this.state.error?.toString()}
                  </p>
                  <p className="text-gray-700 font-mono text-xs whitespace-pre-wrap">
                    {this.state.errorInfo?.componentStack}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with an error boundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<ErrorBoundaryProps, "children"> = {}
): React.FC<P> => {
  const WrappedComponent = (props: P) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  // Set display name for better debugging
  const displayName = Component.displayName || Component.name || "Component";
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;

  return WrappedComponent;
};

export default ErrorBoundary;
