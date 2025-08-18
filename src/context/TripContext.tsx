import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getFirestore, collection, onSnapshot, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { firebaseApp } from '../firebaseConfig';

// Define Trip interface
export interface Trip {
  id: string;
  status: string;
  [key: string]: any; // Allow other fields
}

// Create context type
interface TripContextType {
  trips: Trip[];
  activeTrips: Trip[];
  completedTrips: Trip[];
  loading: boolean;
  error: Error | null;
}

// Create context with default values
const TripContext = createContext<TripContextType>({
  trips: [],
  activeTrips: [],
  completedTrips: [],
  loading: true,
  error: null
});

// Provider props interface
interface TripProviderProps {
  children: ReactNode;
}

// Trip Provider component
export const TripProvider: React.FC<TripProviderProps> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);

    // Initialize Firestore
    if (!firebaseApp) {
      const error = new Error('Firebase app is not initialized');
      console.error(error);
      setError(error);
      setLoading(false);
      return;
    }

    const db = getFirestore(firebaseApp);

    try {
      // Set up real-time listener to trips collection
      const unsubscribe = onSnapshot(
        collection(db, 'trips'),
        (snapshot) => {
          const tripsData: Trip[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            return {
              id: doc.id,
              status: data.status || 'unknown', // Ensure status field exists
              ...data
            };
          });

          setTrips(tripsData);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching trips:", err);
          setError(err);
          setLoading(false);
        }
      );

      // Clean up subscription on unmount
      return () => unsubscribe();
    } catch (err: any) {
      console.error("Error setting up trips listener:", err);
      setError(err);
      setLoading(false);
      return () => {}; // Return empty function for consistency
    }
  }, []);

  // Filter trips based on status
  const activeTrips = trips.filter(trip => trip.status !== 'completed');
  const completedTrips = trips.filter(trip => trip.status === 'completed');

  // Value to provide to context consumers
  const value = {
    trips,
    activeTrips,
    completedTrips,
    loading,
    error
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};

// Custom hook for using the trip context
export const useTrips = () => useContext(TripContext);
