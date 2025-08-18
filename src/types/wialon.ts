/** Position of a unit (vehicle) */
export interface WialonPosition {
  x: number; // Longitude
  y: number; // Latitude
  z?: number; // Altitude (optional)
  t?: number; // Timestamp (optional)
  s?: number; // Speed (optional)
}

/** Unit (vehicle or asset) from Wialon */
export interface WialonUnit {
  getId: () => number;
  getName: () => string;
  getPosition: () => WialonPosition | undefined;
  getIconUrl: (size?: number) => string;
  getUniqueId: () => string | number;
}

/** Lightweight DTO returned by REST adapter (not SDK object) */
export interface WialonUnitBrief {
  id: number | string;
  name: string;
  lat?: number;
  lng?: number;
  speed?: number;
  course?: number;
  time?: number;
}

/** Wialon Driver */
export interface WialonDriver {
  id: number | string;
  n: string; // Name
  ds?: string; // Description
  p?: string; // Phone
  // Extend as needed
}

/** Wialon Geofence ("zone") */
export interface WialonGeofence {
  id: number | string;
  n: string; // Name
  t: number; // Type: 3 = Circle, 2 = Polygon, 1 = Polyline
  w?: number; // Radius for circles
  c?: number; // Color (decimal)
  p?: any[]; // Geometry points
  // Extend as needed
}

/** Wialon Resource */
export type WialonResource = {
  id: number;
  name: string;
};

/** Wialon Session methods from JS SDK */
export interface WialonSession {
  initSession(url: string): void;
  loginToken(token: string, password: string, cb: (code: number) => void): void;
  logout(cb: (code: number) => void): void;
  loadLibrary(lib: string, cb?: () => void): void;
  updateDataFlags(flags: any[], cb: (code: number) => void): void;
  getItems(type: string): any[];
  getItem(id: number | string): any;
}

// Note: Global window.wialon is declared in wialon-sdk.d.ts; avoid duplicate declaration here.

export interface UnitInfo {
  id: number;
  name: string;
  iconUrl: string;
}

export interface ReportTableData {
  headers: string[];
  rows: any[][];
}

/** Detailed unit information with computed fields */
export interface UnitDetail {
  id: number;
  name: string;
  iconUrl: string;
  uid?: string | number;
  position: { lat: number; lng: number } | null;
  speed: number;
  status: 'onroad' | 'pause' | 'offline';
  lastMessageTime: number | null;
}
