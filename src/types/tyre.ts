import { Timestamp } from "firebase/firestore";

// --- CORE TYPES & ENUMS ---

export type TyreType = "steer" | "drive" | "trailer" | "spare";

export enum TyreStoreLocation {
  VEHICLES_STORE = "Vehicles Store",
  HOLDING_BAY = "Holding Bay",
  RFR = "RFR",
  SCRAPPED = "Scrapped",
}

export type TyreStatus = "new" | "in_service" | "spare" | "retreaded" | "scrapped";
export type TyreMountStatus = "mounted" | "unmounted" | "in_storage";

export type TyreConditionStatus = "good" | "warning" | "critical" | "needs_replacement";

// --- POSITION TYPE ---

export type TyrePosition =
  | `V${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`
  | `T${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16}`
  | `P${1 | 2 | 3 | 4 | 5 | 6}`
  | `Q${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`
  | "SP";

// --- MAIN TYRE MODEL ---

export interface Tyre {
  id: string;
  serialNumber: string;
  dotCode: string;
  manufacturingDate: string;
  brand: string;
  model: string;
  pattern: string;
  size: TyreSize;
  loadIndex: number;
  speedRating: string;
  type: TyreType;
  purchaseDetails: {
    date: string;
    cost: number;
    supplier: string;
    warranty: string;
    invoiceNumber?: string;
  };
  installation?: {
    vehicleId: string;
    position: TyrePosition;
    mileageAtInstallation: number;
    installationDate: string;
    installedBy: string;
  };
  condition: {
    treadDepth: number;
    pressure: number;
    temperature: number;
    status: TyreConditionStatus;
    lastInspectionDate: string;
    nextInspectionDue: string;
  };
  status: TyreStatus;
  mountStatus: TyreMountStatus;
  maintenanceHistory: {
    rotations: TyreRotation[];
    repairs: TyreRepair[];
    inspections: TyreInspection[];
  };
  kmRun: number;
  kmRunLimit: number;
  notes: string;
  location: TyreStoreLocation;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// --- TYRE SIZE ---

export interface TyreSize {
  width: number;
  aspectRatio: number;
  rimDiameter: number;
  displayString?: string;
}

// --- HISTORY EVENTS ---

export interface TyreRotation {
  id?: string;
  date: string;
  fromPosition: TyrePosition;
  toPosition: TyrePosition;
  mileage: number;
  technician: string;
  notes?: string;
}

export interface TyreRepair {
  id?: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  technician: string;
  notes?: string;
}

export interface TyreInspection {
  id?: string;
  date: string;
  inspector: string;
  treadDepth: number;
  pressure: number;
  temperature: number;
  condition: TyreConditionStatus;
  notes: string;
  images?: string[];
}

// --- ADVANCED INSPECTION RECORD ---

export interface TyreInspectionRecord {
  id: string;
  tyreId: string;
  vehicleId: string;
  vehicleName: string;
  position: TyrePosition;
  date: string;
  inspectorName: string;
  mileage: number;
  treadDepth: number;
  pressure: number;
  temperature: number;
  condition: TyreConditionStatus;
  notes: string;
  images?: string[];
  createdAt?: Timestamp;

  // Extended info
  currentOdometer?: number;
  previousOdometer?: number;
  distanceTraveled?: number;
  damage?: string;
  photos?: string[];
  location?: TyreStoreLocation;
  inspectionDate?: string;
  signature?: string;
  otherDetails?: Record<string, any>;
}

// --- STOCK & STORE ---

export interface StockEntryHistory {
  event: "mounted" | "removed" | "moved" | "retreaded" | "scrapped";
  fromStore?: string;
  toStore: string;
  vehicleReg?: string;
  position?: TyrePosition;
  odometer: number;
  date: string;
  user: string;
}

export interface StockEntry {
  tyreId: string;
  brand: string;
  pattern: string;
  size: string;
  type: TyreType;
  vehicleReg?: string;
  position?: TyrePosition;
  currentTreadDepth: number;
  lastMountOdometer: number;
  currentOdometer: number;
  kmCovered: number;
  status: "active" | "holding" | "retread" | "scrapped";
  history: StockEntryHistory[];
}

export interface TyreStore {
  id: string;
  name: string;
  entries: StockEntry[];
  dateAdded?: Timestamp;
}

// --- ALLOCATION & FLEET MAPPING ---

export interface TyreAllocation {
  position: TyrePosition;
  tyreCode?: string;
  brand?: string;
  pattern?: string;
  size?: string;
  lastInspectionDate?: string;
  treadDepth?: number;
  pressure?: number;
  odometerAtFitment?: number;
  kmSinceFitment?: number;
}

export interface FleetTyreMapping {
  fleetNumber: string;
  vehicleType: string;
  positions: TyreAllocation[];
}

// --- UTILITY HELPERS ---

export function calculateRemainingLife(tyre: Tyre): number {
  const currentTread = tyre.condition.treadDepth;
  const minimumTread = 3;
  const newTyreDepth = 20;
  const usedTread = newTyreDepth - currentTread;
  const wearRate = tyre.kmRun > 0 ? usedTread / tyre.kmRun : 0;
  const remainingTread = currentTread - minimumTread;
  const remainingKm = wearRate > 0 ? remainingTread / wearRate : 0;
  return Math.max(remainingKm, 0);
}

export function calculateCostPerKm(tyre: Tyre): number {
  if (!tyre.kmRun || tyre.kmRun <= 0) return 0;
  return Number((tyre.purchaseDetails.cost / tyre.kmRun).toFixed(4));
}

export function milesToKm(miles: number): number {
  return miles * 1.60934;
}

export function formatTyreSize(size: TyreSize): string {
  return `${size.width}/${size.aspectRatio}R${size.rimDiameter}`;
}

export function parseTyreSize(sizeStr: string): TyreSize {
  const regex = /(\d+)\/(\d+)R(\d+\.?\d*)/;
  const match = sizeStr.match(regex);
  if (match) {
    // Using non-null assertions since the regex guarantees these groups exist
    const widthStr = match[1]!;
    const aspectStr = match[2]!;
    const rimStr = match[3]!;
    return {
      width: parseInt(widthStr, 10),
      aspectRatio: parseInt(aspectStr, 10),
      rimDiameter: parseFloat(rimStr),
      displayString: sizeStr,
    };
  }
  return {
    width: 0,
    aspectRatio: 0,
    rimDiameter: 0,
    displayString: sizeStr,
  };
}
