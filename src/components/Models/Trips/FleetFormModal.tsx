import { Button } from "@/components/ui/Button";
import { Save, Truck, X } from "lucide-react";
import React, { useState } from "react";
import { Input, Select, TextArea } from "../../ui/FormElements";
import Modal from "../../ui/Modal";

interface Fleet {
  fleetNumber: string;
  registration: string;
  make: string;
  model: string;
  chassisNo: string;
  engineNo?: string;
  vin?: string;
  year?: string;
  vehicleType: string;
  status: string;
  odometer?: number;
  assignedDriver?: string;
  notes?: string;
}

interface FleetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  fleet?: Partial<Fleet>;
  onSave: (fleet: Fleet) => Promise<void>;
}

const FleetFormModal: React.FC<FleetFormModalProps> = ({ isOpen, onClose, fleet, onSave }) => {
  // Initialize form state with either the provided fleet or default values
  const [formData, setFormData] = useState<Partial<Fleet>>(
    fleet || {
      fleetNumber: "",
      registration: "",
      make: "",
      model: "",
      chassisNo: "",
      vehicleType: "Truck",
      status: "Active",
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vehicle type options
  const vehicleTypes = [
    { label: "Truck", value: "Truck" },
    { label: "Trailer", value: "Trailer" },
    { label: "Reefer", value: "Reefer" },
    { label: "Light Vehicle", value: "Light Vehicle" },
  ];

  // Status options
  const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Maintenance", value: "Maintenance" },
    { label: "Out of Service", value: "Out of Service" },
    { label: "Sold", value: "Sold" },
  ];

  // Handle form field changes
  const handleChange = (field: keyof Fleet, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear any error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate the form before submission
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.fleetNumber) newErrors.fleetNumber = "Fleet number is required";
    if (!formData.registration) newErrors.registration = "Registration is required";
    if (!formData.make) newErrors.make = "Make is required";
    if (!formData.model) newErrors.model = "Model is required";
    if (!formData.chassisNo) newErrors.chassisNo = "Chassis number is required";
    if (!formData.vehicleType) newErrors.vehicleType = "Vehicle type is required";
    if (!formData.status) newErrors.status = "Status is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Create a full fleet object for saving
      const fleetToSave = {
        fleetNumber: formData.fleetNumber!,
        registration: formData.registration!,
        make: formData.make!,
        model: formData.model!,
        chassisNo: formData.chassisNo!,
        engineNo: formData.engineNo,
        vin: formData.vin,
        year: formData.year,
        vehicleType: formData.vehicleType!,
        status: formData.status!,
        odometer: formData.odometer || 0,
        assignedDriver: formData.assignedDriver,
        notes: formData.notes,
      } as Fleet;

      await onSave(fleetToSave);

      // Close the modal after successful save
      onClose();
    } catch (error) {
      console.error("Error saving fleet:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to save fleet. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={fleet ? "Edit Fleet Vehicle" : "Add New Fleet Vehicle"}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Form introduction */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start space-x-3">
            <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">
                {fleet ? "Edit Fleet Vehicle Details" : "Register New Fleet Vehicle"}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                {fleet
                  ? "Update the details for this fleet vehicle."
                  : "Fill in the details to register a new fleet vehicle in the system."}
              </p>
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fleet Number *"
            value={formData.fleetNumber || ""}
            onChange={(e) => handleChange("fleetNumber", e.target.value)}
            placeholder="e.g., 21H, 4F"
            error={errors.fleetNumber}
          />

          <Input
            label="Registration *"
            value={formData.registration || ""}
            onChange={(e) => handleChange("registration", e.target.value)}
            placeholder="e.g., ADS4865"
            error={errors.registration}
          />

          <Input
            label="Make *"
            value={formData.make || ""}
            onChange={(e) => handleChange("make", e.target.value)}
            placeholder="e.g., SCANIA, SHACMAN"
            error={errors.make}
          />

          <Input
            label="Model *"
            value={formData.model || ""}
            onChange={(e) => handleChange("model", e.target.value)}
            placeholder="e.g., G460, X3000"
            error={errors.model}
          />

          <Input
            label="Chassis Number *"
            value={formData.chassisNo || ""}
            onChange={(e) => handleChange("chassisNo", e.target.value)}
            placeholder="e.g., 9BS56440003882656"
            error={errors.chassisNo}
          />

          <Input
            label="Engine Number"
            value={formData.engineNo || ""}
            onChange={(e) => handleChange("engineNo", e.target.value)}
            placeholder="e.g., DC13106LO18271015"
          />

          <Input
            label="VIN"
            value={formData.vin || ""}
            onChange={(e) => handleChange("vin", e.target.value)}
            placeholder="Vehicle Identification Number"
          />

          <Input
            label="Year"
            value={formData.year || ""}
            onChange={(e) => handleChange("year", e.target.value)}
            placeholder="e.g., 2022"
          />

          <Select
            label="Vehicle Type *"
            value={formData.vehicleType || ""}
            onChange={(e) => handleChange("vehicleType", e.target.value)}
            options={vehicleTypes.map((type) => ({ label: type.label, value: type.value }))}
            error={errors.vehicleType}
          />

          <Select
            label="Status *"
            value={formData.status || ""}
            onChange={(e) => handleChange("status", e.target.value)}
            options={statusOptions.map((status) => ({ label: status.label, value: status.value }))}
            error={errors.status}
          />

          <Input
            label="Odometer (km)"
            type="number"
            value={formData.odometer?.toString() || ""}
            onChange={(e) => handleChange("odometer", parseInt(e.target.value) || 0)}
            placeholder="Current odometer reading"
          />

          <Input
            label="Assigned Driver"
            value={formData.assignedDriver || ""}
            onChange={(e) => handleChange("assignedDriver", e.target.value)}
            placeholder="e.g., John Smith"
          />
        </div>

        <TextArea
          label="Notes"
          value={formData.notes || ""}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Additional information about this vehicle..."
          rows={3}
        />

        {/* Submission error message */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
            {errors.submit}
          </div>
        )}

        {/* Form actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
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
            {fleet ? "Update Vehicle" : "Save Vehicle"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FleetFormModal;
