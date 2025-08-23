import { Button } from "../../components/ui/Button";
import { CheckCircle, Clock, FileText, Shield, User } from "lucide-react";
import React from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { JobCardTask, TaskHistoryEntry } from "../../types";
import { formatDateTime } from "../../utils/helpers";

interface QAReviewPanelProps {
  tasks: JobCardTask[];
  taskHistory: TaskHistoryEntry[];
  onVerifyTask: (taskId: string) => Promise<void>;
  canVerifyAllTasks: boolean;
  onVerifyAllTasks: () => Promise<void>;
  isLoading?: boolean;
}

const QAReviewPanel: React.FC<QAReviewPanelProps> = ({
  tasks,
  taskHistory,
  onVerifyTask,
  canVerifyAllTasks,
  onVerifyAllTasks,
  isLoading = false,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "verified":
        return <Shield className="w-4 h-4 text-purple-600" />;
      case "not_applicable":
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "verified":
        return "bg-purple-100 text-purple-800";
      case "not_applicable":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Calculate stats
  const completedTasksCount = tasks.filter((task) => task.status === "completed").length;
  const verifiedTasksCount = tasks.filter((task) => task.status === "verified").length;
  const notApplicableTasksCount = tasks.filter((task) => task.status === "not_applicable").length;
  const tasksReadyForVerification = tasks.filter(
    (task) => task.status === "completed" && task.completedBy && task.completedAt
  ).length;

  return (
    <Card>
      <CardHeader title="Supervisor Quality Assurance" />
      <CardContent>
        <div className="space-y-6">
          {/* QA Stats */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-md font-medium text-gray-800 mb-3">Verification Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">Total Tasks</p>
                <p className="text-lg font-bold text-gray-900">{tasks.length}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-lg font-bold text-green-600">{completedTasksCount}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <p className="text-xs text-gray-500">Verified</p>
                <p className="text-lg font-bold text-purple-600">{verifiedTasksCount}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-500">Ready for Verification</p>
                <p className="text-lg font-bold text-blue-600">{tasksReadyForVerification}</p>
              </div>
            </div>
          </div>

          {/* Tasks awaiting verification */}
          {tasksReadyForVerification > 0 ? (
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-3">
                Tasks Ready for Verification
              </h3>
              <div className="space-y-3">
                {tasks
                  .filter((task) => task.status === "completed")
                  .map((task) => (
                    <div key={task.id} className="bg-white border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 flex items-center">
                            {getStatusIcon(task.status)}
                            <span className="ml-2">{task.title}</span>
                            {task.isCritical && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                CRITICAL
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {task.category} • {task.estimatedHours}h estimated
                          </p>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(task.status)}`}
                        >
                          {task.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded p-2 mb-3">
                        <div className="flex items-center text-sm">
                          <User className="w-4 h-4 text-green-600 mr-1" />
                          <span className="text-green-700">
                            Completed by <strong>{task.completedBy}</strong> on{" "}
                            {formatDateTime(task.completedAt || "")}
                          </span>
                        </div>
                      </div>

                      {task.notes && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">Notes:</p>
                          <p className="text-sm text-gray-600">{task.notes}</p>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => onVerifyTask(task.id)}
                          disabled={isLoading}
                          icon={<Shield className="w-4 h-4" />}
                        >
                          Verify Task
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>

              {canVerifyAllTasks && (
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={onVerifyAllTasks}
                    disabled={isLoading || tasksReadyForVerification === 0}
                    isLoading={isLoading}
                    icon={<Shield className="w-4 h-4" />}
                  >
                    Verify All Tasks
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-md font-medium text-gray-800 mb-1">
                No Tasks Ready for Verification
              </h3>
              <p className="text-sm text-gray-500">
                {completedTasksCount + verifiedTasksCount + notApplicableTasksCount === tasks.length
                  ? "All tasks have been verified or marked as not applicable."
                  : "Tasks must be marked as completed by technicians before they can be verified."}
              </p>
            </div>
          )}

          {/* Task History */}
          {taskHistory.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-3">Task History Log</h3>
              <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
                {taskHistory.map((entry) => {
                  // Get the task information
                  const task = tasks.find((t) => t.id === entry.taskId);

                  return (
                    <div key={entry.id} className="p-3 hover:bg-gray-50">
                      <div className="flex items-start text-sm">
                        <div className="min-w-32 text-gray-500">{formatDateTime(entry.at)}</div>
                        <div className="flex-grow">
                          <p className="text-gray-900">
                            <span className="font-medium">{entry.by}</span>{" "}
                            {entry.event === "statusChanged" && (
                              <>
                                changed status from{" "}
                                <span className="font-medium">{entry.previousStatus}</span> to{" "}
                                <span className="font-medium">{entry.newStatus}</span>
                              </>
                            )}
                            {entry.event === "assigned" && (
                              <>
                                assigned to <span className="font-medium">{entry.newStatus}</span>
                              </>
                            )}
                            {entry.event === "verified" && <>verified task</>}
                            {entry.event === "edited" && <>edited task</>}
                          </p>
                          {entry.notes && <p className="text-gray-600 mt-1">{entry.notes}</p>}
                          <p className="text-gray-500 mt-1">
                            Task: {task?.title || "Unknown Task"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QAReviewPanel;
