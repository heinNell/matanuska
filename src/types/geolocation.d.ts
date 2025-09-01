// This file provides type declarations for @capacitor/geolocation to fix TypeScript errors
declare module '@capacitor/geolocation' {
  export interface GeolocationPermissions {
    location: 'granted' | 'denied' | 'prompt';
  }

  export interface GeolocationPosition {
    coords: {
      latitude: number;
      longitude: number;
      accuracy: number;
      altitude: number | null;
      altitudeAccuracy: number | null;
      heading: number | null;
      speed: number | null;
    };
    timestamp: number;
  }

  export const Geolocation: {
    getCurrentPosition: (options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
    }) => Promise<GeolocationPosition>;
    watchPosition: (
      options: {
        enableHighAccuracy?: boolean;
        timeout?: number;
        maximumAge?: number;
      },
      callback: (position: GeolocationPosition) => void
    ) => Promise<string>;
    clearWatch: (options: { id: string }) => Promise<void>;
    checkPermissions: () => Promise<GeolocationPermissions>;
    requestPermissions: () => Promise<GeolocationPermissions>;
  };
}
