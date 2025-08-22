// Comprehensive types for Workshop and Tyre Management System

// Original interfaces to maintain backward compatibility
export interface Tyre {
  id: string;
  brand: string;
  model: string;
  size: string;
  serialNumber: string;
  dotCode: string;
  manufactureDate: string;
  installDetails: {
    date: string;
    position: string;
    vehicle: string;
    mileage: number;
  };
  treadDepth: number;
  pressure: number;
  lastInspection: string;
  status: "good" | "worn" | "urgent";
  cost: number;
  estimatedLifespan: number;
  pattern?: string; // Optional for compatibility with filters
  currentMileage?: number;
  costPerKm?: number;
  tyreSize?: TyreSize; // Added to fix TypeScript error
  // Additional properties used in VehicleTyreView
  loadIndex?: string;
  speedRating?: string;
  type?: TyreType;
  purchaseDate?: string;
  warranty?: string;
  supplier?: string;
  retread?: boolean;
  lastInspectionDate?: string; // Used interchangeably with lastInspection
  inspectionHistory?: Array<{
    id: string;
    date: string;
    inspector: string;
    treadDepth: number;
    pressure: number;
    sidewallCondition?: string;
    status: string;
    timestamp: string;
  }>;
}

export interface TyreInspection {
  id: string;
  tyreId: string;
  date: string;
  inspector: string;
  treadDepth: number;
  pressure: number;
  sidewallCondition: string;
  status: string;
  notes?: string;
  timestamp: string;
}

// New extended interfaces for the comprehensive system
export interface TyreSize {
  width: number; // mm (e.g., 295, 315)
  aspectRatio: number; // % (e.g., 80, 75)
  rimDiameter: number; // inches (e.g., 22.5, 24.5)
  displayString?: string; // For compatibility with UI that expects string
}

export interface TyreCondition {
  treadDepth: number; // mm
  pressure: number; // PSI
  temperature: number; // Celsius
  status: "good" | "warning" | "critical" | "needs_replacement";
  lastInspectionDate: string;
  nextInspectionDue: string;
}

export interface TyreInspectionEntry {
  id: string;
  date: string;
  inspector: string;
  treadDepth: number;
  pressure: number;
  temperature: number;
  condition: string;
  notes: string;
  sidewallCondition?: string; // Added to fix TypeScript error
  remarks?: string; // Added for compatibility with TyreInspection.tsx
  photos?: string[]; // Added for compatibility with TyreInspection.tsx
  status?: string; // Added for compatibility with TyreInspection.tsx
  timestamp?: string; // Added for compatibility with TyreInspection.tsx
  images?: string[];
}

// Enhanced Tyre interface without getters (TypeScript-friendly)
export interface EnhancedTyre {
  id: string;
  tyreId: string;
  serialNumber: string;
  dotCode: string;
  manufacturingDate: string;
  brand: string;
  model: string;
  pattern: string;
  sizeDetails: TyreSize;
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

  installation: {
    vehicleId: string;
    position: string;
    mileageAtInstallation: number;
    installationDate: string;
    installedBy: string;
  };

  condition: TyreCondition;
  tyreStatus: TyreStatus;
  mountStatus: TyreMountStatus;

  maintenanceHistory: {
    rotations: Array<{
      date: string;
      fromPosition: string;
      toPosition: string;
      mileage: number;
      technician: string;
    }>;
    repairs: Array<{
      date: string;
      type: string;
      description: string;
      cost: number;
      technician: string;
    }>;
    inspections: TyreInspectionEntry[];
  };

  kmRun: number;
  kmRunLimit: number;
  notes: string;
}

export interface RCAData {
  rootCause: string;
  conductedBy: string;
  responsiblePerson: string;
  notes: string;
  timestamp: string;
  jobCardId: string;
  repeatItem?: string;
}

export interface TimeLogEntry {
  logId: string;
  status: "started" | "paused" | "completed" | "cancelled" | string; // Using union type with string fallback for backward compatibility
  timestamp: string;
  userId: string;
  notes?: string;
}

