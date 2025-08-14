import type { WialonSensor, WialonUnit } from "../types/wialon-types";
import { ErrorCategory, ErrorSeverity, logError } from "../utils/errorHandling";

// Import the Wialon SDK type definitions
import "../types/wialon-sdk.d.ts";

// Wialon SDK is exposed on the window object
// Note: The Window interface for wialon is already declared in wialon-sdk.d.ts
declare global {
  interface Window {
    W: typeof W;
  }
}

// Configuration
const TOKEN =
  import.meta.env.VITE_WIALON_TOKEN ||
  "c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053";
// Fix for spaces in the URL from environment variables
const WIALON_API_URL = import.meta.env.VITE_WIALON_API_URL?.trim() || "https://hst-api.wialon.com";
const WIALON_SDK_URL = "https://hst-api.wialon.com/wsdk/script/wialon.js";

// State management
let wialonInitialized = false;
let session: any = null; // Using any for Wialon session as it has complex API
let units: WialonUnit[] = [];
let lastConnectionAttempt = 0;
let connectionAttempts = 0;
const CONNECTION_COOLDOWN = 30000; // 30 seconds between auto-retry attempts
const MAX_AUTO_RETRIES = 3;

// A promise to manage the loading of the Wialon SDK script
const wialonSdkLoadedPromise = new Promise<void>((resolve, reject) => {
  if (typeof window === "undefined") {
    resolve();
    return;
  }

  // Check if SDK is already loaded
  if (window.wialon) {
    console.log("Wialon SDK already loaded");
    resolve();
    return;
  }

  const script = document.createElement("script");
  script.src = WIALON_SDK_URL;
  script.async = true;

  script.onload = () => {
    // We need to wait for the `wialon` object to be fully available
    const checkInterval = setInterval(() => {
      if (window.wialon) {
        clearInterval(checkInterval);
        console.log("Wialon SDK loaded from script");
        resolve();
      }
    }, 100);

    setTimeout(() => {
      if (!window.wialon) {
        clearInterval(checkInterval);
        reject(new Error("Wialon SDK initialization timeout"));
      }
    }, 5000);
  };

  script.onerror = () => {
    reject(new Error("Failed to load Wialon SDK"));
  };

  document.head.appendChild(script);
});

// A utility function for consistent logging
function log(message: string, isError: boolean = false): void {
  if (isError) {
    console.error(message);
  } else {
    console.log(message);
  }
}

/**
 * Initializes the Wialon SDK, logs in with a token, and loads units.
 * This function should be called once at the start of the application.
 * @returns A promise that resolves to `true` if initialization is successful, `false` otherwise.
 */
export async function initializeWialon(): Promise<boolean> {
  // In development mode with no Wialon integration, return success to avoid excessive errors
  if (import.meta.env.DEV && import.meta.env.VITE_DISABLE_WIALON_INTEGRATION === "true") {
    console.log("Wialon integration disabled in development mode");
    wialonInitialized = true;
    return true;
  }

  if (wialonInitialized) {
    console.log("Wialon already initialized.");
    return true;
  }

  try {
    // Wait for SDK to load
    await wialonSdkLoadedPromise;

    if (!window.wialon) {
      log("Wialon SDK not available", true);
      return false;
    }

    const W = window.wialon;
    session = W.core.Session.getInstance();

    if (!session) {
      log("Failed to get Wialon session instance", true);
      return false;
    }

    session.initSession(WIALON_API_URL);

    const loginSuccess = await new Promise<boolean>((resolve) => {
      session.loginToken(TOKEN, "", (code: number) => {
        if (code) {
          const errorText = W.core.Errors.getErrorText(code);
          logError(`Wialon login failed: ${errorText}`, {
            category: ErrorCategory.API,
            severity: ErrorSeverity.ERROR,
            context: { code, errorText },
          });
          resolve(false);
        } else {
          log("Wialon login successful");
          resolve(true);
        }
      });
    });

    if (!loginSuccess) {
      return false;
    }

    // Load required libraries for icons, etc.
    session.loadLibrary("itemIcon");

    const dataFlags =
      W.item.Item.dataFlag.base |
      W.item.Unit.dataFlag.sensors |
      W.item.Unit.dataFlag.lastMessage |
      W.item.Unit.dataFlag.lastPosition;

    const updateSuccess = await new Promise<boolean>((resolve) => {
      session.updateDataFlags(
        [{ type: "type", data: "avl_unit", flags: dataFlags, mode: 0 }],
        (code: number) => {
          if (code) {
            const errorText = W.core.Errors.getErrorText(code);
            logError(`Failed to load Wialon units: ${errorText}`, {
              category: ErrorCategory.API,
              severity: ErrorSeverity.ERROR,
              context: { code, errorText },
            });
            resolve(false);
          } else {
            units = session.getItems("avl_unit") as WialonUnit[];
            log(`Loaded ${units.length} Wialon units`);

            // Set up position change listeners for each unit
            units.forEach((unit) => {
              if (unit.addListener) {
                unit.addListener("changePosition", () => {
                  log(`Unit ${unit.getId?.()} position updated.`);
                });
              }
            });
            resolve(true);
          }
        }
      );
    });

    if (updateSuccess) {
      wialonInitialized = true;
      log("Wialon initialization completed successfully");
    }

    return updateSuccess;
  } catch (error) {
    logError(`Wialon initialization error: ${error}`, {
      category: ErrorCategory.API,
      severity: ErrorSeverity.ERROR,
      context: { error: String(error) },
    });
    return false;
  }
}

