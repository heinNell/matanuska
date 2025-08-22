import { useState, useEffect, useCallback } from "react";
import { searchWialonUnits, searchWialonUnitsDetailed, type WialonUnit, type WialonUnitsResponse } from "../services/wialonUnitsService";
import { useWialonAuth } from "../context/WialonAuthContext";

interface UseWialonApiUnitsReturn {
  units: WialonUnit[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => Promise<void>;
  getUnitById: (unitId: number) => WialonUnit | undefined;
}

interface UseWialonApiUnitsOptions {
  detailed?: boolean;  // Whether to fetch detailed unit info
  autoFetch?: boolean; // Whether to auto-fetch on mount
}

/**
 * Hook to fetch and manage Wialon units using your successful curl API pattern
 * This uses the direct API approach that matches your working curl requests
 */
export function useWialonApiUnits(options: UseWialonApiUnitsOptions = {}): UseWialonApiUnitsReturn {
  const { detailed = false, autoFetch = true } = options;
  const { loginData, isLoggedIn } = useWialonAuth();

  const [units, setUnits] = useState<WialonUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUnits = useCallback(async () => {
    if (!isLoggedIn || !loginData?.eid) {
      setError("Not logged in or no session ID available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: WialonUnitsResponse = detailed
        ? await searchWialonUnitsDetailed(loginData.eid)
        : await searchWialonUnits(loginData.eid);

      setUnits(response.items);
      setTotalCount(response.totalItemsCount);

      console.log(`Fetched ${response.items.length} units:`, response.items);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch units";
      setError(errorMessage);
      console.error("Units fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, loginData?.eid, detailed]);

  // Auto-fetch on mount if enabled and logged in
  useEffect(() => {
    if (autoFetch && isLoggedIn) {
      fetchUnits();
    }
  }, [autoFetch, isLoggedIn, fetchUnits]);

  // Helper function to get unit by ID
  const getUnitById = useCallback((unitId: number): WialonUnit | undefined => {
    return units.find(unit => unit.id === unitId);
  }, [units]);

  return {
    units,
    loading,
    error,
    totalCount,
    refetch: fetchUnits,
    getUnitById,
  };
}
