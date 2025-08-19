import { Timestamp } from "firebase/firestore";

// The full code with corrections
// (All original interfaces and helper functions are included for completeness)

// Consolidated and comprehensive Tyre interface that will be the main model for all tyre data
export interface Tyre {
  id?: string;
  tyreId?: string; // Made optional for cases when ID is not yet assigned
  serialNumber?: string;
  dotCode?: string;
  manufacturingDate?: string;
  brand?: string;
  model?: string;  // Optional model property
  pattern?: string;
  size?: TyreSize | string;
  loadIndex?: number;
  speedRating?: string;
  type?: 'drive' | 'steer' | 'trailer';
  purchaseDetails?: {
    date: string;
    cost: number;
    supplier: string;
    warranty: string;
  };
  installation?: TyreInstallation | {
    vehicleId: string;
    position: string;
    mileageAtInstallation: number;
    installationDate: string;
    installedBy?: string;
  };
  condition?: TyreCondition | {
    treadDepth: number;
    pressure: number;
    temperature?: number;
    status: 'good' | 'warning' | 'critical' | 'needs_replacement';
    lastInspectionDate: string;
    nextInspectionDue?: string;
  };
  status?: 'new' | 'used' | 'scrapped' | TyreStatus;
  mountStatus?: 'on_vehicle' | 'in_store' | 'at_service' | TyreMountStatus;
  maintenanceHistory?: any[];
  kmRun?: number;
  kmRunLimit?: number;
  notes?: string;
  location?: string | TyreStoreLocation;
  purchaseDate?: string;
  costPrice?: number;
  vendor?: string;
  warrantyExpiry?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Define a comprehensive TyreSize interface
export interface TyreSize {
  width: number;
  aspectRatio: number;
  rimDiameter: number;
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
  id?: string; // Changed from required to optional
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
  type: TyreType; // Correctly added to fix the error
  model?: string;  // Add optional model property here too
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
  id?: string; // Changed from required to optional
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

// Define the structure for the new fleet position data
export interface FleetPositionData {
  fleetNo: string;
  positions: string[];
  type: string;
}

// New exported constant for fleet positions
export const FLEET_POSITIONS_TO_EXPORT: FleetPositionData[] = [
  { fleetNo: '14L', positions: ['V1', 'V2', 'V3', 'V4', 'SP'], type: 'Horse' },
  { fleetNo: '15L', positions: ['V1', 'V2', 'V3', 'V4', 'SP'], type: 'Horse' },
  { fleetNo: '21H', positions: ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'SP'], type: 'Horse' },
  { fleetNo: '22H', positions: ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'SP'], type: 'Horse' },
  { fleetNo: '23H', positions: ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'SP'], type: 'Horse' },
  { fleetNo: '24H', positions: ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'SP'], type: 'Horse' },
  { fleetNo: '26H', positions: ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'SP'], type: 'Horse' },
  { fleetNo: '28H', positions: ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'SP'], type: 'Horse' },
  { fleetNo: '31H', positions: ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'SP'], type: 'Horse' },
  { fleetNo: '32H', positions: ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'SP'], type: 'Horse' },
  { fleetNo: '1T', positions: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'T13', 'T14', 'T15', 'T16', 'SP1', 'SP2'], type: 'Interlink' },
  { fleetNo: '2T', positions: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'T13', 'T14', 'T15', 'T16', 'SP1', 'SP2'], type: 'Interlink' },
  { fleetNo: '3T', positions: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'T13', 'T14', 'T15', 'T16', 'SP1', 'SP2'], type: 'Interlink' },
  { fleetNo: '4T', positions: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'T13', 'T14', 'T15', 'T16', 'SP1', 'SP2'], type: 'Interlink' },
  { fleetNo: '4F', positions: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'SP1', 'SP2'], type: 'Reefer' },
  { fleetNo: '5F', positions: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'SP1', 'SP2'], type: 'Reefer' },
  { fleetNo: '6F', positions: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'SP1', 'SP2'], type: 'Reefer' },
  { fleetNo: '7F', positions: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'SP1', 'SP2'], type: 'Reefer' },
  { fleetNo: '8F', positions: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'SP1', 'SP2'], type: 'Reefer' },
  { fleetNo: '4H', positions: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'SP'], type: 'LMV' },
  { fleetNo: '6H', positions: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'SP'], type: 'LMV' },
  { fleetNo: 'UD', positions: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'SP'], type: 'LMV' },
  { fleetNo: '30H', positions: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'SP'], type: 'LMV' },
  { fleetNo: '29H', positions: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'SP'], type: 'Other' },
];

// --- Helper functions for tyre management ---

/**
 * Calculate remaining life in kilometers for the given tyre
 */
