import { useState, useEffect, useCallback } from 'react';
import { wialonService } from '../services/wialonService';
import { UnitInfo } from '../types/wialon';

interface UseWialonUnitsResult {
  units: UnitInfo[];
  loading: boolean;
  error: string | null;
  refreshUnits: () => void;
}

export function useWialonUnits(token: string): UseWialonUnitsResult {
  const [units, setUnits] = useState<UnitInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await wialonService.initSession();
      const wialonUnits = wialonService.getUnits();
      const unitsInfo = wialonUnits.map((unit: any) => ({
        id: unit.getId(),
        name: unit.getName(),
        iconUrl: unit.getIconUrl(32),
      }));
      setUnits(unitsInfo);
    } catch (err) {
      setError("Failed to load Wialon units. Check token and permissions.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits, refreshCounter]);

  const refreshUnits = () => setRefreshCounter(prev => prev + 1);

  return { units, loading, error, refreshUnits };
}
