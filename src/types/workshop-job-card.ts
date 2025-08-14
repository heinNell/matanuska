export interface JobCardItem {
  id: string;
  type: 'repair' | 'maintenance' | 'inspection';
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'deferred';
  assignedTo?: string;
  estimatedHours?: number;
  actualHours?: number;
  parts?: {
    id: string;
    name: string;
    partNumber: string;
    quantity: number;
    unitCost: number;
  }[];
  notes?: string;
  images?: string[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobCard {
  id: string;
  vehicleId: string;
  vehicleRegNumber?: string;
  jobNumber?: string;
  workOrderNumber?: string;
  inspectionId?: string;
  customerName: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  reportedIssues?: string;
  items: JobCardItem[];
  mileage?: number;
  scheduledDate?: string;
  completionDate?: string;
  mechanicNotes?: string;
  customerNotes?: string;
  createdDate: string;
  createdAt?: string;
  estimatedCompletion?: string;
  laborRate?: number;
  partsCost?: number;
}

// ==== Enhanced Workshop Job Card Interfaces ====

/**
 * Work order basic information
 */
export interface WorkOrderInfo {
  workOrderNumber: string;
  date: string;
  title: string;
  createdBy: string;
}

/**
 * Vehicle details and current status
 */
export interface VehicleAssetDetails {
  vehicleNumber: string;
  vehicleName: string;
  model: string;
  meterReading: number;
  status: 'initiated' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'general' | 'maintenance' | 'repair' | 'inspection' | 'emergency';
  assignedTo: string;
}

/**
 * Links to related inspection records or work orders
 */
export interface LinkedRecords {
  linkedInspection?: string;
  linkedWorkorder?: string;
}

/**
 * Information about job scheduling and time tracking
 */
export interface SchedulingInfo {
  startDate: string;
  dueDate: string;
  completionDate?: string;
  estimatedCost?: number;
  estimatedTimeHours?: number;
  actualTimeHours?: number;
}

/**
 * Details of a specific task within the job card
 */
export interface TaskDetail {
  sn: number;
  task: string;
  status: 'initiated' | 'in_progress' | 'completed' | 'cancelled';
  type: 'replace' | 'repair' | 'inspect' | 'service' | 'other';
  assigned?: string;
  note?: string;
}

/**
 * Information about parts and materials used
 */
export interface PartsAndMaterial {
  sn: number;
  itemNumber?: string;
  itemName: string;
  quantity: number;
  totalCost: number;
  note?: string;
}

/**
 * Details about labor performed
 */
export interface LaborDetail {
  sn: number;
  laborName: string;
  laborCode: string;
  rate: number;
  hours: string;
  cost: number;
  note?: string;
}

/**
 * Additional costs beyond parts and labor
 */
export interface AdditionalCost {
  sn: number;
  costDescription: string;
  cost: number;
}

/**
 * Summary of all costs for the job
 */
export interface CostSummary {
  partsMaterialCost: number;
  totalLaborCost: number;
  additionalCost: number;
  taxAmount: number;
  taxRate: number;
  totalWOCost: number;
}

/**
 * Custom business fields for job-specific information
 */
export interface CustomBusinessField {
  fieldName: string;
  fieldValue: string;
}

/**
 * Comprehensive job card interface with detailed sections for
 * all aspects of workshop operations
 */
export interface EnhancedJobCard {
  id: string;
  workOrderInfo: WorkOrderInfo;
  vehicleAssetDetails: VehicleAssetDetails;
  linkedRecords: LinkedRecords;
  schedulingInfo: SchedulingInfo;
  taskDetails: TaskDetail[];
  partsAndMaterials: PartsAndMaterial[];
  laborDetails: LaborDetail[];
  additionalCosts: AdditionalCost[];
  costSummary: CostSummary;
  customBusinessFields: CustomBusinessField[];
  workOrderMemo: string;
  createdAt: string;
  updatedAt: string;
}