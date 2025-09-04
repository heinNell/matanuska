/**
 * Minimal, practical Wialon types for fleet apps.
 * Extend as needed when you consume more fields.
 */

/** A single decoded track position (seconds since epoch). */
export interface WialonPosition {
  /** Unix timestamp (seconds) */
  t: number;
  /** Latitude */
  lat: number;
  /** Longitude */
  lon: number;
  /** Speed (km/h) if available */
  sp?: number;
  /** Course/heading (degrees) if available */
  cr?: number;
  /** Optional extras (altitude, satellites, etc.) */
  [k: string]: unknown;
}

/** Core shape of a Wialon unit (vehicle). */
export interface WialonUnit {
  id: number;
  /** Name; Wialon often uses `nm` */
  nm?: string;
  /** System name; sometimes present as `sys_name` */
  sys_name?: string;
  /** Last known position */
  pos?: {
    t?: number;
    y?: number; // latitude
    x?: number; // longitude
    sp?: number;
    cr?: number;
    [k: string]: unknown;
  };
  /** Last message object (alternative to pos) */
  lmsg?: unknown;
  /** Arbitrary extra fields Wialon may return */
  [k: string]: unknown;
}

/** Search result for lists like core/search_items. */
export interface WialonSearchItemsResult<T = unknown> {
  searchSpec: Record<string, unknown>;
  dataFlags: number;
  totalItemsCount: number;
  indexFrom: number;
  indexTo: number;
  items: T[];
}

/** Report export response commonly returns a URL or descriptor. */
export interface WialonReportExport {
  /** Direct or relative URL to the exported file */
  url?: string;
  /** Optional additional meta */
  [k: string]: unknown;
}

/** Useful flags to request richer unit details. */
export const WialonFlags = {
  /** Generous bitmask to include core fields & last position */
  UNIT_RICH: 0x0001ffff,
} as const;

export interface WialonPosition {
  t: number; // Unix sekondes
  lat: number;
  lon: number;
  sp?: number; // km/h
  cr?: number; // heading (°)
  [k: string]: unknown;
}

export interface WialonUnit {
  id: number;
  nm?: string;
  sys_name?: string;
  pos?: {
    t?: number;
    y?: number; // lat
    x?: number; // lon
    sp?: number;
    cr?: number;
    [k: string]: unknown;
  };
  lmsg?: unknown;
  [k: string]: unknown;
}

export interface WialonSearchItemsResult<T = unknown> {
  searchSpec: Record<string, unknown>;
  dataFlags?: number;
  flags?: number;
  totalItemsCount: number;
  indexFrom: number;
  indexTo: number;
  items: T[];
}

export const WialonFlags = {
  UNIT_RICH: 0x0001ffff,
} as const;

export interface WialonUnit {
  id: number;
  nm?: string;
  sys_name?: string;
  pos?: { t?: number; y?: number; x?: number; sp?: number; cr?: number };
  [k: string]: unknown;
}

export interface WialonSearchItemsResult<T = unknown> {
  searchSpec: Record<string, unknown>;
  flags?: number;
  totalItemsCount: number;
  items: T[];
  [k: string]: unknown;
}

export const WialonFlags = {
  UNIT_RICH: 0x0001ffff, // base + pos + lastMessage, etc.
} as const;
