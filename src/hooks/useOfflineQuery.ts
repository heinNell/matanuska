import { useState, useEffect } from "react";
import { collection, query, getDocs, QueryConstraint, DocumentData } from "firebase/firestore";
import { firestore } from "../utils/firebaseConnectionHandler";
import { cacheData, getCachedData } from "../utils/offlineCache";
import { getConnectionStatus } from "../utils/firebaseConnectionHandler";

interface UseOfflineQueryOptions {
  cacheTtl?: number; // Time to live in milliseconds
  enableOfflineMode?: boolean;
}

const defaultOptions: UseOfflineQueryOptions = {
  cacheTtl: 24 * 60 * 60 * 1000, // 24 hours
  enableOfflineMode: true,
};

/**
 * A hook for querying Firestore with offline support
 *
 * @param collectionPath The path to the Firestore collection
 * @param queryConstraints Any Firebase query constraints (where, orderBy, limit, etc.)
 * @param options Configuration options
 * @returns An object containing the data, loading state, and error
 */
export function useOfflineQuery<T = DocumentData>(
  collectionPath: string,
  queryConstraints: QueryConstraint[] = [],
  options: UseOfflineQueryOptions = {}
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [queryParams, setQueryParams] = useState<Record<string, any> | null>(null);

  const mergedOptions = { ...defaultOptions, ...options };

  // Parse query constraints to create a cache key
  useEffect(() => {
    const params: Record<string, any> = {};

    queryConstraints.forEach((constraint) => {
      // Extract meaningful parts from the constraint for caching
      const constraintStr = constraint.toString();

      // Simple parsing of constraint type and value
      if (constraintStr.includes("where")) {
        const match = constraintStr.match(/where\((.*?),(.*?),(.*?)\)/);
        if (match && match.length >= 4) {
          params[`where_${match[1]?.trim()}`] = {
            op: match[2]?.trim(),
            value: match[3]?.trim(),
          };
        }
      } else if (constraintStr.includes("orderBy")) {
        const match = constraintStr.match(/orderBy\((.*?),(.*?)\)/);
        if (match && match.length >= 3) {
          params[`orderBy_${match[1]?.trim()}`] = match[2]?.trim();
        }
      } else if (constraintStr.includes("limit")) {
        const match = constraintStr.match(/limit\((.*?)\)/);
        if (match && match.length >= 2) {
          params["limit"] = match[1]?.trim();
        }
      }
    });

    setQueryParams(Object.keys(params).length > 0 ? params : null);
  }, [queryConstraints]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const connectionStatus = getConnectionStatus();
        const isOffline = connectionStatus.status === "disconnected";

        // Try to get data from cache first if we're offline or offline mode is enabled
        if ((isOffline || mergedOptions.enableOfflineMode) && queryParams !== null) {
          const cachedData = await getCachedData<T[]>(collectionPath, queryParams);

          if (cachedData && isMounted) {
            console.log("🔄 Using cached data for:", collectionPath);
            setData(cachedData);
            setLoading(false);

            // If we're offline, return here
            if (isOffline) {
              return;
            }
          }
        }

        // If we're online or no cached data was found, fetch from Firestore
        if (!isOffline) {
          const collectionRef = collection(firestore, collectionPath);
          const q = query(collectionRef, ...queryConstraints);
          const querySnapshot = await getDocs(q);

          const fetchedData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];

          if (isMounted) {
            setData(fetchedData);
            setError(null);

            // Cache the data for offline use if offline mode is enabled
            if (mergedOptions.enableOfflineMode && queryParams !== null) {
              await cacheData(collectionPath, queryParams, fetchedData, mergedOptions.cacheTtl);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [collectionPath, queryParams, mergedOptions.enableOfflineMode, mergedOptions.cacheTtl]);

  return { data, loading, error };
}

export default useOfflineQuery;
