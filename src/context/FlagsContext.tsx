import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { CostEntry, FlaggedCost, Trip } from '../types';
import { AppContext } from './AppContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface FlagsContextType {
  flaggedCosts: FlaggedCost[];
  isLoading: boolean;
  error: string | null;
  resolveFlaggedCost: (updatedCost: CostEntry, resolutionComment: string) => Promise<void>;
  flagCost: (costId: string, tripId: string, reason: string) => Promise<void>;
}

const FlagsContext = createContext<FlagsContextType | undefined>(undefined);

export const useFlagsContext = (): FlagsContextType => {
  const context = useContext(FlagsContext);
  if (!context) {
    throw new Error('useFlagsContext must be used within a FlagsProvider');
  }
  return context;
};

export const FlagsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [flaggedCosts, setFlaggedCosts] = useState<FlaggedCost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Try to get the app context safely, without throwing errors
  const appContext = useContext(AppContext);

  const trips: Trip[] = appContext?.trips || [];
  const updateCostEntry: ((costEntry: CostEntry) => Promise<void>) =
    appContext?.updateCostEntry || (async () => {
      console.warn('updateCostEntry called but AppContext not available');
    });

  // Optional realtime mode toggled by env flag
  const enableRealtime: boolean = (import.meta.env?.VITE_FLAGS_REALTIME as string) === 'true';

  useEffect(() => {
    // Extract flagged costs from trips
    const extractFlaggedCosts = () => {
      try {
        const allFlaggedCosts: FlaggedCost[] = [];

        trips.forEach((trip: Trip) => {
          if (trip.costs) {
            const tripFlaggedCosts = trip.costs.filter((cost: CostEntry) => cost.isFlagged) as FlaggedCost[];
            if (tripFlaggedCosts.length > 0) {
              allFlaggedCosts.push(...tripFlaggedCosts);
            }
          }
        });

        setFlaggedCosts(allFlaggedCosts);
      } catch (err) {
        setError('Failed to extract flagged costs');
        console.error('Error extracting flagged costs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    let unsubscribe: (() => void) | undefined;
    if (!enableRealtime) {
      extractFlaggedCosts();
    } else {
      try {
        const qRef = query(collection(db, 'trips'), where('hasFlaggedCosts', '==', true));
        unsubscribe = onSnapshot(
          qRef,
          (querySnapshot) => {
            try {
              const allFlaggedCosts: FlaggedCost[] = [];
              querySnapshot.forEach((docSnap) => {
                const data = docSnap.data() as { costs?: CostEntry[]; hasFlaggedCosts?: boolean };
                const costs: CostEntry[] = Array.isArray(data.costs) ? data.costs : [];
                costs.forEach((c) => {
                  if (c && 'isFlagged' in c && c.isFlagged) {
                    const fc: FlaggedCost = {
                      ...c,
                      id: c.id || `${docSnap.id}-${c.referenceNumber || Math.random().toString(36).slice(2)}`,
                      tripId: c.tripId || docSnap.id,
                      isFlagged: true,
                    } as FlaggedCost;
                    allFlaggedCosts.push(fc);
                  }
                });
              });
              setFlaggedCosts(allFlaggedCosts);
              setIsLoading(false);
            } catch (innerErr) {
              setError('Failed to process flagged costs snapshot');
              console.error(innerErr);
            }
          },
          (err) => {
            setError('Failed to subscribe to flagged costs');
            console.error(err);
            setIsLoading(false);
          }
        );
      } catch (err) {
        console.error('FlagsContext realtime listener setup failed:', err);
      }
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [trips, enableRealtime]);

  const resolveFlaggedCost = async (updatedCost: CostEntry, _resolutionComment: string) => {
    try {
      // Update the cost entry in the parent context
      await updateCostEntry(updatedCost);

      // You could add additional flags-specific logic here

      return Promise.resolve();
    } catch (error) {
      setError('Failed to resolve flagged cost');
      console.error('Error resolving flagged cost:', error);
      return Promise.reject(error);
    }
  };

  const flagCost = async (costId: string, tripId: string, reason: string) => {
    try {
      // Find the trip and cost
      const trip = trips.find((t: Trip) => t.id === tripId);
      if (!trip || !trip.costs) {
        throw new Error('Trip or costs not found');
      }

      const costIndex = trip.costs.findIndex((c: CostEntry) => c.id === costId);
      if (costIndex === -1) {
        throw new Error('Cost entry not found');
      }

      // Update the cost with flag information
      const costEntry = trip.costs[costIndex];
      if (!costEntry || !costEntry.id || !costEntry.tripId) {
        throw new Error('Cost entry is invalid or missing required fields');
      }

      const updatedCost: CostEntry = {
        ...costEntry,
        id: costEntry.id,
        tripId: costEntry.tripId,
        category: costEntry.category || 'Other',
        subCategory: costEntry.subCategory || '',
        amount: costEntry.amount,
        currency: costEntry.currency,
        date: costEntry.date,
        referenceNumber: costEntry.referenceNumber || '',
        notes: costEntry.notes || '',
        attachments: costEntry.attachments || [],
        isFlagged: true,
        flagReason: reason,
        flaggedAt: new Date().toISOString(),
        flaggedBy: 'Current User',
        investigationStatus: 'pending'
      };

      // Update in the main context
      await updateCostEntry(updatedCost);

      return Promise.resolve();
    } catch (error) {
      setError('Failed to flag cost entry');
      console.error('Error flagging cost entry:', error);
      return Promise.reject(error);
    }
  };

  const value = {
    flaggedCosts,
    isLoading,
    error,
    resolveFlaggedCost,
    flagCost
  };

  return <FlagsContext.Provider value={value}>{children}</FlagsContext.Provider>;
};
