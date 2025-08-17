import React, { createContext, useContext, useEffect, useState } from "react";
import { getWialonUnits, initializeWialon } from "../api/wialon";
import { getEnvVar } from "../utils/envUtils";

// Define Wialon context type
interface WialonContextType {
  session: any;
  loggedIn: boolean;
  initializing: boolean;
  initialized: boolean;
  units: any[];
  error: Error | null;
  token: string | null;
  login: () => void;
  logout: () => void;
  refreshUnits: () => Promise<any[]>;
  setToken: (token: string) => void;
  runDiagnostics: () => Promise<void>;
  diagnosticResults: any[];
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
  runDiagnostics: async () => {},
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
  const [token, setTokenState] = useState<string | null>(() => {
    // Initialize from localStorage if available
    const storedToken = localStorage.getItem('wialonToken');
    return storedToken || getEnvVar("VITE_WIALON_SESSION_TOKEN", "");
  });
  const [diagnosticResults, setDiagnosticResults] = useState<any[]>([]);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);

  // Auto-initialize Wialon when component mounts
  useEffect(() => {
    let mounted = true;
    let checkCount = 0;
    const MAX_CHECKS = 20; // Maximum number of checks (20 seconds)

    const initWialon = async () => {
      // Increment check counter
      checkCount++;

      if (!window.wialon) {
        console.log(
          `Wialon SDK not available yet, waiting... (attempt ${checkCount}/${MAX_CHECKS})`
        );

        // If we've exceeded max checks, show a more helpful error
        if (checkCount >= MAX_CHECKS) {
          console.error(
            "Failed to load Wialon SDK after multiple attempts. Check network connection and script URL."
          );
          if (mounted) {
            setError(
              new Error(
                "Failed to load Wialon SDK. Please check your internet connection and try refreshing the page."
              )
            );
            setInitializing(false);
          }
          return;
        }

        // If SDK not loaded, wait and check again
        setTimeout(initWialon, 1000);
        return;
      }

      setInitializing(true);

      try {
        // Get session instance
        const sess = window.wialon.core.Session.getInstance();
        if (mounted) setSession(sess);

        // Initialize Wialon using our auto-init function
        const success = await initializeWialon();

        if (mounted) {
          setInitialized(success);
          setLoggedIn(success);

          if (success) {
            // Load units automatically
            const unitsList = await getWialonUnits();
            setUnits(unitsList);
            console.log(`Wialon auto-initialized with ${unitsList.length} units`);
          }
        }
      } catch (err) {
        console.error("Error during Wialon auto-initialization:", err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (mounted) setInitializing(false);
      }
    };

    // Start initialization immediately
    initWialon();

    return () => {
      mounted = false;
    };
  }, []);

  const refreshUnits = async () => {
    try {
      const unitsList = await getWialonUnits();
      setUnits(unitsList);
      return unitsList;
    } catch (err) {
      console.error("Error refreshing units:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return [];
    }
  };

  // Method to set token from external components (like WialonIntegration)
  const setToken = (newToken: string) => {
    // Store in state
    setTokenState(newToken);

    // Store in localStorage for persistence
    localStorage.setItem('wialonToken', newToken);

    // If we have a session, try to login with the new token
    if (session) {
      // Attempt to login with the new token
      login(newToken);
    }
  };

  const login = async (customToken?: string) => {
    if (!session) return;

    try {
      setInitializing(true);

      // Use the provided token, or fall back to the state token
      const tokenToUse = customToken || token;

      if (!tokenToUse) {
        setError(new Error("No token available for login"));
        setInitializing(false);
        return;
      }

      // Initialize the session
      session.initSession("https://hosting.wialon.com");

      // Login with the token
      session.loginToken(tokenToUse, "", async (code: number) => {
        const success = code === 0;
        setLoggedIn(success);

        if (success) {
          setInitialized(true);
          await refreshUnits();
        } else {
          setError(new Error(`Login failed with code: ${code}`));
        }
        setInitializing(false);
      });
    } catch (err) {
      console.error("Error during login:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setInitializing(false);
    }
  };

  const logout = () => {
    if (session) {
      session.logout(() => {
        setLoggedIn(false);
        setInitialized(false);
        setUnits([]);
      });
    }
  };
  
  const runDiagnostics = async () => {
    try {
      // Import the diagnostic tools dynamically to avoid circular dependencies
      setIsDiagnosticRunning(true);
      const { runWialonDiagnostics } = await import('../utils/wialonDiagnostics');
      const results = await runWialonDiagnostics();
      setDiagnosticResults(results);
      return results;
    } catch (error) {
      console.error('Failed to run Wialon diagnostics:', error);
      setError(error instanceof Error ? error : new Error('Unknown diagnostic error'));
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
      }}
    >
      {children}
    </WialonContext.Provider>
  );
};

export const useWialon = () => useContext(WialonContext);
