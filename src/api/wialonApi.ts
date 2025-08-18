// wialonApi.ts - Adapter to fetch Wialon GPS unit data

import type { WialonUnitBrief } from '@/types/wialon';

// Prefer env-provided base URL, fallback to default host
const WIALON_API_BASE =
  (import.meta as any)?.env?.VITE_WIALON_API_URL?.replace(/\/$/, '') ||
  'https://hst-api.wialon.com/wialon/ajax.html';
const WIALON_TOKEN = (import.meta as any)?.env?.VITE_WIALON_TOKEN;

let SID: string | null = null;

/**
 * Ensure Wialon session is initialized
 */
export async function ensureWialonSession(): Promise<string> {
  if (SID) return SID;

  const res = await fetch(`${WIALON_API_BASE}?svc=token/login&params=${encodeURIComponent(JSON.stringify({ token: WIALON_TOKEN }))}`);
  const data = await res.json();
  if (!data || !data.eid) throw new Error('Failed to authenticate with Wialon');

  SID = data.eid as string;
  return SID;
}

/**
 * Fetch Wialon units (GPS devices)
 */
export async function fetchWialonUnits(): Promise<WialonUnitBrief[]> {
  const sid = await ensureWialonSession();
  const params = {
    spec: {
      itemsType: 'avl_unit',
      propName: 'sys_name',
      propValueMask: '*',
      sortType: 'sys_name'
    },
    force: 1,
    flags: 1 + 0x0001 + 0x0002 + 0x0004 + 0x0008 + 0x0010 + 0x0020 + 0x0100,
    from: 0,
    to: 0
  };

  const res = await fetch(`${WIALON_API_BASE}?svc=core/search_items&sid=${sid}&params=${encodeURIComponent(JSON.stringify(params))}`);
  const data = await res.json();

  return (data.items || []).map((unit: any) => ({
    id: unit.id,
    name: unit.nm,
    lat: unit.pos?.y,
    lng: unit.pos?.x,
    speed: unit.pos?.s,
    course: unit.pos?.c,
    time: unit.pos?.t
  }));
}

/**
 * Logout from Wialon
 */
export async function logoutWialon(): Promise<void> {
  if (!SID) return;
  await fetch(`${WIALON_API_BASE}?svc=core/logout&sid=${SID}`);
  SID = null;
}
