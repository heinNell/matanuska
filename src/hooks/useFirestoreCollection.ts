import { collection, getDocs, orderBy, query, QueryConstraint } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";

/**
 * Hook to fetch data from a Firestore collection
 * @param collectionName The name of the collection to fetch from
 * @param constraints Optional query constraints (where, orderBy, etc)
 * @returns An object containing the data, loading state, and any error
 */
export function useFirestoreCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCollection() {
      try {
        setLoading(true);
        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef, ...constraints);
        const querySnapshot = await getDocs(q);

        const items: T[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as T);
        });

        setData(items);
        setError(null);
      } catch (err) {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }

    fetchCollection();
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
}

/**
 * Hook to fetch vehicles from the fleet collection
 * @returns List of fleet vehicles
 */
export function useFleetVehicles() {
  return useFirestoreCollection<{
    id: string;
    fleetNumber: string;
    registration: string;
    make: string;
    model: string;
    vehicleType: string;
    status: string;
    odometer?: number;
  }>("fleet", [orderBy("fleetNumber")]);
}

/**
 * Hook to fetch route distances
 * @returns List of route distances
 */
export function useRouteDistances() {
  return useFirestoreCollection<{
    id: string;
    route: string;
    distance: number;
  }>("routeDistances", [orderBy("route")]);
}

/**
 * Hook to fetch fuel depots/stations
 * @returns List of fuel depots
 */
export function useDepots() {
  return useFirestoreCollection<{
    id: string;
    name: string;
    town: string;
    address: string;
  }>("depots", [orderBy("name")]);
}

/**
 * Hook to fetch clients
 * @returns List of clients
 */
export function useClients() {
  return useFirestoreCollection<{
    id: string;
    client: string;
    city?: string;
    address?: string;
    contact?: string;
    email?: string;
    telNo1?: string;
  }>("clients", [orderBy("client")]);
}

/**
 * Hook to fetch drivers
 * @returns List of drivers
 */
export function useDrivers() {
  return useFirestoreCollection<{
    id: string;
    name: string;
    licenseNumber?: string;
    status?: string;
  }>("drivers", [orderBy("name")]);
}
