# API Security Review: Offline Form Components

## Overview

This review focuses on the security aspects of the offline form functionality in the Matanuska application, particularly the `useOfflineForm` hook and related components. The offline form system allows users to submit data even when offline, which presents unique security challenges.

## Current Implementation Analysis

The current mock implementation (`useOfflineFormMock.ts`) has several security concerns:

1. **No Input Validation**: Accepts any data (`any` type) without validation
2. **No Authentication Persistence**: No mechanism to securely store auth tokens for delayed submissions
3. **No Data Encryption**: Sensitive form data stored locally without encryption
4. **Path Validation Missing**: Collection paths aren't validated, potentially allowing path traversal
5. **No Sanitization**: User inputs aren't sanitized before storage or submission

## Security Enhancement Recommendations

### 1. Input Validation and Sanitization

**Priority: Critical**

Implement robust input validation using Zod schemas for all form data:

```typescript
import { z } from "zod";

// Define type-specific validation schemas
const fleetFormSchema = z.object({
  vehicleId: z.string().uuid(),
  registrationNumber: z.string().min(3).max(20),
  vehicleType: z.enum(["truck", "van", "car"]),
  // Additional properties with validation
});

// Use in form submission
const submit = async (data: unknown) => {
  try {
    // Validate against schema
    const validatedData = fleetFormSchema.parse(data);
    // Proceed with validated data
  } catch (error) {
    // Handle validation errors
  }
};
```

**Verification**: Create test script `scripts/verify-form-validation.js` to test all form schemas.

### 2. Secure Token Storage

**Priority: Critical**

Store authentication tokens securely for offline operations:

```typescript
// Secure storage with encryption
const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    // Use Web Crypto API for encryption before storage
    const encryptedValue = await encryptData(value);
    localStorage.setItem(key, encryptedValue);
  },

  async getItem(key: string): Promise<string | null> {
    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) return null;

    // Decrypt the value
    return await decryptData(encryptedValue);
  }
};

// Store token with expiry
const storeAuthToken = async (token: string, expiresIn: number): Promise<void> => {
  const tokenData = {
    value: token,
    expiry: Date.now() + expiresIn * 1000
  };

  await secureStorage.setItem('auth_token', JSON.stringify(tokenData));
};
```

**Verification**: Run `scripts/token-storage-test.js` to verify token encryption.

### 3. Data Encryption for Offline Storage

**Priority: High**

Implement encryption for sensitive data stored offline:

```typescript
// Web Crypto API-based encryption helpers
const encryptData = async (plaintext: string): Promise<string> => {
  // Generate a secure encryption key
  const key = await generateEncryptionKey();

  // Convert text to ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // Generate initialization vector
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  // Combine IV and encrypted data and convert to base64
  const encryptedArray = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  encryptedArray.set(iv);
  encryptedArray.set(new Uint8Array(encryptedBuffer), iv.length);

  return btoa(String.fromCharCode.apply(null, [...encryptedArray]));
};

// Add decryption function as well
```

**Verification**: Create `scripts/offline-data-security.js` to test data encryption/decryption.

### 4. Path Validation and Sanitization

**Priority: High**

Validate collection paths to prevent path traversal:

```typescript
const validatePath = (path: string): string => {
  // Check for path traversal patterns
  if (!path || typeof path !== 'string' || path.includes('..')) {
    throw new Error('Invalid collection path');
  }

  // Validate path format
  if (!path.match(/^[a-zA-Z0-9-_/]+$/)) {
    throw new Error('Collection path contains invalid characters');
  }

  return path;
};
```

**Verification**: Run `scripts/path-validation-test.js` to test path validation.

### 5. Rate Limiting for Sync Operations

**Priority: Medium**

Implement client-side rate limiting to prevent API abuse:

```typescript
const createRateLimiter = (maxRequests: number, timeWindowMs: number) => {
  const requests: number[] = [];

  return {
    canMakeRequest: (): boolean => {
      const now = Date.now();
      const windowStart = now - timeWindowMs;

      // Remove expired timestamps
      while (requests.length > 0 && requests[0] < windowStart) {
        requests.shift();
      }

      return requests.length < maxRequests;
    },

    recordRequest: (): void => {
      requests.push(Date.now());
    }
  };
};

// Usage
const syncLimiter = createRateLimiter(5, 60000); // 5 requests per minute
```

**Verification**: Create `scripts/rate-limit-simulation.js` to test rate limiting.

## Wialon Integration Security

For Wialon SDK integration:

1. **Secure Token Storage**: Store Wialon token server-side only
   ```typescript
   // REMOVE FROM CLIENT CODE
   // const wialonToken = "abc123"; // INSECURE

   // Server-side function to get token
   const getWialonToken = async () => {
     const response = await fetch('/api/wialon/token', {
       credentials: 'same-origin',
       headers: {
         'Authorization': `Bearer ${await getAuthToken()}`
       }
     });

     if (!response.ok) throw new Error('Failed to get Wialon token');
     const data = await response.json();
     return data.token;
   };
   ```
   **Verification**: Run `scripts/verify-ui-connections.js` to check for token exposure.

