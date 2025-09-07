// src/hooks/useWialonUnitDetail.ts
import { useState, useEffect, useCallback } from "react";
import wialonService from "../services/wialonService";
import type { Position } from "../types/wialon-position";

/**
 * Local UnitDetail shape used by the app.
 * Keeps things intentionally permissive because Wialon SDK shapes vary by version/wrapper.
 */
export interface UnitDetail {
  id: number | string;
  name: string;
  iconUrl?: string | null;
  position?: Position | null;
  properties?: Record<string, any> | null;
  raw?: Record<string, any> | null;
}

/** Hook result shape (explicit so callers / TS know available fields) */
export interface UseWialonUnitDetailResult {
  detail: UnitDetail | null;
  unit: UnitDetail | null;            // alias for backward compatibility
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useWialonUnitDetail(unitId?: string | number | null, token?: string): UseWialonUnitDetailResult {
  const [detail, setDetail] = useState<UnitDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);

  /* -------------------------
     Defensive helpers
     ------------------------- */

  const safeGetRawId = (u: any): string | undefined => {
    if (!u || typeof u !== "object") return undefined;
    if (u.id !== undefined && (typeof u.id === "string" || typeof u.id === "number")) return String(u.id);
    if (u.uid !== undefined && (typeof u.uid === "string" || typeof u.uid === "number")) return String(u.uid);
    if (u.objectId !== undefined) return String(u.objectId);
    if (u.sid !== undefined) return String(u.sid);
    if (typeof u.getId === "function") {
      try {
        const v = u.getId();
        if (v != null) return String(v);
      } catch {
        /* ignore */
      }
    }
    return undefined;
  };

  const safeGetName = (u: any): string => {
    if (!u || typeof u !== "object") return "";
    if (typeof u.nm === "string" && u.nm.length) return u.nm;
    if (typeof u.name === "string" && u.name.length) return u.name;
    if (typeof u.getName === "function") {
      try {
        const v = u.getName();
        if (typeof v === "string" && v.length) return v;
      } catch {
        /* ignore */
      }
    }
    const id = safeGetRawId(u);
    return id ?? "";
  };

  const safeGetPosition = (u: any): Position | null => {
    if (!u || typeof u !== "object") return null;

    // prefer getPosition()
    if (typeof u.getPosition === "function") {
      try {
        const p = u.getPosition();
        if (Array.isArray(p) && p.length >= 2) {
          const lon = Number(p[0]);
          const lat = Number(p[1]);
          if (!Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lng: lon };
        }
        if (p && typeof p === "object") {
          const lat = Number(p.y ?? p.lat ?? p.latitude);
          const lon = Number(p.x ?? p.lon ?? p.lng ?? p.longitude);
          if (!Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lng: lon };
        }
      } catch {
        /* ignore */
      }
    }

    // common shapes: pos array [lon,lat], position object or lastPos
    const posArr = u.pos ?? u.position ?? u.lastPos ?? u.p;
    if (Array.isArray(posArr) && posArr.length >= 2) {
      const lon = Number(posArr[0]);
      const lat = Number(posArr[1]);
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lng: lon };
    }
    if (posArr && typeof posArr === "object") {
      const lat = Number(posArr.y ?? posArr.lat ?? posArr.latitude);
      const lon = Number(posArr.x ?? posArr.lon ?? posArr.lng ?? posArr.longitude);
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lng: lon };
    }

    // last-resort fields
    const maybeLat = Number(u.lat ?? u.latitude);
    const maybeLon = Number(u.lon ?? u.longitude ?? u.lng);
    if (!Number.isNaN(maybeLat) && !Number.isNaN(maybeLon)) return { lat: maybeLat, lng: maybeLon };

    return null;
  };

  const safeGetIcon = (u: any): string | null => {
    if (!u || typeof u !== "object") return null;
    if (typeof u.getIconUrl === "function") {
      try {
        const v = u.getIconUrl();
        if (typeof v === "string" && v.length) return v;
      } catch {
        /* ignore */
      }
    }
    if (typeof u.iconUrl === "string" && u.iconUrl.length) return u.iconUrl;
    if (u.icon && typeof u.icon.url === "string") return u.icon.url;
    if (typeof u.icon === "string" && u.icon.length) return u.icon;
    return null;
  };

  /* -------------------------
     Fetch logic (uses getUnits only)
     ------------------------- */

  const fetchUnitDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (unitId == null) {
      setDetail(null);
      setLoading(false);
      return;
    }

    try {
      // initialize session if token provided
      if (token && typeof wialonService.initSession === "function") {
        await wialonService.initSession();
      }

      // The wialonService in your codebase exposes getUnits()
      // We'll fetch all units and find the requested one (robust across SDKs)
      const allUnitsRaw = await wialonService.getUnits();
      const allUnits: any[] = Array.isArray(allUnitsRaw) ? allUnitsRaw : [];

      // Normalise unitId to string for comparison
      const wantedIdStr = String(unitId);

      const rawUnit = allUnits.find((u) => {
        const rid = safeGetRawId(u);
        if (rid != null && String(rid) === wantedIdStr) return true;
        // also compare via common name fields as a fallback
        const name = safeGetName(u);
        if (name && name === wantedIdStr) return true;
        return false;
      });

      if (!rawUnit) {
        setDetail(null);
        setError(`Unit ${wantedIdStr} not found`);
        return;
      }

      const idRaw = safeGetRawId(rawUnit) ?? wantedIdStr;
      const name = safeGetName(rawUnit) || idRaw;
      const pos = safeGetPosition(rawUnit);
      const iconUrl = safeGetIcon(rawUnit);

      const unitDetail: UnitDetail = {
        id: /^\d+$/.test(String(idRaw)) ? Number(idRaw) : idRaw,
        name,
        iconUrl,
        position: pos,
        properties: rawUnit?.properties ?? rawUnit?.props ?? null,
        raw: rawUnit,
      };

      setDetail(unitDetail);
    } catch (unknownErr: unknown) {
      const message = unknownErr instanceof Error ? unknownErr.message : String(unknownErr ?? "Unknown error");
      setError(message);
      setDetail(null);
    } finally {
      setLoading(false);
    }
    // include refreshCounter implicitly via closure (we don't reference it directly here)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId, token, refreshCounter]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        await fetchUnitDetail();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [fetchUnitDetail, refreshCounter]);

  const refresh = useCallback(() => setRefreshCounter((p) => p + 1), []);

  // Return both `detail` and `unit` (alias) for backward compatibility
  return {
    detail,
    unit: detail,
    loading,
    error,
    refresh,
  };
}

export default useWialonUnitDetail;
