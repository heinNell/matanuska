import React from "react";
import { JobCardTask, TaskHistoryEntry } from "../../types";
import { TaskEntry, JobCardItem } from "../../types/workshop-tyre-inventory";

// Component props using both legacy JobCardTask and new TaskEntry types
interface QAReviewPanelProps {
  jobCardId: string;
  tasks: JobCardTask[]; // For backward compatibility
  taskItems?: JobCardItem[]; // New type for enhanced functionality
  taskEntries?: TaskEntry[]; // Alternative new type
  taskHistory?: TaskHistoryEntry[];
  onVerifyTask?: (taskId: string) => Promise<void>;
  canVerifyAllTasks?: boolean;
  onVerifyAllTasks?: () => Promise<void>;
  isLoading?: boolean;
}

/**
 * QA Review Panel Component
 * Allows supervisors to verify completed tasks and manage quality control
 */
const QAReviewPanel: React.FC<QAReviewPanelProps> = ({
  tasks,
  onVerifyTask,
  canVerifyAllTasks = false,
  onVerifyAllTasks,
  isLoading = false
}) => {
  // Calculate stats for the panel
  const completedTasksCount = tasks.filter((task) => task.status === "completed").length;
  const verifiedTasksCount = tasks.filter((task) => task.status === "verified").length;
  const totalTasksCount = tasks.length;

  // Filter for tasks that need verification
  const tasksNeedingVerification = tasks.filter(
    (task) => task.status === "completed"
  );

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Supervisor Quality Assurance
      </h3>

      {/* QA stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-50 p-3 rounded-md text-center">
          <div className="text-2xl font-bold text-blue-700">{completedTasksCount}</div>
          <div className="text-sm text-blue-600">Completed</div>
        </div>
        <div className="bg-green-50 p-3 rounded-md text-center">
          <div className="text-2xl font-bold text-green-700">{verifiedTasksCount}</div>
          <div className="text-sm text-green-600">Verified</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-md text-center">
          <div className="text-2xl font-bold text-gray-700">{totalTasksCount}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
      </div>

      {/* Tasks needing verification */}
      {tasksNeedingVerification.length > 0 ? (
        <div>
          <h4 className="font-medium text-md mb-2">Tasks Ready for Verification</h4>
          <div className="space-y-2 mb-4">
            {tasksNeedingVerification.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <div>
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-gray-600">{task.assignedTo || "Unassigned"}</div>
                </div>
                <button
                  onClick={() => onVerifyTask && onVerifyTask(task.id)}
                  disabled={isLoading}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  Verify
                </button>
              </div>
            ))}
          </div>

          {/* Verify all button */}
          {canVerifyAllTasks && (
            <button
              onClick={() => onVerifyAllTasks && onVerifyAllTasks()}
              disabled={isLoading || tasksNeedingVerification.length === 0}
              className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {isLoading ? "Processing..." : `Verify All Tasks (${tasksNeedingVerification.length})`}
            </button>
          )}
        </div>
      ) : (
        <div className="text-center p-4 bg-gray-50 rounded-md">
          <p className="text-gray-600">No tasks currently need verification</p>
        </div>
      )}
    </div>
  );
};

export default QAReviewPanel;
