/**
 * Enhanced Error Handling Best Practices and Examples
 *
 * This file demonstrates the proper usage of the enhanced error handling system
 * with real-world examples and best practices.
 */

import React from "react";
import {
  ErrorGuardrails,
  safeAsync,
  safeAsyncEntry,
  safeLogError,
  withErrorHandling,
} from "./error-utils";

/**
 * Example: Async operation with proper error handling
 */
export const fetchUserData = withErrorHandling(
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      // Always throw Error instances, not plain objects
      ErrorGuardrails.throwError(`Failed to fetch user: ${response.statusText}`, {
        code: response.status.toString(),
      });
    }
    return response.json();
  },
  { operation: "fetchUserData" }
);

/**
 * Example: Firebase operation with enhanced error handling
 */
export const saveToFirestore = async (collection: string, data: any) => {
  return safeAsync(
    async () => {
      // Your Firestore save logic here
      const docRef = await fetch(`/api/firestore/${collection}`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!docRef.ok) {
        // Rethrow with context instead of creating new error
        const error = await docRef.text();
        ErrorGuardrails.rethrowWithContext(error, `Firestore save to ${collection}`);
      }

      return docRef.json();
    },
    {
      collection,
      operation: "saveToFirestore",
      dataKeys: Object.keys(data),
    }
  );
};

/**
 * Example: Event handler with safe async entry
 */
export const handleButtonClick = (userId: string) => {
  // Use safeAsyncEntry for event handlers to prevent unhandled promise rejections
  safeAsyncEntry(
    async () => {
      const userData = await fetchUserData(userId);
      await saveToFirestore("users", userData);
      console.log("User data saved successfully");
    },
    {
      eventType: "buttonClick",
      userId,
    }
  );
};

/**
 * Example: Google Maps API operation with comprehensive error handling
 */
export const geocodeAddress = async (address: string): Promise<google.maps.LatLng | null> => {
  return safeAsync(
    async () => {
      // Assert Maps API is available
      ErrorGuardrails.assertExists(
        window.google?.maps?.Geocoder,
        "Google Maps Geocoder not available"
      );

      const geocoder = new google.maps.Geocoder();

      return new Promise<google.maps.LatLng | null>((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            resolve(results[0].geometry.location);
          } else {
            // Provide detailed error context
            ErrorGuardrails.throwError(`Geocoding failed: ${status}`, {
              code: status,
              cause: { address, status, resultsLength: results?.length || 0 },
            });
          }
        });
      });
    },
    {
      operation: "geocodeAddress",
      address,
      api: "GoogleMaps",
    }
  );
};

/**
 * Example: React useEffect with proper error handling
 */
export const useDataFetching = (userId: string | undefined) => {
  React.useEffect(() => {
    if (!userId) return;

    // Wrap async operations in effects
    safeAsyncEntry(
      async () => {
        const data = await fetchUserData(userId);
        // Process data...
      },
      {
        hook: "useEffect",
        operation: "dataFetching",
        userId,
      }
    );
  }, [userId]);
};

/**
 * Example: Form submission with validation and error handling
 */
export const submitForm = async (formData: Record<string, any>) => {
  try {
    // Input validation
    if (!formData.email) {
      ErrorGuardrails.throwError("Email is required", { code: "VALIDATION_ERROR" });
    }

    // API call with error handling
    const result = await safeAsync(
      async () => {
        const response = await fetch("/api/submit-form", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.text();
          ErrorGuardrails.throwError(`Form submission failed: ${response.statusText}`, {
            code: response.status.toString(),
            cause: errorData,
          });
        }

        return response.json();
      },
      {
        operation: "submitForm",
        formFields: Object.keys(formData),
      }
    );

    return result;
  } catch (error) {
    // Log with context but still throw for caller to handle
    safeLogError(error, {
      operation: "submitForm",
      formData: formData, // This will be safely serialized
    });
    throw error;
  }
};

/**
 * Example: Database operation with retry and enhanced logging
 */
export const updateUserProfile = async (userId: string, updates: any) => {
  return withErrorHandling(
    async () => {
      // First, fetch current user to validate
      const currentUser = await fetchUserData(userId);
      ErrorGuardrails.assertExists(currentUser, `User ${userId} not found`);

      // Merge updates with current data
      const updatedData = { ...currentUser, ...updates, updatedAt: new Date().toISOString() };

      // Save with error handling
      const result = await saveToFirestore("users", updatedData);

      return result;
    },
    {
      operation: "updateUserProfile",
      userId,
      updateKeys: Object.keys(updates),
    }
  )();
};

/**
 * Example: Demonstrating error boundary integration
 */
export const triggerErrorBoundary = () => {
  // This will be caught by the ErrorBoundary and properly logged
  throw new Error("Intentional error to test boundary", {
    cause: { intentional: true, testCase: "errorBoundary" },
  } as any);
};

/**
 * Best Practices Summary:
 *
 * 1. Always throw Error instances, not plain objects
 * 2. Use safeAsync for promise-based operations
 * 3. Use safeAsyncEntry for event handlers and effects
 * 4. Use withErrorHandling for reusable functions
 * 5. Use ErrorGuardrails.assertExists for null checks
 * 6. Use ErrorGuardrails.rethrowWithContext when re-throwing
 * 7. Provide meaningful context in error handling wrappers
 * 8. Log errors with safeLogError for structured debugging
 * 9. Never fire-and-forget async operations
 * 10. Use Error Boundaries for render-time errors
 */

// Re-export commonly used utilities for convenience
export {
  ErrorGuardrails,
  normalizeError,
  safeAsync,
  safeAsyncEntry,
  safeLogError,
  withErrorHandling,
} from "./error-utils";
