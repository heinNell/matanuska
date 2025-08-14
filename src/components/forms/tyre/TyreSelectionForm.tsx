// src/components/forms/TyreSelectionForm.tsx
/**
 * TyreSelectionForm Component
 *
 * A form for selecting tyres with integration to Firestore data.
 * This component demonstrates how to use the formIntegration utilities
 * to create a fully connected form with cascading selects.
 */
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import {
  useFormSubmit,
  useTyreBrandOptions,
  useTyrePatternOptions,
  useTyreSizeOptions,
  validateForm,
} from "../../../utils/formIntegration";
import FormSelector from "../../forms/FormSelector";

interface TyreSelectionFormProps {
  onComplete?: (data: TyreSelectionData) => void;
  initialData?: Partial<TyreSelectionData>;
  vehicleId?: string;
  positionId?: string;
}

export interface TyreSelectionData {
  brand: string;
  size: string;
  pattern: string;
  position: string;
  vehicleId: string;
  serialNumber?: string;
  notes?: string;
}

const TyreSelectionForm: React.FC<TyreSelectionFormProps> = ({
  onComplete,
  initialData,
  vehicleId,
  positionId,
}) => {
  const { isOnline } = useAppContext();

  // Form state
  const [formData, setFormData] = useState<Partial<TyreSelectionData>>({
    brand: initialData?.brand || "",
    size: initialData?.size || "",
    pattern: initialData?.pattern || "",
    position: initialData?.position || positionId || "",
    vehicleId: initialData?.vehicleId || vehicleId || "",
    serialNumber: initialData?.serialNumber || "",
    notes: initialData?.notes || "",
  });

  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get options from Firestore
  // Note: We don't need to explicitly use these returned values
  // as the FormSelector component uses the same hooks internally
  useTyreBrandOptions();
  useTyreSizeOptions();
  useTyrePatternOptions(formData.brand, formData.size);

  // Form submission handler
  const { submitForm, loading, error, success } = useFormSubmit("tyreAssignments");

  // Handle input changes
  const handleInputChange = (field: keyof TyreSelectionData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear errors when field is changed
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Reset dependent fields for cascading selects
    if (field === "brand") {
      setFormData((prev) => ({ ...prev, pattern: "" }));
    }

    if (field === "size") {
      setFormData((prev) => ({ ...prev, pattern: "" }));
    }
  };

  // Validation schema
  const validationSchema = {
    brand: { required: true },
    size: { required: true },
    pattern: { required: true },
    position: { required: true },
    vehicleId: { required: true },
    serialNumber: {
      required: false,
      pattern: /^[A-Z0-9]{5,20}$/i,
      validate: (value: string) => {
        if (value && value.length < 5) {
          return "Serial number must be at least 5 characters";
        }
        return null;
      },
    },
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
        status: "active",
      });

      if (onComplete && !error) {
        onComplete(formData as TyreSelectionData);
      }

      // Reset form if successful
      if (success) {
        setFormData({
          brand: "",
          size: "",
          pattern: "",
          position: positionId || "",
          vehicleId: vehicleId || "",
          serialNumber: "",
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
      console.log("Tyre assignment saved successfully");
    }
  }, [success]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Tyre Selection</h2>

      {!isOnline && (
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
        {/* Tyre Brand */}
        <FormSelector
          label="Tyre Brand"
          name="brand"
          value={formData.brand || ""}
          onChange={(value: string) => handleInputChange("brand", value)}
          collection="tyreBrands"
          labelField="name"
          valueField="name"
          sortField="name"
          required
          error={formErrors.brand}
          disabled={isSubmitting || loading}
        />

        {/* Tyre Size */}
        <FormSelector
          label="Tyre Size"
          name="size"
          value={formData.size || ""}
          onChange={(value: string) => handleInputChange("size", value)}
          collection="tyreSizes"
          labelField="size"
          valueField="size"
          sortField="size"
          required
          error={formErrors.size}
          disabled={isSubmitting || loading}
        />

        {/* Tyre Pattern */}
        <FormSelector
          label="Tyre Pattern"
          name="pattern"
          value={formData.pattern || ""}
          onChange={(value: string) => handleInputChange("pattern", value)}
          collection="tyrePatterns"
          labelField="pattern"
          valueField="pattern"
          filterField="brand"
          filterValue={formData.brand}
          required
          error={formErrors.pattern}
          disabled={!formData.brand || !formData.size || isSubmitting || loading}
        />

        {/* Serial Number */}
        <div className="form-control w-full">
          <label htmlFor="serialNumber" className="label">
            <span className="label-text font-medium">Serial Number</span>
          </label>
          <input
            type="text"
            id="serialNumber"
            className={`input input-bordered w-full ${formErrors.serialNumber ? "input-error" : ""}`}
            value={formData.serialNumber || ""}
            onChange={(e) => handleInputChange("serialNumber", e.target.value)}
            disabled={isSubmitting || loading}
          />
          {formErrors.serialNumber && (
            <div className="text-error text-xs mt-1">{formErrors.serialNumber}</div>
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
          onClick={() => onComplete && onComplete(formData as TyreSelectionData)}
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

export default TyreSelectionForm;
