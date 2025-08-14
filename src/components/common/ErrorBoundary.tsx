import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Route render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-sm rounded bg-red-50 text-red-700 border border-red-200">
          <p className="font-semibold mb-1">Something went wrong.</p>
          <p className="mb-2">{this.state.error?.message}</p>
          <button
            className="px-2 py-1 text-xs bg-red-600 text-white rounded"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
