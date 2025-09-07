// src/services/WialonServiceComplete.ts
import {
  WialonPosition,
  WialonUnit,
  WialonSearchItemsResult,
  WialonFlags
} from "../types/wialon-types";

// Enhanced types for complete API coverage
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
  gis_search: string;
  gis_render: string;
  gis_geocode: string;
  gis_routing: string;
}

export interface WialonResource {
  id: number;
  nm: string;
  cls: number;
  mu: number;
  rep?: Record<string, {
    id: number;
    n: string;
    ct: string;
    c: number;
  }>;
  repmax?: number;
  uacl?: number;
}

export interface WialonUnitGroup {
  id: number;
  nm: string;
  cls: number;
  u?: number[]; // unit IDs
  [key: string]: unknown;
}

export interface WialonUser {
  id: number;
  nm: string;
  cls: number;
  prp?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface WialonHardware {
  id: number;
  nm: string;
  cls: number;
  hw?: string;
  [key: string]: unknown;
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
  i?: number;
}

export interface ProcessedSearchData {
  id: number;
  name: string;
  type: string;
  reports: number;
  userAccess: number;
}

export interface WialonSearchResult<T> {
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
  items?: T[];
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

export interface WialonUnitDetailed extends WialonUnit {
  pos?: {
    t: number; // timestamp
    y: number; // latitude
    x: number; // longitude
    z: number; // altitude
    s: number; // satellites
    sp: number; // speed
    c: number; // course
    sc: number; // speed in course
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

export interface WialonReportParamsComplete {
  resourceId?: number;
  templateId: number;
  objectId?: number;
  subObjectId?: number;
  objectIdList?: number[];
  interval: WialonInterval;
  remoteExec?: number;
  customTemplate?: WialonReportTemplate;
}

export interface WialonInterval {
  from: number;
  to: number;
  flags: number;
}

export interface WialonReportTemplate {
  n: string; // name
  ct: string; // content type
  p: string; // parameters
  tbl: WialonReportTableTemplate[];
}

export interface WialonReportTableTemplate {
  n: string; // name
  l: string; // label
  c: string; // columns
  cl: string; // column labels
  cp: string; // column parameters
  s: string; // settings
  sl: string; // setting labels
  filter_order: string[];
  p: string; // parameters
  sch: WialonSchedule;
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

export interface WialonReportResultComplete {
  msgsRendered?: number;
  reportResult?: {
    stats: Record<string, unknown>;
  };
}

export interface WialonReportStatus {
  remoteExec: number;
  status: number;
  info: string;
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

// Custom error class for Wialon API errors
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

// Fix: proper constant name (previously caused parsing error)
const WIALON_API_BASE_URL =
  (typeof import.meta !== "undefined" &&
    (import.meta as { env?: { VITE_WIALON_API_URL?: string } }).env?.VITE_WIALON_API_URL) ||
  "https://hst-api.wialon.com";

/**
 * Complete Wialon Service with full API coverage and real data integration
 * Replaces the existing wialonService.ts with comprehensive functionality
 */
export class WialonServiceComplete {
  // Updated to use the constant
  private baseUrl = `${WIALON_API_BASE_URL}/wialon/ajax.html`;
  private sessionId: string | null = null;
  private token: string;
  private userId = 600542271; // Your actual user ID
  private resourceId = 25138250; // Your Matanuska resource ID
  private subscriptions = new Map<number, number>();
  private isInitialized = false;

  constructor(token?: string) {
    this.token = token || process.env.VITE_WIALON_TOKEN ||
      'c1099bc37c906fd0832d8e783b60ae0dFB204570A7D9753A37B331BA7C74FE035A292DC3';
  }

  /**
   * Initialize the service
   */
  initialize(): void {
    if (this.isInitialized === true) return;
    this.isInitialized = true;
    console.log('[WialonServiceComplete] Initialized');
  }

  /**
   * Complete login with full session data
   */
  async login(): Promise<WialonLoginResponse> {
    if (this.isInitialized === false) this.initialize();

    const params = { token: this.token };
    const response = await this.makeRequest('token/login', params) as WialonLoginResponse;

    this.sessionId = response.eid;
    this.storeSessionData(response);

    console.log('[WialonServiceComplete] Login successful, user:', response.user.nm);
    return response;
  }

  /**
   * Login with token (compatibility method)
   */
  async loginWithToken(token: string): Promise<WialonLoginResponse> {
    this.token = token;
    return await this.login();
  }

  /**
   * Bootstrap from login response (compatibility method)
   */
  bootstrapFromLoginResponse(resp: { base_url: string; eid: string }): void {
    this.baseUrl = resp.base_url + '/wialon/ajax.html';
    this.sessionId = resp.eid;
    this.isInitialized = true;
  }

  /**
   * Logout and cleanup
   */
  async logout(): Promise<void> {
    if (this.sessionId === null || this.sessionId === '') return;

    try {
      await this.makeRequest('core/logout', {});
      console.log('[WialonServiceComplete] Logged out');
    } catch (error) {
      console.warn('[WialonServiceComplete] Logout error:', error);
    } finally {
      this.sessionId = null;
      this.clearSubscriptions();
    }
  }

  /**
   * Advanced search with all supported filters
   */
  async searchItemsAdvanced<T>(params: WialonAdvancedSearchParams): Promise<WialonSearchResult<T>> {
    if (this.sessionId === null || this.sessionId === '') {
      throw new Error('Not logged in - call login() first');
    }

    return await this.makeRequest('core/search_items', params) as WialonSearchResult<T>;
  }

  /**
   * Get complete unit data with detailed flags (replaces existing getUnits)
   */
  async getUnitsDetailed(): Promise<WialonSearchResult<WialonUnitDetailed>> {
    return await this.searchItemsAdvanced({
      spec: {
        itemsType: 'avl_unit',
        propName: 'sys_name',
        propValueMask: '*',
        sortType: 'sys_name',
        propType: '',
        or_logic: '0'
      },
      force: 1,
      flags: 0x1 | 0x2 | 0x4 | 0x8 | 0x10 | 0x20 | 0x40 | 0x80, // All unit data flags
      from: 0,
      to: 0
    });
  }

  /**
   * Get units (compatibility method) - replaces broken original
   */
  async getUnits(): Promise<WialonUnitDetailed[]> {
    const result = await this.getUnitsDetailed();
    return result.items || [];
  }

  /**
   * Get unit by ID with enhanced error handling
   */
  async getUnitById(unitId: number): Promise<WialonUnitDetailed | null> {
    if (this.sessionId === null || this.sessionId === '') {
      throw new Error('Not logged in - call login() first');
    }

    try {
      const result = await this.searchItemsAdvanced<WialonUnitDetailed>({
        spec: {
          itemsType: 'avl_unit',
          propName: 'sys_id',
          propValueMask: unitId.toString(),
          sortType: 'sys_name'
        },
        force: 1,
        flags: 0x1 | 0x2 | 0x4 | 0x8 | 0x10 | 0x20 | 0x40 | 0x80,
        from: 0,
        to: 0
      });

      return result.items && result.items.length > 0 ? result.items[0] : null;
    } catch (error) {
      console.error(`[WialonServiceComplete] getUnitById ${unitId} failed:`, error);
      throw new Error(`Failed to retrieve unit ${unitId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get unit history with proper error handling
   */
  async getUnitHistory(unitId: number, from: Date, to: Date): Promise<WialonPosition[]> {
    if (this.sessionId === null || this.sessionId === '') {
      throw new Error('Not logged in - call login() first');
    }
    if (from > to) {
      throw new Error("Invalid history range: 'from' is after 'to'");
    }

    try {
      const timeFrom = Math.floor(from.getTime() / 1000);
      const timeTo = Math.floor(to.getTime() / 1000);

      // Load messages interval
      const loadResult = await this.makeRequest('messages/load_interval', {
        itemId: unitId,
        timeFrom,
        timeTo,
        flags: 0xFF, // All message types
        flagsMask: 0xFFFFFFFF
      });

      if (loadResult === null || loadResult === undefined) return [];

      // Get messages
      const messagesResult = await this.makeRequest('messages/get_messages', {
        itemId: unitId,
        indexFrom: 0,
        indexTo: 0xFFFFFFFF
      });

      // Unload messages to free memory
      try {
        await this.makeRequest('messages/unload', { itemId: unitId });
      } catch {
        // Ignore unload errors
      }

      interface MessageResult {
        messages?: unknown[];
      }

      const messages = (messagesResult as MessageResult)?.messages || [];
      return messages
        .map((msg: unknown) => this.processMessage(msg as WialonRawMessage))
        .filter((pos: WialonPosition | null) => pos !== null);

    } catch (error) {
      console.error(`[WialonServiceComplete] getUnitHistory ${unitId} failed:`, error);
      throw new Error(`Failed to retrieve history for unit ${unitId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute comprehensive reports with all parameters
   */
  async executeReportComplete(params: WialonReportParamsComplete): Promise<WialonReportResultComplete> {
    if (this.sessionId === null || this.sessionId === '') {
      throw new Error('Not logged in - call login() first');
    }

    // Clean up any existing report first
    await this.cleanupReport();

    const reportParams = {
      reportResourceId: params.resourceId || this.resourceId,
      reportTemplateId: params.templateId,
      reportObjectId: params.objectId || 0,
      reportObjectSecId: params.subObjectId || 0,
      reportObjectIdList: params.objectIdList || [],
      interval: params.interval,
      remoteExec: params.remoteExec || 0,
      reportTemplate: params.customTemplate || null
    };

    return await this.makeRequest('report/exec_report', reportParams) as WialonReportResultComplete;
  }

  /**
   * Execute custom method (compatibility with existing code)
   */
  async executeCustomMethod<T>(methodName: string, params: Record<string, unknown>): Promise<T> {
    if (this.sessionId === null || this.sessionId === '') {
      throw new Error('Not logged in - call login() first');
    }

    return await this.makeRequest(methodName, params) as T;
  }

  /**
   * Execute batch operations with error handling
   */
  async executeBatchSafe(commands: WialonBatchCommand[], stopOnError = false): Promise<WialonBatchResult[]> {
    if (this.sessionId === null || this.sessionId === '') {
      throw new Error('Not logged in - call login() first');
    }

    const params = {
      params: commands,
      flags: stopOnError ? 1 : 0
    };

    const results = await this.makeRequest('core/batch', params) as unknown[];

    return results.map((result, index) => ({
      commandIndex: index,
      success: !this.hasError(result),
      data: result,
      error: this.hasError(result) ? this.extractError(result) : undefined
    }));
  }

  /**
   * Subscribe to unit updates (enhanced version)
   */
  subscribeToUnit(unitId: number, callback: (unit: WialonUnitDetailed) => void): void {
    if (this.sessionId === null || this.sessionId === '') {
      throw new Error('Not logged in - call login() first');
    }

    if (this.subscriptions.has(unitId)) {
      console.warn(`[WialonServiceComplete] Already subscribed to unit ${unitId}`);
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
      const unit = await this.getUnitById(unitId);
      if (unit !== null) callback(unit);
      } catch (error) {
        console.warn(`[WialonServiceComplete] Polling unit ${unitId} failed:`, error);
      }
    }, 10_000);

    this.subscriptions.set(unitId, intervalId);
    console.log(`[WialonServiceComplete] Subscribed to unit ${unitId}`);
  }

  /**
   * Unsubscribe from unit updates
   */
  unsubscribeFromUnit(unitId: number): void {
    const intervalId = this.subscriptions.get(unitId);
    if (intervalId) {
      clearInterval(intervalId);
      this.subscriptions.delete(unitId);
      console.log(`[WialonServiceComplete] Unsubscribed from unit ${unitId}`);
    }
  }

  /**
   * Search with custom fields and profile fields
   */
  async searchWithCustomFields(itemType: string, customFields: Record<string, string>): Promise<WialonUnitDetailed[]> {
    const propNames = Object.keys(customFields).map(field => `rel_customfield_${field}_value`);
    const propValues = Object.values(customFields);

    const result = await this.searchItemsAdvanced<WialonUnitDetailed>({
      spec: {
        itemsType: itemType,
        propName: propNames.join(','),
        propValueMask: propValues.join(','),
        sortType: 'sys_name',
        propType: 'customfield'
      },
      force: 1,
      flags: 0x1 | 0x2 | 0x4 | 0x8, // Basic + sensors + custom fields
      from: 0,
      to: 0
    });

    return result.items || [];
  }

  /**
   * Get unit groups with full hierarchy
   */
  async getUnitGroups(): Promise<WialonSearchResult<WialonUnitGroup>> {
    return await this.searchItemsAdvanced({
      spec: {
        itemsType: 'avl_unit_group',
        propName: 'sys_name',
        propValueMask: '*',
        sortType: 'sys_name'
      },
      force: 1,
      flags: 0x1 | 0x2, // Basic info + units list
      from: 0,
      to: 0
    });
  }

  /**
   * Get users with all properties
   */
  async getUsers(): Promise<WialonSearchResult<WialonUser>> {
    return await this.searchItemsAdvanced({
      spec: {
        itemsType: 'user',
        propName: 'sys_name',
        propValueMask: '*',
        sortType: 'sys_name'
      },
      force: 1,
      flags: 0x1 | 0x2, // Basic info + properties
      from: 0,
      to: 0
    });
  }

  /**
   * Get resources with reports
   */
  async getResources(): Promise<WialonSearchResult<WialonResource>> {
    return await this.searchItemsAdvanced({
      spec: {
        itemsType: 'avl_resource',
        propName: 'sys_name',
        propValueMask: '*',
        sortType: 'sys_name'
      },
      force: 1,
      flags: 0x1 | 0x2 | 0x4, // Basic info + reports + zones
      from: 0,
      to: 0
    });
  }

  /**
   * Get hardware types and configurations
   */
  async getHardwareTypes(): Promise<WialonSearchResult<WialonHardware>> {
    return await this.searchItemsAdvanced({
      spec: {
        itemsType: 'avl_hw',
        propName: 'sys_name',
        propValueMask: '*',
        sortType: 'sys_name'
      },
      force: 1,
      flags: 0x1, // Basic info
      from: 0,
      to: 0
    });
  }

  /**
   * Get report status (for server-side execution)
   */
  async getReportStatus(): Promise<WialonReportStatus> {
    if (this.sessionId === null || this.sessionId === '') {
      throw new Error('Not logged in - call login() first');
    }

    return await this.makeRequest('report/get_report_status', {}) as WialonReportStatus;
  }

  /**
   * Cleanup report resources
   */
  async cleanupReport(): Promise<void> {
    if (this.sessionId === null || this.sessionId === '') return;

    try {
      await this.makeRequest('report/cleanup_result', {});
    } catch {
      // Ignore cleanup errors
    }
  }

  /**
   * Advanced batch search - execute multiple searches in one request
   */
  async batchSearchUnits(searchConfigs: WialonAdvancedSearchParams[]): Promise<WialonSearchResult<WialonUnitDetailed>[]> {
    const batchCommands: WialonBatchCommand[] = searchConfigs.map((config) => ({
      svc: 'core/search_items',
      params: config
    }));

    const results = await this.executeBatchSafe(batchCommands);

    return results.map(result => {
      if (result.success) {
        return result.data as WialonSearchResult<WialonUnitDetailed>;
      } else {
        console.warn(`Batch search ${result.commandIndex} failed:`, result.error);
        return { items: [] } as WialonSearchResult<WialonUnitDetailed>;
      }
    });
  }

  /**
   * Batch unit details loading - get multiple units efficiently
   */
  async batchGetUnitDetails(unitIds: number[]): Promise<(WialonUnitDetailed | null)[]> {
    const batchCommands: WialonBatchCommand[] = unitIds.map(unitId => ({
      svc: 'core/search_items',
      params: {
        spec: {
          itemsType: 'avl_unit',
          propName: 'sys_id',
          propValueMask: unitId.toString(),
          sortType: 'sys_name'
        },
        force: 1,
        flags: 0x1 | 0x2 | 0x4 | 0x8 | 0x10 | 0x20 | 0x40 | 0x80,
        from: 0,
        to: 0
      }
    }));

    const results = await this.executeBatchSafe(batchCommands);

    return results.map((result, index) => {
      if (result.success) {
        const searchResult = result.data as WialonSearchResult<WialonUnitDetailed>;
        return searchResult.items && searchResult.items.length > 0 ? searchResult.items[0] : null;
      } else {
        console.warn(`Failed to get unit ${unitIds[index]}:`, result.error);
        return null;
      }
    });
  }

  /**
   * Process message data into structured format
   */
  private processMessage(message: WialonRawMessage): WialonPosition | null {
    if (!message) return null;

    const pos = message.pos || message;
    if (!pos || typeof pos.y !== 'number' || typeof pos.x !== 'number') {
      return null;
    }

    return {
      t: pos.t || message.t || 0,
      lat: pos.y,
      lon: pos.x,
      sp: pos.sp || 0,
      cr: pos.c || pos.cr || 0
    };
  }

  /**
   * Store session data for later use
   */
  private storeSessionData(loginResponse: WialonLoginResponse): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('wialon_session_complete', JSON.stringify({
        sessionId: loginResponse.eid,
        userId: loginResponse.user.id,
        resourceId: loginResponse.user.bact,
        features: loginResponse.features,
        userProperties: loginResponse.user.prp,
        gisServices: {
          search: loginResponse.gis_search,
          render: loginResponse.gis_render,
          geocode: loginResponse.gis_geocode,
          routing: loginResponse.gis_routing
        },
        expires: loginResponse.tm * 1000
      }));
    }
  }

  /**
   * Clear all subscriptions
   */
  private clearSubscriptions(): void {
    for (const intervalId of this.subscriptions.values()) {
      clearInterval(intervalId);
    }
    this.subscriptions.clear();
  }

  /**
   * Check if result has error
   */
  private hasError(result: unknown): boolean {
    return result && typeof result === 'object' && result !== null && 'error' in result;
  }

  /**
   * Extract error message
   */
  private extractError(result: unknown): string {
    if (this.hasError(result) && result && typeof result === 'object') {
      const errorResult = result as { error: unknown };
      return typeof errorResult.error === 'string' ? errorResult.error : `Error code: ${errorResult.error}`;
    }
    return 'Unknown error';
  }

  /**
   * Enhanced HTTP request with full error handling
   */
  private async makeRequest(service: string, params: unknown): Promise<unknown> {
    const formData = new URLSearchParams();
    formData.append('svc', service);
    formData.append('params', JSON.stringify(params));

    if (this.sessionId !== null && this.sessionId !== '' && service !== 'token/login') {
      formData.append('sid', this.sessionId);
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (this.hasError(data)) {
        throw new WialonAPIError(data.error, service, params);
      }

      return data;
    } catch (error) {
      if (error instanceof WialonAPIError) {
        throw error;
      }
      throw new WialonAPIError(
        error instanceof Error ? error.message : 'Unknown error',
        service,
        params
      );
    }
  }

  /**
   * Search items by query string using the real API response format
   * (Renamed from searchItems to avoid clash with generic searchItems below)
   */
  async searchResources(searchQuery: string): Promise<WialonSearchItemsResult<WialonResource>> {
    if (this.sessionId === null || this.sessionId === '') {
      throw new Error('Not logged in - call login() first');
    }

    try {
      const result = await this.searchItemsAdvanced<WialonResource>({
        spec: {
          itemsType: 'avl_resource',
          propName: 'sys_name',
          propValueMask: searchQuery || '*',
          sortType: 'sys_name',
          propType: '',
          or_logic: '0'
        },
        force: 1,
        flags: WialonFlags.UNIT_RICH,
        from: 0,
        to: 0
      });

      return result as WialonSearchItemsResult<WialonResource>;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to search resources: ${errorMessage}`);
    }
  }

  /**
   * Process the search results from real Wialon API response (resource-specific)
   * (Renamed to avoid duplicate method name with generic processor below)
   */
  processResourceSearchResults(results: WialonSearchItemsResult<WialonResource>): ProcessedSearchData[] {
    results.items?.forEach(item => {
      console.log('Search Result Item:', item);
    });

    return (results.items || []).map(item => ({
      id: item.id,
      name: typeof item.nm === 'string' && item.nm.length > 0 ? item.nm : `Resource ${item.id}`,
      type: 'resource',
      reports: typeof item.rep === 'object' && item.rep !== null ? Object.keys(item.rep).length : 0,
      userAccess: typeof item.uacl === 'number' ? item.uacl : 0
    }));
  }

  /**
   * Search for Wialon items with full result structure
   */
  async searchItems(
    itemsType = 'avl_unit',
    propName = 'sys_name',
    propValueMask = '*',
    sortType = 'sys_name'
  ): Promise<WialonSearchItemsResult> {
    if (this.sessionId === null || this.sessionId === '') {
      await this.login();
    }

    try {
      const searchParams = {
        spec: {
          itemsType,
          propName,
          propValueMask,
          sortType
        },
        force: 1,
        flags: 0x1, // Basic item data
        from: 0,
        to: 0x7FFFFFFF
      };

      const response = await fetch(`${this.baseUrl}?svc=core/search_items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          params: JSON.stringify(searchParams),
          sid: this.sessionId
        })
      });

      if (!response.ok) {
        throw new WialonAPIError(response.status, 'search_items', searchParams);
      }

      const result = await response.json();

      if (result.error) {
        throw new WialonAPIError(result.error, 'search_items', searchParams);
      }

      return result as WialonSearchItemsResult;
    } catch (error) {
      console.error('Search items failed:', error);
      throw error;
    }
  }

