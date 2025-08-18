// src/context/WialonContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { ExtendedWialonUnit, useWialon } from "../hooks/useWialon";

interface WialonContextProps {
  units: ExtendedWialonUnit[] | null;
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  selectedUnit: ExtendedWialonUnit | null;
  setSelectedUnit: (unit: ExtendedWialonUnit | null) => void;
}

const WialonContext = createContext<WialonContextProps | undefined>(undefined);

interface WialonProviderProps {
  children: ReactNode;
}

export const WialonProvider: React.FC<WialonProviderProps> = ({ children }) => {
  const { units, loading, error, initialized } = useWialon();
  const [selectedUnit, setSelectedUnit] = useState<ExtendedWialonUnit | null>(null);

  // Auto-select the first unit when units are loaded and none is selected
  useEffect(() => {
    if (!selectedUnit && Array.isArray(units) && units.length > 0) {
      const first = units[0];
      if (first) setSelectedUnit(first); // avoids passing `undefined`
    }
  }, [units, selectedUnit]);

  const value: WialonContextProps = {
    units,
    loading,
    error,
    initialized,
    selectedUnit,
    setSelectedUnit,
  };

  return <WialonContext.Provider value={value}>{children}</WialonContext.Provider>;
};

export const useWialonContext = (): WialonContextProps => {
  const context = useContext(WialonContext);
  if (context === undefined) {
    throw new Error("useWialonContext must be used within a WialonProvider");
  }
  return context;
};
