import React, { createContext, useContext, useEffect, useState } from "react";
import wialonService from "../services/wialonService";
import { getEnvVar } from "../utils/envUtils";
import type {
  WialonUnit as WialonUnitType,
  WialonSession as WialonSessionType,
  DiagnosticResult,
  WialonError
} from "../types/wialon-types";
import type {
  WialonUnit as ServiceWialonUnit,
  WialonSession as ServiceWialonSession
} from "../services/wialonService";

// Helper functions to transform service types to expected types
const transformSession = (serviceSession: ServiceWialonSession): WialonSessionType => ({
  id: serviceSession.sid,
  user: {
    id: 0, // Service doesn't provide user ID, using default
    name: serviceSession.user
  }
});

const transformUnit = (serviceUnit: ServiceWialonUnit): WialonUnitType => ({
  id: serviceUnit.id,
  name: serviceUnit.nm,
  // Copy any additional properties, but avoid overwriting id
  iconUrl: serviceUnit.iconUrl,
  addListener: serviceUnit.addListener,
  removeListenerById: serviceUnit.removeListenerById,
  getId: serviceUnit.getId
});

const transformUnits = (serviceUnits: ServiceWialonUnit[]): WialonUnitType[] =>
  serviceUnits.map(transformUnit);

// ---- Context types (unchanged API) ----
interface WialonContextType {
  session: any;
  loggedIn: boolean;
  initializing: boolean;
  initialized: boolean;
  units: any[];
  error: Error | null;
  token: string | null;
  login: (customToken?: string) => void;
  logout: () => void;
  refreshUnits: () => Promise<any[]>;
  setToken: (token: string) => void;
  runDiagnostics: () => Promise<DiagnosticResult[]>;
  diagnosticResults: DiagnosticResult[];
  isDiagnosticRunning: boolean;
}

export const WialonContext = createContext<WialonContextType>({
  session: null,
  loggedIn: false,
  initializing: false,
  initialized: false,
  units: [],
  error: null,
  token: null,
  login: () => {},
  logout: () => {},
  refreshUnits: async () => [],
  setToken: () => {},
  runDiagnostics: async () => [],
  diagnosticResults: [],
  isDiagnosticRunning: false,
});

export const WialonProvider = ({ children }: { children: React.ReactNode }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [session, setSession] = useState<WialonSessionType | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [units, setUnits] = useState<WialonUnitType[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);

  // Prefer persisted token, then env
  const [token, setTokenState] = useState<string | null>(() => {
    const stored = localStorage.getItem("wialonToken");
    return stored || getEnvVar("VITE_WIALON_SESSION_TOKEN", "") || null;
  });

  const apiHost =
    getEnvVar("VITE_WIALON_API_URL", "https://hst-api.wialon.com") ||
    "https://hst-api.wialon.com";

  // -------- Auto-initialize once --------
  useEffect(() => {
    let mounted = true;
    setInitializing(true);

    const boot = async () => {
      try {
        if (!token) {
          setError(new Error("No Wialon token configured. Please set a valid token."));
          setLoggedIn(false);
          setInitialized(false);
          return;
        }
        // Use correct login method
        const sess = await wialonService.login(token);
        if (!mounted) return;
        setSession(transformSession(sess));
        setLoggedIn(true);
        setInitialized(true);

        // Fetch units after successful login
        try {
          const list = await wialonService.getUnits();
          if (mounted) setUnits(transformUnits(list));
        } catch (e) {
          console.error("Error fetching Wialon units after login:", e);
        }
      } catch (e: any) {
        if (!mounted) return;
        const wialonError = e as WialonError;
        const errorMsg = wialonError.code === 5
          ? `Wialon login failed (code 5): Authentication failed.
             • Check your token: it may be expired, revoked, or invalid.
             • See: https://sdk.wialon.com/wiki/en/sidebar/remoteapi/errors`
          : wialonError.message || String(e);

        setError(new Error(errorMsg));
        setLoggedIn(false);
        setInitialized(false);
        setSession(null);
      } finally {
        if (mounted) setInitializing(false);
      }
    };

    boot();
    return () => {
      mounted = false;
    };
  }, [token, apiHost]);

  // -------- Actions --------
  const refreshUnits = async () => {
    try {
      const list = await wialonService.getUnits();
      const transformedList = transformUnits(list);
      setUnits(transformedList);
      return transformedList;
    } catch (e) {
      console.error("Error refreshing Wialon units:", e);
      setError(e instanceof Error ? e : new Error(String(e)));
      return [];
    }
  };

  const setToken = (newToken: string) => {
    setTokenState(newToken);
    localStorage.setItem("wialonToken", newToken);
    // Triggers useEffect re-initialization via [token] dep
  };

  // Unified login re-init (re-runs effect by updating token)
  const login = (customToken?: string) => {
    if (customToken) setToken(customToken);
    else if (token) setToken(token);
    else setError(new Error("No token available for login"));
  };

  const logout = () => {
    wialonService.logout();
    setLoggedIn(false);
    setInitialized(false);
    setUnits([]);
    setSession(null);
    setError(null);
    // Optionally clear token in storage (comment if you want persistent token for user convenience)
    // localStorage.removeItem("wialonToken");
  };

  const runDiagnostics = async () => {
    setIsDiagnosticRunning(true);
    const results: DiagnosticResult[] = [];

    try {
      // Check SDK
      results.push({
        name: 'SDK Load',
        status: window.wialon ? 'ok' : 'fail',
        timestamp: Date.now()
      });

      // Check session
      results.push({
        name: 'Session',
        status: session ? 'ok' : 'fail',
        message: session ? `User: ${session.user.name}` : 'No active session',
        timestamp: Date.now()
      });

      // Check units access
      const unitCount = units.length;
      results.push({
        name: 'Units Access',
        status: unitCount > 0 ? 'ok' : 'warn',
        message: `Found ${unitCount} units`,
        timestamp: Date.now()
      });

      setDiagnosticResults(results);
      return results;
    } catch (e) {
      console.error('Diagnostics failed:', e);
      setError(e instanceof Error ? e : new Error('Diagnostics failed'));
      return results;
    } finally {
      setIsDiagnosticRunning(false);
    }
  };

  return (
    <WialonContext.Provider
      value={{
        session,
        loggedIn,
        initializing,
        initialized,
        units,
        error,
        token,
        login,
        logout,
        refreshUnits,
        setToken,
        runDiagnostics,
        diagnosticResults,
        isDiagnosticRunning,
      }}
    >
      {children}
    </WialonContext.Provider>
  );
};

export const useWialon = () => useContext(WialonContext);
