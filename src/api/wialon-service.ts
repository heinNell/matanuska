/**
 * Wialon API integration service for APppp Fleet Management Platform
 */

import { WialonPosition, WialonUnit } from "../types/wialon-types";
import wialon from "./wialon-sdk";

// Wialon API configuration
const WIALON_API_URL = import.meta.env.VITE_WIALON_API_URL || "https://hst-api.wialon.com";

/**
 * Wialon integration service
 * Provides methods to interact with Wialon API for fleet tracking
 */
export class WialonService {
  private isInitialized = false;
  private token: string | null = null;

  /**
   * Initialize the Wialon SDK
   */
  initialize(): void {
    if (this.isInitialized) return;

    try {
      wialon.init({
        url: WIALON_API_URL,
        eventsPollingInterval: 10000, // 10 seconds
      });

      this.isInitialized = true;
      console.log("Wialon SDK initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Wialon SDK:", error);
      throw new Error("Failed to initialize Wialon integration");
    }
  }

  /**
   * Login to Wialon using token
   * @param token Wialon API token
   */
  async login(token: string): Promise<void> {
    if (!this.isInitialized) {
      this.initialize();
    }

    try {
      const response = await wialon.loginToken(token);
      this.token = token;
      console.log("Logged in to Wialon as:", response.user.nm);
    } catch (error) {
      console.error("Failed to login to Wialon:", error);
      throw new Error("Wialon authentication failed");
    }
  }

  /**
   * Logout from Wialon
   */
  async logout(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      await wialon.logout();
      this.token = null;
      console.log("Logged out from Wialon");
    } catch (error) {
      console.error("Failed to logout from Wialon:", error);
    }
  }

  /**
   * Get all units (vehicles) from Wialon
   */
  async getUnits(): Promise<WialonUnit[]> {
    if (!this.isInitialized || !this.token) {
      throw new Error("Wialon service not initialized or not logged in");
    }

    try {
      const units = await wialon.getUnits();
      return units;
    } catch (error) {
      console.error("Failed to get units from Wialon:", error);
      throw new Error("Failed to retrieve fleet data from Wialon");
    }
  }

  /**
   * Get unit (vehicle) by ID
   * @param unitId Wialon unit ID
   */
  async getUnitById(unitId: number): Promise<WialonUnit | null> {
    if (!this.isInitialized || !this.token) {
      throw new Error("Wialon service not initialized or not logged in");
    }

    try {
      const unit = await wialon.getUnitById(unitId);
      return unit;
    } catch (error) {
      console.error(`Failed to get unit ${unitId} from Wialon:`, error);
      throw new Error("Failed to retrieve vehicle data from Wialon");
    }
  }

  /**
   * Get unit location history
   * @param unitId Wialon unit ID
   * @param from Start date
   * @param to End date
   */
  async getUnitHistory(unitId: number, from: Date, to: Date): Promise<WialonPosition[]> {
    if (!this.isInitialized || !this.token) {
      throw new Error("Wialon service not initialized or not logged in");
    }

    try {
      const history = await wialon.getUnitHistory(
        unitId,
        from.getTime() / 1000,
        to.getTime() / 1000
      );
      return history;
    } catch (error) {
      console.error(`Failed to get history for unit ${unitId} from Wialon:`, error);
      throw new Error("Failed to retrieve vehicle history data from Wialon");
    }
  }

  /**
   * Subscribe to real-time updates for a unit
   * @param unitId Wialon unit ID
   * @param callback Function to call when updates are received
   */
  subscribeToUnit(unitId: number, callback: (unit: WialonUnit) => void): void {
    if (!this.isInitialized || !this.token) {
      throw new Error("Wialon service not initialized or not logged in");
    }

    try {
      wialon.subscribeToUnit(unitId, callback);
    } catch (error) {
      console.error(`Failed to subscribe to unit ${unitId} updates:`, error);
      throw new Error("Failed to set up real-time tracking");
    }
  }

  /**
   * Unsubscribe from real-time updates for a unit
   * @param unitId Wialon unit ID
   */
  unsubscribeFromUnit(unitId: number): void {
    if (!this.isInitialized || !this.token) return;

    try {
      wialon.unsubscribeFromUnit(unitId);
    } catch (error) {
      console.error(`Failed to unsubscribe from unit ${unitId} updates:`, error);
    }
  }

  /**
   * Execute custom Wialon API method
   * @param methodName API method name
   * @param params Method parameters
   */
  async executeCustomMethod<T>(methodName: string, params: any): Promise<T> {
    if (!this.isInitialized || !this.token) {
      throw new Error("Wialon service not initialized or not logged in");
    }

    try {
      const result = await wialon.execute(methodName, params);
      return result as T;
    } catch (error) {
      console.error(`Failed to execute Wialon API method ${methodName}:`, error);
      throw new Error(`Failed to execute Wialon operation: ${methodName}`);
    }
  }
}

// Create a singleton instance
export const wialonService = new WialonService();

export default wialonService;
