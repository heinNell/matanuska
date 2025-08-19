// Note: Firestore is initialized later with initializeFirestore and local cache settings.

import { getAnalytics } from "firebase/analytics";
import { FirebaseOptions, getApps, initializeApp, FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  collectionGroup,
  connectFirestoreEmulator,
  deleteDoc,
  disableNetwork,
  doc,
  enableNetwork,
  getDoc,
  getDocs,
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  onSnapshot,
  orderBy,
  persistentLocalCache,
  persistentMultipleTabManager,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Firestore,
} from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";

// Import types
import {
  Tyre,
  TyreConditionStatus,
  TyreMountStatus,
  TyreStatus,
  TyreStoreLocation,
} from "./data/tyreData";
import { DieselConsumptionRecord } from "./types/diesel";
import { Trip } from "./types/trip";
import { TyreInspectionRecord } from "./types/tyre-inspection";

// =============================================================================
// TYPESCRIPT ENUMS (if not already defined in imported types)
// =============================================================================

// These are fallbacks in case the imported enums are not available
// The actual enums from the imports should be used when available

// =============================================================================
// FIREBASE CONFIGURATION
// =============================================================================

// Development configuration - only used in development mode
const devConfig: FirebaseOptions = {
  apiKey: "AIzaSyBtq7Z6qqaVmb22d3aNcwNiqkrbGtIhJ7g",
  authDomain: "mat1-9e6b3.firebaseapp.com",
  databaseURL: "https://mat1-9e6b3-default-rtdb.firebaseio.com",
  projectId: "mat1-9e6b3",
  storageBucket: "mat1-9e6b3.appspot.com",
  messagingSenderId: "250085264089",
  appId: "1:250085264089:web:51c2b209e0265e7d04ccc8",
  measurementId: "G-YHQHSJN5CQ",
};

// Get Firebase configuration based on environment
const getFirebaseConfig = (): FirebaseOptions => {
  // In development, we can use the dev config or env vars if present
  if (import.meta.env.DEV) {
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || devConfig.apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || devConfig.authDomain,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || devConfig.databaseURL,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || devConfig.projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || devConfig.storageBucket,
      messagingSenderId:
        import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || devConfig.messagingSenderId,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || devConfig.appId,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || devConfig.measurementId,
    };

    console.log("Using development Firebase configuration");
    return config;
  }

  // In production, strictly require environment variables with no fallbacks
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  return config;
};

// Get the appropriate config based on environment
export const firebaseConfig = getFirebaseConfig();

// Validate the configuration
const validateConfig = () => {
  const requiredFields = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];
  const missingFields = requiredFields.filter(
    (field) => !firebaseConfig[field as keyof typeof firebaseConfig]
  );

  if (missingFields.length > 0) {
    if (import.meta.env.DEV) {
      console.warn("⚠️ Missing Firebase configuration fields:", missingFields.join(", "));
      return true; // Continue in development even with missing fields
    } else {
      // In production, throw an error for missing configuration
      const errorMessage = `Firebase initialization failed. Missing required configuration: ${missingFields.join(", ")}`;
      console.error(errorMessage);
      // We'll log the error but not throw to prevent app crash
      console.error(
        "Ensure all Firebase environment variables are set in your production environment"
      );
      return false;
    }
  }
  return true;
};

validateConfig();

// Initialize Firebase with the appropriate configuration - only if not already initialized
export const firebaseApp: FirebaseApp = (() => {
  const existingApps = getApps();
  return existingApps.length === 0 ? initializeApp(firebaseConfig) : (existingApps[0] as FirebaseApp);
})();


// =============================================================================
// FIREBASE SERVICES
// =============================================================================

