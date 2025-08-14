import React, { useEffect, useRef } from "react";
import { useLoadGoogleMaps } from "../../utils/googleMapsLoader";

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
  }>;
  className?: string;
  style?: React.CSSProperties;
  onMapLoad?: (map: google.maps.Map) => void;
}

const GoogleMapComponent: React.FC<GoogleMapProps> = ({
  center = { lat: -25.7479, lng: 28.2293 }, // Default to Pretoria
  zoom = 12,
  markers = [],
  className = "",
  style = {},
  onMapLoad,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Use the googleMapsLoader hook to load the API
  const { isLoaded, isLoading, error } = useLoadGoogleMaps("places");

  // Initialize the map once the API is loaded
  useEffect(() => {
    if (isLoaded && mapRef.current && !googleMapRef.current) {
      console.log("[GoogleMapComponent] Initializing map");

      // Create the map instance with responsive options
      const isMobile = window.innerWidth < 640;
      const mapOptions: google.maps.MapOptions = {
        center,
        zoom,
        mapTypeControl: !isMobile, // Hide map type control on mobile
        streetViewControl: !isMobile, // Hide street view on mobile
        fullscreenControl: true,
        zoomControl: true,
        zoomControlOptions: {
          // Position zoom controls on the right side for better mobile UX
          position: window.google?.maps?.ControlPosition?.RIGHT_BOTTOM || 11,
        },
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      googleMapRef.current = map;

      // Add markers if provided
      markers.forEach((marker) => {
        const newMarker = new window.google.maps.Marker({
          position: marker.position,
          map,
          title: marker.title,
        });
        markersRef.current.push(newMarker);
      });

      // Call onMapLoad callback if provided
      if (onMapLoad) {
        onMapLoad(map);
      }
    }
  }, [isLoaded, center, zoom, markers, onMapLoad]);

  // Clean up markers when component unmounts or markers change
  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [markers]);

  // Predefined styles for different states with responsive height
  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    minHeight: window.innerWidth < 640 ? "300px" : "400px",
    ...style,
  };

  if (error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded p-2 sm:p-4 ${className}`}
        style={containerStyle}
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-red-500 text-2xl sm:text-4xl mb-2 sm:mb-4">⚠️</div>
          <h3 className="text-base sm:text-lg font-semibold text-red-700 mb-1 sm:mb-2">
            Failed to load Google Maps
          </h3>
          <p className="text-sm sm:text-base text-red-600 max-w-xs sm:max-w-md">
            {error.message ||
              "There was an error loading the map. Please check your internet connection and try again."}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`bg-gray-50 border border-gray-200 rounded p-2 sm:p-4 ${className}`}
        style={containerStyle}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500 mb-2 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`google-map-container ${className}`}
      style={containerStyle}
      data-testid="google-map-container"
    />
  );
};

export default GoogleMapComponent;
