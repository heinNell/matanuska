// src/hooks/useWialonUnits.ts
import { useState, useEffect, useCallback } from "react";
import wialonService from "../services/wialonService";
import type { WialonUnit } from "../types/wialon-core";
import type { Position } from "../types/wialon-position";
import type { WialonUnitBrief } from "../types/wialon";

/**
 * Public UnitInfo expected by the app
 */
export interface UnitInfo {
  id: number;
  name: string;
  iconUrl: string;
  position: Position;
}

interface UseWialonUnitsResult {
  units: UnitInfo[];
  loading: boolean;
  error: string | null;
  refreshUnits: () => void;
}

/* -------------------------
    Defensive helpers
    ------------------------- */

type WialonUnitLike = WialonUnit | WialonUnitBrief | Record<string, any> | null | undefined;

/**
 * Safely extracts a numeric or string ID from a Wialon unit object, handling various property names and getter methods.
 * @param u The raw Wialon unit object.
 * @returns The ID as a string, or undefined if not found.
 */
function safeGetIdRaw(u: WialonUnitLike): string | undefined {
  if (!u || typeof u !== "object") return undefined;
  const anyU = u as any;

  // Check common fields first
  if (anyU.id !== undefined && (typeof anyU.id === "string" || typeof anyU.id === "number")) {
    return String(anyU.id);
  }
  if (anyU.uid !== undefined && (typeof anyU.uid === "string" || typeof anyU.uid === "number")) {
    return String(anyU.uid);
  }

  // Check getter method
  if (typeof anyU.getId === "function") {
    try {
      const v = anyU.getId();
      if (v !== undefined && v !== null) return String(v);
    } catch {
      /* ignore */
    }
  }

  // Fallback to other common fields
  if (anyU.sid !== undefined) return String(anyU.sid);
  if (anyU.objectId !== undefined) return String(anyU.objectId);

  return undefined;
}

/**
 * Safely extracts the name from a Wialon unit object.
 * @param u The raw Wialon unit object.
 * @returns The name as a string, or an empty string if not found.
 */
function safeGetName(u: WialonUnitLike): string {
  if (!u || typeof u !== "object") return "";
  const anyU = u as any;

  // Check common fields
  if (typeof anyU.nm === "string" && anyU.nm.length) return anyU.nm;
  if (typeof anyU.name === "string" && anyU.name.length) return anyU.name;

  // Check getter method
  if (typeof anyU.getName === "function") {
    try {
      const v = anyU.getName();
      if (typeof v === "string" && v.length) return v;
    } catch {
      /* ignore */
    }
  }

  // Fallback to a string-like ID
  const id = safeGetIdRaw(u);
  return id ?? "";
}

/**
 * Safely extracts position data from a Wialon unit object, handling various formats.
 * @param u The raw Wialon unit object.
 * @returns A partial position object with lat/lng, or an empty object if not found.
 */
function safeGetPosition(u: WialonUnitLike): { lat?: number; lng?: number } {
  if (!u || typeof u !== "object") return {};
  const anyU = u as any;

  // Prefer getPosition() if available
  if (typeof anyU.getPosition === "function") {
    try {
      const p = anyU.getPosition();
      // Handle array format [lon, lat]
      if (Array.isArray(p) && p.length >= 2) {
        const lon = Number(p[0]);
        const lat = Number(p[1]);
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lng: lon };
      }
      // Handle object format
      if (p && typeof p === "object") {
        const lat = Number(p.y ?? p.lat ?? p.latitude ?? p.latDeg);
        const lon = Number(p.x ?? p.lon ?? p.lng ?? p.longitude ?? p.lonDeg);
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lng: lon };
      }
    } catch {
      /* ignore */
    }
  }

  // Check common fields
  const posArr = anyU.pos ?? anyU.position ?? anyU.p ?? anyU.lastPos;
  if (Array.isArray(posArr) && posArr.length >= 2) {
    const lon = Number(posArr[0]);
    const lat = Number(posArr[1]);
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lng: lon };
  }

  const posObj = (typeof posArr === "object" && !Array.isArray(posArr)) ? posArr : anyU.position ?? anyU.lastPosition ?? anyU.posObj;
  if (posObj && typeof posObj === "object") {
    const lat = Number(posObj.y ?? posObj.lat ?? posObj.latitude ?? posObj.latDeg);
    const lon = Number(posObj.x ?? posObj.lon ?? posObj.lng ?? posObj.longitude ?? posObj.lonDeg);
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lng: lon };
  }

  // Last-resort fields
  const maybeLat = Number(anyU.lat ?? anyU.latitude);
  const maybeLon = Number(anyU.lon ?? anyU.longitude ?? anyU.lng);
  if (!Number.isNaN(maybeLat) && !Number.isNaN(maybeLon)) return { lat: maybeLat, lng: maybeLon };

  return {};
}

