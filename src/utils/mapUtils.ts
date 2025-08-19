/**
 * Map utility functions for the Matanuska Transport Application
 */

/**
 * Format an address object from Google Maps into a readable string
 */
export const formatAddress = (location: LocationInput): string => {
  if (Array.isArray(location)) {
    // Original address component formatting logic
    return location
      .map(component => component.long_name)
      .filter(Boolean)
      .join(', ');
  }

  // Handle coordinate object
  return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
};

/**
 * Find a specific address component type from the Google Maps geocoder result
 */
export const findAddressComponent = (
  components: google.maps.GeocoderAddressComponent[],
  type: string
): google.maps.GeocoderAddressComponent | undefined => {
  return components.find(component => component.types.includes(type));
};

/**
 * Calculate distance between two points in kilometers using the Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  // Earth's radius in kilometers
  const R = 6371;

  // Convert latitude and longitude from degrees to radians
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  // Haversine formula calculation
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng/2) * Math.sin(dLng/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers

  return distance;
};

/**
 * Convert degrees to radians
 */
const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Format distance in a human-readable way
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    // Convert to meters if less than 1 km
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }

  // Round to 1 decimal place if under 10 km
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  }

  // Round to whole number if over 10 km
  return `${Math.round(distanceKm)} km`;
};

/**
 * Calculate and format travel time based on distance and speed
 */
export const calculateTravelTime = (
  distanceKm: number,
  speedKmh: number = 60
): string => {
  if (distanceKm <= 0 || speedKmh <= 0) {
    return 'N/A';
  }

  // Calculate time in hours
  const timeHours = distanceKm / speedKmh;

  // Convert to minutes
  const totalMinutes = Math.round(timeHours * 60);

  // Format as hours and minutes
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
};

/**
 * Get a static map image URL for a location
 * Useful for thumbnails or fallbacks when interactive maps aren't available
 */
export const getStaticMapUrl = (
  lat: number,
  lng: number,
  zoom: number = 14,
  width: number = 400,
  height: number = 200
): string => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    console.error('No Google Maps API key provided for static map');
    return '';
  }

  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${lat},${lng}&key=${apiKey}`;
};

/**
 * Generate a random location within a specified radius from a center point
 * Useful for testing or demo purposes
 */
export const getRandomLocation = (
  centerLat: number,
  centerLng: number,
  radiusKm: number = 5
): { lat: number; lng: number } => {
  // Convert radius from kilometers to degrees (approximate)
  const radiusDegrees = radiusKm / 111;

  // Get random distance and angle
  const randomDistance = Math.sqrt(Math.random()) * radiusDegrees;
  const randomAngle = Math.random() * Math.PI * 2;

  // Calculate offset
  const latOffset = randomDistance * Math.cos(randomAngle);
  const lngOffset = randomDistance * Math.sin(randomAngle) / Math.cos(centerLat * (Math.PI / 180));

  // Add offset to center coordinates
  return {
    lat: centerLat + latOffset,
    lng: centerLng + lngOffset
  };
};

/**
 * Encode a path for use in Google Maps polylines
 */
export const encodePath = (path: google.maps.LatLng[]): string => {
  if (!window.google?.maps?.geometry?.encoding) {
    console.warn('Google Maps geometry library not loaded, cannot encode path');
    return '';
  }

  return google.maps.geometry.encoding.encodePath(path);
};

/**
 * Location input type for map functions
 */
export type LocationInput = google.maps.GeocoderAddressComponent[] | {
  lat: number;
  lng: number;
};
