// Base types for the application
export interface Trip {
  id: string;
  fleetUnitId?: string | number; // Wialon tracking unit ID for telematics
  plannedRoute?: {
    origin: string;
    destination: string;
    waypoints: string[];
    coordinates?: { lat: number; lng: number }[];
    estimatedDistance?: number; // km
    estimatedDuration?: number; // minutes
  };
  optimizedRoute?: {
    origin: string;
    destination: string;
    waypoints: string[];
    coordinates?: { lat: number; lng: number }[];
    estimatedDistance?: number; // km
    estimatedDuration?: number; // minutes
    fuelSavings?: number; // liters
    timeSavings?: number; // minutes
    optimizationDate?: string;
  };
  loadPlanId?: string;
  deliveryConfirmationStatus?: "pending" | "confirmed" | "disputed";
  deliveryConfirmationNotes?: string;
  proofOfDeliveryAttachments?: Attachment[];
  actualDeliveryDateTime?: string;
  tripTemplateId?: string;
  fleetUtilizationMetrics?: {
    capacityUtilization: number; // percentage
    fuelEfficiency: number; // km/l
    revenuePerKm: number;
    costPerKm: number;
    idleTime?: number; // hours
  };
  tripProgressStatus?: "booked" | "confirmed" | "loaded" | "in_transit" | "delivered" | "completed";
  quoteConfirmationPdfUrl?: string;
  loadConfirmationPdfUrl?: string;
  fleetNumber: string;
  driverName: string;
  clientName: string;
  clientType: "internal" | "external";
  startDate: string;
  endDate: string;
  route: string;
  description?: string;
  baseRevenue: number;
  revenueCurrency: "USD" | "ZAR";
  distanceKm?: number;
  status: "active" | "completed" | "invoiced" | "paid" | "shipped" | "delivered";
  costs: CostEntry[];
  completedAt?: string;
  completedBy?: string;
  hasInvestigation?: boolean;
  investigationDate?: string;
  investigationNotes?: string;
  editHistory?: TripEditRecord[];
  deletionRecord?: TripDeletionRecord;
  autoCompletedAt?: string;
  autoCompletedReason?: string;

  // NEW: Enhanced Planned vs Actual Timestamps with Validation
  plannedArrivalDateTime?: string;
  plannedOffloadDateTime?: string;
  plannedDepartureDateTime?: string;
  actualArrivalDateTime?: string;
  actualOffloadDateTime?: string;
  actualDepartureDateTime?: string;
  finalArrivalDateTime?: string; // Final confirmed time for invoicing
  finalOffloadDateTime?: string; // Final confirmed time for invoicing
  finalDepartureDateTime?: string; // Final confirmed time for invoicing
  timelineValidated?: boolean; // Whether times have been validated for invoicing
  timelineValidatedBy?: string; // Who validated the timeline
  timelineValidatedAt?: string; // When timeline was validated
  delayReasons?: DelayReason[];

  // NEW: Additional costs before invoicing
  additionalCosts: AdditionalCost[];

  // NEW: Enhanced Invoice and payment tracking
  invoiceNumber?: string;
  invoiceDate?: string;
  invoiceDueDate?: string;
  invoiceSubmittedAt?: string; // When invoice was submitted
  invoiceSubmittedBy?: string; // Who submitted the invoice
  invoiceValidationNotes?: string; // Notes during invoice submission
  paymentStatus: "unpaid" | "partial" | "paid";
  paymentReceivedDate?: string;
  paymentAmount?: number; // Actual amount received
  paymentMethod?: string; // How payment was received
  bankReference?: string; // Bank reference or transaction ID
  lastFollowUpDate?: string;
  followUpHistory: FollowUpRecord[];
  proofOfDelivery?: Attachment[];
  signedInvoice?: Attachment[];

  // NEW: Load timeline tracking
  loadTimelineEvents?: LoadTimelineEvent[];

  // NEW: Shipment tracking
  shippedAt?: string;
  shippedNotes?: string;
  deliveredAt?: string;
  deliveredNotes?: string;
  statusNotes?: string; // Added for storing notes when updating trip status

  // NEW: Metadata and audit trail
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;

  // NEW: Web booking integration
  loadRef?: string; // Reference from web booking system
  webBookingId?: string; // ID from external booking system
  bookingSource?: "manual" | "web" | "api" | "import"; // How the trip was created

  // Additional web import fields (for compatibility)
  importSource?: string; // e.g., "web_book"
  importedVia?: string; // e.g., "enhancedWebBookImport"
  importedAt?: string; // When the trip was imported
  customer?: string; // Alternative to clientName for web imports
}

export interface CostEntry {
  id: string;
  tripId: string;
  category: string;
  subCategory: string;
  amount: number;
  currency: "USD" | "ZAR";
  referenceNumber: string;
  date: string;
  notes?: string;
  attachments: Attachment[];
  isFlagged: boolean;
  flagReason?: string;
  investigationStatus?: "pending" | "in-progress" | "resolved";
  investigationNotes?: string;
  noDocumentReason?: string;
  flaggedAt?: string;
  flaggedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  editHistory?: CostEditRecord[];
  isSystemGenerated?: boolean;
  systemCostType?: "per-km" | "per-day";
  calculationDetails?: string;
}

