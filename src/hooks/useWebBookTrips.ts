import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "../utils/firebaseConnectionHandler";

export interface WebBookTrip {
  id: string;
  loadRef: string;
  status: string;
  customer: string;
  origin: string;
  destination: string;
  shippedStatus: boolean;
  deliveredStatus: boolean;
  shippedDate?: string;
  deliveredDate?: string;
  shippedAt?: string;
  deliveredAt?: string;
  importSource: string;
  importedVia?: string;
  importedAt?: string;
  updatedAt: string;
  startTime?: string;
  endTime?: string;
  tripDurationHours?: number;
}

export function useWebBookTrips() {
  const [trips, setTrips] = useState<WebBookTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Query Firestore for trips with importSource "web_book"
    const q = query(
      collection(firestore, "trips"),
      where("importSource", "==", "web_book")
    );
    
    // Create real-time listener with onSnapshot instead of one-time query
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const result: WebBookTrip[] = [];
        
        snapshot.forEach(doc => {
          const data = doc.data();
          result.push({ 
            id: doc.id, 
            ...data 
          } as WebBookTrip);
        });

        // Debug: log fetched trips to console
        console.log('📊 Fetched trips from Firestore (real-time):', result);

        setTrips(result);
        setLoading(false);
      },
      (err) => {
        console.error("Error in web book trips listener:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      }
    );

    // Cleanup subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  // Filter trips by status
  const getActiveTrips = () => trips.filter(trip => 
    trip.status === "active" || trip.status === "shipped" || trip.status === "in_transit"
  );
  
  const getDeliveredTrips = () => trips.filter(trip => 
    trip.status === "delivered" || trip.deliveredStatus === true
  );
  
  const getCompletedTrips = () => trips.filter(trip => 
    trip.status === "completed" || trip.status === "delivered"
  );

  return { 
    trips, 
    loading, 
    error,
    activeTrips: getActiveTrips(),
    deliveredTrips: getDeliveredTrips(),
    completedTrips: getCompletedTrips()
  };
}
