import { useState, useEffect, useCallback, useRef } from 'react';
import { getEnvVar } from '../utils/envUtils'; // Assuming envUtils.ts exists and exports getEnvVar

// --- Wialon SDK minimal typing for this context ---
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
  ci?: number;
  tp?: string;
  prp?: { [key: string]: any };
}

// --- Removed unused WialonCore and WialonItem interface declarations ---
// If you plan to use them, comment them back in below:
// interface WialonCore { ... }
// interface WialonItem { ... }

// --- Extended Wialon unit interface (plain data for components) ---
export interface ExtendedWialonUnit {
  id: number;
  name: string;
  cls_id?: number;
  type?: string;
  hw_id?: string;
  last_message?: number;
  connection_state?: number;
  iconUrl?: string;
  position?: {
    latitude: number;
    longitude: number;
    speed: number;
    course: number;
    timestamp: number;
    satellites: number;
  } | null;
  uniqueId?: string;
  registration?: string;
  [key: string]: any;
}

// --- Wialon constants ---
const TOKEN = getEnvVar("VITE_WIALON_SESSION_TOKEN", "c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053");
const WIALON_API_URL = getEnvVar("VITE_WIALON_API_URL", "https://hst-api.wialon.com");
const WIALON_SDK_URL = getEnvVar("VITE_WIALON_SDK_URL", "https://hst-api.wialon.com/wsdk/script/wialon.js");


export const useWialon = () => {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [units, setUnits] = useState<ExtendedWialonUnit[] | null>(null);
  const sessionRef = useRef<any>(null);
  const unitsMapRef = useRef<Map<number, ExtendedWialonUnit>>(new Map());

  const log = useCallback((msg: string, isError = false) => {
    isError ? console.error(`[Wialon SDK Hook] ${msg}`) : console.log(`[Wialon SDK Hook] ${msg}`);
  }, []);

  // Load Wialon SDK script dynamically
  const loadWialonSdkScript = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined") return resolve();
      if (window.wialon && window.W) return resolve();

      const script = document.createElement("script");
      script.src = WIALON_SDK_URL;
      script.async = true;
      script.onload = () => {
        const check = setInterval(() => {
          if (window.wialon && window.W) {
            clearInterval(check);
            resolve();
          }
        }, 100);
        setTimeout(() => {
          clearInterval(check);
          reject(new Error("Wialon SDK load timeout"));
        }, 10000);
      };
      script.onerror = () => reject(new Error("Failed to load Wialon SDK script"));
      document.head.appendChild(script);
    });
  }, [WIALON_SDK_URL]);

  // Transform Wialon SDK unit object to plain ExtendedWialonUnit
  const transformWialonUnit = useCallback((unitSDK: WialonUnitSDK): ExtendedWialonUnit => {
    const pos = unitSDK.getPosition();
    return {
      id: unitSDK.getId(),
      name: unitSDK.getName(),
      iconUrl: unitSDK.getIconUrl(32),
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
      cls_id: (unitSDK as any).cls_id || (unitSDK.prp ? unitSDK.prp.cls_id : undefined),
      type: (unitSDK as any).type || unitSDK.tp,
      last_message: pos ? pos.t : undefined,
      connection_state: (unitSDK as any).cn_st || unitSDK.ci,
    };
  }, []);

  // Main initialization function for Wialon SDK and session
  const initializeWialonSession = useCallback(async () => {
    if (initialized || loading) return;
    setLoading(true);
    setError(null);

    try {
      await loadWialonSdkScript();
      const W = window.wialon!;

      sessionRef.current = W.core.Session.getInstance();

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

      sessionRef.current!.loadLibrary("itemIcon");

      // Data flags for units
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

      // Listener for real-time unit updates
      const unitUpdateListener = (id: number, item: WialonUnitSDK, flags: number) => {
        if (unitsMapRef.current.has(id) || item.tp === 'avl_unit') {
          const updatedUnit = transformWialonUnit(item);
          unitsMapRef.current.set(id, updatedUnit);
          setUnits(Array.from(unitsMapRef.current.values()));
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

    return () => {
      if (sessionRef.current) {
        log("Logging out from Wialon session during cleanup.");
        sessionRef.current.logout(() => {
          log("Wialon session logged out.");
          sessionRef.current = null;
          setInitialized(false);
          setUnits(null);
          unitsMapRef.current.clear();
        });
      }
    };
  }, [initializeWialonSession, log]);

  return { units, loading, error, initialized, session: sessionRef.current };
};
