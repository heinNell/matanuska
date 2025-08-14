import { AlertTriangle, Calendar, Clock, Truck, User } from "lucide-react";
import React from "react";
import { formatDate } from "../../utils/helpers";
import { Button } from "@/components/ui/Button";

interface JobCardHeaderProps {
  jobCard: {
    id: string;
    workOrderNumber: string;
    vehicleId: string;
    customerName: string;
    priority: "low" | "medium" | "high" | "critical";
    status: string;
    createdDate: string;
    scheduledDate?: string;
    assignedTo?: string;
    estimatedCompletion?: string;
    inspectionId?: string;
  };
  onEdit?: () => void;
  onAssign?: () => void;
  onPrint?: () => void;
  onBack?: () => void;
}

const JobCardHeader: React.FC<JobCardHeaderProps> = ({
  jobCard,
  onEdit,
  onAssign,
  onPrint,
  onBack,
}) => {
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
      case "created":
      case "assigned":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "parts_pending":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDisplay = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center">
            {onBack && (
              <Button variant="outline" size="sm" className="mr-2" onClick={onBack}>
                ←
              </Button>
            )}
            <h1 className="text-xl font-bold text-gray-900">Job Card: {jobCard.workOrderNumber}</h1>
          </div>
          <div className="flex items-center mt-1 space-x-2">
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityClass(jobCard.priority)}`}
            >
              {jobCard.priority.toUpperCase()} PRIORITY
            </span>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusClass(jobCard.status)}`}
            >
              {getStatusDisplay(jobCard.status)}
            </span>
            {jobCard.inspectionId && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                FROM INSPECTION
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onAssign && !jobCard.assignedTo && (
            <Button variant="primary" size="sm" onClick={onAssign}>
              Assign
            </Button>
          )}
          {onPrint && (
            <Button variant="outline" size="sm" onClick={onPrint}>
              Print
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center space-x-2">
          <Truck className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Vehicle</p>
            <p className="font-medium">{jobCard.vehicleId}</p>
          </div>
        </div>

        {jobCard.assignedTo && (
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Assigned To</p>
              <p className="font-medium">{jobCard.assignedTo}</p>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Created</p>
            <p className="font-medium">{formatDate(jobCard.createdDate)}</p>
          </div>
        </div>

        {jobCard.scheduledDate && (
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Scheduled Date</p>
              <p className="font-medium">{formatDate(jobCard.scheduledDate)}</p>
            </div>
          </div>
        )}

        {jobCard.estimatedCompletion && (
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Estimated Completion</p>
              <p className="font-medium">{jobCard.estimatedCompletion}</p>
            </div>
          </div>
        )}
      </div>

      {jobCard.priority === "critical" && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Critical Priority Job</p>
            <p className="text-sm text-red-600">
              This job requires immediate attention and should be prioritized above other work.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCardHeader;