export function calculateRemainingLife(tyre: Tyre): number {
  if (!tyre.condition || !tyre.kmRun) return 0;
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
  if (!tyre.kmRun || tyre.kmRun <= 0 || !tyre.purchaseDetails?.cost) {
    return 0;
  }
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
    };
  }

  return {
    width: 0,
    aspectRatio: 0,
    rimDiameter: 0,
  };
}

// Corrected function to create a StockEntry from a TyreAllocation
export function createStockEntryFromAllocation(tyreAllocation: TyreAllocation, tyreType: TyreType): StockEntry {
  // Ensure all required string properties are present
  if (!tyreAllocation.tyreCode || !tyreAllocation.brand || !tyreAllocation.pattern || !tyreAllocation.size) {
    throw new Error("Cannot create StockEntry: Missing required properties on TyreAllocation");
  }

  const initialHistory: StockEntryHistory = {
    event: "mounted",
    toStore: "VehicleTyreStore", // Example value
    odometer: tyreAllocation.odometerAtFitment ?? 0,
    date: new Date().toISOString(),
    user: "System", // Example value
  };

  return {
    tyreId: tyreAllocation.tyreCode!, // Non-null assertion after check
    brand: tyreAllocation.brand!, // Non-null assertion after check
    pattern: tyreAllocation.pattern!, // Non-null assertion after check
    size: tyreAllocation.size!, // Non-null assertion after check
    type: tyreType,
    currentTreadDepth: tyreAllocation.treadDepth ?? 0,
    lastMountOdometer: tyreAllocation.odometerAtFitment ?? 0,
    currentOdometer: tyreAllocation.odometerAtFitment ?? 0,
    kmCovered: tyreAllocation.kmSinceFitment ?? 0,
    status: "active", // Default status
    history: [initialHistory],
    position: tyreAllocation.position,
  };
}

// Tyre brands, patterns, and sizes constants
export const TYRE_BRANDS = [
  'Michelin',
  'Bridgestone',
  'Goodyear',
  'Continental',
  'Pirelli',
  'Yokohama',
  'Dunlop',
  'Hankook',
  'Kumho',
  'Toyo'
] as const;

export const TYRE_PATTERNS = [
  'TR688',
  'X LINE ENERGY',
  'R168',
  'HDR2',
  'HTR2',
  'HSR2',
  'HDL2',
  'HSL2',
  'HDC1',
  'HSC1'
] as const;

export const TYRE_SIZES = [
  '315/80R22.5',
  '295/80R22.5',
  '385/65R22.5',
  '275/70R22.5',
  '11R22.5',
  '12R22.5',
  '13R22.5',
  '295/75R22.5',
  '285/75R24.5',
  '255/70R22.5'
] as const;

// Common tyre size patterns for validation
export const STANDARD_TYRE_SIZES: TyreSize[] = [
  { width: 315, aspectRatio: 80, rimDiameter: 22.5 },
  { width: 295, aspectRatio: 80, rimDiameter: 22.5 },
  { width: 385, aspectRatio: 65, rimDiameter: 22.5 },
  { width: 275, aspectRatio: 70, rimDiameter: 22.5 },
  { width: 11, aspectRatio: 22.5, rimDiameter: 22.5 }, // For 11R22.5
];

// Mapping of common tyre sizes to their load ratings
export const TYRE_LOAD_RATINGS: Record<string, number> = {
  '315/80R22.5': 3550,
  '295/80R22.5': 3150,
  '385/65R22.5': 4500,
  '275/70R22.5': 3000,
  '11R22.5': 3000,
};

// --- Enums and additional types for tyre management ---

export enum TyreStatus {
  ACTIVE = 'ACTIVE',
  RETIRED = 'RETIRED',
  SCRAPPED = 'SCRAPPED',
  UNDER_REPAIR = 'UNDER_REPAIR'
}

export enum TyreMountStatus {
  MOUNTED = 'MOUNTED',
  IN_STORAGE = 'IN_STORAGE',
  IN_TRANSIT = 'IN_TRANSIT',
  UNDER_REPAIR = 'UNDER_REPAIR'
}

export enum TyreConditionStatus {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  NEEDS_ATTENTION = 'NEEDS_ATTENTION',
  NEEDS_REPLACEMENT = 'NEEDS_REPLACEMENT',
  CRITICAL = 'CRITICAL'
}

export enum TyreStoreLocation {
  MAIN_WAREHOUSE = 'MAIN_WAREHOUSE',
  REPAIR_SHOP = 'REPAIR_SHOP',
  VEHICLE = 'VEHICLE',
  TRANSIT = 'TRANSIT'
}

export interface TyreCondition {
  status: TyreConditionStatus;
  treadDepth: number;
  pressure?: number;
  lastInspectionDate?: string;
  notes?: string;
}

export interface TyreInstallation {
  vehicleId: string;
  position: string;
  installDate: string;
  installedBy: string;
}

