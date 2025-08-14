// src/components/forms/FleetSelectionForm.tsx
/**
 * FleetSelectionForm Component
 *
 * A form for selecting fleet vehicles with integration to Firestore data.
 * This component demonstrates how to use the formIntegration utilities
 * to create a fully connected form with dynamic position selection.
 */
import React, { useEffect, useState } from "react";
import { useSyncContext } from "../../context/SyncContext";
import {
  useFleetOptions,
  useFormSubmit,
  useVehiclePositionOptions,
  validateForm,
} from "../../utils/formIntegration";
// Removed FormSelector in favor of direct select elements to utilize loading & options state

interface FleetSelectionFormProps {
  onComplete?: (data: FleetSelectionData) => void;
  initialData?: Partial<FleetSelectionData>;
}

export interface FleetSelectionData {
  fleetId: string;
  vehicleType: string;
  registrationNumber: string;
  positionId: string;
  driverId?: string;
  status: string;
  notes?: string;
}

const VEHICLE_TYPES = [
  { value: "truck", label: "Truck" },
  { value: "trailer", label: "Trailer" },
  { value: "forklift", label: "Forklift" },
  { value: "light-vehicle", label: "Light Vehicle" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "maintenance", label: "In Maintenance" },
  { value: "inactive", label: "Inactive" },
];

