# Google Maps Integration Guide for Matanuska Transport Application

This guide provides a complete end-to-end implementation of Google Maps in the Matanuska Transport Application, with a focus on reliability, error handling, and performance.

## Table of Contents

1. [Setup and Configuration](#setup-and-configuration)
2. [Components Overview](#components-overview)
3. [Integration Steps](#integration-steps)
4. [Error Handling](#error-handling)
5. [Advanced Usage](#advanced-usage)
6. [Troubleshooting](#troubleshooting)

## Setup and Configuration

### API Key Setup

1. **Obtain a Google Maps API Key**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the necessary APIs:
     - Maps JavaScript API
     - Places API
     - Directions API
     - Distance Matrix API
   - Create an API key with appropriate restrictions

2. **Configure the API Key in Your Application**:

   ```typescript
   // In your .env file
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

   Or set it globally in your main app file:

   ```typescript
   window.GOOGLE_MAPS_API_KEY = 'your_api_key_here';
   ```

### Add Required Scripts

Our application uses a custom loader and patch system to ensure Google Maps loads reliably. Include these in your project:

```typescript
// src/utils/googleMapsLoader.ts - API loading management
// src/utils/googleMapsApiPatch.ts - Error handling and recovery
```

## Components Overview

Our Google Maps integration consists of these key components:

### 1. GoogleMapWrapper

A wrapper component that handles the loading of the Google Maps API and provides fallback UI during loading.

```tsx
<GoogleMapWrapper
  libraries="places,drawing"
  fallback={<LoadingSpinner />}
>
  {/* Maps components go here */}
</GoogleMapWrapper>
```

### 2. GoogleMap

The main map component that renders a Google Map and handles common map functionality.

```tsx
<GoogleMap
  center={{ lat: 61.2181, lng: -149.9003 }} // Anchorage
  zoom={10}
  mapId="transport-map"
  onLoad={(map) => console.log('Map loaded', map)}
/>
```

### 3. Utility Components

- `Marker` - For displaying locations
- `DirectionsRenderer` - For showing routes
- `Autocomplete` - For location search functionality

## Integration Steps

### Step 1: Basic Map Integration

```tsx
import React from 'react';
import { GoogleMapWrapper, GoogleMap } from '../components';

const TransportMap: React.FC = () => {
  return (
    <GoogleMapWrapper>
      <GoogleMap
        center={{ lat: 61.2181, lng: -149.9003 }}
        zoom={10}
        style={{ height: '500px', width: '100%' }}
      />
    </GoogleMapWrapper>
  );
};

export default TransportMap;
```

### Step 2: Adding Markers for Vehicles

```tsx
import React, { useState, useEffect } from 'react';
import { GoogleMapWrapper, GoogleMap } from '../components';
import { fetchVehicleLocations } from '../api/vehicleApi';
import { createVehicleMarker } from '../utils/mapHelpers';

const VehicleTrackingMap: React.FC = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [vehicles, setVehicles] = useState([]);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  // Load vehicles
  useEffect(() => {
    fetchVehicleLocations().then(data => setVehicles(data));
  }, []);

  // Create markers when map and vehicles are loaded
  useEffect(() => {
    if (!map || vehicles.length === 0) return;

    // Remove existing markers
    markers.forEach(marker => marker.setMap(null));

    // Create new markers
    const newMarkers = vehicles.map(vehicle =>
      createVehicleMarker(map, vehicle)
    );

    setMarkers(newMarkers);
  }, [map, vehicles]);

  return (
    <GoogleMapWrapper>
      <GoogleMap
        center={{ lat: 61.2181, lng: -149.9003 }}
        zoom={10}
        style={{ height: '500px', width: '100%' }}
        onLoad={setMap}
      />
    </GoogleMapWrapper>
  );
};

export default VehicleTrackingMap;
```

### Step 3: Adding Route Visualization

```tsx
import React, { useState } from 'react';
import { GoogleMapWrapper, GoogleMap } from '../components';
import { calculateRoute } from '../utils/routeUtils';

const RouteMap: React.FC = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  // Initialize directions renderer when map loads
  const handleMapLoad = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    const renderer = new google.maps.DirectionsRenderer({
      map: mapInstance,
      suppressMarkers: true,
    });
    setDirectionsRenderer(renderer);
  };

  // Calculate and display a route
  const showRoute = async (origin: string, destination: string) => {
    if (!map || !directionsRenderer) return;

    try {
      const directions = await calculateRoute(origin, destination);
      directionsRenderer.setDirections(directions);
    } catch (error) {
      console.error('Error calculating route:', error);
      // Handle error
    }
  };

  return (
    <div>
      <GoogleMapWrapper>
        <GoogleMap
          center={{ lat: 61.2181, lng: -149.9003 }}
          zoom={10}
          style={{ height: '500px', width: '100%' }}
          onLoad={handleMapLoad}
        />
      </GoogleMapWrapper>

      <div className="route-controls">
        <button onClick={() => showRoute('Anchorage, AK', 'Palmer, AK')}>
          Show Route to Palmer
        </button>
      </div>
    </div>
  );
};

export default RouteMap;
```

## Error Handling

Our implementation includes robust error handling for common Google Maps issues:

### Map Loading Errors

The `GoogleMapWrapper` component handles API loading errors and provides appropriate feedback.

### Map Rendering Errors

The `GoogleMap` component has built-in error recovery for common rendering issues.

### API Request Errors

Service methods like geocoding and route calculation have error handling through our patching system.

## Advanced Usage

### Custom Markers

```typescript
// Create a custom marker icon
const createCustomMarker = (position: google.maps.LatLng, vehicle: VehicleData) => {
  return new google.maps.Marker({
    position,
    icon: {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 5,
      fillColor: vehicle.status === 'active' ? '#4CAF50' : '#FFC107',
      fillOpacity: 0.8,
      strokeWeight: 1,
      rotation: vehicle.heading || 0
    },
    title: vehicle.name,
    zIndex: vehicle.priority || 1
  });
};
```

### Geofencing

```typescript
// Create a geofence circle
const createGeofence = (map: google.maps.Map, center: google.maps.LatLng, radius: number) => {
  return new google.maps.Circle({
    map,
    center,
    radius,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35
  });
};

// Check if a point is within the geofence
const isPointInGeofence = (point: google.maps.LatLng, geofence: google.maps.Circle) => {
  const center = geofence.getCenter();
  const radius = geofence.getRadius();
  const distance = google.maps.geometry.spherical.computeDistanceBetween(point, center);
  return distance <= radius;
};
```

### Clustered Markers for Performance

```typescript
// Using MarkerClusterer for better performance with many markers
import { MarkerClusterer } from '@googlemaps/markerclusterer';

const setupClusteredMarkers = (map: google.maps.Map, locations: any[]) => {
  const markers = locations.map(location => {
    return new google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      title: location.name
    });
  });

  return new MarkerClusterer({
    map,
    markers,
    algorithm: new SuperClusterAlgorithm({
      radius: 100,
      maxZoom: 15
    })
  });
};
```

## Troubleshooting

### Common Issues and Solutions

1. **"Google Maps API is not loaded"**
   - Check if your API key is correct
   - Verify that the key has the right permissions
   - Make sure the necessary APIs are enabled in Google Cloud Console

2. **"Google Maps Map is not a constructor"**
   - This is handled by our patching system, but can occur if the API loads incorrectly
   - The application will automatically attempt to reload the API up to 3 times
   - If the issue persists, try clearing browser cache or using a different browser

3. **Map shows "For development purposes only"**
   - Your API key is missing billing information or has domain restrictions
   - Follow the steps in the [Google Maps documentation](https://developers.google.com/maps/documentation/javascript/error-messages#for-development-purposes-only) to resolve

4. **Performance issues with many markers**
   - Use the MarkerClusterer as shown in the Advanced Usage section
   - Consider implementing viewport-based loading of markers
   - Use simplified marker icons for distant markers

### Debugging Tools

Our Google Maps integration includes debugging tools:

```typescript
// Enable debug mode to see detailed logs
window.GOOGLE_MAPS_DEBUG = true;
```

When debug mode is enabled, you'll see detailed logs in the console about:
- API loading process
- Map initialization
- Error recovery attempts
- Service method calls and responses

---

This comprehensive guide should help your team successfully integrate and maintain Google Maps functionality in the Matanuska Transport Application. For further assistance or custom functionality, refer to the [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript/overview).
