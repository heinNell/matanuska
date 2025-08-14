import React from "react";
import { ExtendedDieselConsumptionRecord } from "../../types/types";
import { formatCurrency, formatDate } from "../../utils/helpers";

interface DieselRecordsTableProps {
  records: ExtendedDieselConsumptionRecord[];
  onSort: (key: keyof ExtendedDieselConsumptionRecord) => void;
  sortConfig: { key: keyof ExtendedDieselConsumptionRecord; direction: "ascending" | "descending" };
  onEdit: (record: ExtendedDieselConsumptionRecord) => void;
  onDelete: (recordId: string) => void;
  onDebrief: (record: ExtendedDieselConsumptionRecord) => void;
  onVerify: (record: ExtendedDieselConsumptionRecord) => void;
  onLink: (record: ExtendedDieselConsumptionRecord) => void;
  isDeleting: Record<string, boolean>;
}

const DieselRecordsTable: React.FC<DieselRecordsTableProps> = ({
  records,
  onSort,
  sortConfig,
  onEdit,
  onDelete,
  onDebrief,
  onVerify,
  onLink,
  isDeleting,
}) => {
  const getSortIndicator = (key: keyof ExtendedDieselConsumptionRecord) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? " ▲" : " ▼";
    }
    return "";
  };

  const formatNumber = (num: number, decimals = 2) => {
    return num.toFixed(decimals);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort("vehicleId")}
            >
              Fleet Number {getSortIndicator("vehicleId")}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort("timestamp")}
            >
              Date {getSortIndicator("timestamp")}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort("liters")}
            >
              Liters {getSortIndicator("liters")}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort("cost")}
            >
              Cost {getSortIndicator("cost")}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort("odometer")}
            >
              Odometer {getSortIndicator("odometer")}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{record.vehicleId}</div>
                <div className="text-xs text-gray-500">
                  {record.location || "Location not available"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record.timestamp ? formatDate(record.timestamp) : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.liters !== undefined ? `${formatNumber(record.liters)} L` : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.cost !== undefined ? formatCurrency(record.cost) : "N/A"}
                <div className="text-xs text-gray-500">
                  {record.cost !== undefined && record.liters && record.liters > 0
                    ? `${formatCurrency(record.cost / record.liters)}/L`
                    : "N/A"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.odometer !== undefined ? `${formatNumber(record.odometer, 0)} km` : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
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
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onEdit(record)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDebrief(record)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Debrief
                  </button>
                  <button
                    onClick={() => onVerify(record)}
                    className={`${
                      record.verified
                        ? "text-green-600 hover:text-green-900"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {record.verified ? "Verified" : "Verify"}
                  </button>
                  <button
                    onClick={() => onLink(record)}
                    className={`${
                      record.tripId
                        ? "text-blue-600 hover:text-blue-900"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {record.tripId ? "Trip" : "Link"}
                  </button>
                  <button
                    onClick={() => onDelete(record.id)}
                    disabled={isDeleting[record.id]}
                    className="text-red-600 hover:text-red-900"
                  >
                    {isDeleting[record.id] ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DieselRecordsTable;
