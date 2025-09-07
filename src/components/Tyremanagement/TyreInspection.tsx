import React, { ChangeEvent, useEffect, useState } from "react";
import { TyreSize as TyreSizeData } from "../../types/tyre";
import { TyreInspectionEntry } from "../../types/workshop-tyre-inventory";
import { Tyre } from "../../types/tyre";
import { VehicleSelector } from "../common/VehicleSelector";
import VehicleTyreView from "../../pages/tyres/VehicleTyreView";

// Import tyre reference data
import { Button } from "../../components/ui/Button";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Ruler,
  Save,
  ShoppingBag,
  Upload,
} from "lucide-react";
import {
  getPositionsByFleet,
  getTyresByBrand,
  getTyresBySize,
  getUniqueTyreBrands,
  getUniqueTyrePatterns,
  getUniqueTyreSizes,
  VENDORS,
} from "../../utils/tyreConstants";
import ErrorMessage from "../ui/ErrorMessage";
import { Input, Select, TextArea } from "../ui/FormElements";

// Thresholds for tyre condition assessment
const TYRE_THRESHOLDS = {
  treadDepth: {
    good: 5.0, // 5mm or more is good
    worn: 3.0, // Between 3mm and 5mm is worn
    // Below 3mm is urgent
  },
  pressure: {
    // For standard passenger tyres (would vary by tyre type in production)
    min: 30, // PSI
    max: 40, // PSI
  },
};

// Sidewall condition options
const SIDEWALL_CONDITIONS = [
  { value: "good", label: "Good - No visible damage" },
  { value: "minor_damage", label: "Minor Damage - Small cuts or abrasions" },
  { value: "bulge", label: "Bulge Present - Requires immediate attention" },
  { value: "severe_damage", label: "Severe Damage - Replace immediately" },
];

// Function to parse tyre size from string (e.g., '315/80R22.5')
const parseTyreSize = (sizeStr: string): TyreSizeData => {
  const regex = /([0-9]+)\/([0-9]+)R([0-9.]+)/;
  const match = regex.exec(sizeStr);

  if (match && match[1] && match[2] && match[3]) {
    return {
      width: parseInt(match[1], 10),
      aspectRatio: parseInt(match[2], 10),
      rimDiameter: parseFloat(match[3]),
    };
  }

  return { width: 0, aspectRatio: 0, rimDiameter: 0 };
};

// Helper function to format tyre size as string
const formatTyreSize = (size: TyreSizeData): string =>
  `${size.width}/${size.aspectRatio}R${size.rimDiameter}`;

// Interface for the inspection form data
interface TyreInspectionFormData {
  date: string;
  inspector: string;
  fleetNumber: string;
  tyrePosition: string;
  treadDepth: string;
  pressure: string;
  sidewallCondition: string;
  remarks: string;
  photos: string[]; // This would store URLs in production
  // New fields for tyre references
  brand: string;
  pattern: string;
  size: string;
  serialNumber: string;
  dotCode: string;
  supplier: string;
  // Size breakdown
  tyreSize: TyreSizeData;
  // Cost tracking
  cost: string;
  estimatedLifespan: string;
  currentMileage: string;
  detected: {
    treadDepthIssue: boolean;
    pressureIssue: boolean;
    sidewallIssue: boolean;
  };
}

// Define TyreConditionStatus
export type TyreConditionStatus = "good" | "warning" | "critical" | "needs_replacement";

// Define TyreInspectionData
export interface TyreInspectionData {
  vehicleId: string;
  position: string;
  inspectorName: string;
  treadDepth: string;
  pressure: string;
  condition: TyreConditionStatus | "";
  damage: string;
  notes: string;
  photos: string[];
}

