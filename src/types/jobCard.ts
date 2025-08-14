// ——— Shared enums ———
export type JobCardCategory =
  | "preventive_maintenance"
  | "corrective_maintenance"
  | "inspection_followup"
  | "safety_repair"
  | "emergency_repair"
  | "tyre_service"
  | "body_repair";

export type VehicleType = "truck" | "trailer" | "reefer" | "ldv" | "bus";
export type Priority = "low" | "medium" | "high" | "urgent";
export type Severity = "low" | "moderate" | "high" | "critical";
export type JobStatus = "new" | "in_progress" | "completed" | "invoiced";
export type TaskStatus = "pending" | "in_progress" | "completed" | "verified";

export type SkillCode =
  | "mechanic_lvl1"
  | "mechanic_lvl2"
  | "electrician"
  | "tyre_specialist"
  | "body_repair_tech"
  | "qa_inspector";

export type SafetyTag =
  | "lockout_tagout"
  | "wheel_chocks"
  | "jack_stands"
  | "ppe_gloves"
  | "ppe_eye_protection"
  | "hot_work"
  | "working_at_height";

// ——— Reusable structures ———
export interface PartRef {
  partId: string;
  name?: string;
  quantity: number;
  isRequired?: boolean;
}

export interface QACheckItem {
  id: string;
  label: string;
  required: boolean;
  metricKey?: string;
  acceptMin?: number;
  acceptMax?: number;
}

// ——— JobCard Template System ———
export interface TaskTemplate {
  id: string;
  title: string;
  description?: string;
  category?: JobCardCategory;
  estimatedHours?: number;
  severity?: Severity;
  isCritical?: boolean;
  requiredSkills?: SkillCode[];
  safetyTags?: SafetyTag[];
  partsKit?: PartRef[];
  qaChecklist?: QACheckItem[];
  dependsOnTaskIds?: string[];
  includeWhenExpr?: string;
}

export interface ApplicabilityRules {
  vehicleTypes: VehicleType[];
  odometerIntervalKm?: number;
  timeIntervalDays?: number;
  minMileageKm?: number;
  maxMileageKm?: number;
  makeWhitelist?: string[];
  modelWhitelist?: string[];
  fleetWhitelist?: string[];
}

export interface SLA {
  targetHoursToStart?: number;
  targetHoursToClose?: number;
  breachPriorityUpgrade?: boolean;
}

export interface KPIGuards {
  maxLaborHours?: number;
  maxPartsCost?: number;
  maxTotalCost?: number;
}

export interface JobCardTemplateMeta {
  version: number;
  active: boolean;
  createdBy: string;
  createdAtISO: string;
  updatedAtISO?: string;
  notes?: string;
  tags?: string[];
}

export interface JobCardTemplate {
  id: string;
  name: string;
  category: JobCardCategory;
  defaultPriority: Priority;
  applicability: ApplicabilityRules;
  sla?: SLA;
  kpi?: KPIGuards;
  estimatedDurationHours?: number;
  tasks: TaskTemplate[];
  meta: JobCardTemplateMeta;
}

// ——— JobCard Instance Types ———
export interface JobCard {
  id: string;
  workOrderNumber: string;
  vehicleId: string;
  customerName: string;
  priority: Priority;
  status: JobStatus;
  createdDate: string;
  scheduledDate?: string;
  assignedTo?: string;
  estimatedCompletion?: string;
  workDescription?: string;
  estimatedHours?: number;
  laborRate?: number;
  partsCost?: number;
  totalEstimate?: number;
  notesCount?: number;
  faultId?: string;
  templateRef?: { id: string; version: number };
  createdBy?: string;
}

export interface JobCardTask {
  id: string;
  jobCardId: string;
  title: string;
  description?: string;
  category?: JobCardCategory;
  estimatedHours?: number;
  status: TaskStatus;
  assignedTo?: string;
  isCritical?: boolean;
  parts?: { partName: string; quantity: number; isRequired?: boolean }[];
  requiredSkills?: SkillCode[];
  safetyTags?: SafetyTag[];
  qaChecklist?: QACheckItem[];
  dependsOnTaskIds?: string[];
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface TaskHistoryEntry {
  id: string;
  jobCardId: string;
  taskId?: string;
  event: string;
  by: string;
  at: string;
  notes?: string;
}

export interface Note {
  id: string;
  jobCardId: string;
  text: string;
  createdBy: string;
  createdAt: string;
  type: "general" | "technician" | "customer" | "internal";
}

export interface AssignedPart {
  id: string;
  jobCardId: string;
  itemId: string;
  quantity: number;
  assignedAt: string;
  assignedBy: string;
  status: "assigned" | "used" | "returned";
}

// ——— Utilities ———
export function computeTemplateHours(t: JobCardTemplate): number {
  if (typeof t.estimatedDurationHours === "number") return t.estimatedDurationHours;
  return t.tasks.reduce((sum, task) => sum + (task.estimatedHours ?? 0), 0);
}

export function validateTemplate(t: JobCardTemplate): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const task of t.tasks) {
    if (ids.has(task.id)) errors.push(`Duplicate task id: ${task.id}`);
    ids.add(task.id);
  }
  for (const task of t.tasks) {
    (task.dependsOnTaskIds ?? []).forEach((dep) => {
      if (!ids.has(dep)) errors.push(`Task ${task.id} depends on missing task ${dep}`);
    });
  }
  if (t.applicability.vehicleTypes.length === 0) {
    errors.push("Applicability.vehicleTypes cannot be empty");
  }
  return errors;
}

export function instantiateJobCardFromTemplate(opts: {
  template: JobCardTemplate;
  vehicleId: string;
  workOrderNumber: string;
  assignedTo?: string;
  customerName?: string;
  createdBy: string;
}) {
  const { template, vehicleId, workOrderNumber, assignedTo, customerName, createdBy } = opts;
  const now = new Date().toISOString();
  const estimatedHours = computeTemplateHours(template);

  const jobCard: JobCard = {
    id: "",
    workOrderNumber,
    vehicleId,
    customerName: customerName ?? "Internal Service",
    priority: template.defaultPriority,
    status: "new",
    createdDate: now,
    estimatedHours,
    workDescription: template.name,
    notesCount: 0,
    templateRef: { id: template.id, version: template.meta.version },
    createdBy,
  };

  const tasks: JobCardTask[] = template.tasks.map((tt) => ({
    id: "",
    jobCardId: "",
    title: tt.title,
    description: tt.description,
    category: tt.category,
    estimatedHours: tt.estimatedHours,
    status: "pending",
    assignedTo,
    isCritical: tt.isCritical ?? false,
    parts:
      tt.partsKit?.map((p) => ({
        partName: p.name ?? p.partId,
        quantity: p.quantity,
        isRequired: p.isRequired,
      })) ?? [],
    requiredSkills: tt.requiredSkills,
    safetyTags: tt.safetyTags,
    qaChecklist: tt.qaChecklist,
    dependsOnTaskIds: tt.dependsOnTaskIds,
  }));

  return { jobCard, tasks };
}
