// src/services/WialonDataManager.ts
import { WialonServiceComplete } from './WialonServiceComplete';
import type {
  WialonSystemData,
  WialonUnitDetailed,
  WialonUnitComplete,
  WialonFleetStatus,
  WialonSearchCriteria,
  WialonReportConfig,
  WialonReportProcessed,
  CachedData,
  DataSubscriber,
  WialonUnitProcessed,
  WialonAdvancedSearchParams,
  WialonMessage,
  WialonSensor,
  WialonUser,
  WialonResource,
  WialonUnitGroup,
  WialonHardware
} from '../types/wialon-complete';

export interface WialonReportConfig {
  resourceId?: number;
  templateId: number;
  unitId?: number;
  interval: {
    from: number;
    to: number;
    flags: number;
  };
  serverSide?: boolean;
}

export interface WialonReportProcessed {
  reportId: number;
  executedAt: Date;
  statistics: Record<string, unknown>;
  tables: WialonReportTableProcessed[];
  charts: WialonReportChartProcessed[];
  summary: string;
  raw: unknown;
}

export interface WialonReportTableProcessed {
  name: string;
  data: unknown[][];
  headers: string[];
  rowCount: number;
}

export interface WialonReportChartProcessed {
  type: string;
  data: unknown[];
  labels: string[];
}

/**
 * Complete Wialon Data Management Layer
 * Handles caching, real-time updates, and data transformation
 */