const TyreInspection: React.FC = () => {
  // Selected tyre for inspection
  const [selectedTyre, setSelectedTyre] = useState<Tyre | null>(null);

  // Filtered tyre options based on selections
  const [brandOptions, setBrandOptions] = useState<string[]>(getUniqueTyreBrands());
  const [patternOptions, setPatternOptions] = useState<string[]>(getUniqueTyrePatterns());
  // Track available positions for the selected fleet
  const [_, setPositionOptions] = useState<string[]>([]);

  // Form data state
  const [formData, setFormData] = useState<TyreInspectionFormData>({
    date: new Date().toISOString().split("T")[0],
    inspector: "",
    fleetNumber: "",
    tyrePosition: "",
    treadDepth: "",
    pressure: "",
    sidewallCondition: "good",
    remarks: "",
    photos: [],
    // New fields
    brand: "",
    pattern: "",
    size: "",
    serialNumber: "",
    dotCode: "",
    supplier: "",
    // Size breakdown
    tyreSize: { width: 0, aspectRatio: 0, rimDiameter: 0 },
    // Cost tracking
    cost: "",
    estimatedLifespan: "",
    currentMileage: "",
    detected: {
      treadDepthIssue: false,
      pressureIssue: false,
      sidewallIssue: false,
    },
  });

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Add state for new tyre option
  const [showNewTyreFields, setShowNewTyreFields] = useState<boolean>(false);
  const [showInspectionHistory, setShowInspectionHistory] = useState<boolean>(false);

  // Update position options when fleet number changes
  useEffect(() => {
    if (formData.fleetNumber) {
      const positions = getPositionsByFleet(formData.fleetNumber);
      setPositionOptions(positions);
    } else {
      setPositionOptions([]);
    }
  }, [formData.fleetNumber]);

  // Update tyre size when size string changes
  useEffect(() => {
    if (formData.size) {
      const tyreSize = parseTyreSize(formData.size);
      if (tyreSize.width > 0) {
        setFormData((prev) => ({ ...prev, tyreSize }));
      }
    }
  }, [formData.size]);

  // Calculate cost per km when both cost and estimated lifespan are provided
  const calculateCostPerKm = () => {
    const cost = parseFloat(formData.cost);
    const lifespan = parseFloat(formData.estimatedLifespan);

    if (!isNaN(cost) && !isNaN(lifespan) && lifespan > 0) {
      return (cost / lifespan).toFixed(4);
    }

    return null;
  };

  // Handling tyre selection from VehicleTyreView
  const handleTyreSelect = (tyre: Tyre | null) => {
    setSelectedTyre(tyre);
    setShowInspectionHistory(false);
    if (tyre) {
      setFormData((prevData) => ({
        ...prevData,
        tyrePosition: tyre.installation?.position || "",
        treadDepth: tyre.condition.treadDepth.toString(),
        pressure: tyre.condition.pressure.toString(),
        brand: tyre.brand,
        pattern: tyre.pattern ?? "",
        size: formatTyreSize(tyre.size),
        serialNumber: tyre.serialNumber,
        dotCode: tyre.dotCode,
        tyreSize: tyre.size,
        cost: tyre.purchaseDetails.cost?.toString() ?? "",
        estimatedLifespan: tyre.kmRunLimit?.toString() ?? "",
        currentMileage:
          tyre.kmRun?.toString() ?? tyre.installation?.mileageAtInstallation?.toString() ?? "0",
      }));
      if (tyre.brand) {
        const brandTyres = getTyresByBrand(tyre.brand);
        const patterns = Array.from(
          new Set(brandTyres.map((t) => t.pattern).filter((p) => p !== ""))
        );
        setPatternOptions(patterns);
      }
    }
  };

  // Handle form input changes
  const handleChange = (field: keyof TyreInspectionFormData, value: any) => {
    setFormData((prevData) => {
      const newData = { ...prevData, [field]: value };

      // Auto-detect issues based on thresholds when these values change
      if (field === "treadDepth" || field === "pressure" || field === "sidewallCondition") {
        const detected = {
          treadDepthIssue:
            field === "treadDepth"
              ? parseFloat(value) < TYRE_THRESHOLDS.treadDepth.worn
              : prevData.detected.treadDepthIssue,

          pressureIssue:
            field === "pressure"
              ? parseFloat(value) < TYRE_THRESHOLDS.pressure.min ||
                parseFloat(value) > TYRE_THRESHOLDS.pressure.max
              : prevData.detected.pressureIssue,

          sidewallIssue:
            field === "sidewallCondition"
              ? value === "bulge" || value === "severe_damage"
              : prevData.detected.sidewallIssue,
        };

        return { ...newData, detected };
      }

      // Handle brand change to update pattern options
      if (field === "brand") {
        const brandTyres = getTyresByBrand(value);
        const patterns = Array.from(
          new Set(brandTyres.map((t) => t.pattern).filter((p) => p !== ""))
        );
        setPatternOptions(patterns);
      }

      // Handle size change to update brand options
      if (field === "size") {
        const sizeTyres = getTyresBySize(value);
        const brands = Array.from(new Set(sizeTyres.map((t) => t.brand)));
        setBrandOptions(brands);

        // Also update the tyre size structure
        const tyreSize = parseTyreSize(value);
        if (tyreSize.width > 0) {
          return { ...newData, tyreSize };
        }
      }

      return newData;
    });
  };

  // Toggle new tyre fields
  const handleToggleNewTyreFields = () => {
    setShowNewTyreFields(!showNewTyreFields);
  };

  // Toggle inspection history
  const handleToggleInspectionHistory = () => {
    if (selectedTyre) {
      setShowInspectionHistory(!showInspectionHistory);
    }
  };

  // Handle photo upload (placeholder for real implementation)
  const handlePhotoUpload = () => {
    // In a real implementation, this would handle the file upload process
    alert("Photo upload feature coming soon.");

    // Mock adding a photo URL to demonstrate the UI flow
    setFormData((prevData) => ({
      ...prevData,
      photos: [...prevData.photos, `photo_${prevData.photos.length + 1}.jpg`],
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.inspector ||
      !formData.fleetNumber ||
      !formData.tyrePosition ||
      !formData.treadDepth ||
      !formData.pressure
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Determine overall status based on detected issues
      const status =
        formData.detected.treadDepthIssue &&
        parseFloat(formData.treadDepth) < TYRE_THRESHOLDS.treadDepth.worn
          ? "urgent"
          : formData.detected.treadDepthIssue ||
              formData.detected.pressureIssue ||
              formData.detected.sidewallIssue
            ? "worn"
            : "good";

      // Create inspection entry
      const inspectionEntry: TyreInspectionEntry = {
        id: `insp_${Date.now()}`,
        date: formData.date,
        inspector: formData.inspector,
        treadDepth: parseFloat(formData.treadDepth),
        pressure: parseFloat(formData.pressure),
        temperature: 0, // Required field with default value
        condition: status, // Required field
        notes: formData.remarks ?? "", // Required field
        // sidewallCondition: formData.sidewallCondition, // Removed, not in TyreInspectionEntry
        remarks: formData.remarks,
        photos: formData.photos,
        status,
        timestamp: new Date().toISOString(),
        images: [], // Optional field
      };

      // Prepare inspection record for Firestore
      const inspectionRecord = {
        ...inspectionEntry,
        fleetNumber: formData.fleetNumber,
        tyrePosition: formData.tyrePosition,
        brand: formData.brand,
        pattern: formData.pattern,
        size: formData.size,
        serialNumber: formData.serialNumber,
        dotCode: formData.dotCode,
        supplier: formData.supplier,
        tyreSize: formData.tyreSize,
        cost: parseFloat(formData.cost ?? "0"),
        estimatedLifespan: parseFloat(formData.estimatedLifespan ?? "0"),
        currentMileage: parseFloat(formData.currentMileage ?? "0"),
        costPerKm: calculateCostPerKm() ?? 0,
        // If we have a selected tyre, include its ID for reference
        tyreId: selectedTyre?.id ?? null,
      };

      // In a real app, this would save to Firestore
      // await createOrUpdateDoc('tyreInspections', `inspection_${Date.now()}`, inspectionRecord);

      // If selected tyre exists, update its inspection history
      if (selectedTyre) {
        const updatedTyre = {
          ...selectedTyre,
          treadDepth: parseFloat(formData.treadDepth),
          pressure: parseFloat(formData.pressure),
          status,
          lastInspectionDate: formData.date,
          // Add the new inspection to history
          maintenanceHistory: {
            ...selectedTyre.maintenanceHistory,
            inspections: [...(selectedTyre.maintenanceHistory?.inspections ?? []), inspectionEntry],
          },
        };

        // In a real app, update the tyre in Firestore
        // await createOrUpdateDoc('tyres', selectedTyre.id, updatedTyre);
        console.log("Updating tyre with new inspection:", updatedTyre);
      }

      // Check if a fault or job card should be created
      if (status === "urgent") {
        // In a real app, this would create a job card or add to fault list
        console.log("Creating urgent tyre job card for", inspectionRecord);
        // await createOrUpdateDoc('faults', `fault_${Date.now()}`, {
        //   type: 'tyre',
        //   severity: 'critical',
        //   description: `Urgent tyre replacement needed: ${formData.fleetNumber} - ${formData.tyrePosition}`,
        //   inspectionId: inspectionEntry.id,
        //   status: 'open',
        //   timestamp: new Date().toISOString(),
        // });
      }

      // Simulate successful save
      setTimeout(() => {
        setSuccess(true);
        setIsSubmitting(false);

        // Reset form after a delay
        setTimeout(() => {
          setSuccess(false);
          setFormData({
            date: new Date().toISOString().split("T")[0],
            inspector: formData.inspector, // Keep the inspector name
            fleetNumber: "",
            tyrePosition: "",
            treadDepth: "",
            pressure: "",
            sidewallCondition: "good",
            remarks: "",
            photos: [],
            brand: "",
            pattern: "",
            size: "",
            serialNumber: "",
            dotCode: "",
            supplier: "",
            tyreSize: { width: 0, aspectRatio: 0, rimDiameter: 0 },
            cost: "",
            estimatedLifespan: "",
            currentMileage: "",
            detected: {
              treadDepthIssue: false,
              pressureIssue: false,
              sidewallIssue: false,
            },
          });
          setSelectedTyre(null);
          setShowNewTyreFields(false);
          setShowInspectionHistory(false);
        }, 2000);
      }, 1000);
    } catch (error) {
      console.error("Error saving inspection:", error);
      setError("Failed to save inspection. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Determine if there are any detected issues
  const hasIssues =
    formData.detected.treadDepthIssue ||
    formData.detected.pressureIssue ||
    formData.detected.sidewallIssue;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tyre Inspection</h1>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-green-800 font-medium">Inspection saved successfully</h3>
          </div>
          {hasIssues && (
            <p className="mt-2 text-green-700">Issues were detected and logged to the system.</p>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Vehicle Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Vehicle Selection</h2>

            <div className="space-y-4">
              <VehicleSelector
                value={formData.fleetNumber}
                onChange={(value) => setFormData((prev) => ({ ...prev, fleetNumber: value }))}
                label="Fleet Number"
                placeholder="Select vehicle for inspection..."
                activeOnly={false}
                showDetails
              />

              <Input
                label="Inspector"
                value={formData.inspector}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleChange("inspector", e.target.value)
                }
                placeholder="Your name"
                required
              />

              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleChange("date", e.target.value)
                }
                required
              />
            </div>
          </div>

          {/* Inspection Form - Only shown when a tyre is selected */}
          {selectedTyre && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Inspection Data</h2>

                {selectedTyre.maintenanceHistory?.inspections &&
                  selectedTyre.maintenanceHistory?.inspections.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleInspectionHistory}
                      icon={<ShoppingBag className="w-4 h-4" />}
                    >
                      {showInspectionHistory ? "Hide History" : "View History"}
                    </Button>
                  )}
              </div>

              {showInspectionHistory ? (
                // Inspection History View
                <div className="space-y-4">
                  <div className="text-sm text-gray-500 mb-4">
                    Showing inspection history for {selectedTyre.brand} {selectedTyre.model} (
                    {selectedTyre.serialNumber})
                  </div>

                  {/* Tread Depth Chart */}
                  {selectedTyre.maintenanceHistory?.inspections &&
                  selectedTyre.maintenanceHistory?.inspections.length > 0 ? (
                    <>
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-700 mb-2">Tread Depth History</h4>
                        <div className="h-24 flex items-end space-x-1">
                          {selectedTyre.maintenanceHistory.inspections.map((insp, index) => {
                            const height = Math.min(100, (insp.treadDepth / 10) * 100);
                            return (
                              <div key={index} className="flex flex-col items-center">
                                <div
                                  className={`w-10 rounded-t transition-all ${
                                    insp.treadDepth > 6
                                      ? "bg-green-500"
                                      : insp.treadDepth > 3
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                  }`}
                                  style={{ height: `${height}%` }}
                                 />
                                <div className="text-xs mt-1 w-10 text-center">
                                  {new Date(insp.date).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Inspection Table */}
                      <div className="border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Date
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Inspector
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Tread
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                PSI
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedTyre.maintenanceHistory.inspections.map((insp, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                  {new Date(insp.date).toLocaleDateString()}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                  {insp.inspector}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                  {insp.treadDepth} mm
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                  {insp.pressure} PSI
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                  <span
                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                    ${
                                      insp.condition === "good"
                                        ? "bg-green-100 text-green-800"
                                        : insp.condition === "warning"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {insp.condition}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-8 text-gray-500">
                      No inspection history available for this tyre.
                    </div>
                  )}
                </div>
              ) : (
                // Inspection Form
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Selected Tyre</p>
                    <p className="font-medium">
                      {selectedTyre.brand} {selectedTyre.model}
                    </p>
                    <div className="flex items-center">
                      <p className="text-sm">
                        Position:{" "}
                        <span className="font-medium capitalize">
                          {selectedTyre.installation?.position?.replace(/-/g, " ")}
                        </span>
                      </p>
                      <div className="ml-2 flex items-center text-sm text-gray-500">
                        <Ruler className="w-3 h-3 mr-1" />
                        <span>{formatTyreSize(selectedTyre.size)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tyre Details Section */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-md font-medium">Tyre Specifications</h3>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleToggleNewTyreFields}
                        icon={<ShoppingBag className="w-4 h-4" />}
                        size="sm"
                      >
                        {showNewTyreFields ? "Hide New Tyre Options" : "Show New Tyre Options"}
                      </Button>
                    </div>

                    {showNewTyreFields && (
                      <div className="space-y-3 mb-4">
                        <Select
                          label="Size"
                          value={formData.size}
                          onChange={(value) => handleChange("size", value)}
                          options={getUniqueTyreSizes().map((size: string) => ({
                            label: size,
                            value: size,
                          }))}
                        />

                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            label="Width"
                            type="number"
                            value={formData.tyreSize.width.toString()}
                            onChange={(e) =>
                              handleChange("tyreSize", {
                                ...formData.tyreSize,
                                width: parseInt((e.target ? e.target.value : e) as string, 10) || 0,
                              })
                            }
                            placeholder="e.g., 315"
                          />
                          <Input
                            label="Aspect Ratio"
                            type="number"
                            value={formData.tyreSize.aspectRatio.toString()}
                            onChange={(e) => {
                              const value =
                                typeof e === "string" ? e : e && e.target ? e.target.value : "";
                              handleChange("tyreSize", {
                                ...formData.tyreSize,
                                aspectRatio: parseInt(value, 10) || 0,
                              });
                            }}
                            placeholder="e.g., 80"
                          />
                          <Input
                            label="Rim Diameter"
                            type="number"
                            step="0.1"
                            value={formData.tyreSize.rimDiameter.toString()}
                            onChange={(e) => {
                              const value =
                                typeof e === "string" ? e : e && e.target ? e.target.value : "";
                              handleChange("tyreSize", {
                                ...formData.tyreSize,
                                rimDiameter: parseFloat(value) || 0,
                              });
                            }}
                            placeholder="e.g., 22.5"
                          />
                        </div>

                        <Select
                          label="Brand"
                          value={formData.brand}
                          onChange={(value) => handleChange("brand", value)}
                          options={brandOptions.map((brand) => ({ label: brand, value: brand }))}
                        />

                        {formData.brand && (
                          <Select
                            label="Pattern"
                            value={formData.pattern}
                            onChange={(value) => handleChange("pattern", value)}
                            options={patternOptions.map((pattern) => ({
                              label: pattern,
                              value: pattern,
                            }))}
                          />
                        )}

                        <Input
                          label="Serial Number"
                          value={formData.serialNumber}
                          onChange={(value) => handleChange("serialNumber", value)}
                          placeholder="Tyre serial number"
                        />

                        <Input
                          label="DOT Code"
                          value={formData.dotCode}
                          onChange={(value) => handleChange("dotCode", value)}
                          placeholder="DOT code from sidewall"
                        />

                        <Select
                          label="Supplier"
                          value={formData.supplier}
                          onChange={(value) => handleChange("supplier", value)}
                          options={[
                            { label: "Select supplier...", value: "" },
                            ...VENDORS.map((v) => ({
                              label: v.name,
                              value: v.id,
                            })),
                          ]}
                        />

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                          <Input
                            label="Cost ($)"
                            type="number"
                            step="0.01"
                            value={formData.cost}
                            onChange={(value) => handleChange("cost", value)}
                            placeholder="Purchase cost"
                          />
                          <Input
                            label="Est. Lifespan (km)"
                            type="number"
                            value={formData.estimatedLifespan}
                            onChange={(value) => handleChange("estimatedLifespan", value)}
                            placeholder="Expected km"
                          />
                          <Input
                            label="Current Mileage"
                            type="number"
                            value={formData.currentMileage}
                            onChange={(value) => handleChange("currentMileage", value)}
                            placeholder="Current km"
                          />
                        </div>

                        {formData.cost && formData.estimatedLifespan && (
                          <div className="pt-2">
                            <p className="text-xs text-gray-500">Cost per KM</p>
                            <p className="font-medium">${calculateCostPerKm() ?? "N/A"}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Input
                    label="Tread Depth (mm)"
                    type="number"
                    value={formData.treadDepth}
                    onChange={(value) => handleChange("treadDepth", value)}
                    placeholder="Enter measurement in mm"
                    min="0"
                    step="0.1"
                    required
                    error={
                      formData.detected.treadDepthIssue ? "Tread depth below threshold" : undefined
                    }
                  />

                  <Input
                    label="Pressure (PSI)"
                    type="number"
                    value={formData.pressure}
                    onChange={(value) => handleChange("pressure", value)}
                    placeholder="Enter measurement in PSI"
                    min="0"
                    step="1"
                    required
                    error={
                      formData.detected.pressureIssue ? "Pressure outside normal range" : undefined
                    }
                  />

                  <Select
                    label="Sidewall Condition"
                    value={formData.sidewallCondition}
                    onChange={(value) => handleChange("sidewallCondition", value)}
                    options={SIDEWALL_CONDITIONS.map((cond) => ({
                      label: cond.label,
                      value: cond.value,
                    }))}
                    error={
                      formData.detected.sidewallIssue
                        ? "Sidewall condition requires attention"
                        : undefined
                    }
                  />

                  <TextArea
                    label="Remarks"
                    value={formData.remarks}
                    onChange={(value) => handleChange("remarks", value)}
                    placeholder="Additional observations or notes..."
                    rows={3}
                  />

                  {/* Photo Upload (Placeholder) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Photos (Optional)
                    </label>
                    <div className="flex items-center space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePhotoUpload}
                        icon={<Camera className="w-4 h-4" />}
                        size="sm"
                      >
                        Take Photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePhotoUpload}
                        icon={<Upload className="w-4 h-4" />}
                        size="sm"
                      >
                        Upload
                      </Button>
                    </div>

                    {/* Uploaded Photos Preview */}
                    {formData.photos.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {formData.photos.map((_, index) => (
                          <div
                            key={index}
                            className="h-20 bg-gray-100 rounded flex items-center justify-center text-gray-500"
                          >
                            <p className="text-xs">Photo {index + 1}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Issues Warning */}
                  {hasIssues && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-3">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                        <h3 className="text-amber-800 font-medium text-sm">Issues Detected</h3>
                      </div>
                      <ul className="mt-1 list-disc list-inside text-sm text-amber-700">
                        {formData.detected.treadDepthIssue && (
                          <li>Tread depth below recommended threshold</li>
                        )}
                        {formData.detected.pressureIssue && (
                          <li>Tyre pressure outside normal range</li>
                        )}
                        {formData.detected.sidewallIssue && (
                          <li>Sidewall condition requires attention</li>
                        )}
                      </ul>
                      {formData.detected.treadDepthIssue &&
                        parseFloat(formData.treadDepth) < TYRE_THRESHOLDS.treadDepth.worn && (
                          <p className="mt-1 text-sm text-amber-700 font-bold">
                            A job card will be created for urgent tyre replacement.
                          </p>
                        )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleSubmit}
                      icon={<Save className="w-4 h-4" />}
                      isLoading={isSubmitting}
                      disabled={
                        !formData.inspector ||
                        !formData.treadDepth ||
                        !formData.pressure ||
                        isSubmitting
                      }
                      className="w-full"
                    >
                      Save Inspection
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Vehicle Tyre Diagram */}
        <div className="lg:col-span-2">
          {formData.fleetNumber ? (
            <VehicleTyreView
              selectedVehicle={formData.fleetNumber}
              onTyreSelect={handleTyreSelect}
            />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-lg font-medium mb-2">Select a Fleet Vehicle</p>
                <p className="text-sm">
                  To begin the inspection, select a vehicle from the dropdown menu.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Removed incorrect VehicleTyreViewProps interface
// interface VehicleTyreViewProps {
//   vehicleId: string;
//   onTyreSelect: (tyre: Tyre | null) => void;
// }

// Correct the TyreInspectionData interface
export interface TyreInspectionData {
  vehicleId: string;
  position: string;
  inspectorName: string;
  treadDepth: string;
  pressure: string;
  condition: TyreConditionStatus | "";
  damage: string;
  notes: string;
  photos: string[];
}

interface TyreInspectionFormProps {
  onSave: (data: TyreInspectionData) => void;
}

export const TyreInspectionForm: React.FC<TyreInspectionFormProps> = ({ onSave }) => {
  const [inspectionData, setInspectionData] = useState<TyreInspectionData>({
    vehicleId: "",
    position: "",
    inspectorName: "",
    treadDepth: "", // Default to empty string
    pressure: "", // Default to empty string
    condition: "good", // Default to 'good'
    damage: "",
    notes: "",
    photos: [],
  });

  const tyrePositions = [
    { label: "Front Left (FL)", value: "FL" },
    { label: "Front Right (FR)", value: "FR" },
    { label: "Rear Left Outer (RL1)", value: "RL1" },
    { label: "Rear Left Inner (RL2)", value: "RL2" },
    { label: "Rear Right Outer (RR1)", value: "RR1" },
    { label: "Rear Right Inner (RR2)", value: "RR2" },
  ];

  const conditionOptions = [
    { label: "Select condition...", value: "" },
    { label: "Good", value: "good" },
    { label: "Warning", value: "warning" },
    { label: "Critical", value: "critical" },
    { label: "Needs Replacement", value: "needs_replacement" },
  ];

  const damageTypes = [
    { label: "No damage", value: "none" },
    { label: "Uneven wear", value: "uneven_wear" },
    { label: "Cracking", value: "cracking" },
    { label: "Bulge", value: "bulge" },
    { label: "Puncture", value: "puncture" },
    { label: "Sidewall damage", value: "sidewall_damage" },
    { label: "Tread separation", value: "tread_separation" },
  ];

  const handleSave = () => {
    onSave(inspectionData);

    // Reset form
    setInspectionData({
      vehicleId: "",
      position: "",
      inspectorName: "",
      treadDepth: "",
      pressure: "",
      condition: "good",
      damage: "",
      notes: "",
      photos: [],
    });
  };

  return (
    <div className="space-y-4">
      <VehicleSelector
        value={inspectionData.vehicleId}
        onChange={(value: string) =>
          setInspectionData((prev: TyreInspectionData) => ({ ...prev, vehicleId: value }))
        }
        label="Vehicle"
        placeholder="Select vehicle for inspection..."
        activeOnly={false}
        showDetails
      />

      <Select
        label="Tyre Position"
        value={inspectionData.position}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setInspectionData((prev) => ({ ...prev, position: e.target.value }))
        }
        options={tyrePositions}
      />

      <Input
        label="Inspector Name"
        value={inspectionData.inspectorName}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setInspectionData((prev) => ({ ...prev, inspectorName: e.target.value }))
        }
        placeholder="Enter inspector name"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Tread Depth (mm)"
          type="number"
          step="0.1"
          value={inspectionData.treadDepth}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setInspectionData((prev) => ({ ...prev, treadDepth: e.target.value }))
          }
          placeholder="0.0"
        />

        <Input
          label="Tyre Pressure (PSI)"
          type="number"
          value={inspectionData.pressure}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setInspectionData((prev) => ({ ...prev, pressure: e.target.value }))
          }
          placeholder="0"
        />
      </div>

      <Select
        label="Overall Condition"
        value={inspectionData.condition}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setInspectionData((prev) => ({
            ...prev,
            condition: e.target.value as TyreConditionStatus | "",
          }))
        }
        options={conditionOptions}
      />

      <Select
        label="Damage Type"
        value={inspectionData.damage}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setInspectionData((prev) => ({ ...prev, damage: e.target.value }))
        }
        options={damageTypes}
      />

      <TextArea
        label="Additional Notes"
        value={inspectionData.notes}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          setInspectionData((prev) => ({ ...prev, notes: e.target.value }))
        }
        placeholder="Any additional observations or recommendations..."
        rows={4}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Photos</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Click to add photos</p>
          <Button variant="outline" size="sm" className="mt-2">
            Add Photos
          </Button>
        </div>
      </div>

      <Button
        onClick={handleSave}
        className="w-full"
        disabled={!inspectionData.vehicleId || !inspectionData.position}
      >
        <Save className="w-4 h-4 mr-2" />
        Save Inspection
      </Button>
    </div>
  );
};

export default TyreInspection;
