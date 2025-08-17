import { useEffect, useState } from "react";
import { ErrorCategory, ErrorSeverity, logError } from "./errorHandling";
import { checkMapsServiceHealth } from "./mapsService";
import { getNetworkState } from "./networkDetection";

// Define the Google object in window
declare global {
  interface Window {
    google?: {
      maps: any;
    };
    gm_authFailure?: () => void; // Google Maps auth failure handler
  }
}

// Loading state management
let promise: Promise<void> | null = null;
let useDirectApi = false;
let serviceCheckAttempted = false;
let authErrorDetected = false;
let lastErrorMessage: string | null = null;

// Environment configuration
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAPS_SERVICE_URL = import.meta.env.VITE_MAPS_SERVICE_URL;
const CURRENT_DOMAIN = typeof window !== "undefined" ? window.location.hostname : "";

// This flag correctly checks if you have an API key to use as a fallback.
const hasFallbackOption = !!GOOGLE_MAPS_API_KEY;

/**
 * Check if Google Maps API is already loaded
 */
export const isGoogleMapsAPILoaded = (): boolean => {
  return !!(window.google && window.google.maps);
};

/**
 * Set up the auth failure handler for Google Maps
 * This catches the RefererNotAllowedMapError
 */
const setupAuthFailureHandler = (): void => {
  if (typeof window !== "undefined" && !window.gm_authFailure) {
    window.gm_authFailure = () => {
      authErrorDetected = true;
      const errorMsg = `Google Maps authentication failed. The domain '${CURRENT_DOMAIN}' is not authorized to use this API key.`;
      lastErrorMessage = errorMsg;

      logError(errorMsg, {
        category: ErrorCategory.AUTHENTICATION,
        severity: ErrorSeverity.ERROR,
        message: errorMsg,
        context: { domain: CURRENT_DOMAIN },
      });

      console.error("[Maps Loader] AUTH ERROR: " + errorMsg);
      console.info(
        "[Maps Loader] To fix this, add this domain to the allowed referrers in the Google Cloud Console:"
      );
      console.info(`[Maps Loader] https://console.cloud.google.com/google/maps-apis/credentials`);
    };
  }
};

/**
 * Check if the Maps service proxy is available
 */
export const checkMapsServiceAvailability = async (): Promise<boolean> => {
  // Always use direct API in development environment
  if (import.meta.env.DEV) {
    console.log("[Maps Loader] Development environment detected, using direct Google Maps API");
    useDirectApi = true;
    serviceCheckAttempted = true;
    return false;
  }

  if (!MAPS_SERVICE_URL) return false;

  try {
    const isAvailable = await checkMapsServiceHealth(MAPS_SERVICE_URL);
    serviceCheckAttempted = true;

    if (!isAvailable) {
      logError("Maps service proxy is unavailable", {
        category: ErrorCategory.API,
        severity: ErrorSeverity.WARNING,
        message: "[Maps Loader] Maps service proxy is unavailable",
      });

      useDirectApi = hasFallbackOption;
      if (useDirectApi) {
        console.log("[Maps Loader] Falling back to direct Google Maps API");
      } else {
        logError("No fallback API key available", {
          category: ErrorCategory.API,
          severity: ErrorSeverity.ERROR,
          message: "[Maps Loader] No fallback API key available - map functionality may be limited",
        });
      }
    } else {
      useDirectApi = false;
      console.log(`[Maps Loader] Maps service proxy is available at: ${MAPS_SERVICE_URL}`);
    }

    return isAvailable;
  } catch (error) {
    logError(error instanceof Error ? error : new Error("Error checking maps service"), {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.WARNING,
      message: "[Maps Loader] Error checking maps service",
      context: { serviceUrl: MAPS_SERVICE_URL },
    });

    serviceCheckAttempted = true;
    useDirectApi = hasFallbackOption;
    return false;
  }
};

/**
 * Validate API key format to catch common mistakes
 */
export const isValidApiKeyFormat = (apiKey: string | undefined): boolean => {
  if (!apiKey) return false;
  return apiKey.length >= 30 && !apiKey.includes(" ");
};

/**
 * Main function to load Google Maps script
 */
