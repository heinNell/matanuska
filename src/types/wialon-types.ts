/**
 * Type definitions for Wialon API objects
 */

export interface WialonPosition {
  lat: number;
  lon: number;
  alt?: number;
  speed?: number;
  course?: number;
  timestamp?: number;
}

/**
 * Represents a sensor configuration in the Wialon system
 */
export interface WialonSensor {
  /** Unique identifier of the sensor */
  id: string;
  /** Display name of the sensor */
  name: string;
  /** Type of sensor measurement */
  type: 'temperature' | 'fuel' | 'voltage' | 'pressure' | 'counter' | 'custom' | string;
  /** Current sensor reading. Type depends on sensor type */
  value?: number | string | boolean;
  /** Measurement unit (e.g., "°C", "L", "V", "bar", etc.) */
  unit?: string;
  /** Additional information about the sensor */
  description?: string;
}

export interface Sensor {
  id: number;
  n: string; // Name
  t: string; // Type
  d: string; // Description
  m: string; // Metric
  p: string; // Parameter
  f: number; // Flags
  c: object; // Config
  vt: number; // Validation type
  vs?: number; // Validating sensor id
  tbl?: { x: number; a: number; b: number };
}

export interface FuelMathParams {
  idling: number;
  urban: number;
  suburban: number;
}

export interface Event {
  id: string;
  type: string;
  value: any;
  time: Date;
}

export interface WialonSession {
  id: string;
  user: {
    id: number;
    name: string;
  };
}

export interface WialonUnit {
  id: string | number;
  name: string;
  iconUrl?: string;

  // Wialon SDK methods
  addListener?: (event: string, callback: Function) => number;
  removeListenerById?: (id: number) => void;
  getId?: () => string | number;
  getName?: () => string;
  getSensors?: () => Record<string, WialonSensor>;
  getSensor?: (sensorId: string) => WialonSensor | undefined;
  getLastMessage?: () => any;
  calculateSensorValue?: (sensor: WialonSensor, message: any) => number;
  getPosition?: () => { x: number; y: number; s?: number; c?: number; t?: number; sc?: number };
}

export interface DiagnosticResult {
  name: string;
  status: 'ok' | 'fail' | 'warn';
  message?: string;
  timestamp?: number;
}

export interface WialonError extends Error {
  code?: number;
  details?: string;
}

export interface WialonGeofence {
  id: string | number;
  n: string; // name
  t: number; // type
  w: number; // width
  c: string; // color
  p: any; // points/polygon data
}

export interface WialonResource {
  id: string | number;
  name: string;
  rawObject: any;
}

export interface WialonDriver {
  id: number;
  name: string;
  phone?: string;
  licenseNumber?: string;
  // Add other driver-specific fields as needed
  [key: string]: any;
}