/**
 * Retrieves the list of all loaded Wialon units.
 * @returns An array of WialonUnit objects, or an empty array if not initialized.
 */
export function getWialonUnits(): WialonUnit[] {
  if (!wialonInitialized) {
    log("Wialon not initialized", true);
    return [];
  }
  return units;
}

/**
 * Finds a Wialon unit by its ID.
 * @param unitId The ID of the unit to find.
 * @returns The WialonUnit object or `null` if not found.
 */
export function getUnitById(unitId: number): WialonUnit | null {
  if (!wialonInitialized || !session) {
    log("Wialon not initialized or no session", true);
    return null;
  }

  try {
    return session.getItem(unitId) as WialonUnit;
  } catch (error) {
    logError(`Error getting unit ${unitId}: ${error}`, {
      category: ErrorCategory.API,
      severity: ErrorSeverity.WARNING,
      context: { error: String(error), unitId },
    });
    return null;
  }
}

/**
 * Retrieves all sensors for a specific unit.
 * @param unitId The ID of the unit.
 * @returns An array of WialonSensor objects, or an empty array if the unit is not found or has no sensors.
 */
export function getUnitSensors(unitId: number): WialonSensor[] {
  const unit = getUnitById(unitId);
  if (!unit) return [];

  try {
    const sensors = unit.getSensors?.();
    return sensors ? Object.values(sensors) : [];
  } catch (error) {
    logError(`Error getting sensors for unit ${unitId}: ${error}`, {
      category: ErrorCategory.API,
      severity: ErrorSeverity.WARNING,
      context: { error: String(error), unitId },
    });
    return [];
  }
}

/**
 * Calculates the value of a specific sensor for a unit.
 * @param unitId The ID of the unit.
 * @param sensorId The ID of the sensor.
 * @returns The calculated sensor value, "N/A" if data is unavailable, or `null` on error.
 */
export function getSensorValue(unitId: number, sensorId: number): number | string | null {
  const unit = getUnitById(unitId);
  if (!unit) return null;

  try {
    const sensor = unit.getSensor?.(sensorId);
    if (!sensor) return null;

    const lastMessage = unit.getLastMessage?.();
    if (!lastMessage) return "N/A";

    const result = unit.calculateSensorValue?.(sensor, lastMessage);
    if (result === undefined) return null;

    // Handle Wialon's special value for invalid data
    return result === -348201.3876 ? "N/A" : result;
  } catch (error) {
    logError(`Error getting sensor value for unit ${unitId}, sensor ${sensorId}: ${error}`, {
      category: ErrorCategory.API,
      severity: ErrorSeverity.WARNING,
      context: { error: String(error), unitId, sensorId },
    });
    return null;
  }
}

/**
 * Retrieves detailed information about a unit, including its last known position.
 * @param unitId The ID of the unit.
 * @returns An object with unit details, or `null` if the unit is not found.
 */
