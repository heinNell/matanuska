/**
 * Centralized Error Handling and Reporting Utility
 *
 * This utility provides a structured approach to handling, logging, and reporting errors
 * throughout the application. It includes categorization, severity assessment,
 * automatic retry mechanisms, and integration with monitoring systems.
 */

import { getNetworkState } from "./networkDetection";

// Error types for categorization
export enum ErrorCategory {
  NETWORK = "network",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  DATA_VALIDATION = "data_validation",
  API = "api",
  DATABASE = "database",
  RENDERING = "rendering",
  UNKNOWN = "unknown",
}

// Error severity levels
export enum ErrorSeverity {
  FATAL = "fatal", // Application cannot continue, requires immediate attention
  ERROR = "error", // Serious issue that impacts functionality but doesn't crash the app
  WARNING = "warning", // Issue that may lead to problems but doesn't affect current operation
  INFO = "info", // Informational message about an error that was handled gracefully
}

// Structured error object
export interface AppError {
  originalError: Error;
  message: string;
  code?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: Date;
  context?: Record<string, any>;
  handled: boolean;
  retryAttempts?: number;
  retryable: boolean;
  userId?: string;
  sessionId?: string;
}

// For storing global error handlers
let globalErrorHandlers: ((error: AppError) => void)[] = [];

// For tracking logged errors to prevent duplication
const loggedErrors = new Set<string>();

/**
 * Create a structured error object from any error or message
 */
export const createAppError = (
  originalError: Error | string,
  options: Partial<Omit<AppError, "originalError" | "timestamp" | "handled">> = {}
): AppError => {
  const error = typeof originalError === "string" ? new Error(originalError) : originalError;

  // Determine error category based on error message or type
  let category = options.category || ErrorCategory.UNKNOWN;

  if (!options.category) {
    const errorMsg = error.message.toLowerCase();

    if (
      error.name === "NetworkError" ||
      errorMsg.includes("network") ||
      errorMsg.includes("offline") ||
      errorMsg.includes("connection")
    ) {
      category = ErrorCategory.NETWORK;
    } else if (
      errorMsg.includes("permission") ||
      errorMsg.includes("access") ||
      errorMsg.includes("not allowed")
    ) {
      category = ErrorCategory.AUTHORIZATION;
    } else if (
      errorMsg.includes("auth") ||
      errorMsg.includes("login") ||
      errorMsg.includes("token")
    ) {
      category = ErrorCategory.AUTHENTICATION;
    } else if (errorMsg.includes("validation") || errorMsg.includes("invalid")) {
      category = ErrorCategory.DATA_VALIDATION;
    } else if (errorMsg.includes("api") || errorMsg.includes("endpoint")) {
      category = ErrorCategory.API;
    } else if (
      errorMsg.includes("database") ||
      errorMsg.includes("firestore") ||
      errorMsg.includes("query")
    ) {
      category = ErrorCategory.DATABASE;
    } else if (errorMsg.includes("render") || errorMsg.includes("component")) {
      category = ErrorCategory.RENDERING;
    }
  }

  // Default to medium severity if not specified
  const severity = options.severity || ErrorSeverity.ERROR;

  // Default message is from the original error
  const message = options.message || error.message;

  return {
    originalError: error,
    message,
    code: options.code,
    category,
    severity,
    timestamp: new Date(),
    context: options.context || {},
    handled: false,
    retryAttempts: options.retryAttempts || 0,
    retryable: options.retryable !== undefined ? options.retryable : true,
    userId: options.userId,
    sessionId: options.sessionId,
  };
};

/**
 * Log an error with structured data
 */
