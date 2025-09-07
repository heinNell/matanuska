import React, { useState, useEffect } from 'react';
import { DirectionsRenderer } from '@react-google-maps/api';
import { Location, RouteOptions } from '../../../types/mapTypes';

interface RouteDrawerProps {
  origin: Location;
  destination: Location;
  waypoints?: Location[];
  options?: RouteOptions;
  onRouteCalculated?: (result: any) => void;
  onError?: (error: any) => void;
  className?: string;
}

/**
 * RouteDrawer - A component to draw routes between locations on a Google Map
 *
 * Features:
 * - Calculates and draws routes between two points
 * - Supports waypoints for multi-stop routes
 * - Configurable route options (stroke color, opacity, mode, etc.)
 * - Provides route data (distance, duration) through callbacks
 */
const RouteDrawer: React.FC<RouteDrawerProps> = ({
  origin,
  destination,
  waypoints = [],
  options = {},
  onRouteCalculated,
  onError,
  className
}) => {
  const [directions, setDirections] = useState<any>(null);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Default route options
  const defaultOptions: RouteOptions = {
    strokeColor: '#3B82F6',
    strokeOpacity: 0.8,
    strokeWeight: 5,
    mode: 'driving',
    optimizeWaypoints: true,
    avoidHighways: false,
    avoidTolls: false
  };

  // Merge default and provided options
  const routeOptions = { ...defaultOptions, ...options };

  // Effect to calculate route when inputs change
  useEffect(() => {
    if (!origin || !destination) return;

    setCalculating(true);
    setError(null);

    // Convert waypoints to Google Maps waypoint format
    const formattedWaypoints = waypoints.map(waypoint => ({
      location: { lat: waypoint.lat, lng: waypoint.lng },
      stopover: true
    }));

    // Create directions request
    const directionsRequest = {
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      waypoints: formattedWaypoints,
      travelMode: routeOptions.mode?.toUpperCase() as any,
      optimizeWaypoints: routeOptions.optimizeWaypoints,
      avoidHighways: routeOptions.avoidHighways,
      avoidTolls: routeOptions.avoidTolls
    };

    // Call DirectionsService with proper type annotation
    const directionsService: google.maps.DirectionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      directionsRequest,
      (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
        setCalculating(false);

        if (status === 'OK' && result) {
          setDirections(result);
          if (onRouteCalculated) onRouteCalculated(result);
        } else {
          const errorMessage = `Route calculation failed: ${status}`;
          setError(errorMessage);
          if (onError) onError(errorMessage);
        }
      }
    );
  }, [origin, destination, waypoints, routeOptions.mode,
      routeOptions.optimizeWaypoints, routeOptions.avoidHighways, routeOptions.avoidTolls]);

  // Render the route on the map
  return (
    <div className={`relative ${className || ''}`}>
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            polylineOptions: {
              strokeColor: routeOptions.strokeColor,
              strokeOpacity: routeOptions.strokeOpacity,
              strokeWeight: routeOptions.strokeWeight
            },
            suppressMarkers: false,
          }}
        />
      )}

      {calculating && (
        <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow z-10">
          <div className="flex items-center">
            <div className="animate-spin h-4 w-4 border-t-2 border-blue-500 rounded-full mr-2" />
            <span className="text-sm">Calculating route...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute bottom-4 left-4 bg-red-50 p-2 rounded shadow z-10">
          <div className="flex items-center text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteDrawer;
