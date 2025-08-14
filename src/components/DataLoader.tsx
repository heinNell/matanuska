import React from 'react';
import { Loader2, AlertOctagon, RefreshCw } from 'lucide-react';
import useErrorHandling from '../hooks/useErrorHandling';
import { ErrorCategory } from '../utils/errorHandling';

interface DataLoaderProps<T> {
  loadData: () => Promise<T>;
  children: (data: T) => React.ReactNode;
  loadingFallback?: React.ReactNode;
  errorFallback?: (error: any, retry: () => void) => React.ReactNode;
  emptyFallback?: React.ReactNode;
  isEmpty?: (data: T) => boolean;
  deps?: any[];
}

/**
 * A component for handling async data loading with error states and retry capabilities
 */
function DataLoader<T>({
  loadData,
  children,
  loadingFallback,
  errorFallback,
  emptyFallback,
  isEmpty = (data: T) => {
    if (Array.isArray(data)) return data.length === 0;
    if (data === null || data === undefined) return true;
    if (typeof data === 'object') return Object.keys(data).length === 0;
    return false;
  },
  deps = []
}: DataLoaderProps<T>) {
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const { error, executeWithErrorHandling, clearError } = useErrorHandling({
    category: ErrorCategory.API,
    showUserErrors: true
  });

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    
    const result = await executeWithErrorHandling(
      async () => await loadData(),
      { maxRetries: 2 }
    );
    
    if (result !== null) {
      setData(result);
    }
    
    setIsLoading(false);
  }, [loadData, executeWithErrorHandling]);

  React.useEffect(() => {
    fetchData();
  }, [...deps, fetchData]);

  const handleRetry = () => {
    clearError();
    fetchData();
  };

  // Default loading state
  const defaultLoadingFallback = (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
    </div>
  );

  // Default error state
  const defaultErrorFallback = (err: any, retry: () => void) => (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
      <AlertOctagon className="h-8 w-8 text-red-500 mx-auto mb-2" />
      <h3 className="text-lg font-medium text-red-800">Unable to load data</h3>
      <p className="text-sm text-red-700 mb-4">
        {err?.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={retry}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </button>
    </div>
  );

  // Default empty state
  const defaultEmptyFallback = (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
      <p className="text-gray-600">No data available</p>
    </div>
  );

  if (isLoading) {
    return <>{loadingFallback || defaultLoadingFallback}</>;
  }

  if (error.hasError) {
    return <>{errorFallback ? errorFallback(error, handleRetry) : defaultErrorFallback(error, handleRetry)}</>;
  }

  if (data !== null && isEmpty(data)) {
    return <>{emptyFallback || defaultEmptyFallback}</>;
  }

  return <>{data !== null && children(data)}</>;
}

export default DataLoader;
