import { AlertTriangle, Calendar, Truck, User } from "lucide-react";
import React from "react";
import { formatDate } from "../../utils/helpers";

interface JobCardProps {
  jobCard: {
    id: string;
    workOrderNumber: string;
    fleetNumber: string;
    title: string;
    status: string;
    priority: string;
    assignedTo?: string;
    createdAt: string;
    dueDate?: string;
    completedAt?: string;
  };
}

const JobCardCard: React.FC<JobCardProps> = ({ jobCard }) => {
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">{jobCard.workOrderNumber}</h3>
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityClass(jobCard.priority)}`}
        >
          {jobCard.priority.toUpperCase()}
        </span>
      </div>

      <p className="text-xs text-gray-700 line-clamp-2 mb-2">{jobCard.title}</p>

      <div className="flex items-center text-xs text-gray-500 mb-2">
        <Truck className="w-3 h-3 mr-1" />
        <span>Fleet {jobCard.fleetNumber}</span>
      </div>

      {jobCard.assignedTo && (
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <User className="w-3 h-3 mr-1" />
          <span>{jobCard.assignedTo}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="w-3 h-3 mr-1" />
          <span>
            {jobCard.status === "completed" && jobCard.completedAt
              ? `Completed: ${formatDate(jobCard.completedAt)}`
              : jobCard.dueDate
                ? `Due: ${formatDate(jobCard.dueDate)}`
                : `Created: ${formatDate(jobCard.createdAt)}`}
          </span>
        </div>

        <span
          className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusClass(jobCard.status)}`}
        >
          {jobCard.status.replace("_", " ").toUpperCase()}
        </span>
      </div>

      {jobCard.dueDate &&
        new Date(jobCard.dueDate) < new Date() &&
        jobCard.status !== "completed" &&
        jobCard.status !== "closed" && (
          <div className="mt-2 flex items-center text-xs text-red-600">
            <AlertTriangle className="w-3 h-3 mr-1" />
            <span>Overdue</span>
          </div>
        )}
    </div>
  );
};

export default JobCardCard;
