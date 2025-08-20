// src/hooks/useWialonUnitSensors.ts
import { useState, useEffect, useCallback } from "react";
import wialonService from "../services/wialonService";
import { createUnitDetail } from "../utils/wialonUnitUtils";
import type { UnitDetail } from "../types/wialon";

export interface UnitSensorData {
  unit: UnitDetail | null;
  fuel?: number | null;
  speed?: number | null;
  engineHours?: number | null;
  ignition?: boolean | null;
  loading: boolean;
  error: string | null;
}

interface SensorMap {
  fuel?: number;
  speed?: number;
  engineHours?: number;
  ignition?: boolean;
}

/**
 * Hook to fetch Wialon unit details + multiple sensors in real-time
 */
export function useWialonUnitSensors(
  unitId: number | null,
  sensorIds: { fuel?: number; speed?: number; engineHours?: number; ignition?: number }
): UnitSensorData {
  const [unit, setUnit] = useState<UnitDetail | null>(null);
  const [sensors] = useState<SensorMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /** Fetch unit detail */
  const fetchUnitDetail = useCallback(async () => {
    if (!unitId) return;

    try {
      const wialonUnit = await wialonService.getUnitById(unitId);
      if (!wialonUnit) throw new Error("Unit not found");

      // Convert service WialonUnit to types WialonUnit format
      const convertedUnit = {
        id: wialonUnit.id,
        name: wialonUnit.nm || `Unit ${wialonUnit.id}`,
        iconUrl: wialonUnit.iconUrl,
        getId: () => wialonUnit.id,
        getName: () => wialonUnit.nm || `Unit ${wialonUnit.id}`,
        getPosition: () => wialonUnit.pos || null
      };

      setUnit(createUnitDetail(convertedUnit as any));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch unit details";
      console.error(err);
      setError(message);
    }
  }, [unitId]);

  /** Subscribe to all sensors - Mock implementation until subscribeToSensor is available */
  const subscribeToSensors = useCallback(() => {
    if (!unitId) return;

    // TODO: Implement actual sensor subscription when wialonService.subscribeToSensor is available
    // For now, return empty unsubscribe function
    console.log(`Mock: Would subscribe to sensors for unit ${unitId}`, sensorIds);

    return () => {
      console.log(`Mock: Unsubscribing from sensors for unit ${unitId}`);
    };
  }, [unitId, sensorIds]);

  useEffect(() => {
    setLoading(true);
    fetchUnitDetail().then(() => {
      const unsubscribeSensors = subscribeToSensors();
      setLoading(false);

      return () => {
        unsubscribeSensors?.();
      };
    });
  }, [fetchUnitDetail, subscribeToSensors]);

  return {
    unit,
    fuel: sensors.fuel ?? null,
    speed: sensors.speed ?? null,
    engineHours: sensors.engineHours ?? null,
    ignition: sensors.ignition ?? null,
    loading,
    error,
  };
}
