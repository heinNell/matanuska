import { Button } from "../../../components/ui/Button";
import { Box, Calendar, FileText, Info, Plus, Save, Trash } from "lucide-react";
import React, { useState } from "react";
import { Card, CardContent } from "../../ui/Card";

interface PartToReceive {
  id: string;
  sku: string;
  description: string;
  orderQuantity: number;
  receivingQuantity: number;
  serialNumber?: string;
  isSerial: boolean;
  notes?: string;
  poNumber?: string;
  status: "pending" | "received" | "partial" | "damaged";
}

interface PartsReceivingFormProps {
  poNumber?: string;
  onSubmit?: (data: PartToReceive[]) => void;
  onCancel?: () => void;
  initialData?: PartToReceive[];
  isLoading?: boolean;
}

const PartsReceivingForm: React.FC<PartsReceivingFormProps> = ({
  poNumber = "",
  onSubmit,
  onCancel,
  initialData = [],
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parts, setParts] = useState<PartToReceive[]>(
    initialData.length > 0
      ? initialData
      : [
          {
            id: "1",
            sku: "",
            description: "",
            orderQuantity: 0,
            receivingQuantity: 0,
            isSerial: false,
            status: "pending",
            poNumber,
          },
        ]
  );
  const [currentDate] = useState(new Date().toISOString().split("T")[0]);

  // Add new part entry
  const handleAddPart = () => {
    setParts([
      ...parts,
      {
        id: Date.now().toString(),
        sku: "",
        description: "",
        orderQuantity: 0,
        receivingQuantity: 0,
        isSerial: false,
        status: "pending",
        poNumber,
      },
    ]);
  };

  // Remove part entry
  const handleRemovePart = (id: string) => {
    setParts(parts.filter((part) => part.id !== id));
  };

  // Update part field value
  const handlePartChange = (id: string, field: keyof PartToReceive, value: any) => {
    setParts(
      parts.map((part) => {
        if (part.id === id) {
          // Special handling for receiving quantity
          if (field === "receivingQuantity") {
            const receivingQty = parseInt(value) || 0;
            let status: "pending" | "received" | "partial" | "damaged" = part.status;

            // Auto update status based on quantity
            if (receivingQty === 0) {
              status = "pending";
            } else if (receivingQty < part.orderQuantity) {
              status = "partial";
            } else if (receivingQty === part.orderQuantity) {
              status = "received";
            }

            return { ...part, [field]: value, status };
          }

          // Handle serial number checkbox
          if (field === "isSerial" && !value) {
            return { ...part, [field]: value, serialNumber: undefined };
          }

          return { ...part, [field]: value };
        }
        return part;
      })
    );
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      if (onSubmit) {
        onSubmit(parts);
      }
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Box className="mr-2 h-5 w-5" />
            Parts Receiving Form
          </h2>

          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{currentDate}</span>
            {poNumber && (
              <>
                <FileText className="h-4 w-4 text-gray-500 ml-3" />
                <span>PO: {poNumber}</span>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Items to Receive</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddPart}
                icon={<Plus className="w-4 h-4 mr-1" />}
              >
                Add Item
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      SKU
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Order Qty
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Receiving Qty
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Serial #
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parts.map((part) => (
                    <tr key={part.id}>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="SKU"
                          value={part.sku}
                          onChange={(e) => handlePartChange(part.id, "sku", e.target.value)}
                          required
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Description"
                          value={part.description}
                          onChange={(e) => handlePartChange(part.id, "description", e.target.value)}
                          required
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          className="w-20 text-center px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="0"
                          min="0"
                          value={part.orderQuantity}
                          onChange={(e) =>
                            handlePartChange(
                              part.id,
                              "orderQuantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          required
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          className="w-20 text-center px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="0"
                          min="0"
                          value={part.receivingQuantity}
                          onChange={(e) =>
                            handlePartChange(
                              part.id,
                              "receivingQuantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          required
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center space-x-2">
                          <input
                            type="checkbox"
                            checked={part.isSerial}
                            onChange={(e) =>
                              handlePartChange(part.id, "isSerial", e.target.checked)
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          {part.isSerial && (
                            <input
                              type="text"
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="S/N"
                              value={part.serialNumber || ""}
                              onChange={(e) =>
                                handlePartChange(part.id, "serialNumber", e.target.value)
                              }
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={part.status}
                          onChange={(e) => handlePartChange(part.id, "status", e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="received">Received</option>
                          <option value="partial">Partial</option>
                          <option value="damaged">Damaged</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleRemovePart(part.id)}
                          disabled={parts.length <= 1}
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={2}
                placeholder="Any notes about the received parts..."
              />
            </div>

            <div className="mt-4 bg-blue-50 p-3 rounded-md flex items-start">
              <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <p className="text-sm text-blue-700">
                Please verify all part numbers and quantities before confirming receipt. Mark any
                damaged items with the "Damaged" status and add notes about the condition.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              icon={<Save className="w-4 h-4 mr-2" />}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Confirm Receipt"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PartsReceivingForm;