export interface Attachment {
  id: string;
  costEntryId?: string;
  tripId?: string;
  filename: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  uploadedAt: string;
  fileData?: string;
}

// NEW: Additional Cost Types
export interface AdditionalCost {
  id: string;
  tripId: string;
  description: string;
  costType:
    | "demurrage"
    | "clearing_fees"
    | "toll_charges"
    | "detention"
    | "escort_fees"
    | "storage"
    | "other";
  amount: number;
  currency: "USD" | "ZAR";
  supportingDocuments: Attachment[];
  notes?: string;
  addedAt: string;
  addedBy: string;
  date: string;
}

// NEW: Enhanced Delay Tracking with Severity
export interface DelayReason {
  id: string;
  tripId: string;
  delayType:
    | "border_delays"
    | "breakdown"
    | "customer_not_ready"
    | "paperwork_issues"
    | "weather_conditions"
    | "traffic"
    | "other";
  description: string;
  delayDuration: number; // in hours
  severity: "minor" | "moderate" | "major" | "critical"; // Impact level
  reportedAt: string;
  reportedBy: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

// NEW: Enhanced Follow-up Tracking
export interface FollowUpRecord {
  id: string;
  tripId: string;
  followUpDate: string;
  contactMethod: "call" | "email" | "whatsapp" | "in_person" | "sms";
  responsibleStaff: string;
  responseSummary: string;
  nextFollowUpDate?: string;
  status: "pending" | "completed" | "escalated";
  priority: "low" | "medium" | "high" | "urgent";
  outcome: "no_response" | "promised_payment" | "dispute" | "payment_received" | "partial_payment";
}

// NEW: Invoice Aging with Enhanced Tracking
export interface InvoiceAging {
  tripId: string;
  invoiceNumber: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  currency: "USD" | "ZAR";
  agingDays: number;
  status: "current" | "warning" | "critical" | "overdue";
  paymentStatus: "unpaid" | "partial" | "paid";
  lastFollowUp?: string;
  followUpCount: number;
  riskLevel: "low" | "medium" | "high";
  estimatedPaymentDate?: string;
}

// NEW: Customer Performance with Risk Assessment
export interface CustomerPerformance {
  customerName: string;
  totalTrips: number;
  totalRevenue: number;
  currency: "USD" | "ZAR";
  averagePaymentDays: number;
  paymentScore: number; // 0-100
  lastTripDate: string;
  riskLevel: "low" | "medium" | "high";
  isAtRisk: boolean;
  isProfitable: boolean;
  isTopClient: boolean;
  paymentHistory: PaymentHistoryRecord[];
  serviceFrequencyTrend: "increasing" | "stable" | "decreasing";
  retentionScore: number; // 0-100
}

// NEW: Payment History Tracking
interface PaymentHistoryRecord {
  tripId: string;
  invoiceDate: string;
  dueDate: string;
  paymentDate?: string;
  daysLate: number;
  amount: number;
  currency: "USD" | "ZAR";
}

// NEW: Truck Performance with Utilization
export interface TruckPerformance {
  fleetNumber: string;
  totalKilometers: number;
  totalTrips: number;
  fuelEfficiency: number;
  utilizationRate: number; // percentage
  idleDays: number;
  maintenanceDays: number;
  lastTripDate: string;
  performanceRating: "excellent" | "good" | "average" | "poor";
  revenuePerKm: number;
  costPerKm: number;
}

// NEW: Enhanced Missed Load Tracking - SIMPLIFIED (No Payment Status)
export interface MissedLoad {
  id: string;
  customerName: string;
  loadRequestDate: string;
  requestedPickupDate: string;
  requestedDeliveryDate: string;
  route: string;
  estimatedRevenue: number;
  currency: "USD" | "ZAR";
  reason:
    | "no_vehicle"
    | "late_response"
    | "mechanical_issue"
    | "driver_unavailable"
    | "customer_cancelled"
    | "rate_disagreement"
    | "other";
  reasonDescription?: string;
  resolutionStatus: "pending" | "resolved" | "lost_opportunity" | "rescheduled";
  followUpRequired: boolean;
  competitorWon?: boolean;
  recordedBy: string;
  recordedAt: string;
  impact: "low" | "medium" | "high"; // Business impact

