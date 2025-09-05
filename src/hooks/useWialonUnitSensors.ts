import { useState, useEffect } from 'react';

interface SensorIds {
  [key: string]: string;
}

interface SensorData {
  fuel: number | null;
  speed: number | null;
  engineHours: number | null;
  ignition: boolean | null;
  loading: boolean;
  error: Error | null;
}

export function useWialonUnitSensors(unitId: number, sensorIds: SensorIds): SensorData {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<SensorData>({
    fuel: null,
    speed: null,
    engineHours: null,
    ignition: null,
    loading: false,
    error: null
  });

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        setLoading(true);
        // TODO: Implement actual Wialon API call here
        // For now returning mock data
        setData({
          fuel: 75,
          speed: 60,
          engineHours: 1234,
          ignition: true,
          loading: false,
          error: null
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch sensor data'));
      } finally {
        setLoading(false);
      }
    };

    if (unitId) {
      fetchSensorData();
    }
  }, [unitId, sensorIds]);

  return { ...data, loading, error };
}

export default useWialonUnitSensors;
