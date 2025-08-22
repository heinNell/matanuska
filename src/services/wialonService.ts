// src/services/wialonService.ts

/**
 * Wialon Service Layer - TypeScript Edition
 * Centralized, type-safe, robust Wialon API integration for Matanuska
 */

import type { WialonDriver } from '../types/wialon-types';
import { getEnvVar } from '../utils/envUtils';

// Initialize Wialon API URL from environment
const WIALON_API_URL = getEnvVar("VITE_WIALON_API_URL", "https://hst-api.wialon.com");

export interface WialonSession {
  sid: string;
  user: string;
  host: string;
  // Extend as needed
}

export interface WialonUnit {
  id: number;
  nm: string;
  // Add more properties as per your SDK (eg. pos, lastMessage, sensors)
  [key: string]: any;
}

export interface WialonResource {
  id: number;
  nm: string;
  // Extend with required resource fields
  [key: string]: any;
}

export interface WialonPosition {
  lat: number;
  lon: number;
  speed?: number;
  time?: number;
  [key: string]: any;
}

export interface WialonReportResult {
  reportResource: any;
  reportResult: {
    msgsRendered: number;
    stats: any[];
    tables: Array<{
      name: string;
      header: string[];
      data: any[][];
      rows: number;
      level: number;
    }>;
  };
  getTables?: () => any[];
  getTableRows?: (tableIndex: number, from: number, to: number, callback: (code: number, rows: any) => void) => void;
}

declare const window: any; // For SDK global

/**
 * Ensure Wialon SDK is loaded.
 */
function getWialon(): any {
  if (typeof window === "undefined" || !window.wialon) {
    throw new Error("Wialon SDK is not available in window context.");
  }
  return window.wialon;
}

/**
 * Login to Wialon, returns session ID
 */
export async function loginWialon(token: string): Promise<WialonSession> {
  const wialon = getWialon();
  return new Promise((resolve, reject) => {
    wialon.core.Session.getInstance().initSession("https://hosting.wialon.com");
    wialon.core.Session.getInstance().loginToken(token, "", (code: number) => {
      if (code === 0) {
        const sid = wialon.core.Session.getInstance().getId();
        const user = wialon.core.Session.getInstance().getCurrUser().getName();
        const host = wialon.core.Session.getInstance().getBaseUrl();
        resolve({ sid, user, host });
      } else {
        reject(new Error("Wialon login failed. Code: " + code));
      }
    });
  });
}

/**
 * Fetch all units accessible in the session.
 */
export async function getUnits(): Promise<WialonUnit[]> {
  const wialon = getWialon();
  return new Promise((resolve, reject) => {
    wialon.core.Session.getInstance().loadLibrary("unitSensors;unitCommands", () => {
      wialon.core.Session.getInstance().updateDataFlags(
        [
          { type: "type", data: "avl_unit", flags: 0xFFFFFFFF, mode: 0 },
        ],
        (code: number) => {
          if (code !== 0) return reject(new Error("Failed to load unit data"));
          const units = wialon.core.Session.getInstance().getItems("avl_unit");
          resolve((units || []) as WialonUnit[]);
        }
      );
    });
  });
}

/**
 * Fetch a single unit by its ID.
 */
export async function getUnitById(id: number): Promise<WialonUnit | null> {
  const units = await getUnits();
  return units.find((u) => u.id === id) || null;
}

/**
 * Add a position listener to a unit.
 * Returns a function to remove the listener.
 */
export function addPositionListener(unitId: number, callback: (pos: WialonPosition) => void): () => void {
  const wialon = getWialon();
  const unit = wialon.core.Session.getInstance().getItem(unitId);
  if (!unit) throw new Error(`Unit with id ${unitId} not found.`);
  const listenerId = unit.addListener("changePosition", () => {
    const pos = unit.getPosition();
    callback(pos);
  });
  return () => {
    unit.removeListener("changePosition", listenerId);
  };
}

/**
 * Execute a Wialon report for a resource/unit/time interval.
 * Uses proper Wialon API sequence: exec_report -> get_report_status -> apply_report_result
 */
export async function executeReport(
  resourceId: number,
  template: string,
  unitId: number,
  interval: { from: number; to: number }
): Promise<WialonReportResult> {
  const wialon = getWialon();
  return new Promise((resolve, reject) => {
    const resource = wialon.core.Session.getInstance().getItem(resourceId);
    if (!resource) return reject(new Error(`Resource ${resourceId} not found`));

    // Step 1: Execute report with proper parameters
    const reportParams = {
      reportResourceId: resourceId,
      reportTemplateId: template,
      reportTemplate: null,
      reportObjectId: unitId,
      reportObjectSecId: 0,
      interval,
      remoteExec: 1 // Use remote execution for proper async handling
    };

    resource.execReport(reportParams, (code: number) => {
      if (code !== 0) return reject(new Error(`Report execution failed. Code: ${code}`));

      // Step 2: Poll report status
      const checkStatus = () => {
        wialon.core.Remote.getInstance().remoteCall(
          "report/get_report_status",
          "{}",
          (statusCode: number, data: any) => {
            if (statusCode !== 0) return reject(new Error(`Status check failed. Code: ${statusCode}`));

            if (data.status === 4) { // Done
              // Step 3: Apply report result
              wialon.core.Remote.getInstance().remoteCall(
                "report/apply_report_result",
                "{}",
                (resultCode: number, resultData: any) => {
                  if (resultCode !== 0) return reject(new Error(`Failed to get report result. Code: ${resultCode}`));
                  resolve(resultData as WialonReportResult);
                }
              );
            } else if ([8, 16].includes(data.status)) {
              reject(new Error(`Report failed or invalid. Status: ${data.status}`));
            } else {
              // Still processing, check again
              setTimeout(checkStatus, 1000);
            }
          }
        );
      };

      checkStatus();
    });
  });
}

