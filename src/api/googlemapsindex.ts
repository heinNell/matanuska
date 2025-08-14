/**
 * Google Maps integration for Matanuska
 * This file provides basic Google Maps functionality using the API
 */

// Get API key from environment variables for consistency across environments
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";

/**
 * Initialize the Google Maps API
 * This is the entry point called by the Google Maps JavaScript API when loaded
 */
async function initMap(): Promise<void> {
  console.log("Maps JavaScript API loaded.");

  // Initialize map functionality if a map element exists
  initializeMapIfElementExists();
}

/**
 * Initialize the map with a marker at Pretoria if the map element exists
 * This function is separated from initMap to allow the core initMap function
 * to match the required signature while preserving functionality
 */
function initializeMapIfElementExists(): void {
  const center = { lat: -25.7479, lng: 28.2293 };
  const mapElement = document.getElementById("map");

  // Add null check to satisfy TypeScript
  if (!mapElement) {
    console.log("Map element not found, skipping map initialization");
    return;
  }

  // Use type assertions to avoid TypeScript errors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const googleMaps = (window as any).google?.maps;
  if (!googleMaps) {
    console.error("Google Maps API not loaded");
    return;
  }

  const map = new googleMaps.Map(mapElement, {
    zoom: 12,
    center: center,
  });

  new googleMaps.Marker({
    position: center,
    map: map,
    title: "Pretoria",
  });
}

/**
 * Load the Google Maps API script dynamically
 */
function loadGoogleMapsScript(): void {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  // Add error handling for script loading
  script.onerror = () => {
    console.error("Failed to load Google Maps API script");
    console.warn("This may be due to network issues or an invalid API key");
  };
}

// Declare global interface for TypeScript
declare global {
  interface Window {
    initMap: () => void;
  }
}

// Make initMap globally accessible for Google Maps callback
window.initMap = initMap;

// Attach the script loader to window.onload
window.onload = loadGoogleMapsScript;

// Export functions for module compatibility
export { initMap, loadGoogleMapsScript };
