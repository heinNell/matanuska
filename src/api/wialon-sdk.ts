/**
 * Wialon SDK interface for APppp Fleet Management Platform
 * This file provides TypeScript definitions for the Wialon API functions used in the application
 */

import { WialonPosition, WialonSensor, WialonUnit } from "../types/wialon-types";

/**
 * Wialon Session interface
 */
export interface WialonSession {
  id: string;
  userId: number;
  createTime: number;
  lastActivity: number;
  [key: string]: any;
}

/**
 * Wialon Login response interface
 */
export interface WialonLoginResponse {
  eid: string; // Session ID
  user: {
    id: number;
    nm: string; // Name
    prp: any; // Properties
  };
  [key: string]: any;
}

/**
 * Main Wialon SDK interface
 */
export interface WialonSDK {
  /**
   * Initialize Wialon SDK with base URL and other options
   */
  init(options: { url: string; eventsPollingInterval?: number }): void;

  /**
   * Login to Wialon using token
   */
  loginToken(token: string): Promise<WialonLoginResponse>;

  /**
   * Login to Wialon using credentials
   */
  login(username: string, password: string): Promise<WialonLoginResponse>;

  /**
   * Logout from Wialon
   */
  logout(): Promise<void>;

  /**
   * Execute Wialon API method
   */
  execute(methodName: string, params: any): Promise<any>;

  /**
   * Get session information
   */
  getSession(): WialonSession | null;

  /**
   * Get units (vehicles) from Wialon
   */
  getUnits(): Promise<WialonUnit[]>;

  /**
   * Get unit (vehicle) by ID
   */
  getUnitById(id: number): Promise<WialonUnit | null>;

  /**
   * Subscribe to unit data updates
   */
  subscribeToUnit(unitId: number, callback: (unit: WialonUnit) => void): void;

  /**
   * Unsubscribe from unit data updates
   */
  unsubscribeFromUnit(unitId: number): void;

  /**
   * Get unit location history
   */
  getUnitHistory(unitId: number, from: Date | number, to: Date | number): Promise<WialonPosition[]>;

  /**
   * Get unit sensor data
   */
  getUnitSensors(unitId: number): Promise<WialonSensor[]>;

  /**
   * Core native SDK access (if needed for advanced operations)
   */
  core: any;
}

/**
 * Default Wialon SDK instance
 */
declare const wialon: WialonSDK;

export default wialon;
