import React from "react";
import { CostEntry } from "../../types";
import { formatCurrency } from "../../utils/formatters";
import { PencilIcon, TrashIcon, FileIcon } from "lucide-react";
import { Button } from "../../components/ui/Button";

interface CostListProps {
  costs: CostEntry[];
  onEdit?: (cost: CostEntry) => void;
  onDelete?: (costId: string) => void;
  onViewAttachments?: (cost: CostEntry) => void;
}

const CostList: React.FC<CostListProps> = ({ costs, onEdit, onDelete, onViewAttachments }) => {
  if (!costs || costs.length === 0) {
    return <div className="text-gray-500 italic p-4">No costs recorded</div>;
  }

  const totalCost = costs.reduce((sum, cost) => sum + Number(cost.amount), 0);

  return (
    <div className="w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Category
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Description
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Amount
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
          {costs.map((cost) => (
            <tr key={cost.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {cost.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {cost.notes
                  ? cost.notes.length > 50
                    ? `${cost.notes.substring(0, 50)}...`
                    : cost.notes
                  : "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatCurrency(Number(cost.amount))}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  {onViewAttachments && cost.attachments && cost.attachments.length > 0 && (
                    <Button
                      onClick={() => onViewAttachments(cost)}
                      variant="outline"
                      size="sm"
                      aria-label="View attachments"
                    >
                      <FileIcon className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      onClick={() => onEdit(cost)}
                      variant="outline"
                      size="sm"
                      aria-label="Edit cost"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      onClick={() => onDelete(cost.id)}
                      variant="outline"
                      size="sm"
                      aria-label="Delete cost"
                    >
                      <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          <tr className="bg-gray-50">
            <td
              colSpan={2}
              className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right"
            >
              Total:
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
              {formatCurrency(totalCost)}
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CostList;
