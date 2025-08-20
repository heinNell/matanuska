/**
 * Vehicle and fleet related type definitions
 */

// Vehicle status types
export type VehicleStatus = "active" | "maintenance" | "out_of_service";

// Vehicle type classification
export type VehicleType = "heavy_truck" | "light_vehicle" | "trailer" | "reefer" | "generator";

// Vehicle category
export type VehicleCategory = "truck" | "trailer" | "reefer" | "generator";

// Vehicle series
export type VehicleSeries = "H" | "L" | "T" | "F" | "OTHER";

/**
 * Main Vehicle interface
 */
export interface Vehicle {
  id: string;
  name?: string;
  location?: {
    lat: number;
    lng: number;
  };
  status: "active" | "inactive" | "maintenance";
  lastUpdate?: string;
  registrationNo: string; // <-- Added registrationNo property
  // Optional extended fields used across UI and data
  fleetNo?: string;
  manufacturer?: string;
  model?: string;
  chassisNo?: string;
  engineNo?: string;
  type?: VehicleType | string;
  category?: VehicleCategory | string;
  series?: VehicleSeries | string;
  km?: number; // prefer km over mileage
  /**
   * Deprecated: use km instead
   */
  mileage?: number;
}

/**
 * Fleet statistics interface
 */
export interface FleetStats {
  total: number;
  active: number;
  maintenance: number;
  outOfService: number;
  byType: {
    heavy_truck: number;
    light_vehicle: number;
    trailer: number;
    reefer: number;
    generator: number;
  };
  bySeries: {
    H: number;
    L: number;
    T: number;
    F: number;
    OTHER: number;
  };
  byManufacturer: {
    SCANIA: number;
    SHACMAN: number;
    ISUZU: number;
    SINOTRUK: number;
    SERCO: number;
    OTHER: number;
  };
}

/**
 * Vehicle filter options interface
 */
export interface VehicleFilters {
  status?: VehicleStatus[];
  type?: VehicleType[];
  series?: VehicleSeries[];
  manufacturer?: string[];
}

/**
 * Inspection interface for vehicle inspections
 */
export interface Inspection {
  id: string;
  vehicleId: string;
  inspectorName: string;
  inspectionType: "daily" | "weekly" | "monthly" | "annual" | "pre_trip" | "post_trip";
  status: "pending" | "in_progress" | "completed" | "failed" | "requires_action";
  scheduledDate: string;
  completedDate?: string;
  durationMinutes?: number;
  defectsFound: number;
  criticalIssues: number;
  notes: string;
}

/**
 * Vehicle inspection interface for detailed vehicle inspections
 */
export interface VehicleInspection {
  id: string;
  date: string;
  inspector: string;
  vehicleId: string;
  faults: string[];
  status: "PASSED" | "FAILED" | "REQUIRES_ATTENTION";
  images?: string[];
  notes?: string;
  mileage?: number;
  followUpActions?: string[];
  signatureUrl?: string;
  createdAt: string;
  completedAt?: string;
}
