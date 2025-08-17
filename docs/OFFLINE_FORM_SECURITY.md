# Offline Form Security Implementation Guide

## Overview

This document outlines security concerns and implementation details for the `useOfflineForm` hook, which handles form submissions in both online and offline scenarios. Proper security measures are essential since this hook interacts with external APIs and persists data locally.

## Current Security Concerns

1. **Input Validation**: The current mock implementation lacks proper validation for form data and IDs
2. **Collection Path Validation**: No validation for collection paths which could lead to path traversal issues
3. **Data Sanitization**: No sanitization of user inputs before storage or submission
4. **Token Handling**: No secure handling of authentication tokens for delayed submissions
5. **Data Encryption**: Sensitive offline data is not encrypted in local storage

## Implementation Recommendations

### Input Validation

Replace the current implementation with proper validation:

```typescript
// Add Zod schema validation
import { z } from 'zod';

// Define reusable schemas for different form types
const vehicleSchema = z.object({
  id: z.string().optional(),
  registrationNumber: z.string().min(1, "Registration number is required"),
  vehicleType: z.enum(["truck", "van", "car"]),
  // Add more fields as needed
});

const tripSchema = z.object({
  id: z.string().optional(),
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  driverId: z.string().min(1, "Driver ID is required"),
  startTime: z.number().int().positive(),
  // Add more fields as needed
});

// In the useOfflineForm hook:
const validateFormData = (data: unknown, formType: string): any => {
  try {
    switch (formType) {
      case 'vehicle':
        return vehicleSchema.parse(data);
      case 'trip':
        return tripSchema.parse(data);
      default:
        // Generic validation for unknown forms
        return z.object({}).passthrough().parse(data);
    }
  } catch (error) {
    throw new Error(`Validation failed: ${error.message}`);
  }
};
```

### Collection Path Security

Implement path validation:

```typescript
const validateCollectionPath = (path: string): string => {
  // Check for path traversal attempts
  if (path.includes('..') || path.includes('~') || !path.match(/^[a-zA-Z0-9-_/]+$/)) {
    throw new Error('Invalid collection path');
  }
  return path;
};
```

### Secure Data Storage

Use encrypted storage for offline data:

```typescript
import { encrypt, decrypt } from '../utils/encryption';

const storeOfflineData = async (data: any, collectionPath: string, id?: string): Promise<void> => {
  try {
    // Generate a unique ID if none provided
    const documentId = id || generateUniqueId();

    // Encrypt sensitive data before storage
    const encryptedData = await encrypt(JSON.stringify(data));

    // Store in IndexedDB with metadata
    await offlineDb.put('pendingChanges', {
      id: documentId,
      collection: collectionPath,
      data: encryptedData,
      timestamp: Date.now(),
      operation: 'create'
    });
  } catch (error) {
    console.error('Failed to store offline data:', error);
    throw error;
  }
};
```

### Secure Token Handling

Add secure token refresh for delayed submissions:

```typescript
const getSecureToken = async (): Promise<string> => {
  try {
    // Check if we have a valid token in secure storage
    const tokenData = await secureStorage.getItem('auth_token');

    if (tokenData) {
      const { token, expiry } = JSON.parse(tokenData);

      // If token is still valid, return it
      if (expiry > Date.now()) {
        return token;
      }
    }

    // If no valid token, try to refresh silently
    return await refreshAuthToken();
  } catch (error) {
    // Handle token error - user may need to re-authenticate
    throw new Error('Authentication required');
  }
};
```

## Securing API Interactions

When the form is eventually submitted to the backend:

```typescript
const submitToApi = async (data: any, collectionPath: string, id?: string): Promise<any> => {
  try {
    const token = await getSecureToken();

    // API URL should be from a trusted source, not constructed from user input
    const apiEndpoint = `${API_BASE_URL}/${collectionPath}`;

    const response = await fetch(apiEndpoint, {
      method: id ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        // Add CSRF token if applicable
        'X-CSRF-Token': await getCSRFToken(),
      },
      // Set appropriate credentials mode
      credentials: 'same-origin',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Log error and queue for retry if network-related
    if (error instanceof TypeError && error.message.includes('network')) {
      await queueForRetry(data, collectionPath, id);
    }
    throw error;
  }
};
```

## Rate Limiting Client-Side

Prevent abuse of the sync mechanism:

```typescript
const syncManager = (() => {
  let syncAttempts = 0;
  const maxSyncAttempts = 5;
  let lastSyncTime = 0;
  const minTimeBetweenSyncs = 60000; // 1 minute

  return {
    canSync: (): boolean => {
      const now = Date.now();
      if (syncAttempts >= maxSyncAttempts && (now - lastSyncTime) < 3600000) {
        return false; // Exceeded max attempts in the last hour
      }

      if ((now - lastSyncTime) < minTimeBetweenSyncs) {
        return false; // Too soon since last sync
      }

      return true;
    },
    recordSyncAttempt: () => {
      syncAttempts++;
      lastSyncTime = Date.now();
    },
    resetSyncAttempts: () => {
      syncAttempts = 0;
    }
  };
})();
```

## Testing Recommendations

1. **Security Testing**: Add tests to verify that invalid inputs are rejected
2. **Penetration Testing**: Test for path traversal and injection vulnerabilities
3. **Offline Security**: Test security of offline stored data

## Implementation Checklist

- [ ] Add schema validation for all form types
- [ ] Implement path validation to prevent traversal attacks
- [ ] Add data encryption for offline storage
- [ ] Implement secure token handling
- [ ] Add rate limiting for sync operations
- [ ] Add comprehensive error handling
- [ ] Test security measures thoroughly

## Related Files

- `/src/hooks/useOfflineForm.ts` - Main implementation
- `/src/hooks/useOfflineFormMock.ts` - Mock for testing
- `/src/utils/encryption.ts` - Encryption utilities
- `/src/utils/validation.ts` - Validation schemas
