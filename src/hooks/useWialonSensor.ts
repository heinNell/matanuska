// src/hooks/useWialonUnitSensors.ts
import { useState, useEffect, useCallback } from "react";
import wialonService from "../services/wialonService";
import type { BaseSensorResult, SensorMap, SensorIds } from "../types/wialon-sensors";
import { createUnitDetail, isValidUnit } from "../utils/wialonUnitUtils";

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
  const [sensors, setSensors] = useState<SensorMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /** Fetch unit detail */
  const fetchUnitDetail = useCallback(() => {
    if (!unitId) return;

    try {
      const wialonUnit = wialonService.getUnitById(unitId);
      if (!isValidUnit(wialonUnit)) throw new Error("Unit not found");

      setUnit(createUnitDetail(wialonUnit));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch unit details";
      console.error(err);
      setError(message);
    }
  }, [unitId]);

  /** Subscribe to all sensors */
  const subscribeToSensors = useCallback(() => {
    if (!unitId) return;
    const subscriptions: (() => void)[] = [];

    const subscribe = (sensorKey: keyof SensorMap, sensorId?: number) => {
      if (!sensorId) return;
      const unsubscribe = wialonService.subscribeToSensor(unitId, sensorId, (val: any) => {
        setSensors((prev) => ({ ...prev, [sensorKey]: val }));
      });
      subscriptions.push(unsubscribe);
    };

    // Subscribe to each sensor type
    subscribe("fuel", sensorIds.fuel);
    subscribe("speed", sensorIds.speed);
    subscribe("engineHours", sensorIds.engineHours);
    subscribe("ignition", sensorIds.ignition);

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe?.());
    };
  }, [unitId, sensorIds]);

  useEffect(() => {
    setLoading(true);
    fetchUnitDetail();
    const unsubscribeSensors = subscribeToSensors();
    setLoading(false);

    return () => {
      unsubscribeSensors?.();
    };
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
    setLoading(true);
    fetchUnitDetail();
    const unsubscribeSensors = subscribeToSensors();
    setLoading(false);

    return () => {
      unsubscribeSensors?.();
    };
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
