// src/components/forms/InventorySelectionForm.tsx
/**
 * InventorySelectionForm Component
 *
 * A form for selecting inventory items from stock with integration to Firestore data.
 * This component demonstrates how to use the formIntegration utilities
 * for inventory management and workshop operations.
 */
import React, { useEffect, useState } from "react";
import { useSyncContext } from "../../../context/SyncContext";
import { useFormSubmit, useInventoryOptions, validateForm } from "../../../utils/formIntegration";
import FormSelector from "../FormSelector";

interface InventorySelectionFormProps {
  onComplete?: (data: InventorySelectionData) => void;
  initialData?: Partial<InventorySelectionData>;
  jobCardId?: string;
  storeLocation?: string;
}

export interface InventorySelectionData {
  jobCardId?: string;
  stockCode: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  storeLocation: string;
  notes?: string;
}

const InventorySelectionForm: React.FC<InventorySelectionFormProps> = ({
  onComplete,
  initialData,
  jobCardId,
  storeLocation = "Main Store",
}) => {
  const syncContext = useSyncContext();

  // Form state
  const [formData, setFormData] = useState<Partial<InventorySelectionData>>({
    jobCardId: initialData?.jobCardId || jobCardId || "",
    stockCode: initialData?.stockCode || "",
    description: initialData?.description || "",
    quantity: initialData?.quantity || 1,
    unit: initialData?.unit || "",
    unitPrice: initialData?.unitPrice || 0,
    totalPrice: initialData?.totalPrice || 0,
    storeLocation: initialData?.storeLocation || storeLocation,
    notes: initialData?.notes || "",
  });

  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get inventory options from Firestore
  const { options: inventoryOptions } = useInventoryOptions(formData.storeLocation);

  // Form submission handler
  const { submitForm, loading, error, success } = useFormSubmit("inventoryUsage");

  // Handle inventory selection
  const handleInventorySelection = (stockCode: string) => {
    // Find the selected inventory item
    const selectedItem = inventoryOptions.find((option) => option.value === stockCode);

    if (selectedItem) {
      // Simulate fetching item details from Firestore
      fetchInventoryDetails(stockCode);
    }
  };

  // Fetch inventory details from Firestore
  const fetchInventoryDetails = async (stockCode: string) => {
    try {
      // In a real app, we'd fetch this from Firestore directly
      // For this example, we'll simulate by finding in the inventoryOptions

      const selectedItem = inventoryOptions.find((option) => option.value === stockCode);
      if (!selectedItem) return;

      // Parse the label to extract description and stock quantity
      const label = selectedItem.label;
      const description = label.split(" (")[0];

      // Mock data that would come from Firestore
      const mockItemData = {
        StockCde: stockCode,
        StockDescription: description,
        Unit: "EA", // Example unit
        UnitPrice: 125.5, // Example price
        StoreName: formData.storeLocation,
      };

      // Update form data with item details
      setFormData((prev) => ({
        ...prev,
        stockCode,
        description: mockItemData.StockDescription,
        unit: mockItemData.Unit,
        unitPrice: mockItemData.UnitPrice,
        totalPrice: mockItemData.UnitPrice * (prev.quantity || 1),
      }));
    } catch (err) {
      console.error("Error fetching inventory details:", err);
    }
  };

  // Calculate total price when quantity or unit price changes
  useEffect(() => {
    const quantity = formData.quantity || 0;
    const unitPrice = formData.unitPrice || 0;
    const total = quantity * unitPrice;

    setFormData((prev) => ({
      ...prev,
      totalPrice: total,
    }));
  }, [formData.quantity, formData.unitPrice]);

  // Handle input changes
  const handleInputChange = (field: keyof InventorySelectionData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear errors when field is changed
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validation schema
  const validationSchema = {
    stockCode: { required: true },
    description: { required: true },
    quantity: { required: true, min: 1 },
    unit: { required: true },
    unitPrice: { required: true, min: 0 },
    storeLocation: { required: true },
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
        status: "issued",
      });

      if (onComplete && !error) {
        onComplete(formData as InventorySelectionData);
      }

      // Reset form if successful
      if (success) {
        setFormData({
          jobCardId: jobCardId || "",
          stockCode: "",
          description: "",
          quantity: 1,
          unit: "",
          unitPrice: 0,
          totalPrice: 0,
          storeLocation: storeLocation,
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
      console.log("Inventory item added successfully");
    }
  }, [success]);

  // Get store locations
  const storeLocations = [
    { value: "Main Store", label: "Main Store" },
    { value: "Workshop", label: "Workshop" },
    { value: "External", label: "External" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Inventory Selection</h2>

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
        {/* Store Location */}
        <div className="form-control w-full">
          <label htmlFor="storeLocation" className="label">
            <span className="label-text font-medium">
              Store Location<span className="text-error ml-1">*</span>
            </span>
          </label>
          <select
            id="storeLocation"
            className={`select select-bordered w-full ${formErrors.storeLocation ? "select-error" : ""}`}
            value={formData.storeLocation || ""}
            onChange={(e) => handleInputChange("storeLocation", e.target.value)}
            disabled={isSubmitting || loading}
            required
          >
            <option value="" disabled>
              Select store location
            </option>
            {storeLocations.map((store) => (
              <option key={store.value} value={store.value}>
                {store.label}
              </option>
            ))}
          </select>
          {formErrors.storeLocation && (
            <div className="text-error text-xs mt-1">{formErrors.storeLocation}</div>
          )}
        </div>

        {/* Inventory Item Selection */}
        <FormSelector
          label="Inventory Item"
          name="stockCode"
          value={formData.stockCode || ""}
          onChange={(value) => handleInventorySelection(value)}
          collection="stockInventory"
          labelField="StockDescription"
          valueField="StockCde"
          filterField="StoreName"
          filterValue={formData.storeLocation}
          sortField="StockDescription"
          required
          error={formErrors.stockCode}
          disabled={isSubmitting || loading || !formData.storeLocation}
          transform={(item) => ({
            value: item.StockCde,
            label: `${item.StockDescription} (${item.StockQty} in stock)`,
          })}
        />

        {/* Description */}
        <div className="form-control w-full">
          <label htmlFor="description" className="label">
            <span className="label-text font-medium">
              Description<span className="text-error ml-1">*</span>
            </span>
          </label>
          <input
            type="text"
            id="description"
            className={`input input-bordered w-full ${formErrors.description ? "input-error" : ""}`}
            value={formData.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            disabled={isSubmitting || loading}
            required
            readOnly
          />
          {formErrors.description && (
            <div className="text-error text-xs mt-1">{formErrors.description}</div>
          )}
        </div>

        {/* Unit */}
        <div className="form-control w-full">
          <label htmlFor="unit" className="label">
            <span className="label-text font-medium">
              Unit<span className="text-error ml-1">*</span>
            </span>
          </label>
          <input
            type="text"
            id="unit"
            className={`input input-bordered w-full ${formErrors.unit ? "input-error" : ""}`}
            value={formData.unit || ""}
            onChange={(e) => handleInputChange("unit", e.target.value)}
            disabled={isSubmitting || loading}
            required
          />
          {formErrors.unit && <div className="text-error text-xs mt-1">{formErrors.unit}</div>}
        </div>

        {/* Quantity */}
        <div className="form-control w-full">
          <label htmlFor="quantity" className="label">
            <span className="label-text font-medium">
              Quantity<span className="text-error ml-1">*</span>
            </span>
          </label>
          <input
            type="number"
            id="quantity"
            className={`input input-bordered w-full ${formErrors.quantity ? "input-error" : ""}`}
            value={formData.quantity || ""}
            onChange={(e) => handleInputChange("quantity", parseInt(e.target.value))}
            min="1"
            step="1"
            disabled={isSubmitting || loading}
            required
          />
          {formErrors.quantity && (
            <div className="text-error text-xs mt-1">{formErrors.quantity}</div>
          )}
        </div>

        {/* Unit Price */}
        <div className="form-control w-full">
          <label htmlFor="unitPrice" className="label">
            <span className="label-text font-medium">
              Unit Price<span className="text-error ml-1">*</span>
            </span>
          </label>
          <input
            type="number"
            id="unitPrice"
            className={`input input-bordered w-full ${formErrors.unitPrice ? "input-error" : ""}`}
            value={formData.unitPrice || ""}
            onChange={(e) => handleInputChange("unitPrice", parseFloat(e.target.value))}
            min="0"
            step="0.01"
            disabled={isSubmitting || loading}
            required
          />
          {formErrors.unitPrice && (
            <div className="text-error text-xs mt-1">{formErrors.unitPrice}</div>
          )}
        </div>

        {/* Total Price */}
        <div className="form-control w-full">
          <label htmlFor="totalPrice" className="label">
            <span className="label-text font-medium">Total Price</span>
          </label>
          <input
            type="number"
            id="totalPrice"
            className="input input-bordered w-full bg-gray-100"
            value={formData.totalPrice || 0}
            disabled={true}
            readOnly
          />
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
          onClick={() => onComplete && onComplete(formData as InventorySelectionData)}
        >
          Cancel
        </button>

        <button
          type="submit"
          className={`btn btn-primary ${isSubmitting || loading ? "loading" : ""}`}
          disabled={isSubmitting || loading}
        >
          {isSubmitting || loading ? "Saving..." : "Add Item"}
        </button>
      </div>
    </form>
  );
};

export default InventorySelectionForm;