export const tyreBrands = [
  'Bridgestone', 'Michelin', 'Goodyear', 'Continental', 'Pirelli',
  'Dunlop', 'Hankook', 'Yokohama', 'Kumho', 'Toyo',
  'Firemax', 'Triangle', 'Terraking', 'Compasal', 'Windforce',
  'Perelli', 'Powertrac', 'Sunfull', 'Wellplus', 'Techshield',
  'Sonix', 'Formula'
];

// --- TYRE SIZES ---
export const tyreSizes = [
  '295/80R22.5',
  '315/80R22.5',
  '295/75R22.5',
  '11R22.5',
  '12R22.5',
  '385/65R22.5',
  '275/70R22.5',
  '315/80R22.16',
  '315/80R22.17'
];

// --- TYRE PATTERN DATA ---
export const tyrePatterns = [
  // 315/80R22.5 (Drive)
  { brand: 'Firemax', pattern: '', size: '315/80R22.5', position: 'Drive' },
  { brand: 'TRIANGLE', pattern: 'TR688', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Terraking', pattern: 'HS102', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Compasal', pattern: 'TR688', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Windforce', pattern: 'WD2020', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Windforce', pattern: 'WD2060', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Compasal', pattern: 'CPD82', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Perelli', pattern: 'FG01S', size: '315/80R22.5', position: 'Drive' },
  { brand: 'POWERTRAC', pattern: 'TractionPro', size: '315/80R22.5', position: 'Drive' },
  { brand: 'SUNFULL', pattern: 'HF638', size: '315/80R22.5', position: 'Drive' },
  { brand: 'SUNFULL', pattern: 'HF768', size: '315/80R22.5', position: 'Drive' },
  { brand: 'FORMULA', pattern: '', size: '315/80R22.16', position: 'Drive' },
  { brand: 'PIRELLI', pattern: '', size: '315/80R22.17', position: 'Drive' },
  { brand: 'Wellplus', pattern: 'WDM16', size: '315/80R22.5', position: 'Drive' },

  // 315/80R22.5 (Dual / Multi)
  { brand: 'Dunlop', pattern: 'SP571', size: '315/80R22.5', position: 'Multi' },
  { brand: 'Firemax', pattern: 'FM188', size: '315/80R22.5', position: 'Multi' },
  { brand: 'Firemax', pattern: 'FM19', size: '315/80R22.5', position: 'Multi' },
  { brand: 'Terraking', pattern: 'HS268', size: '315/80R22.5', position: 'Multi' },
  { brand: 'Windforce', pattern: 'WA1060', size: '315/80R22.5', position: 'Multi' },
  { brand: 'Dunlop', pattern: 'SP320A', size: '315/80R22.5', position: 'Multi' },
  { brand: 'Sonix', pattern: '', size: '315/80R22.5', position: 'Multi' },
  { brand: 'FORMULA', pattern: '', size: '315/80R22.29', position: 'Multi' },
  { brand: 'PIRELLI', pattern: '', size: '315/80R22.5', position: 'Multi' },

  // 315/80R22.5 (Steer)
  { brand: 'Traiangle', pattern: 'TRS03', size: '315/80R22.5', position: 'Steer' },
  { brand: 'Sunfull', pattern: 'HF660', size: '315/80R22.5', position: 'Steer' },
  { brand: 'Compasal', pattern: 'CPS60', size: '315/80R22.5', position: 'Steer' },
  { brand: 'SONIX', pattern: 'SX668', size: '315/80R22.5', position: 'Steer' },
  { brand: 'FORMULA', pattern: '', size: '315/80R22.5', position: 'Steer' },
  { brand: 'PIRELLI', pattern: '', size: '315/80R22.5', position: 'Steer' },
  { brand: 'Firemax', pattern: 'FM66', size: '315/80R22.5', position: 'Steer' },
  { brand: 'WellPlus', pattern: 'WDM916', size: '315/80R22.5', position: 'Steer' },
  { brand: 'Firemax', pattern: 'FM166', size: '315/80R22.5', position: 'Steer' },
  { brand: 'Windforce', pattern: 'WH1020', size: '315/80R22.5', position: 'Steer' },
  { brand: 'Firemax', pattern: 'FM18', size: '315/80R22.5', position: 'Steer' },

  // 315/80R22.5 (Trailer)
  { brand: 'POWERTRAC', pattern: 'Tracpro', size: '315/80R22.5', position: 'Trailer' },
  { brand: 'Sunfull', pattern: 'HF660', size: '315/80R22.5', position: 'Trailer' },
  { brand: 'SUNFULL', pattern: 'ST011', size: '315/80R22.5', position: 'Trailer' },

  // 385/65R22.5 (Steer)
  { brand: 'Firemax', pattern: 'FM06', size: '385/65R22.5', position: 'Steer' },
  { brand: 'TECHSHIELD', pattern: 'TS778', size: '385/65R22.5', position: 'Steer' }
];