  /**
   * Search for vehicles specifically
   */
  async searchVehicles(namePattern = '*'): Promise<WialonSearchItemsResult> {
    return this.searchItems('avl_unit', 'sys_name', namePattern, 'sys_name');
  }

  /**
   * Search for unit groups
   */
  async searchUnitGroups(namePattern = '*'): Promise<WialonSearchItemsResult> {
    return this.searchItems('avl_unit_group', 'sys_name', namePattern, 'sys_name');
  }

  /**
   * Process search results into simplified format
   */
  processSearchResults(searchResult: WialonSearchItemsResult): ProcessedSearchData[] {
    if (!searchResult.items) {
      return [];
    }

    return searchResult.items.map(item => ({
      id: item.id,
      name: item.nm || 'Unknown',
      type: this.getItemTypeName(searchResult.searchSpec.itemsType),
      reports: item.rep ? Object.keys(item.rep).length : 0,
      userAccess: item.uacl || 0
    }));
  }

  /**
   * Get human-readable item type name
   */
  private getItemTypeName(itemsType: string): string {
    const typeMap: Record<string, string> = {
      'avl_unit': 'Vehicle',
      'avl_unit_group': 'Unit Group',
      'avl_resource': 'Resource',
      'user': 'User',
      'avl_hw': 'Hardware'
    };

    return typeMap[itemsType] || itemsType;
  }
}

// Singleton export for compatibility
export const wialonServiceComplete = new WialonServiceComplete();
export default wialonServiceComplete;
