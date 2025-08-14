import VehiclePositionDiagram from "@/components/Tyremanagement/VehiclePositionDiagram";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/FormElements";
import { useTyreReferenceData } from "@/context/TyreReferenceDataContext";
import { Tyre, TyreStoreLocation } from "@/types/TyreModel";
import React, { useEffect, useState } from "react";

interface TyreFormProps {
  initialData?: Partial<Tyre>;
  onSubmit: (data: Partial<Tyre>) => Promise<void>;
  onCancel?: () => void;
  editMode?: boolean;
  inline?: boolean; // Whether the form is displayed inline or in a modal
}

const TyreForm: React.FC<TyreFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  editMode = false,
  inline = false,
}) => {
  // Use the reference data context for brands, sizes, patterns
  const { brands, sizes, getPositionsForVehicleType, getPatternsForBrand } = useTyreReferenceData();

  // Form state
  const [formData, setFormData] = useState<Partial<Tyre>>({
    serialNumber: initialData.serialNumber || `TY-${Math.floor(1000 + Math.random() * 9000)}`,
    dotCode: initialData.dotCode || "",
    manufacturingDate: initialData.manufacturingDate || new Date().toISOString().split("T")[0],
    brand: initialData.brand || "",
    model: initialData.model || "",
    pattern: initialData.pattern || "",
    size: initialData.size || { width: 0, aspectRatio: 0, rimDiameter: 0 },
    loadIndex: initialData.loadIndex || 0,
    speedRating: initialData.speedRating || "",
    type: initialData.type || "standard",
    purchaseDetails: initialData.purchaseDetails || {
      date: new Date().toISOString().split("T")[0],
      cost: 0,
      supplier: "",
      warranty: "",
      invoiceNumber: "",
    },
    installation: initialData.installation || {
      vehicleId: "",
      position: "front_left",
      mileageAtInstallation: 0,
      installationDate: "",
      installedBy: "",
    },
    condition: initialData.condition || {
      treadDepth: 20, // New tyre typical depth
      pressure: 0,
      temperature: 0,
      status: "good",
      lastInspectionDate: new Date().toISOString().split("T")[0],
      nextInspectionDue: "",
    },
    status: initialData.status || "new",
    mountStatus: initialData.mountStatus || "unmounted",
    maintenanceHistory: initialData.maintenanceHistory || {
      rotations: [],
      repairs: [],
      inspections: [],
    },
    kmRun: initialData.kmRun || 0,
    kmRunLimit: initialData.kmRunLimit || 60000,
    notes: initialData.notes || "",
    location: initialData.location || TyreStoreLocation.VICHELS_STORE,
  });

  // Form section management - used for inline forms and step navigation
  const [activeSection, setActiveSection] = useState<
    "basic" | "technical" | "installation" | "condition"
  >("basic");

  // Derived state
  const [availablePatterns, setAvailablePatterns] = useState<string[]>([]);
  const [vehicleTypePositions, setVehicleTypePositions] = useState<{ id: string; name: string }[]>(
    []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");

  // Load initial size string from initialData
  useEffect(() => {
    if (initialData.size?.displayString) {
      setSelectedSize(initialData.size.displayString);
    }
  }, [initialData]);

  // Update available patterns when brand or size changes
  useEffect(() => {
    if (formData.brand) {
      const patterns = getPatternsForBrand(formData.brand)
        .map((p) => p.pattern)
        .filter((v, i, a) => a.indexOf(v) === i); // Unique values
      setAvailablePatterns(patterns);
    } else {
      setAvailablePatterns([]);
    }
  }, [formData.brand, getPatternsForBrand]);

  // Update vehicle positions when type changes
  useEffect(() => {
    if (formData.type) {
      const positions = getPositionsForVehicleType(formData.type as string);
      setVehicleTypePositions(positions);
    }
  }, [formData.type, getPositionsForVehicleType]);

  // Convert size string to object when selected from dropdown
  useEffect(() => {
    if (selectedSize) {
      // Parse size format like "295/80R22.5"
      const parts = selectedSize.match(/^(\d+)\/(\d+)R(\d+\.?\d*)$/);
      if (parts) {
        const [, width, aspectRatio, rimDiameter] = parts;
        setFormData((prev) => ({
          ...prev,
          size: {
            width: parseInt(width),
            aspectRatio: parseInt(aspectRatio),
            rimDiameter: parseFloat(rimDiameter),
            displayString: selectedSize,
          },
        }));
      }
    }
  }, [selectedSize]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, any>),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);

    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, any>),
          [child]: isNaN(numValue) ? 0 : numValue,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue,
      }));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!formData.serialNumber) newErrors.serialNumber = "Serial number is required";
    if (!formData.brand) newErrors.brand = "Brand is required";
    if (!formData.pattern) newErrors.pattern = "Pattern is required";
    if (!selectedSize) newErrors.size = "Size is required";
    if (!formData.purchaseDetails?.date)
      newErrors["purchaseDetails.date"] = "Purchase date is required";
    if (formData.purchaseDetails?.cost === 0)
      newErrors["purchaseDetails.cost"] = "Cost is required";

    // Additional validation for mounted tyres
    if (formData.mountStatus === "mounted") {
      if (!formData.installation?.vehicleId)
        newErrors["installation.vehicleId"] = "Vehicle ID is required for mounted tyres";
      if (!formData.installation?.position)
        newErrors["installation.position"] = "Position is required for mounted tyres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form if not in edit mode
      if (!editMode && !inline) {
        setFormData({
          serialNumber: `TY-${Math.floor(1000 + Math.random() * 9000)}`,
          // Reset other fields...
        });
        setActiveSection("basic");
      }
    } catch (error) {
      console.error("Error saving tyre:", error);
      setErrors({ submit: "Failed to save tyre. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render form based on activeSection
  const renderFormSection = () => {
    switch (activeSection) {
      case "basic":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Serial Number / ID"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                error={errors.serialNumber}
                disabled={editMode} // Can't change serial number in edit mode
              />
              <Input
                label="DOT Code"
                name="dotCode"
                value={formData.dotCode}
                onChange={handleChange}
                error={errors.dotCode}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Manufacturing Date"
                name="manufacturingDate"
                type="date"
                value={formData.manufacturingDate}
                onChange={handleChange}
                error={errors.manufacturingDate}
              />
              <Select
                label="Tyre Brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                error={errors.brand}
                options={[
                  { label: "Select brand...", value: "" },
                  ...brands.map((brand) => ({ label: brand.name, value: brand.name })),
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tyre Size"
                name="selectedSize"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                error={errors.size}
                options={[
                  { label: "Select size...", value: "" },
                  ...sizes.map((size) => ({ label: size.size, value: size.size })),
                ]}
              />
              <Select
                label="Tyre Pattern"
                name="pattern"
                value={formData.pattern}
                onChange={handleChange}
                error={errors.pattern}
                options={[
                  { label: "Select pattern...", value: "" },
                  ...availablePatterns.map((pattern) => ({ label: pattern, value: pattern })),
                ]}
                disabled={!formData.brand}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Model" name="model" value={formData.model} onChange={handleChange} />
              <Select
                label="Type"
                name="type"
                value={formData.type as string}
                onChange={handleChange}
                options={[
                  { label: "Standard", value: "standard" },
                  { label: "Winter", value: "winter" },
                  { label: "All Season", value: "all_season" },
                  { label: "Mud Terrain", value: "mud_terrain" },
                  { label: "All Terrain", value: "all_terrain" },
                ]}
              />
            </div>
          </div>
        );

      case "technical":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Load Index"
                name="loadIndex"
                type="number"
                value={formData.loadIndex}
                onChange={handleNumberChange}
              />
              <Input
                label="Speed Rating"
                name="speedRating"
                value={formData.speedRating}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Purchase Date"
                name="purchaseDetails.date"
                type="date"
                value={formData.purchaseDetails?.date}
                onChange={handleChange}
                error={errors["purchaseDetails.date"]}
              />
              <Input
                label="Purchase Cost"
                name="purchaseDetails.cost"
                type="number"
                value={formData.purchaseDetails?.cost}
                onChange={handleNumberChange}
                error={errors["purchaseDetails.cost"]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Supplier"
                name="purchaseDetails.supplier"
                value={formData.purchaseDetails?.supplier}
                onChange={handleChange}
              />
              <Input
                label="Invoice Number"
                name="purchaseDetails.invoiceNumber"
                value={formData.purchaseDetails?.invoiceNumber}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Warranty Information"
                name="purchaseDetails.warranty"
                value={formData.purchaseDetails?.warranty}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Distance Run (km)"
                name="kmRun"
                type="number"
                value={formData.kmRun}
                onChange={handleNumberChange}
              />
              <Input
                label="Distance Limit (km)"
                name="kmRunLimit"
                type="number"
                value={formData.kmRunLimit}
                onChange={handleNumberChange}
              />
            </div>
          </div>
        );

      case "installation":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Mount Status"
                name="mountStatus"
                value={formData.mountStatus as string}
                onChange={handleChange}
                options={[
                  { label: "Unmounted", value: "unmounted" },
                  { label: "Mounted", value: "mounted" },
                  { label: "In Storage", value: "in_storage" },
                ]}
              />
              {formData.mountStatus === "mounted" && (
                <Input
                  label="Vehicle ID/Registration"
                  name="installation.vehicleId"
                  value={formData.installation?.vehicleId}
                  onChange={handleChange}
                  error={errors["installation.vehicleId"]}
                />
              )}
            </div>

            {formData.mountStatus === "mounted" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Vehicle Type"
                    name="type"
                    value={formData.type as string}
                    onChange={handleChange}
                    options={[
                      { label: "Standard", value: "standard" },
                      { label: "Reefer", value: "reefer" },
                      { label: "Horse", value: "horse" },
                      { label: "Interlink", value: "interlink" },
                    ]}
                  />
                  <Select
                    label="Axle Position"
                    name="installation.position"
                    value={formData.installation?.position as string}
                    onChange={handleChange}
                    error={errors["installation.position"]}
                    options={[
                      { label: "Select position...", value: "" },
                      ...vehicleTypePositions.map((pos) => ({ label: pos.name, value: pos.id })),
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Installation Date"
                    name="installation.installationDate"
                    type="date"
                    value={formData.installation?.installationDate}
                    onChange={handleChange}
                  />
                  <Input
                    label="Mileage at Installation"
                    name="installation.mileageAtInstallation"
                    type="number"
                    value={formData.installation?.mileageAtInstallation}
                    onChange={handleNumberChange}
                  />
                </div>

                <Input
                  label="Installed By"
                  name="installation.installedBy"
                  value={formData.installation?.installedBy}
                  onChange={handleChange}
                />

                {/* Vehicle Position Diagram */}
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Vehicle Position Diagram
                  </h3>
                  <VehiclePositionDiagram
                    vehicleType={formData.type as "standard" | "reefer" | "horse" | "interlink"}
                    positions={vehicleTypePositions}
                    selectedPosition={formData.installation?.position as string}
                    onPositionClick={(position) => {
                      setFormData((prev) => ({
                        ...prev,
                        installation: {
                          ...prev.installation!,
                          position,
                        },
                      }));
                    }}
                  />
                </div>
              </>
            )}
          </div>
        );

      case "condition":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Current Status"
                name="status"
                value={formData.status as string}
                onChange={handleChange}
                options={[
                  { label: "New", value: "new" },
                  { label: "In Service", value: "in_service" },
                  { label: "Spare", value: "spare" },
                  { label: "Retreaded", value: "retreaded" },
                  { label: "Scrapped", value: "scrapped" },
                ]}
              />
              <Input
                label="Tread Depth (mm)"
                name="condition.treadDepth"
                type="number"
                value={formData.condition?.treadDepth}
                onChange={handleNumberChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Pressure (kPa)"
                name="condition.pressure"
                type="number"
                value={formData.condition?.pressure}
                onChange={handleNumberChange}
              />
              <Select
                label="Condition Status"
                name="condition.status"
                value={formData.condition?.status as string}
                onChange={handleChange}
                options={[
                  { label: "Good", value: "good" },
                  { label: "Warning", value: "warning" },
                  { label: "Critical", value: "critical" },
                  { label: "Needs Replacement", value: "needs_replacement" },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Last Inspection Date"
                name="condition.lastInspectionDate"
                type="date"
                value={formData.condition?.lastInspectionDate}
                onChange={handleChange}
              />
              <Input
                label="Next Inspection Due"
                name="condition.nextInspectionDue"
                type="date"
                value={formData.condition?.nextInspectionDue}
                onChange={handleChange}
              />
            </div>

            <Textarea
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // For inline mode, render as a card with sections
  if (inline) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {/* Section Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 border-b">
            <button
              type="button"
              className={`px-4 py-2 ${activeSection === "basic" ? "border-b-2 border-blue-500 text-blue-600 font-medium" : "text-gray-500"}`}
              onClick={() => setActiveSection("basic")}
            >
              Basic Info
            </button>
            <button
              type="button"
              className={`px-4 py-2 ${activeSection === "technical" ? "border-b-2 border-blue-500 text-blue-600 font-medium" : "text-gray-500"}`}
              onClick={() => setActiveSection("technical")}
            >
              Technical Details
            </button>
            <button
              type="button"
              className={`px-4 py-2 ${activeSection === "installation" ? "border-b-2 border-blue-500 text-blue-600 font-medium" : "text-gray-500"}`}
              onClick={() => setActiveSection("installation")}
            >
              Installation
            </button>
            <button
              type="button"
              className={`px-4 py-2 ${activeSection === "condition" ? "border-b-2 border-blue-500 text-blue-600 font-medium" : "text-gray-500"}`}
              onClick={() => setActiveSection("condition")}
            >
              Condition & Status
            </button>
          </div>
        </div>

        {/* Active Form Section */}
        {renderFormSection()}

        {/* Form Actions */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          {errors.submit && (
            <div className="mr-auto">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="mr-3"
            >
              Cancel
            </Button>
          )}
          <Button type="submit" isLoading={isSubmitting}>
            {editMode ? "Update Tyre" : "Save Tyre"}
          </Button>
        </div>
      </form>
    );
  }

  // For modal/regular mode, render as a series of steps
  return (
    <div className="space-y-6">
      {renderFormSection()}

      {/* Step Navigation */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        {activeSection !== "basic" && (
          <Button
            variant="outline"
            onClick={() => {
              const sections: Array<"basic" | "technical" | "installation" | "condition"> = [
                "basic",
                "technical",
                "installation",
                "condition",
              ];
              const currentIndex = sections.indexOf(activeSection);
              setActiveSection(sections[currentIndex - 1]);
            }}
          >
            Previous
          </Button>
        )}

        {activeSection !== "condition" ? (
          <Button
            onClick={() => {
              const sections: Array<"basic" | "technical" | "installation" | "condition"> = [
                "basic",
                "technical",
                "installation",
                "condition",
              ];
              const currentIndex = sections.indexOf(activeSection);
              setActiveSection(sections[currentIndex + 1]);
            }}
          >
            Next
          </Button>
        ) : (
          <>
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              {editMode ? "Update Tyre" : "Save Tyre"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TyreForm;
