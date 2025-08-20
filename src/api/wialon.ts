import type { WialonSensor, WialonUnit } from "../types/wialon-types";


// Wialon SDK is on window
declare global {
  interface Window {
    wialon: any;
    W: any;
  }
}

const TOKEN = import.meta.env.VITE_WIALON_SESSION_TOKEN || "";
const WIALON_API_URL = import.meta.env.VITE_WIALON_API_URL?.trim() || "https://hst-api.wialon.com";
const WIALON_SDK_URL = "https://hst-api.wialon.com/wsdk/script/wialon.js";

let wialonInitialized = false;
let session: any = null;
let units: WialonUnit[] = [];

// Load Wialon SDK
const wialonSdkLoadedPromise = new Promise<void>((resolve, reject) => {
  if (window.wialon) return resolve();

  const script = document.createElement("script");
  script.src = WIALON_SDK_URL;
  script.async = true;
  script.onload = () => {
    const interval = setInterval(() => {
      if (window.wialon) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
    setTimeout(() => {
      clearInterval(interval);
      reject(new Error("Wialon SDK init timeout"));
    }, 5000);
  };
  script.onerror = () => reject(new Error("Failed to load Wialon SDK"));
  document.head.appendChild(script);
});

// Initialize session
export async function initializeWialon(): Promise<boolean> {
  if (wialonInitialized) return true;

  await wialonSdkLoadedPromise;

  const W = window.wialon;
  session = W.core.Session.getInstance();
  if (!session || !TOKEN || !WIALON_API_URL) return false;

  return new Promise<boolean>((resolve) => {
    session.initSession(WIALON_API_URL);
    session.loginToken(TOKEN, "", (code: number) => {
      if (code) return resolve(false);

      session.loadLibrary("itemIcon");

      const dataFlags =
        W.item.Item.dataFlag.base |
        W.item.Unit.dataFlag.sensors |
        W.item.Unit.dataFlag.lastMessage |
        W.item.Unit.dataFlag.lastPosition;

      session.updateDataFlags([{ type: "type", data: "avl_unit", flags: dataFlags, mode: 0 }], (code2: number) => {
        if (code2) return resolve(false);

        units = session.getItems("avl_unit") || [];

        // Add listeners safely
        units.forEach((unit) => {
          unit.addListener?.("changePosition", () => {
            console.log(`Unit ${unit.getId?.()} position updated.`);
          });
        });

        wialonInitialized = true;
        resolve(true);
      });
    });
  });
}

// Get all units
export function getWialonUnits(): WialonUnit[] {
  return wialonInitialized ? units : [];
}

// Get unit by ID
export function getUnitById(unitId: number): WialonUnit | null {
  if (!session) return null;
  return session.getItem?.(unitId) as WialonUnit ?? null;
}

// Safe sensor access
export function getUnitSensors(unitId: number): WialonSensor[] {
  const unit = getUnitById(unitId);
  return unit?.getSensors?.() ? Object.values(unit.getSensors()) : [];
}

export function getSensorValue(unitId: number, sensorId: string): number | string | null {
  const unit = getUnitById(unitId);
  if (!unit) return null;

  const sensor = unit.getSensor?.(sensorId);
  if (!sensor) return null;

  const lastMessage = unit.getLastMessage?.();
  if (!lastMessage) return "N/A";

  const value = unit.calculateSensorValue?.(sensor, lastMessage);
  if (value === -348201.3876) return "N/A";
  return value ?? null;
}

// Get unit details safely
export function getUnitDetails(unitId: number) {
  const unit = getUnitById(unitId);
  if (!unit) return null;

  const pos = unit.getPosition?.();
  return {
    id: unitId,
    name: unit.getName?.() ?? `Unit ${unitId}`,
    iconUrl: unit.iconUrl ?? "",
    position: pos
      ? {
          latitude: pos.y,
          longitude: pos.x,
          speed: pos.s,
          course: pos.c,
          timestamp: pos.t,
          satellites: pos.sc,
        }
      : null,
  };
}

// Register/Unregister listeners safely
export function registerUnitMessageListener(unitId: number, callback: (data: any) => void): number | null {
  const unit = getUnitById(unitId);
  if (!unit || !unit.addListener) return null;

  return unit.addListener("messageRegistered", (event: any) => {
    callback(event.getData?.());
  }) ?? null;
}

export function unregisterUnitMessageListener(unitId: number, eventId: number) {
  const unit = getUnitById(unitId);
  unit?.removeListenerById?.(eventId);
}

// Check initialization
export function isWialonInitialized(): boolean {
  return wialonInitialized;
}
