import React, { useEffect, useState } from "react";
import AppRoutes from "./AppRoutes";

// ---------- Context Providers ----------
import { AppProvider } from "./context/AppContext";
import { DriverBehaviorProvider } from "./context/DriverBehaviorContext";
import { FlagsProvider } from "./context/FlagsContext";
import { FleetAnalyticsProvider } from "./context/FleetAnalyticsContext";
import { InventoryProvider } from "./context/InventoryContext";
import { SyncProvider } from "./context/SyncContext";
import { TaskHistoryProvider } from "./context/TaskHistoryContext";
import { TripProvider } from "./context/TripContext";
import { TripSelectionProvider } from "./context/TripSelectionContext";
import { TyreProvider } from "./context/TyreContext";
import { TyreReferenceDataProvider } from "./context/TyreReferenceDataContext";
import { TyreStoresProvider } from "./context/TyreStoresContext";
import { WialonProvider } from "./context/WialonProvider";
import { WorkshopProvider } from "./context/WorkshopContext";

// ---------- UI Providers ----------
import AntDesignProvider from "./components/ui/AntDesignProvider";

/**
 * AppProviders component that wraps all the context providers in the application.
 * This ensures a clean organization of the provider nesting structure.
 */
const AppProviders: React.FC<React.PropsWithChildren> = ({ children }) => (
  <AntDesignProvider>
    <AppProvider>
      <SyncProvider>
        <WialonProvider>
          <InventoryProvider>
            <TripProvider>
              <TaskHistoryProvider>
                <TripSelectionProvider>
                  <DriverBehaviorProvider>
                    <WorkshopProvider>
                      <FleetAnalyticsProvider>
                        <FlagsProvider>
                          <TyreStoresProvider>
                            <TyreProvider>
                              <TyreReferenceDataProvider>{children}</TyreReferenceDataProvider>
                            </TyreProvider>
                          </TyreStoresProvider>
                        </FlagsProvider>
                      </FleetAnalyticsProvider>
                    </WorkshopProvider>
                  </DriverBehaviorProvider>
                </TripSelectionProvider>
              </TaskHistoryProvider>
            </TripProvider>
          </InventoryProvider>
        </WialonProvider>
      </SyncProvider>
    </AppProvider>
  </AntDesignProvider>
);

// Error Handling
import DeploymentFallback from "./components/DeploymentFallback";
import ErrorBoundary from "./components/ErrorBoundary";
import FirestoreConnectionError from "./components/ui/FirestoreConnectionError";
import OfflineBanner from "./components/ui/OfflineBanner";
import { normalizeError, safeStringify } from "./utils/error-utils";
import {
  ErrorCategory,
  ErrorSeverity,
  handleError,
  registerErrorHandler,
} from "./utils/errorHandling";

// Offline & Network Support
import { initializeConnectionMonitoring } from "./utils/firebaseConnectionHandler";
import { startNetworkMonitoring } from "./utils/networkDetection";
import { initOfflineCache } from "./utils/offlineCache";
import { syncOfflineOperations } from "./utils/offlineOperations";

// Define a single status enum to manage app state more cleanly
enum AppStatus {
  Loading = "loading",
  Ready = "ready",
  Error = "error",
}

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.Loading);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [emitError, setEmitError] = useState<((error: any) => void) | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const initializeServices = async () => {
      try {
        // Show fallback for debugging or critical errors from env variables
        if (import.meta.env.VITE_DEBUG_DEPLOYMENT || import.meta.env.VITE_SHOW_FALLBACK) {
          console.log("🐛 Debug mode enabled - showing fallback");
          setStatus(AppStatus.Error);
          return; // exit initializeServices early
        }

        const unregisterErrorHandler = registerErrorHandler((errLike) => {
          const err = normalizeError(errLike);

          // High-signal logs with grouped formatting
          console.groupCollapsed(
            `[AppError] ${err.name}${err.code ? ` (${err.code})` : ""}: ${err.message}`
          );
          if (err.stack) console.log("📍 Stack:", err.stack);
          if (err.status) console.log("🔢 Status:", err.status);
          console.log("📦 Original:", err.original);
          console.log("🛠️ Serialized:", safeStringify(err.original));
          console.groupEnd();

          // Existing severity handling
          if ((errLike as any)?.severity === ErrorSeverity.FATAL) {
            setConnectionError(err.original as any);
            setStatus(AppStatus.Error);
          }
        });

        // Store the error emitter for other components to use
        setEmitError(() => (error: any) => {
          const normalized = normalizeError(error);
          // Manually call each registered handler
          registerErrorHandler(() => {}); // This returns the unregister function
          // Instead, we'll log the error and let existing system handle it
          console.error("🚨 Manual Error Emission:", normalized);
        });

        // Global error handlers for unhandled cases
        const handleUnhandledRejection = (evt: PromiseRejectionEvent) => {
          const normalized = normalizeError(evt.reason);
          console.error("🚨 Unhandled Promise Rejection:", normalized);
        };

        const handleGlobalError = (evt: ErrorEvent) => {
          const normalized = normalizeError(evt.error ?? evt.message);
          console.error("🚨 Global Script Error:", normalized);
        };

        // Register global handlers
        window.addEventListener("unhandledrejection", handleUnhandledRejection);
        window.addEventListener("error", handleGlobalError);

        // Initialize services and handle potential errors
        try {
          await initializeConnectionMonitoring();
          await handleError(async () => await initOfflineCache(), {
            category: ErrorCategory.DATABASE,
            context: { component: "App", operation: "initOfflineCache" },
            maxRetries: 3,
          });
        } catch (error) {
          console.warn("Initialization failed:", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          setConnectionError(new Error(`Failed to initialize: ${errorMessage}`));
          setStatus(AppStatus.Error);
        }

        startNetworkMonitoring(30000);
        const handleOnline = async () => {
          try {
            await handleError(async () => await syncOfflineOperations(), {
              category: ErrorCategory.NETWORK,
              context: { component: "App", operation: "syncOfflineOperations" },
              maxRetries: 3,
            });
          } catch {
            // Error is already handled by handleError utility
          }
        };
        window.addEventListener("online", handleOnline);

        // If no fatal errors occurred, set status to ready
        if (status !== AppStatus.Error) {
          setStatus(AppStatus.Ready);
        }
        cleanup = () => {
          window.removeEventListener("online", handleOnline);
          window.removeEventListener("unhandledrejection", handleUnhandledRejection);
          window.removeEventListener("error", handleGlobalError);
          unregisterErrorHandler();
        };
      } catch (error) {
        console.error("Failed to initialize services:", error);
        setStatus(AppStatus.Error);
      }
    };

    initializeServices();
    return () => {
      if (cleanup) cleanup();
    };
  }, [status]); // Add status to dependencies to prevent infinite loop if an error occurs

  if (status === AppStatus.Loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  if (status === AppStatus.Error) {
    // Show a detailed error or a generic fallback
    return <DeploymentFallback />;
  }

  return (
    <ErrorBoundary
      onError={(error, _errorInfo) => {
        const normalized = normalizeError(error);
        console.error("🚨 React Error Boundary triggered:", normalized);

        // Use our stored error emitter if available
        if (emitError) {
          emitError(normalized);
        }
      }}
    >
      <AppProviders>
        {/* Application alerts and notifications */}
        <div className="fixed top-0 left-0 right-0 z-50 p-4">
          {connectionError && <FirestoreConnectionError error={connectionError} />}
        </div>

        <OfflineBanner />

        {/* Main application routes and layout */}
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col">
          <AppRoutes />
        </div>
      </AppProviders>
    </ErrorBoundary>
  );
};

export default App;
