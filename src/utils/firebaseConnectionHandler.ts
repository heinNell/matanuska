import {
  connectFirestoreEmulator,
  disableNetwork,
  enableNetwork,
  getFirestore,
} from "firebase/firestore";
import { firebaseApp } from "../firebaseConfig";

// Initialize Firestore
export const firestore = getFirestore(firebaseApp);

export type ConnectionStatus = "connected" | "disconnected" | "connecting" | "error";

let connectionStatus: ConnectionStatus = "connecting";
let connectionError: Error | null = null;
let connectionListeners: ((status: ConnectionStatus, error?: Error | null) => void)[] = [];
let emulatorConnected = false;
let networkRetryCount = 0;
const MAX_RETRY_ATTEMPTS = 3;

// --- HEALTH CHECK HELPERS (leave as-is) ---
const checkEmulatorHealth = async (
  host: string = "127.0.0.1",
  port: number = 8081
): Promise<boolean> => {
  try {
    // We don't need the response as we're just checking if the request succeeds
    await fetch(`http://${host}:${port}`, {
      method: "GET",
      mode: "no-cors",
      cache: "no-cache",
    });
    return true;
  } catch (error) {
    console.warn(`⚠️ Emulator health check failed: ${error}`);
    return false;
  }
};

// --- CONNECT TO EMULATOR (keep fallback, don't break prod) ---
export const connectToEmulator = async (): Promise<boolean> => {
  if (!import.meta.env.DEV || emulatorConnected) {
    return emulatorConnected;
  }

  try {
    console.log("🔄 Checking Firestore emulator availability...");
    const emulatorAvailable = await checkEmulatorHealth();
    if (!emulatorAvailable) {
      console.warn("⚠️ Firestore emulator is not accessible on 127.0.0.1:8081");
      setConnectionStatus("connected"); // Continue to prod
      return false;
    }

    console.log("🔄 Connecting to Firestore emulator...");
    connectFirestoreEmulator(firestore, "127.0.0.1", 8081);
    emulatorConnected = true;
    console.log("✅ Connected to Firestore emulator");
    setConnectionStatus("connected");
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to Firestore emulator:", error);
    if (error instanceof Error && error.message.includes("already")) {
      emulatorConnected = true;
      setConnectionStatus("connected");
      return true;
    }
    setConnectionStatus("connected");
    return false;
  }
};

// --- STATUS MANAGEMENT ---
export const setConnectionStatus = (status: ConnectionStatus, error?: Error | null) => {
  connectionStatus = status;
  connectionError = error || null;
  connectionListeners.forEach((listener) => listener(status, error));
  if (status === "connected") {
    console.log("✅ Connected to Firestore");
  } else if (status === "disconnected") {
    console.warn("⚠️ Disconnected from Firestore - operating in offline mode");
  } else if (status === "error") {
    console.error("❌ Firestore connection error:", error);
  }
};

export const onConnectionStatusChanged = (
  callback: (status: ConnectionStatus, error?: Error | null) => void
): (() => void) => {
  connectionListeners.push(callback);
  callback(connectionStatus, connectionError);
  return () => {
    connectionListeners = connectionListeners.filter((listener) => listener !== callback);
  };
};

export const getConnectionStatus = (): { status: ConnectionStatus; error: Error | null } => {
  return { status: connectionStatus, error: connectionError };
};

// --- INITIALIZE MONITORING ---
export const initializeConnectionMonitoring = async () => {
  console.log("🔄 Initializing Firestore connection monitoring...");
  startConnectionHealthMonitor();

  window.addEventListener("online", () => {
    console.log("🌐 Browser reports online status");
    if (connectionStatus === "disconnected") {
      setConnectionStatus("connecting");
      attemptReconnect();
    }
  });
  window.addEventListener("offline", () => {
    console.log("🌐 Browser reports offline status");
    setConnectionStatus("disconnected");
  });

  if (!navigator.onLine) {
    setConnectionStatus("disconnected");
    return;
  }

  // Try emulator, but doesn't error if fails
  const emulatorConnected = await connectToEmulator();
  if (!emulatorConnected && import.meta.env.DEV) {
    console.info("📡 Emulator not connected - using production Firebase");
  }

  if (navigator.onLine) {
    setConnectionStatus("connected");
  }
};

export const attemptReconnect = async (): Promise<boolean> => {
  if (connectionStatus === "connected") {
    return true;
  }
  setConnectionStatus("connecting");
  try {
    if (!navigator.onLine) {
      setConnectionStatus("disconnected");
      return false;
    }
    if (import.meta.env.DEV) {
      const emulatorConnected = await connectToEmulator();
      if (emulatorConnected) {
        setConnectionStatus("connected");
        return true;
      } else {
        setConnectionStatus("error", new Error("Failed to connect to Firestore emulator"));
        return false;
      }
    }
    setConnectionStatus("connected");
    return true;
  } catch (error) {
    setConnectionStatus("error", error as Error);
    return false;
  }
};

