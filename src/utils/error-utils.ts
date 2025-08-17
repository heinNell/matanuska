/**
 * Robust Error Type Guards and Serializers
 *
 * This module provides enhanced error handling utilities with:
 * - Comprehensive type guards for different error types
 * - Safe serialization of complex error objects
 * - Normalization of various error formats into a structured format
 * - Prevention of "Object" logs by proper error serialization
 */

export type AppError = {
  name: string;
  message: string;
  stack?: string;
  code?: string | number;
  status?: number;
  cause?: unknown;
  original: unknown;
};

/**
 * Type guard for standard Error instances
 */
export const isErrorInstance = (e: unknown): e is Error =>
  !!e && typeof e === "object" && "name" in e && "message" in e;

/**
 * Type guard for Firebase errors
 */
export const isFirebaseError = (
  e: unknown
): e is { code: string; message: string; stack?: string } =>
  !!e &&
  typeof e === "object" &&
  "code" in e &&
  typeof (e as any).code === "string" &&
  "message" in e;

/**
 * Type guard for Axios errors
 */
export const isAxiosError = (e: any): boolean =>
  !!e && typeof e === "object" && e.isAxiosError === true;

/**
 * Type guard for DOMException (common in web APIs)
 */
export const isDOMException = (e: unknown): e is DOMException =>
  !!e &&
  typeof e === "object" &&
  "name" in e &&
  "code" in e &&
  typeof (e as any).name === "string" &&
  typeof (e as any).code === "number";

/**
 * Type guard for Google Maps API errors
 */
export const isGoogleMapsError = (e: unknown): e is { message: string; name?: string } =>
  !!e &&
  typeof e === "object" &&
  "message" in e &&
  typeof (e as any).message === "string" &&
  ((e as any).message.includes("google") || (e as any).message.includes("maps"));

/**
 * Type guard for network/fetch errors
 */
export const isNetworkError = (e: unknown): boolean => {
  if (!e || typeof e !== "object") return false;

  const error = e as any;
  return (
    (error.name === "TypeError" && error.message.includes("fetch")) ||
    error.name === "NetworkError" ||
    error.message?.includes("network") ||
    error.message?.includes("connection") ||
    error.message?.includes("offline")
  );
};

/**
 * Safe JSON stringifier that handles circular references and Error objects
 */
export function safeStringify(value: unknown): string {
  const seen = new WeakSet();

  return JSON.stringify(
    value,
    function (_k, v) {
      // Handle circular references
      if (typeof v === "object" && v !== null) {
        if (seen.has(v)) return "[Circular]";
        seen.add(v);
      }

      // Handle Error objects
      if (v instanceof Error) {
        return {
          name: v.name,
          message: v.message,
          stack: v.stack,
          ...((v as any).code ? { code: (v as any).code } : {}),
          ...((v as any).status ? { status: (v as any).status } : {}),
        };
      }

      // Handle DOMException
      if (isDOMException(v)) {
        return {
          name: v.name,
          message: v.message,
          code: v.code,
          stack: (v as any).stack,
        };
      }

      // Handle functions (convert to string representation)
      if (typeof v === "function") {
        return `[Function: ${v.name || "anonymous"}]`;
      }

      // Handle undefined
      if (v === undefined) {
        return "[undefined]";
      }

      // Handle symbols
      if (typeof v === "symbol") {
        return v.toString();
      }

      return v;
    },
    2
  );
}

/**
 * Normalize any thrown value into a structured AppError format
 */
export function normalizeError(e: unknown): AppError {
  // Firebase errors
  if (isFirebaseError(e)) {
    return {
      name: "FirebaseError",
      message: e.message,
      stack: e.stack,
      code: e.code,
      original: e,
    };
  }

  // Axios errors
  if (isAxiosError(e)) {
    const axiosError = e as any;
    const status = axiosError.response?.status;
    return {
      name: axiosError.name ?? "AxiosError",
      message: axiosError.message ?? "Network request failed",
      stack: axiosError.stack,
      status,
      code: axiosError.code,
      original: {
        data: axiosError.response?.data,
        headers: axiosError.response?.headers,
        config: {
          url: axiosError.config?.url,
          method: axiosError.config?.method,
          timeout: axiosError.config?.timeout,
        },
      },
    };
  }

  // Google Maps API errors
  if (isGoogleMapsError(e)) {
    return {
      name: (e as any).name || "GoogleMapsError",
      message: e.message,
      stack: (e as any).stack,
      code: (e as any).code,
      original: e,
    };
  }

  // DOM exceptions
  if (isDOMException(e)) {
    return {
      name: e.name,
      message: e.message,
      stack: (e as any).stack,
      code: e.code,
      original: e,
    };
  }

  // Network errors
  if (isNetworkError(e)) {
    const error = e as any;
    return {
      name: error.name || "NetworkError",
      message: error.message || "Network operation failed",
      stack: error.stack,
      code: error.code,
      original: e,
    };
  }

  // Standard Error instances
  if (isErrorInstance(e)) {
    const code = (e as any).code;
    const status = (e as any).status;
    return {
      name: e.name,
      message: e.message,
      stack: e.stack,
      code,
      status,
      original: e,
    };
  }

  // Promise rejection with object
  if (e && typeof e === "object" && "reason" in e) {
    return normalizeError((e as any).reason);
  }

  // Plain objects with error-like properties
  if (e && typeof e === "object") {
    const obj = e as any;
    return {
      name: obj.name || obj.type || "ObjectError",
      message: obj.message || obj.error || obj.description || "Unknown object error",
      stack: obj.stack,
      code: obj.code || obj.errorCode || obj.status,
      status: obj.status || obj.statusCode,
      original: e,
    };
  }

  // String errors
  if (typeof e === "string") {
    return {
      name: "StringError",
      message: e,
      original: e,
    };
  }

  // Number errors (rare but possible)
  if (typeof e === "number") {
    return {
      name: "NumberError",
      message: `Error code: ${e}`,
      code: e,
      original: e,
    };
  }

  // Everything else (null, undefined, boolean, etc.)
  return {
    name: "NonErrorThrown",
    message:
      e === null
        ? "null was thrown"
        : e === undefined
        ? "undefined was thrown"
        : `A ${typeof e} was thrown: ${String(e)}`,
    original: e,
  };
}

