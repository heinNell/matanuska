// src/hooks/useWialonUnits.ts
import { useState, useEffect, useCallback } from "react";
import { wialonService } from "../utils/wialonService";
import type { WialonUnit } from "../types/wialon-core";
import type { Position } from "../types/wialon-position";

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

type WialonUnitLike = WialonUnit | Record<string, any> | null | undefined;

function safeGetIdRaw(u: WialonUnitLike): string | undefined {
  if (!u || typeof u !== "object") return undefined;
  const anyU = u as any;

  // common fields
  if (anyU.id !== undefined && (typeof anyU.id === "string" || typeof anyU.id === "number")) {
    return String(anyU.id);
  }
  if (anyU.uid !== undefined && (typeof anyU.uid === "string" || typeof anyU.uid === "number")) {
    return String(anyU.uid);
  }

  // getter
  if (typeof anyU.getId === "function") {
    try {
      const v = anyU.getId();
      if (v !== undefined && v !== null) return String(v);
    } catch {
      /* ignore */
    }
  }

  // fallback: some wrappers expose 'sid' or 'objectId'
  if (anyU.sid !== undefined) return String(anyU.sid);
  if (anyU.objectId !== undefined) return String(anyU.objectId);

  return undefined;
}

function safeGetName(u: WialonUnitLike): string {
  if (!u || typeof u !== "object") return "";
  const anyU = u as any;

  if (typeof anyU.nm === "string" && anyU.nm.length) return anyU.nm;
  if (typeof anyU.name === "string" && anyU.name.length) return anyU.name;

  if (typeof anyU.getName === "function") {
    try {
      const v = anyU.getName();
      if (typeof v === "string" && v.length) return v;
    } catch {
      /* ignore */
    }
  }

  // fallback to id-like field
  const id = safeGetIdRaw(u);
  return id ?? "";
}

function safeGetPosition(u: WialonUnitLike): { lat?: number; lng?: number } {
  if (!u || typeof u !== "object") return {};
  const anyU = u as any;

  // prefer getPosition() if available
  if (typeof anyU.getPosition === "function") {
    try {
      const p = anyU.getPosition();
      if (Array.isArray(p) && p.length >= 2) {
        // wialon often uses [lon, lat]
        const lon = Number(p[0]);
        const lat = Number(p[1]);
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lng: lon };
      }
      if (p && typeof p === "object") {
        const lat = Number(p.y ?? p.lat ?? p.latitude ?? p.latDeg);
        const lon = Number(p.x ?? p.lon ?? p.lng ?? p.longitude ?? p.lonDeg);
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lng: lon };
      }
    } catch {
      /* ignore */
    }
  }

  // common fields: pos array, position object, lastPos, p
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

  // last-resort fields
  const maybeLat = Number(anyU.lat ?? anyU.latitude);
  const maybeLon = Number(anyU.lon ?? anyU.longitude ?? anyU.lng);
  if (!Number.isNaN(maybeLat) && !Number.isNaN(maybeLon)) return { lat: maybeLat, lng: maybeLon };

  return {};
}

function safeGetIconUrl(u: WialonUnitLike): string | null {
  if (!u || typeof u !== "object") return null;
  const anyU = u as any;

  if (typeof anyU.getIconUrl === "function") {
    try {
      const v = anyU.getIconUrl();
      if (typeof v === "string" && v.length) return v;
    } catch {
      // ignore
    }
  }

  // sometimes icon url may be on a nested "icon" or "img" or "iconUrl"
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
      // Initialize session if token provided and the service offers initSession
      if (token) {
        // It's safe to call initSession conditionally
        if (typeof wialonService.initSession === "function") {
          await wialonService.initSession();
        }
      }

      // getUnits might return any[] (SDK types vary)
      const wialonUnits: WialonUnitLike[] = await wialonService.getUnits();

      const unitsInfo: UnitInfo[] = (wialonUnits || [])
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