export const logError = (
  errorOrMessage: Error | string,
  options: Partial<Omit<AppError, "originalError" | "timestamp" | "handled">> = {}
): AppError => {
  const appError = createAppError(errorOrMessage, options);

  // Create a unique ID for deduplication
  const errorId = `${appError.category}:${appError.message}:${JSON.stringify(appError.context || {})}`;

  // Skip logging if we've seen this exact error recently
  if (loggedErrors.has(errorId)) {
    return appError;
  }

  // Add to the set of logged errors
  loggedErrors.add(errorId);

  // After 1 minute, remove from the set to allow re-logging
  setTimeout(() => {
    loggedErrors.delete(errorId);
  }, 60000);

  // Log to console with appropriate severity
  switch (appError.severity) {
    case ErrorSeverity.FATAL:
      console.error(
        "%c FATAL ERROR ",
        "background: #FF0000; color: white; padding: 2px;",
        appError.message,
        "\n",
        appError
      );
      break;
    case ErrorSeverity.ERROR:
      console.error(
        "%c ERROR ",
        "background: #D32F2F; color: white; padding: 2px;",
        appError.message,
        "\n",
        appError
      );
      break;
    case ErrorSeverity.WARNING:
      console.warn(
        "%c WARNING ",
        "background: #FF9800; color: white; padding: 2px;",
        appError.message,
        "\n",
        appError
      );
      break;
    case ErrorSeverity.INFO:
      console.info(
        "%c INFO ",
        "background: #2196F3; color: white; padding: 2px;",
        appError.message,
        "\n",
        appError
      );
      break;
  }

  // Run any registered global error handlers
  globalErrorHandlers.forEach((handler) => handler(appError));

  return appError;
};

/**
 * Handle an error with potential retry mechanism
 */
export const handleError = async <T>(
  operation: () => Promise<T>,
  options: {
    context?: Record<string, any>;
    category?: ErrorCategory;
    maxRetries?: number;
    retryDelay?: number;
    onError?: (error: AppError) => void;
    retryCondition?: (error: AppError) => boolean;
  } = {}
): Promise<T> => {
  const maxRetries = options.maxRetries || 3;
  const initialRetryDelay = options.retryDelay || 1000;
  let retryAttempts = 0;

  const attemptOperation = async (): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      // Create a structured error
      const appError = createAppError(error as Error, {
        context: options.context,
        category: options.category,
        retryAttempts,
      });

      // Check if we should retry
      const networkState = getNetworkState();
      const isNetworkError = appError.category === ErrorCategory.NETWORK;
      const shouldRetry =
        retryAttempts < maxRetries &&
        appError.retryable &&
        (!isNetworkError || networkState.status === "online") &&
        (options.retryCondition ? options.retryCondition(appError) : true);

      if (shouldRetry) {
        retryAttempts++;

        // Use exponential backoff for retry delay
        const retryDelay = initialRetryDelay * Math.pow(2, retryAttempts - 1);

        logError(error as Error, {
          ...options,
          message: `Operation failed, retry attempt ${retryAttempts} in ${retryDelay}ms`,
          severity: ErrorSeverity.WARNING,
          retryAttempts,
        });

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay));

        return attemptOperation();
      }

      // If we're not retrying, log and handle the error
      appError.handled = true;
      logError(appError.originalError, {
        ...options,
        message: `Operation failed after ${retryAttempts} retry attempts`,
        severity:
          isNetworkError && networkState.status === "offline"
            ? ErrorSeverity.WARNING // Less severe when network is actually offline
            : ErrorSeverity.ERROR,
        retryAttempts,
      });

      // Call the error handler if provided
      if (options.onError) {
        options.onError(appError);
      }

      // Re-throw the original error
      throw error;
    }
  };

  return attemptOperation();
};

/**
 * Register a global error handler
 */
export const registerErrorHandler = (handler: (error: AppError) => void): (() => void) => {
  globalErrorHandlers.push(handler);

  // Return a function to unregister the handler
  return () => {
    globalErrorHandlers = globalErrorHandlers.filter((h) => h !== handler);
  };
};

/**
 * Safely execute a function with error handling
 */
export const safeExecute = <T>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch (error) {
    logError(error as Error, {
      message: "Error in safeExecute",
      severity: ErrorSeverity.WARNING,
    });
    return fallback;
  }
};

/**
 * Generate a stack trace without throwing an error
 */
export const getStackTrace = (): string => {
  try {
    throw new Error("Stack trace");
  } catch (error) {
    return (error as Error).stack?.split("\n").slice(2).join("\n") || "";
  }
};

export default {
  createAppError,
  logError,
  handleError,
  registerErrorHandler,
  safeExecute,
  getStackTrace,
  ErrorCategory,
  ErrorSeverity,
};

