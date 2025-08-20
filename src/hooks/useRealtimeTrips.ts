import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, QuerySnapshot, DocumentData, FirestoreError } from "firebase/firestore";
import { db } from "../firebase";

export interface Trip {
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
  importSource: string;
  updatedAt: any; // Firestore timestamp
  startTime?: string;
  endTime?: string;
  tripDurationHours?: number;
  [key: string]: any; // for extra fields
}

export function useRealtimeTrips(options?: {
  onlyWebBook?: boolean;
  status?: string; // e.g. "active"
}) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Default no-op cleanup function
    let unsubscribe = () => {};

    try {
      // Build query
      let tripsQuery = collection(db, "trips");
      let q: any = tripsQuery;

      if (options?.onlyWebBook && options.status) {
        q = query(
          tripsQuery,
          where("importSource", "==", "web_book"),
          where("status", "==", options.status),
          orderBy("updatedAt", "desc")
        );
      } else if (options?.onlyWebBook) {
        q = query(
          tripsQuery,
          where("importSource", "==", "web_book"),
          orderBy("updatedAt", "desc")
        );
      } else if (options?.status) {
        q = query(
          tripsQuery,
          where("status", "==", options.status),
          orderBy("updatedAt", "desc")
        );
      } else {
        q = query(tripsQuery, orderBy("updatedAt", "desc"));
      }

      unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const docs: Trip[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          } as Trip));
          setTrips(docs);
          setLoading(false);
          setError(null);
        },
        (err: FirestoreError) => {
          console.error("Real-time trips listener error:", err);
          setError(err.message);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Failed to set up real-time trips listener:", err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }

    // Always return cleanup
    return () => unsubscribe();
  }, [options?.onlyWebBook, options?.status]);

  return { trips, loading, error };
}