/**
 * Safely extracts the icon URL from a Wialon unit object.
 * @param u The raw Wialon unit object.
 * @returns The icon URL as a string, or null if not found.
 */
function safeGetIconUrl(u: WialonUnitLike): string | null {
  if (!u || typeof u !== "object") return null;
  const anyU = u as any;

  // Check getter method
  if (typeof anyU.getIconUrl === "function") {
    try {
      const v = anyU.getIconUrl();
      if (typeof v === "string" && v.length) return v;
    } catch {
      // ignore
    }
  }

  // Check common fields
  if (typeof anyU.iconUrl === "string" && anyU.iconUrl.length) return anyU.iconUrl;
  if (anyU.icon && typeof anyU.icon.url === "string" && anyU.icon.url.length) return anyU.icon.url;
  if (typeof anyU.icon === "string" && anyU.icon.length) return anyU.icon;

  return null;
}

/* -------------------------
    Hook implementation
    ------------------------- */

export function useWialonUnits(token?: string): UseWialonUnitsResult {
  const [units, setUnits] = useState<UnitInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use wialonService implementation
      if (token && typeof wialonService.initSession === "function") {
        await wialonService.initSession();
      }

      // getUnits might return any[] (SDK types vary)
      const wialonUnits: WialonUnitLike[] = await wialonService.getUnits();

      const unitsInfo: UnitInfo[] = (wialonUnits || [])
        // Add type annotation for parameter 'u' to fix the 'any' error
        .map((unitRaw: WialonUnitLike): UnitInfo | null => {
          // get id as string then convert to number if numeric
          const idRaw = safeGetIdRaw(unitRaw);
          if (!idRaw) return null;

          // ensure numeric id as your UnitInfo requires number
          const idNum = /^\d+$/.test(idRaw) ? Number(idRaw) : Number(idRaw);
          if (!idNum || Number.isNaN(idNum)) {
            // If id is not numeric, drop (to match original type)
            return null;
          }

          const name = safeGetName(unitRaw).trim();
          if (!name) return null;

          const pos = safeGetPosition(unitRaw);
          if (pos.lat === undefined || pos.lng === undefined) return null;

          const iconUrl = safeGetIconUrl(unitRaw);
          if (!iconUrl) return null;

          // Ensure position fields are numbers
          const lat = Number(pos.lat);
          const lng = Number(pos.lng);
          if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

          return {
            id: idNum,
            name,
            iconUrl,
            position: { lat, lng },
          };
        })
        .filter((u): u is UnitInfo => !!u);

      setUnits(unitsInfo);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load Wialon units");
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let mounted = true;

    const execute = async () => {
      try {
        await fetchUnits();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    execute();

    return () => {
      mounted = false;
    };
  }, [fetchUnits, refreshCounter]);

  const refreshUnits = useCallback(() => setRefreshCounter((p) => p + 1), []);

  return { units, loading, error, refreshUnits };
}

export default useWialonUnits;
