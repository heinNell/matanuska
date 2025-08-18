import { useState, useEffect, useCallback } from 'react';
import { wialonService } from '../services/wialonService';
import { UnitDetail, WialonUnit } from '../types/wialon';

interface UseWialonUnitDetailResult {
  unit: UnitDetail | null;
  loading: boolean;
  error: string | null;
}

export function useWialonUnitDetail(unitId: number | null): UseWialonUnitDetailResult {
  const [unit, setUnit] = useState<UnitDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
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
      setError("Failed to fetch unit details.");
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => {
    fetchUnitDetail();
  }, [fetchUnitDetail]);

  return { unit, loading, error };
}

