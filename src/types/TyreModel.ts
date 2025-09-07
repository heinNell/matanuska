// TyreModel.ts - Domain model for Tyre Management

/**
 * CENTRAL TYRE DOMAIN MODULE
 * All types, Firestore converters, analytics, API, and helpers for Tyre management.
 * This file is the single entry point for all tyre-related business logic, type safety,
 * and data operations.
 */

import { FirestoreDataConverter, Timestamp } from "firebase/firestore";

// =========================
// Tyre Types & Interfaces
// =========================

export interface TyreSize {
  width: number; // e.g. 315
  aspectRatio: number; // e.g. 80
  rimDiameter: number; // e.g. 22.5
  displayString?: string; // "315/80R22.5"
}

export type TyreType =
  | "standard"
  | "winter"
  | "all_season"
  | "mud_terrain"
  | "all_terrain"
  | "reefer"
  | "horse"
  | "interlink"
  | "steer" // Added from types/tyre.ts
  | "drive" // Added from types/tyre.ts
  | "trailer" // Added from types/tyre.ts
  | "spare"; // Added from types/tyre.ts

export interface TyrePosition {
  id: string;
  name: string; // "front_left", "drive_1_left", etc.
}

export interface PurchaseDetails {
  date: string;
  cost: number;
  supplier: string;
  warranty?: string;
  invoiceNumber?: string;
}

export interface Installation {
  vehicleId: string;
  position: string;
  mileageAtInstallation: number;
  installationDate: string; // ISO date string
  installedBy: string;
}

export interface TyreCondition {
  treadDepth: number;
  pressure: number;
  temperature?: number;
  status: "good" | "warning" | "critical" | "needs_replacement";
  lastInspectionDate: string;
  nextInspectionDue?: string;
}

export interface TyreRotation {
  id: string;
  date: string;
  fromPosition: string; // Keep as string to avoid circular reference
  toPosition: string; // Keep as string to avoid circular reference
  mileage: number;
  technician: string; // Changed from 'by' to match types/tyre.ts
  notes?: string;
}

export interface TyreRepair {
  id: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  technician: string; // Changed from 'by' to match types/tyre.ts
  notes?: string;
}

export interface TyreInspection {
  id: string;
  date: string;
  inspector: string;
  treadDepth: number;
  pressure: number;
  temperature: number;
  condition: string; // Changed from 'status' to match types/tyre.ts
  notes: string;
  images?: string[];
  sidewallCondition?: string; // Keep for backward compatibility
}

export interface MaintenanceHistory {
  rotations: TyreRotation[];
  repairs: TyreRepair[];
  inspections: TyreInspection[];
}

// Define tyre store location enum to match types/tyre.ts
export enum TyreStoreLocation {
  VICHELS_STORE = "Vichels Store",
  HOLDING_BAY = "Holding Bay",
  RFR = "RFR",
  SCRAPPED = "Scrapped",
}

export interface TyreStore {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentStock: number;
}

export interface StockEntry {
  tyreId: string;
  date: string;
  action: "in" | "out" | "adjust";
  quantity: number;
  notes?: string;
}

export type TyreStatus = "new" | "in_service" | "spare" | "retreaded" | "scrapped";
export type TyreMountStatus = "mounted" | "unmounted" | "in_storage";

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
  purchaseDetails: PurchaseDetails;
  installation?: Installation;
  condition: TyreCondition;
  status: TyreStatus;
  mountStatus: TyreMountStatus;
  maintenanceHistory: MaintenanceHistory;
  kmRun: number;
  kmRunLimit: number;
  notes?: string;
  location: TyreStoreLocation;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ===========================
// Firestore Converter
// ===========================

