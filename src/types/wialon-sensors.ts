import type { UnitDetail } from './wialon-types';

export interface BaseSensorResult {
  loading: boolean;
  error: string | null;
  unit: UnitDetail | null;
}

export interface SensorMap {
  fuel?: number;
  speed?: number;
  engineHours?: number;
  ignition?: boolean;
}

export interface SensorIds {
  fuel?: number;
  speed?: number;
  engineHours?: number;
  ignition?: number;
}

export type SensorCallback = (value: number | boolean) => void;
