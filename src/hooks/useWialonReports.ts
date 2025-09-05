// src/hooks/useWialonReports.ts
import { useState, useCallback } from 'react';
import { wialonDataManager } from '../services/WialonDataManager';
import type { WialonReportConfig, WialonReportProcessed } from '../types/wialon-complete';

interface UseWialonReportsResult {
  executeReport: (config: WialonReportConfig) => Promise<WialonReportProcessed>;
  loading: boolean;
  error: Error | null;
}

/**
 * Phase 2: Hook for Wialon reports functionality
 * Integrates with WialonServiceComplete and WialonDataManager
 */
export const useWialonReports = (): UseWialonReportsResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const executeReport = useCallback(async (config: WialonReportConfig): Promise<WialonReportProcessed> => {
    setLoading(true);
    setError(null);

    try {
      // Use the data manager which has report execution capabilities
      const result = await wialonDataManager.executeReport(config);
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to execute report');
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    executeReport,
    loading,
    error,
  };
};
"reportProps": {
    "speedLimit": 0,
    "maxMessagesInterval": 0,
    "dailyEngineHoursRate": 0,
    "urbanMaxSpeed": 0,
    "mileageCoefficient": 0,
    "fuelRateCoefficient": 51,
    "speedingTolerance": 10,
    "speedingMinDuration": 1,
    "speedingMode": 0,
    "driver_activity": { "type": 0 },
    "fuelConsRates": {
      "consSummer": 51,
      "consWinter": 51,
      "winterMonthFrom": 11,
      "winterDayFrom": 1,
      "winterMonthTo": 1,
      "winterDayTo": 29
    }
  },
  "aliases": [
    {
      "id": 1,
      "n": "Setparam 2007",
      "c": "setparam",
      "l": "tcp",
      "p": "2007|40.119.153.184",
      "a": 1,
      "f": 0,
      "jp": ""
    },
    {
      "id": 2,
      "n": "Setparam 2008",
      "c": "setparam",
      "l": "tcp",
      "p": "2008|8982",
      "a": 1,
      "f": 0,
      "jp": ""
    },
    {
      "id": 3,
      "n": "Setparam 2010",
      "c": "setparam",
      "l": "tcp",
      "p": "2010|2",
      "a": 1,
      "f": 0,
      "jp": ""
    }
  ],
  "driving": {
    "acceleration": [
      { "flags": 2, "min_value": 0.4, "name": "Acceleration: extreme", "penalties": 2000 },
      {
        "flags": 2,
        "max_value": 0.4,
        "min_value": 0.31,
        "name": "Acceleration: medium",
        "penalties": 1000
      }
    ],
    "brake": [
      { "flags": 2, "min_value": 0.35, "name": "Brake: extreme", "penalties": 2000 },
      {
        "flags": 2,
        "max_value": 0.35,
        "min_value": 0.31,
        "name": "Brake: medium",
        "penalties": 1000
      }
    ],
    "global": { "accel_mode": "0" },
    "harsh": [{ "flags": 2, "min_value": 0.3, "name": "Harsh driving", "penalties": 300 }],
    "speeding": [
      {
        "flags": 0,
        "max_duration": 30,
        "max_value": 100,
        "min_duration": 10,
        "min_value": 85,
        "name": "Speeding: extreme",
        "penalties": 5000
      }
    ],
    "turn": [
      { "flags": 2, "min_value": 0.4, "name": "Turn: extreme", "penalties": 1000 },
      { "flags": 2, "max_value": 0.4, "min_value": 0.31, "name": "Turn: medium", "penalties": 500 }
    ]
  },
  "trip": {
    "type": 1,
    "gpsCorrection": 1,
    "minSat": 2,
    "minMovingSpeed": 1,
    "minStayTime": 300,
    "maxMessagesDistance": 10000,
    "minTripTime": 60,
    "minTripDistance": 100
  }
}
