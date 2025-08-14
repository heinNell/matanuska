import { useState } from 'react';
import { useEffect } from 'react';

/**
 * Map Configuration Utility
 * 
 * This file contains common map configurations, styles, and helper functions
 * to ensure consistent maps throughout the application.
 */

// Default map center - Pretoria, South Africa
export const DEFAULT_MAP_CENTER = {
  lat: -25.7479,
  lng: 28.2293
};

// Map style presets
export const MAP_STYLES = {
  // Clean style that hides points of interest
  clean: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ],
  
  // Night mode style
  night: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }]
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }]
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }]
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }]
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }]
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }]
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }]
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }]
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }]
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }]
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }]
    }
  ],
  
  // Satellite with roads style - similar to "hybrid" mapTypeId but can be used with other map types
  satelliteRoads: [
    {
      featureType: "administrative",
      elementType: "labels",
      stylers: [{ visibility: "on" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ visibility: "on", weight: 2 }]
    },
    {
      featureType: "road",
      elementType: "labels",
      stylers: [{ visibility: "on" }]
    }
  ],
  
  // Transport/logistics focused style
  logistics: [
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#f7b955" }, { weight: 2 }]
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [{ color: "#fcd195" }, { weight: 1.5 }]
    },
    {
      featureType: "poi.business",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.government",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.medical",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.place_of_worship",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.school",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.sports_complex",
      stylers: [{ visibility: "off" }]
    }
  ]
};

// Default map options
export const DEFAULT_MAP_OPTIONS = {
  fullscreenControl: true,
  mapTypeControl: true,
  streetViewControl: true,
  zoomControl: true,
  styles: MAP_STYLES.clean
};

// Icon types supported by the application
export type MapIconType = 'default' | 'vehicle' | 'alert' | 'driver' | 'depot' | 'workshop' | 'custom';

// Helper to create marker icons with different colors or predefined types
export const createMarkerIcon = (
  iconTypeOrColor: MapIconType | string = 'default', 
  scale = 1
) => {
  // If it's a predefined icon type
  switch (iconTypeOrColor) {
    case 'vehicle':
      return {
        path: 'M20,8h-3V4H3C1.9,4,1,4.9,1,6v11h2c0,1.66,1.34,3,3,3s3-1.34,3-3h6c0,1.66,1.34,3,3,3s3-1.34,3-3h2v-5L20,8z',
        fillColor: '#2196F3',
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#000000',
        scale: 1.2,
        anchor: { x: 12, y: 12 }
      };
    case 'alert':
      return {
        path: 'M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z',
        fillColor: '#FF5722',
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#000000',
        scale: 1.2,
        anchor: { x: 12, y: 12 }
      };
    case 'driver':
      return {
        path: 'M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z',
        fillColor: '#4CAF50',
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#000000',
        scale: 1.2,
        anchor: { x: 12, y: 12 }
      };
    case 'depot':
      return {
        path: 'M12,5.5L18,10H15V16H9V10H6L12,5.5M5,18H19V20H5V18Z',
        fillColor: '#FFC107',
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#000000',
        scale: 1.2,
        anchor: { x: 12, y: 12 }
      };
    case 'workshop':
      return {
        path: 'M22,9H17.21L12.83,2.44C12.64,2.16 12.32,2 12,2C11.68,2 11.36,2.16 11.17,2.45L6.79,9H2C1.45,9 1,9.45 1,10C1,10.09 1,10.18 1.04,10.27L3.58,19.54C3.81,20.38 4.58,21 5.5,21H18.5C19.42,21 20.19,20.38 20.43,19.54L22.96,10.27L23,10C23,9.45 22.55,9 22,9M10,15H8V10H10V15M16,15H14V10H16V15Z',
        fillColor: '#9C27B0',
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#000000',
        scale: 1.2,
        anchor: { x: 12, y: 12 }
      };
    case 'default':
    default:
      // If it's a color string like '#FF0000', use it as color
      const color = iconTypeOrColor.startsWith('#') ? iconTypeOrColor : '#FF0000';
      return {
        path: 'M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z',
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#000000',
        scale: scale,
        anchor: { x: 12, y: 22 }
      };
  }
};

