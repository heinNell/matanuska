import { get, push, ref, remove, set, update } from "firebase/database";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
import { db, rtdb, storage } from "./firebase";

/**
 * Firestore Helper Functions
 */

// Create a document with auto-generated ID
export const createDocument = async (collectionPath: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionPath), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error(`Error creating document in ${collectionPath}:`, error);
    throw error;
  }
};

// Create or update a document with a specific ID
export const setDocument = async (
  collectionPath: string,
  docId: string,
  data: any,
  merge = true
) => {
  try {
    await setDoc(
      doc(db, collectionPath, docId),
      {
        ...data,
        updatedAt: serverTimestamp(),
        ...(merge ? {} : { createdAt: serverTimestamp() }),
      },
      { merge }
    );
    return { id: docId, ...data };
  } catch (error) {
    console.error(`Error setting document ${docId} in ${collectionPath}:`, error);
    throw error;
  }
};

// Get a document by ID
export const getDocument = async (collectionPath: string, docId: string) => {
  try {
    const docSnap = await getDoc(doc(db, collectionPath, docId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error(`Error getting document ${docId} from ${collectionPath}:`, error);
    throw error;
  }
};

// Get all documents in a collection
export const getCollection = async (collectionPath: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionPath));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error getting collection ${collectionPath}:`, error);
    throw error;
  }
};

// Query documents in a collection
export const queryDocuments = async (
  collectionPath: string,
  conditions: { field: string; operator: any; value: any }[] = [],
  sortField?: string,
  sortDirection?: "asc" | "desc",
  limitCount?: number
) => {
  try {
    const collectionRef = collection(db, collectionPath);

    // Build query constraints
    const queryConstraints = [];

    // Add where conditions
    if (conditions.length > 0) {
      conditions.forEach((cond) => {
        queryConstraints.push(where(cond.field, cond.operator, cond.value));
      });
    }

    // Add sorting
    if (sortField) {
      queryConstraints.push(orderBy(sortField, sortDirection || "asc"));
    }

    // Add limit
    if (limitCount) {
      queryConstraints.push(limit(limitCount));
    }

    // Create the query with all constraints
    const q = query(collectionRef, ...queryConstraints);

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error querying collection ${collectionPath}:`, error);
    throw error;
  }
};

// Update a document
export const updateDocument = async (collectionPath: string, docId: string, data: any) => {
  try {
    await updateDoc(doc(db, collectionPath, docId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { id: docId, ...data };
  } catch (error) {
    console.error(`Error updating document ${docId} in ${collectionPath}:`, error);
    throw error;
  }
};

// Delete a document
export const deleteDocument = async (collectionPath: string, docId: string) => {
  try {
    await deleteDoc(doc(db, collectionPath, docId));
    return { id: docId };
  } catch (error) {
    console.error(`Error deleting document ${docId} from ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Realtime Database Helper Functions
 */

// Set data at a specific path
export const setRealtimeData = async (path: string, data: any) => {
  try {
    await set(ref(rtdb, path), {
      ...data,
      timestamp: Date.now(),
    });
    return data;
  } catch (error) {
    console.error(`Error setting data at ${path}:`, error);
    throw error;
  }
};

// Get data from a specific path
export const getRealtimeData = async (path: string) => {
  try {
    const snapshot = await get(ref(rtdb, path));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error(`Error getting data from ${path}:`, error);
    throw error;
  }
};

// Push data to a list
export const pushRealtimeData = async (path: string, data: any) => {
  try {
    const newRef = push(ref(rtdb, path));
    await set(newRef, {
      ...data,
      timestamp: Date.now(),
    });
    return { id: newRef.key, ...data };
  } catch (error) {
    console.error(`Error pushing data to ${path}:`, error);
    throw error;
  }
};

// Update data at a specific path
export const updateRealtimeData = async (path: string, data: any) => {
  try {
    await update(ref(rtdb, path), {
      ...data,
      timestamp: Date.now(),
    });
    return data;
  } catch (error) {
    console.error(`Error updating data at ${path}:`, error);
    throw error;
  }
};

// Remove data at a specific path
export const removeRealtimeData = async (path: string) => {
  try {
    await remove(ref(rtdb, path));
    return true;
  } catch (error) {
    console.error(`Error removing data at ${path}:`, error);
    throw error;
  }
};

/**
 * Storage Helper Functions
 */

// Upload a file to storage
export const uploadFile = async (path: string, file: File) => {
  try {
    const fileRef = storageRef(storage, path);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return {
      path,
      url: downloadURL,
      metadata: snapshot.metadata,
    };
  } catch (error) {
    console.error(`Error uploading file to ${path}:`, error);
    throw error;
  }
};

// Get download URL for a file
export const getFileURL = async (path: string) => {
  try {
    const fileRef = storageRef(storage, path);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error(`Error getting download URL for ${path}:`, error);
    throw error;
  }
};
