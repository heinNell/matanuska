import { useState, useCallback } from 'react';
import { 
  handleError, 
  logError, 
  ErrorCategory, 
  ErrorSeverity, 
  AppError 
} from '../utils/errorHandling';

interface UseErrorHandlingOptions {
  context?: Record<string, any>;
  category?: ErrorCategory;
  maxRetries?: number;
  retryDelay?: number;
  showUserErrors?: boolean; // Whether to expose errors to the user
}

interface ErrorState {
  hasError: boolean;
  message: string | null;
  details: string | null;
  severity: ErrorSeverity | null;
  timestamp: Date | null;
}

/**
 * A hook for handling errors in React components
 * 
 * @param options Configuration options
 * @returns Error handling utilities and error state
 */
const useErrorHandling = (options: UseErrorHandlingOptions = {}) => {
  const [error, setError] = useState<ErrorState>({
    hasError: false,
    message: null,
    details: null,
    severity: null,
    timestamp: null
  });
  
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Reset the error state
   */
  const clearError = useCallback(() => {
    setError({
      hasError: false,
      message: null,
      details: null,
      severity: null,
      timestamp: null
    });
  }, []);

  /**
   * Set an error in the state
   */
  const setErrorState = useCallback((appError: AppError) => {
    if (options.showUserErrors !== false) {
      setError({
        hasError: true,
        message: appError.message,
        details: appError.originalError.stack || null,
        severity: appError.severity,
        timestamp: appError.timestamp
      });
    }
  }, [options.showUserErrors]);

  /**
   * Execute an async operation with error handling
   */
  const executeWithErrorHandling = useCallback(
    async <T>(
      operation: () => Promise<T>,
      operationOptions: Omit<UseErrorHandlingOptions, 'showUserErrors'> = {}
    ): Promise<T | null> => {
      clearError();
      setIsProcessing(true);
      
      try {
        // Merge options
        const mergedOptions = {
          ...options,
          ...operationOptions,
          onError: setErrorState
        };
        
        // Execute with retry capability
        return await handleError(operation, mergedOptions);
      } catch (error) {
        // Error has already been logged by handleError
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [options, setErrorState, clearError]
  );

  /**
   * Handle an error directly
   */
  const handleErrorDirectly = useCallback(
    (errorOrMessage: Error | string, errorOptions: Partial<UseErrorHandlingOptions> = {}) => {
      const appError = logError(errorOrMessage, {
        ...options,
        ...errorOptions
      });
      
      setErrorState(appError);
      return appError;
    },
    [options, setErrorState]
  );

  return {
    error,
    isProcessing,
    clearError,
    executeWithErrorHandling,
    handleErrorDirectly
  };
};

export default useErrorHandling;
