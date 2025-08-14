import { CheckCircle, Edit, FileText, Link, Trash2 } from "lucide-react";
import React from "react";
import { ExtendedDieselConsumptionRecord } from "../../types/types";
import { formatCurrency, formatDate } from "../../utils/helpers";

interface DieselRecordsCardsProps {
  records: ExtendedDieselConsumptionRecord[];
  onEdit: (record: ExtendedDieselConsumptionRecord) => void;
  onDelete: (recordId: string) => void;
  onDebrief: (record: ExtendedDieselConsumptionRecord) => void;
  onVerify: (record: ExtendedDieselConsumptionRecord) => void;
  onLink: (record: ExtendedDieselConsumptionRecord) => void;
  isDeleting: Record<string, boolean>;
}

const DieselRecordsCards: React.FC<DieselRecordsCardsProps> = ({
  records,
  onEdit,
  onDelete,
  onDebrief,
  onVerify,
  onLink,
  isDeleting,
}) => {
  const formatNumber = (num: number, decimals = 2) => {
    return num.toFixed(decimals);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {records.map((record) => (
        <div
          key={record.id}
          className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-lg">{record.vehicleId || "Unknown Vehicle"}</div>
                <div className="text-sm text-gray-600">
                  {record.timestamp ? formatDate(record.timestamp) : "N/A"}
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  record.verified
                    ? "bg-green-100 text-green-800"
                    : record.flagged
                      ? "bg-red-100 text-red-800"
                      : record.tripId
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                }`}
              >
                {record.verified
                  ? "Verified"
                  : record.flagged
                    ? "Flagged"
                    : record.tripId
                      ? "Linked"
                      : "Unprocessed"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Liters</div>
                <div className="text-lg font-medium">
                  {record.liters !== undefined ? `${formatNumber(record.liters)} L` : "N/A"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Cost</div>
                <div className="text-lg font-medium">
                  {record.cost !== undefined ? formatCurrency(record.cost) : "N/A"}
                </div>
                <div className="text-xs text-gray-500">
                  {record.cost !== undefined && record.liters && record.liters > 0
                    ? `${formatCurrency(record.cost / record.liters)}/L`
                    : "N/A"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Odometer</div>
                <div className="text-lg font-medium">
                  {record.odometer !== undefined ? `${formatNumber(record.odometer, 0)} km` : "N/A"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Location</div>
                <div className="text-base truncate">{record.location || "N/A"}</div>
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <div className="flex space-x-1">
                <button
                  onClick={() => onEdit(record)}
                  className="p-1 text-gray-600 hover:text-indigo-600"
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => onDebrief(record)}
                  className="p-1 text-gray-600 hover:text-blue-600"
                  title="Debrief"
                >
                  <FileText size={18} />
                </button>
                <button
                  onClick={() => onVerify(record)}
                  className={`p-1 ${
                    record.verified ? "text-green-600" : "text-gray-600 hover:text-green-600"
                  }`}
                  title="Verify with Probe"
                >
                  <CheckCircle size={18} />
                </button>
                <button
                  onClick={() => onLink(record)}
                  className={`p-1 ${
                    record.tripId ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                  }`}
                  title={record.tripId ? "View Linked Trip" : "Link to Trip"}
                >
                  <Link size={18} />
                </button>
              </div>
              <button
                onClick={() => onDelete(record.id)}
                disabled={isDeleting[record.id]}
                className="p-1 text-gray-600 hover:text-red-600"
                title="Delete"
              >
                <Trash2 size={18} className={isDeleting[record.id] ? "animate-pulse" : ""} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DieselRecordsCards;
