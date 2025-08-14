// src/types/diesel.ts
import type { Timestamp } from "firebase/firestore";

/** Possible categories for workshop job cards */
export type JobCardCategory =
  | "preventive_maintenance"
  | "corrective_maintenance"
  | "inspection_followup"
  | "safety_repair"
  | "emergency_repair"
  | "tyre_service"
  | "body_repair";

/** Allowed vehicle types in the system */
export type VehicleType = "truck" | "trailer" | "reefer" | "ldv" | "bus";

/** Allowed fuel entry sources */
export type FuelEntrySource = "manual" | "wialon" | "import";

/** Fuel station classification */
export type StationType = "onsite" | "public" | "vendor";

/** Workshop job card template definition */
export interface JobCardTemplate {
  id: string;
  name: string;
  category: JobCardCategory;
  tasks: string[];
  estimatedDuration: number; // in hours
  vehicleType: VehicleType | "both";
}

/** Diesel consumption record for a vehicle */
export interface DieselConsumptionRecord {
  id: string;
  fleetNumber: string;
  driverName: string;
  /** Firestore Timestamp or undefined if not yet saved */
  date?: Timestamp;
  /** ISO string representation for UI filtering */
  dateISO?: string;
  litresFilled: number;
  totalCost: number;
  currency?: string;
  fuelStation: string;
  stationType?: StationType;
  kmReading?: number;
  previousKmReading?: number;
  notes?: string;
  vehicleId?: string;
  tripId?: string;
  /** Source of the entry (manual, Wialon, import) */
  source?: FuelEntrySource;
  probeReading?: number;
  probeDiscrepancy?: number;
  probeVerified?: boolean;
  probeVerificationNotes?: string;
  probeVerifiedAt?: string;
  probeVerifiedBy?: string;
  hoursOperated?: number;
  litresPerHour?: number;
  rootCause?: string;
  actionTaken?: string;
}

/** Diesel norm values for planning & benchmarking */
export interface DieselNorm {
  id: string;
  vehicleType: VehicleType;
  routeType: string;
  litresPer100km: number;
  notes?: string;
}
