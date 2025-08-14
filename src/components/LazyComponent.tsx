import React, { Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { Loader2 } from 'lucide-react';

interface LazyComponentProps {
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  props?: any;
}

/**
 * A wrapper for React.lazy components with built-in error handling and loading states
 */
const LazyComponent: React.FC<LazyComponentProps> = ({
  component: Component,
  fallback,
  errorFallback,
  onError,
  props = {}
}) => {
  // Default loading fallback
  const defaultFallback = (
    <div className="flex justify-center items-center p-8 min-h-[200px]">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <ErrorBoundary fallback={errorFallback} onError={onError}>
      <Suspense fallback={fallback || defaultFallback}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

/**
 * Create a lazily loaded component with error handling
 * 
 * @param importFn Function that returns the import promise
 * @param options Configuration options
 * @returns A LazyComponent that handles loading and errors
 */
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    fallback?: React.ReactNode;
    errorFallback?: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  } = {}
) => {
  const LazyComponentInstance = React.lazy(importFn);
  
  return (props: React.ComponentProps<T>) => (
    <LazyComponent
      component={LazyComponentInstance}
      fallback={options.fallback}
      errorFallback={options.errorFallback}
      onError={options.onError}
      props={props}
    />
  );
};

export default LazyComponent;
