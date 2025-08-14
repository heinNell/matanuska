import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  ConnectionStatus,
  attemptReconnect,
  getConnectionStatus,
  onConnectionStatusChanged,
} from "../../utils/firebaseConnectionHandler";

interface FirestoreConnectionErrorProps {
  // Optional explicitly passed error (original behavior)
  error?: Error | null;
  // Whether to always show the component, even in connected state (as a status indicator)
  showAlways?: boolean;
}

/**
 * Enhanced Firestore connection error component
 * - Listens for connection status changes
 * - Displays appropriate messages based on status
 * - Provides retry functionality
 * - Shows custom event-based errors
 */
const FirestoreConnectionError: React.FC<FirestoreConnectionErrorProps> = ({
  error: propError,
  showAlways = false,
}) => {
  // State to track connection status and errors
  const [connectionState, setConnectionState] = useState<ConnectionStatus>(
    getConnectionStatus().status
  );
  const [connectionError, setConnectionError] = useState<Error | null>(
    propError || getConnectionStatus().error
  );
  const [isRetrying, setIsRetrying] = useState(false);
  const [customErrorMessage, setCustomErrorMessage] = useState<string | null>(null);

  // Listen for connection status changes
  useEffect(() => {
    // Subscribe to connection status changes from our handler
    const unsubscribe = onConnectionStatusChanged((status, error) => {
      setConnectionState(status);
      setConnectionError(error || null);
    });

    // Listen for custom firestore-connection-error events
    const handleCustomError = (event: CustomEvent) => {
      setCustomErrorMessage(event.detail.message || null);
      setConnectionError(event.detail.error || null);
    };

    window.addEventListener("firestore-connection-error", handleCustomError as EventListener);

    return () => {
      unsubscribe();
      window.removeEventListener("firestore-connection-error", handleCustomError as EventListener);
    };
  }, []);

  // Handle retry button click
  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await attemptReconnect();
      // Connection status will be updated via the onConnectionStatusChanged listener
    } catch (error) {
      console.error("Manual retry failed:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  // Hide if connected and not set to always show
  if (connectionState === "connected" && !showAlways) {
    return null;
  }

  // Different color schemes based on status
  let colorScheme = {
    bg: "bg-red-50",
    border: "border-red-400",
    text: "text-red-800",
    icon: "text-red-500",
  };

  if (connectionState === "connected") {
    colorScheme = {
      bg: "bg-green-50",
      border: "border-green-400",
      text: "text-green-800",
      icon: "text-green-500",
    };
  } else if (connectionState === "connecting") {
    colorScheme = {
      bg: "bg-yellow-50",
      border: "border-yellow-400",
      text: "text-yellow-800",
      icon: "text-yellow-500",
    };
  } else if (connectionState === "disconnected") {
    colorScheme = {
      bg: "bg-gray-50",
      border: "border-gray-400",
      text: "text-gray-800",
      icon: "text-gray-500",
    };
  }

  // Get appropriate title and message based on status
  let title = "Firestore Connection Error";
  let message = connectionError?.message || "An unknown error occurred connecting to Firestore";

  if (customErrorMessage) {
    message = customErrorMessage;
  } else if (connectionState === "connected") {
    title = "Connected to Firestore";
    message = "Your connection to the database is active.";
  } else if (connectionState === "connecting") {
    title = "Connecting to Firestore";
    message = "Attempting to establish a connection...";
  } else if (connectionState === "disconnected") {
    title = "Disconnected from Firestore";
    message = "You are currently offline. Some features may be limited.";
  }

  // Icon selection based on state
  const IconComponent =
    connectionState === "connected"
      ? Wifi
      : connectionState === "disconnected"
        ? WifiOff
        : connectionState === "connecting"
          ? RefreshCw
          : AlertTriangle;

  return (
    <div className={`${colorScheme.bg} border-l-4 ${colorScheme.border} p-4 my-4 rounded-r`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent
            className={`h-5 w-5 ${colorScheme.icon} ${connectionState === "connecting" ? "animate-spin" : ""}`}
          />
        </div>
        <div className="ml-3 flex-grow">
          <h3 className={`text-sm font-medium ${colorScheme.text}`}>{title}</h3>
          <div className={`mt-2 text-sm ${colorScheme.text}`}>
            <p>{message}</p>

            {connectionState !== "connected" && (
              <p className="mt-2">
                Please check your connection and try again. If the problem persists, contact
                support.
              </p>
            )}
          </div>
        </div>

        {connectionState !== "connected" && (
          <div className="flex-shrink-0 self-center">
            <button
              className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md
                ${isRetrying ? "bg-gray-300 text-gray-700" : "bg-blue-600 hover:bg-blue-700 text-white"}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              onClick={handleRetry}
              disabled={isRetrying || connectionState === "connecting"}
            >
              {isRetrying ? "Retrying..." : "Retry Connection"}
              {isRetrying && <RefreshCw className="ml-1 h-3 w-3 animate-spin" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirestoreConnectionError;
