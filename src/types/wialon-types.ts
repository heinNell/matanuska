/**
 * TypeScript definitions for Wialon GPS tracking integration
 */

export interface WialonPosition {
  t: number;
  y: number;
  x: number;
  sp?: number;
  cr?: number;
  [k: string]: unknown;
}

export interface WialonUnit {
  id: number;
  nm?: string;
  sys_name?: string;
  pos?: {
    t?: number;
    y?: number;
    x?: number;
    sp?: number;
    cr?: number;
    [k: string]: unknown;
  };
  lmsg?: unknown;
  [k: string]: unknown;
}

export interface WialonSearchItemsResult<T = unknown> {
  searchSpec: {
    itemsType: string;
    propName: string;
    propValueMask: string;
    sortType: string;
    propType?: string;
    or_logic?: number;
  };
  dataFlags: number;
  totalItemsCount: number;
  indexFrom: number;
  indexTo: number;
  items: T[];
}

export interface WialonReportExport {
  url?: string;
  [k: string]: unknown;
}

export const WialonFlags = {
  UNIT_RICH: 0x0001ffff,
} as const;

export interface WialonAvlUnit {
  id: number;
  nm: string;
  cls: number;
  pos?: WialonPosition;
  [k: string]: unknown;
}

export interface WialonSession {
  host: string;
  eid: string;
  gis_sid: string;
  au: string;
  tm: number;
  wsdk_version: string;
  base_url: string;
  hw_gw_ip: string;
  hw_gw_dns: string;
  gis_search: string;
  gis_render: string;
  gis_geocode: string;
  gis_routing: string;
  billing_by_codes: string;
  drivers_feature_flags: string;
  user: {
    nm: string;
    cls: number;
    id: number;
    prp: Record<string, string>;
  };
}
