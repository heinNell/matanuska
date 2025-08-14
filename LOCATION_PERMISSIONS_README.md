# Google Maps with Location Permissions

This guide explains the integration of Google Maps with proper location permissions handling in your Capacitor app.

## Android Setup

### 1. Location Permissions

We've added the following location permissions to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

### 2. Location Permission Helper

We've created a `LocationPermissionHelper.java` class to handle Android runtime permissions for location. This class provides:

- Methods to check for location permissions
- Methods to request location permissions
- Callbacks for permission grant/denial

### 3. MainActivity Updates

The `MainActivity.java` has been updated to:

- Initialize the location permission helper
- Request location permissions at app startup
- Handle permission request results

## JavaScript/TypeScript Integration

### 1. Location Permissions Helper

We've created a TypeScript utility (`/src/utils/locationPermissions.ts`) that provides:

- Cross-platform location permission checking
- Permission requesting
- Current position acquisition

### 2. Google Maps Component

We've created a demo component (`/src/components/maps/GoogleMapsLocationDemo.tsx`) that:

- Handles location permissions
- Displays a map centered on user location (when permissions are granted)
- Falls back to a default location when permissions are denied
- Includes a "My Location" button

### 3. Capacitor Plugin Configuration

We've updated `capacitor.config.ts` to configure the Geolocation plugin with Android-specific settings.

## Usage

To use the Google Maps integration in your pages:

```tsx
import GoogleMapsLocationDemo from "../components/maps/GoogleMapsLocationDemo";

function MyPage() {
  return (
    <div>
      <h1>My Map Page</h1>
      <GoogleMapsLocationDemo />
    </div>
  );
}
```

## Additional Required Setup

1. **Google Maps API Key**:
   - Add your Google Maps API key to `.env.local`
   - Make sure the API key has the necessary permissions (Maps JavaScript API, Geocoding API)

2. **Sync Capacitor**:
   - After making these changes, run: `npm run cap:sync`

3. **Testing in Android**:
   - To test on an Android device/emulator: `npm run cap:open`

## Troubleshooting

- **Location permissions denied**: Ensure location services are enabled on the device
- **Map not displaying**: Verify your Google Maps API key is correct and has the appropriate permissions
- **"My Location" button not working**: Check that location permissions are granted and location services are enabled