export interface Attachment {
  attachmentId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface Remark {
  remarkId: string;
  text: string;
  addedBy: string;
  addedAt: string;
  type: "general" | "technical" | "safety" | "customer";
}

export interface PORequest {
  id: string;
  partId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  status: "requested" | "approved" | "ordered" | "received";
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface JobCardItem {
  id: string;
  description: string;
  taskType: "repair" | "replace" | "service" | "inspect";
  priority: "low" | "medium" | "high" | "critical";
  estimatedHours: number;
  actualHours?: number;
  status: TaskStatus;
  assignedTechnician?: string;
  assignedTo?: string;
  partsRequired: {
    itemId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
  }[];
  notes: string;
}

export interface JobCard {
  id: string;
  workOrderNumber: string;
  inspectionId?: string;
  vehicleId: string;
  customerName: string;
  priority: Priority;
  status: JobCardStatus;
  createdAt: string;
  createdDate: string;
  scheduledDate?: string;
  completedDate?: string;
  assignedTechnician?: string;
  estimatedCompletion?: string;
  workDescription: string;
  estimatedHours: number;
  laborRate: number;
  partsCost: number;
  totalEstimate: number;
  tasks: JobCardItem[];
  totalLaborHours: number;
  totalPartsValue: number;
  notes: string;
  faultIds: string[];
  attachments: string[];
  remarks: string[];
  timeLog: TimeLogEntry[];
  linkedPOIds: string[];
  createdBy: string;
  updatedAt: string;
  odometer: number;
  model: string;
  tyrePositions: TyrePosition[];
  memo: string;
  additionalCosts: number;
  rcaRequired: boolean;
  rcaCompleted: boolean;
  templateId?: string;
  checklistProgress?: { [key: string]: boolean };
  qualityCheckProgress?: { [key: string]: boolean };
  safetyCheckProgress?: { [key: string]: boolean };
}

export interface WorkOrder {
  workOrderId: string;
  vehicleId: string;
  status: WorkOrderStatus;
  priority: Priority;
  title: string;
  description: string;
  tasks: TaskEntry[];
  partsUsed: PartEntry[];
  laborEntries: LaborEntry[];
  attachments: Attachment[];
  remarks: Remark[];
  timeLog: TimeLogEntry[];
  linkedInspectionId?: string;
  linkedPOIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  rcaRequired?: boolean;
  rcaCompleted?: boolean;
}

export interface TaskEntry {
  taskId: string;
  description: string;
  status: TaskStatus;
  assignedTo?: string;
  estimatedHours: number;
  actualHours?: number;
  notes?: string;
  linkedFaultId?: string;
}

export interface PartEntry {
  partId: string;
  partNumber: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier?: string;
  status: "requested" | "ordered" | "received" | "installed";
}

export interface LaborEntry {
  laborId: string;
  technicianId: string;
  technicianName: string;
  laborCode: string;
  hoursWorked: number;
  hourlyRate: number;
  totalCost: number;
  date: string;
}

export interface TyreInventoryItem {
  id: string;
  brand: string;
  model: string;
  pattern: string;
  size: string;
  quantity: number;
  minStock: number;
  cost: number;
  supplier: string;
  location: string;
}

export interface VehicleTyreConfiguration {
  vehicleType: string;
  positions: Array<{
    position: string;
    displayName: string;
    coordinates: { x: number; y: number };
    isSpare: boolean;
  }>;
}

export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  quantity: number;
  unitPrice: number;
  category: string;
}

// Status type unions for consistent use across components
export type JobCardStatus =
  | "created"
  | "assigned"
  | "in_progress"
  | "parts_pending"
  | "completed"
  | "invoiced"
  | "initiated"
  | "rca_required"
  | "overdue"
  | "inspected";
export type WorkOrderStatus =
  | "initiated"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "rca_required"
  | "overdue"
  | "on_hold";
export type Priority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "pending" | "in_progress" | "completed" | "not_applicable" | "on_hold" | "verified";
export type TyreStatus = "new" | "in_service" | "spare" | "retreaded" | "scrapped";
export type TyreConditionStatus = "good" | "warning" | "critical" | "needs_replacement";
export type TyreMountStatus = "mounted" | "unmounted" | "in_storage";
export type TyreType = "steer" | "drive" | "trailer" | "spare";
export type TyrePosition = string;

// Helper functions (compatibility layer)
// These replace the interface getters with proper functions

/**
 * Parse tyre size from a string representation (e.g., "295/80R22.5")
 */
export function parseTyreSizeFromString(sizeStr: string): TyreSize {
  // Default values
  const defaultSize: TyreSize = {
    width: 295,
    aspectRatio: 80,
    rimDiameter: 22.5,
    displayString: sizeStr,
  };

  // Try to parse size string like "295/80R22.5"
  try {
    const regex = /(\d+)\/(\d+)R(\d+\.?\d*)/;
    const match = sizeStr.match(regex);

    if (match && match.length >= 4) {
      // Add null checks and provide default values if parsing fails
      const width = match[1] ? parseInt(match[1], 10) : 295;
      const aspectRatio = match[2] ? parseInt(match[2], 10) : 80;
      const rimDiameter = match[3] ? parseFloat(match[3]) : 22.5;

      return {
        width,
        aspectRatio,
        rimDiameter,
        displayString: sizeStr,
      };
    }
  } catch (e) {
    console.error("Error parsing tyre size", e);
  }

  return defaultSize;
}

/**
 * Determine tyre type based on position
 */
export function determineTyreType(position: string): TyreType {
  if (position.toLowerCase().includes("spare")) return "spare";
  if (position.toLowerCase().includes("steer") || position.toLowerCase().includes("front"))
    return "steer";
  if (position.toLowerCase().includes("drive")) return "drive";
  if (position.toLowerCase().includes("trailer")) return "trailer";
  return "drive"; // Default
}

/**
 * Map legacy status to condition status
 */
export function mapLegacyStatusToConditionStatus(
  legacyStatus: "good" | "worn" | "urgent"
): TyreConditionStatus {
  switch (legacyStatus) {
    case "good":
      return "good";
    case "worn":
      return "warning";
    case "urgent":
      return "needs_replacement";
    default:
      return "good";
  }
}

/**
 * Map legacy status to tyre status
 */
export function mapLegacyStatusToTyreStatus(): TyreStatus {
  // In legacy system, all tyres were assumed to be 'in_service' regardless of condition
  return "in_service";
}

// Compatibility helper functions
export function getSizeString(enhancedTyre: EnhancedTyre): string {
  const size = enhancedTyre.sizeDetails;
  return size.displayString || `${size.width}/${size.aspectRatio}R${size.rimDiameter}`;
}

export function getInstallDetails(enhancedTyre: EnhancedTyre): Tyre["installDetails"] {
  return {
    date: enhancedTyre.installation.installationDate || "",
    position: enhancedTyre.installation.position || "",
    vehicle: enhancedTyre.installation.vehicleId || "",
    mileage: enhancedTyre.installation.mileageAtInstallation || 0,
  };
}

export function getLegacyStatus(enhancedTyre: EnhancedTyre): "good" | "worn" | "urgent" {
  // Map from enhanced condition status back to legacy status
  if (enhancedTyre.condition.status === "good") return "good";
  if (enhancedTyre.condition.status === "warning") return "worn";
  return "urgent"; // critical or needs_replacement
}

/**
 * Convert legacy Tyre format to EnhancedTyre
 */
export function convertToEnhancedTyre(legacyTyre: Tyre): EnhancedTyre {
  const size = parseTyreSizeFromString(legacyTyre.size);

  return {
    id: legacyTyre.id,
    tyreId: legacyTyre.id,
    serialNumber: legacyTyre.serialNumber,
    dotCode: legacyTyre.dotCode,
    manufacturingDate: legacyTyre.manufactureDate,
    brand: legacyTyre.brand,
    model: legacyTyre.model,
    pattern: legacyTyre.pattern || "",
    sizeDetails: size,
    loadIndex: 0, // Default value
    speedRating: "", // Default value
    type: determineTyreType(legacyTyre.installDetails.position),

    purchaseDetails: {
      date: "",
      cost: legacyTyre.cost,
      supplier: "",
      warranty: "",
    },

    installation: {
      vehicleId: legacyTyre.installDetails.vehicle,
      position: legacyTyre.installDetails.position,
      mileageAtInstallation: legacyTyre.installDetails.mileage,
      installationDate: legacyTyre.installDetails.date,
      installedBy: "",
    },

    condition: {
      treadDepth: legacyTyre.treadDepth,
      pressure: legacyTyre.pressure,
      temperature: 0,
      status: mapLegacyStatusToConditionStatus(legacyTyre.status),
      lastInspectionDate: legacyTyre.lastInspection,
      nextInspectionDue: "",
    },

    tyreStatus: mapLegacyStatusToTyreStatus(),
    mountStatus: "mounted", // Default for legacy tyres

    maintenanceHistory: {
      rotations: [],
      repairs: [],
      inspections: legacyTyre.inspectionHistory
        ? legacyTyre.inspectionHistory.map((hist) => ({
            id: hist.id,
            date: hist.date,
            inspector: hist.inspector,
            treadDepth: hist.treadDepth,
            pressure: hist.pressure,
            temperature: 0, // Default
            condition: hist.status,
            notes: hist.sidewallCondition || "",
            images: [],
          }))
        : [],
    },

    kmRun: legacyTyre.currentMileage || 0,
    kmRunLimit: legacyTyre.estimatedLifespan || 0,
    notes: "",
  };
}

/**
 * Convert EnhancedTyre format to legacy Tyre
 */
export function convertToLegacyTyre(enhancedTyre: EnhancedTyre): Tyre {
  return {
    id: enhancedTyre.id,
    brand: enhancedTyre.brand,
    model: enhancedTyre.model,
    size: getSizeString(enhancedTyre),
    serialNumber: enhancedTyre.serialNumber,
    dotCode: enhancedTyre.dotCode,
    manufactureDate: enhancedTyre.manufacturingDate,
    installDetails: getInstallDetails(enhancedTyre),
    treadDepth: enhancedTyre.condition.treadDepth,
    pressure: enhancedTyre.condition.pressure,
    lastInspection: enhancedTyre.condition.lastInspectionDate,
    status: getLegacyStatus(enhancedTyre),
    cost: enhancedTyre.purchaseDetails.cost,
    estimatedLifespan: enhancedTyre.kmRunLimit,
    pattern: enhancedTyre.pattern,
    currentMileage: enhancedTyre.kmRun,
    costPerKm: 0, // Calculate if needed
    // Convert inspections back to the legacy format if needed
    inspectionHistory: enhancedTyre.maintenanceHistory.inspections.map((inspection) => ({
      id: inspection.id,
      date: inspection.date,
      inspector: inspection.inspector,
      treadDepth: inspection.treadDepth,
      pressure: inspection.pressure,
      sidewallCondition: inspection.notes,
      status: inspection.condition,
      timestamp: new Date().toISOString(), // Default timestamp if missing
    })),
  };
}
