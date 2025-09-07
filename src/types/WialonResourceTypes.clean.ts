/**
 * Wialon Resource Types - Clean TypeScript definitions
 * Based on actual Wialon API response structures
 */

export interface WialonResource {
  id: number;
  name: string;
  type: number;
  creatorId: number;
  dataFlags: number;
  accountId: number;
  enabled: boolean;
  prp?: WialonResourceProperties;
}

export interface WialonResourceProperties {
  __sensolator_resource_id?: string;
  access_templates?: string;
  autoFillPromo?: string;
  autocomplete?: string;
  dst?: string;
  evt_flags?: string;
  forceAddedDashboardTabOnce?: string;
  forceAddedTaskManagerTabOnce?: string;
  fpnl?: string;
  geodata_source?: string;
  hbacit?: string;
  lng?: string;
  map_unit_ext_template?: string;
  mu?: string;
  notif_counters?: string;
  notify_sys?: string;
  pos_view_tooltip?: string;
  pos_y?: string;
  reportDefaultTemplate?: string;
  reportTemplates?: string;
  reports_interval?: string;
  retranslate?: string;
  ses_log_enabled?: string;
  tz?: string;
  uiacts?: string;
  unit_color_theme?: string;
  unit_speed_max?: string;
  v?: string;
  webnotify_version?: string;
  [key: string]: unknown; // Allow additional properties
}

export interface WialonUnit {
  id: number;
  nm: string;
  cls: number;
  prp?: WialonUnitProperties;
  pos?: WialonUnitPosition;
  lmsg?: WialonLastMessage;
}

export interface WialonUnitProperties {
  sys_name?: string;
  sys_id?: string;
  phone?: string;
  hw_type?: string;
  [key: string]: unknown;
}

export interface WialonUnitPosition {
  x: number; // longitude
  y: number; // latitude
  z?: number; // altitude
  s?: number; // speed
  c?: number; // course
  t: number; // time
}

export interface WialonLastMessage {
  t: number;
  f: number;
  tp?: string;
  pos?: WialonUnitPosition;
  p?: Record<string, unknown>;
}

export interface WialonResourceList {
  spec: {
    itemsType: string;
    propName: string;
    propValueMask: string;
    sortType: string;
  };
  data: {
    totalItemsCount: number;
    indexFrom: number;
    indexTo: number;
    items: WialonResource[];
  };
}

// Generic type for handling complex nested Wialon data
export type WialonDataValue = string | number | boolean | null | WialonDataObject | WialonDataValue[];

export interface WialonDataObject {
  [key: string]: WialonDataValue;
}

// Re-export for compatibility
export type { WialonResource as WialonResourceType };
