import VehiclePositionDiagram from "@/components/Tyremanagement/VehiclePositionDiagram";
import { Button } from "@/components/ui/Button";
import { Input, Select, TextArea } from "@/components/ui/FormElements";
import Modal from "@/components/ui/Modal";
import { useTyreReferenceData } from "@/context/TyreReferenceDataContext";
import { Timestamp } from "firebase/firestore";
import { ChevronRight, Save, X } from "lucide-react";
import React, { useEffect, useState } from "react";

// *** HIERDIE IS JOU ENIGSTE TYRE DATA BRON ***
import type { Tyre } from "@/data/tyreData";
import {
  TyreConditionStatus, // <-- Import TyreStatus
  TyreMountStatus, // <-- Import TyreConditionStatus
  TyreStatus,
  TyreStoreLocation, // <-- Import TyreMountStatus
  TyreType,
  tyreTypes,
} from "@/data/tyreData";

interface TyreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tyreData: Partial<Tyre>) => Promise<void>;
  initialData?: Partial<Tyre>;
  editMode?: boolean;
}

const TyreFormModal: React.FC<TyreFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  editMode = false,
}) => {
  // Reference data (brands, sizes, patterns)
  const { brands, sizes, getPositionsForVehicleType, getPatternsForBrand } = useTyreReferenceData();

  // Serialiseer init size na string (bv. "295/80R22.5") as daar initialData is
  const initialSelectedSize = initialData.size
    ? `${initialData.size.width}/${initialData.size.aspectRatio}R${initialData.size.rimDiameter}`
    : "";

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
    type: initialData.type || "steer",
    purchaseDetails: initialData.purchaseDetails || {
      date: new Date().toISOString().split("T")[0],
      cost: 0,
      supplier: "",
      warranty: "",
      invoiceNumber: "",
    },
    installation: initialData.installation || {
      vehicleId: "",
      position: "",
      mileageAtInstallation: 0,
      installationDate: "",
      installedBy: "",
    },
    condition: initialData.condition || {
      treadDepth: 20,
      pressure: 0,
      temperature: 0,
      status: TyreConditionStatus.GOOD, // <-- Changed here
      lastInspectionDate: new Date().toISOString().split("T")[0],
      nextInspectionDue: "",
    },
    status: initialData.status || TyreStatus.NEW, // <-- Changed here
    mountStatus: initialData.mountStatus || TyreMountStatus.UNMOUNTED, // <-- Changed here
    maintenanceHistory: initialData.maintenanceHistory || {
      rotations: [],
      repairs: [],
      inspections: [],
    },
    kmRun: initialData.kmRun || 0,
    kmRunLimit: initialData.kmRunLimit || 60000,
    notes: initialData.notes || "",
    location: initialData.location ?? TyreStoreLocation.HOLDING_BAY,
  });

  // Section management
  const [activeSection, setActiveSection] = useState<
    "basic" | "technical" | "installation" | "condition"
  >("basic");

  const [availablePatterns, setAvailablePatterns] = useState<string[]>([]);
  const [vehicleTypePositions, setVehicleTypePositions] = useState<{ id: string; name: string }[]>(
    []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(initialSelectedSize);

  const safeString = (value: string | undefined): string => value ?? "";
  const safeNumber = (value: number | undefined): number => value ?? 0;
  const safeValue = (value: string | number | undefined): string | number => {
    if (value === undefined) return "";
    return value;
  };

  // Patterns update
  useEffect(() => {
    if (formData.brand) {
      const patterns = getPatternsForBrand(formData.brand)
        .map((p) => p.pattern)
        .filter((v, i, a) => a.indexOf(v) === i);
      setAvailablePatterns(patterns);
    } else {
      setAvailablePatterns([]);
    }
  }, [formData.brand, getPatternsForBrand]);

  // Positions update
  useEffect(() => {
    if (formData.type) {
      // Corrected: Ensure formData.type is cast to TyreType as expected by getPositionsForVehicleType
      const positions = getPositionsForVehicleType(formData.type);
      setVehicleTypePositions(positions);
    }
  }, [formData.type, getPositionsForVehicleType]);

  // Size parse
  useEffect(() => {
    if (selectedSize) {
      const parts = selectedSize.match(/^(\d+)\/(\d+)R(\d+\.?\d*)$/);
      if (parts) {
        const [, width, aspectRatio, rimDiameter] = parts;
        setFormData((prev) => ({
          ...prev,
          size: {
            width: parseInt(width),
            aspectRatio: parseInt(aspectRatio),
            rimDiameter: parseFloat(rimDiameter),
          },
        }));
      }
    }
  }, [selectedSize]);

  // Handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Handle string to enum conversion for specific fields if necessary
    // This is important for Select components where the 'value' will be a string
    let parsedValue: any = value;
    if (
      name === "condition.status" &&
      Object.values(TyreConditionStatus).includes(value as TyreConditionStatus)
    ) {
      parsedValue = value as TyreConditionStatus;
    } else if (name === "status" && Object.values(TyreStatus).includes(value as TyreStatus)) {
      parsedValue = value as TyreStatus;
    } else if (
      name === "mountStatus" &&
      Object.values(TyreMountStatus).includes(value as TyreMountStatus)
    ) {
      parsedValue = value as TyreMountStatus;
    } else if (
      name === "location" &&
      Object.values(TyreStoreLocation).includes(value as TyreStoreLocation)
    ) {
      parsedValue = value as TyreStoreLocation;
    } else if (name === "type" && tyreTypes.includes(value as TyreType)) {
      parsedValue = value as TyreType;
    }

    if (name && name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, any>),
          [child]: parsedValue, // Use parsedValue here
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: parsedValue, // Use parsedValue here
      }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    if (name && name.includes(".")) {
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

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.serialNumber) newErrors.serialNumber = "Serial number is required";
    if (!formData.brand) newErrors.brand = "Brand is required";
    if (!formData.pattern) newErrors.pattern = "Pattern is required";
    if (!selectedSize) newErrors.size = "Size is required";
    if (!formData.purchaseDetails?.date)
      newErrors["purchaseDetails.date"] = "Purchase date is required";
    if (formData.purchaseDetails?.cost === 0)
      newErrors["purchaseDetails.cost"] = "Cost is required";
    if (formData.mountStatus === TyreMountStatus.MOUNTED) {
      // <-- Use enum member
      if (!formData.installation?.vehicleId)
        newErrors["installation.vehicleId"] = "Vehicle ID is required for mounted tyres";
      if (!formData.installation?.position)
        newErrors["installation.position"] = "Position is required for mounted tyres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const submissionData: Partial<Tyre> = {
        ...formData,
        updatedAt: Timestamp.now(),
      };
      if (!editMode) {
        submissionData.createdAt = Timestamp.now();
      }
      await onSubmit(submissionData);
      onClose();
    } catch (error) {
      console.error("Error saving tyre:", error);
      setErrors({ submit: "Failed to save tyre. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = editMode ? `Edit Tyre: ${formData.serialNumber}` : "Add New Tyre";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="lg">
      <div className="space-y-6">
        {/* Section Navigation */}
        <div className="flex space-x-1 border-b">
          {["basic", "technical", "installation", "condition"].map((sec) => (
            <button
              key={sec}
              className={`px-4 py-2 ${
                activeSection === sec
                  ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveSection(sec as any)}
            >
              {sec.charAt(0).toUpperCase() + sec.slice(1)}
            </button>
          ))}
        </div>
        {/* Basic Section */}
        {activeSection === "basic" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Serial Number / ID"
                name="serialNumber"
                value={safeValue(formData.serialNumber)}
                onChange={handleChange}
                error={errors.serialNumber}
                disabled={editMode}
              />
              <Input
                label="DOT Code"
                name="dotCode"
                value={safeValue(formData.dotCode)}
                onChange={handleChange}
                error={errors.dotCode}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Manufacturing Date"
                name="manufacturingDate"
                type="date"
                value={safeValue(formData.manufacturingDate)}
                onChange={handleChange}
                error={errors.manufacturingDate}
              />
              <Select
                label="Tyre Brand"
                name="brand"
                value={safeString(formData.brand)} // Added name prop
                onChange={handleChange}
                error={errors.brand}
                options={[
                  { label: "Select brand...", value: "" },
                  ...brands.map((b: any) => ({ label: b.name, value: b.name })),
                ]}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tyre Size"
                name="size"
                value={safeString(selectedSize)} // Added name prop
                onChange={(e) => setSelectedSize(e.target.value)}
                error={errors.size}
                options={[
                  { label: "Select size...", value: "" },
                  ...sizes.map((s: any) => ({ label: s.size, value: s.size })),
                ]}
              />
              <Select
                label="Tyre Pattern"
                name="pattern"
                value={safeString(formData.pattern)} // Added name prop
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
              <Input
                label="Model"
                name="model"
                value={safeValue(formData.model)}
                onChange={handleChange}
              />
              <Select
                label="Type"
                name="type" // Added name prop
                value={safeString(formData.type as string)}
                onChange={handleChange}
                options={[
                  { label: "Select type...", value: "" },
                  ...tyreTypes.map((type) => ({
                    label: type.charAt(0).toUpperCase() + type.slice(1),
                    value: type,
                  })),
                ]}
              />
            </div>
            <Select
              label="Location"
              name="location" // Added name prop
              value={safeString(formData.location as string)}
              onChange={handleChange}
              options={[
                { label: "Select location...", value: "" },
                ...Object.values(TyreStoreLocation).map((loc) => ({ label: loc, value: loc })),
              ]}
            />
          </div>
        )}
        {/* Technical Section */}
        {activeSection === "technical" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Load Index"
                name="loadIndex"
                type="number"
                value={safeValue(formData.loadIndex)}
                onChange={handleNumberChange}
              />
              <Input
                label="Speed Rating"
                name="speedRating"
                value={safeValue(formData.speedRating)}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Purchase Date"
                name="purchaseDetails.date"
                type="date"
                value={safeValue(formData.purchaseDetails?.date)}
                onChange={handleChange}
                error={errors["purchaseDetails.date"]}
              />
              <Input
                label="Purchase Cost"
                name="purchaseDetails.cost"
                type="number"
                value={safeValue(formData.purchaseDetails?.cost)}
                onChange={handleNumberChange}
                error={errors["purchaseDetails.cost"]}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Supplier"
                name="purchaseDetails.supplier"
                value={safeValue(formData.purchaseDetails?.supplier)}
                onChange={handleChange}
              />
              <Input
                label="Invoice Number"
                name="purchaseDetails.invoiceNumber"
                value={safeValue(formData.purchaseDetails?.invoiceNumber)}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Warranty Information"
                name="purchaseDetails.warranty"
                value={safeValue(formData.purchaseDetails?.warranty)}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Distance Run (km)"
                name="kmRun"
                type="number"
                value={safeValue(formData.kmRun)}
                onChange={handleNumberChange}
              />
              <Input
                label="Distance Limit (km)"
                name="kmRunLimit"
                type="number"
                value={safeValue(formData.kmRunLimit)}
                onChange={handleNumberChange}
              />
            </div>
          </div>
        )}
        {/* Installation Section */}
        {activeSection === "installation" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Mount Status"
                name="mountStatus" // Added name prop
                value={safeString(formData.mountStatus as string)}
                onChange={handleChange}
                options={[
                  { label: "Unmounted", value: TyreMountStatus.UNMOUNTED }, // <-- Use enum member
                  { label: "Mounted", value: TyreMountStatus.MOUNTED }, // <-- Use enum member
                  { label: "In Storage", value: TyreMountStatus.IN_STORAGE }, // <-- Use enum member
                ]}
              />
              {formData.mountStatus === TyreMountStatus.MOUNTED && ( // <-- Use enum member
                <Input
                  label="Vehicle ID/Registration"
                  name="installation.vehicleId"
                  value={safeValue(formData.installation?.vehicleId)}
                  onChange={handleChange}
                  error={errors["installation.vehicleId"]}
                />
              )}
            </div>
            {formData.mountStatus === TyreMountStatus.MOUNTED && ( // <-- Use enum member
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Axle Position"
                    name="installation.position" // Added name prop
                    value={safeString(formData.installation?.position as string)}
                    onChange={handleChange}
                    error={errors["installation.position"]}
                    options={[
                      { label: "Select position...", value: "" },
                      ...vehicleTypePositions.map((pos) => ({ label: pos.name, value: pos.id })),
                    ]}
                  />
                  <Input
                    label="Installation Date"
                    name="installation.installationDate"
                    type="date"
                    value={safeValue(formData.installation?.installationDate)}
                    onChange={handleChange}
                  />
                </div>
                <Input
                  label="Mileage at Installation"
                  name="installation.mileageAtInstallation"
                  type="number"
                  value={safeValue(formData.installation?.mileageAtInstallation)}
                  onChange={handleNumberChange}
                />
                <Input
                  label="Installed By"
                  name="installation.installedBy"
                  value={safeValue(formData.installation?.installedBy)}
                  onChange={handleChange}
                />
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Vehicle Position Diagram
                  </h3>
                  <VehiclePositionDiagram
                    vehicleType={formData.type as TyreType}
                    selectedPosition={safeString(formData.installation?.position as string)}
                    positions={vehicleTypePositions}
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
        )}
        {/* Condition & Status Section */}
        {activeSection === "condition" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Current Status"
                name="status" // Added name prop
                value={safeString(formData.status as string)}
                onChange={handleChange}
                options={[
                  { label: "New", value: TyreStatus.NEW }, // <-- Use enum member
                  { label: "In Service", value: TyreStatus.IN_SERVICE }, // <-- Use enum member
                  { label: "Spare", value: TyreStatus.SPARE }, // <-- Use enum member
                  { label: "Retreaded", value: TyreStatus.RETREADED }, // <-- Use enum member
                  { label: "Scrapped", value: TyreStatus.SCRAPPED }, // <-- Use enum member
                ]}
              />
              <Input
                label="Tread Depth (mm)"
                name="condition.treadDepth"
                type="number"
                value={safeValue(formData.condition?.treadDepth)}
                onChange={handleNumberChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Pressure (kPa)"
                name="condition.pressure"
                type="number"
                value={safeValue(formData.condition?.pressure)}
                onChange={handleNumberChange}
              />
              <Select
                label="Condition Status"
                name="condition.status" // Added name prop
                value={safeString(formData.condition?.status as string)}
                onChange={handleChange}
                options={[
                  { label: "Good", value: TyreConditionStatus.GOOD }, // <-- Use enum member
                  { label: "Warning", value: TyreConditionStatus.WARNING }, // <-- Use enum member
                  { label: "Critical", value: TyreConditionStatus.CRITICAL }, // <-- Use enum member
                  { label: "Needs Replacement", value: TyreConditionStatus.NEEDS_REPLACEMENT }, // <-- Use enum member
                ]}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Last Inspection Date"
                name="condition.lastInspectionDate"
                type="date"
                value={safeValue(formData.condition?.lastInspectionDate)}
                onChange={handleChange}
              />
              <Input
                label="Next Inspection Due"
                name="condition.nextInspectionDue"
                type="date"
                value={safeValue(formData.condition?.nextInspectionDue)}
                onChange={handleChange}
              />
            </div>
            <TextArea
              label="Notes"
              name="notes" // Added name prop
              value={safeString(formData.notes)}
              onChange={handleChange}
              rows={4}
            />
          </div>
        )}
        {/* Actions */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          <div>{errors.submit && <p className="text-sm text-red-600">{errors.submit}</p>}</div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              icon={<X className="w-4 h-4" />}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
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
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                icon={<Save className="w-4 h-4" />}
              >
                {editMode ? "Update Tyre" : "Save Tyre"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TyreFormModal;
