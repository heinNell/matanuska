// src/context/WialonAppProvider.tsx

import { createContext, useState, useEffect, useCallback } from "react";
import wialonService, { WialonSession, WialonUnit } from "../services/wialonService";

// --- 1. Context type
export interface WialonAppContextType {
  session: WialonSession | null;
  loggedIn: boolean;
  initializing: boolean;
  units: WialonUnit[];
  error: Error | null;
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  refreshUnits: () => Promise<void>;
  logout: () => void;
}

// --- 2. Context + Default value
export const WialonAppContext = createContext<WialonAppContextType>({
  session: null,
  loggedIn: false,
  initializing: false,
  units: [],
  error: null,
  token: null,
  setToken: () => {},
  refreshUnits: async () => {},
  logout: () => {},
});

// --- 3. Provider component with explicit children type
export function WialonAppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<WialonSession | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [units, setUnits] = useState<WialonUnit[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("wialonToken"));

  // --- Side effect: auto-login when token is set
  useEffect(() => {
    let active = true;
    async function init() {
      setInitializing(true);
      setError(null);

      if (!token) {
        setSession(null);
        setLoggedIn(false);
        setInitializing(false);
        return;
      }

      try {
        const sess = await wialonService.login(token);
        if (!active) return;
        setSession(sess);
        setLoggedIn(true);

        const allUnits = await wialonService.getUnits();
        if (active) setUnits(allUnits);
      } catch (err) {
        if (active) {
          setSession(null);
          setLoggedIn(false);
          setUnits([]);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (active) setInitializing(false);
      }
    }
    init();
    return () => { active = false; };
  }, [token]);

  // --- Refresh units
  const refreshUnits = useCallback(async () => {
    try {
      const allUnits = await wialonService.getUnits();
      setUnits(allUnits);
    } catch (err) {
      setUnits([]);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  // --- Logout
  const logout = useCallback(() => {
    wialonService.logout();
    setSession(null);
    setLoggedIn(false);
    setUnits([]);
    setError(null);
    setToken(null);
    localStorage.removeItem("wialonToken");
  }, []);

  // --- Context value
  const value: WialonAppContextType = {
    session,
    loggedIn,
    initializing,
    units,
    error,
    token,
    setToken,
    refreshUnits,
    logout,
  };

  return (
    <WialonAppContext.Provider value={value}>
      {children}
    </WialonAppContext.Provider>
  );
}
