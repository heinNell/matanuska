# Google Maps Integration Guide for Matanuska Transport Application

This guide explains how to properly integrate and use Google Maps in the Matanuska Transport application, including solutions for common issues like the "Google Maps is not a constructor" error.

## Table of Contents

- [Overview](#overview)
- [Key Components](#key-components)
- [Common Issues & Solutions](#common-issues--solutions)
- [Usage Guide](#usage-guide)
- [Implementation Examples](#implementation-examples)
- [Troubleshooting](#troubleshooting)

## Overview

The Matanuska Transport application uses Google Maps for displaying location data, routes, and other geospatial information. The integration has been enhanced with error detection, loading management, and automatic recovery from common issues.

## Key Components

### 1. GoogleMapWrapper

A higher-order component that ensures Google Maps API is loaded before rendering map components:

- Manages API loading state
- Displays loading and error states
- Ensures the Google Maps API is fully initialized

### 2. GoogleMap

A ready-to-use Map component with proper error handling:

- Pre-configured with sensible defaults
- Handles map initialization errors
- Provides simple props for customization

### 3. Google Maps API Patch (googleMapsApiPatch.ts)

Fixes common Google Maps loading issues:

- Fixes "Google Maps is not a constructor" error
- Handles cases where the Map constructor is undefined or broken
- Detects and removes duplicate script tags
- Provides automatic recovery by reloading the API when issues are detected

## Common Issues & Solutions

### "Google Maps is not a constructor" Error

This error occurs when:
- The Google Maps API didn't fully load before being used
- Multiple instances of the Google Maps API script are loaded
- The API key is invalid or has domain restrictions

Our solution:
- The `GoogleMapWrapper` ensures the API is fully loaded before rendering
- The `googleMapsApiPatch.ts` detects when the constructor is missing and attempts to reload the API
- Script duplication is detected and prevented

### Multiple API Loads

Our patch detects and fixes this by:
- Monitoring script additions to the DOM
- Removing duplicate scripts
- Using cache-busting parameters for clean reloads

## Usage Guide

### Basic Map Implementation

```tsx
import React from 'react';
import { GoogleMapWrapper } from '../components/GoogleMapWrapper';
import { GoogleMap } from '../components/GoogleMap';
import '../utils/googleMapsApiPatch';

const SimpleMapExample: React.FC = () => {
  return (
    <GoogleMapWrapper>
      <GoogleMap
        center={{ lat: 51.5074, lng: -0.1278 }}
        zoom={10}
        style={{ height: '400px', width: '100%' }}
        onLoad={(map) => console.log('Map loaded!')}
      />
    </GoogleMapWrapper>
  );
};

export default SimpleMapExample;
```

### Adding Markers

```tsx
import React, { useState, useEffect } from 'react';
import { GoogleMapWrapper } from '../components/GoogleMapWrapper';
import { GoogleMap } from '../components/GoogleMap';

const MapWithMarkers: React.FC = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (!map) return;

    // Add a marker
    const marker = new google.maps.Marker({
      position: { lat: 51.5074, lng: -0.1278 },
      map: map,
      title: 'London'
    });

    return () => {
      // Clean up
      marker.setMap(null);
    };
  }, [map]);

  return (
    <GoogleMapWrapper>
      <GoogleMap
        onLoad={setMap}
        style={{ height: '400px' }}
      />
    </GoogleMapWrapper>
  );
};
```

## Implementation Examples

See the comprehensive example in `src/examples/MapExample.tsx` which demonstrates:
- Using the GoogleMapWrapper and GoogleMap components
- Adding and removing markers
- Handling map bounds
- Managing map events

## Troubleshooting

### Map Still Doesn't Display

1. Check your browser console for errors
2. Verify your Google Maps API key is valid
3. Check if the API key has the right permissions and domain restrictions
4. Try clearing your browser cache
5. Ensure `googleMapsApiPatch.ts` is imported in your app

### API Key Issues

If your API key isn't working:
1. Verify it's correctly set in your environment variables (`VITE_GOOGLE_MAPS_API_KEY`)
2. Check that the key has the Maps JavaScript API enabled
3. Ensure billing is set up in your Google Cloud account
4. Check domain restrictions in the Google Cloud Console

### Performance Issues

If maps are loading slowly:
1. Use `libraries` prop to load only what you need
2. Implement map lazy loading (only load when in viewport)
3. Use markers clustering for large datasets

## Advanced Configuration

The `GoogleMapWrapper` and `GoogleMap` components accept various props for customization. See the component TypeScript interfaces for details:

- `GoogleMapWrapperProps`
- `MapProps`

## Further Resources

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript/overview)
- [Google Maps API Key Setup Guide](https://developers.google.com/maps/documentation/javascript/get-api-key)