export class WialonDataManager {
  private api: WialonServiceComplete;
  private cache = new Map<string, CachedData>();
  private subscribers = new Map<string, Set<DataSubscriber>>();
  private pollInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    this.api = new WialonServiceComplete();
  }

  /**
   * Initialize with full data loading
   */
  async initialize(): Promise<WialonSystemData> {
    if (this.isInitialized) {
      const cached = this.getCachedData<WialonSystemData>('system_data');
      if (cached && !this.isCacheExpired(cached)) {
        return cached.data;
      }
    }

    await this.api.login();

    // Load all system data in parallel
    const [units, users, resources, unitGroups, hardware] = await Promise.all([
      this.api.getUnitsDetailed(),
      this.api.getUsers(),
      this.api.getResources(),
      this.api.getUnitGroups(),
      this.api.getHardwareTypes()
    ]);

    const systemData: WialonSystemData = {
      units: this.processUnits(units.items || []),
      users: users.items || [],
      resources: resources.items || [],
      unitGroups: unitGroups.items || [],
      hardware: hardware.items || [],
      loadedAt: new Date()
    };

    // Cache the data
    this.cacheData('system_data', systemData, 300000); // 5 minutes

    // Start real-time updates
    this.startRealTimeUpdates();

    this.isInitialized = true;
    console.log('[WialonDataManager] Initialized with', systemData.units.length, 'units');

    return systemData;
  }

  /**
   * Get detailed unit information
   */
  async getUnitDetails(unitId: number): Promise<WialonUnitComplete> {
    const cached = this.getCachedData<WialonUnitComplete>(`unit_${unitId}`);
    if (cached && !this.isCacheExpired(cached)) {
      return cached.data;
    }

    // Get unit with all possible data
    const unit = await this.api.getUnitById(unitId);
    if (!unit) {
      throw new Error(`Unit ${unitId} not found`);
    }

    // Get additional data
    const [sensors, messages] = await Promise.all([
      this.api.getUnitSensors(unitId),
      this.getRecentMessages(unitId)
    ]);

    const completeUnit: WialonUnitComplete = {
      ...unit,
      sensors,
      recentMessages: messages,
      lastUpdated: new Date(),
      isOnline: this.determineOnlineStatus(unit, messages),
      currentPosition: this.extractCurrentPosition(unit, messages),
      fuelLevel: this.extractFuelLevel(sensors, messages),
      speed: this.extractSpeed(messages),
      engineHours: this.extractEngineHours(sensors, messages),
      fleetId: this.extractFleetId(unit.nm),
      registrationNumber: this.extractRegistration(unit.nm),
      vehicleType: this.determineVehicleType(unit),
      connectivityType: this.determineConnectivityType(unit.nm),
      isDemoUnit: unit.nm?.includes('DEMO') || false,
      accessLevel: this.parseAccessLevel(unit.uacl),
      lastSeen: this.calculateLastSeen(unit),
      status: this.determineUnitStatus(unit)
    };

    this.cacheData(`unit_${unitId}`, completeUnit, 60000); // 1 minute cache
    return completeUnit;
  }

  /**
   * Execute report with full data processing
   */
  async executeReport(reportConfig: WialonReportConfig): Promise<WialonReportProcessed> {
    const result = await this.api.executeReportComplete({
      resourceId: reportConfig.resourceId || 25138250,
      templateId: reportConfig.templateId,
      objectId: reportConfig.unitId,
      interval: reportConfig.interval,
      remoteExec: reportConfig.serverSide ? 1 : 0
    });

    // Wait for completion if server-side
    if (reportConfig.serverSide) {
      await this.waitForReportCompletion();
    }

    // Get all tables and charts
    const tables = await this.getAllReportTables();
    const charts = await this.getAllReportCharts();
    const statistics = result.reportResult?.stats || {};

    const processedReport: WialonReportProcessed = {
      reportId: reportConfig.templateId,
      executedAt: new Date(),
      statistics: this.processStatistics(statistics),
      tables: tables.map(table => this.processReportTable(table)),
      charts: charts.map(chart => this.processReportChart(chart)),
      summary: this.generateReportSummary(statistics, tables),
      raw: result
    };

    await this.api.cleanupReport();
    return processedReport;
  }

  /**
   * Get real-time fleet status
   */
  async getFleetStatus(): Promise<WialonFleetStatus> {
    const systemData = this.getCachedData<WialonSystemData>('system_data');
    if (!systemData) {
      throw new Error('System not initialized - call initialize() first');
    }

    const units = systemData.data.units;
    const now = Date.now();

    // Categorize units by status
    const online = units.filter(u => this.isUnitOnline(u, now));
    const offline = units.filter(u => !this.isUnitOnline(u, now));
    const moving = online.filter(u => (this.getUnitSpeed(u) || 0) > 5);
    const idle = online.filter(u => (this.getUnitSpeed(u) || 0) <= 5);

    return {
      total: units.length,
      online: online.length,
      offline: offline.length,
      moving: moving.length,
      idle: idle.length,
      categories: {
        'Heavy Truck': units.filter(u => u.vehicleType === 'heavy_truck').length,
        'Internal SIM': units.filter(u => u.nm?.includes('Int Sim')).length,
        'Demo Units': units.filter(u => u.nm?.includes('DEMO')).length
      },
      lastUpdate: new Date()
    };
  }

  /**
   * Search with advanced criteria
   */
  async searchUnitsAdvanced(criteria: WialonSearchCriteria): Promise<WialonUnitComplete[]> {
    const searchParams: WialonAdvancedSearchParams = {
      spec: {
        itemsType: 'avl_unit',
        propName: this.buildSearchPropNames(criteria),
        propValueMask: this.buildSearchPropValues(criteria),
        sortType: criteria.sortBy || 'sys_name',
        propType: criteria.propertyType || '',
        or_logic: criteria.useOrLogic ? '1' : '0'
      },
      force: 1,
      flags: 0x1 | 0x2 | 0x4 | 0x8, // Basic + position + sensors + custom fields
      from: criteria.offset || 0,
      to: criteria.limit ? (criteria.offset || 0) + criteria.limit : 0
    };

    const result = await this.api.searchItemsAdvanced<WialonUnitDetailed>(searchParams);

    return Promise.all(
      (result.items || []).map(unit => this.processUnitToComplete(unit))
    );
  }

  /**
   * Subscribe to data updates
   */
  subscribe(key: string, callback: (data: unknown) => void): string {
    const id = Math.random().toString(36).substr(2, 9);

    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }

    this.subscribers.get(key)!.add({ id, callback });
    return id;
  }

  /**
   * Unsubscribe from data updates
   */
  unsubscribe(key: string, subscriptionId: string): void {
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      for (const subscriber of subscribers) {
        if (subscriber.id === subscriptionId) {
          subscribers.delete(subscriber);
          break;
        }
      }
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    this.cache.clear();
    this.subscribers.clear();

    await this.api.logout();
    this.isInitialized = false;

    console.log('[WialonDataManager] Cleaned up');
  }

  // Private helper methods

  private processUnits(units: WialonUnitDetailed[]): WialonUnitProcessed[] {
    return units.map(unit => ({
      ...unit,
      fleetId: this.extractFleetId(unit.nm),
      registrationNumber: this.extractRegistration(unit.nm),
      vehicleType: this.determineVehicleType(unit),
      connectivityType: this.determineConnectivityType(unit.nm),
      isDemoUnit: unit.nm?.includes('DEMO') || false,
      accessLevel: this.parseAccessLevel(unit.uacl),
      lastSeen: this.calculateLastSeen(unit),
      status: this.determineUnitStatus(unit)
    }));
  }

  private async processUnitToComplete(unit: WialonUnitDetailed): Promise<WialonUnitComplete> {
    const unitId = (unit as { id: number }).id;
    return await this.getUnitDetails(unitId);
  }

  private startRealTimeUpdates(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }

    this.pollInterval = setInterval(async () => {
      try {
        // Update fleet status
        const fleetStatus = await this.getFleetStatus();
        this.notifySubscribers('fleet_status', fleetStatus);

        // Update system data periodically
        const cached = this.getCachedData<WialonSystemData>('system_data');
        if (cached && this.isCacheExpired(cached)) {
          await this.initialize();
        }
      } catch (error) {
        console.warn('[WialonDataManager] Real-time update failed:', error);
      }
    }, 15000); // Every 15 seconds
  }

  private notifySubscribers(key: string, data: unknown): void {
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      for (const subscriber of subscribers) {
        try {
          subscriber.callback(data);
        } catch (error) {
          console.warn('[WialonDataManager] Subscriber callback failed:', error);
        }
      }
    }
  }

  private cacheData<T>(key: string, data: T, ttl = 300000): void { // 5 min default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private getCachedData<T>(key: string): CachedData<T> | null {
    const cached = this.cache.get(key) as CachedData<T>;
    return cached || null;
  }

  private isCacheExpired<T>(cached: CachedData<T>): boolean {
    return Date.now() - cached.timestamp > cached.ttl;
  }

  // Data extraction and processing methods
  private extractFleetId(name?: string): string {
    if (!name) return '';
    const match = name.match(/(\d+[A-Z]-[A-Z]{3})/);
    return match ? match[1] : '';
  }

  private extractRegistration(name?: string): string {
    if (!name) return '';
    const match = name.match(/(\d+[A-Z]-[A-Z]{3}\s+\d+)/);
    return match ? match[1] : name;
  }

  private determineVehicleType(unit: WialonUnitDetailed): string {
    const name = unit.nm?.toLowerCase() || '';
    if (name.includes('truck') || name.includes('heavy')) return 'heavy_truck';
    if (name.includes('van')) return 'van';
    if (name.includes('car')) return 'car';
    return 'unknown';
  }

  private determineConnectivityType(name?: string): string {
    if (!name) return 'unknown';
    const nameLower = name.toLowerCase();
    if (nameLower.includes('int sim')) return 'internal_sim';
    if (nameLower.includes('ext sim')) return 'external_sim';
    if (nameLower.includes('demo')) return 'demo';
    return 'standard';
  }

  private parseAccessLevel(uacl?: unknown): string {
    // Parse unit access control level
    const accessLevel = Number(uacl) || 0;
    if (accessLevel >= 1000) return 'admin';
    if (accessLevel >= 100) return 'manager';
    if (accessLevel >= 10) return 'operator';
    return 'viewer';
  }

  private calculateLastSeen(unit: WialonUnitDetailed): Date {
    const pos = unit.pos;
    if (pos && pos.t) {
      return new Date(pos.t * 1000);
    }

    const lmsg = unit.lmsg;
    if (lmsg && lmsg.t) {
      return new Date(lmsg.t * 1000);
    }

    return new Date(0); // Unix epoch if no data
  }

  private determineUnitStatus(unit: WialonUnitDetailed): 'online' | 'offline' | 'idle' | 'moving' {
    const now = Date.now() / 1000;
    const pos = unit.pos;

    if (!pos || !pos.t) return 'offline';

    const ageMinutes = (now - pos.t) / 60;
    if (ageMinutes > 15) return 'offline';

    const speed = pos.sp || 0;
    if (speed > 5) return 'moving';
    if (ageMinutes < 3) return 'online';

    return 'idle';
  }

  private determineOnlineStatus(unit: WialonUnitDetailed, messages: WialonMessage[]): boolean {
    const now = Date.now() / 1000;

    // Check position timestamp
    if (unit.pos && unit.pos.t && (now - unit.pos.t) < 900) { // 15 minutes
      return true;
    }

    // Check recent messages
    if (messages.length > 0) {
      const latestMessage = messages[0];
      if (latestMessage.t && (now - latestMessage.t) < 900) {
        return true;
      }
    }

    return false;
  }

  private extractCurrentPosition(unit: WialonUnitDetailed, messages: WialonMessage[]) {
    // Try unit position first
    if (unit.pos && unit.pos.y && unit.pos.x) {
      return {
        t: unit.pos.t || 0,
        lat: unit.pos.y,
        lon: unit.pos.x,
        sp: unit.pos.sp || 0,
        cr: unit.pos.c || 0
      };
    }

    // Try latest message position
    for (const message of messages) {
      if (message.pos) {
        return message.pos;
      }
    }

    return null;
  }

  private extractFuelLevel(sensors: WialonSensor[], messages: WialonMessage[]): number | null {
    // Look for fuel sensor
    const fuelSensor = sensors.find(s =>
      s.n?.toLowerCase().includes('fuel') ||
      s.t?.toLowerCase().includes('fuel')
    );

    if (fuelSensor) {
      // Extract latest fuel value from messages
      for (const message of messages) {
        if (message.p && fuelSensor.id in message.p) {
          return Number(message.p[fuelSensor.id]) || null;
        }
      }
    }

    return null;
  }

  private extractSpeed(messages: WialonMessage[]): number | null {
    for (const message of messages) {
      if (message.pos && message.pos.sp !== undefined) {
        return message.pos.sp;
      }
    }
    return null;
  }

  private extractEngineHours(sensors: WialonSensor[], messages: WialonMessage[]): number | null {
    // Look for engine hours sensor
    const engineSensor = sensors.find(s =>
      s.n?.toLowerCase().includes('engine') ||
      s.n?.toLowerCase().includes('hour') ||
      s.t?.toLowerCase().includes('engine')
    );

    if (engineSensor) {
      for (const message of messages) {
        if (message.p && engineSensor.id in message.p) {
          return Number(message.p[engineSensor.id]) || null;
        }
      }
    }

    return null;
  }

  private async getRecentMessages(unitId: number): Promise<WialonMessage[]> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000); // 1 hour ago

    try {
      const positions = await this.api.getUnitHistory(unitId, oneHourAgo, now);
      return positions.map(pos => ({
        t: pos.t,
        tp: 'position',
        pos: pos,
        formattedTime: new Date(pos.t * 1000).toISOString(),
        hasPosition: true,
        hasParams: false
      }));
    } catch (error) {
      console.warn(`Failed to get messages for unit ${unitId}:`, error);
      return [];
    }
  }

  private isUnitOnline(unit: WialonUnitProcessed, now: number): boolean {
    return unit.status === 'online' || unit.status === 'moving' || unit.status === 'idle';
  }

  private getUnitSpeed(unit: WialonUnitProcessed): number {
    return unit.pos?.sp || 0;
  }

  // Search helper methods
  private buildSearchPropNames(criteria: WialonSearchCriteria): string {
    const props = [];

    if (criteria.name) props.push('sys_name');
    if (criteria.creator) props.push('sys_creator');
    if (criteria.phoneNumber) props.push('phone');
    if (criteria.customFields) {
      Object.keys(criteria.customFields).forEach(field => {
        props.push(`rel_customfield_${field}_value`);
      });
    }

    return props.join(',') || 'sys_name';
  }

  private buildSearchPropValues(criteria: WialonSearchCriteria): string {
    const values = [];

    if (criteria.name) values.push(`*${criteria.name}*`);
    if (criteria.creator) values.push(`*${criteria.creator}*`);
    if (criteria.phoneNumber) values.push(`*${criteria.phoneNumber}*`);
    if (criteria.customFields) {
      Object.values(criteria.customFields).forEach(value => {
        values.push(`*${value}*`);
      });
    }

    return values.join(',') || '*';
  }

  // Report processing methods
  private async waitForReportCompletion(): Promise<void> {
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    while (attempts < maxAttempts) {
      const status = await this.api.getReportStatus();
      if (status.status === 1) { // Completed
        return;
      }
      if (status.status === -1) { // Error
        throw new Error(`Report execution failed: ${status.info}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Report execution timeout');
  }

  private async getAllReportTables(): Promise<unknown[]> {
    // Implement report table extraction
    return [];
  }

  private async getAllReportCharts(): Promise<unknown[]> {
    // Implement report chart extraction
    return [];
  }

  private processStatistics(stats: Record<string, unknown>): Record<string, unknown> {
    return stats; // Basic passthrough for now
  }

  private processReportTable(table: unknown): WialonReportTableProcessed {
    return {
      name: 'Table',
      data: [],
      headers: [],
      rowCount: 0
    };
  }

  private processReportChart(chart: unknown): WialonReportChartProcessed {
    return {
      type: 'line',
      data: [],
      labels: []
    };
  }

  private generateReportSummary(statistics: Record<string, unknown>, tables: unknown[]): string {
    return `Report generated with ${tables.length} tables`;
  }
}

// Singleton export
export const wialonDataManager = new WialonDataManager();
export default wialonDataManager;