export const loadGoogleMapsScript = async (libraries: string = "places"): Promise<void> => {
  // Only load once
  if (promise) return promise;

  // Set up auth failure handler
  setupAuthFailureHandler();

  // Validate API key format
  if (GOOGLE_MAPS_API_KEY && !isValidApiKeyFormat(GOOGLE_MAPS_API_KEY)) {
    const error = new Error("Invalid Google Maps API key format");
    logError(error, {
      category: ErrorCategory.API,
      severity: ErrorSeverity.ERROR,
      message: "[Maps Loader] Invalid Google Maps API key format",
    });
    throw error;
  }

  // Check network status first
  const networkState = getNetworkState();
  if (networkState.status === "offline") {
    const error = new Error("Cannot load Google Maps while offline");
    logError(error, {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.WARNING,
      message: "[Maps Loader] Cannot load Google Maps while offline",
    });
    throw error;
  }

  // Check service availability if we haven't yet
  if (!serviceCheckAttempted && MAPS_SERVICE_URL) {
    await checkMapsServiceAvailability();
  }

  promise = new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (window.google && window.google.maps) {
      console.log("[Maps Loader] Google Maps already loaded");
      resolve();
      return;
    }

    const script = document.createElement("script");

    // Determine which API source to use
    if (MAPS_SERVICE_URL && !useDirectApi) {
      const url = `${MAPS_SERVICE_URL}/maps/api/js?libraries=${libraries}`;
      console.log(`[Maps Loader] Loading Google Maps via proxy: ${url}`);
      script.src = url;
    } else if (GOOGLE_MAPS_API_KEY) {
      const url = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=${libraries}`;
      console.log("[Maps Loader] Loading Google Maps directly with API key");
      script.src = url;
    } else {
      const error = new Error("Maps configuration error: No valid API source available");
      logError(error, {
        category: ErrorCategory.API,
        severity: ErrorSeverity.ERROR,
        message:
          "[Maps Loader] Neither VITE_GOOGLE_MAPS_API_KEY nor VITE_MAPS_SERVICE_URL is properly set or available",
      });

      promise = null;
      reject(error);
      return;
    }

    // Use async and defer for better performance
    script.async = true;
    script.defer = true;

    // Handle successful load
    script.onload = () => {
      // Check if Google Maps API is actually available
      if (!window.google || !window.google.maps) {
        const error = new Error("[Maps Loader] Google Maps API failed to initialize correctly");
        promise = null;
        reject(error);
        return;
      }

      // Even if script loads, we need to check for auth errors that might happen after loading
      // We use a small delay to allow the auth check to complete
      setTimeout(() => {
        if (authErrorDetected) {
          promise = null;
          reject(new Error(lastErrorMessage || "Google Maps authentication failed"));
        } else {
          resolve();
        }
      }, 200);
    };

    // Handle script loading errors
    script.onerror = (error) => {
      const errorMsg = "Failed to load Google Maps API script";
      lastErrorMessage = errorMsg;

      logError(error instanceof Error ? error : new Error(errorMsg), {
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.ERROR,
        message: "[Maps Loader] " + errorMsg,
      });

      if (error instanceof Event) {
        console.warn(
          "[Maps Loader] Error details: This is likely due to an invalid API key, network issues, or billing not enabled"
        );
        console.log(
          "[Maps Loader] Verify your Google Cloud project has Maps JavaScript API enabled and billing configured"
        );
      }

      // Try fallback if available
      if (!useDirectApi && hasFallbackOption && MAPS_SERVICE_URL) {
        console.log("[Maps Loader] Proxy service failed, attempting fallback to direct API");
        useDirectApi = true;
        promise = null; // Reset promise to allow a new attempt
        loadGoogleMapsScript(libraries).then(resolve).catch(reject);
      } else {
        promise = null;
        reject(error);
      }
    };

    // Add script to document
    document.head.appendChild(script);
  });

  return promise;
};

/**
 * React hook for using Google Maps in components
 */
export const useLoadGoogleMaps = (libraries: string = "places") => {
  const [isLoaded, setIsLoaded] = useState(isGoogleMapsAPILoaded());
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(!isLoaded);
  const [errorDetails, setErrorDetails] = useState<{
    isAuthError: boolean;
    isDomainError: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isLoaded) return;

    setIsLoading(true);

    const loadMaps = async () => {
      try {
        if (!serviceCheckAttempted && MAPS_SERVICE_URL) {
          await checkMapsServiceAvailability();
        }

        await loadGoogleMapsScript(libraries);

        // Final check for auth errors before confirming load
        if (authErrorDetected) {
          throw new Error(lastErrorMessage || "Google Maps authentication failed");
        }

        setIsLoaded(true);
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load Google Maps";

        // Check for specific error types
        const isAuthError =
          authErrorDetected || errorMessage.includes("auth") || errorMessage.includes("key");
        const isDomainError =
          errorMessage.includes("domain") ||
          errorMessage.includes("referrer") ||
          errorMessage.includes("allowed");

        logError(err instanceof Error ? err : new Error(errorMessage), {
          category: isAuthError ? ErrorCategory.AUTHENTICATION : ErrorCategory.NETWORK,
          severity: ErrorSeverity.ERROR,
          message: "[Maps Loader] " + errorMessage,
        });

        setErrorDetails({
          isAuthError,
          isDomainError,
          message: errorMessage,
        });

        setError(err instanceof Error ? err : new Error(errorMessage));
        setIsLoading(false);
      }
    };

    loadMaps();
  }, [libraries, isLoaded]);

  return { isLoaded, isLoading, error, errorDetails };
};
