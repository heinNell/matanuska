/**
 * Wialon Units API Service
 * Implements direct API calls that match your successful curl patterns
 */

const WIALON_API_URL = "https://hst-api.wialon.com/wialon/ajax.html";

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
    propType: string;
    or_logic: string;
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

/**
 * Search for Wialon units using the same pattern as your successful curl request
 */
export async function searchWialonUnits(sessionId: string): Promise<WialonUnitsResponse> {
  try {
    const formData = new URLSearchParams();
    formData.append('svc', 'core/search_items');
    formData.append('params', JSON.stringify({
      "spec": {
        "itemsType": "avl_unit",
        "propName": "sys_name",
        "propValueMask": "*",
        "sortType": "sys_name"
      },
      "force": 1,
      "flags": 1,  // Basic data flags
      "from": 0,
      "to": 0      // 0 means get all items
    }));
    formData.append('sid', sessionId);

    const response = await fetch(WIALON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: WialonUnitsResponse | WialonApiError = await response.json();

    // Check for Wialon API errors
    if ('error' in data) {
      throw new Error(`Wialon API error ${data.error}: ${data.reason || 'Unknown error'}`);
    }

    return data as WialonUnitsResponse;
  } catch (error) {
    console.error('Wialon units search error:', error);
    throw error;
  }
}

/**
 * Search for units with detailed information (more flags)
 */
export async function searchWialonUnitsDetailed(sessionId: string): Promise<WialonUnitsResponse> {
  try {
    const formData = new URLSearchParams();
    formData.append('svc', 'core/search_items');
    formData.append('params', JSON.stringify({
      "spec": {
        "itemsType": "avl_unit",
        "propName": "sys_name",
        "propValueMask": "*",
        "sortType": "sys_name"
      },
      "force": 1,
      "flags": 4294967295,  // All available flags (0xFFFFFFFF)
      "from": 0,
      "to": 0
    }));
    formData.append('sid', sessionId);

    const response = await fetch(WIALON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: WialonUnitsResponse | WialonApiError = await response.json();

    if ('error' in data) {
      throw new Error(`Wialon API error ${data.error}: ${data.reason || 'Unknown error'}`);
    }

    return data as WialonUnitsResponse;
  } catch (error) {
    console.error('Wialon detailed units search error:', error);
    throw error;
  }
}

/**
 * Get unit details by ID
 */
export async function getUnitById(sessionId: string, unitId: number): Promise<WialonUnit | null> {
  try {
    const unitsResponse = await searchWialonUnitsDetailed(sessionId);
    return unitsResponse.items.find(unit => unit.id === unitId) || null;
  } catch (error) {
    console.error('Get unit by ID error:', error);
    throw error;
  }
}