/**
 * Enhanced error context extraction
 */
export function extractErrorContext(e: unknown): Record<string, any> {
  const normalized = normalizeError(e);

  return {
    errorType: normalized.name,
    hasStack: !!normalized.stack,
    hasCode: !!normalized.code,
    hasStatus: !!normalized.status,
    originalType: typeof e,
    isError: isErrorInstance(e),
    isFirebase: isFirebaseError(e),
    isAxios: isAxiosError(e),
    isNetwork: isNetworkError(e),
    isGoogleMaps: isGoogleMapsError(e),
    isDOMException: isDOMException(e),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a hash of an error for deduplication
 */
export function createErrorHash(e: unknown): string {
  const normalized = normalizeError(e);
  const hashInput = `${normalized.name}:${normalized.message}:${normalized.code || ""}`;

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return hash.toString(36);
}

/**
 * Safe error logger that prevents infinite loops and provides detailed context
 */
export function safeLogError(e: unknown, context?: Record<string, any>): void {
  try {
    const normalized = normalizeError(e);
    const errorContext = extractErrorContext(e);
    const hash = createErrorHash(e);

    console.groupCollapsed(
      `[AppError] ${normalized.name}${normalized.code ? ` (${normalized.code})` : ""}: ${normalized.message}`
    );

    if (normalized.stack) {
      console.log("📍 Stack:", normalized.stack);
    }

    if (normalized.status) {
      console.log("🔢 Status:", normalized.status);
    }

    if (context) {
      console.log("🔍 Context:", context);
    }

    console.log("📊 Error Context:", errorContext);
    console.log("🔑 Hash:", hash);
    console.log("📦 Original:", normalized.original);
    console.log("🛠️ Serialized:", safeStringify(normalized.original));

    console.groupEnd();
  } catch (logError) {
    console.error("Error in safeLogError:", logError);
    console.error("Original error:", e);
  }
}

/**
 * Wrapper for async operations with enhanced error handling
 * Prevents fire-and-forget async operations
 */
export function safeAsync<T>(asyncFn: () => Promise<T>, context?: Record<string, any>): Promise<T> {
  return asyncFn().catch((error) => {
    safeLogError(error, {
      ...context,
      asyncWrapper: true,
      timestamp: new Date().toISOString(),
    });
    // FIX: Universal "cause" assignment for compatibility
    const err = new Error(`Async operation failed: ${normalizeError(error).message}`);
    (err as any).cause = error;
    throw err;
  });
}

/**
 * Wrapper for async entry points (event handlers, effects, etc.)
 * Catches errors and logs them without re-throwing
 */
export function safeAsyncEntry<T>(
  asyncFn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T | null> {
  return asyncFn().catch((error) => {
    safeLogError(error, {
      ...context,
      entryPoint: true,
      timestamp: new Date().toISOString(),
    });
    return null;
  });
}

/**
 * Higher-order function to wrap async functions with error handling
 */
export function withErrorHandling<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  context?: Record<string, any>
) {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      return await fn(...args);
    } catch (error) {
      const normalized = normalizeError(error);
      safeLogError(error, {
        ...context,
        functionName: fn.name,
        arguments: args,
        timestamp: new Date().toISOString(),
      });
      // FIX: Universal "cause" assignment for compatibility
      const err = new Error(`${fn.name || "Anonymous function"} failed: ${normalized.message}`);
      (err as any).cause = error;
      throw err;
    }
  };
}

/**
 * Debounced error reporter to prevent spam
 */
const errorReportingTimeouts = new Map<string, NodeJS.Timeout>();

export function debouncedErrorReport(
  error: unknown,
  context?: Record<string, any>,
  delay: number = 1000
): void {
  const hash = createErrorHash(error);

  // Clear existing timeout for this error
  const existingTimeout = errorReportingTimeouts.get(hash);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  // Set new timeout
  const timeout = setTimeout(() => {
    safeLogError(error, context);
    errorReportingTimeouts.delete(hash);
  }, delay);

  errorReportingTimeouts.set(hash, timeout);
}

/**
 * Guardrails for common error patterns
 */
export const ErrorGuardrails = {
  /**
   * Never throw plain objects - always throw Error instances
   */
  throwError(message: string, options?: { cause?: unknown; code?: string }): never {
    const error = new Error(message);
    if (options?.cause) {
      (error as any).cause = options.cause;
    }
    if (options?.code) {
      (error as any).code = options.code;
    }
    throw error;
  },

  /**
   * Safely rethrow with additional context
   */
  rethrowWithContext(error: unknown, context: string): never {
    const normalized = normalizeError(error);
    const err = new Error(`${context}: ${normalized.message}`);
    (err as any).cause = error;
    throw err;
  },

  /**
   * Assert that a value is not null/undefined
   */
  assertExists<T>(value: T | null | undefined, message: string): T {
    if (value == null) {
      this.throwError(message);
    }
    return value as T;
  },
};
