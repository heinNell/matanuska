import {
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
  where, // Added 'where' for filtering tyres
} from "firebase/firestore";
import { firestore, handleFirestoreError } from "../utils/firebaseConnectionHandler";
import {
  StockEntry,
  Tyre, // Import Tyre from the consolidated types file
  TyreInspectionRecord,
  TyreStore,
} from "./tyre"; // All types should now come from here

// --- Tyre Management Functions ---

/**
 * Saves a Tyre document to Firestore. If the tyre has an ID, it updates the existing document;
 * otherwise, it creates a new one.
 * @param tyre The Tyre object to save.
 * @returns A Promise that resolves with the ID of the saved tyre.
 */
export async function saveTyre(tyre: Tyre): Promise<string> {
  try {
    const tyreRef = tyre.id ? doc(firestore, "tyres", tyre.id) : doc(collection(firestore, "tyres"));
    const dataToSave = {
      ...tyre,
      updatedAt: serverTimestamp(),
      // Ensure createdAt is only set on initial creation
      ...(tyre.id ? {} : { createdAt: serverTimestamp() }),
    };

    await setDoc(tyreRef, dataToSave, { merge: true }); // Use merge to update existing fields
    return tyreRef.id;
  } catch (error) {
    console.error("Error saving tyre:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Retrieves a single Tyre document by its ID.
 * @param id The ID of the tyre to retrieve.
 * @returns A Promise that resolves with the Tyre object or null if not found.
 */
export async function getTyreById(id: string): Promise<Tyre | null> {
  try {
    const tyreRef = doc(firestore, "tyres", id);
    const snap = await getDoc(tyreRef);

    if (!snap.exists()) return null;

    return { id: snap.id, ...snap.data() } as Tyre;
  } catch (error) {
    console.error("Error getting tyre by ID:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Retrieves all Tyre documents.
 * @param filters Optional filters to apply to the query.
 * @returns A Promise that resolves with an array of Tyre objects.
 */
export async function getTyres(filters?: {
  status?: Tyre['status'];
  mountStatus?: Tyre['mountStatus'];
  brand?: string;
  location?: Tyre['location'];
  vehicleId?: string;
  condition?: string; // Assuming condition is a simple string for filtering
  minTreadDepth?: number;
  maxTreadDepth?: number;
}): Promise<Tyre[]> {
  try {
    let q = query(collection(firestore, "tyres"), orderBy("createdAt", "desc"));

    if (filters) {
      if (filters.status) {
        q = query(q, where("status", "==", filters.status));
      }
      if (filters.mountStatus) {
        q = query(q, where("mountStatus", "==", filters.mountStatus));
      }
      if (filters.brand) {
        q = query(q, where("brand", "==", filters.brand));
      }
      if (filters.location) {
        q = query(q, where("location", "==", filters.location));
      }
      if (filters.vehicleId) {
        q = query(q, where("installation.vehicleId", "==", filters.vehicleId));
      }
      if (filters.condition) {
        q = query(q, where("condition.status", "==", filters.condition));
      }
      if (filters.minTreadDepth) {
        q = query(q, where("condition.treadDepth", ">=", filters.minTreadDepth));
      }
      if (filters.maxTreadDepth) {
        q = query(q, where("condition.treadDepth", "<=", filters.maxTreadDepth));
      }
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Tyre);
  } catch (error) {
    console.error("Error getting tyres:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Deletes a Tyre document by its ID.
 * @param id The ID of the tyre to delete.
 * @returns A Promise that resolves when the tyre is deleted.
 */
export async function deleteTyre(id: string): Promise<void> {
  try {
    const tyreRef = doc(firestore, "tyres", id);
    await deleteDoc(tyreRef);
  } catch (error) {
    console.error("Error deleting tyre:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Adds a new inspection record to a specific tyre's subcollection.
 * @param tyreId The ID of the tyre to add the inspection to.
 * @param inspection The TyreInspectionRecord object to add.
 * @returns A Promise that resolves with the ID of the added inspection.
 */
export async function addTyreInspection(
  tyreId: string,
  inspection: TyreInspectionRecord // Expect TyreInspectionRecord here
): Promise<string> {
  try {
    const inspectionsCollectionRef = collection(firestore, "tyres", tyreId, "inspections");
    const docRef = doc(inspectionsCollectionRef); // Let Firestore generate the ID
    const dataToSave = {
      ...inspection,
      id: docRef.id, // Assign the generated ID to the inspection object
      createdAt: serverTimestamp(),
    };
    await setDoc(docRef, dataToSave);
    return docRef.id;
  } catch (error) {
    console.error("Error adding tyre inspection:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Retrieves all inspection records for a specific tyre.
 * @param tyreId The ID of the tyre to retrieve inspections for.
 * @returns A Promise that resolves with an array of TyreInspectionRecord objects.
 */
export async function getTyreInspections(tyreId: string): Promise<TyreInspectionRecord[]> {
  try {
    const inspectionsCollectionRef = collection(firestore, "tyres", tyreId, "inspections");
    const q = query(inspectionsCollectionRef, orderBy("date", "desc")); // Order by inspection date

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as TyreInspectionRecord);
  } catch (error) {
    console.error("Error getting tyre inspections:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Retrieves all Tyre documents associated with a specific vehicle.
 * @param vehicleId The ID of the vehicle.
 * @returns A Promise that resolves with an array of Tyre objects.
 */
export async function getTyresByVehicle(vehicleId: string): Promise<Tyre[]> {
  try {
    const q = query(collection(firestore, "tyres"), where("installation.vehicleId", "==", vehicleId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Tyre);
  } catch (error) {
    console.error("Error getting tyres by vehicle:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Listens to real-time updates for all Tyre documents.
 * @param onChange Callback function that receives the updated array of Tyre objects.
 * @returns An unsubscribe function to stop listening to updates.
 */
export function listenToTyres(onChange: (tyres: Tyre[]) => void) {
  try {
    const collRef = collection(firestore, "tyres");
    const q = query(collRef, orderBy("createdAt", "desc")); // Order by creation date

    return onSnapshot(
      q,
      (snapshot) => {
        const tyres: Tyre[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          // Convert Firestore Timestamps to Date objects if necessary for display
          // (though it's often better to handle this in components or context if needed)
          return { id: doc.id, ...data } as Tyre;
        });
        onChange(tyres);
      },
      (error) => {
        console.error("Error listening to tyres:", error);
        handleFirestoreError(error);
      }
    );
  } catch (error) {
    console.error("Error setting up tyres listener:", error);
    handleFirestoreError(error);
    return () => { }; // Return a no-op function as unsubscribe
  }
}

// --- Tyre Store Management Functions (from your provided code) ---

/**
 * Add a new TyreStore document to Firestore
 * @param store The TyreStore object to add
 */
export async function addTyreStore(store: TyreStore): Promise<void> {
  try {
    const storeRef = doc(firestore, "tyreStores", store.id);
    await setDoc(storeRef, {
      ...store,
      dateAdded: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding tyre store:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Get a TyreStore by ID
 * @param storeId The ID of the TyreStore to retrieve
 */
export async function getTyreStoreById(storeId: string): Promise<TyreStore | null> {
  try {
    const storeRef = doc(firestore, "tyreStores", storeId);
    const snap = await getDoc(storeRef);

    if (!snap.exists()) return null;

    return { id: snap.id, ...snap.data() } as TyreStore;
  } catch (error) {
    console.error("Error getting tyre store:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Get all TyreStore documents
 */
export async function getAllTyreStores(): Promise<TyreStore[]> {
  try {
    const q = query(collection(firestore, "tyreStores"), orderBy("dateAdded", "desc"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as TyreStore);
  } catch (error) {
    console.error("Error getting tyre stores:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Update an existing TyreStore document
 * @param storeId The ID of the TyreStore to update
 * @param storeData The updated TyreStore data
 */
export async function updateTyreStore(
  storeId: string,
  storeData: Partial<TyreStore>
): Promise<void> {
  try {
    const storeRef = doc(firestore, "tyreStores", storeId);
    await updateDoc(storeRef, {
      ...storeData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating tyre store:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Delete a TyreStore document
 * @param storeId The ID of the TyreStore to delete
 */
export async function deleteTyreStore(storeId: string): Promise<void> {
  try {
    const storeRef = doc(firestore, "tyreStores", storeId);
    await deleteDoc(storeRef);
  } catch (error) {
    console.error("Error deleting tyre store:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Update or insert a stock entry in a specific TyreStore
 * @param storeId The ID of the TyreStore to update
 * @param entry The StockEntry to update or insert
 */
export async function updateTyreStoreEntry(storeId: string, entry: StockEntry): Promise<void> {
  try {
    const storeRef = doc(firestore, "tyreStores", storeId);
    const snap = await getDoc(storeRef);

    if (!snap.exists()) {
      throw new Error(`TyreStore ${storeId} does not exist`);
    }

    const data = snap.data() as TyreStore;
    const entries = data.entries || [];
    const idx = entries.findIndex((e) => e.tyreId === entry.tyreId);

    if (idx >= 0) {
      entries[idx] = entry;
    } else {
      entries.push(entry);
    }

    await updateDoc(storeRef, {
      entries,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating tyre store entry:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Remove a stock entry from a specific TyreStore
 * @param storeId The ID of the TyreStore to update
 * @param tyreId The ID of the tyre to remove
 */
export async function removeTyreStoreEntry(storeId: string, tyreId: string): Promise<void> {
  try {
    const storeRef = doc(firestore, "tyreStores", storeId);
    const snap = await getDoc(storeRef);

    if (!snap.exists()) {
      throw new Error(`TyreStore ${storeId} does not exist`);
    }

    const data = snap.data() as TyreStore;
    const entries = data.entries || [];
    const updatedEntries = entries.filter((e) => e.tyreId !== tyreId);

    await updateDoc(storeRef, {
      entries: updatedEntries,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error removing tyre store entry:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Move a stock entry between two TyreStores
 * @param fromStoreId The ID of the source TyreStore
 * @param toStoreId The ID of the destination TyreStore
 * @param entry The StockEntry to move
 */
export async function moveTyreStoreEntry(
  fromStoreId: string,
  toStoreId: string,
  entry: StockEntry
): Promise<void> {
  try {
    // First remove the entry from the source store
    await removeTyreStoreEntry(fromStoreId, entry.tyreId);

    // Then add it to the destination store
    await updateTyreStoreEntry(toStoreId, entry);
  } catch (error) {
    console.error("Error moving tyre store entry:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Get stock entries for a specific tyre across all stores
 * @param tyreId The ID of the tyre to find
 */
export async function getTyreStoreEntriesByTyreId(
  tyreId: string
): Promise<{ storeId: string; entry: StockEntry }[]> {
  try {
    const stores = await getAllTyreStores();
    const results: { storeId: string; entry: StockEntry }[] = [];

    for (const store of stores) {
      const entry = store.entries?.find((e) => e.tyreId === tyreId);
      if (entry) {
        results.push({
          storeId: store.id,
          entry,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error getting tyre store entries by tyre ID:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

/**
 * Listen to all TyreStore documents in real time
 * @param onChange Callback function that receives the updated stores
 */
export function listenToTyreStores(onChange: (stores: TyreStore[]) => void) {
  try {
    const collRef = collection(firestore, "tyreStores");
    const q = query(collRef, orderBy("dateAdded", "desc"));

    return onSnapshot(
      q,
      (snapshot) => {
        const stores: TyreStore[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          // Convert Firestore Timestamps to Date objects
          // This conversion logic should be handled carefully if `Timestamp` is part of your `TyreStore` type.
          // If `TyreStore` type uses `Timestamp` directly, no `toDate()` conversion is needed here.
          // If it expects `Date` objects, then `toDate()` is appropriate.
          // Given the `tyre-types` Canvas, `Timestamp` is used directly, so this conversion might not be strictly necessary
          // unless your UI components specifically expect Date objects.
          return { id: doc.id, ...data } as TyreStore;
        });
        onChange(stores);
      },
      (error) => {
        console.error("Error listening to tyre stores:", error);
        handleFirestoreError(error);
      }
    );
  } catch (error) {
    console.error("Error setting up tyre stores listener:", error);
    handleFirestoreError(error);
    // Return a no-op function as unsubscribe
    return () => { };
  }
}

/**
 * Get statistics for tyre stores
 */
export async function getTyreStoreStats(): Promise<{
  totalStores: number;
  totalTyres: number;
  storeTypeCounts: Record<string, number>;
  tyresByStatus: Record<string, number>;
}> {
  try {
    const stores = await getAllTyreStores();

    const storeTypeCounts: Record<string, number> = {};
    const tyresByStatus: Record<string, number> = {};
    let totalTyres = 0;

    stores.forEach((store) => {
      // Count store types
      const storeType = store.name || "Unknown";
      storeTypeCounts[storeType] = (storeTypeCounts[storeType] || 0) + 1;

      // Count tyres by status
      const entries = store.entries || [];
      totalTyres += entries.length;

      entries.forEach((entry) => {
        const status = entry.status || "Unknown";
        tyresByStatus[status] = (tyresByStatus[status] || 0) + 1;
      });
    });

    return {
      totalStores: stores.length,
      totalTyres,
      storeTypeCounts,
      tyresByStatus,
    };
  } catch (error) {
    console.error("Error getting tyre store stats:", error);
    await handleFirestoreError(error);
    throw error;
  }
}

export default {
  addTyreStore,
  getTyreStoreById,
  getAllTyreStores,
  updateTyreStore,
  deleteTyreStore,
  updateTyreStoreEntry,
  removeTyreStoreEntry,
  moveTyreStoreEntry,
  getTyreStoreEntriesByTyreId,
  listenToTyreStores,
  getTyreStoreStats,
};