// Initialize Firebase services
// Firestore: prefer persistent IndexedDB cache (multi-tab). Fallbacks ensure robust behavior in
// unsupported environments (e.g., private mode, SSR, older browsers).
let firestore: Firestore;
try {
  if (typeof window !== "undefined") {
    try {
      firestore = initializeFirestore(firebaseApp, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch (e) {
      console.warn("IndexedDB persistence unavailable; falling back to in-memory cache.", e);
      try {
        firestore = initializeFirestore(firebaseApp, {
          localCache: memoryLocalCache(),
        });
      } catch (e2) {
        console.warn(
          "initializeFirestore with memory cache failed; falling back to default getFirestore().",
          e2
        );
        firestore = getFirestore(firebaseApp);
      }
    }
  } else {
    // SSR/build environments
    firestore = getFirestore(firebaseApp);
  }
} catch (e) {
  // As a last resort, ensure firestore is available to prevent app crash
  console.error("🔥 Firestore initialization failed; using default instance.", e);
  firestore = getFirestore(firebaseApp);
}
export { firestore };
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);
export const functions = getFunctions(firebaseApp);

// -----------------------------------------------------------------------------
// OPTIONAL: Connect to local emulators when running locally (http, localhost)
// Controlled via VITE_USE_EMULATORS to avoid accidental emulator usage.
// Ports read from firebase.json (firestore:8081, auth:9099, functions:8888, storage:9198)
// -----------------------------------------------------------------------------
(() => {
  if (typeof window === "undefined") return; // SSR / build safeguard
  const isLocalHttp =
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
    window.location.protocol === "http:";
  if (!isLocalHttp) return;
  if (import.meta.env.VITE_USE_EMULATORS !== "true") return;
  try {
    // Firestore
    try {
      connectFirestoreEmulator(firestore, "127.0.0.1", 8081);
    } catch {
      /* already connected */
    }
    try {
      connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    } catch {
      /* already */
    }
    try {
      connectFunctionsEmulator(functions, "127.0.0.1", 8888);
    } catch {
      /* already */
    }
    try {
      connectStorageEmulator(storage, "127.0.0.1", 9198);
    } catch {
      /* already */
    }
    console.info("✅ Connected Firebase services to local emulators");
  } catch (err) {
    console.warn("⚠️ Failed to connect one or more Firebase emulators:", err);
  }
})();

// Add analytics in browser environment only
let analytics: any;
if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
  analytics = getAnalytics(firebaseApp);
}
export { analytics };

// Collection references for easy access
export const tripsCollection = collection(firestore, "trips");
export const dieselCollection = collection(firestore, "diesel");
export const missedLoadsCollection = collection(firestore, "missedLoads");
export const systemConfigCollection = collection(firestore, "systemConfig");
export const activityLogsCollection = collection(firestore, "activityLogs");
export const driverBehaviorCollection = collection(firestore, "driverBehavior");
// Legacy alias kept for backward compatibility & migration clarity
export const driverBehaviorLegacyCollection = driverBehaviorCollection;
// New root collection for month-subcollection schema
export const DRIVER_BEHAVIOR_EVENTS_ROOT = "driverBehaviorEvents";
export const actionItemsCollection = collection(firestore, "actionItems");
export const carReportsCollection = collection(firestore, "carReports");
export const tyresCollection = collection(firestore, "tyres");

// Real-time connection status handlers
export const enableFirestoreNetwork = () => enableNetwork(firestore);
export const disableFirestoreNetwork = () => disableNetwork(firestore);

// Alternative exports for compatibility with existing code
export const db = firestore; // For backward compatibility, aliasing firestore as db

// Offline persistence is configured via initializeFirestore localCache above. No extra call needed.

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Helper function to remove undefined values from objects before saving to Firestore.
 * Firestore will throw an error if an object contains undefined values.
 */
export const cleanUndefinedValues = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanUndefinedValues);
  }

  if (typeof obj === "object") {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefinedValues(value);
      }
    }
    return cleaned;
  }

  return obj;
};

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Handles Firestore errors, providing a more detailed console message.
 */
export const handleFirestoreError = async (error: any) => {
  console.error("Firestore error:", error);

  if (error.code === "unavailable") {
    console.log("Firestore is currently unavailable. Working offline...");
  } else if (error.code === "permission-denied") {
    console.error("Permission denied. Check Firestore rules.");
  } else if (error.code === "not-found") {
    console.error("Document not found.");
  }

  // Log the error for auditing purposes if possible
  try {
    await addDoc(activityLogsCollection, {
      type: "error",
      errorCode: error.code,
      errorMessage: error.message,
      timestamp: serverTimestamp(),
    });
  } catch (logError) {
    // Silent fail if we can't log the error
    console.warn("Could not log error to Firestore:", logError);
  }

  return Promise.resolve();
};

// =============================================================================
// AUDIT LOG FUNCTIONS
// =============================================================================

/**
 * Logs an activity to the `activityLogs` collection.
 * This function provides an audit trail for data changes.
 */
export const logActivity = async (
  action: string,
  entityId: string,
  entityType: string,
  data: any
): Promise<void> => {
  try {
    const cleanedData = cleanUndefinedValues({
      action,
      entityId,
      entityType,
      data,
      timestamp: serverTimestamp(),
      userId: auth.currentUser?.uid || "unknown",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    });

    await addDoc(activityLogsCollection, cleanedData);
  } catch (error) {
    console.warn("⚠️ Failed to log activity:", error);
    // Don't throw - activity logging shouldn't break the main operation
  }
};

