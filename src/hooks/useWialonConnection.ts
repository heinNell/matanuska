import { useEffect, useState } from "react";
import { getEnvVar } from "../utils/envUtils";

interface WialonConnectionStatus {
  connected: boolean;
  user?: string;
  serverTime?: Date;
  errorMessage?: string;
  tokenExpiry?: Date;
}

/**
 * A hook to check Wialon connection status
 * @returns Connection status object and refresh function
 */
export function useWialonConnection() {
  const [status, setStatus] = useState<WialonConnectionStatus>({
    connected: false,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const token = getEnvVar("VITE_WIALON_SESSION_TOKEN", "");

  const checkConnection = async () => {
    setLoading(true);

    try {
      // Check if wialon SDK is loaded
      if (typeof window === "undefined" || !window.wialon) {
        setStatus({
          connected: false,
          errorMessage: "Wialon SDK not loaded",
        });
        setLoading(false);
        return;
      }

      // Get session instance
      const sess = window.wialon.core.Session.getInstance();

      // Check if already logged in
      if (sess.getCurrUser?.()) {
        const userData = sess.getCurrUser?.();
        setStatus({
          connected: true,
          user: userData?.getName?.(),
          serverTime: new Date((sess.getServerTime?.() || Date.now() / 1000) * 1000),
        });
        setLoading(false);
        return;
      }

      // Try to login with token
      if (!token) {
        setStatus({
          connected: false,
          errorMessage: "No Wialon token provided",
        });
        setLoading(false);
        return;
      }

      // Initialize session and login
      sess.initSession(
        "https://hosting.wialon.com/?token=c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053&lang=en"
      );
      sess.loginToken(token, "", (code: number) => {
        if (code) {
          setStatus({
            connected: false,
            errorMessage: window.wialon.core.Errors.getErrorText(code),
          });
        } else {
          const userData = sess.getCurrUser?.();
          // Calculate token expiry time if available in token response
          const tokenExpiry = sess.getTokenExpiration
            ? new Date(sess.getTokenExpiration() * 1000)
            : undefined;

          setStatus({
            connected: true,
            user: userData?.getName?.(),
            serverTime: new Date((sess.getServerTime?.() || Date.now() / 1000) * 1000),
            tokenExpiry,
          });
        }
        setLoading(false);
      });
    } catch (error) {
      setStatus({
        connected: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, [token]);

  return {
    status,
    loading,
    refresh: checkConnection,
  };
}

export default useWialonConnection;
