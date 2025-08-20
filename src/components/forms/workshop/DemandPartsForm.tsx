import { Button } from "../../../components/ui/Button";
import { File, Link2, Plus, Save, Trash, Truck, Wrench } from "lucide-react";
import React, { useState } from "react";
import { Card, CardContent } from "../../ui/Card";

export interface DemandPartsFormProps {
  onSubmit?: (data: DemandPartsFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<DemandPartsFormData>;
  workOrderId: string;
  vehicleId: string;
}

export interface DemandPartsFormData {
  id?: string;
  action: string;
  parts: DemandPart[];
  createdDate: string;
  createdTime: string;
  demandBy: string;
  status: "OPEN" | "IN_PROGRESS" | "RECEIVED" | "CANCELLED";
  poId?: string;
  workOrderId?: string;
  vehicleId?: string;
  notes?: string;
  urgency: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
}

interface DemandPart {
  id: string;
  sku: string;
  description: string;
  quantity: number;
  status: "PENDING" | "ORDERED" | "RECEIVED" | "CANCELLED";
}

const getFormattedDate = (): string => {
  return new Date().toISOString().split("T")[0] || '';
};

const getFormattedTime = (): string => {
  const timeParts = new Date().toTimeString().split(" ");
  return timeParts[0]?.substring(0, 5) || '00:00';
};

const DemandPartsForm: React.FC<DemandPartsFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
}) => {
  const [formData, setFormData] = useState<DemandPartsFormData>({
    id: initialData.id || undefined,
    action: initialData.action ?? "",
    parts: initialData.parts && initialData.parts.length > 0 ? initialData.parts : [{ id: crypto.randomUUID(), sku: "", description: "", quantity: 1, status: "PENDING" }],
    createdDate: initialData.createdDate ?? getFormattedDate(),
    createdTime: initialData.createdTime ?? getFormattedTime(),
    demandBy: initialData.demandBy ?? "",
    status: initialData.status ?? "OPEN",
    workOrderId: initialData.workOrderId ?? "",
    vehicleId: initialData.vehicleId ?? "",
    urgency: initialData.urgency ?? "MEDIUM",
    notes: initialData.notes ?? "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPart = () => {
    setFormData((prev) => ({
      ...prev,
      parts: [
        ...prev.parts,
        {
          id: crypto.randomUUID(),
          sku: "",
          description: "",
          quantity: 1,
          status: "PENDING",
        },
      ],
    }));
  };

  const handleRemovePart = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.filter((part) => part.id !== id),
    }));
  };

  const handlePartChange = (id: string, field: keyof DemandPart, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.map((part) => (part.id === id ? { ...part, [field]: value } : part)),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Wrench className="mr-2 h-5 w-5" />
            Demand Parts Form
          </h2>
          <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            {formData.status}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action Required
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="E.g., Repair front brakes, Replace oil filter..."
                value={formData.action}
                onChange={(e) => setFormData((prev) => ({ ...prev, action: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Demanded By</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter name"
                value={formData.demandBy}
                onChange={(e) => setFormData((prev) => ({ ...prev, demandBy: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created Date & Time
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.createdDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, createdDate: e.target.value }))
                  }
                  required
                />
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.createdTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, createdTime: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.urgency}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, urgency: e.target.value as any }))
                }
                required
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="EMERGENCY">EMERGENCY</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Truck className="inline-block mr-1 h-4 w-4" /> Vehicle ID
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter vehicle ID"
                value={formData.vehicleId || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, vehicleId: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <File className="inline-block mr-1 h-4 w-4" /> Work Order Link
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter work order ID"
                value={formData.workOrderId || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, workOrderId: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Link2 className="inline-block mr-1 h-4 w-4" /> PO Link (if available)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Will be filled when PO is created"
                value={formData.poId || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, poId: e.target.value }))}
                disabled={!!formData.poId} // Fixed: use boolean casting
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Required Parts</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddPart}
                icon={<Plus className="w-4 h-4 mr-1" />}
              >
                Add Part
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
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.parts.map((part) => (
                    <tr key={part.id}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Part SKU"
                          value={part.sku}
                          onChange={(e) => handlePartChange(part.id, "sku", e.target.value)}
                          required
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Part description"
                          value={part.description}
                          onChange={(e) => handlePartChange(part.id, "description", e.target.value)}
                          required
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <input
                          type="number"
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          min="1"
                          value={part.quantity}
                          onChange={(e) =>
                            handlePartChange(part.id, "quantity", parseInt(e.target.value) || 1)
                          }
                          required
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <select
                          className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={part.status}
                          onChange={(e) => handlePartChange(part.id, "status", e.target.value)}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="ORDERED">Ordered</option>
                          <option value="RECEIVED">Received</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right text-sm">
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleRemovePart(part.id)}
                          disabled={formData.parts.length <= 1}
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Any additional information about these parts..."
              value={formData.notes || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            />
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
              {isSubmitting ? "Submitting..." : "Submit Demand"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DemandPartsForm;