2. **SDK Lifecycle Management**: Properly initialize and teardown the SDK
   ```typescript
   // Safe SDK initialization
   let sdkInitialized = false;

   export const initWialonSDK = async () => {
     if (sdkInitialized) return;

     // Load from trusted source
     const script = document.createElement('script');
     script.src = 'https://sdk.wialon.com/wsdk/script/wialon.min.js';
     script.crossOrigin = 'anonymous';
     script.integrity = 'sha384-expectedHash';

     document.head.appendChild(script);

     return new Promise<void>((resolve, reject) => {
       script.onload = () => {
         sdkInitialized = true;
         resolve();
       };
       script.onerror = () => reject(new Error('Failed to load Wialon SDK'));
     });
   };

   export const teardownWialonSDK = () => {
     if (!sdkInitialized) return;

     // Clean up resources
     if (window.wialon && typeof window.wialon.core.Session.getInstance().logout === 'function') {
       window.wialon.core.Session.getInstance().logout();
     }

     sdkInitialized = false;
   };
   ```
   **Verification**: Create `scripts/test-sdk-lifecycle.js` to validate proper SDK loading.

## Google Maps Integration Security

For Google Maps integration:

1. **API Key Protection**: Secure the Google Maps API key
   ```typescript
   // Server-side function to get key with restrictions
   export const getMapsApiKey = functions.https.onCall(async (data, context) => {
     // Verify authentication
     if (!context.auth) {
       throw new functions.https.HttpsError(
         'unauthenticated',
         'User must be authenticated'
       );
     }

     // Log usage for monitoring
     await admin.firestore().collection('api-key-usage').add({
       user: context.auth.uid,
       service: 'google-maps',
       timestamp: admin.firestore.FieldValue.serverTimestamp()
     });

     // Return API key with HTTP referrer restrictions
     return {
       apiKey: functions.config().maps.api_key
     };
   });
   ```
   **Verification**: Run `scripts/verify-api-key-security.js` to test API key protection.

2. **Safe Rendering for Large Datasets**: Implement proper pagination and clustering
   ```typescript
   // Paginated marker rendering
   const renderMapMarkers = (markers, map, maxMarkersPerView = 500) => {
     // If too many markers, use clustering
     if (markers.length > maxMarkersPerView) {
       return new MarkerClusterer({
         map,
         markers: markers.map(data => new google.maps.Marker({
           position: data.position,
           title: data.title
         }))
       });
     }

     // Otherwise render individual markers
     return markers.map(data => new google.maps.Marker({
       position: data.position,
       title: data.title,
       map
     }));
   };
   ```
   **Verification**: Create `scripts/map-rendering-test.js` to verify safe rendering.

## Implementation Plan

1. **Immediate Actions** (1-2 days):
   - Add validation to existing form components
   - Fix path validation in useOfflineForm hook
   - Add basic data sanitization

2. **Short-term Improvements** (1 week):
   - Implement secure token storage
   - Add client-side rate limiting
   - Remove any exposed API keys or tokens

3. **Medium-term Enhancements** (2-4 weeks):
   - Implement full data encryption for offline storage
   - Add comprehensive logging and monitoring
   - Create security verification scripts

## Security Verification Scripts

1. Create `scripts/verify-form-security.js`:
   ```javascript
   const { validateFormData, validatePath } = require('../src/utils/validation');

   // Test form validation
   console.log('Testing form validation...');
   try {
     // Valid data
     validateFormData({ name: 'Test Vehicle', type: 'truck' }, 'vehicle');
     console.log('✅ Valid data passed');

     // Invalid data
     try {
       validateFormData({ type: 'invalid-type' }, 'vehicle');
       console.log('❌ Validation failed to catch invalid data');
     } catch (e) {
       console.log('✅ Invalid data correctly rejected');
     }

     // Path validation
     try {
       validatePath('../etc/passwd');
       console.log('❌ Path validation failed to catch path traversal');
     } catch (e) {
       console.log('✅ Path traversal correctly rejected');
     }

     console.log('Security verification completed.');
   } catch (error) {
     console.error('Verification failed:', error);
     process.exit(1);
   }
   ```

2. Create `scripts/route-audit.cjs` to check for proper route protection:
   ```javascript
   const fs = require('fs');
   const path = require('path');

   // Scan route files
   const routeFiles = [
     'src/App.tsx',
     'src/router/index.ts',
     // Add other route files
   ];

   console.log('Auditing routes for proper authentication...');

   // Check each file
   let unprotectedRoutes = [];

   routeFiles.forEach(file => {
     const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

     // Look for routes without authentication
     const routes = content.match(/<Route[^>]*path="([^"]*)"[^>]*>/g) || [];

     routes.forEach(route => {
       // Check if route is protected
       if (!route.includes('element={<Protected') &&
           !route.includes('element={<Auth') &&
           !route.includes('loader={authLoader}')) {
         const pathMatch = route.match(/path="([^"]*)"/);
         const path = pathMatch ? pathMatch[1] : 'unknown';
         unprotectedRoutes.push({ file, path });
       }
     });
   });

   // Report findings
   if (unprotectedRoutes.length > 0) {
     console.log('⚠️ Found unprotected routes:');
     unprotectedRoutes.forEach(({ file, path }) => {
       console.log(`- ${path} in ${file}`);
     });
     process.exit(1);
   } else {
     console.log('✅ All routes properly protected');
   }
   ```

## Conclusion

Implementing these security enhancements for the offline form functionality will significantly improve the overall security posture of the Matanuska application. The focus should be on proper validation, secure storage of sensitive data, and protection of API keys and tokens.

The verification scripts provided will help ensure that security measures are properly implemented and maintained as the codebase evolves.
