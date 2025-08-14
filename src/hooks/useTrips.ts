// src/hooks/useTrips.ts
import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase'; // Your Firestore instance
import { Trip, TripStatus } from '../types/trip'; // Your Trip interface
import { useToast } from './useToast'; // Your custom toast hook
import { handleError, ErrorCategory } from '../utils/errorHandling'; // Your global error handling

interface UseTripsOptions {
  startDate?: string; // ISO date string (YYYY-MM-DD)
  endDate?: string;   // ISO date string (YYYY-MM-DD)
  status?: TripStatus | 'all'; // Filter by status, or 'all'
  // Add other filter options as needed (e.g., vehicleId, driverId, clientName)
}

/**
 * Custom hook for fetching trip data from Firestore.
 * Supports filtering by date range and status.
 */
export function useTrips(options: UseTripsOptions = {}) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const tripsCollectionRef = collection(db, 'trips');

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let q = query(tripsCollectionRef);

      // Filter by status
      if (options.status && options.status !== 'all') {
        q = query(q, where('status', '==', options.status));
      }

      // Filter by date range (e.g., for trips that start/end within the range)
      // This is a common approach for calendar views. You might adjust based on your exact data model.
      if (options.startDate) {
        // Convert ISO date string to Firestore Timestamp for comparison
        const startTimestamp = Timestamp.fromDate(new Date(options.startDate));
        q = query(q, where('loadDate', '>=', startTimestamp)); // Assuming 'loadDate' is the relevant date field
      }
      if (options.endDate) {
        const endTimestamp = Timestamp.fromDate(new Date(options.endDate + 'T23:59:59.999Z')); // End of day
        q = query(q, where('loadDate', '<=', endTimestamp));
      }

      // Order by date for calendar display
      q = query(q, orderBy('loadDate', 'asc'));

      const querySnapshot = await getDocs(q);
      const fetchedTrips: Trip[] = querySnapshot.docs.map(doc => {
        const tripData = doc.data() as Omit<Trip, 'id'>;
        return {
          ...tripData,
          id: doc.id
        };
      });
      setTrips(fetchedTrips);
    } catch (err) {
      console.error("Error fetching trips:", err);
      const errorMessage = 'Failed to load trip data. Please try again.';
      setError(errorMessage);
      handleError(() => Promise.reject(err), {
        category: ErrorCategory.DATABASE,
        context: { component: 'useTrips', operation: 'fetchTrips', message: errorMessage }
      });
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [options.startDate, options.endDate, options.status, tripsCollectionRef, showToast]);

  useEffect(() => {
    fetchTrips();
    // TODO: For real-time calendar updates, consider using onSnapshot here
    // const unsubscribe = onSnapshot(q, (snapshot) => { ... }); return unsubscribe;
  }, [fetchTrips]); // Re-fetch when options change

  return { trips, loading, error, fetchTrips };
}
