import React, { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { Trip } from "../types";

interface TripSelectionContextValue {
  selectedTrip: Trip | null;
  setSelectedTrip: (trip: Trip | null) => void;
  clearSelectedTrip: () => void;
}

const TripSelectionContext = createContext<TripSelectionContextValue | undefined>(undefined);

export const TripSelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const clearSelectedTrip = useCallback(() => setSelectedTrip(null), []);
  return (
    <TripSelectionContext.Provider value={{ selectedTrip, setSelectedTrip, clearSelectedTrip }}>
      {children}
    </TripSelectionContext.Provider>
  );
};

export function useTripSelection() {
  const ctx = useContext(TripSelectionContext);
  if (!ctx) throw new Error("useTripSelection must be used within TripSelectionProvider");
  return ctx;
}