const FleetSelectionForm: React.FC<FleetSelectionFormProps> = ({ onComplete, initialData }) => {
  const syncContext = useSyncContext();

  // Form state
  const [formData, setFormData] = useState<Partial<FleetSelectionData>>({
    fleetId: initialData?.fleetId || "",
    vehicleType: initialData?.vehicleType || "",
    registrationNumber: initialData?.registrationNumber || "",
    positionId: initialData?.positionId || "",
    driverId: initialData?.driverId || "",
    status: initialData?.status || "active",
    notes: initialData?.notes || "",
  });

  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get options from Firestore
  // Load fleet & position options (filtered by vehicle type)
  const { options: fleetOptions, loading: loadingFleet } = useFleetOptions(
    formData.vehicleType || undefined
  );
  const { options: positionOptions, loading: loadingPositions } = useVehiclePositionOptions(
    formData.vehicleType || ""
  );

  const isBusy = loadingFleet || loadingPositions;

  // Form submission handler
  const { submitForm, loading, error, success } = useFormSubmit("fleetAssignments");

  // Handle fleet selection
  const handleFleetSelection = (fleetId: string) => {
    // Find the selected fleet vehicle
    const selectedVehicle = fleetOptions.find((option) => option.value === fleetId);

    if (selectedVehicle) {
      // Update the form data with vehicle details
      setFormData((prev) => ({
        ...prev,
        fleetId,
        registrationNumber: selectedVehicle.label,
      }));
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof FleetSelectionData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear errors when field is changed
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Reset dependent fields for vehicle type changes
    if (field === "vehicleType") {
      setFormData((prev) => ({ ...prev, positionId: "" }));
    }
  };

  // Validation schema
  const validationSchema = {
    fleetId: { required: true },
    vehicleType: { required: true },
    registrationNumber: { required: true },
    positionId: { required: true },
    status: { required: true },
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const { isValid, errors } = validateForm(formData, validationSchema);
    setFormErrors(errors);

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      await submitForm({
        ...formData,
        createdAt: new Date().toISOString(),
        createdBy: "currentUser", // Replace with actual user ID
      });

      if (onComplete && !error) {
        onComplete(formData as FleetSelectionData);
      }

      // Reset form if successful
      if (success) {
        setFormData({
          fleetId: "",
          vehicleType: "",
          registrationNumber: "",
          positionId: "",
          driverId: "",
          status: "active",
          notes: "",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message when form is successfully submitted
  useEffect(() => {
    if (success) {
      // Show success toast or message
      console.log("Fleet assignment saved successfully");
    }
  }, [success]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Fleet Vehicle Selection</h2>

      {!syncContext.isOnline && (
        <div className="alert alert-warning">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>You are currently offline. Form will be submitted when you reconnect.</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error instanceof Error ? error.message : "An error occurred"}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicle Type */}
        <div className="form-control w-full">
          <label htmlFor="vehicleType" className="label">
            <span className="label-text font-medium">
              Vehicle Type<span className="text-error ml-1">*</span>
            </span>
          </label>
          <select
            id="vehicleType"
            className={`select select-bordered w-full ${formErrors.vehicleType ? "select-error" : ""}`}
            value={formData.vehicleType || ""}
            onChange={(e) => handleInputChange("vehicleType", e.target.value)}
            disabled={isSubmitting || loading}
            required
          >
            <option value="" disabled>
              Select vehicle type
            </option>
            {VEHICLE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {formErrors.vehicleType && (
            <div className="text-error text-xs mt-1">{formErrors.vehicleType}</div>
          )}
        </div>

        {/* Fleet Selection */}
        <div className="form-control w-full">
          <label htmlFor="fleetId" className="label">
            <span className="label-text font-medium">
              Fleet Vehicle<span className="text-error ml-1">*</span>
            </span>
          </label>
          <select
            id="fleetId"
            className={`select select-bordered w-full ${formErrors.fleetId ? "select-error" : ""}`}
            value={formData.fleetId || ""}
            onChange={(e) => handleFleetSelection(e.target.value)}
            disabled={!formData.vehicleType || isSubmitting || loading || loadingFleet}
            required
          >
            <option value="" disabled>
              {loadingFleet ? "Loading fleets..." : "Select fleet vehicle"}
            </option>
            {!loadingFleet && formData.vehicleType && fleetOptions.length === 0 && (
              <option disabled value="__no_fleets__">
                No fleets available
              </option>
            )}
            {!loadingFleet &&
              fleetOptions.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
          </select>
          {formErrors.fleetId && (
            <div className="text-error text-xs mt-1">{formErrors.fleetId}</div>
          )}
        </div>

        {/* Vehicle Position */}
        <div className="form-control w-full">
          <label htmlFor="positionId" className="label">
            <span className="label-text font-medium">
              Vehicle Position<span className="text-error ml-1">*</span>
            </span>
          </label>
          <select
            id="positionId"
            className={`select select-bordered w-full ${formErrors.positionId ? "select-error" : ""}`}
            value={formData.positionId || ""}
            onChange={(e) => handleInputChange("positionId", e.target.value)}
            disabled={!formData.vehicleType || isSubmitting || loading || loadingPositions}
            required
          >
            <option value="" disabled>
              {loadingPositions ? "Loading positions..." : "Select position"}
            </option>
            {!loadingPositions && formData.vehicleType && positionOptions.length === 0 && (
              <option disabled value="__no_positions__">
                No positions available
              </option>
            )}
            {!loadingPositions &&
              positionOptions.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
          </select>
          {formErrors.positionId && (
            <div className="text-error text-xs mt-1">{formErrors.positionId}</div>
          )}
        </div>

        {/* Status */}
        <div className="form-control w-full">
          <label htmlFor="status" className="label">
            <span className="label-text font-medium">
              Status<span className="text-error ml-1">*</span>
            </span>
          </label>
          <select
            id="status"
            className={`select select-bordered w-full ${formErrors.status ? "select-error" : ""}`}
            value={formData.status || ""}
            onChange={(e) => handleInputChange("status", e.target.value)}
            disabled={isSubmitting || loading}
            required
          >
            <option value="" disabled>
              Select status
            </option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          {formErrors.status && <div className="text-error text-xs mt-1">{formErrors.status}</div>}
        </div>

        {/* Notes */}
        <div className="form-control w-full col-span-1 md:col-span-2">
          <label htmlFor="notes" className="label">
            <span className="label-text font-medium">Notes</span>
          </label>
          <textarea
            id="notes"
            className="textarea textarea-bordered w-full"
            value={formData.notes || ""}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            disabled={isSubmitting || loading}
            rows={3}
          />
        </div>
      </div>

      {isBusy && <div className="text-sm text-gray-500">Loading data, please wait...</div>}

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 mt-6">
        <button
          type="button"
          className="btn btn-outline"
          disabled={isSubmitting || loading}
          onClick={() => onComplete && onComplete(formData as FleetSelectionData)}
        >
          Cancel
        </button>

        <button
          type="submit"
          className={`btn btn-primary ${isSubmitting || loading ? "loading" : ""}`}
          disabled={isSubmitting || loading}
        >
          {isSubmitting || loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default FleetSelectionForm;
