# Firebase Integration Guide

This document provides information on how the Firebase integration is set up for the fleet management application.

## Firebase Setup Overview

The app is configured to use Firebase for backend services including:

- Authentication
- Firestore Database
- Realtime Database
- Cloud Storage
- Cloud Functions
- Firebase Analytics

## Android Integration

Firebase is integrated into the Android app using the following components:

1. **google-services.json** - Contains the Firebase configuration for the Android app
2. **build.gradle** - Contains the Google Services plugin and Firebase SDK dependencies

## Firebase Initialization

### Client-Side Initialization

Firebase is initialized for client-side use in the `src/api/firebase.ts` file, which:

- Initializes the Firebase app
- Exports Firebase service objects (auth, db, storage, rtdb, functions, analytics)
- Uses direct configuration for simplified setup

```typescript
// From src/api/firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyBtq7Z6qqaVmb22d3aNcwNiqkrbGtIhJ7g",
  authDomain: "mat1-9e6b3.firebaseapp.com",
  databaseURL: "https://mat1-9e6b3-default-rtdb.firebaseio.com",
  projectId: "mat1-9e6b3",
  storageBucket: "mat1-9e6b3.appspot.com",
  messagingSenderId: "250085264089",
  appId: "1:250085264089:web:51c2b209e0265e7d04ccc8",
  measurementId: "G-YHQHSJN5CQ",
};
```

### Server-Side Initialization (Admin SDK)

Firebase Admin SDK is initialized in `src/api/firebaseAdmin.ts` for server-side operations with elevated privileges:

- Uses service account credentials for secure, server-side operations
- Handles initialization in different environments (development, production, serverless)
- Includes database secret key for additional security
- Exports admin services (auth, db, storage, rtdb)

## Usage in the Application

### Using Firebase Services Directly

To use Firebase services directly in your application components:

```typescript
import { auth, db, storage, rtdb } from "../api/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { signInWithEmailAndPassword } from "firebase/auth";

// Example: Authenticate a user
const loginUser = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Login error:", error);
  }
};

// Example: Read data from Firestore
const getTripData = async (tripId: string) => {
  try {
    const tripRef = doc(db, "trips", tripId);
    const tripSnap = await getDoc(tripRef);
    return tripSnap.exists() ? tripSnap.data() : null;
  } catch (error) {
    console.error("Error getting trip data:", error);
    return null;
  }
};

// Example: Real-time updates from Realtime Database
const subscribeToVehicleLocation = (vehicleId: string, callback: (location: any) => void) => {
  const locationRef = ref(rtdb, `locations/${vehicleId}`);
  return onValue(locationRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
};
```

### Using Helper Functions

For common operations, you can use the Firebase helper functions in `src/api/firebaseHelpers.ts`:

```typescript
import {
  getDocument,
  getCollection,
  createDocument,
  updateDocument,
  queryDocuments,
  getRealtimeData,
} from "../api/firebaseHelpers";

// Get a trip by ID
const trip = await getDocument("trips", tripId);

// Get all active trips
const activeTrips = await queryDocuments("trips", [
  { field: "status", operator: "==", value: "active" },
]);

// Create a new trip
const newTrip = await createDocument("trips", {
  driver: "John Doe",
  vehicle: "ABC123",
  status: "pending",
});

// Get current vehicle locations
const locations = await getRealtimeData("locations");
```

````

## Offline Support

The application implements offline capabilities through custom hooks:
- `useOfflineQuery` for fetching data with offline caching
- `useOfflineForm` for submitting form data with offline queuing

## Firebase Emulator

For local development, you can use Firebase Emulators:

```bash
# Start Firebase emulators
npm run start:emulators
````

## Deployment

Firebase deployment can be done using the Firebase CLI:

```bash
# Deploy to Firebase
npm run firebase:deploy
```

## Server-Side Operations

For server-side operations with elevated privileges (like admin tasks, background jobs, or API endpoints), use the Firebase Admin SDK:

```typescript
import { admin, db, auth } from "../api/firebaseAdmin";

// Example server-side function to verify user roles
export const verifyUserRole = async (uid: string) => {
  const userDoc = await db.collection("users").doc(uid).get();
  if (!userDoc.exists) {
    throw new Error("User not found");
  }
  return userDoc.data()?.role || "user";
};

// Example server-side function to create a user with custom claims
export const createUserWithRole = async (email: string, password: string, role: string) => {
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false,
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    await db.collection("users").doc(userRecord.uid).set({
      email,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return userRecord;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
```

## Data Structure

The application uses the following main Firestore collections:

- **trips**: Trip information including routes, status, driver, vehicle
- **vehicles**: Vehicle information, maintenance records
- **tyres**: Tyre inventory and management
- **invoices**: Invoice processing and tracking
- **drivers**: Driver information and documentation

## Security Considerations

- The client-side Firebase configuration is publicly visible but restricted by Firebase Security Rules
- The server-side Firebase Admin SDK uses a service account with elevated privileges
- Firebase Security Rules are defined in `firestore.rules` and control access to data
- Use environment variables for sensitive configuration in production environments

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase React Hooks](https://github.com/CSFrequency/react-firebase-hooks)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
