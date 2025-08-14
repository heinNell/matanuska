/**
 * Offline Data Cache Utility
 * 
 * This utility provides caching and offline access capabilities using IndexedDB.
 * It helps applications work offline by storing data locally and syncing when connection is restored.
 */

const DB_NAME = 'matanuska_offline_cache';
const DB_VERSION = 1;
const STORES = {
  DATA_CACHE: 'data_cache',
  PENDING_OPERATIONS: 'pending_operations'
};

let db: IDBDatabase | null = null;

// Initialize the database
export const initOfflineCache = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(true);
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.DATA_CACHE)) {
          db.createObjectStore(STORES.DATA_CACHE, { keyPath: 'cacheKey' });
        }
        
        if (!db.objectStoreNames.contains(STORES.PENDING_OPERATIONS)) {
          const pendingStore = db.createObjectStore(STORES.PENDING_OPERATIONS, { 
            keyPath: 'id',
            autoIncrement: true 
          });
          pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
          pendingStore.createIndex('collectionPath', 'collectionPath', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        db = (event.target as IDBOpenDBRequest).result;
        console.log('✅ Offline cache database initialized successfully');
        resolve(true);
      };

      request.onerror = (event) => {
        console.error('❌ Failed to initialize offline cache:', event);
        reject(new Error('Failed to initialize IndexedDB for offline cache'));
      };
    } catch (error) {
      console.error('❌ Error initializing offline cache:', error);
      reject(error);
    }
  });
};

// Cache data with collection path and query parameters as the key
export const cacheData = async <T>(
  collectionPath: string, 
  queryParams: Record<string, any> | null,
  data: T,
  ttl: number = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
): Promise<void> => {
  if (!db) {
    await initOfflineCache();
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = db!.transaction(STORES.DATA_CACHE, 'readwrite');
      const store = transaction.objectStore(STORES.DATA_CACHE);

      // Create a cache key from collection path and query parameters
      const cacheKey = createCacheKey(collectionPath, queryParams);
      
      // Store data with expiration time
      const expiresAt = Date.now() + ttl;
      
      const request = store.put({
        cacheKey,
        collectionPath,
        queryParams,
        data,
        expiresAt,
        timestamp: Date.now()
      });

      request.onsuccess = () => {
        console.log('✅ Data cached successfully:', cacheKey);
        resolve();
      };

      request.onerror = (event) => {
        console.error('❌ Failed to cache data:', event);
        reject(new Error('Failed to store data in offline cache'));
      };
    } catch (error) {
      console.error('❌ Error caching data:', error);
      reject(error);
    }
  });
};

// Get cached data
export const getCachedData = async <T>(
  collectionPath: string,
  queryParams: Record<string, any> | null
): Promise<T | null> => {
  if (!db) {
    await initOfflineCache();
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = db!.transaction(STORES.DATA_CACHE, 'readonly');
      const store = transaction.objectStore(STORES.DATA_CACHE);

      const cacheKey = createCacheKey(collectionPath, queryParams);
      const request = store.get(cacheKey);

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        
        if (!result) {
          resolve(null);
          return;
        }

        // Check if the cached data has expired
        if (result.expiresAt < Date.now()) {
          console.log('⚠️ Cached data expired:', cacheKey);
          
          // Delete expired data
          const deleteTransaction = db!.transaction(STORES.DATA_CACHE, 'readwrite');
          const deleteStore = deleteTransaction.objectStore(STORES.DATA_CACHE);
          deleteStore.delete(cacheKey);
          
          resolve(null);
          return;
        }

        console.log('✅ Using cached data:', cacheKey);
        resolve(result.data as T);
      };

      request.onerror = (event) => {
        console.error('❌ Failed to retrieve cached data:', event);
        reject(new Error('Failed to retrieve data from offline cache'));
      };
    } catch (error) {
      console.error('❌ Error retrieving cached data:', error);
      reject(error);
    }
  });
};

