import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { CostEntry, FlaggedCost } from '../types';
import { useAppContext } from './AppContext';
// Firebase imports commented out until Firebase is fully set up
// import { collection, query, where, onSnapshot } from 'firebase/firestore';
// import { db } from '../firebase/firebase';

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

  const { trips, updateCostEntry } = useAppContext();

  useEffect(() => {
    // Extract flagged costs from trips
    const extractFlaggedCosts = () => {
      try {
        const allFlaggedCosts: FlaggedCost[] = [];

        trips.forEach(trip => {
          if (trip.costs) {
            const tripFlaggedCosts = trip.costs.filter(cost => cost.isFlagged) as FlaggedCost[];
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

    extractFlaggedCosts();

    // You could also set up a real-time listener if needed
    // const q = query(collection(db, 'trips'), where('hasFlaggedCosts', '==', true));
    // const unsubscribe = onSnapshot(q, (querySnapshot) => {
    //   // Process snapshot and update flaggedCosts
    // });
    // return () => unsubscribe();

  }, [trips]);

  const resolveFlaggedCost = async (updatedCost: CostEntry, resolutionComment: string) => {
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
      const trip = trips.find(t => t.id === tripId);
      if (!trip || !trip.costs) {
        throw new Error('Trip or costs not found');
      }

      const costIndex = trip.costs.findIndex(c => c.id === costId);
      if (costIndex === -1) {
        throw new Error('Cost entry not found');
      }

      // Update the cost with flag information
      const updatedCost = {
        ...trip.costs[costIndex],
        isFlagged: true,
        flagReason: reason,
        flaggedAt: new Date().toISOString(),
        flaggedBy: 'Current User', // In a real app, use the logged-in user
        investigationStatus: 'pending' as 'pending' | 'in-progress' | 'resolved'
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
