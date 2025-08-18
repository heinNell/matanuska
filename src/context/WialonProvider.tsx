// src/context/WialonProvider.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { getWialonUnits } from "../api/wialon"; // keep your helper
import { getEnvVar } from "../utils/envUtils";
import type { DiagnosticResult } from "../utils/wialonDiagnostics";
import { initWialonSession, logoutWialon } from "../utils/wialonInit";

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
  const [session, setSession] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [units, setUnits] = useState<any[]>([]);
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
        // Use improved initWialonSession (handles SDK, session, login, and diagnostics)
        const sess = await initWialonSession({ apiUrl: apiHost, token });
        if (!mounted) return;
        setSession(sess);
        setLoggedIn(true);
        setInitialized(true);

        // Fetch units after successful login
        try {
          const list = await getWialonUnits();
          if (mounted) setUnits(list);
        } catch (e) {
          console.error("Error fetching Wialon units after login:", e);
        }
      } catch (e: any) {
        if (!mounted) return;
        // Improved error reporting for Wialon codes
        const errorMsg = (e && e.message && e.message.includes("code 5"))
          ? `Wialon login failed (code 5): Authentication failed.
            • Check your token: it may be expired, revoked, or invalid.
            • See: https://sdk.wialon.com/wiki/en/sidebar/remoteapi/errors`
          : e instanceof Error ? e.message : String(e);

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
      const list = await getWialonUnits();
      setUnits(list);
      return list;
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
    logoutWialon();
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
    try {
      const { runWialonDiagnostics } = await import("../utils/wialonDiagnostics");
      const results = await runWialonDiagnostics();
      setDiagnosticResults(results);
      return results;
    } catch (e) {
      console.error("Failed to run Wialon diagnostics:", e);
      setError(e instanceof Error ? e : new Error("Unknown diagnostic error"));
      return [];
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
