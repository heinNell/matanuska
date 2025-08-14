/**
 * Example integration of Task History system in Context
 *
 * This demonstrates how to integrate the task history utilities
 * throughout your application context for consistent logging.
 */

import { createContext, ReactNode, useContext } from "react";
import {
  logStatusChange,
  logTaskAssignment,
  logTaskEdit,
  logTaskVerification,
} from "../utils/taskHistory";

interface TaskHistoryContextType {
  // Job Card Status Changes
  logJobStatusChange: (
    jobId: string,
    oldStatus: string,
    newStatus: string,
    by: string
  ) => Promise<void>;

  // Task Assignment
  logTaskAssigned: (
    jobId: string,
    assignedTo: string,
    by: string,
    taskDetails?: string
  ) => Promise<void>;

  // Task Verification
  logTaskVerified: (jobId: string, by: string, taskDetails?: string) => Promise<void>;

  // General Updates
  logTaskUpdated: (jobId: string, by: string, changeDetails: string) => Promise<void>;

  // Parts Management
  logPartAssigned: (jobId: string, partName: string, quantity: number, by: string) => Promise<void>;
  logPartRemoved: (jobId: string, partName: string, by: string) => Promise<void>;

  // Work Progress
  logWorkStarted: (jobId: string, taskName: string, by: string) => Promise<void>;
  logWorkCompleted: (jobId: string, taskName: string, by: string) => Promise<void>;

  // Quality Assurance
  logQACheck: (
    jobId: string,
    result: "passed" | "failed",
    by: string,
    notes?: string
  ) => Promise<void>;

  // Invoice Generation
  logInvoiceGenerated: (jobId: string, invoiceNumber: string, by: string) => Promise<void>;
}

const TaskHistoryContext = createContext<TaskHistoryContextType | undefined>(undefined);

export const useTaskHistoryContext = () => {
  const context = useContext(TaskHistoryContext);
  if (!context) {
    throw new Error("useTaskHistoryContext must be used within a TaskHistoryProvider");
  }
  return context;
};

interface TaskHistoryProviderProps {
  children: ReactNode;
}

export const TaskHistoryProvider: React.FC<TaskHistoryProviderProps> = ({ children }) => {
  const logJobStatusChange = async (
    jobId: string,
    oldStatus: string,
    newStatus: string,
    by: string
  ) => {
    await logStatusChange(
      jobId,
      oldStatus,
      newStatus,
      by,
      `Job status changed from ${oldStatus} to ${newStatus}`
    );
  };

  const logTaskAssigned = async (
    jobId: string,
    assignedTo: string,
    by: string,
    taskDetails?: string
  ) => {
    await logTaskAssignment(jobId, assignedTo, by, taskDetails || `Task assigned to ${assignedTo}`);
  };

  const logTaskVerified = async (jobId: string, by: string, taskDetails?: string) => {
    await logTaskVerification(jobId, by, taskDetails || "Task verified by supervisor");
  };

  const logTaskUpdated = async (jobId: string, by: string, changeDetails: string) => {
    await logTaskEdit(jobId, by, changeDetails);
  };

  const logPartAssigned = async (jobId: string, partName: string, quantity: number, by: string) => {
    await logTaskEdit(jobId, by, `Assigned ${quantity}x ${partName}`);
  };

  const logPartRemoved = async (jobId: string, partName: string, by: string) => {
    await logTaskEdit(jobId, by, `Removed part: ${partName}`);
  };

  const logWorkStarted = async (jobId: string, taskName: string, by: string) => {
    await logStatusChange(jobId, "pending", "in_progress", by, `Started work on: ${taskName}`);
  };

  const logWorkCompleted = async (jobId: string, taskName: string, by: string) => {
    await logStatusChange(jobId, "in_progress", "completed", by, `Completed work on: ${taskName}`);
  };

  const logQACheck = async (
    jobId: string,
    result: "passed" | "failed",
    by: string,
    notes?: string
  ) => {
    await logTaskVerification(jobId, by, `QA Check ${result}${notes ? ": " + notes : ""}`);
  };

  const logInvoiceGenerated = async (jobId: string, invoiceNumber: string, by: string) => {
    await logTaskEdit(jobId, by, `Invoice generated: ${invoiceNumber}`);
  };

  const value: TaskHistoryContextType = {
    logJobStatusChange,
    logTaskAssigned,
    logTaskVerified,
    logTaskUpdated,
    logPartAssigned,
    logPartRemoved,
    logWorkStarted,
    logWorkCompleted,
    logQACheck,
    logInvoiceGenerated,
  };

  return <TaskHistoryContext.Provider value={value}>{children}</TaskHistoryContext.Provider>;
};

/**
 * USAGE EXAMPLES:
 *
 * // In your main App component:
 * <TaskHistoryProvider>
 *   <YourApp />
 * </TaskHistoryProvider>
 *
 * // In any component:
 * const { logJobStatusChange, logTaskAssigned } = useTaskHistoryContext();
 *
 * // When updating job status:
 * await logJobStatusChange('job123', 'pending', 'in_progress', 'John Doe');
 *
 * // When assigning a task:
 * await logTaskAssigned('job123', 'Jane Smith', 'John Doe', 'Brake pad replacement');
 *
 * // When parts are assigned:
 * await logPartAssigned('job123', 'Brake Pads - Front', 2, 'John Doe');
 *
 * // When work is completed:
 * await logWorkCompleted('job123', 'Brake System Inspection', 'Jane Smith');
 */
