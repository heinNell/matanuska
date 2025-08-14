/**
 * Google Maps Places API Guard Utilities
 * Prevents the "Cannot read properties of undefined (reading 'wI')" error
 * by adding comprehensive validation and error handling.
 */

/**
 * Check if Google Maps Places API is fully loaded and ready
 */
export const isPlacesApiReady = (): boolean => {
  return !!(
    window.google?.maps?.places?.PlacesService &&
    window.google?.maps?.places?.Autocomplete &&
    window.google?.maps?.places?.PlacesServiceStatus
  );
};

/**
 * Safely get place details from an Autocomplete instance
 */
export const safeGetPlace = (
  autocomplete: google.maps.places.Autocomplete | null
): google.maps.places.PlaceResult | null => {
  if (!autocomplete || !isPlacesApiReady()) {
    return null;
  }

  try {
    const place = autocomplete.getPlace();
    // Validate the place object has the expected structure
    if (place && typeof place === "object") {
      return place;
    }
    return null;
  } catch (error) {
    console.warn("Error getting place from autocomplete:", error);
    return null;
  }
};

/**
 * Safely initialize Places service with comprehensive error handling
 */
export const safeInitPlacesService = (
  mapInstance: google.maps.Map | null
): google.maps.places.PlacesService | null => {
  if (!mapInstance || !isPlacesApiReady()) {
    return null;
  }

  try {
    return new window.google.maps.places.PlacesService(mapInstance);
  } catch (error) {
    console.error("Error initializing Places service:", error);
    return null;
  }
};

/**
 * Wait for Places API to be ready with timeout
 */
export const waitForPlacesApi = (timeoutMs: number = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (isPlacesApiReady()) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkInterval = 100;

    const intervalId = setInterval(() => {
      if (isPlacesApiReady()) {
        clearInterval(intervalId);
        resolve(true);
        return;
      }

      if (Date.now() - startTime > timeoutMs) {
        clearInterval(intervalId);
        console.warn("Timeout waiting for Places API to be ready");
        resolve(false);
      }
    }, checkInterval);
  });
};

/**
 * Safely execute a Places API operation with retries
 */
export const safeExecutePlacesOperation = async <T>(
  operation: () => T,
  maxRetries: number = 3,
  retryDelayMs: number = 500
): Promise<T | null> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (!isPlacesApiReady()) {
      if (attempt === maxRetries) {
        console.error("Places API not ready after maximum retries");
        return null;
      }

      // Wait and retry
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      continue;
    }

    try {
      return operation();
    } catch (error) {
      if (attempt === maxRetries) {
        console.error("Places API operation failed after maximum retries:", error);
        return null;
      }

      console.warn(`Places API operation failed, retrying (${attempt + 1}/${maxRetries}):`, error);
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  return null;
};
