import { firebaseApp } from '../firebaseConfig';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import {
  initOfflineCache,
  cacheData,
  getCachedData,
  queueOperation,
  processPendingOperations
} from './offlineCache';
import { getNetworkState } from './networkDetection';

if (!firebaseApp) {
  throw new Error('Firebase app not initialized');
}
const firestore = getFirestore(firebaseApp);

/**
 * Create or update a document with offline support
 *
 * @param collectionPath The collection path
 * @param docId The document ID
 * @param data The document data
 * @param options Options for the operation
 * @returns A promise that resolves with the result of the operation
 */
export const saveDocument = async (
  collectionPath: string,
  docId: string,
  data: any,
  options: { merge?: boolean } = { merge: true }
): Promise<void> => {
  const networkState = getNetworkState();

  if (networkState.isInternetReachable && networkState.status !== 'offline') {
    try {
      // We're online - attempt to save directly to Firestore
      const docRef = doc(firestore, collectionPath, docId);
      await setDoc(docRef, data, options);

      // Also update the cache with the latest data
      await cacheData(`${collectionPath}/${docId}`, null, data);

      return;
    } catch (error) {
      console.error('Error saving document, will try offline operation:', error);
      // If online save fails, fall through to offline behavior
    }
  }

  // We're offline or the save failed - queue the operation for later
  await queueOperation('update', collectionPath, docId, data);

  // Cache the data locally so it appears in queries
  await cacheData(`${collectionPath}/${docId}`, null, data);
};

/**
 * Get a document with offline support
 *
 * @param collectionPath The collection path
 * @param docId The document ID
 * @returns A promise that resolves with the document data or null if it doesn't exist
 */
export const getDocument = async (
  collectionPath: string,
  docId: string
): Promise<any> => {
  const networkState = getNetworkState();

  // Try to get from cache first regardless of online status
  const cachedData = await getCachedData(`${collectionPath}/${docId}`, null);

  if (networkState.isInternetReachable && networkState.status !== 'offline') {
    try {
      // We're online - attempt to get from Firestore
      const docRef = doc(firestore, collectionPath, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // Cache the data for offline use
        await cacheData(`${collectionPath}/${docId}`, null, data);

        return {
          id: docId,
          ...data
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching document, using cached data if available:', error);
      // If online fetch fails, fall back to cache
    }
  }

  // Return cached data if we're offline or if the fetch failed
  return cachedData;
};

/**
 * Delete a document with offline support
 *
 * @param collectionPath The collection path
 * @param docId The document ID
 * @returns A promise that resolves when the operation is complete
 */
export const deleteDocument = async (
  collectionPath: string,
  docId: string
): Promise<void> => {
  const networkState = getNetworkState();

  if (networkState.isInternetReachable && networkState.status !== 'offline') {
    try {
      // We're online - attempt to delete from Firestore
      const docRef = doc(firestore, collectionPath, docId);
      await deleteDoc(docRef);

      return;
    } catch (error) {
      console.error('Error deleting document, will try offline operation:', error);
      // If online delete fails, fall through to offline behavior
    }
  }

  // Queue the delete operation for when we're back online
  await queueOperation('delete', collectionPath, docId);
};

/**
 * Sync pending offline operations when the device comes back online
 *
 * @returns A promise that resolves with the results of the sync
 */
export const syncOfflineOperations = async (): Promise<{ success: number, failed: number }> => {
  return await processPendingOperations(async (operation) => {
    try {
      switch (operation.operationType) {
        case 'create':
        case 'update': {
          const docRef = doc(firestore, operation.collectionPath, operation.docId);
          await setDoc(docRef, operation.data, { merge: true });
          return true;
        }
        case 'delete': {
          const docRef = doc(firestore, operation.collectionPath, operation.docId);
          await deleteDoc(docRef);
          return true;
        }
        default:
          return false;
      }
    } catch (error) {
      console.error('Error processing offline operation:', error, operation);

      // If we've tried too many times, give up
      if (operation.attempts >= 3) {
        console.warn('Too many failed attempts, abandoning operation:', operation);
        return true; // Return true to remove it from queue
      }

      return false; // Return false to keep in queue for retry
    }
  });
};

// Initialize offline cache when this module is imported
initOfflineCache().catch(console.error);

export default {
  saveDocument,
  getDocument,
  deleteDocument,
  syncOfflineOperations
};
