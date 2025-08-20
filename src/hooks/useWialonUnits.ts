import { useState, useEffect, useCallback } from 'react';
import { wialonService } from '../utils/wialonService';
import type { WialonUnit } from '../types/wialon-core';
import type { Position } from '../types/wialon-types';

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

export function useWialonUnits(token?: string): UseWialonUnitsResult {
  const [units, setUnits] = useState<UnitInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Only initialize session if not already initialized and a token is provided
      if (token) await wialonService.initSession?.();
     
      const wialonUnits: WialonUnit[] = await wialonService.getUnits();
      const unitsInfo: UnitInfo[] = (wialonUnits || [])
        .map((unit: WialonUnit): UnitInfo | null => {
          const idNum: number = typeof unit.id === 'string'
            ? (/^\d+$/.test(unit.id) ? Number(unit.id) : NaN)
            : unit.id;

          // Get position and icon URL from the Wialon unit object
          const pos = unit.getPosition();
          const iconUrl = unit.getIconUrl();

          // Defensive checks for valid numeric ID, name, position, and icon
          if (!idNum || isNaN(idNum) || !unit.nm || !pos || !iconUrl) return null;

          return {
            id: idNum,
            name: unit.nm,
            iconUrl: iconUrl, // iconUrl is now guaranteed to be a string
            position: { lat: pos.y, lng: pos.x }, // Use y for lat and x for lng
          };
        })
        .filter((u): u is UnitInfo => !!u);

      setUnits(unitsInfo);
    } catch (err: any) {
      setError(err?.message || "Failed to load Wialon units");
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

  const refreshUnits = useCallback(() => setRefreshCounter(prev => prev + 1), []);

  return { units, loading, error, refreshUnits };
}

export default useWialonUnits;