export const addAuditLogToFirebase = async (auditLogData: any) => {
  try {
    const auditLogsRef = collection(firestore, "auditLogs");
    const docRef = await addDoc(auditLogsRef, {
      ...auditLogData,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    console.log("Audit log added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding audit log:", error);
    await handleFirestoreError(error);
    throw error;
  }
};

// =============================================================================
// DIESEL MANAGEMENT FUNCTIONS
// =============================================================================

export const addDieselToFirebase = async (dieselRecord: DieselConsumptionRecord) => {
  try {
    const dieselWithTimestamp = cleanUndefinedValues({
      ...dieselRecord,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const dieselRef = dieselRecord.id
      ? doc(firestore, "diesel", dieselRecord.id)
      : doc(collection(firestore, "diesel"));

    const dieselId = dieselRecord.id || dieselRef.id;

    await setDoc(dieselRef, {
      ...dieselWithTimestamp,
      id: dieselId,
    });

    console.log("✅ Diesel record added with ID:", dieselId);
    await logActivity("diesel_created", dieselId, "diesel", dieselRecord);

    return dieselId;
  } catch (error) {
    console.error("Error adding diesel record:", error);
    await handleFirestoreError(error);
    throw error;
  }
};

export async function updateDieselInFirebase(
  dieselId: string,
  dieselData: Partial<DieselConsumptionRecord>
) {
  try {
    const dieselRef = doc(firestore, "diesel", dieselId);
    const updateData = cleanUndefinedValues({
      ...dieselData,
      updatedAt: serverTimestamp(),
    });

    await updateDoc(dieselRef, updateData);
    console.log("✅ Diesel record updated with ID:", dieselId);

    await logActivity("diesel_updated", dieselId, "diesel", updateData);

    return dieselId;
  } catch (error) {
    console.error("Error updating diesel record:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

export async function deleteDieselFromFirebase(dieselId: string) {
  try {
    const dieselRef = doc(firestore, "diesel", dieselId);
    await deleteDoc(dieselRef);
    console.log("✅ Diesel record deleted with ID:", dieselId);

    await logActivity("diesel_deleted", dieselId, "diesel", {
      deletedAt: new Date().toISOString(),
    });

    return dieselId;
  } catch (error) {
    console.error("Error deleting diesel record:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

export const listenToDieselRecords = (
  callback: (records: DieselConsumptionRecord[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const q = query(dieselCollection, orderBy("date", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const records: DieselConsumptionRecord[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Calculate totalCost from existing data if not present
        const calculatedTotalCost =
          data.totalCost ||
          (data.litresFilled && data.costPerLitre ? data.litresFilled * data.costPerLitre : 0);

        // Cast the entire data object to the correct type after including required fields
        records.push({
          id: doc.id,
          ...data,
          // Ensure required fields have fallbacks if not in data
          fleetNumber: data.fleetNumber || "Unknown",
          driverName: data.driverName || "Unknown",
          date: data.date || new Date().toISOString(),
          litresFilled: data.litresFilled || 0,
          odometerReading: data.odometerReading || 0,
          costPerLitre: data.costPerLitre || 0,
          // Add missing required properties
          totalCost: calculatedTotalCost,
          fuelStation: data.fuelStation || "Unknown",
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as DieselConsumptionRecord);
      });

      console.log(`🔄 Real-time diesel records update: ${records.length} records loaded`);
      callback(records);
    },
    (error) => {
      console.error("❌ Real-time diesel listener error:", error);
      if (onError) onError(error);
      handleFirestoreError(error);
    }
  );
};

// =============================================================================
// TRIP MANAGEMENT FUNCTIONS
// =============================================================================

export const addTripToFirebase = async (trip: Trip) => {
  try {
    const tripWithTimestamp = cleanUndefinedValues({
      ...trip,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      version: 1,
    });

    const tripRef = trip.id
      ? doc(firestore, "trips", trip.id)
      : doc(collection(firestore, "trips"));

    const tripId = trip.id || tripRef.id;

    await setDoc(tripRef, {
      ...tripWithTimestamp,
      id: tripId,
    });

    console.log("✅ Trip added with ID:", tripId);
    await logActivity("trip_created", tripId, "trip", trip);

    return tripId;
  } catch (error) {
    console.error("Error adding trip:", error);
    await handleFirestoreError(error);
    throw error;
  }
};

export async function updateTripInFirebase(tripId: string, tripData: Partial<Trip>) {
  try {
    const tripRef = doc(firestore, "trips", tripId);
    const updateData = cleanUndefinedValues({
      ...tripData,
      updatedAt: serverTimestamp(),
    });

    await updateDoc(tripRef, updateData);
    console.log("✅ Trip updated with ID:", tripId);

    await logActivity("trip_updated", tripId, "trip", updateData);

    return tripId;
  } catch (error) {
    console.error("Error updating trip:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

export async function deleteTripFromFirebase(tripId: string) {
  try {
    const tripRef = doc(firestore, "trips", tripId);
    await deleteDoc(tripRef);
    console.log("✅ Trip deleted with ID:", tripId);

    await logActivity("trip_deleted", tripId, "trip", { deletedAt: new Date().toISOString() });

    return tripId;
  } catch (error) {
    console.error("Error deleting trip:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

export const listenToTrips = (
  callback: (trips: Trip[]) => void,
  onError?: (error: Error) => void,
  filters?: { status?: string }
): (() => void) => {
  // Build query based on filters
  let q = query(tripsCollection, orderBy("startDate", "desc"));

  if (filters?.status) {
    q = query(q, where("status", "==", filters.status));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const trips: Trip[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        trips.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamps to ISO strings
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Trip);
      });

      console.log(`🔄 Real-time trips update: ${trips.length} trips loaded`);
      callback(trips);
    },
    (error) => {
      console.error("❌ Real-time trips listener error:", error);
      if (onError) onError(error);
      handleFirestoreError(error);
    }
  );
};

// =============================================================================
// MISSED LOAD FUNCTIONS
// =============================================================================

export const addMissedLoadToFirebase = async (missedLoadData: any) => {
  try {
    const loadWithTimestamp = cleanUndefinedValues({
      ...missedLoadData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const docRef = await addDoc(missedLoadsCollection, loadWithTimestamp);
    console.log("✅ Missed load added with ID:", docRef.id);

    await logActivity("missed_load_created", docRef.id, "missed_load", missedLoadData);

    return docRef.id;
  } catch (error) {
    console.error("Error adding missed load:", error);
    await handleFirestoreError(error);
    throw error;
  }
};

export async function updateMissedLoadInFirebase(missedLoadId: string, missedLoadData: any) {
  try {
    const missedLoadRef = doc(firestore, "missedLoads", missedLoadId);
    const updateData = cleanUndefinedValues({
      ...missedLoadData,
      updatedAt: serverTimestamp(),
    });

    await updateDoc(missedLoadRef, updateData);
    console.log("✅ Missed load updated with ID:", missedLoadId);

    await logActivity("missed_load_updated", missedLoadId, "missed_load", updateData);

    return missedLoadId;
  } catch (error) {
    console.error("Error updating missed load:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

export async function deleteMissedLoadFromFirebase(missedLoadId: string) {
  try {
    const missedLoadRef = doc(firestore, "missedLoads", missedLoadId);
    await deleteDoc(missedLoadRef);
    console.log("✅ Missed load deleted with ID:", missedLoadId);

    await logActivity("missed_load_deleted", missedLoadId, "missed_load", {
      deletedAt: new Date().toISOString(),
    });

    return missedLoadId;
  } catch (error) {
    console.error("Error deleting missed load:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

export const listenToMissedLoads = (
  callback: (loads: any[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const q = query(missedLoadsCollection, orderBy("recordedAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const loads: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loads.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        });
      });

      console.log(`🔄 Real-time missed loads update: ${loads.length} loads loaded`);
      callback(loads);
    },
    (error) => {
      console.error("❌ Real-time missed loads listener error:", error);
      if (onError) onError(error);
      handleFirestoreError(error);
    }
  );
};

// =============================================================================
// DRIVER BEHAVIOR FUNCTIONS
// =============================================================================

// === Driver Behavior Events helpers (month-subcollection schema) ===
interface DBEventPathArgs {
  fleetNumber: string; // e.g. "21H"
  eventType: string; // e.g. "Fatigue Alert"
  eventDate: string; // "YYYY/MM/DD"
  eventTime: string; // "HH:MM" (retain colon in doc id)
}

export function buildDriverBehaviorDocRef(args: DBEventPathArgs) {
  // Ensure all path segments are definite strings to satisfy typings and avoid runtime issues
  const [yearRaw, monthRaw, dayRaw] = (args.eventDate ?? "").split("/");
  const year = yearRaw || "0000";
  const month = monthRaw || "01";
  const day = dayRaw || "01";
  const eventCategory = `${args.fleetNumber}_${args.eventType}_${year}`; // parent doc id
  const docId = `${day}_${args.eventTime}`; // keep colon → "20_17:23"
  const fullPath = `${DRIVER_BEHAVIOR_EVENTS_ROOT}/${eventCategory}/${month}/${docId}`;
  return doc(firestore, fullPath);
}

export async function updateDriverBehaviorEventInFirebase(
  args: DBEventPathArgs,
  patch: Record<string, any>
): Promise<string> {
  const ref = buildDriverBehaviorDocRef(args);
  const updateData = cleanUndefinedValues({ ...patch, updatedAt: serverTimestamp() });
  await updateDoc(ref, updateData);
  console.log("✅ Driver behavior event updated at:", ref.path);
  await logActivity("driver_behavior_updated", ref.path, "driver_behavior", updateData);
  return ref.id;
}

export const addDriverBehaviorEventToFirebase = async (eventData: any) => {
  try {
    const ref = buildDriverBehaviorDocRef({
      fleetNumber: eventData.fleetNumber,
      eventType: eventData.eventType,
      eventDate: eventData.eventDate,
      eventTime: eventData.eventTime,
    });

    const payload = cleanUndefinedValues({
      ...eventData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      importSource: eventData.importSource ?? "web_book",
      uniqueKey: `${eventData.fleetNumber}_${eventData.eventType}_${eventData.eventDate}_${eventData.eventTime}`,
    });

    await setDoc(ref, payload, { merge: true });
    console.log("✅ Driver behavior event saved at:", ref.path);
    await logActivity("driver_behavior_created", ref.path, "driver_behavior", eventData);
    return ref.id;
  } catch (error) {
    console.error("Error adding driver behavior event:", error);
    await handleFirestoreError(error);
    throw error;
  }
};

// Legacy listener retained (top-level collection). Prefer listenToDriverBehaviorEventsAllMonths.
export function listenToDriverBehaviorEvents(
  callback: (events: any[]) => void,
  onError?: (error: Error) => void
): () => void {
  console.warn(
    "⚠️ listenToDriverBehaviorEvents (legacy) uses top-level 'driverBehavior'. Use listenToDriverBehaviorEventsAllMonths for new schema."
  );
  const q = query(driverBehaviorLegacyCollection, orderBy("eventDate", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const events: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        events.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        });
      });
      callback(events);
    },
    (error) => {
      if (onError) onError(error as Error);
      handleFirestoreError(error);
    }
  );
}

// New aggregated listener querying month collection groups (01..12) individually
export function listenToDriverBehaviorEventsAllMonths(
  onBatch: (events: any[]) => void,
  onError?: (err: Error) => void
): () => void {
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const unsubs: Array<() => void> = [];
  months.forEach((mm) => {
    const q = query(
      collectionGroup(firestore, mm),
      where("importSource", "==", "web_book"),
      orderBy("createdAt", "desc")
    );
    unsubs.push(
      onSnapshot(
        q,
        (snap) => {
          const batch: any[] = [];
          snap.forEach((d) => {
            const data: any = d.data();
            batch.push({
              id: d.id,
              ...data,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
              updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
              _path: d.ref.path,
            });
          });
          onBatch(batch);
        },
        (err) => {
          console.error(`❌ driverBehavior month ${mm} listener error:`, err);
          onError?.(err as any);
          handleFirestoreError(err);
        }
      )
    );
  });
  return () => unsubs.forEach((u) => u());
}

// Utility: one-off fixer to convert createdAt string to Timestamp for a known doc
export async function fixCreatedAtString(
  fleet: string,
  eventType: string,
  year: string,
  month: string,
  docId: string
) {
  const ref = doc(
    firestore,
    DRIVER_BEHAVIOR_EVENTS_ROOT,
    `${fleet}_${eventType}_${year}`,
    month,
    docId
  );
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data: any = snap.data();
    if (typeof data.createdAt === "string") {
      await updateDoc(ref, { createdAt: Timestamp.fromDate(new Date(data.createdAt)) });
      console.log("✅ Fixed createdAt for", ref.path);
    }
  }
}

// =============================================================================
// TYRE MANAGEMENT FUNCTIONS
// =============================================================================

/**
 * Listen to tyres collection in real-time
 * @param callback Function to call when tyres data changes
 * @returns Unsubscribe function to stop listening
 */
export function listenToTyres(
  callback: (tyres: Tyre[]) => void,
  onError?: (error: Error) => void
): () => void {
  // Query with sorting for consistent ordering
  const q = query(tyresCollection, orderBy("updatedAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const tyres = snapshot.docs.map((doc) => {
        const data = doc.data();
        // Convert Firestore Timestamps to standard dates
        if (data.createdAt) {
          data.createdAt = data.createdAt.toDate
            ? data.createdAt.toDate().toISOString()
            : data.createdAt;
        }
        if (data.updatedAt) {
          data.updatedAt = data.updatedAt.toDate
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt;
        }
        return { id: doc.id, ...data } as Tyre;
      });
      callback(tyres);
    },
    (error) => {
      console.error("Error listening to tyres:", error);
      if (onError) onError(error);
      handleFirestoreError(error);
    }
  );
}

/**
 * Add or update a tyre document in Firestore
 */
export async function saveTyre(tyre: Tyre): Promise<string> {
  try {
    // Validate essential tyre data
    if (!tyre.serialNumber || !tyre.brand || !tyre.size) {
      throw new Error("Missing required tyre fields: serialNumber, brand, or size");
    }

    const tyreRef = tyre.id
      ? doc(firestore, "tyres", tyre.id)
      : doc(collection(firestore, "tyres"));

    const tyreId = tyre.id || tyreRef.id;

    // Add ID and timestamps if this is a new tyre
    const tyreData = cleanUndefinedValues({
      ...tyre,
      id: tyreId,
      updatedAt: serverTimestamp(),
      createdAt: tyre.createdAt || serverTimestamp(),
    });

    await setDoc(tyreRef, tyreData);
    console.log("✅ Tyre saved with ID:", tyreId);

    await logActivity("tyre_saved", tyreId, "tyre", tyre);

    return tyreId;
  } catch (error) {
    console.error("Error saving tyre:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Get a tyre by ID
 */
export async function getTyreById(tyreId: string): Promise<Tyre | null> {
  try {
    const tyreRef = doc(firestore, "tyres", tyreId);
    const tyreSnap = await getDoc(tyreRef);

    if (!tyreSnap.exists()) {
      return null;
    }

    // Cast data to Tyre, handling potential Timestamp conversion
    const data = tyreSnap.data();
    if (data.createdAt && typeof data.createdAt.toDate === "function") {
      data.createdAt = data.createdAt.toDate().toISOString();
    }
    if (data.updatedAt && typeof data.updatedAt.toDate === "function") {
      data.updatedAt = data.updatedAt.toDate().toISOString();
    }

    return { id: tyreSnap.id, ...data } as Tyre;
  } catch (error) {
    console.error("Error getting tyre by ID:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Get all tyres with optional filtering
 */
export async function getTyres(filters?: {
  status?: TyreStatus;
  mountStatus?: TyreMountStatus;
  brand?: string;
  location?: TyreStoreLocation;
  vehicleId?: string;
  condition?: TyreConditionStatus;
  minTreadDepth?: number;
  maxTreadDepth?: number;
}): Promise<Tyre[]> {
  try {
    let queryObject = query(tyresCollection);

    // Apply filters if provided
    if (filters) {
      if (filters.status) {
        queryObject = query(queryObject, where("status", "==", filters.status));
      }
      if (filters.mountStatus) {
        queryObject = query(queryObject, where("mountStatus", "==", filters.mountStatus));
      }
      if (filters.brand) {
        queryObject = query(queryObject, where("brand", "==", filters.brand));
      }
      if (filters.location) {
        queryObject = query(queryObject, where("location", "==", filters.location));
      }
      if (filters.vehicleId) {
        queryObject = query(queryObject, where("installation.vehicleId", "==", filters.vehicleId));
      }
      if (filters.condition) {
        queryObject = query(queryObject, where("condition.status", "==", filters.condition));
      }
      // Add sorting by default
      queryObject = query(queryObject, orderBy("updatedAt", "desc"));
    } else {
      // Default sorting if no filters
      queryObject = query(tyresCollection, orderBy("updatedAt", "desc"));
    }

    const querySnapshot = await getDocs(queryObject);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      // Convert any Firestore Timestamps to ISO strings
      if (data.createdAt && typeof data.createdAt.toDate === "function") {
        data.createdAt = data.createdAt.toDate().toISOString();
      }
      if (data.updatedAt && typeof data.updatedAt.toDate === "function") {
        data.updatedAt = data.updatedAt.toDate().toISOString();
      }
      return { id: doc.id, ...data } as Tyre;
    });
  } catch (error) {
    console.error("Error getting tyres:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Delete a tyre
 */
export async function deleteTyre(tyreId: string): Promise<void> {
  try {
    const tyreRef = doc(firestore, "tyres", tyreId);
    await deleteDoc(tyreRef);
    console.log("✅ Tyre deleted with ID:", tyreId);

    await logActivity("tyre_deleted", tyreId, "tyre", { deletedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Error deleting tyre:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Add a tyre inspection record
 */
export async function addTyreInspection(
  tyreId: string,
  inspection: TyreInspectionRecord
): Promise<string> {
  try {
    if (!tyreId) {
      throw new Error("Tyre ID is required");
    }

    // Validate inspection data
    if (
      !inspection.inspectionDate ||
      !inspection.inspectorName ||
      inspection.treadDepth === undefined
    ) {
      throw new Error("Inspection requires date, inspector and tread depth");
    }

    // Add to inspections subcollection
    const inspectionsRef = collection(firestore, "tyres", tyreId, "inspections");
    const inspectionDoc = inspection.id ? doc(inspectionsRef, inspection.id) : doc(inspectionsRef);

    const inspectionId = inspection.id || inspectionDoc.id;

    const inspectionData = cleanUndefinedValues({
      ...inspection,
      id: inspectionId,
      createdAt: serverTimestamp(),
    });

    await setDoc(inspectionDoc, inspectionData);

    // Update the tyre document with latest inspection results
    const tyreRef = doc(firestore, "tyres", tyreId);
    await updateDoc(tyreRef, {
      "condition.treadDepth": inspection.treadDepth,
      "condition.pressure": inspection.pressure,
      "condition.lastInspectionDate": inspection.inspectionDate,
      updatedAt: serverTimestamp(),
    });

    console.log("✅ Tyre inspection added with ID:", inspectionId);

    await logActivity("tyre_inspection_added", inspectionId, "tyre_inspection", {
      tyreId,
      inspection,
    });

    return inspectionId;
  } catch (error) {
    console.error("Error adding tyre inspection:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Get all inspections for a tyre
 */
export async function getTyreInspections(tyreId: string): Promise<TyreInspectionRecord[]> {
  try {
    const inspectionsRef = collection(firestore, "tyres", tyreId, "inspections");
    const q = query(inspectionsRef, orderBy("inspectionDate", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      if (data.createdAt && typeof data.createdAt.toDate === "function") {
        data.createdAt = data.createdAt.toDate().toISOString();
      }
      return { id: doc.id, ...data } as TyreInspectionRecord;
    });
  } catch (error) {
    console.error("Error getting tyre inspections:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Get tyres mounted on a specific vehicle
 */
export async function getTyresByVehicle(vehicleId: string): Promise<Tyre[]> {
  try {
    const q = query(
      tyresCollection,
      where("mountStatus", "==", TyreMountStatus.MOUNTED),
      where("installation.vehicleId", "==", vehicleId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      if (data.createdAt && typeof data.createdAt.toDate === "function") {
        data.createdAt = data.createdAt.toDate().toISOString();
      }
      if (data.updatedAt && typeof data.updatedAt.toDate === "function") {
        data.updatedAt = data.updatedAt.toDate().toISOString();
      }
      return { id: doc.id, ...data } as Tyre;
    });
  } catch (error) {
    console.error("Error getting tyres by vehicle:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Get tyre statistics for dashboard
 */
export async function getTyreStats(): Promise<{
  total: number;
  mounted: number;
  inStock: number;
  needsAttention: number;
  byBrand: Record<string, number>;
  byCondition: Record<string, number>;
}> {
  try {
    const totalSnapshot = await getDocs(tyresCollection);
    const mountedSnapshot = await getDocs(
      query(tyresCollection, where("mountStatus", "==", TyreMountStatus.MOUNTED))
    );
    const inStockSnapshot = await getDocs(
      query(tyresCollection, where("mountStatus", "==", TyreMountStatus.IN_STORAGE))
    );
    const needsAttentionSnapshot = await getDocs(
      query(
        tyresCollection,
        where("condition.status", "in", [
          TyreConditionStatus.CRITICAL,
          TyreConditionStatus.NEEDS_REPLACEMENT,
        ])
      )
    );

    // Get brand distribution
    const byBrand: Record<string, number> = {};
    totalSnapshot.docs.forEach((doc) => {
      const brand = doc.data().brand || "Unknown";
      byBrand[brand] = (byBrand[brand] || 0) + 1;
    });

    // Get condition distribution
    const byCondition: Record<string, number> = {};
    totalSnapshot.docs.forEach((doc) => {
      const condition = doc.data().condition?.status || "Unknown";
      byCondition[condition] = (byCondition[condition] || 0) + 1;
    });

    return {
      total: totalSnapshot.size,
      mounted: mountedSnapshot.size,
      inStock: inStockSnapshot.size,
      needsAttention: needsAttentionSnapshot.size,
      byBrand,
      byCondition,
    };
  } catch (error) {
    console.error("Error getting tyre stats:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

// =============================================================================
// DYNAMIC IMPORTS FOR CODE SPLITTING
// =============================================================================

// These functions provide a way to dynamically load specific services
// This helps with code splitting and reduces initial bundle size

/**
 * Listen to tyre stores collection in real-time
 * @param callback Function to call when tyre stores data changes
 * @param onError Optional function to call on error
 * @returns Unsubscribe function to stop listening
 */
export function listenToTyreStores(
  callback: (stores: any[]) => void,
  onError?: (error: Error) => void
): () => void {
  const tyreStoresCollection = collection(firestore, "tyreStores");
  const q = query(tyreStoresCollection, orderBy("updatedAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const stores = snapshot.docs.map((doc) => {
        const data = doc.data();
        // Convert Firestore Timestamps to standard dates
        if (data.createdAt) {
          data.createdAt = data.createdAt.toDate
            ? data.createdAt.toDate().toISOString()
            : data.createdAt;
        }
        if (data.updatedAt) {
          data.updatedAt = data.updatedAt.toDate
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt;
        }
        return { id: doc.id, ...data };
      });
      console.log(`🔄 Real-time tyre stores update: ${stores.length} stores loaded`);
      callback(stores);
    },
    (error) => {
      console.error("❌ Real-time tyre stores listener error:", error);
      if (onError) onError(error);
      handleFirestoreError(error);
    }
  );
}

export const addTyreStore = async (store: any) => {
  try {
    const storeWithTimestamp = cleanUndefinedValues({
      ...store,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const storeRef = store.id
      ? doc(firestore, "tyreStores", store.id)
      : doc(collection(firestore, "tyreStores"));

    const storeId = store.id || storeRef.id;

    await setDoc(storeRef, {
      ...storeWithTimestamp,
      id: storeId,
    });

    console.log("✅ Tyre store added with ID:", storeId);
    await logActivity("tyre_store_created", storeId, "tyre_store", store);

    return storeId;
  } catch (error) {
    console.error("Error adding tyre store:", error);
    await handleFirestoreError(error);
    throw error;
  }
};

export const updateTyreStoreEntry = async (storeId: string, entry: any) => {
  try {
    const storeRef = doc(firestore, "tyreStores", storeId);
    const storeSnap = await getDoc(storeRef);

    if (!storeSnap.exists()) {
      throw new Error(`Store ${storeId} not found`);
    }

    const storeData = storeSnap.data();
    const entries = storeData.entries || [];

    // Find if entry with this tyreId already exists
    const existingIndex = entries.findIndex((e: any) => e.tyreId === entry.tyreId);

    if (existingIndex >= 0) {
      // Update existing entry
      entries[existingIndex] = { ...entries[existingIndex], ...entry };
    } else {
      // Add new entry
      entries.push(entry);
    }

    await updateDoc(storeRef, {
      entries,
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Entry for tyre ${entry.tyreId} updated in store ${storeId}`);
    await logActivity("tyre_store_entry_updated", storeId, "tyre_store_entry", entry);

    return entry.tyreId;
  } catch (error) {
    console.error("Error updating tyre store entry:", error);
    await handleFirestoreError(error);
    throw error;
  }
};

export const loadTyreServices = () => import("./types/tyreStores");
export const loadTyreDataServices = () => import("./types/tyres");
export const loadTripServices = () => import("./types/trip");
export const loadDieselServices = () => import("./types/trip"); // Fallback to trip types temporarily
// Fix path to match actual file location - corrected from DriverBehavior to match casing/structure
export const loadDriverBehavior = () => import("./types/trip"); // Fallback to trip types temporarily
export const loadAuditServices = () => import("./types/trip"); // Fallback to trip types temporarily until audit types are created

// =============================================================================
// RE-EXPORTS FOR BACKWARD COMPATIBILITY
// =============================================================================

// Re-export Firebase modules for convenience
export {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
};

// Export Firebase app as default
export default firebaseApp;
