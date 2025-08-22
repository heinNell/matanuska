/**
 * Google Maps Places API Utility
 * Reliable implementation using PlacesService that works with your existing Google Maps API
 */

import { PlaceResult } from "../types/mapTypes";

/**
 * Initialize a Places service instance
 * @param mapInstance The Google Maps instance to attach the Places service to
 * @returns A Google Places service instance or null if initialization fails
 */
export const initPlacesService = (mapInstance: google.maps.Map): google.maps.places.PlacesService | null => {
  if (!window.google?.maps?.places) {
    console.error("Google Maps Places library not loaded");
    return null;
  }

  try {
    if (!window.google.maps.places.PlacesService) {
      console.error("PlacesService constructor not available");
      return null;
    }

    return new window.google.maps.places.PlacesService(mapInstance);
  } catch (error) {
    console.error("Error initializing Places service:", error);
    return null;
  }
};

/**
 * Search for places based on a text query
 * @param query Text query to search for
 * @param options Additional search options including map instance
 * @returns Promise that resolves with search results
 */
export const searchPlacesByText = (
  query: string,
  options: {
    fields?: string[];
    locationBias?: { lat: number; lng: number; radius?: number };
    map?: google.maps.Map;
  } = {}
): Promise<PlaceResult[]> => {
  return new Promise((resolve) => {
    if (!options.map) {
      console.warn("Map instance required for Places search");
      resolve([]);
      return;
    }

    const service = initPlacesService(options.map);
    if (!service) {
      console.warn("Failed to initialize Places service");
      resolve([]);
      return;
    }

    const defaultFields = ["name", "formatted_address", "geometry", "place_id", "types"];
    const fields = options.fields || defaultFields;

    const request: google.maps.places.FindPlaceFromQueryRequest = {
      query,
      fields: fields as string[],
    };

    // Add location bias if provided
    if (options.locationBias) {
      const { lat, lng, radius = 5000 } = options.locationBias;
      const center = new window.google.maps.LatLng(lat, lng);
      const circle = new window.google.maps.Circle({
        center,
        radius,
      });
      request.locationBias = circle;
    }

    try {
      service.findPlaceFromQuery(request, (results: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          console.warn(`Place search failed with status: ${status}`);
          resolve([]);
        }
      });
    } catch (error) {
      console.error("Exception in Places service call:", error);
      resolve([]);
    }
  });
};

/**
 * Search for nearby places
 * @param location Center point for the search
 * @param options Search options including map instance
 * @returns Promise that resolves with nearby places
 */
export const searchNearbyPlaces = (
  location: { lat: number; lng: number },
  options: {
    radius?: number;
    type?: string;
    keyword?: string;
    map?: google.maps.Map;
  } = {}
): Promise<PlaceResult[]> => {
  return new Promise((resolve) => {
    if (!options.map) {
      console.warn("Map instance required for nearby Places search");
      resolve([]);
      return;
    }

    const service = initPlacesService(options.map);
    if (!service) {
      console.warn("Failed to initialize Places service");
      resolve([]);
      return;
    }

    const request = {
      location: new window.google.maps.LatLng(location.lat, location.lng),
      radius: options.radius || 1000,
      type: options.type,
      keyword: options.keyword,
    };

    try {
      service.nearbySearch(request, (results: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          console.warn(`Nearby place search failed: ${status}`);
          resolve([]);
        }
      });
    } catch (error) {
      console.error("Exception in nearby places search:", error);
      resolve([]);
    }
  });
};

/**
 * Get details for a specific place by place_id
 * @param placeId The place ID to get details for
 * @param options Options including fields and map instance
 * @returns Promise that resolves with place details
 */
export const getPlaceDetails = (
  placeId: string,
  options: {
    fields?: string[];
    map?: google.maps.Map;
  } = {}
): Promise<PlaceResult> => {
  return new Promise((resolve, reject) => {
    if (!options.map) {
      reject(new Error("Map instance required for place details"));
      return;
    }

    const service = initPlacesService(options.map);
    if (!service) {
      reject(new Error("Failed to initialize Places service"));
      return;
    }

    const defaultFields = [
      "name",
      "formatted_address",
      "geometry",
      "photos",
      "rating",
      "reviews",
      "website",
      "formatted_phone_number",
    ];

    const request = {
      placeId,
      fields: options.fields || defaultFields,
    };

    try {
      service.getDetails(request, (result: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Place details request failed: ${status}`));
        }
      });
    } catch (error) {
      console.error("Exception in place details request:", error);
      reject(error);
    }
  });
};

/**
 * Convert a Place result to a Location object
 * @param place The Google Place result
 * @returns A Location object
 */
export const placeToLocation = (place: PlaceResult) => {
  if (!place.geometry?.location) {
    throw new Error("Place has no location geometry");
  }

  return {
    lat: place.geometry.location.lat(),
    lng: place.geometry.location.lng(),
    title: place.name || "Unnamed place",
    address: place.formatted_address,
    info: place.types?.join(", "),
  };
};
