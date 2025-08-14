# Offline-First Capabilities Documentation

This document outlines the offline-first capabilities implemented in the Matanuska Fleet Manager application.

## Overview

The application implements a robust offline-first approach that allows users to continue working even when internet connectivity is limited or unavailable. Key features include:

1. Real-time network status monitoring
2. Offline data caching
3. Offline operation queuing
4. Automatic synchronization when connectivity is restored
5. User-friendly offline indicators

## Components and Utilities

### Network Detection (`networkDetection.ts`)

The network detection utility provides accurate information about the current network state beyond the browser's basic online/offline events:

- Detects various network states: online, offline, limited connectivity
- Actively tests connections to Firebase and other essential endpoints
- Measures connection quality (good, poor, bad)
- Provides real-time updates through a subscription model

```typescript
import { subscribeToNetworkChanges, getNetworkState } from './utils/networkDetection';

// Get current state
const networkState = getNetworkState();

// Subscribe to changes
const unsubscribe = subscribeToNetworkChanges((state) => {
  console.log('Network status changed:', state);
});
```

### Offline Cache (`offlineCache.ts`)

Provides IndexedDB-based caching for data persistence:

- Stores query results for offline access
- Implements time-to-live (TTL) cache expiration
- Manages cache invalidation
- Handles cache storage constraints

```typescript
import { cacheData, getCachedData } from './utils/offlineCache';

// Cache data
await cacheData('collection/document', params, data, 3600000); // 1 hour TTL

// Retrieve cached data
const data = await getCachedData('collection/document', params);
```

### Offline Operations (`offlineOperations.ts`)

Manages CRUD operations with offline support:

- Queues create, update, and delete operations when offline
- Persists operations in IndexedDB
- Automatically retries operations when connectivity is restored
- Handles conflict resolution

```typescript
import { saveDocument, deleteDocument } from './utils/offlineOperations';

// Save (create or update) with offline support
await saveDocument('trips', tripId, tripData);

// Delete with offline support
await deleteDocument('trips', tripId);

// Manually sync pending operations
await syncOfflineOperations();
```

## React Hooks

### `useNetworkStatus`

A React hook for monitoring network status:

```typescript
import useNetworkStatus from './hooks/useNetworkStatus';

function MyComponent() {
  const network = useNetworkStatus();
  
  return (
    <div>
      {network.isOffline && <p>You are offline</p>}
      {network.isLimited && <p>Limited connectivity</p>}
      {network.isOnline && <p>You are online</p>}
    </div>
  );
}
```

### `useOfflineQuery`

A React hook for querying Firestore with offline support:

```typescript
import useOfflineQuery from './hooks/useOfflineQuery';
import { where } from 'firebase/firestore';

function TripsList() {
  const { data, loading, error } = useOfflineQuery(
    'trips', 
    [where('status', '==', 'active')],
    { cacheTtl: 3600000 } // 1 hour
  );
  
  // Render data...
}
```

### `useOfflineForm`

A React hook for handling form submissions with offline support:

```typescript
import useOfflineForm from './hooks/useOfflineForm';

function TripForm() {
  const { submit, remove, isSubmitting, isOfflineOperation } = useOfflineForm({
    collectionPath: 'trips',
    showOfflineWarning: true
  });
  
  const handleSubmit = async (formData) => {
    await submit(formData, tripId);
  };
  
  // Form rendering...
}
```

## UI Components

### `ConnectionStatusIndicator`

Provides real-time feedback about connection status:

- Shows different icons and colors based on connection status
- Displays connection quality information
- Allows manual reconnection attempts

### `OfflineBanner`

Shows a prominent banner when the application is offline:

- Appears automatically when offline
- Shows sync status when reconnecting
- Allows manual reconnection attempts
- Can be dismissed by the user

## Best Practices for Working Offline

1. **Use Offline Hooks**: Always use `useOfflineQuery` and `useOfflineForm` instead of direct Firestore calls when handling data that should work offline.

2. **Handle Conflicts**: When implementing forms, consider how conflicts will be resolved when changes are synced.

3. **Prioritize Critical Data**: Set appropriate TTL values for cached data based on importance.

4. **Provide Clear Feedback**: Always inform users when they're working in offline mode and when data will be synced.

5. **Test Offline Scenarios**: Regularly test the application with network connectivity disabled to ensure proper functioning.

## Implementation Example

Here's a complete example of implementing offline-first capabilities in a component:

```tsx
import React, { useState } from 'react';
import useOfflineQuery from '../hooks/useOfflineQuery';
import useOfflineForm from '../hooks/useOfflineForm';
import useNetworkStatus from '../hooks/useNetworkStatus';
import { where } from 'firebase/firestore';

const TripsManager = () => {
  const [tripData, setTripData] = useState({});
  const network = useNetworkStatus();
  
  // Query with offline support
  const { data: trips, loading } = useOfflineQuery(
    'trips',
    [where('userId', '==', 'current-user-id')],
    { cacheTtl: 24 * 60 * 60 * 1000 } // 24 hours
  );
  
  // Form submission with offline support
  const { 
    submit, 
    remove, 
    isSubmitting, 
    isOfflineOperation 
  } = useOfflineForm({
    collectionPath: 'trips',
    showOfflineWarning: true,
    onSuccess: () => {
      // Handle success
    }
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit(tripData);
  };
  
  return (
    <div>
      {network.isOffline && (
        <div className="bg-yellow-100 p-2 rounded">
          You are offline. Your changes will be saved when you reconnect.
        </div>
      )}
      
      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? 'Saving...' 
            : isOfflineOperation 
              ? 'Save (Offline)' 
              : 'Save'
          }
        </button>
      </form>
      
      {/* Trip list */}
      {loading ? (
        <p>Loading trips...</p>
      ) : (
        <ul>
          {trips?.map(trip => (
            <li key={trip.id}>
              {trip.title}
              <button onClick={() => remove(trip.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

## Limitations and Considerations

1. **Storage Limits**: IndexedDB has storage limitations that vary by browser and device.

2. **Conflict Resolution**: The current implementation uses a "last write wins" approach for conflict resolution.

3. **Complex Queries**: Some complex Firestore queries may not work identically when using cached data.

4. **Data Security**: Sensitive data stored in the offline cache should be considered when implementing security measures.

5. **Battery Usage**: Active network monitoring can impact battery life on mobile devices, so the check interval is set to a reasonable default.