export function getUnitDetails(unitId: number) {
  const unit = getUnitById(unitId);
  if (!unit) return null;

  try {
    const pos: any = unit.getPosition?.() ?? null;
    const baseDetails = {
      id: unitId,
      name: unit.getName?.() || `Unit ${unitId}`,
      iconUrl: unit.getIconUrl?.(32),
    };

    if (!pos) {
      return { ...baseDetails, position: null };
    }

    return {
      ...baseDetails,
      position: {
        latitude: pos.y,
        longitude: pos.x,
        speed: pos.s,
        course: pos.c,
        timestamp: pos.t,
        satellites: pos.sc,
      },
    };
  } catch (error) {
    logError(`Error getting unit details for ${unitId}: ${error}`, {
      category: ErrorCategory.API,
      severity: ErrorSeverity.WARNING,
      context: { error: String(error), unitId },
    });
    return null;
  }
}

/**
 * Registers a listener for new messages from a specific unit.
 * @param unitId The ID of the unit.
 * @param callback The function to call when a new message is received.
 * @returns The listener's event ID or `null` if registration fails.
 */
export function registerUnitMessageListener(
  unitId: number,
  callback: (data: any) => void
): number | null {
  const unit = getUnitById(unitId);
  if (!unit || !unit.addListener) return null;

  try {
    return unit.addListener("messageRegistered", (event: any) => {
      const data = event.getData();
      callback(data);
    });
  } catch (error) {
    logError(`Error registering message listener for unit ${unitId}: ${error}`, {
      category: ErrorCategory.API,
      severity: ErrorSeverity.WARNING,
      context: { error: String(error), unitId },
    });
    return null;
  }
}

/**
 * Unregisters a message listener for a specific unit.
 * @param unitId The ID of the unit.
 * @param eventId The event ID returned by `registerUnitMessageListener`.
 */
export function unregisterUnitMessageListener(unitId: number, eventId: number): void {
  const unit = getUnitById(unitId);
  if (!unit || !unit.removeListenerById) return;

  try {
    unit.removeListenerById(eventId);
  } catch (error) {
    logError(`Error unregistering listener ${eventId} for unit ${unitId}: ${error}`, {
      category: ErrorCategory.API,
      severity: ErrorSeverity.WARNING,
      context: { error: String(error), unitId, eventId },
    });
  }
}

/**
 * Checks if the Wialon SDK has been successfully initialized.
 * @returns `true` if initialized, `false` otherwise.
 */
export function isWialonInitialized(): boolean {
  return wialonInitialized;
}

/**
 * Provides direct access to the Wialon session object. Use with caution.
 * @returns The Wialon session object or `null`.
 */
export function getWialonSession(): any {
  return session;
}

/**
 * Disconnects the current Wialon session.
 */
export function disconnectWialon(): void {
  if (session && session.logout) {
    try {
      session.logout();
      wialonInitialized = false;
      session = null;
      units = [];
      log("Wialon session disconnected");
    } catch (error) {
      logError(`Error disconnecting Wialon: ${error}`, {
        category: ErrorCategory.API,
        severity: ErrorSeverity.ERROR,
        context: { error: String(error) },
      });
    }
  }
}

/**
 * Attempts to reconnect to the Wialon API after a disconnection.
 * It includes a cooldown and retry mechanism to prevent excessive attempts.
 * @returns A promise that resolves to `true` if reconnection is successful, `false` otherwise.
 */
export async function reconnectWialon(): Promise<boolean> {
  const now = Date.now();

  // Prevent too frequent reconnection attempts
  if (now - lastConnectionAttempt < CONNECTION_COOLDOWN) {
    log("Reconnection attempt too soon, waiting...");
    return false;
  }

  if (connectionAttempts >= MAX_AUTO_RETRIES) {
    log("Max reconnection attempts reached", true);
    return false;
  }

  lastConnectionAttempt = now;
  connectionAttempts++;

  log(`Attempting Wialon reconnection (attempt ${connectionAttempts}/${MAX_AUTO_RETRIES})`);

  disconnectWialon();

  // Try to reinitialize
  const success = await initializeWialon();

  if (success) {
    connectionAttempts = 0; // Reset on successful connection
    log("Wialon reconnection successful");
  } else {
    log("Wialon reconnection failed", true);
  }

  return success;
}
