// src/types/wialon-complete.ts
// Complete type definitions for production Wialon integration

import { WialonPosition, WialonUnit } from './wialon-types';

// Enhanced API Response Types
export interface WialonSearchItemResult<T = unknown> {
  item?: T;
}

export interface WialonMessagesLoadResult {
  mid?: string;
}

export interface WialonMessagesResult {
  messages?: WialonRawMessage[];
}

export interface WialonRawMessage {
  t?: number;
  tp?: string;
  pos?: {
    t?: number;
    y?: number;
    x?: number;
    sp?: number;
    c?: number;
    cr?: number;
  };
  p?: Record<string, unknown>;
}

export interface WialonSearchItemsResult<T = unknown> {
  searchSpec?: Record<string, unknown>;
  dataFlags?: number;
  totalItemsCount?: number;
  indexFrom?: number;
  indexTo?: number;
  items?: T[];
}

export interface WialonCheckItemsResult<T = unknown> {
  items?: T[];
}

export interface WialonUnitWithPosition extends WialonUnit {
  pos?: {
    t: number;
    y: number;
    x: number;
    sp?: number;
    cr?: number;
    c?: number;
  };
  nm?: string;
  sys_name?: string;
}

// Enhanced Unit Data Types
export interface WialonUnitDetailed extends WialonUnit {
  pos?: {
    t: number; // timestamp
    y: number; // latitude
    x: number; // longitude
    z?: number; // altitude
    s?: number; // satellites
    sp?: number; // speed
    c?: number; // course
    sc?: number; // speed in course
  };
  lmsg?: {
    t: number;
    tp: string;
    pos?: WialonPosition;
    p?: Record<string, unknown>;
  };
  sens?: WialonSensor[];
  cneh?: number; // connection timeout
  cnkb?: number; // connection bytes
  flds?: Record<string, unknown>; // custom fields
  pflds?: Record<string, unknown>; // profile fields
  aflds?: Record<string, unknown>; // admin fields
  nm?: string; // name
  sys_name?: string; // system name
}

export interface WialonSensor {
  id: number;
  n: string; // name
  t: string; // type
  d: string; // description
  m: string; // measure unit
  p: string; // parameters
  f: number; // flags
  c: string; // calculation table
  vs: number; // validation settings
  tbl?: WialonSensorTable[];
}

export interface WialonSensorTable {
  x: number; // input value
  a: number; // coefficient a
  b: number; // coefficient b
}

export interface WialonUnitComplete extends WialonUnitDetailed {
  sensors?: WialonSensor[];
  recentMessages?: WialonMessage[];
  lastUpdated?: Date;
  isOnline?: boolean;
  currentPosition?: WialonPosition | null;
  fuelLevel?: number | null;
  speed?: number | null;
  engineHours?: number | null;
  fleetId?: string;
  registrationNumber?: string;
  vehicleType?: string;
  connectivityType?: string;
  isDemoUnit?: boolean;
  accessLevel?: string;
  lastSeen?: Date;
  status?: 'online' | 'offline' | 'idle' | 'moving';
}

export interface WialonMessage {
  t: number; // timestamp
  tp: string; // message type
  pos?: WialonPosition;
  p?: Record<string, unknown>; // parameters
  i?: number; // item id
  formattedTime?: string;
  hasPosition?: boolean;
  hasParams?: boolean;
}

// Report and Data Management Types
export interface WialonLoginResponse {
  eid: string; // session ID
  user: {
    id: number;
    nm: string;
    bact: number; // billing account
    prp: Record<string, unknown>; // properties
  };
  tm: number; // timestamp
  features: Record<string, unknown>;
  gis_search?: string;
  gis_render?: string;
  gis_geocode?: string;
  gis_routing?: string;
}

export interface WialonAdvancedSearchParams {
  spec: {
    itemsType: string;
    propName: string;
    propValueMask: string;
    sortType: string;
    propType?: string;
    or_logic?: string;
  };
  force: number;
  flags: number;
  from: number;
  to: number;
}

