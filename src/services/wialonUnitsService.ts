/**
 * Wialon Units API Service
 * Implements direct API calls that match your successful curl patterns
 */

const WIALON_API_URL = "https://hst-api.wialon.com/wialon/ajax.html";

// In-memory cache (simple, per-sessionId+flags+mask) with TTL
interface CacheEntry {
  expires: number;
  data: WialonUnitsResponse;
}
const unitsCache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 30_000; // 30s

export interface WialonUnit {
  nm: string;          // Unit name
  cls: number;         // Class (2 for units)
  id: number;          // Unit ID
  mu: number;          // Modified/Update flags
  uacl: number;        // User access control level
}

export interface WialonUnitsResponse {
  searchSpec: {
    itemsType: string;
    propName: string;
    propValueMask: string;
    sortType: string;
    propType?: string;
    or_logic?: string;
  };
  dataFlags: number;
  totalItemsCount: number;
  indexFrom: number;
  indexTo: number;
  items: WialonUnit[];
}

export interface WialonApiError {
  error: number;
  reason?: string;
}

// Error code mapping (minimal - extend as needed)
const WIALON_ERROR_MAP: Record<number, string> = {
  1: "Invalid session",
  2: "Invalid service", 
  3: "Invalid result",
  4: "Invalid input",
  5: "Error performing request",
  7: "Access denied",
  1001: "No such item"
};

// Runtime validator
function isWialonUnitsResponse(data: unknown): data is WialonUnitsResponse {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.items)) return false;
  if (typeof d.totalItemsCount !== 'number') return false;
  if (typeof d.dataFlags !== 'number') return false;
  return true;
}

// Centralized POST
async function postWialon<T>(sessionId: string, svc: string, params: unknown): Promise<T> {
  const formData = new URLSearchParams();
  formData.append('svc', svc);
  formData.append('params', JSON.stringify(params));
  formData.append('sid', sessionId);

  const response = await fetch(WIALON_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} (${response.statusText})`);
  }

  // FIX: remove unused 'data' var; use a single parsed object
  const json = await response.json() as unknown;

  if (typeof json === 'object' && json !== null && 'error' in json) {
    const apiErr = json as WialonApiError;
    const mapped = WIALON_ERROR_MAP[apiErr.error] || 'Unknown error';
    const reason = apiErr.reason ?? mapped;
    throw new Error(`Wialon API error ${apiErr.error}: ${reason}`);
  }

  return json as T;
}

interface SearchUnitsOptions {
  mask?: string;          // Wildcard mask (* default)
  flags?: number;         // Data flags
  from?: number;
  to?: number;
  force?: 0 | 1;
  useCache?: boolean;
  ttlMs?: number;
}

/**
 * Generic unit search with caching & runtime validation.
 */
export async function searchUnits(
  sessionId: string,
  {
    mask = "*",
    flags = 1,
    from = 0,
    to = 0,
    force = 1,
    useCache = true,
    ttlMs = DEFAULT_TTL_MS
  }: SearchUnitsOptions = {}
): Promise<WialonUnitsResponse> {
  const cacheKey = `${sessionId}|${mask}|${flags}|${from}|${to}`;
  if (useCache) {
    const hit = unitsCache.get(cacheKey);
    if (hit && hit.expires > Date.now()) {
      return hit.data;
    }
  }

  const params = {
    spec: {
      itemsType: "avl_unit",
      propName: "sys_name",
      propValueMask: mask,
      sortType: "sys_name"
    },
    force,
    flags,
    from,
    to
  };

  try {
    const raw = await postWialon<unknown>(sessionId, 'core/search_items', params);

    if (!isWialonUnitsResponse(raw)) {
      throw new Error('Unexpected Wialon units response shape');
    }

    if (useCache) {
      unitsCache.set(cacheKey, { data: raw, expires: Date.now() + ttlMs });
    }

    return raw;
  } catch (err) {
    console.error('searchUnits error:', err);
    throw err;
  }
}

/**
 * Backward-compatible basic search (flags = 1)
 */
export async function searchWialonUnits(sessionId: string): Promise<WialonUnitsResponse> {
  return searchUnits(sessionId, { flags: 1 });
}

/**
 * Backward-compatible detailed search (all flags)
 */
export async function searchWialonUnitsDetailed(sessionId: string): Promise<WialonUnitsResponse> {
  return searchUnits(sessionId, { flags: 0xFFFFFFFF });
}

/**
 * Get unit by ID (uses cache if present; falls back to detailed search)
 */
export async function getUnitById(sessionId: string, unitId: number): Promise<WialonUnit | null> {
  // Attempt cache scan first
  for (const entry of unitsCache.values()) {
    const found = entry.data.items.find(u => u.id === unitId);
    if (found) return found;
  }
  try {
    const unitsResponse = await searchWialonUnitsDetailed(sessionId);
    return unitsResponse.items.find(unit => unit.id === unitId) || null;
  } catch (error) {
    console.error('Get unit by ID error:', error);
    throw error;
  }
}
