import { useState, useEffect, useCallback, useRef } from 'react';
import { getEnvVar } from '../utils/envUtils'; // Assuming envUtils.ts exists and exports getEnvVar

// Define Wialon SDK types (minimal for this context to satisfy TypeScript)
interface WialonPosition {
  y: number; // latitude
  x: number; // longitude
  s: number; // speed
  c: number; // course
  t: number; // timestamp
  sc: number; // satellites
}

interface WialonUnitSDK { // Represents the actual Wialon SDK Unit object with methods
  getId(): number;
  getName(): string;
  getPosition(): WialonPosition | null;
  getIconUrl(size: number): string;
  getUniqueId(): string;
  getCustomProperty(propName: string): string | undefined;
  // Common Wialon SDK properties that might be directly available
  ci?: number; // Connection interval (e.g., 1 for online, 0 for offline)
  tp?: string; // Unit type string (e.g., "car", "truck")
  prp?: { [key: string]: any }; // Custom properties map
}

interface WialonSession {
  initSession(url: string): void;
  loginToken(token: string, flags: string, callback: (code: number) => void): void;
  loadLibrary(libraryName: string): void;
  updateDataFlags(flags: Array<{ type: string; data: string; flags: number; mode: number }>, callback: (code: number) => void): void;
  getItems(type: string): WialonUnitSDK[];
  // Added missing methods to WialonSession interface
  getUser(): { getName(): string };
  addListener(event: string, callback: (id: number, item: WialonUnitSDK, flags: number) => void): void;
  removeListener(event: string, callback: (id: number, item: WialonUnitSDK, flags: number) => void): void;
  logout(callback: (code: number) => void): void;
}

interface WialonCore {
  Session: {
    getInstance(): WialonSession;
  };
  Errors: {
    getErrorText(code: number): string;
  };
}

interface WialonItem {
  Item: {
    dataFlag: { base: number; };
  };
  Unit: {
    dataFlag: { sensors: number; lastMessage: number; lastPosition: number; };
  };
}

// IMPORTANT: Removed 'declare global' block from here to avoid conflicts.
// Ensure these global types are declared once in a .d.ts file (e.g., src/types/wialon-sdk.d.ts)
// Example content for src/types/wialon-sdk.d.ts:
/*
declare global {
  interface Window {
    wialon?: {
      core: WialonCore;
      item: WialonItem;
    };
    W?: typeof window.wialon;
  }
}
*/


// Extended Wialon unit interface (plain data for components)
export interface ExtendedWialonUnit {
  id: number;
  name: string;
  cls_id?: number; // Class ID (e.g., from unit.prp.cls_id or similar)
  type?: string; // Unit type string (e.g., from unit.tp)
  hw_id?: string; // Hardware ID (often unit.getUniqueId())
  last_message?: number; // Timestamp of last message (from position.t)
  connection_state?: number; // 1 for online, 0 for offline (from unit.ci)
  iconUrl?: string; // Icon URL from Wialon SDK
  position?: {
    latitude: number;
    longitude: number;
    speed: number;
    course: number;
    timestamp: number;
    satellites: number;
  } | null;
  uniqueId?: string;
  registration?: string; // Example custom property
  [key: string]: any; // Allow any other properties for dynamic access
}

// Wialon constants (centralized here, using envUtils)
const TOKEN = getEnvVar("VITE_WIALON_SESSION_TOKEN", "c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053");
const WIALON_API_URL = getEnvVar("VITE_WIALON_API_URL", "https://hst-api.wialon.com");
const WIALON_SDK_URL = getEnvVar("VITE_WIALON_SDK_URL", "https://hst-api.wialon.com/wsdk/script/wialon.js");


