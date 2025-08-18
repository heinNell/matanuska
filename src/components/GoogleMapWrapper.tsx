import React, { useState, useEffect } from 'react';
import { loadGoogleMapsScript, isGoogleMapsAPILoaded } from '../utils/googleMapsLoader';

interface GoogleMapWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  libraries?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * GoogleMapWrapper
 *
 * A wrapper component that ensures Google Maps API is loaded before rendering children.
 * Use this component to wrap any component that uses Google Maps API.
 */
export const GoogleMapWrapper: React.FC<GoogleMapWrapperProps> = ({
  children,
  fallback = <div className="loading-maps">Loading maps...</div>,
  libraries = 'places',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(isGoogleMapsAPILoaded());
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If already loaded, don't do anything
    if (isLoaded) return;

    const loadMaps = async () => {
      try {
        // Global variable to store the API key from environment
        (window as any).GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        console.log('Loading Google Maps API...');
        await loadGoogleMapsScript(libraries);

        // Check if Map constructor exists and is a function
        if (
          !window.google?.maps?.Map ||
          typeof window.google.maps.Map !== 'function'
        ) {
          throw new Error('Google Maps API loaded but Map constructor is unavailable');
        }

        console.log('Google Maps API loaded successfully');
        setIsLoaded(true);
        onLoad?.();
      } catch (err) {
        console.error('Error loading Google Maps API:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    };

    loadMaps();
  }, [isLoaded, libraries, onLoad, onError]);

  // If there was an error loading the API
  if (error) {
    return (
      <div className="google-maps-error">
        <h3>Error loading Google Maps</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Reload page</button>
      </div>
    );
  }

  // If still loading, show fallback
  if (!isLoaded) {
    return <>{fallback}</>;
  }

  // API is loaded, render children
  return <>{children}</>;
};

export default GoogleMapWrapper;
