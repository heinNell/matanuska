/**
 * Maps Service URL Utility
 *
 * This utility provides functions for working with the Maps Service URL,
 * which is a Cloud Run service that can proxy Google Maps API requests.
 */

import { ErrorCategory, ErrorSeverity, logError } from "./errorHandling";
import { getNetworkState } from "./networkDetection";

// Keep track of health check attempts and status
let lastHealthCheck = 0;
let isServiceHealthy = false;
let healthCheckAttempts = 0;
const HEALTH_CHECK_COOLDOWN = 30000; // 30 seconds between checks
const MAX_HEALTH_CHECK_ATTEMPTS = 3;

/**
 * Gets the configured maps service URL from environment variables.
 * @returns The service URL or an empty string if not set.
 */
export const getMapsServiceUrl = (): string => {
  // It's safer to return an empty string if the variable is not set.
  return import.meta.env.VITE_MAPS_SERVICE_URL || "";
};

/**
 * Checks if the maps service is available by pinging its health endpoint.
 *
 * @param serviceUrl The URL of the maps proxy service.
 * @param force Whether to force a check even if one was recently performed
 * @returns A promise that resolves to true if the service is available, false otherwise.
 */
export const checkMapsServiceHealth = async (
  serviceUrl: string,
  force = false
): Promise<boolean> => {
  // Skip health check in development environments - always assume it's unavailable
  // This avoids unnecessary network requests and errors in dev
  if (import.meta.env.DEV) {
    console.log("[Maps Service] Development environment detected, skipping health check");
    return false;
  }

  // If we recently checked and it's not forced, return cached result
  const now = Date.now();
  if (!force && now - lastHealthCheck < HEALTH_CHECK_COOLDOWN) {
    return isServiceHealthy;
  }

  // Update last check time
  lastHealthCheck = now;

  if (!serviceUrl) {
    logError("No Maps service URL provided", {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.WARNING,
      message: "[Maps Service] No service URL provided for health check.",
    });
    return false;
  }

  // Check network state first - no point in checking if we're offline
  const networkState = getNetworkState();
  if (networkState.status === "offline") {
    logError("Network is offline", {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.INFO,
      message: "[Maps Service] Network is offline, skipping health check",
    });
    isServiceHealthy = false;
    return false;
  }

  // A common health check endpoint is `/health` or `/status`.
  const healthEndpoint = `${serviceUrl}/health`;

  console.log(`[Maps Service] Checking health of service at: ${healthEndpoint}`);

  try {
    // Increased timeout from 3s to 5s for more resilience
    const response = await fetch(healthEndpoint, {
      method: "GET",
      signal: AbortSignal.timeout(5000), // 5-second timeout
      cache: "no-store", // Ensure we don't get a cached response
    });

    // A successful response (e.g., status 200 OK) means the service is healthy.
    if (response.ok) {
      console.log(`[Maps Service] Health check succeeded for ${healthEndpoint}`);
      isServiceHealthy = true;
      healthCheckAttempts = 0; // Reset attempts counter on success
      return true;
    } else {
      // Log the error with the proper severity based on attempts
      logError(`Health check failed with status: ${response.status}`, {
        category: ErrorCategory.API,
        severity:
          healthCheckAttempts >= MAX_HEALTH_CHECK_ATTEMPTS
            ? ErrorSeverity.ERROR
            : ErrorSeverity.WARNING,
        message: `[Maps Service] Health check failed for ${healthEndpoint} with status: ${response.status}`,
        context: { attempts: healthCheckAttempts, maxAttempts: MAX_HEALTH_CHECK_ATTEMPTS },
      });

      healthCheckAttempts++;
      isServiceHealthy = false;
      return false;
    }
  } catch (error) {
    healthCheckAttempts++;
    isServiceHealthy = false;

    // Determine error type for better logging
    let errorType = "Unknown";
    let errorMessage = "Unknown error";

    if (error instanceof Error) {
      errorMessage = error.message;
      if (error instanceof DOMException && error.name === "AbortError") {
        errorType = "Timeout";
      } else if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        errorType = "Network";
      }
    }

    // Log the error with appropriate category and severity
    logError(error instanceof Error ? error : new Error(errorMessage), {
      category: ErrorCategory.NETWORK,
      severity:
        healthCheckAttempts >= MAX_HEALTH_CHECK_ATTEMPTS
          ? ErrorSeverity.ERROR
          : ErrorSeverity.WARNING,
      message: `[Maps Service] Health check failed (${errorType}): ${errorMessage}`,
      context: {
        endpoint: healthEndpoint,
        attempts: healthCheckAttempts,
        maxAttempts: MAX_HEALTH_CHECK_ATTEMPTS,
      },
    });

    return false;
  }
};

/**
 * Check if we're allowed to use Google Maps based on last health check
 * or network status
 */
export const canUseGoogleMaps = (): boolean => {
  // If service is healthy, we can use it
  if (isServiceHealthy) return true;

  // If we're offline, we shouldn't try to use Google Maps
  const networkState = getNetworkState();
  if (networkState.status === "offline") return false;

  // If we've never checked or it's been a while, assume we can try
  const now = Date.now();
  if (lastHealthCheck === 0 || now - lastHealthCheck > HEALTH_CHECK_COOLDOWN * 2) return true;

  // Otherwise, we can't use it
  return false;
};