export const tyreConverter: FirestoreDataConverter<Tyre> = {
  toFirestore(tyre: Tyre) {
    return {
      ...tyre,
      createdAt: tyre.createdAt ?? Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      ...data,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as Tyre;
  },
};

// ==========================
// Firebase API Functions
// ==========================

import {
  addTyreInspection,
  addTyreStore,
  deleteTyre,
  getTyreById,
  getTyreInspections,
  getTyreStats,
  getTyres,
  getTyresByVehicle,
  listenToTyreStores,
  listenToTyres,
  saveTyre,
  updateTyreStoreEntry,
} from "../firebase";

export {
  addTyreInspection,
  addTyreStore,
  deleteTyre,
  getTyreById,
  getTyreInspections,
  getTyreStats,
  getTyres,
  getTyresByVehicle,
  listenToTyreStores,
  listenToTyres,
  saveTyre,
  updateTyreStoreEntry,
};

// =========================
// Analytics & Utility Types
// =========================

import {
  RankedTyre,
  TyreStat,
  filterTyresByPerformance,
  getBestTyres,
  getTyreBrandPerformance,
  getTyrePerformanceStats,
} from "../utils/tyreAnalytics";

export type { RankedTyre, TyreStat };

export { filterTyresByPerformance, getBestTyres, getTyreBrandPerformance, getTyrePerformanceStats };

// ========================
// Format/Parse Utilities
// ========================

import { formatTyreSize as _formatTyreSize, parseTyreSize as _parseTyreSize } from "./tyre";

export const formatTyreSize = _formatTyreSize;
export const parseTyreSize = _parseTyreSize;

// ===========================
// TyreService: Core Domain Logic
// ===========================

export class TyreService {
  static calculateWearRate(tyre: Tyre): number | null {
    if (!tyre.installation || !tyre.condition || tyre.kmRun <= 0) return null;
    const newTyreDepth = 20; // mm (your policy - adjust as needed)
    const currentDepth = tyre.condition.treadDepth;
    const wornDepth = newTyreDepth - currentDepth;
    return (wornDepth / tyre.kmRun) * 1000;
  }

  static calculateCostPerKm(tyre: Tyre): number {
    if (tyre.kmRun <= 0) return 0;
    return tyre.purchaseDetails.cost / tyre.kmRun;
  }

  static calculateRemainingLife(tyre: Tyre): number {
    const currentTread = tyre.condition.treadDepth;
    const minimumTread = 3; // mm, legal minimum
    const newTyreDepth = 20; // mm
    const usedTread = newTyreDepth - currentTread;
    const wearRate = tyre.kmRun > 0 ? usedTread / tyre.kmRun : 0;
    const remainingTread = currentTread - minimumTread;
    const remainingKm = wearRate > 0 ? remainingTread / wearRate : 0;
    return Math.max(remainingKm, 0);
  }

  static estimateRemainingLife(tyre: Tyre): { kilometers: number; days: number } | null {
    const wearRate = this.calculateWearRate(tyre);
    if (wearRate === null || wearRate <= 0) return null;
    const minSafeDepth = 1.6;
    const currentDepth = tyre.condition.treadDepth;
    const usableDepthRemaining = currentDepth - minSafeDepth;
    if (usableDepthRemaining <= 0) return { kilometers: 0, days: 0 };
    const remainingKm = (usableDepthRemaining / wearRate) * 1000;
    const avgDailyKm = 150;
    const remainingDays = remainingKm / avgDailyKm;
    return {
      kilometers: Math.round(remainingKm),
      days: Math.round(remainingDays),
    };
  }

  static async getTyresNeedingAttention(): Promise<Tyre[]> {
    try {
      // Use enum value for warning condition if filtering supported
      const tyres = await getTyres({ condition: "warning" as any });
      // Normalize maintenanceHistory.rotations to ensure id exists
      return tyres.map((t: any) => ({
        ...t,
        maintenanceHistory: {
          rotations: (t.maintenanceHistory?.rotations || []).map((r: any, idx: number) => ({
            id: r.id || `rotation-${t.id}-${idx}`,
            ...r,
          })),
          repairs: (t.maintenanceHistory?.repairs || []).map((r: any, idx: number) => ({
            id: r.id || `repair-${t.id}-${idx}`,
            ...r,
          })),
          inspections: t.maintenanceHistory?.inspections || [],
        },
      }));
    } catch (error) {
      console.error("Error getting tyres needing attention:", error);
      throw error;
    }
  }

  static calculateTotalCostOfOwnership(tyre: Tyre, includeRepairs = true): number {
    let totalCost = tyre.purchaseDetails.cost;
    if (includeRepairs && tyre.maintenanceHistory && tyre.maintenanceHistory.repairs) {
      totalCost += tyre.maintenanceHistory.repairs.reduce((sum, repair) => sum + repair.cost, 0);
    }
    return totalCost;
  }

  static calculateFleetAverageCostPerKm(tyres: Tyre[]): number {
    if (!tyres.length) return 0;
    let totalCost = 0;
    let totalDistance = 0;
    tyres.forEach((tyre) => {
      totalCost += this.calculateTotalCostOfOwnership(tyre);
      totalDistance += tyre.kmRun;
    });
    return totalDistance > 0 ? totalCost / totalDistance : 0;
  }

  static convertToTyreStats(tyres: Tyre[]): TyreStat[] {
    return tyres.map((tyre) => ({
      brand: tyre.brand,
      model: tyre.model,
      totalDistance: tyre.kmRun,
      totalCost: this.calculateTotalCostOfOwnership(tyre),
    }));
  }

  static getTyrePerformanceAnalysis(tyres: Tyre[]) {
    const tyreStats = this.convertToTyreStats(tyres);
    const performanceStats = getTyrePerformanceStats(tyreStats);
    const brandPerformance = getTyreBrandPerformance(tyreStats);
    return {
      performanceStats,
      brandPerformance,
      excellentPerformers: filterTyresByPerformance(tyreStats, "excellent"),
      poorPerformers: filterTyresByPerformance(tyreStats, "poor"),
    };
  }
}

// END OF DOMAIN MODULE