// Truck icon for logistics applications
export const TRUCK_ICON = {
  path: 'M20,8h-3V4H3C1.9,4,1,4.9,1,6v11h2c0,1.66,1.34,3,3,3s3-1.34,3-3h6c0,1.66,1.34,3,3,3s3-1.34,3-3h2v-5L20,8z M19.5,9.5l1.96,2.5H17V9.5H19.5z M6,18.5c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5S6.83,18.5,6,18.5z M18,18.5c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5S18.83,18.5,18,18.5z M17,12V9.5h-5v2.5H17z M12,9.5V7H3v8h1.5c0-1.66,1.34-3,3-3s3,1.34,3,3H12V9.5z',
  fillColor: '#2196F3',
  fillOpacity: 1,
  strokeWeight: 1,
  strokeColor: '#000000',
  scale: 1.5,
  anchor: { x: 12, y: 12 }
};

// Calculate the bounds to fit an array of locations
export const getBoundsForLocations = (locations: { lat: number; lng: number }[]) => {
  if (!locations || locations.length === 0) return null;
  
  // Use Google Maps API to calculate bounds
  if (window.google && window.google.maps) {
    const bounds = new google.maps.LatLngBounds();
    
    locations.forEach((location) => {
      bounds.extend(new google.maps.LatLng(location.lat, location.lng));
    });
    
    return bounds;
  }
  
  // Fallback manual calculation if Google Maps isn't loaded
  const latitudes = locations.map(loc => loc.lat);
  const longitudes = locations.map(loc => loc.lng);
  
  const south = Math.min(...latitudes);
  const north = Math.max(...latitudes);
  const west = Math.min(...longitudes);
  const east = Math.max(...longitudes);
  
  return {
    south,
    north,
    west,
    east
  };
};

// Calculate the center point of multiple locations
export const getCenterOfLocations = (locations: { lat: number; lng: number }[]): { lat: number; lng: number } => {
  if (!locations || locations.length === 0) return DEFAULT_MAP_CENTER;
  
  if (locations.length === 1) return locations[0];
  
  const total = locations.reduce(
    (acc, loc) => ({ lat: acc.lat + loc.lat, lng: acc.lng + loc.lng }),
    { lat: 0, lng: 0 }
  );
  
  return {
    lat: total.lat / locations.length,
    lng: total.lng / locations.length
  };
};

// Calculate the appropriate zoom level based on the bounds
export const getZoomLevelForBounds = (bounds: any, mapWidth: number, mapHeight: number) => {
  if (!bounds || !window.google || !window.google.maps) return 10;
  
  const WORLD_DIM = { height: 256, width: 256 };
  const ZOOM_MAX = 21;
  
  const latRadian = (lat: number) => {
    const sin = Math.sin(lat * Math.PI / 180);
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
  };
  
  const zoom = (mapPx: number, worldPx: number, fraction: number) => {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
  };
  
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  
  const latFraction = (latRadian(ne.lat()) - latRadian(sw.lat())) / Math.PI;
  
  const lngDiff = ne.lng() - sw.lng();
  const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;
  
  const latZoom = zoom(mapHeight, WORLD_DIM.height, latFraction);
  const lngZoom = zoom(mapWidth, WORLD_DIM.width, lngFraction);
  
  return Math.min(latZoom, lngZoom, ZOOM_MAX);
};

// Interface for window global
// Import Google Maps utilities from the centralized loader
import { 
  isGoogleMapsAPILoaded,
  loadGoogleMapsScript, 
  useLoadGoogleMaps 
} from './googleMapsLoader';

// Re-export for backward compatibility
export { 
  isGoogleMapsAPILoaded, 
  loadGoogleMapsScript, 
  useLoadGoogleMaps 
};


