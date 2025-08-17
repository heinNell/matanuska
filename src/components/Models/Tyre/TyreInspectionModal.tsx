import { Button } from "../../../components/ui/Button";
import { Card, CardContent } from "../../../components/ui/Card";
import Modal from "../../../components/ui/Modal";
import React, { useState } from "react";

interface TyreInspectionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TyreInspectionData) => void;
  tyrePosition: string;
  fleetNumber: string;
  initialData?: Partial<TyreInspectionData>;
}

export interface TyreInspectionData {
  fleetNumber: string;
  position: string;
  tyreBrand?: string;
  tyreSize?: string;
  treadDepth?: number | string;
  pressure?: number | string;
  condition?: string;
  notes?: string;
  inspectorName?: string;
  odometer?: number | string;
  photo?: string | null;
  signature?: string | null;
  inspectionDate?: string;
  lastUpdated?: string;
}

const TyreInspectionModal: React.FC<TyreInspectionModalProps> = ({
  open,
  onClose,
  onSubmit,
  tyrePosition,
  fleetNumber,
  initialData = {},
}) => {
  const [formData, setFormData] = useState<TyreInspectionData>({
    fleetNumber,
    position: tyrePosition,
    tyreBrand: initialData.tyreBrand || "",
    tyreSize: initialData.tyreSize || "",
    treadDepth: initialData.treadDepth || "",
    pressure: initialData.pressure || "",
    condition: initialData.condition || "good",
    notes: initialData.notes || "",
    inspectorName: initialData.inspectorName || "",
    odometer: initialData.odometer || "",
    photo: initialData.photo || null,
    signature: initialData.signature || null,
    inspectionDate: initialData.inspectionDate || new Date().toISOString().split("T")[0],
    lastUpdated: new Date().toISOString(),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!open) return null;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={`Tyre Inspection - ${fleetNumber} (${tyrePosition})`}
    >
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="fleetNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Fleet Number
                </label>
                <input
                  type="text"
                  id="fleetNumber"
                  name="fleetNumber"
                  value={formData.fleetNumber}
                  readOnly
                  className="w-full p-2 border rounded-lg bg-gray-100"
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                  Tyre Position
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  readOnly
                  className="w-full p-2 border rounded-lg bg-gray-100"
                />
              </div>

              <div>
                <label htmlFor="tyreBrand" className="block text-sm font-medium text-gray-700 mb-1">
                  Tyre Brand
                </label>
                <input
                  type="text"
                  id="tyreBrand"
                  name="tyreBrand"
                  value={formData.tyreBrand}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label htmlFor="tyreSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Tyre Size
                </label>
                <input
                  type="text"
                  id="tyreSize"
                  name="tyreSize"
                  value={formData.tyreSize}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label
                  htmlFor="treadDepth"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tread Depth (mm)
                </label>
                <input
                  type="number"
                  id="treadDepth"
                  name="treadDepth"
                  value={formData.treadDepth}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="20"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label htmlFor="pressure" className="block text-sm font-medium text-gray-700 mb-1">
                  Pressure (PSI)
                </label>
                <input
                  type="number"
                  id="pressure"
                  name="pressure"
                  value={formData.pressure}
                  onChange={handleChange}
                  step="1"
                  min="0"
                  max="200"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="worn">Worn</option>
                  <option value="damaged">Damaged</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label htmlFor="odometer" className="block text-sm font-medium text-gray-700 mb-1">
                  Odometer
                </label>
                <input
                  type="number"
                  id="odometer"
                  name="odometer"
                  value={formData.odometer}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label
                  htmlFor="inspectorName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Inspector Name
                </label>
                <input
                  type="text"
                  id="inspectorName"
                  name="inspectorName"
                  value={formData.inspectorName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label
                  htmlFor="inspectionDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Inspection Date
                </label>
                <input
                  type="date"
                  id="inspectionDate"
                  name="inspectionDate"
                  value={formData.inspectionDate}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Inspection</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Modal>
  );
};

export default TyreInspectionModal;