// --- VEHICLE POSITION CONFIGURATIONS ---
// This defines the available positions for each vehicle type
export const vehiclePositions = [
  {
    vehicleType: 'standard',
    name: 'Standard Vehicle',
    positions: [
      { id: 'Front Left', name: 'Front Left' },
      { id: 'Front Right', name: 'Front Right' },
      { id: 'Drive Axle Left Inner', name: 'Drive Axle Left Inner' },
      { id: 'Drive Axle Left Outer', name: 'Drive Axle Left Outer' },
      { id: 'Drive Axle Right Inner', name: 'Drive Axle Right Inner' },
      { id: 'Drive Axle Right Outer', name: 'Drive Axle Right Outer' },
      { id: 'Trailer Axle 1 Left', name: 'Trailer Axle 1 Left' },
      { id: 'Trailer Axle 1 Right', name: 'Trailer Axle 1 Right' },
      { id: 'Trailer Axle 2 Left', name: 'Trailer Axle 2 Left' },
      { id: 'Trailer Axle 2 Right', name: 'Trailer Axle 2 Right' },
      { id: 'Spare', name: 'Spare' }
    ]
  },
  {
    vehicleType: 'reefer',
    name: 'Reefer (3-Axle Trailer, Single Tyres)',
    positions: [
      { id: 'T1', name: 'Axle 1 - Left Side' },
      { id: 'T2', name: 'Axle 1 - Right Side' },
      { id: 'T3', name: 'Axle 2 - Left Side' },
      { id: 'T4', name: 'Axle 2 - Right Side' },
      { id: 'T5', name: 'Axle 3 - Left Side' },
      { id: 'T6', name: 'Axle 3 - Right Side' },
      { id: 'SP1', name: 'Spare 1' },
      { id: 'SP2', name: 'Spare 2' }
    ]
  },
  {
    vehicleType: 'horse',
    name: 'Horse (Truck Tractor)',
    positions: [
      { id: 'V1', name: 'Axle 1 - Left Side' },
      { id: 'V2', name: 'Axle 1 - Right Side' },
      { id: 'V3', name: 'Axle 2 - Left Outer' },
      { id: 'V4', name: 'Axle 2 - Left Inner' },
      { id: 'V5', name: 'Axle 2 - Right Outer' },
      { id: 'V6', name: 'Axle 2 - Right Inner' },
      { id: 'V7', name: 'Axle 3 - Left Outer' },
      { id: 'V8', name: 'Axle 3 - Left Inner' },
      { id: 'V9', name: 'Axle 3 - Right Outer' },
      { id: 'V10', name: 'Axle 3 - Right Inner' },
      { id: 'SP', name: 'Spare' }
    ]
  },
  {
    vehicleType: 'interlink',
    name: 'Interlink (4-Axle Trailer, Dual Tyres)',
    positions: [
      { id: 'T1', name: 'Axle 1 - Left Rear Outer' },
      { id: 'T2', name: 'Axle 1 - Right Rear Outer' },
      { id: 'T3', name: 'Axle 2 - Left Rear Outer' },
      { id: 'T4', name: 'Axle 2 - Right Rear Outer' },
      { id: 'T5', name: 'Axle 1 - Left Rear Inner' },
      { id: 'T6', name: 'Axle 1 - Right Rear Inner' },
      { id: 'T7', name: 'Axle 2 - Left Rear Inner' },
      { id: 'T8', name: 'Axle 2 - Right Rear Inner' },
      { id: 'T9', name: 'Axle 3 - Left Rear Outer' },
      { id: 'T10', name: 'Axle 3 - Right Rear Outer' },
      { id: 'T11', name: 'Axle 4 - Left Rear Outer' },
      { id: 'T12', name: 'Axle 4 - Right Rear Outer' },
      { id: 'T13', name: 'Axle 3 - Left Rear Inner' },
      { id: 'T14', name: 'Axle 3 - Right Rear Inner' },
      { id: 'T15', name: 'Axle 4 - Left Rear Inner' },
      { id: 'T16', name: 'Axle 4 - Right Rear Inner' },
      { id: 'SP1', name: 'Spare 1' },
      { id: 'SP2', name: 'Spare 2' }
    ]
  },
  {
    vehicleType: 'lmv',
    name: 'Light Motor Vehicle (LMV)',
    positions: [
      { id: 'P1', name: 'Front Left' },
      { id: 'P2', name: 'Front Right' },
      { id: 'P3', name: 'Rear Left' },
      { id: 'P4', name: 'Rear Right' },
      { id: 'P5', name: 'Middle Left' }, // For 6-wheelers
      { id: 'P6', name: 'Middle Right' }, // For 6-wheelers
      { id: 'SP', name: 'Spare' }
    ]
  }
];