export interface WialonSearchResult<T> {
  searchSpec?: Record<string, unknown>;
  dataFlags?: number;
  totalItemsCount?: number;
  indexFrom?: number;
  indexTo?: number;
  items?: T[];
}

// System Data Types
export interface WialonUser {
  id: number;
  nm: string;
  cls: number;
  crt: number;
  prp?: Record<string, unknown>;
}

export interface WialonResource {
  id: number;
  nm: string;
  cls: number;
  crt: number;
  rep?: WialonReportTemplate[];
}

export interface WialonUnitGroup {
  id: number;
  nm: string;
  cls: number;
  crt: number;
  u?: number[]; // unit IDs
}

export interface WialonHardware {
  id: number;
  nm: string;
  cls: number;
  crt: number;
  hw?: Record<string, unknown>;
}

export interface WialonReportTemplate {
  n: string; // name
  ct: string; // content type
  p: string; // parameters
  tbl?: WialonReportTableTemplate[];
}

export interface WialonReportTableTemplate {
  n: string; // name
  l: string; // label
  c: string; // columns
  cl: string; // column labels
  cp: string; // column parameters
  s: string; // settings
  sl: string; // setting labels
  filter_order?: string[];
  p: string; // parameters
  sch?: WialonSchedule;
  f: number; // flags
}

export interface WialonSchedule {
  f1: number;
  f2: number;
  t1: number;
  t2: number;
  m: number;
  y: number;
  w: number;
  fl: number;
}

export interface WialonSystemData {
  units: WialonUnitComplete[];
  users: WialonUser[];
  resources: WialonResource[];
  unitGroups: WialonUnitGroup[];
  hardware: WialonHardware[];
  loadedAt: Date;
}

export interface WialonFleetStatus {
  total: number;
  online: number;
  offline: number;
  moving: number;
  idle: number;
  categories: Record<string, number>;
  lastUpdate: Date;
}

// Error handling
export class WialonAPIError extends Error {
  constructor(
    public errorCode: number | string,
    public service: string,
    public params: unknown
  ) {
    super(`Wialon API Error ${errorCode} in ${service}`);
    this.name = 'WialonAPIError';
  }
}

// Batch operations
export interface WialonBatchCommand {
  svc: string;
  params: Record<string, unknown>;
}

export interface WialonBatchResult {
  commandIndex: number;
  success: boolean;
  data: unknown;
  error?: string;
}

// Cache management
export interface CachedData<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface DataSubscriber {
  id: string;
  callback: (data: unknown) => void;
}

// Processing interfaces
export interface WialonUnitProcessed extends WialonUnitDetailed {
  fleetId?: string;
  registrationNumber?: string;
  vehicleType?: string;
  connectivityType?: string;
  isDemoUnit?: boolean;
  accessLevel?: string;
  lastSeen?: Date;
  status?: 'online' | 'offline' | 'idle' | 'moving';
}

// Search and filtering
export interface WialonSearchCriteria {
  name?: string;
  creator?: string;
  phoneNumber?: string;
  accountBalance?: { min?: number; max?: number };
  customFields?: Record<string, string>;
  useOrLogic?: boolean;
  sortBy?: string;
  propertyType?: string;
  offset?: number;
  limit?: number;
}

// Configuration
export interface WialonConfig {
  token: string;
  baseUrl: string;
  userId: number;
  resourceId: number;
  refreshInterval: number;
  cacheTimeout: number;
}

// Fleet item for compatibility
export interface FleetItem {
  id: number;
  name: string;
  status: "active" | "idle" | "offline";
  position: { lat: number; lng: number } | null;
  speed: number;
  heading?: number;
  lastUpdate: Date | null;
  raw: WialonUnit;
}

export type { WialonPosition, WialonUnit } from './wialon-types';
