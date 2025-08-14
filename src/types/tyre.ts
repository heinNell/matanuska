import { Timestamp } from "firebase/firestore";

// Define the comprehensive Tyre interface that will be the main model for all tyre data
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
    position: TyrePosition; // Ensure this is TyrePosition
    mileageAtInstallation: number;
    installationDate: string;
    installedBy: string;
  };
  condition: {
    treadDepth: number;
    pressure: number;
    temperature: number;
    status: "good" | "warning" | "critical" | "needs_replacement";
    lastInspectionDate: string;
    nextInspectionDue: string;
  };
  status: "new" | "in_service" | "spare" | "retreaded" | "scrapped";
  mountStatus: "mounted" | "unmounted" | "in_storage";
  maintenanceHistory: {
    rotations: TyreRotation[];
    repairs: TyreRepair[];
    inspections: TyreInspection[]; // This will now be the simpler TyreInspection
  };
  kmRun: number; // Use kilometers for all calculations
  kmRunLimit: number;
  notes: string;
  location: TyreStoreLocation;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Define a comprehensive TyreSize interface
export interface TyreSize {
  width: number;
  aspectRatio: number;
  rimDiameter: number;
  displayString?: string;
}

// Types for tyre history events
export interface TyreRotation {
  id?: string; // Made optional to handle data without initial ID
  date: string;
  fromPosition: TyrePosition; // Explicitly TyrePosition
  toPosition: TyrePosition; // Explicitly TyrePosition
  mileage: number;
  technician: string;
  notes?: string;
}

export interface TyreRepair {
  id?: string; // Made optional to handle data without initial ID
  date: string;
  type: string;
  description: string;
  cost: number;
  technician: string;
  notes?: string;
}

// This is the simpler inspection record used within Tyre's maintenanceHistory
export interface TyreInspection {
  id?: string; // Made optional to handle data without initial ID
  date: string;
  inspector: string;
  treadDepth: number;
  pressure: number;
  temperature: number;
  condition: string;
  notes: string;
  images?: string[];
}

// This new interface represents a full inspection record as it might be stored in a separate collection
// or when adding a new inspection, containing all necessary context.
export interface TyreInspectionRecord {
  id: string; // Unique ID for the inspection record
  tyreId: string;
  vehicleId: string;
  vehicleName: string;
  position: TyrePosition;
  date: string;
  inspectorName: string;
  mileage: number; // This might be currentOdometer
  treadDepth: number;
  pressure: number;
  temperature: number;
  condition: string; // e.g., "good", "warning", "critical"
  notes: string;
  images?: string[];
  createdAt?: Timestamp;

  // Added properties based on the TypeScript error message
  currentOdometer?: number; // Made optional as per latest error
  previousOdometer?: number;
  distanceTraveled?: number;
  damage?: string;
  photos?: string[]; // Added based on error message
  location?: TyreStoreLocation; // Added based on error message
  inspectionDate?: string; // Added based on error message (might be same as 'date')
  signature?: string; // Added based on error message
  // Generic field for any other missing properties
  otherDetails?: Record<string, any>;
}


// History event for a tyre movement
export interface StockEntryHistory {
  event: "mounted" | "removed" | "moved" | "retreaded" | "scrapped";
  fromStore?: string;
  toStore: string;
  vehicleReg?: string;
  position?: TyrePosition;
  odometer: number;
  date: string; // ISO string
  user: string;
}

// Core tyre stock entry
export interface StockEntry {
  tyreId: string; // unique identifier
  brand: string;
  pattern: string;
  size: string;
  type: string; // e.g., Steer, Drive, Trailer
  vehicleReg?: string; // only in VehicleTyreStore
  position?: TyrePosition; // slot/axle position code
  currentTreadDepth: number; // mm
  lastMountOdometer: number; // odometer at mount
  currentOdometer: number; // latest odometer reading
  kmCovered: number; // cumulative km
  status: "active" | "holding" | "retread" | "scrapped";
  history: StockEntryHistory[];
}

// Firestore Tyre Store document
export interface TyreStore {
  id: string; // e.g., 'VehicleTyreStore'
  name: string; // human-friendly name
  entries: StockEntry[];
  dateAdded?: Timestamp; // server timestamp
}

// Standardized tyre position names (e.g. V1-V10, T1-T16, P1-P6, Q1-Q10, SP)
export type TyrePosition =
  | `V${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`
  | `T${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16}`
  | `P${1 | 2 | 3 | 4 | 5 | 6}`
  | `Q${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`
  | "SP";

// Allocation entry for a single position on a vehicle
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

// Mapping of a fleet number to its tyre positions
export interface FleetTyreMapping {
  fleetNumber: string;
  vehicleType: string;
  positions: TyreAllocation[];
}

// Define tyre type enum
export type TyreType = "steer" | "drive" | "trailer" | "spare";

// Define tyre store location enum
export enum TyreStoreLocation {
  VICHELS_STORE = "Vichels Store",
  HOLDING_BAY = "Holding Bay", // Ensured consistent casing
  RFR = "RFR",
  SCRAPPED = "Scrapped",
}

// --- Helper functions for tyre management ---

/**
 * Calculate remaining life in kilometers for the given tyre
 */
export function calculateRemainingLife(tyre: Tyre): number {
  const currentTread = tyre.condition.treadDepth;
  const minimumTread = 3; // Legal minimum in mm
  const newTyreDepth = 20; // Typical new tyre tread depth in mm

  // Calculate wear rate (mm per km)
  const usedTread = newTyreDepth - currentTread;
  const wearRate = tyre.kmRun > 0 ? usedTread / tyre.kmRun : 0;

  // Calculate remaining life
  const remainingTread = currentTread - minimumTread;
  const remainingKm = wearRate > 0 ? remainingTread / wearRate : 0;

  return Math.max(remainingKm, 0);
}

/**
 * Calculate the cost per kilometer for the given tyre
 */
export function calculateCostPerKm(tyre: Tyre): number {
  if (!tyre.kmRun || tyre.kmRun <= 0) return 0;
  return Number((tyre.purchaseDetails.cost / tyre.kmRun).toFixed(4));
}

/**
 * Optionally, convert miles to kilometers (if needed for any legacy data)
 */
export function milesToKm(miles: number): number {
  return miles * 1.60934;
}

/**
 * Format TyreSize to a human-readable string
 */
export function formatTyreSize(size: TyreSize): string {
  return `${size.width}/${size.aspectRatio}R${size.rimDiameter}`;
}

/**
 * Parse a TyreSize string to a TyreSize object
 */
export function parseTyreSize(sizeStr: string): TyreSize {
  const regex = /(\d+)\/(\d+)R(\d+\.?\d*)/;
  const match = sizeStr.match(regex);

  if (match) {
    return {
      width: parseInt(match[1], 10),
      aspectRatio: parseInt(match[2], 10),
      rimDiameter: parseFloat(match[3]),
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
