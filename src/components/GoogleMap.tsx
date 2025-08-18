import React, { useRef, useEffect, useState } from 'react';
import { GoogleMapWrapper } from './GoogleMapWrapper';

interface MapProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  mapId?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: (map: google.maps.Map) => void;
  children?: React.ReactNode;
}

/**
 * Google Map Component
 *
 * A component that renders a Google Map with proper loading and error handling.
 * Uses GoogleMapWrapper to ensure the API is loaded before attempting to create a map.
 */
export const GoogleMap: React.FC<MapProps> = ({
  center = { lat: 51.5074, lng: -0.1278 }, // Default to London
  zoom = 10,
  mapId = 'google-map',
  className = 'google-map-container',
  style = { height: '400px', width: '100%' },
  onLoad,
  children
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize the map when the component mounts and Google Maps is loaded
  useEffect(() => {
    if (!mapRef.current || map) return;

    try {
      console.log('Creating Google Map instance...');

      // Check if Google Maps API is available
      if (!window.google?.maps?.Map || typeof window.google.maps.Map !== 'function') {
        throw new Error('Google Maps API not properly loaded. Map constructor is not available.');
      }

      // Use a try-catch to specifically catch constructor errors
      try {
        // Create a new map instance with proper handling for the constructor
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapId
        });

        // Verify that critical methods exist before setting the map
        if (!mapInstance || typeof mapInstance.setCenter !== 'function') {
          throw new Error('Created map instance is invalid or missing essential methods');
        }

        console.log('Google Map instance created successfully');
        setMap(mapInstance);
        onLoad?.(mapInstance);
      } catch (constructorError) {
        console.error('Error in Map constructor:', constructorError);
        const errorMsg = constructorError instanceof Error ? constructorError.message : String(constructorError);
        setMapError(`Failed to create map: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Error creating Google Map:', err);
      setMapError(err instanceof Error ? err.message : String(err));
    }
  }, [center, zoom, mapId, onLoad, map]);

  return (
    <GoogleMapWrapper
      onError={(error) => setMapError(error.message)}
      fallback={<div className={className} style={style}>Loading map...</div>}
    >
      {mapError ? (
        <div className={className} style={style}>
          <div className="map-error-container">
            <p>Error loading map: {mapError}</p>
            <button onClick={() => window.location.reload()}>
              Reload page
            </button>
          </div>
        </div>
      ) : (
        <div
          id={mapId}
          ref={mapRef}
          className={className}
          style={style}
          data-testid="google-map"
        >
          {map && children}
        </div>
      )}
    </GoogleMapWrapper>
  );
};

export default GoogleMap;
