/**
 * Types for map-related components
 */

// Basic location interface for map markers
export interface Location {
  lat: number;
  lng: number;
  id?: string;
  title?: string;
  info?: string;
  address?: string;
  iconType?: MapIconType;
  iconUrl?: string;
  customFields?: Record<string, string>;
}

// Icon types supported by the application
export type MapIconType =
  | "default"
  | "vehicle"
  | "alert"
  | "driver"
  | "depot"
  | "workshop"
  | "custom";

// Route options for drawing paths between locations
export interface RouteOptions {
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  mode?: "driving" | "walking" | "bicycling" | "transit";
  optimizeWaypoints?: boolean;
  avoidHighways?: boolean;
  avoidTolls?: boolean;
}

// Map style options
export interface MapStyle {
  name: string;
  styles: google.maps.MapTypeStyle[] | any[];
}

// Places search result
export interface PlaceResult {
  name?: string;
  formatted_address?: string;
  geometry?: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  place_id?: string;
  types?: string[];
}
