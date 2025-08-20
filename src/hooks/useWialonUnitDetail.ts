// src/hooks/useWialonUnitDetail.ts
import { useState, useEffect, useCallback } from 'react';
import wialonService from '../services/wialonService';
import type { UnitDetail } from '../types/wialon-types';
import type { BaseSensorResult } from '../types/wialon-sensors';
import { createUnitDetail, isValidUnit } from '../utils/wialonUnitUtils';

export function useWialonUnitDetail(unitId: number | null): BaseSensorResult {
  const [unit, setUnit] = useState<UnitDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnitDetail = useCallback(async () => {
    if (!unitId) return;
    setLoading(true);
    setError(null);

    try {
      const wialonUnit: WialonUnit | null = wialonService.getUnitById(unitId);
      if (!wialonUnit) {
        throw new Error("Unit not found.");
      }

      const pos = wialonUnit.getPosition?.();
      const unitDetail: UnitDetail = {
        id: wialonUnit.getId?.(),
        name: wialonUnit.getName?.(),
        iconUrl: wialonUnit.getIconUrl?.(32) || '',
        uid: wialonUnit.getUniqueId(),
        position: pos ? { lat: pos.y, lng: pos.x } : null,
        speed: pos?.s ?? 0, // Using nullish coalescing operator for better null/undefined handling
        status: pos ? (pos.s ?? 0 > 5 ? 'onroad' : 'pause') : 'offline',
        lastMessageTime: pos?.t || null,
      };
      setUnit(unitDetail);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch unit details.");
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => {
    fetchUnitDetail();
  }, [fetchUnitDetail]);

  return { unit, loading, error };
}