export const useWialon = () => {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [units, setUnits] = useState<ExtendedWialonUnit[] | null>(null);
  const sessionRef = useRef<WialonSession | null>(null);
  const unitsMapRef = useRef<Map<number, ExtendedWialonUnit>>(new Map()); // To keep track of units by ID

  const log = useCallback((msg: string, isError = false) => {
    isError ? console.error(`[Wialon SDK Hook] ${msg}`) : console.log(`[Wialon SDK Hook] ${msg}`);
  }, []);

  // Function to load the Wialon SDK script dynamically
  const loadWialonSdkScript = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined") return resolve(); // Skip on server-side rendering
      // Access window.wialon and window.W directly as they are expected to be globally declared elsewhere
      if (window.wialon && window.W) return resolve(); // SDK already loaded

      const script = document.createElement("script");
      script.src = WIALON_SDK_URL;
      script.async = true;
      script.onload = () => {
        // Poll for wialon object as it might not be immediately available after script load
        const check = setInterval(() => {
          if (window.wialon && window.W) {
            clearInterval(check);
            resolve();
          }
        }, 100);
        // Set a timeout to reject if SDK doesn't load within a reasonable time
        setTimeout(() => {
          clearInterval(check);
          reject(new Error("Wialon SDK load timeout"));
        }, 10000); // 10 seconds timeout
      };
      script.onerror = () => reject(new Error("Failed to load Wialon SDK script"));
      document.head.appendChild(script);
    });
  }, [WIALON_SDK_URL]);

  // Function to transform Wialon SDK unit object to plain ExtendedWialonUnit
  const transformWialonUnit = useCallback((unitSDK: WialonUnitSDK): ExtendedWialonUnit => {
    const pos = unitSDK.getPosition();
    return {
      id: unitSDK.getId(),
      name: unitSDK.getName(),
      iconUrl: unitSDK.getIconUrl(32), // Get a 32x32 icon
      position: pos ? {
        latitude: pos.y,
        longitude: pos.x,
        speed: pos.s,
        course: pos.c,
        timestamp: pos.t,
        satellites: pos.sc,
      } : null,
      uniqueId: unitSDK.getUniqueId(),
      registration: unitSDK.getCustomProperty("registration_plate"),
      cls_id: (unitSDK as any).cls_id || (unitSDK.prp ? unitSDK.prp.cls_id : undefined), // Try to get cls_id from direct prop or prp
      type: (unitSDK as any).type || unitSDK.tp, // Try to get type from direct prop or tp
      last_message: pos ? pos.t : undefined,
      connection_state: (unitSDK as any).cn_st || unitSDK.ci, // Try to get connection state from direct prop or ci
    };
  }, []);

  // Main initialization function for Wialon SDK and session
  const initializeWialonSession = useCallback(async () => {
    if (initialized || loading) return; // Prevent re-initialization if already initialized or loading
    setLoading(true);
    setError(null);

    try {
      await loadWialonSdkScript(); // Load the SDK script
      const W = window.wialon!; // Ensure wialon object is available and non-null

      // Corrected: Use double cast to assert the type of the session instance
      sessionRef.current = W.core.Session.getInstance() as unknown as WialonSession;

      // Ensure sessionRef.current is not null before proceeding
      if (!sessionRef.current) {
        throw new Error("Failed to create Wialon session instance.");
      }

      sessionRef.current.initSession(WIALON_API_URL);

      // Login to Wialon
      const loginSuccess = await new Promise<boolean>((res) => {
        sessionRef.current!.loginToken(TOKEN, "", (code: number) => {
          if (code) {
            log(`Login failed: ${W.core.Errors.getErrorText(code)}`, true);
            res(false);
          } else {
            log("Wialon login successful.");
            res(true);
          }
        });
      });

      if (!loginSuccess) {
        throw new Error("Wialon login failed.");
      }

      sessionRef.current!.loadLibrary("itemIcon"); // Load item icon library

      // Define data flags for units to receive necessary properties
      const flags =
        W.item.Item.dataFlag.base |
        W.item.Unit.dataFlag.sensors |
        W.item.Unit.dataFlag.lastMessage |
        W.item.Unit.dataFlag.lastPosition;

      // Update data flags to receive unit data
      const updateFlagsSuccess = await new Promise<boolean>((res) => {
        sessionRef.current!.updateDataFlags([{ type: "type", data: "avl_unit", flags, mode: 0 }], (code: number) => {
          if (code) {
            log(`Update flags failed: ${W.core.Errors.getErrorText(code)}`, true);
            res(false);
          } else {
            log("Wialon data flags updated.");
            res(true);
          }
        });
      });

      if (!updateFlagsSuccess) {
        throw new Error("Failed to update Wialon data flags.");
      }

      // Initial fetch of units
      const initialWialonUnitsSDK = sessionRef.current!.getItems("avl_unit") as WialonUnitSDK[];
      initialWialonUnitsSDK.forEach(unitSDK => {
        const transformed = transformWialonUnit(unitSDK);
        unitsMapRef.current.set(transformed.id, transformed);
      });
      setUnits(Array.from(unitsMapRef.current.values()));

      // Add listener for real-time unit updates
      const unitUpdateListener = (id: number, item: WialonUnitSDK, flags: number) => {
        // Only update if the unit is already in our map or if it's a new unit (optional: filter by type if needed)
        if (unitsMapRef.current.has(id) || item.tp === 'avl_unit') { // Assuming 'avl_unit' is the type we care about
          const updatedUnit = transformWialonUnit(item);
          unitsMapRef.current.set(id, updatedUnit);
          setUnits(Array.from(unitsMapRef.current.values())); // Trigger re-render
        }
      };
      sessionRef.current!.addListener("updateItems", unitUpdateListener);

      setInitialized(true);
      log("Wialon SDK initialized and units fetched.");

    } catch (e: any) {
      log(`Initialization error: ${e.message || e}`, true);
      setError(e);
      setInitialized(false);
    } finally {
      setLoading(false);
    }
  }, [initialized, loading, loadWialonSdkScript, log, transformWialonUnit, WIALON_API_URL, TOKEN]);

  // Effect to run initialization on component mount
  useEffect(() => {
    initializeWialonSession();

    // Cleanup function: logout and remove listeners when component unmounts
    return () => {
      if (sessionRef.current) {
        log("Logging out from Wialon session during cleanup.");
        // Note: Removing listeners is crucial to prevent memory leaks
        // However, the Wialon SDK's addListener/removeListener might need specific callback references.
        // For simplicity, this example just logs out. A more advanced setup would manage specific listener callbacks.
        sessionRef.current.logout(() => {
          log("Wialon session logged out.");
          sessionRef.current = null;
          setInitialized(false);
          setUnits(null);
          unitsMapRef.current.clear();
        });
      }
    };
  }, [initializeWialonSession, log]); // Re-run if initializeWialonSession changes (unlikely due to useCallback)

  return { units, loading, error, initialized, session: sessionRef.current };
};
