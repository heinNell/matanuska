// src/hooks/useWialonUnitsEnhanced.ts
import { useState, useEffect, useCallback } from 'react';
import { wialonDataManager } from '../services/WialonDataManager';
import type { WialonUnitComplete } from '../types/wialon-complete';

export interface UseWialonUnitsEnhancedResult {
  units: WialonUnitComplete[];
  loading: boolean;
  error: Error | null;
  refreshUnits: () => Promise<void>;
  getUnitDetails: (unitId: number) => Promise<WialonUnitComplete>;
}

/**
 * Phase 2: Enhanced Wialon units hook that integrates with WialonDataManager
 * This provides the complete unit data structure expected by Phase 3 UI components
 */
export const useWialonUnitsEnhanced = (): UseWialonUnitsEnhancedResult => {
  const [units, setUnits] = useState<WialonUnitComplete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshUnits = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Initialize data manager if not already done
      const systemData = await wialonDataManager.initialize();

      // Transform system data units to complete units
      const completeUnits = await Promise.all(
        systemData.units.map(async (unit) => {
          try {
            return await wialonDataManager.getUnitDetails(unit.id);
          } catch (err) {
            console.warn(`Failed to get details for unit ${unit.id}:`, err);
            // Return basic unit data if details fail
            return unit;
          }
        })
      );

      setUnits(completeUnits);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to load units');
      setError(errorObj);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUnitDetails = useCallback(async (unitId: number): Promise<WialonUnitComplete> => {
    return await wialonDataManager.getUnitDetails(unitId);
  }, []);

  // Initial load
  useEffect(() => {
    refreshUnits();
  }, [refreshUnits]);

  return {
    units,
    loading,
    error,
    refreshUnits,
    getUnitDetails,
  };
};

// Also create a compatibility export that matches the expected interface
export const useWialonUnits = useWialonUnitsEnhanced;

export default useWialonUnitsEnhanced;
