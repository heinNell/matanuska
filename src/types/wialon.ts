// src/types/wialon.ts
/* ------------------------------------------------------------------
 * Shared Wialon-related typings
 * ------------------------------------------------------------------ */

/* ---------- Positions & units ------------------------------------------------ */

export interface WialonPosition {
  x: number; // Longitude
  y: number; // Latitude
  z?: number; // Altitude
  t?: number; // Timestamp (UNIX, s)
  s?: number; // Speed
  c?: number; // Course
  sc?: number; // Status code
}

/** SDK object representing a unit (vehicle / asset) */
export interface WialonUnit {
  getId(): number;
  getName(): string;
  getPosition(): WialonPosition | undefined;
  getIconUrl(size?: number): string;
  getUniqueId(): string | number;

  /* SDK event interface */
  addListener(event: string, callback: (event: any) => void): number;
  removeListenerById(id: number): void;

  /* Messages API */
  getMessages(from: number, to: number, flags: number, callback: any): void;
}

/** Lightweight DTO sometimes returned by REST adapters */
export interface WialonUnitBrief {
  id: number | string;
  name: string;
  lat?: number;
  lng?: number;
  speed?: number;
  course?: number;
  time?: number;
}

/* ---------- Other domain objects -------------------------------------------- */

export interface WialonDriver {
  id: number | string;
  n: string; // name
  ds?: string; // description
  p?: string; // phone
}

export interface WialonGeofence {
  id: number | string;
  n: string; // name
  t: number; // 3-circle, 2-polygon, 1-polyline
  w?: number; // radius (for circle)
  c?: number; // colour (decimal)
  p?: any; // geometry
}

/** Typed wrapper around a “resource” object */
export type WialonResource = {
  id: number;
  name: string;
  getZones(): any;
  execReport(
    template: any,
    unitId: number,
    flags: number,
    interval: any,
    callback: any
  ): void;
};

/** A new interface to correctly type the SDK User object. */
export interface WialonUser {
  getId(): number;
  getName(): string;
}

/**
 * Wialon Session methods from JS SDK.
 * This interface has been updated to include missing methods.
 */
export interface WialonSession {
  // Methods to get core session info
  getId(): number;
  getCurrUser(): WialonUser;

  // Existing methods
  initSession(url: string): void;
  loginToken(token: string, password: string, cb: (code: number) => void): void;
  logout(cb: (code: number) => void): void;
  loadLibrary(lib: string, cb?: () => void): void;
  updateDataFlags(flags: any, cb: (code: number) => void): void;
  getItems(type: string): any;
  getItem(id: number | string): any;

  sid: string;
}

/** Raw payload produced by a successful `/login_token` REST call */
export interface WialonApiSession {
  eid: number;
  au: number;
  auth_hash: number;
  /** single resource id **or** array (some accounts return many) */
  resource_id: number | number[];
  user: {
    id: number;
    name: string;
  };
  /* add extra properties if you need them */
}

/* ---------- Helper view-models ---------------------------------------------- */

export interface UnitInfo {
  id: number;
  name: string;
  iconUrl: string;
}

export interface ReportTableData {
  headers: string;
  rows: any;
}

export interface UnitDetail {
  id: number;
  name: string;
  iconUrl: string;
  uid?: string | number;
  position: { lat: number; lng: number } | null;
  speed: number;
  status: "onroad" | "pause" | "offline";
  lastMessageTime: number | null;
}
