/**
 * Google Maps Places API Utility
 * Provides functions for searching places, fetching place details, and autocomplete
 */

import { PlaceResult } from "../types/mapTypes";

/**
 * Initialize a Places service instance
 * @param mapInstance The Google Maps instance to attach the Places service to
 * @returns A Google Places service instance
 */
export const initPlacesService = (mapInstance: any): any => {
  if (!window.google?.maps?.places) {
    console.error("Google Maps Places library not loaded");
    return null;
  }

  try {
    // Add extra validation for Places service availability
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
 * @param service The Places service instance
 * @param query Text query to search for
 * @param options Additional search options
 * @returns Promise that resolves with search results
 */
export const searchPlacesByText = (
  service: any,
  query: string,
  options: {
    fields?: string[];
    locationBias?: { lat: number; lng: number; radius?: number };
  } = {}
): Promise<PlaceResult[]> => {
  return new Promise((resolve, reject) => {
    if (!service) {
      reject(new Error("Places service not initialized"));
      return;
    }

    const defaultFields = ["name", "formatted_address", "geometry", "place_id", "types"];

    const request: {
      query: string;
      fields: string[];
      locationBias?: any;
    } = {
      query,
      fields: options.fields || defaultFields,
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
          // Return empty array instead of rejecting to prevent app crashes
          resolve([]);
        }
      });
    } catch (error) {
      console.error("Exception in Places service call:", error);
      // Return empty array instead of rejecting to prevent app crashes
      resolve([]);
      }
    });
  });
};

/**
 * Search for nearby places
 * @param service The Places service instance
 * @param location Center point for the search
 * @param options Search options like radius, type, etc.
 * @returns Promise that resolves with nearby places
 */
export const searchNearbyPlaces = (
  service: any,
  location: { lat: number; lng: number },
  options: {
    radius?: number;
    type?: string;
    keyword?: string;
    rankBy?: any;
  } = {}
): Promise<PlaceResult[]> => {
  return new Promise((resolve, reject) => {
    if (!service) {
      reject(new Error("Places service not initialized"));
      return;
    }

    const request = {
      location: new window.google.maps.LatLng(location.lat, location.lng),
      radius: options.radius || 1000,
      type: options.type,
      keyword: options.keyword,
      rankBy: options.rankBy,
    };

    service.nearbySearch(request, (results: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results);
      } else {
        reject(new Error(`Nearby place search failed: ${status}`));
      }
    });
  });
};

/**
 * Get details for a specific place by place_id
 * @param service The Places service instance
 * @param placeId The place ID to get details for
 * @param fields The fields to include in the result
 * @returns Promise that resolves with place details
 */
export const getPlaceDetails = (
  service: any,
  placeId: string,
  fields: string[] = [
    "name",
    "formatted_address",
    "geometry",
    "photos",
    "rating",
    "reviews",
    "website",
    "formatted_phone_number",
  ]
): Promise<PlaceResult> => {
  return new Promise((resolve, reject) => {
    if (!service) {
      reject(new Error("Places service not initialized"));
      return;
    }

    const request = {
      placeId,
      fields,
    };

    service.getDetails(request, (result: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && result) {
        resolve(result);
      } else {
        reject(new Error(`Place details request failed: ${status}`));
      }
    });
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
    // Add more fields as needed from the place result
  };
};
