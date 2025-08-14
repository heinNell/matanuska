import { CheckCircle, Clock, Edit, User, UserCheck } from "lucide-react";
import React from "react";
import { useTaskHistory } from "../../hooks/useTaskHistory";
import { TaskHistoryEntry } from "../../types";

interface TaskHistoryListProps {
  taskId: string;
  className?: string;
}

const TaskHistoryList: React.FC<TaskHistoryListProps> = ({ taskId, className = "" }) => {
  const { history, loading, error } = useTaskHistory(taskId);

  const getEventIcon = (event: TaskHistoryEntry["event"]) => {
    switch (event) {
      case "statusChanged":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "assigned":
        return <User className="w-4 h-4 text-green-500" />;
      case "verified":
        return <UserCheck className="w-4 h-4 text-purple-500" />;
      case "edited":
        return <Edit className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventDescription = (entry: TaskHistoryEntry) => {
    switch (entry.event) {
      case "statusChanged":
        return `Status changed from "${entry.previousStatus}" to "${entry.newStatus}"`;
      case "assigned":
        return "Task assigned";
      case "verified":
        return "Task verified by supervisor";
      case "edited":
        return "Task details updated";
      default:
        return "Unknown event";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className={`bg-white shadow rounded-lg p-4 ${className}`}>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Task History
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white shadow rounded-lg p-4 ${className}`}>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Task History
        </h3>
        <div className="text-red-500 text-sm">Error loading history: {error}</div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow rounded-lg p-4 ${className}`}>
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Task History
      </h3>

      {history.length === 0 ? (
        <div className="text-gray-500 text-sm text-center py-8">
          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          No history yet. Actions will appear here as they happen.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
            >
              <div className="mt-0.5">{getEventIcon(entry.event)}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">
                  {getEventDescription(entry)}
                </div>
                {entry.notes && <div className="text-sm text-gray-600 mt-1">{entry.notes}</div>}
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {entry.by} • {formatTimestamp(entry.at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskHistoryList;