/**
 * Fetch all resources (report templates, geofences etc)
 */
export async function getResources(): Promise<WialonResource[]> {
  const wialon = getWialon();
  return new Promise((resolve, reject) => {
    wialon.core.Session.getInstance().updateDataFlags(
      [
        { type: "type", data: "avl_resource", flags: 0xFFFFFFFF, mode: 0 },
      ],
      (code: number) => {
        if (code !== 0) return reject(new Error("Failed to load resource data"));
        const resources = wialon.core.Session.getInstance().getItems("avl_resource");
        resolve((resources || []) as WialonResource[]);
      }
    );
  });
}

/**
 * Fetch all geofences for a given resource.
 */
export async function getGeofences(resourceId: number): Promise<any[]> {
  const wialon = getWialon();
  const resource = wialon.core.Session.getInstance().getItem(resourceId);
  if (!resource) throw new Error(`Resource ${resourceId} not found`);
  // getZonesData returns object with geofences
  const zones = resource.getZonesData();
  return Object.values(zones || {});
}

/**
 * Logout the current Wialon session
 */
export function logoutWialon(): void {
  const wialon = getWialon();
  wialon.core.Session.getInstance().logout(() => {});
}

/**
 * Exported service
 */
interface WialonService {
  login: typeof loginWialon;
  logout: typeof logoutWialon;
  getUnits: typeof getUnits;
  getUnitById: typeof getUnitById;
  addPositionListener: typeof addPositionListener;
  executeReport: typeof executeReport;
  getResources: typeof getResources;
  getGeofences: typeof getGeofences;
  getDrivers: (resourceId: number) => Promise<WialonDriver[]>;
  executeCustomMethod: <T>(method: string, params: any) => Promise<T>;
}

const wialonService: WialonService = {
  login: loginWialon,
  logout: logoutWialon,
  getUnits,
  getUnitById,
  addPositionListener,
  executeReport,
  getResources,
  getGeofences,
  async getDrivers(resourceId: number): Promise<WialonDriver[]> {
    const wialon = getWialon();
    return new Promise((resolve, reject) => {
      try {
        // Get the resource by ID
        const resource = wialon.core.Session.getInstance().getItem(resourceId);

        // Validate resource
        if (!resource) {
          return reject(new Error(`Resource ${resourceId} not found`));
        }

        // Check if getDrivers method exists on the resource
        if (typeof resource.getDrivers !== 'function') {
          console.error('Resource does not have getDrivers method');
          return resolve([]);
        }

        // Use Wialon SDK to fetch drivers with proper error handling
        resource.getDrivers((code: number, driversData: any) => {
          try {
            // Check for API error code
            if (code !== 0) {
              const errorText = wialon.core.Errors?.getErrorText ?
                wialon.core.Errors.getErrorText(code) :
                `Code: ${code}`;
              return reject(new Error(`Failed to fetch drivers: ${errorText}`));
            }

            // Ensure we have an array of drivers
            if (!driversData || !Array.isArray(driversData)) {
              console.warn('No drivers data returned or invalid format');
              return resolve([]);
            }

            // Map the raw driver data to our expected format
            // This is where the vI property might be accessed
            const drivers: WialonDriver[] = driversData.map((d: any) => {
              // Safely extract needed properties without direct access to potentially undefined fields
              const driver: WialonDriver = {
                id: typeof d.id !== 'undefined' ? d.id : 0,
                name: d.n || 'Unnamed Driver',
                // Safely handle potentially undefined properties
                phone: d.p || '',
                licenseNumber: d.licenseNumber || ''
              };

              // If there are other potential properties from vI, safely add them
              if (d.vI && typeof d.vI === 'object') {
                // Process additional properties safely
                Object.keys(d.vI).forEach(key => {
                  driver[key] = d.vI[key];
                });
              }

              return driver;
            });

            resolve(drivers);
          } catch (err) {
            console.error('Error processing driver data:', err);
            // Return empty array instead of rejecting to avoid breaking the UI
            resolve([]);
          }
        });
      } catch (err) {
        console.error('Error in getDrivers:', err);
        // Return empty array instead of rejecting for more resilience
        resolve([]);
      }
    });
  },

  async executeCustomMethod<T>(method: string, params: any): Promise<T> {
    const response = await fetch(`${WIALON_API_URL}/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Wialon API error: ${response.statusText}`);
    }

    return response.json();
  }
};

export default wialonService;
