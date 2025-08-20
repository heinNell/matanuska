// src/context/WialonAppProvider.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import wialonService from "@/services/wialonService"; // Corrected path!
import type { WialonUnit, WialonSession } from "@/services/wialonService";

// Optional: add Sensor type if you have it in your types
type Sensor = any;

type WialonAppContextType = {
  session: WialonSession | null;
  units: WialonUnit[];
  selectedUnit: WialonUnit | null;
  setSelectedUnit: (unit: WialonUnit | null) => void;
  sensors: Sensor[];
  // Expose the main service API if needed:
  login: typeof wialonService.login;
  logout: typeof wialonService.logout;
  getUnits: typeof wialonService.getUnits;
  addPositionListener: typeof wialonService.addPositionListener;
  executeReport: typeof wialonService.executeReport;
  getResources: typeof wialonService.getResources;
  getGeofences: typeof wialonService.getGeofences;
};

const WialonAppContext = createContext<WialonAppContextType | undefined>(undefined);

export const WialonAppProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<WialonSession | null>(null);
  const [units, setUnits] = useState<WialonUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<WialonUnit | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);

  useEffect(() => {
    // Demo token or retrieve from ENV/config
    const token = "your_wialon_token_here";
    wialonService.login(token).then((sess) => {
      setSession(sess);
      wialonService.getUnits().then(setUnits);
    });
  }, []);

  // When unit changes, load sensors if you add that method to your service.
  // Example placeholder:
  useEffect(() => {
    if (selectedUnit && selectedUnit.id) {
      // If you have getUnitSensors, use here
      // wialonService.getUnitSensors(selectedUnit.id).then(setSensors);
      setSensors([]); // Placeholder, implement as needed
    }
  }, [selectedUnit]);

  return (
    <WialonAppContext.Provider
      value={{
        session,
        units,
        selectedUnit,
        setSelectedUnit,
        sensors,
        login: wialonService.login,
        logout: wialonService.logout,
        getUnits: wialonService.getUnits,
        addPositionListener: wialonService.addPositionListener,
        executeReport: wialonService.executeReport,
        getResources: wialonService.getResources,
        getGeofences: wialonService.getGeofences,
      }}
    >
      {children}
    </WialonAppContext.Provider>
  );
};

export function useWialonApp() {
  const ctx = useContext(WialonAppContext);
  if (!ctx) throw new Error("useWialonApp must be used within WialonAppProvider");
  return ctx;
}
