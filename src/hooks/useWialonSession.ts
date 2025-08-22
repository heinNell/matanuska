import { useEffect, useRef, useState } from "react";
import { WialonSession } from "../types/wialon";
import type { WialonUser } from "../types/wialon";

// Use environment variables for configuration
const TOKEN = import.meta.env.VITE_WIALON_SESSION_TOKEN || "";
const WIALON_API_URL = import.meta.env.VITE_WIALON_API_URL || "https://hst-api.wialon.com";

// Updated to include the 'sid' property.
export interface WialonCoreSessionInfo {
  sid: string; // The session ID is now explicitly declared here.
  id: number;
  user: {
    id: number;
    name: string;
  };
}

// Add interface for return type
interface UseWialonSessionReturn {
  loggedIn: boolean;
  error: string | null;
  session: WialonCoreSessionInfo | null;
  token: string;
}

/**
 * Hook to manage Wialon session
 * Handles login, session maintenance, and safe session access
 */
export function useWialonSession(sdkReady: boolean): UseWialonSessionReturn {
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token] = useState<string>(TOKEN);
  // The useRef hook is now using the updated type that includes sid.
  const sessionRef = useRef<WialonCoreSessionInfo | null>(null);

  useEffect(() => {
    // Reset session state when SDK is not ready
    if (!sdkReady) {
      setLoggedIn(false);
      sessionRef.current = null;
      return;
    }

    // Reset error on login attempt
    setError(null);

    let isActive = true; // For cleanup handling

    const initializeSession = async () => {
      try {
        // Validate window.wialon exists
        if (!window.wialon || !window.wialon.core) {
          throw new Error("Wialon SDK not initialized properly");
        }

        const sess: WialonSession = window.wialon.core.Session.getInstance();

        if (!sess) {
          throw new Error("Failed to get Wialon session instance");
        }

        sess.initSession(WIALON_API_URL);

        if (!token || token === "your_token_here") {
          throw new Error("Invalid Wialon token. Please check your environment variables.");
        }

        sess.loginToken(token, "", (code: number) => {
          if (!isActive) return;

          if (code) {
            const errorMessage = window.wialon?.core?.Errors?.getErrorText ?
              window.wialon.core.Errors.getErrorText(code) :
              `Login failed with code ${code}`;

            console.error("Wialon login error:", errorMessage);
            setError(errorMessage);
            setLoggedIn(false);
            sessionRef.current = null;
          } else {
            // Successful login
            // The Wialon SDK provides a session ID after a successful login.
            const sidFromSdk = sess.sid;
            if (typeof sidFromSdk !== 'string' || !sidFromSdk) {
                console.error("Session ID is missing after successful login.");
                setLoggedIn(false);
                sessionRef.current = null;
                return;
            }

            try {
              const currentUser: WialonUser = sess.getCurrUser();

              const sessionObject: WialonCoreSessionInfo = {
                id: sess.getId(),
                user: {
                  id: currentUser?.getId() || 0,
                  name: currentUser?.getName() || 'Unknown User'
                },
                // The sid is correctly added to the session object here.
                sid: sidFromSdk
              };

              sessionRef.current = sessionObject;
              setLoggedIn(true);
            } catch (err) {
              console.error("Error extracting session data:", err);
              setError("Failed to initialize session after login");
              setLoggedIn(false);
              sessionRef.current = null;
            }
          }
        });
      } catch (err) {
        if (!isActive) return;
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("Session initialization error:", errorMessage);
        setError(errorMessage);
        setLoggedIn(false);
        sessionRef.current = null;
      }
    };

    initializeSession();

    return () => {
      isActive = false;
    };
  }, [sdkReady, token]);

  return {
    loggedIn,
    error,
    session: sessionRef.current,
    token
  };
}
