import { useCallback } from "react";

/** -------------------------------------------
 *  Temporary types (replace with your app types)
 *  If you have '@/types/action-log' and '@/types/trip', import them and delete these.
 *  ------------------------------------------- */
export type ActionType = "CREATE" | "UPDATE" | "DELETE" | "VIEW" | string;

export type EntityType =
  | "TRIP"
  | "JOB_CARD"
  | "INSPECTION"
  | "TYRE"
  | "INVOICE"
  | "EXPENSE"
  | "FUEL_ENTRY"
  | "USER"
  | string;

export type ActionCategory =
  | "OPERATIONS"
  | "MAINTENANCE"
  | "FINANCIAL"
  | "SYSTEM"
  | "SECURITY"
  | string;

export interface DriverBehaviorEvent {
  driverId: string;
  timestamp: string | Date;
  type: "HARSH_BRAKING" | "HARSH_ACCEL" | "SPEEDING" | "IDLING" | "FATIGUE" | string;
  value?: number;
  location?: { lat: number; lng: number };
  tripId?: string;
  notes?: string;
  severity?: "low" | "medium" | "high" | "critical";
}

/** -------------------------------------------
 *  Logger interface + safe default implementation
 *  ------------------------------------------- */
export interface IActionLogger {
  logAction: (params: {
    action: ActionType;
    entityType: EntityType;
    entityId: string;
    entityName?: string;
    description: string;
    details?: Record<string, unknown>;
    severity?: "low" | "medium" | "high" | "critical";
    category: ActionCategory;
    relatedEntityId?: string;
    relatedEntityType?: EntityType;
  }) => void;

  logDriverBehaviorEvent: (
    action: ActionType,
    event: DriverBehaviorEvent,
    additionalDetails?: Record<string, unknown>
  ) => void;
}

// No-op console logger so the app never crashes if you don't pass a backend logger.
const defaultLogger: IActionLogger = {
  logAction: (params) => {
    // eslint-disable-next-line no-console
    console.log("[ActionLog]", params);
  },
  logDriverBehaviorEvent: (action, event, additionalDetails) => {
    // eslint-disable-next-line no-console
    console.log("[DriverEventLog]", { action, event, additionalDetails });
  },
};

/** -------------------------------------------
 *  Hook
 *  ------------------------------------------- */
export function useActionLogger(deps?: { logger?: IActionLogger }) {
  const logger = deps?.logger ?? defaultLogger;

  const logAction = useCallback(
    (params: {
      action: ActionType;
      entityType: EntityType;
      entityId: string;
      entityName?: string;
      description: string;
      details?: Record<string, unknown>;
      severity?: "low" | "medium" | "high" | "critical";
      category: ActionCategory;
      relatedEntityId?: string;
      relatedEntityType?: EntityType;
    }) => {
      logger.logAction(params);
    },
    [logger]
  );

  const logDriverEvent = useCallback(
    (
      action: ActionType, // "CREATE" | "UPDATE" | "DELETE" | "VIEW"
      event: DriverBehaviorEvent,
      additionalDetails?: Record<string, unknown>
    ) => {
      logger.logDriverBehaviorEvent(action, event, additionalDetails);
    },
    [logger]
  );

  const logTripAction = useCallback(
    (action: ActionType, tripId: string, tripName: string, details?: Record<string, unknown>) => {
      const actionLower = String(action).toLowerCase();
      logger.logAction({
        action,
        entityType: "TRIP",
        entityId: tripId,
        entityName: tripName,
        description: `Trip ${actionLower}: ${tripName}`,
        details,
        category: "OPERATIONS",
        severity: "medium",
      });
    },
    [logger]
  );

  const logMaintenanceAction = useCallback(
    (
      action: ActionType,
      entityType: "JOB_CARD" | "INSPECTION" | "TYRE",
      entityId: string,
      entityName: string,
      details?: Record<string, unknown>
    ) => {
      const actionLower = String(action).toLowerCase();
      const entityLabel = entityType.replace(/_/g, " ").toLowerCase();
      logger.logAction({
        action,
        entityType,
        entityId,
        entityName,
        description: `${entityLabel} ${actionLower}: ${entityName}`,
        details,
        category: "MAINTENANCE",
        severity: "medium",
      });
    },
    [logger]
  );

  const logFinancialAction = useCallback(
    (
      action: ActionType,
      entityType: "INVOICE" | "EXPENSE" | "FUEL_ENTRY",
      entityId: string,
      entityName: string,
      amount?: number,
      details?: Record<string, unknown>
    ) => {
      const actionLower = String(action).toLowerCase();
      const entityLabel = entityType.replace(/_/g, " ").toLowerCase();
      logger.logAction({
        action,
        entityType,
        entityId,
        entityName,
        description: `${entityLabel} ${actionLower}: ${entityName}${amount ? ` ($${amount})` : ""}`,
        details: { amount, ...details },
        category: "FINANCIAL",
        severity: "medium",
      });
    },
    [logger]
  );

  const logSystemAction = useCallback(
    (
      action: ActionType,
      description: string,
      details?: Record<string, unknown>,
      severity: "low" | "medium" | "high" | "critical" = "low"
    ) => {
      logger.logAction({
        action,
        entityType: "USER",
        entityId: "system",
        description,
        details,
        category: "SYSTEM",
        severity,
      });
    },
    [logger]
  );

  return {
    logAction,
    logDriverEvent,
    logTripAction,
    logMaintenanceAction,
    logFinancialAction,
    logSystemAction,
  };
}
export default useActionLogger;