// --- ENHANCED ERROR HANDLING (robust against WebChannel 'transport' issues) ---
export const handleFirestoreError = async (error: any): Promise<void> => {
  console.warn("🔄 Firestore operation failed, analyzing error:", error);

  // Identify if this is a WebChannel/transport error
  const isWebChannelError =
    error?.code === "unavailable" ||
    error?.message?.includes("transport errored") ||
    error?.message?.includes("WebChannelConnection") ||
    error?.message?.includes("RPC") ||
    error?.message?.includes("Stream") ||
    error?.message?.includes("Listen stream") ||
    error?.message?.includes("Deadline") ||
    error?.message?.toLowerCase().includes("network");

  // WebChannel-specific & network retry logic with exponential backoff
  if (isWebChannelError) {
    networkRetryCount++;
    console.warn(
      `⚠️ WebChannel/network error detected (attempt ${networkRetryCount}/${MAX_RETRY_ATTEMPTS})`
    );

    // Log detailed diagnostics about the specific error
    if (error?.message?.includes("WebChannelConnection")) {
      console.info("📊 WebChannelConnection error details:", {
        errorCode: error?.code || "unknown",
        errorName: error?.name || "undefined",
        errorMessage: error?.message || "undefined",
        isRPC: error?.message?.includes("RPC") || false,
        isListenStream: error?.message?.includes("Listen stream") || false,
      });
    }

    if (networkRetryCount <= MAX_RETRY_ATTEMPTS) {
      // Exponential backoff: 2s, 4s, 8s
      const backoffTime = Math.min(2000 * Math.pow(2, networkRetryCount - 1), 10000);
      console.log(`🔄 Attempting automatic retry in ${backoffTime / 1000} seconds...`);

      try {
        // Notify any listeners that we're attempting to reconnect
        setConnectionStatus("connecting");

        // Disconnect, wait with backoff, then reconnect
        await disableNetwork(firestore);
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
        await enableNetwork(firestore);

        // Check if we're actually connected
        if (navigator.onLine) {
          setConnectionStatus("connected");
          networkRetryCount = 0;
          console.log("✅ Network reconnection successful");
        } else {
          setConnectionStatus("disconnected");
          console.warn("⚠️ Device appears to be offline after reconnection attempt");
        }
      } catch (retryError) {
        console.error("❌ Network reconnection failed:", retryError);
        setConnectionStatus("error", retryError as Error);
      }
    } else {
      console.error("❌ Max retry attempts reached, switching to offline mode");
      setConnectionStatus("disconnected", error);

      // Display a user-friendly message about connection issues
      showConnectionError(error);

      // Reset retry counter to allow future attempts when network conditions change
      networkRetryCount = 0;
    }
  } else {
    // Not a network error, but still an error
    setConnectionStatus("error", error);
  }
};

// Helper function to show a user-friendly error message about connection issues
const showConnectionError = (error: any) => {
  // This could be implemented with a toast notification or other UI component
  // For now, we'll just log to console, but in a production app this would show UI feedback
  console.error(
    "Connection Error: Unable to connect to the server. Please check your internet connection and try again."
  );

  // You could dispatch an event that UI components could listen for:
  const connectionEvent = new CustomEvent("firestore-connection-error", {
    detail: {
      message: "Connection to the server failed. Please check your network connection.",
      retry: () => attemptReconnect(),
      error,
    },
  });
  window.dispatchEvent(connectionEvent);
};

// --- ENHANCED CONNECTION HEALTH MONITOR ---
export const startConnectionHealthMonitor = () => {
  console.log("🔍 Starting Firestore connection health monitor...");

  // Monitor online/offline status
  window.addEventListener("online", () => {
    console.log("🌐 Network connection restored");
    networkRetryCount = 0;
    attemptReconnect(); // Actively try to reconnect when network is restored
  });

  window.addEventListener("offline", () => {
    console.log("📡 Network connection lost");
    setConnectionStatus("disconnected");
  });

  // Periodic health checks to detect and recover from silent failures
  setInterval(async () => {
    // Only attempt reconnection if we're in error state or disconnected but browser reports online
    if ((connectionStatus === "error" || connectionStatus === "disconnected") && navigator.onLine) {
      console.log("🔄 Periodic health check: attempting reconnection...");
      await attemptReconnect();
    }
  }, 30000);

  // Listen for visibility changes to handle laptop lid close/open scenarios
  document.addEventListener("visibilitychange", () => {
    if (
      document.visibilityState === "visible" &&
      navigator.onLine &&
      (connectionStatus === "error" || connectionStatus === "disconnected")
    ) {
      console.log("🔄 Page became visible: checking connection...");
      attemptReconnect();
    }
  });

  // Initial connection attempt
  if (navigator.onLine) {
    attemptReconnect();
  } else {
    setConnectionStatus("disconnected");
  }
};

export default firestore;