// Queue operation for syncing when back online
export const queueOperation = async (
  operationType: 'create' | 'update' | 'delete',
  collectionPath: string,
  docId: string | null,
  data?: any
): Promise<void> => {
  if (!db) {
    await initOfflineCache();
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = db!.transaction(STORES.PENDING_OPERATIONS, 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_OPERATIONS);

      const operation = {
        operationType,
        collectionPath,
        docId,
        data,
        timestamp: Date.now(),
        attempts: 0
      };

      const request = store.add(operation);

      request.onsuccess = () => {
        console.log('✅ Operation queued for offline sync:', operation);
        resolve();
      };

      request.onerror = (event) => {
        console.error('❌ Failed to queue operation:', event);
        reject(new Error('Failed to queue operation for offline sync'));
      };
    } catch (error) {
      console.error('❌ Error queuing operation:', error);
      reject(error);
    }
  });
};

// Process pending operations when back online
export const processPendingOperations = async (
  processFunction: (operation: any) => Promise<boolean>
): Promise<{ success: number, failed: number }> => {
  if (!db) {
    await initOfflineCache();
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = db!.transaction(STORES.PENDING_OPERATIONS, 'readonly');
      const store = transaction.objectStore(STORES.PENDING_OPERATIONS);
      const index = store.index('timestamp');
      
      const request = index.openCursor();
      const operations: any[] = [];

      request.onsuccess = async (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          operations.push({
            id: cursor.value.id,
            ...cursor.value
          });
          cursor.continue();
        } else {
          // Process all operations
          let success = 0;
          let failed = 0;

          for (const operation of operations) {
            try {
              const result = await processFunction(operation);
              
              if (result) {
                // Remove the operation if successfully processed
                const deleteTransaction = db!.transaction(STORES.PENDING_OPERATIONS, 'readwrite');
                const deleteStore = deleteTransaction.objectStore(STORES.PENDING_OPERATIONS);
                await deleteStore.delete(operation.id);
                success++;
              } else {
                // Increment attempt count
                const updateTransaction = db!.transaction(STORES.PENDING_OPERATIONS, 'readwrite');
                const updateStore = updateTransaction.objectStore(STORES.PENDING_OPERATIONS);
                operation.attempts++;
                await updateStore.put(operation);
                failed++;
              }
            } catch (error) {
              console.error('❌ Error processing operation:', operation, error);
              failed++;
            }
          }

          resolve({ success, failed });
        }
      };

      request.onerror = (event) => {
        console.error('❌ Failed to retrieve pending operations:', event);
        reject(new Error('Failed to retrieve pending operations'));
      };
    } catch (error) {
      console.error('❌ Error processing pending operations:', error);
      reject(error);
    }
  });
};

// Clear expired cache entries
export const clearExpiredCache = async (): Promise<number> => {
  if (!db) {
    await initOfflineCache();
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = db!.transaction(STORES.DATA_CACHE, 'readwrite');
      const store = transaction.objectStore(STORES.DATA_CACHE);
      const request = store.openCursor();
      let deletedCount = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          if (cursor.value.expiresAt < Date.now()) {
            cursor.delete();
            deletedCount++;
          }
          cursor.continue();
        } else {
          console.log(`✅ Cleared ${deletedCount} expired cache entries`);
          resolve(deletedCount);
        }
      };

      request.onerror = (event) => {
        console.error('❌ Failed to clear expired cache:', event);
        reject(new Error('Failed to clear expired cache entries'));
      };
    } catch (error) {
      console.error('❌ Error clearing expired cache:', error);
      reject(error);
    }
  });
};

// Helper function to create a consistent cache key
const createCacheKey = (collectionPath: string, queryParams: Record<string, any> | null): string => {
  let key = collectionPath;
  
  if (queryParams) {
    // Sort keys to ensure consistent cache keys regardless of parameter order
    const sortedParams = Object.keys(queryParams).sort().reduce(
      (obj, key) => {
        obj[key] = queryParams[key];
        return obj;
      }, 
      {} as Record<string, any>
    );
    
    key += '?' + JSON.stringify(sortedParams);
  }
  
  return key;
};

// Initialize cache when this module is imported
initOfflineCache().catch(console.error);

export default {
  initOfflineCache,
  cacheData,
  getCachedData,
  queueOperation,
  processPendingOperations,
  clearExpiredCache
};
