// src/services/wialonService.ts

import type { WialonDriver } from '../types/wialon-types';
import { getEnvVar } from '../utils/envUtils';

const WIALON_API_URL = getEnvVar("VITE_WIALON_API_URL", "https://hst-api.wialon.com");
const DEFAULT_WIALON_HOST = "https://hosting.wialon.com";
const DEFAULT_TOKEN = getEnvVar("VITE_WIALON_SESSION_TOKEN", "");

export interface WialonSession {
  sid: string;
  user: string;
  host: string;
}
export interface WialonUnit {
  id: number;
  nm: string;
  [key: string]: any;
}
export interface WialonResource {
  id: number;
  nm: string;
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

declare const window: any;

function getWialon(): any {
  if (typeof window === "undefined" || !window.wialon) {
    throw new Error("Wialon SDK is not available in window context.");
  }
  return window.wialon;
}

/**
 * Added: Unified session initialization. Will re-use active session if available.
 */
async function initSession(token?: string): Promise<WialonSession> {
  const wialon = getWialon();
  const session = wialon.core.Session.getInstance();

  // Already initialized and logged in
  const sid = session.getId?.();
  if (sid && typeof sid === "string" && sid.length > 0) {
    // Double check if session is still valid by pinging the user
    try {
      const user = session.getCurrUser?.().getName?.() ?? "unknown";
      const host = session.getBaseUrl?.() ?? DEFAULT_WIALON_HOST;
      return { sid, user, host };
    } catch {
      // Fallthrough, re-init session
    }
  }
  // Fresh login required
  return new Promise((resolve, reject) => {
    session.initSession(DEFAULT_WIALON_HOST);
    session.loginToken(token ?? DEFAULT_TOKEN, "", (code: number) => {
      if (code === 0) {
        const sid = session.getId();
        const user = session.getCurrUser().getName();
        const host = session.getBaseUrl();
        resolve({ sid, user, host });
      } else {
        reject(new Error("Wialon login failed. Code: " + code));
      }
    });
  });
}

export async function loginWialon(token: string): Promise<WialonSession> {
  return initSession(token);
}

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

export async function getUnitById(id: number): Promise<WialonUnit | null> {
  const units = await getUnits();
  return units.find((u) => u.id === id) || null;
}

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

    const reportParams = {
      reportResourceId: resourceId,
      reportTemplateId: template,
      reportTemplate: null,
      reportObjectId: unitId,
      reportObjectSecId: 0,
      interval,
      remoteExec: 1
    };

    resource.execReport(reportParams, (code: number) => {
      if (code !== 0) return reject(new Error(`Report execution failed. Code: ${code}`));

      const checkStatus = () => {
        wialon.core.Remote.getInstance().remoteCall(
          "report/get_report_status",
          "{}",
          (statusCode: number, data: any) => {
            if (statusCode !== 0) return reject(new Error(`Status check failed. Code: ${statusCode}`));
            if (data.status === 4) {
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
              setTimeout(checkStatus, 1000);
            }
          }
        );
      };

      checkStatus();
    });
  });
}

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

export async function getGeofences(resourceId: number): Promise<any[]> {
  const wialon = getWialon();
  const resource = wialon.core.Session.getInstance().getItem(resourceId);
  if (!resource) throw new Error(`Resource ${resourceId} not found`);
  const zones = resource.getZonesData();
  return Object.values(zones || {});
}

export function logoutWialon(): void {
  const wialon = getWialon();
  wialon.core.Session.getInstance().logout(() => {});
}

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
  initSession: typeof initSession; // <--- FIXED: Now part of type/interface and export
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
        const resource = wialon.core.Session.getInstance().getItem(resourceId);
        if (!resource) {
          return reject(new Error(`Resource ${resourceId} not found`));
        }
        if (typeof resource.getDrivers !== 'function') {
          console.error('Resource does not have getDrivers method');
          return resolve([]);
        }
        resource.getDrivers((code: number, driversData: any) => {
          try {
            if (code !== 0) {
              const errorText = wialon.core.Errors?.getErrorText ?
                wialon.core.Errors.getErrorText(code) :
                `Code: ${code}`;
              return reject(new Error(`Failed to fetch drivers: ${errorText}`));
            }
            if (!driversData || !Array.isArray(driversData)) {
              console.warn('No drivers data returned or invalid format');
              return resolve([]);
            }
            const drivers: WialonDriver[] = driversData.map((d: any) => {
              const driver: WialonDriver = {
                id: typeof d.id !== 'undefined' ? d.id : 0,
                name: d.n || 'Unnamed Driver',
                phone: d.p || '',
                licenseNumber: d.licenseNumber || ''
              };
              if (d.vI && typeof d.vI === 'object') {
                Object.keys(d.vI).forEach(key => {
                  driver[key] = d.vI[key];
                });
              }
              return driver;
            });
            resolve(drivers);
          } catch (err) {
            console.error('Error processing driver data:', err);
            resolve([]);
          }
        });
      } catch (err) {
        console.error('Error in getDrivers:', err);
        resolve([]);
      }
    });
  },
  async executeCustomMethod<T>(method: string, params: any): Promise<T> {
    const response = await fetch(`${WIALON_API_URL}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      credentials: 'include'
    });
    if (!response.ok) throw new Error(`Wialon API error: ${response.statusText}`);
    return response.json();
  },
  initSession // <-- FIXED: implementation included
};

export default wialonService;
