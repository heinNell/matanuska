// maps.index.js - Google Maps initialization for standalone context

// API key for Google Maps - for production, this should be replaced by environment variables
// via a build process like Webpack, Vite, or similar
const API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";

/**
 * Initialize the Google Maps API
 * This matches the signature in the requirements
 */
async function initMap() {
  console.log("Maps JavaScript API loaded.");

  const center = { lat: -25.7479, lng: 28.2293 };
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: center,
  });

  new google.maps.Marker({
    position: center,
    map: map,
    title: "Pretoria",
  });
}

/**
 * Load the Google Maps API script dynamically
 */
function loadGoogleMapsScript() {
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

// Make initMap globally accessible for Google Maps callback
window.initMap = initMap;

// Load the Maps script when the page loads
window.onload = loadGoogleMapsScript;
