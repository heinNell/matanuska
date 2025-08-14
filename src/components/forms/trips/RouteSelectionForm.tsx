// src/components/forms/RouteSelectionForm.tsx
/**
 * RouteSelectionForm Component
 *
 * A form for selecting routes with integration to Firestore data.
 * This component demonstrates how to use the formIntegration utilities
 * for trip planning and route selection.
 */
import React, { useEffect, useState } from "react";
import { useSyncContext } from "../../../context/SyncContext";
import { useFormSubmit, useRouteOptions, validateForm } from "../../../utils/formIntegration";
import FormSelector from "../FormSelector";

interface RouteSelectionFormProps {
  onComplete?: (data: RouteSelectionData) => void;
  initialData?: Partial<RouteSelectionData>;
  tripId?: string;
}

export interface RouteSelectionData {
  tripId: string;
  routeId: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  estimatedTime: number;
  scheduledDate: string;
  notes?: string;
}

const RouteSelectionForm: React.FC<RouteSelectionFormProps> = ({
  onComplete,
  initialData,
  tripId,
}) => {
  const syncContext = useSyncContext();

  // Form state
  const [formData, setFormData] = useState<Partial<RouteSelectionData>>({
    tripId: initialData?.tripId || tripId || "",
    routeId: initialData?.routeId || "",
    startLocation: initialData?.startLocation || "",
    endLocation: initialData?.endLocation || "",
    distance: initialData?.distance || 0,
    estimatedTime: initialData?.estimatedTime || 0,
    scheduledDate: initialData?.scheduledDate || new Date().toISOString().split("T")[0],
    notes: initialData?.notes || "",
  });

  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get route options from Firestore
  const { options: routeOptions } = useRouteOptions();

  // Form submission handler
  const { submitForm, loading, error, success } = useFormSubmit("tripRoutes");

  // Handle route selection
  const handleRouteSelection = (routeId: string) => {
    // Find the selected route from options
    const selectedRoute = routeOptions.find((option) => option.value === routeId);

    if (selectedRoute && selectedRoute.value) {
      // Fetch route details from Firestore
      fetchRouteDetails(selectedRoute.value);
    }
  };

  // Fetch route details from Firestore
  const fetchRouteDetails = async (routeId: string) => {
    try {
      // In a real app, we'd fetch this from Firestore directly
      // For this example, we'll simulate by finding in the routeOptions

      // This would be a Firestore query in a real app
      const selectedRoute = routeOptions.find((option) => option.value === routeId);

      if (!selectedRoute) return;

      // Update the form with route details
      // In a real app, you'd get this data from the Firestore document
      const [start, end] = selectedRoute.label.split(" to ");

      setFormData((prev) => ({
        ...prev,
        routeId,
        startLocation: start || "",
        endLocation: end || "",
        distance: 100, // This would come from Firestore
        estimatedTime: 2, // This would come from Firestore
      }));
    } catch (err) {
      console.error("Error fetching route details:", err);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof RouteSelectionData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear errors when field is changed
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validation schema
  const validationSchema = {
    tripId: { required: true },
    routeId: { required: true },
    startLocation: { required: true },
    endLocation: { required: true },
    distance: { required: true, min: 0 },
    estimatedTime: { required: true, min: 0 },
    scheduledDate: { required: true },
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
        status: "scheduled",
      });

      if (onComplete && !error) {
        onComplete(formData as RouteSelectionData);
      }

      // Reset form if successful
      if (success) {
        setFormData({
          tripId: tripId || "",
          routeId: "",
          startLocation: "",
          endLocation: "",
          distance: 0,
          estimatedTime: 0,
          scheduledDate: new Date().toISOString().split("T")[0],
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
      console.log("Route selection saved successfully");
    }
  }, [success]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Route Selection</h2>

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
        {/* Route Selection */}
        <FormSelector
          label="Route"
          name="routeId"
          value={formData.routeId || ""}
          onChange={(value) => handleRouteSelection(value)}
          collection="routeDistances"
          labelField="route"
          valueField="id"
          sortField="route"
          required
          error={formErrors.routeId}
          disabled={isSubmitting || loading}
          className="col-span-1 md:col-span-2"
        />

        {/* Start Location */}
        <div className="form-control w-full">
          <label htmlFor="startLocation" className="label">
            <span className="label-text font-medium">
              Start Location<span className="text-error ml-1">*</span>
            </span>
          </label>
          <input
            type="text"
            id="startLocation"
            className={`input input-bordered w-full ${formErrors.startLocation ? "input-error" : ""}`}
            value={formData.startLocation || ""}
            onChange={(e) => handleInputChange("startLocation", e.target.value)}
            disabled={isSubmitting || loading}
            required
            readOnly
          />
          {formErrors.startLocation && (
            <div className="text-error text-xs mt-1">{formErrors.startLocation}</div>
          )}
        </div>

        {/* End Location */}
        <div className="form-control w-full">
          <label htmlFor="endLocation" className="label">
            <span className="label-text font-medium">
              End Location<span className="text-error ml-1">*</span>
            </span>
          </label>
          <input
            type="text"
            id="endLocation"
            className={`input input-bordered w-full ${formErrors.endLocation ? "input-error" : ""}`}
            value={formData.endLocation || ""}
            onChange={(e) => handleInputChange("endLocation", e.target.value)}
            disabled={isSubmitting || loading}
            required
            readOnly
          />
          {formErrors.endLocation && (
            <div className="text-error text-xs mt-1">{formErrors.endLocation}</div>
          )}
        </div>

        {/* Distance */}
        <div className="form-control w-full">
          <label htmlFor="distance" className="label">
            <span className="label-text font-medium">
              Distance (km)<span className="text-error ml-1">*</span>
            </span>
          </label>
          <input
            type="number"
            id="distance"
            className={`input input-bordered w-full ${formErrors.distance ? "input-error" : ""}`}
            value={formData.distance || ""}
            onChange={(e) => handleInputChange("distance", parseFloat(e.target.value))}
            min="0"
            step="0.1"
            disabled={isSubmitting || loading}
            required
          />
          {formErrors.distance && (
            <div className="text-error text-xs mt-1">{formErrors.distance}</div>
          )}
        </div>

        {/* Estimated Time */}
        <div className="form-control w-full">
          <label htmlFor="estimatedTime" className="label">
            <span className="label-text font-medium">
              Estimated Time (hours)<span className="text-error ml-1">*</span>
            </span>
          </label>
          <input
            type="number"
            id="estimatedTime"
            className={`input input-bordered w-full ${formErrors.estimatedTime ? "input-error" : ""}`}
            value={formData.estimatedTime || ""}
            onChange={(e) => handleInputChange("estimatedTime", parseFloat(e.target.value))}
            min="0"
            step="0.5"
            disabled={isSubmitting || loading}
            required
          />
          {formErrors.estimatedTime && (
            <div className="text-error text-xs mt-1">{formErrors.estimatedTime}</div>
          )}
        </div>

        {/* Scheduled Date */}
        <div className="form-control w-full">
          <label htmlFor="scheduledDate" className="label">
            <span className="label-text font-medium">
              Scheduled Date<span className="text-error ml-1">*</span>
            </span>
          </label>
          <input
            type="date"
            id="scheduledDate"
            className={`input input-bordered w-full ${formErrors.scheduledDate ? "input-error" : ""}`}
            value={formData.scheduledDate || ""}
            onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
            disabled={isSubmitting || loading}
            required
          />
          {formErrors.scheduledDate && (
            <div className="text-error text-xs mt-1">{formErrors.scheduledDate}</div>
          )}
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

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 mt-6">
        <button
          type="button"
          className="btn btn-outline"
          disabled={isSubmitting || loading}
          onClick={() => onComplete && onComplete(formData as RouteSelectionData)}
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

export default RouteSelectionForm;
