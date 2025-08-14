import { Button } from "@/components/ui/Button";
import { AlertTriangle, Calculator, Fuel, Save, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { DieselConsumptionRecord, DRIVERS, FLEET_NUMBERS, FUEL_STATIONS } from "../../../types";
import { Input, Select, TextArea } from "../../ui/FormElements";
import Modal from "../../ui/Modal";

interface DieselEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  dieselRecordId: string;
}

const DieselEditModal: React.FC<DieselEditModalProps> = ({ isOpen, onClose, dieselRecordId }) => {
  const { dieselRecords, updateDieselRecord, trips } = useAppContext();

  const [formData, setFormData] = useState({
    fleetNumber: "",
    date: "",
    kmReading: "",
    previousKmReading: "",
    litresFilled: "",
    costPerLitre: "",
    totalCost: "",
    fuelStation: "",
    driverName: "",
    notes: "",
    currency: "ZAR" as "USD" | "ZAR",
    isReeferUnit: false,
    hoursOperated: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find the diesel record
  const record = dieselRecords.find((r) => r.id === dieselRecordId);

  // Initialize form with record data
  useEffect(() => {
    if (record) {
      setFormData({
        fleetNumber: record.fleetNumber,
        date: record.date,
        kmReading: record.kmReading.toString(),
        previousKmReading: record.previousKmReading?.toString() || "",
        litresFilled: record.litresFilled.toString(),
        costPerLitre: record.costPerLitre?.toString() || "",
        totalCost: record.totalCost.toString(),
        fuelStation: record.fuelStation,
        driverName: record.driverName,
        notes: record.notes || "",
        currency: record.currency || "ZAR",
        isReeferUnit: record.isReeferUnit || false,
        hoursOperated: record.hoursOperated?.toString() || "",
      });
    }
  }, [record, isOpen]);

  // Helper function to handle events from form controls
  const handleInputChange = (
    field: string,
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    handleChange(field, event.target.value);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear errors
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Auto-calculate when relevant fields change
    if (
      autoCalculate &&
      ["litresFilled", "costPerLitre", "totalCost", "hoursOperated"].includes(field) &&
      typeof value === "string"
    ) {
      autoCalculateFields(field, value);
    }
  };

  const autoCalculateFields = (changedField: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setFormData((prev) => {
      const litres =
        changedField === "litresFilled" ? numValue : parseFloat(prev.litresFilled) || 0;
      const costPerLitre =
        changedField === "costPerLitre" ? numValue : parseFloat(prev.costPerLitre) || 0;
      const totalCost = changedField === "totalCost" ? numValue : parseFloat(prev.totalCost) || 0;

      const newData = { ...prev };

      if (changedField === "litresFilled" && costPerLitre > 0) {
        newData.totalCost = (litres * costPerLitre).toFixed(2);
      } else if (changedField === "costPerLitre" && litres > 0) {
        newData.totalCost = (litres * costPerLitre).toFixed(2);
      } else if (changedField === "totalCost" && litres > 0) {
        newData.costPerLitre = (totalCost / litres).toFixed(2);
      }

      return newData;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fleetNumber) newErrors.fleetNumber = "Fleet number is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.litresFilled) newErrors.litresFilled = "Litres filled is required";
    if (!formData.totalCost) newErrors.totalCost = "Total cost is required";
    if (!formData.fuelStation) newErrors.fuelStation = "Fuel station is required";
    if (!formData.driverName) newErrors.driverName = "Driver name is required";
    if (!formData.currency) newErrors.currency = "Currency is required";

    // Validate numbers
    if (
      formData.litresFilled &&
      (isNaN(Number(formData.litresFilled)) || Number(formData.litresFilled) <= 0)
    ) {
      newErrors.litresFilled = "Must be a valid positive number";
    }
    if (
      formData.totalCost &&
      (isNaN(Number(formData.totalCost)) || Number(formData.totalCost) <= 0)
    ) {
      newErrors.totalCost = "Must be a valid positive number";
    }

    // For reefer units, validate hours operated
    if (formData.isReeferUnit) {
      if (!formData.hoursOperated) {
        newErrors.hoursOperated = "Hours operated is required for reefer units";
      } else if (isNaN(Number(formData.hoursOperated)) || Number(formData.hoursOperated) <= 0) {
        newErrors.hoursOperated = "Hours operated must be a positive number";
      }
    } else {
      // For regular units, validate KM reading
      if (
        !formData.kmReading ||
        isNaN(Number(formData.kmReading)) ||
        Number(formData.kmReading) <= 0
      ) {
        newErrors.kmReading = "KM reading must be a valid positive number";
      }

      // Validate KM readings
      if (formData.kmReading && formData.previousKmReading) {
        const current = Number(formData.kmReading);
        const previous = Number(formData.previousKmReading);
        if (current <= previous) {
          newErrors.kmReading = "Current KM must be greater than previous KM";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!record || !validateForm()) return;

    try {
      setIsSubmitting(true);

      const kmReading = Number(formData.kmReading);
      const previousKmReading = formData.previousKmReading
        ? Number(formData.previousKmReading)
        : undefined;
      const litresFilled = Number(formData.litresFilled);
      const totalCost = Number(formData.totalCost);
      const costPerLitre = formData.costPerLitre
        ? Number(formData.costPerLitre)
        : totalCost / litresFilled;
      const hoursOperated = formData.hoursOperated ? Number(formData.hoursOperated) : undefined;

      // Calculate derived values
      const distanceTravelled =
        !formData.isReeferUnit && previousKmReading !== undefined
          ? kmReading - previousKmReading
          : undefined;
      const kmPerLitre =
        !formData.isReeferUnit && distanceTravelled && litresFilled > 0
          ? distanceTravelled / litresFilled
          : undefined;
      const litresPerHour =
        formData.isReeferUnit && hoursOperated ? litresFilled / hoursOperated : undefined;

      // Prepare the updated record
      const updatedRecord: DieselConsumptionRecord = {
        ...record,
        fleetNumber: formData.fleetNumber,
        date: formData.date,
        kmReading: formData.isReeferUnit ? 0 : kmReading,
        litresFilled,
        costPerLitre,
        totalCost,
        fuelStation: String(formData.fuelStation ?? "").trim(),
        driverName: formData.driverName,
        notes: String(formData.notes ?? "").trim(),
        previousKmReading: formData.isReeferUnit ? undefined : previousKmReading,
        distanceTravelled,
        kmPerLitre,
        currency: formData.currency,
        isReeferUnit: formData.isReeferUnit,
        hoursOperated,
        litresPerHour,
        updatedAt: new Date().toISOString(),
      };

      await updateDieselRecord(updatedRecord);

      alert("Diesel record updated successfully!");
      onClose();
    } catch (err: any) {
      alert(
        "Failed to update diesel record. Please check all fields and try again.\n" +
          (err?.message || "")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDistance = () => {
    if (formData.kmReading && formData.previousKmReading) {
      const distance = Number(formData.kmReading) - Number(formData.previousKmReading);
      return distance > 0 ? distance : 0;
    }
    return 0;
  };

  const calculateKmPerLitre = () => {
    const distance = calculateDistance();
    const litres = Number(formData.litresFilled) || 0;
    return distance > 0 && litres > 0 ? distance / litres : 0;
  };

  const calculateLitresPerHour = () => {
    const litres = Number(formData.litresFilled) || 0;
    const hours = Number(formData.hoursOperated) || 0;
    return hours > 0 ? litres / hours : 0;
  };

  if (!record) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Diesel Record" maxWidth="lg">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start space-x-3">
            <Fuel className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Edit Diesel Record</h4>
              <p className="text-sm text-blue-700 mt-1">
                Update diesel consumption record details. All efficiency calculations will be
                updated automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Auto-Calculate Toggle */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="autoCalculate"
            checked={autoCalculate}
            onChange={(e) => setAutoCalculate(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor="autoCalculate"
            className="flex items-center text-sm font-medium text-gray-700"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Auto-calculate costs and efficiency
          </label>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Fleet Number *"
            value={formData.fleetNumber}
            onChange={(e) => handleInputChange("fleetNumber", e)}
            options={[
              { label: "Select fleet...", value: "" },
              ...FLEET_NUMBERS.map((f) => ({
                label: f,
                value: f,
              })),
            ]}
            error={errors.fleetNumber}
            disabled={record.tripId !== undefined} // Disable if linked to trip
          />

          <Input
            label="Date *"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e)}
            error={errors.date}
          />

          {!formData.isReeferUnit ? (
            <>
              <Input
                label="Current KM Reading *"
                type="number"
                step="1"
                min="0"
                value={formData.kmReading}
                onChange={(e) => handleInputChange("kmReading", e)}
                placeholder="125000"
                error={errors.kmReading}
              />

              <Input
                label="Previous KM Reading"
                type="number"
                step="1"
                min="0"
                value={formData.previousKmReading}
                onChange={(e) => handleInputChange("previousKmReading", e)}
                placeholder="123560"
                error={errors.previousKmReading}
              />
            </>
          ) : (
            <Input
              label="Hours Operated *"
              type="number"
              step="0.1"
              min="0.1"
              value={formData.hoursOperated}
              onChange={(e) => handleInputChange("hoursOperated", e)}
              placeholder="5.5"
              error={errors.hoursOperated}
            />
          )}

          <Input
            label="Litres Filled *"
            type="number"
            step="0.1"
            min="0.1"
            value={formData.litresFilled}
            onChange={(e) => handleInputChange("litresFilled", e)}
            placeholder="450"
            error={errors.litresFilled}
          />

          <Input
            label="Cost per Litre"
            type="number"
            step="0.01"
            min="0"
            value={formData.costPerLitre}
            onChange={(e) => handleInputChange("costPerLitre", e)}
            placeholder="18.50"
            error={errors.costPerLitre}
          />

          <div className="grid grid-cols-2 gap-2">
            <Select
              label="Currency *"
              value={formData.currency}
              onChange={(e) => handleInputChange("currency", e)}
              options={[
                { label: "ZAR (R)", value: "ZAR" },
                { label: "USD ($)", value: "USD" },
              ]}
              error={errors.currency}
            />

            <Input
              label="Total Cost *"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.totalCost}
              onChange={(e) => handleInputChange("totalCost", e)}
              placeholder="8325.00"
              error={errors.totalCost}
            />
          </div>

          <Select
            label="Fuel Station *"
            value={formData.fuelStation}
            onChange={(e) => handleInputChange("fuelStation", e)}
            options={[
              { label: "Select fuel station...", value: "" },
              ...FUEL_STATIONS.map((station) => ({ label: station, value: station })),
            ]}
            error={errors.fuelStation}
          />

          <Select
            label="Driver *"
            value={formData.driverName}
            onChange={(e) => handleInputChange("driverName", e)}
            options={[
              { label: "Select driver...", value: "" },
              ...DRIVERS.map((d) => ({ label: d, value: d })),
            ]}
            error={errors.driverName}
          />
        </div>

        <TextArea
          label="Notes"
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e)}
          placeholder="Additional notes about this fuel entry..."
          rows={3}
        />

        {/* Calculation Preview */}
        {!formData.isReeferUnit &&
          formData.kmReading &&
          formData.previousKmReading &&
          formData.litresFilled && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">Calculated Metrics</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-green-600">Distance Travelled</p>
                  <p className="font-bold text-green-800">
                    {calculateDistance().toLocaleString()} km
                  </p>
                </div>
                <div>
                  <p className="text-green-600">Efficiency</p>
                  <p className="font-bold text-green-800">
                    {calculateKmPerLitre().toFixed(2)} KM/L
                  </p>
                </div>
                <div>
                  <p className="text-green-600">Cost per KM</p>
                  <p className="font-bold text-green-800">
                    {formData.currency === "USD" ? "$" : "R"}
                    {calculateDistance() > 0
                      ? (Number(formData.totalCost) / calculateDistance()).toFixed(2)
                      : "0.00"}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Reefer Unit Calculation Preview */}
        {formData.isReeferUnit && formData.litresFilled && formData.hoursOperated && (
          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-purple-800 mb-2">Reefer Unit Metrics</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-purple-600">Hours Operated</p>
                <p className="font-bold text-purple-800">
                  {Number(formData.hoursOperated).toFixed(1)} hours
                </p>
              </div>
              <div>
                <p className="text-purple-600">Consumption Rate</p>
                <p className="font-bold text-purple-800">
                  {calculateLitresPerHour().toFixed(2)} L/hr
                </p>
              </div>
              <div>
                <p className="text-purple-600">Cost per Hour</p>
                <p className="font-bold text-purple-800">
                  {formData.currency === "USD" ? "$" : "R"}
                  {Number(formData.hoursOperated) > 0
                    ? (Number(formData.totalCost) / Number(formData.hoursOperated)).toFixed(2)
                    : "0.00"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trip Linkage Info */}
        {record.tripId && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Trip Linkage</h4>
                <p className="text-sm text-blue-700 mt-1">
                  This diesel record is linked to a trip. Some fields are locked to maintain data
                  integrity. To change fleet number or other key details, please unlink from the
                  trip first.
                </p>
                {record.tripId && (
                  <p className="text-sm font-medium text-blue-800 mt-2">
                    Linked to Trip:{" "}
                    {trips.find((t) => t.id === record.tripId)?.route || record.tripId}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Validation Warnings */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">
                  Please fix the following errors:
                </h4>
                <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            icon={<X className="w-4 h-4" />}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            icon={<Save className="w-4 h-4" />}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Update Diesel Record
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DieselEditModal;
