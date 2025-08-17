// Extended type for DieselConsumptionRecord to include properties used in DieselDashboard
import { DieselConsumptionRecord as BaseDieselConsumptionRecord } from ".";

export interface ExtendedDieselConsumptionRecord extends BaseDieselConsumptionRecord {
  id: string; // Unique identifier for the record
  // Additional properties used in DieselDashboard but not in the base type
  vehicleId?: string; // Used in place of fleetNumber
  timestamp?: string; // Used in place of date
  liters?: number; // Used in place of litresFilled
  cost?: number; // Used in place of totalCost
  location?: string; // Used in place of fuelStation
  odometer?: number; // Used in place of kmReading
  verified?: boolean; // Used in place of probeVerified
  flagged?: boolean; // Flag for records with issues
}

// Sync status type
export enum SyncStatus {
  SYNCED = "SYNCED",
  SYNCING = "SYNCING",
  ERROR = "ERROR",
  IDLE = "IDLE",
}

// Diesel norms type
export interface DieselNorms {
  id: string;
  vehicleType: string;
  minKmPerLiter: number;
  maxKmPerLiter: number;
  notes?: string;
}
