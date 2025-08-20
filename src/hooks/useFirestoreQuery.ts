import { useState, useEffect, useMemo, useCallback } from "react";
import { collection, query, onSnapshot, QueryConstraint, DocumentData, Unsubscribe } from "firebase/firestore";
import { firestore } from "../utils/firebaseConnectionHandler";
import { cacheData, getCachedData } from "../utils/offlineCache";
import { handleFirestoreError } from "../utils/firebaseConnectionHandler";

interface UseFirestoreQueryOptions {
  cacheTtl?: number; // Time to live in milliseconds
  listen?: boolean; // Whether to listen for real-time updates
}

const defaultOptions: UseFirestoreQueryOptions = {
  cacheTtl: 24 * 60 * 60 * 1000, // 24 hours
  listen: true,
};

/**
 * A hook for querying Firestore with real-time updates and offline support.
 * Implements a "stale-while-revalidate" pattern.
 *
 * @param collectionPath The path to the Firestore collection.
 * @param queryConstraints Any Firebase query constraints (where, orderBy, limit, etc.).
 * @param options Configuration options.
 * @returns An object containing the data, loading state, error, and other metadata.
 */
export function useFirestoreQuery<T = DocumentData>(
  collectionPath: string,
  queryConstraints: QueryConstraint[] = [],
  options: UseFirestoreQueryOptions = {}
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [revalidating, setRevalidating] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [fromCache, setFromCache] = useState<boolean>(false);

  const mergedOptions = { ...defaultOptions, ...options };

  const cacheKey = useMemo(() => {
    const constraintsStr = queryConstraints.map((c) => c.type).join("-");
    return `${collectionPath}?${constraintsStr}`;
  }, [collectionPath, queryConstraints]);

  const fetchData = useCallback(async (): Promise<Unsubscribe | undefined> => {
    setRevalidating(true);
    setError(null);

    try {
      const collectionRef = collection(firestore, collectionPath);
      const q = query(collectionRef, ...queryConstraints);

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const fetchedData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];

          setData(fetchedData);
          setFromCache(false);
          setLoading(false);
          setRevalidating(false);
          setError(null);

          cacheData(cacheKey, null, fetchedData, mergedOptions.cacheTtl);
        },
        (err) => {
          console.error(`Error fetching real-time data for ${collectionPath}:`, err);
          handleFirestoreError(err);
          setError(err);
          setLoading(false);
          setRevalidating(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error(`Error setting up query for ${collectionPath}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
      setRevalidating(false);
      return undefined;
    }
  }, [collectionPath, cacheKey, mergedOptions.cacheTtl, ...queryConstraints]);

  useEffect(() => {
  let unsubscribe: Unsubscribe | undefined;

    const initialize = async () => {
      setLoading(true);
      const cached = await getCachedData<T[]>(cacheKey, null);
      if (cached) {
        setData(cached);
        setFromCache(true);
        setLoading(false);
      }

      if (mergedOptions.listen) {
        unsubscribe = await fetchData();
      } else {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchData, cacheKey, mergedOptions.listen]);

  return { data, loading, revalidating, error, fromCache };
}

export default useFirestoreQuery;
