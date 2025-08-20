import { useState, useEffect, useCallback } from 'react';
import { wialonService } from '../utils/wialonService';
import type { WialonUnit } from '../types/wialon-core';

export interface SensorValue {
  sensorId: number;
  value: number | string | null;
}

export interface UnitState {
  unit: WialonUnit | null;
  sensors: Record<number, SensorValue>;
  loading: boolean;
  error: string | null;
}

export function useWialonUnit(unitId: number | null): UnitState {
  const [unit, setUnit] = useState<WialonUnit | null>(null);
  const [sensors, setSensors] = useState<Record<number, SensorValue>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch unit details
  const fetchUnit = useCallback(async () => {
    if (!unitId) return;
    setLoading(true);
    setError(null);

    try {
      const wUnit: WialonUnit | null = await wialonService.getUnitById(unitId);
      if (!wUnit) throw new Error('Unit not found');
      setUnit(wUnit);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? 'Failed to fetch unit');
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  // Sensor subscription stub (replace with actual subscription logic)
  const subscribeSensor = useCallback(
    (sensorId: number) => {
      const handler = (value: number | string | null) => {
        setSensors(prev => ({ ...prev, [sensorId]: { sensorId, value } }));
      };
      // Assume wialonService.subscribe returns an unsubscribe function
      return wialonService.subscribeToSensor?.(unitId!, sensorId, handler) ?? (() => {});
    },
    [unitId]
  );

  // Subscribe to common sensors
  useEffect(() => {
    const cleanupFns: Array<() => void> = [];
    if (unitId && unit) {
      const commonSensorIds = [1, 2, 3]; // configure
      commonSensorIds.forEach(id => {
        cleanupFns.push(subscribeSensor(id));
      });
    }
    return () => cleanupFns.forEach(fn => fn());
  }, [unit, unitId, subscribeSensor]);

  // Initial fetch
  useEffect(() => {
    fetchUnit();
  }, [fetchUnit]);

  return { unit, sensors, loading, error };
}

export default useWialonUnit;