  // NEW: Resolution tracking (not payment)
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  compensationOffered?: number; // If any goodwill compensation was offered
  compensationNotes?: string;
}

// NEW: Diesel Consumption Record with Trip Linkage
export interface DieselConsumptionRecord {
  id: string;
  fleetNumber: string;
  date: string;
  kmReading: number;
  litresFilled: number;
  costPerLitre: number;
  totalCost: number;
  fuelStation: string;
  driverName: string;
  kmPerLitre?: number;
  litresPerHour?: number;
  notes?: string;
  previousKmReading?: number;
  distanceTravelled?: number;
  tripId?: string; // Link to trip for cost allocation
  debriefDate?: string;
  debriefNotes?: string;
  debriefSignedBy?: string;
  debriefSignedAt?: string;
  // --- Probe Verification Fields ---
  probeReading?: number; // For probe verification
  probeDiscrepancy?: number; // Difference between filled and probe
  probeVerified?: boolean;
  rootCause?: string;
  actionTaken?: string;
  probeVerificationNotes?: string;
  probeVerifiedAt?: string;
  probeVerifiedBy?: string;
  updatedAt?: string;
  // --- Reefer/horse fields ---
  isReeferUnit?: boolean;
  hoursOperated?: number;
  linkedHorseId?: string;
  currency?: "USD" | "ZAR";
}

// NEW: Driver Behavior Event Types
export type DriverBehaviorEventType =
  | "speeding"
  | "harsh_braking"
  | "harsh_acceleration"
  | "idling"
  | "route_deviation"
  | "unauthorized_stop"
  | "fatigue_alert"
  | "phone_usage"
  | "seatbelt_violation"
  | "other";

export interface DriverBehaviorEvent {
  id: string;
  driverId: string;
  driverName: string;
  fleetNumber: string;
  eventType: DriverBehaviorEventType;
  severity: "low" | "medium" | "high" | "critical";
  eventDate: string;
  eventTime: string;
  location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  description: string;
  actionTaken?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  followUpNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  tripId?: string;
  reportedBy: string;
  reportedAt: string;
  attachments?: Attachment[];
  // Points for scoring and carReportId for linkage
  points: number; // Making points required with no "?"
  carReportId?: string;
  // Status for event workflow (for UI and logic)
  status: "pending" | "acknowledged" | "resolved" | "disputed"; // Making status required with no "?"
}

// NEW: Action Item Types
export interface ActionItem {
  id: string;
  title: string;
  description: string;
  responsiblePerson: string;
  startDate: string;
  dueDate: string;
  status: "initiated" | "in_progress" | "completed";
  completedAt?: string;
  completedBy?: string;
  overdueReason?: string;
  attachments?: Attachment[];
  comments?: ActionItemComment[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ActionItemComment {
  id: string;
  actionItemId: string;
  comment: string;
  createdBy: string;
  createdAt: string;
}

// NEW: CAR (Corrective Action Report) Types
export interface CARReport {
  id: string;
  carNumber?: string; // Added for report reference number
  reportNumber: string;
  responsibleReporter: string;
  responsiblePerson: string;
  referenceEventId?: string;
  dateOfIncident: string;
  dateDue: string;
  clientReport: string;

  // Status and details
  status: "open" | "inProgress" | "completed" | "cancelled" | "draft" | "submitted" | "in_progress";
  priority: "high" | "medium" | "low";
  severity: "high" | "medium" | "low";

  // Dates
  issueDate: string; // Date the report was issued
  dueDate: string; // When action needs to be completed
  resolutionDate?: string; // When it was resolved

  // People
  issuedBy: string; // Person who issued the report
  verifiedBy?: string; // Person who verified resolution

  // Incident details
  incidentType: string; // Type of incident
  description: string; // Description of incident

  // Root cause analysis
  rootCause?: string; // Root cause of the incident
  contributingFactors?: string; // Factors that contributed

  // Actions taken
  immediateActions?: string; // Immediate actions taken
  correctiveActions: string; // Longer-term corrective actions (removed optional)
  preventativeMeasures?: string; // Preventative measures
  resolutionComments?: string; // Comments on resolution

  // Legacy fields (keeping for backward compatibility)
  problemIdentification: string;
  causeAnalysisPeople: string;
  causeAnalysisMaterials: string;
  causeAnalysisEquipment: string;
  causeAnalysisMethods: string;
  causeAnalysisMetrics: string;
  causeAnalysisEnvironment: string;
  rootCauseAnalysis: string;
  preventativeActionsImmediate: string;
  preventativeActionsLongTerm: string;
  financialImpact: string;
  generalComments: string;

  // Metadata
  completedAt?: string;
  completedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  attachments?: Attachment[];
}

// NEW: Load timeline event
interface LoadTimelineEvent {
  id: string;
  tripId: string;
  eventType:
    | "loading_start"
    | "loading_complete"
    | "departure"
    | "border_crossing"
    | "arrival"
    | "offloading_start"
    | "offloading_complete"
    | "return_journey"
    | "return_arrival";
  timestamp: string;
  location: string;
  notes?: string;
  recordedBy: string;
  recordedAt: string;
}

// NEW: Real-time Sync Types
export interface SyncEvent {
  id: string;
  type: "trip_update" | "cost_update" | "invoice_update" | "payment_update" | "system_update";
  entityId: string;
  entityType: "trip" | "cost" | "invoice" | "payment";
  action: "create" | "update" | "delete";
  data: any;
  timestamp: string;
  userId: string;
  version: number;
}

export interface AppVersion {
  version: string;
  deployedAt: string;
  features: string[];
  forceReload: boolean;
}

export interface FlaggedCost extends CostEntry {
  tripFleetNumber: string;
  tripRoute: string;
  tripDriverName: string;
}

export interface Driver {
  id: string;
  name: string;
  totalTrips: number;
  totalInvestigations: number;
  totalFlags: number;
  performanceScore: number;
}

// System Cost Configuration Types
export interface SystemCostRates {
  currency: "USD" | "ZAR";
  perKmCosts: {
    repairMaintenance: number;
    tyreCost: number;
  };
  perDayCosts: {
    gitInsurance: number;
    shortTermInsurance: number;
    trackingCost: number;
    fleetManagementSystem: number;
    licensing: number;
    vidRoadworthy: number;
    wages: number;
    depreciation: number;
  };
  lastUpdated: string;
  updatedBy: string;
  effectiveDate: string;
}

export interface SystemCostReminder {
  id: string;
  nextReminderDate: string;
  lastReminderDate?: string;
  reminderFrequencyDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Audit Trail Types
export interface TripEditRecord {
  id: string;
  tripId: string;
  editedBy: string;
  editedAt: string;
  reason: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  changeType: "update" | "status_change" | "completion" | "auto_completion";
}

interface CostEditRecord {
  id: string;
  costId: string;
  editedBy: string;
  editedAt: string;
  reason: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  changeType: "update" | "flag_status" | "investigation";
}

export interface TripDeletionRecord {
  id: string;
  tripId: string;
  deletedBy: string;
  deletedAt: string;
  reason: string;
  tripData: string;
  totalRevenue: number;
  totalCosts: number;
  costEntriesCount: number;
  flaggedItemsCount: number;
}

// User Permission Types

export interface UserPermission {
  action:
    | "create_trip"
    | "edit_trip"
    | "delete_trip"
    | "complete_trip"
    | "edit_completed_trip"
    | "delete_completed_trip"
    | "manage_investigations"
    | "view_reports"
    | "manage_system_costs";
  granted: boolean;
}
export type NoUserPermissionAllowed = never;

// NEW: Trip Template interface for pre-defined trip configurations
export interface TripTemplate {
  id: string;
  name: string;
  description?: string;
  defaultFleetNumber: string;
  defaultDriverName: string;
  defaultRoute: string;
  defaultDistanceKm?: number;
  defaultBaseRevenue?: number;
  defaultRevenueCurrency: "USD" | "ZAR";
  defaultClientName: string;
  defaultClientType: "internal" | "external";
  defaultCosts?: Partial<CostEntry>[];
  plannedRoute?: {
    origin: string;
    destination: string;
    waypoints: string[];
  };
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

// NEW: Load Plan interface for cargo planning and optimization
export interface LoadPlan {
  id: string;
  tripId: string;
  vehicleCapacity: {
    weight: number; // kg
    volume: number; // cubic meters
    length?: number; // meters
    width?: number; // meters
    height?: number; // meters
  };
  cargoItems: {
    id: string;
    description: string;
    weight: number; // kg
    volume: number; // cubic meters
    quantity: number;
    stackable: boolean;
    hazardous: boolean;
    category: string;
    priorityLevel: "low" | "medium" | "high";
  }[];
  loadingSequence?: string[]; // IDs of cargo items in loading order
  optimizedArrangement?: string; // JSON string of 3D arrangement or reference to external data
  axleWeightDistribution?: {
    frontAxle: number; // kg
    rearAxle: number; // kg
    trailerAxles: number[]; // kg per axle
  };
  utilisationRate?: number; // percentage
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

// NEW: Trip Route Point interface for detailed route information
export interface RoutePoint {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  type: "origin" | "destination" | "waypoint" | "rest_stop" | "border_crossing" | "fuel_stop";
  estimatedArrivalTime?: string;
  estimatedDepartureTime?: string;
  actualArrivalTime?: string;
  actualDepartureTime?: string;
  notes?: string;
  border?: {
    name: string;
    estimatedCrossingTime: number; // minutes
    requiredDocuments: string[];
    fees: { description: string; amount: number; currency: "USD" | "ZAR" }[];
  };
}

// NEW: Trip Financial Analysis interface
export interface TripFinancialAnalysis {
  tripId: string;
  revenueSummary: {
    baseRevenue: number;
    additionalRevenue: number;
    totalRevenue: number;
    currency: "USD" | "ZAR";
  };
  costBreakdown: {
    fuelCosts: number;
    borderCosts: number;
    driverAllowance: number;
    maintenanceCosts: number;
    tollFees: number;
    miscellaneousCosts: number;
    totalCosts: number;
  };
  profitAnalysis: {
    grossProfit: number;
    grossProfitMargin: number; // percentage
    netProfit: number;
    netProfitMargin: number; // percentage
    returnOnInvestment: number; // percentage
  };
  perKmMetrics: {
    revenuePerKm: number;
    costPerKm: number;
    profitPerKm: number;
  };
  comparisonMetrics?: {
    industryAvgCostPerKm: number;
    companyAvgCostPerKm: number;
    variance: number; // percentage
  };
  calculatedAt: string;
}

// Constants for form options
export const CLIENTS = [
  "Teralco",
  "SPF",
  "Deep Catch",
  "DS Healthcare",
  "HFR",
  "Aspen",
  "DP World",
  "FX Logistics",
  "Feedmix",
  "ETG",
  "National Foods",
  "Mega Market",
  "Crystal Candy",
  "Trade Clear Logistics",
  "Steainweg",
  "Agrouth",
  "Emmands",
  "Falcon Gate",
  "FreightCo",
  "Tarondale",
  "Makandi",
  "FWZCargo",
  "Kroots",
  "Crake Valley",
  "Cains",
  "Big Dutcheman",
  "Jacobs",
  "Jacksons",
  "Pacibrite",
  "Vector",
  "Du-roi",
  "Sunside Seedlings",
  "Massmart",
  "Dacher (Pty) Ltd.",
  "Shoprite",
  "Lesaffre",
  "Westfalia",
  "Everfresh",
  "Rezende Retail",
  "Rezende Retail Vendor",
  "Rezende Vendor",
  "Bulawayo Retail",
  "Bulawayo Retail Vendor",
  "Bulawayo Vendor",
];

export const DRIVERS = [
  "Enock Mukonyerwa",
  "Jonathan Bepete",
  "Lovemore Qochiwe",
  "Peter Farai",
  "Phillimon Kwarire",
  "Taurayi Vherenaisi",
  "Adrian Moyo",
  "Canaan Chipfurutse",
  "Doctor Kondwani",
  "Biggie Mugwa",
  "Luckson Tanyanyiwa",
  "Wellington Musumbu",
  "Decide Murahwa",
];

export const FLEET_NUMBERS = [
  "4H",
  "6H",
  "UD",
  "29H",
  "30H",
  "21H",
  "22H",
  "23H",
  "24H",
  "26H",
  "28H",
  "31H",
  "32H",
  "33H",
];

// NEW: Responsible Persons for Action Items and CAR Reports
export const RESPONSIBLE_PERSONS = [
  "Fleet Manager",
  "Operations Manager",
  "Safety Officer",
  "Maintenance Supervisor",
  "Driver Supervisor",
  "Quality Assurance Manager",
  "Compliance Officer",
  "HR Manager",
  "Finance Manager",
  "General Manager",
  "Enock Mukonyerwa",
  "Jonathan Bepete",
  "Lovemore Qochiwe",
  "Peter Farai",
  "Phillimon Kwarire",
  "Taurayi Vherenaisi",
  "Adrian Moyo",
  "Canaan Chipfurutse",
  "Doctor Kondwani",
  "Biggie Mugwa",
  "Luckson Tanyanyiwa",
  "Wellington Musumbu",
  "Decide Murahwa",
];

// NEW: Trucks with fuel probes for diesel monitoring
export const TRUCKS_WITH_PROBES = [
  "4H",
  "6H",
  "UD",
  "29H",
  "30H",
  "21H",
  "22H",
  "23H",
  "24H",
  "26H",
  "28H",
  "31H",
  "32H",
  "33H",
];

export const CLIENT_TYPES = [
  { value: "internal", label: "Internal Client" },
  { value: "external", label: "External Client" },
];

// NEW: Additional Cost Types
export const ADDITIONAL_COST_TYPES = [
  { value: "demurrage", label: "Demurrage" },
  { value: "clearing_fees", label: "Clearing Fees" },
  { value: "toll_charges", label: "Toll Charges" },
  { value: "detention", label: "Detention" },
  { value: "escort_fees", label: "Escort Fees" },
  { value: "storage", label: "Storage" },
  { value: "other", label: "Other" },
];

// NEW: Enhanced Delay Reason Types
export const DELAY_REASON_TYPES = [
  { value: "border_delays", label: "Border Delays" },
  { value: "breakdown", label: "Breakdown" },
  { value: "customer_not_ready", label: "Customer Not Ready" },
  { value: "paperwork_issues", label: "Paperwork Issues" },
  { value: "weather_conditions", label: "Weather Conditions" },
  { value: "traffic", label: "Traffic" },
  { value: "other", label: "Other" },
];

// NEW: Contact Methods
// (Removed unused CONTACT_METHODS to resolve compile error)

// NEW: Enhanced Missed Load Reasons
export const MISSED_LOAD_REASONS = [
  { value: "no_vehicle", label: "No Vehicle Available" },
  { value: "late_response", label: "Late Response" },
  { value: "mechanical_issue", label: "Mechanical Issue" },
  { value: "driver_unavailable", label: "Driver Unavailable" },
  { value: "customer_cancelled", label: "Customer Cancelled" },
  { value: "rate_disagreement", label: "Rate Disagreement" },
  { value: "other", label: "Other" },
];

// NEW: Driver Behavior Event Types
export const DRIVER_BEHAVIOR_EVENT_TYPES = [
  { value: "speeding", label: "Speeding", severity: "medium", points: 5 },
  { value: "harsh_braking", label: "Harsh Braking", severity: "medium", points: 3 },
  { value: "harsh_acceleration", label: "Harsh Acceleration", severity: "medium", points: 3 },
  { value: "idling", label: "Excessive Idling", severity: "low", points: 1 },
  { value: "route_deviation", label: "Route Deviation", severity: "medium", points: 4 },
  { value: "unauthorized_stop", label: "Unauthorized Stop", severity: "medium", points: 4 },
  { value: "fatigue_alert", label: "Fatigue Alert", severity: "high", points: 8 },
  { value: "phone_usage", label: "Phone Usage While Driving", severity: "high", points: 10 },
  { value: "seatbelt_violation", label: "Seatbelt Violation", severity: "high", points: 7 },
  { value: "other", label: "Other", severity: "medium", points: 2 },
];

// Workshop and Job Card Types
export interface JobCard {
  id: string;
  workOrderNumber: string;
  vehicleId: string;
  customerName: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "parts_pending" | "completed" | "closed";
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
  tasks: JobCardTask[];
  totalLaborHours: number;
  totalPartsValue: number;
  notes: string;
  faultIds: string[];
  attachments: string[];
  remarks: string[];
  inspectionId?: string;
}

export interface JobCardTask {
  id: string;
  title: string;
  description?: string;
  category: string;
  estimatedHours: number;
  actualHours?: number;
  status: "pending" | "in_progress" | "completed" | "verified" | "not_applicable";
  assignedTo?: string;
  notes?: string;
  completedBy?: string;
  completedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  parts?: {
    partName: string;
    quantity: number;
    isRequired: boolean;
  }[];
  isCritical: boolean;
}

// Task history log entry
export interface TaskHistoryEntry {
  id: string;
  taskId: string;
  event: "statusChanged" | "assigned" | "verified" | "edited";
  previousStatus?: string;
  newStatus?: string;
  by: string;
  at: string;
  notes?: string;
}

// Invoice type for job card invoicing
export interface Invoice {
  id: string;
  invoiceNumber: string;
  jobCardId: string;
  vehicleId: string;
  customerName: string;
  issuedDate: string;
  dueDate: string;
  items: InvoiceItem[];
  laborCost: number;
  partsCost: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  status: "unpaid" | "partial" | "paid";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  itemType: "part" | "labor" | "service" | "other";
}

// Fleet vehicle type
export interface FleetVehicle {
  fleetNumber: string;
  registration: string;
  make: string;
  model: string;
  chassisNo: string;
  engineNo?: string;
  vin?: string;
  year?: string;
  vehicleType: string;
  status: string;
  odometer?: number;
  assignedDriver?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// NEW: CAR Report Types
export const CAR_INCIDENT_TYPES = [
  { value: "accident", label: "Accident" },
  { value: "traffic_violation", label: "Traffic Violation" },
  { value: "customer_complaint", label: "Customer Complaint" },
  { value: "equipment_damage", label: "Equipment Damage" },
  { value: "policy_violation", label: "Policy Violation" },
  { value: "safety_incident", label: "Safety Incident" },
  { value: "other", label: "Other" },
];

// STRUCTURED COST CATEGORIES & SUB-COST TYPES
export const COST_CATEGORIES = {
  "Border Costs": [
    "Beitbridge Border Fee",
    "Gate Pass",
    "Coupon",
    "Carbon Tax Horse",
    "CVG Horse",
    "CVG Trailer",
    "Insurance (1 Month Horse)",
    "Insurance (3 Months Trailer)",
    "Insurance (2 Months Trailer)",
    "Insurance (1 Month Trailer)",
    "Carbon Tax (3 Months Horse)",
    "Carbon Tax (2 Months Horse)",
    "Carbon Tax (1 Month Horse)",
    "Carbon Tax (3 Months Trailer)",
    "Carbon Tax (2 Months Trailer)",
    "Carbon Tax (1 Month Trailer)",
    "Road Access",
    "Bridge Fee",
    "Road Toll Fee",
    "Counseling Leavy",
    "Transit Permit Horse",
    "Transit Permit Trailer",
    "National Road Safety Fund Horse",
    "National Road Safety Fund Trailer",
    "Electronic Seal",
    "EME Permit",
    "Zim Clearing",
    "Zim Supervision",
    "SA Clearing",
    "Runner Fee Beitbridge",
    "Runner Fee Zambia Kazungula",
    "Runner Fee Chirundu",
  ],
  Parking: [
    "Bubi",
    "Lunde",
    "Mvuma",
    "Gweru",
    "Kadoma",
    "Chegutu",
    "Norton",
    "Harare",
    "Ruwa",
    "Marondera",
    "Rusape",
    "Mutare",
    "Nyanga",
    "Bindura",
    "Shamva",
    "Centenary",
    "Guruve",
    "Karoi",
    "Chinhoyi",
    "Kariba",
    "Hwange",
    "Victoria Falls",
    "Bulawayo",
    "Gwanda",
    "Beitbridge",
    "Masvingo",
    "Zvishavane",
    "Shurugwi",
    "Kwekwe",
  ],
  Diesel: [
    "ACM Petroleum Chirundu - Reefer",
    "ACM Petroleum Chirundu - Horse",
    "RAM Petroleum Harare - Reefer",
    "RAM Petroleum Harare - Horse",
    "Engen Beitbridge - Reefer",
    "Engen Beitbridge - Horse",
    "Shell Mutare - Reefer",
    "Shell Mutare - Horse",
    "BP Bulawayo - Reefer",
    "BP Bulawayo - Horse",
    "Total Gweru - Reefer",
    "Total Gweru - Horse",
    "Puma Masvingo - Reefer",
    "Puma Masvingo - Horse",
    "Zuva Petroleum Kadoma - Reefer",
    "Zuva Petroleum Kadoma - Horse",
    "Mobil Chinhoyi - Reefer",
    "Mobil Chinhoyi - Horse",
    "Caltex Kwekwe - Reefer",
    "Caltex Kwekwe - Horse",
  ],
  "Non-Value-Added Costs": [
    "Fines",
    "Penalties",
    "Passport Stamping",
    "Push Documents",
    "Jump Queue",
    "Dismiss Inspection",
    "Parcels",
    "Labour",
  ],
  "Trip Allowances": ["Food", "Airtime", "Taxi"],
  Tolls: [
    "Tolls BB to JHB",
    "Tolls Cape Town to JHB",
    "Tolls JHB to CPT",
    "Tolls Mutare to BB",
    "Tolls JHB to Martinsdrift",
    "Tolls BB to Harare",
    "Tolls Zambia",
  ],
  "System Costs": [
    "Repair & Maintenance per KM",
    "Tyre Cost per KM",
    "GIT Insurance",
    "Short-Term Insurance",
    "Tracking Cost",
    "Fleet Management System",
    "Licensing",
    "VID / Roadworthy",
    "Wages",
    "Depreciation",
  ],
};

export const DEFAULT_SYSTEM_COST_RATES: Record<"USD" | "ZAR", SystemCostRates> = {
  USD: {
    currency: "USD",
    perKmCosts: {
      repairMaintenance: 0.11,
      tyreCost: 0.03,
    },
    perDayCosts: {
      gitInsurance: 10.21,
      shortTermInsurance: 7.58,
      trackingCost: 2.47,
      fleetManagementSystem: 1.34,
      licensing: 1.32,
      vidRoadworthy: 0.41,
      wages: 16.88,
      depreciation: 321.17,
    },
    lastUpdated: new Date().toISOString(),
    updatedBy: "System Default",
    effectiveDate: new Date().toISOString(),
  },
  ZAR: {
    currency: "ZAR",
    perKmCosts: {
      repairMaintenance: 2.05,
      tyreCost: 0.64,
    },
    perDayCosts: {
      gitInsurance: 134.82,
      shortTermInsurance: 181.52,
      trackingCost: 49.91,
      fleetManagementSystem: 23.02,
      licensing: 23.52,
      vidRoadworthy: 11.89,
      wages: 300.15,
      depreciation: 634.45,
    },
    lastUpdated: new Date().toISOString(),
    updatedBy: "System Default",
    effectiveDate: new Date().toISOString(),
  },
};

export const DEFAULT_SYSTEM_COST_REMINDER: SystemCostReminder = {
  id: "reminder-001",
  nextReminderDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  reminderFrequencyDays: 30,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Edit Reason Templates
export const TRIP_EDIT_REASONS = [
  "Correction of data entry error",
  "Client requested change",
  "Route modification due to operational requirements",
  "Revenue adjustment per contract amendment",
  "Distance correction based on actual route",
  "Driver change due to operational needs",
  "Date adjustment for accurate reporting",
  "Client type classification update",
  "Other (specify in comments)",
];

export const TRIP_DELETION_REASONS = [
  "Duplicate entry",
  "Trip cancelled before execution",
  "Data entry error - trip never occurred",
  "Merged with another trip record",
  "Client contract cancellation",
  "Regulatory compliance requirement",
  "Other (specify in comments)",
];

// NEW: Trip Template Categories
export const TRIP_TEMPLATE_CATEGORIES = [
  { value: "standard_delivery", label: "Standard Delivery" },
  { value: "cross_border", label: "Cross Border" },
  { value: "specialized", label: "Specialized Cargo" },
  { value: "regular_route", label: "Regular Route" },
  { value: "contract", label: "Contract Route" },
];

// NEW: Load Categories
export const LOAD_CATEGORIES = [
  { value: "general_cargo", label: "General Cargo" },
  { value: "perishable", label: "Perishable Goods" },
  { value: "hazardous", label: "Hazardous Materials" },
  { value: "fragile", label: "Fragile Items" },
  { value: "oversized", label: "Oversized Cargo" },
  { value: "refrigerated", label: "Refrigerated" },
  { value: "bulk", label: "Bulk Materials" },
  { value: "containers", label: "Containers" },
];

export type TripFormData = Omit<Trip, "id" | "status" | "costs" | "distanceKm" | "baseRevenue"> & {
  distanceKm: string;
  baseRevenue: string;
};

export * from "./audit.d";

// NEW: Invoice Aging Thresholds
export const AGING_THRESHOLDS = {
  ZAR: {
    current: { min: 0, max: 20, color: "green" },
    warning: { min: 21, max: 29, color: "yellow" },
    critical: { min: 30, max: 30, color: "orange" },
    overdue: { min: 31, max: Infinity, color: "red" },
  },
  USD: {
    current: { min: 0, max: 10, color: "green" },
    warning: { min: 11, max: 13, color: "yellow" },
    critical: { min: 14, max: 14, color: "orange" },
    overdue: { min: 15, max: Infinity, color: "red" },
  },
};

// NEW: Follow-up Alert Thresholds
export const FOLLOW_UP_THRESHOLDS = {
  ZAR: 20, // days
  USD: 12, // days
};

// NEW: Timeline Validation Statuses
// (Removed unused TIMELINE_VALIDATION_STATUSES to resolve compile error)

// NEW: Invoice Submission Statuses
// (Removed unused INVOICE_SUBMISSION_STATUSES to resolve compile error)

export const FLEETS_WITH_PROBES = ["21H", "22H", "23H", "24H", "26H", "28H", "30H", "31H"];

// Tyre related types for tyre management module
export interface TyreInspection {
  id?: string;
  fleetNumber: string;
  tyrePosition: string;
  treadDepth: number;
  pressure: number;
  visualCondition: string;
  comments?: string;
  inspectedAt: string;
  inspectedBy?: string;
}

export interface TyreInventory {
  id?: string;
  brand: string;
  model: string;
  dot: string;
  tyreType: "Steer" | "Drive" | "Trailer" | "Spare";
  tyreSize: string;
  pressureRating: number;
  initialTreadDepth: number;
  currentTreadDepth?: number;
  vendor: string;
  purchaseCostZAR: number;
  purchaseCostUSD: number;
  depotLocation: string;
  status: "In Stock" | "Fitted" | "Scrapped" | "Under Warranty";
  installedOn?: string; // Fleet number if fitted
  position?: string; // Position on vehicle if fitted
  installDate?: string;
  removalDate?: string;
  inspectionHistory?: TyreInspection[];
}

export const FUEL_STATIONS = [
  "Kwa Nokeng Martins Drift",
  "MBT Groblersbrug",
  "Kwa Nokeng Francistown",
  "Engen Francistown",
  "Tswana Fuel Francistown",
  "Kwa Nokeng Kazungula",
  "Engen Kazungula",
  "Tswana Fuel Kazungula",
  "African Truck Stop",
  "Quest Beaufort West",
  "Fuel 1 Retail BElville",
  "Fuel 1 Kraaifontein",
  "Engen Truck Stop Beaufort West",
  "Alliance Fuel Louis Trichardt",
  "Stadler Beaufort West",
  "Industry Petroleum (Pty) Ltd Musina",
  "Black Rock Fuels Modimolle",
  "Ipex Filling Station (PTY)",
  "Royale Energy Polokwane",
  "BF Filling StationPolokwane",
  "OILCO Musina",
  "MOJ Petroleum Musina",
  "Comar",
  "Lesedi",
  "Shell Ultra City Limpopo Musina",
  "Whelson Harare Zimbabwe Supergroup SA",
  "Harare Truck Stop",
  "RAM Petroleum Harare",
  "Whelson Chirundu Zimbabwe Supergroup SA",
  "Clix Auto Logistics Bulawayo",
  "Karan Investments LDA Bulawayo",
  "ACM Petroleum Chirundu",
  "Red Range",
  "Mutare Depot",
  "Nyamagay Depot",
  "Burma Valey",
  "Lake Petroleum Kabwe",
  "Lake Petroleum Ndola",
  "Lake Petroleum Kitwe",
  "Lake Petroleum Chililabombwe",
  "Lake Petroleum Lusaka",
  "Korridor Truck Stops (Zambia)",
  "Korridor Kapiri Mposhi Truck Stop",
  "Korridor Chingola Truck Stop",
  "Korridor Kafue Truck Stop",
  "Korridor Livingstone Truck Stop",
  "Korridor Lusaka Truck Stop",
  "HASS Petroleum Kasumbalesa",
];

// Additional types for ActiveTripsPageEnhanced
export interface CostBreakdown {
  fuelCosts: number;
  tollFees: number;
  maintenanceCosts: number;
  driverExpenses: number;
  overheadCosts: number;
  total: number;
  currency: string;
  // Legacy properties for compatibility
  fuel?: number;
  maintenance?: number;
  driver?: number;
  tolls?: number;
  other?: number;
}

export type ImportSource = "manual" | "wialon" | "gps" | "rfid" | "barcode";

export type SupportedCurrency = "ZAR" | "USD" | "EUR" | "GBP";

export interface UITrip extends Trip {
  displayStatus: string;
  displayRevenue: string;
  displayCurrency: string;
  origin?: string;
  destination?: string;
  externalId?: string;
  totalCost?: number;
  costBreakdown?: any;
  startTime?: string;
  endTime?: string;
  shippedStatus?: boolean;
  deliveredStatus?: boolean;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface DriverFormData {
  id?: string;
  name: string;
  licenseNumber: string;
  contactNumber: string;
  email?: string;
  emergencyContact?: string;
  dateOfBirth?: string;
  hireDate?: string;
  status: "active" | "inactive" | "suspended";
}

// In your types file (e.g., src/types/index.ts)
export interface DieselConsumptionRecord {
  // ... existing properties ...
  probeVerificationNotes?: string;
  witnessName?: string;
  photoEvidenceUrl?: string;
  photoEvidenceName?: string;
  // ... other properties ...
}
