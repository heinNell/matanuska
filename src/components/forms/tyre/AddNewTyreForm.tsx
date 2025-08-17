import { Button } from "../../../components/ui/Button";
import { collection, getDocs, getFirestore, query } from "firebase/firestore";
import { Calendar, Plus, Ruler, Save, Truck, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTyreReferenceData } from "../../../context/TyreReferenceDataContext";
import VehiclePositionDiagram from "../../Tyremanagement/VehiclePositionDiagram";
import { Card, CardContent } from "../../ui/Card";

interface TyreData {
  id?: string;
  tyreNumber: string;
  tyreSize: string;
  type: string;
  pattern: string;
  manufacturer: string;
  year: string;
  cost: number;
  condition: "New" | "Used" | "Retreaded" | "Scrap";
  status: "In-Service" | "In-Stock" | "Repair" | "Scrap";
  vehicleAssigned: string;
  vehicleType?: "standard" | "reefer" | "horse" | "interlink"; // Added vehicle type
  axlePosition: string;
  mountStatus: "Mounted" | "Not Mounted" | "Removed";
  kmRun: number;
  kmLimit: number;
  treadDepth: number;
  notes: string;
  datePurchased?: string;
  lastInspection?: string;
}

interface AddNewTyreFormProps {
  onSubmit?: (data: TyreData) => void;
  onCancel?: () => void;
  initialData?: Partial<TyreData>;
}

const AddNewTyreForm: React.FC<AddNewTyreFormProps> = ({ onSubmit, onCancel, initialData }) => {
  // Use the reference data context for dynamic data
  const {
    brands,
    sizes,
    patterns,
    getPositionsForVehicleType,
    getPatternsForBrand,
    getPatternsForSize,
  } = useTyreReferenceData();

  const [formData, setFormData] = useState<TyreData>({
    tyreNumber: initialData?.tyreNumber || "",
    tyreSize: initialData?.tyreSize || "",
    type: initialData?.type || "",
    pattern: initialData?.pattern || "",
    manufacturer: initialData?.manufacturer || "",
    year: initialData?.year || new Date().getFullYear().toString(),
    cost: initialData?.cost || 0,
    condition: initialData?.condition || "New",
    status: initialData?.status || "In-Stock",
    vehicleAssigned: initialData?.vehicleAssigned || "",
    vehicleType: initialData?.vehicleType || "standard",
    axlePosition: initialData?.axlePosition || "",
    mountStatus: initialData?.mountStatus || "Not Mounted",
    kmRun: initialData?.kmRun || 0,
    kmLimit: initialData?.kmLimit || 60000,
    treadDepth: initialData?.treadDepth || 14,
    notes: initialData?.notes || "",
    datePurchased: initialData?.datePurchased || new Date().toISOString().split("T")[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof TyreData, string>>>({});

  // Default tyre sizes list, will be overridden by reference data context
  const [tyreSizes, setTyreSizes] = useState([
    "295/80R22.5",
    "315/80R22.5",
    "295/75R22.5",
    "11R22.5",
    "12R22.5",
    "385/65R22.5",
    "275/70R22.5",
  ]);

  // Update tyre sizes when reference data is loaded
  useEffect(() => {
    if (sizes && sizes.length > 0) {
      setTyreSizes(sizes.map((size) => size.size || size.id).sort());
    }
  }, [sizes]);

  // Legacy Firestore fetch (kept for backward compatibility)
  useEffect(() => {
    if (!sizes || sizes.length === 0) {
      const fetchTyreSizes = async () => {
        try {
          const db = getFirestore();
          const sizesQuery = query(collection(db, "tyreSizes"));
          const querySnapshot = await getDocs(sizesQuery);

          const fetchedSizes: string[] = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.size) {
              fetchedSizes.push(data.size);
            }
          });

          if (fetchedSizes.length > 0) {
            setTyreSizes(fetchedSizes.sort());
            console.log("Tyre sizes loaded from Firestore:", fetchedSizes);
          }
        } catch (error) {
          console.error("Error fetching tyre sizes:", error);
        }
      };

      fetchTyreSizes();
    }
  }, [sizes]);

  const tyreTypes = ["Drive", "Steer", "Trailer", "All-Position"];

  // Default manufacturers list, will be overridden by reference data context
  const [manufacturers, setManufacturers] = useState([
    "Michelin",
    "Goodyear",
    "Bridgestone",
    "Continental",
    "Pirelli",
    "Dunlop",
    "Kumho",
    "Yokohama",
    "Hankook",
    "Firestone",
  ]);

  // Update manufacturers when reference data is loaded
  useEffect(() => {
    if (brands && brands.length > 0) {
      setManufacturers(brands.map((brand) => brand.name || brand.id));
    }
  }, [brands]);

  // Get available patterns based on selected manufacturer and size
  const getAvailablePatterns = () => {
    if (!patterns) return [];

    let filteredPatterns = patterns;

    if (formData.manufacturer) {
      filteredPatterns = getPatternsForBrand(formData.manufacturer);
    }

    if (formData.tyreSize) {
      filteredPatterns = filteredPatterns.filter((pattern) =>
        getPatternsForSize(formData.tyreSize).some((p) => p.id === pattern.id)
      );
    }

    return filteredPatterns.map((pattern) => pattern.pattern || pattern.id);
  };

  // Get available vehicle positions based on vehicle type
  const getAvailablePositions = () => {
    const vehicleType = formData.vehicleType || "standard";

    if (!getPositionsForVehicleType) {
      return vehicleConfigurations[vehicleType]?.positions || [];
    }

    const positions = getPositionsForVehicleType(vehicleType);
    return positions || vehicleConfigurations[vehicleType]?.positions || [];
  };

  // Fetch tyre brands from Firestore (legacy support)
  useEffect(() => {
    const fetchTyreBrands = async () => {
      try {
        const db = getFirestore();
        const brandsQuery = query(collection(db, "tyreBrands"));
        const querySnapshot = await getDocs(brandsQuery);

        const brands: string[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.name) {
            brands.push(data.name);
          }
        });

        if (brands.length > 0) {
          setManufacturers(brands.sort());
          console.log("Tyre brands loaded from Firestore:", brands);
        }
      } catch (error) {
        console.error("Error fetching tyre brands:", error);
      }
    };

    fetchTyreBrands();
  }, []);

  // Standard axle positions (legacy format)
  const standardAxlePositions = [
    "Front Left",
    "Front Right",
    "Drive Axle Left Inner",
    "Drive Axle Left Outer",
    "Drive Axle Right Inner",
    "Drive Axle Right Outer",
    "Trailer Axle 1 Left",
    "Trailer Axle 1 Right",
    "Trailer Axle 2 Left",
    "Trailer Axle 2 Right",
    "Spare",
  ];

  // Vehicle-specific axle position configurations
  // State for storing vehicle configurations from Firestore
  const [vehicleConfigurations, setVehicleConfigurations] = useState<
    Record<
      string,
      {
        name: string;
        positions: Array<{ id: string; name: string }>;
      }
    >
  >({});

  // Vehicle type dropdown options (will be populated from Firestore)
  const [vehicleTypes, setVehicleTypes] = useState([
    { id: "standard", name: "Standard" },
    { id: "reefer", name: "Reefer (3-Axle Trailer)" },
    { id: "horse", name: "Horse (Truck Tractor)" },
    { id: "interlink", name: "Interlink (4-Axle Trailer)" },
    { id: "lmv", name: "Light Motor Vehicle (LMV)" },
  ]);

  // Fetch vehicle position configurations from Firestore
  useEffect(() => {
    const fetchVehiclePositions = async () => {
      try {
        const db = getFirestore();
        const vehiclePositionsQuery = query(collection(db, "vehiclePositions"));
        const querySnapshot = await getDocs(vehiclePositionsQuery);

        const configs: Record<
          string,
          {
            name: string;
            positions: Array<{ id: string; name: string }>;
          }
        > = {};

        const types: Array<{ id: string; name: string }> = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const vehicleType = doc.id;

          configs[vehicleType] = {
            name: data.name,
            positions: data.positions || [],
          };

          types.push({
            id: vehicleType,
            name: data.name,
          });
        });

        if (Object.keys(configs).length > 0) {
          setVehicleConfigurations(configs);
          setVehicleTypes(types);
          console.log("Vehicle positions loaded from Firestore:", configs);
        } else {
          console.warn("No vehicle positions found in Firestore, using defaults");
        }
      } catch (error) {
        console.error("Error fetching vehicle positions:", error);
      }
    };

    fetchVehiclePositions();
  }, []);

  // State for selected vehicle type and position mapping
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>(
    initialData?.vehicleType || "standard"
  );
  const [availablePositions, setAvailablePositions] = useState<Array<{ id: string; name: string }>>(
    () => {
      // Initially set to standard positions, will be updated when Firestore data loads
      return standardAxlePositions.map((pos) => ({ id: pos, name: pos }));
    }
  );

  // Update available positions when vehicleConfigurations loads from Firestore
  useEffect(() => {
    if (Object.keys(vehicleConfigurations).length > 0) {
      const vehicleType = formData.vehicleType || "standard";

      if (vehicleType === "standard") {
        setAvailablePositions(standardAxlePositions.map((pos) => ({ id: pos, name: pos })));
      } else if (vehicleType && vehicleConfigurations[vehicleType]) {
        setAvailablePositions(vehicleConfigurations[vehicleType].positions);
      }
    }
  }, [vehicleConfigurations, formData.vehicleType]);

  // Handle input changes
  // Handle vehicle type change
  const handleVehicleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vehicleType = e.target.value;
    setSelectedVehicleType(vehicleType);

    // Reset axle position when vehicle type changes
    setFormData((prev) => ({
      ...prev,
      axlePosition: "",
      vehicleType: vehicleType as "standard" | "reefer" | "horse" | "interlink",
    }));

    // Update available positions based on vehicle type
    if (vehicleType === "standard") {
      setAvailablePositions(standardAxlePositions.map((pos) => ({ id: pos, name: pos })));
    } else if (vehicleConfigurations[vehicleType]) {
      // Use the positions from the Firestore data
      setAvailablePositions(vehicleConfigurations[vehicleType].positions);
    } else {
      console.warn(`No positions found for vehicle type: ${vehicleType}, using standard positions`);
      setAvailablePositions(standardAxlePositions.map((pos) => ({ id: pos, name: pos })));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let parsedValue: any = value;

    if (type === "number") {
      parsedValue = value === "" ? "" : Number(value);
    }

    // Special handling for vehicleType
    if (name === "vehicleType") {
      handleVehicleTypeChange(e as React.ChangeEvent<HTMLSelectElement>);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: parsedValue }));

    if (errors[name as keyof TyreData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TyreData, string>> = {};
    if (!formData.tyreNumber) newErrors.tyreNumber = "Tyre number is required";
    if (!formData.tyreSize) newErrors.tyreSize = "Tyre size is required";
    if (!formData.type) newErrors.type = "Type is required";
    if (!formData.pattern) newErrors.pattern = "Pattern is required";
    if (!formData.manufacturer) newErrors.manufacturer = "Manufacturer is required";
    if (!formData.cost || formData.cost <= 0) newErrors.cost = "Cost must be greater than 0";
    if (!formData.datePurchased) newErrors.datePurchased = "Date purchased is required";
    // If mounted, vehicle and axle position are required
    if (formData.mountStatus === "Mounted") {
      if (!formData.vehicleAssigned)
        newErrors.vehicleAssigned = "Vehicle is required for mounted tyres";
      if (!formData.axlePosition)
        newErrors.axlePosition = "Axle position is required for mounted tyres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;
    setIsSubmitting(true);
    // Ensure datePurchased is ISO string
    const dataToSubmit = {
      ...formData,
      datePurchased: formData.datePurchased ? new Date(formData.datePurchased).toISOString() : null,
    };
    // Simulate API call
    setTimeout(() => {
      if (onSubmit) {
        onSubmit(dataToSubmit as TyreData);
      }
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            {initialData?.id ? "Edit Tyre" : "Add New Tyre"}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="lg:col-span-3">
              <h3 className="font-medium text-gray-700 mb-3">Tyre Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="tyreNumber"
                  >
                    Tyre Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="tyreNumber"
                    name="tyreNumber"
                    className={`w-full px-3 py-2 border ${errors.tyreNumber ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    value={formData.tyreNumber}
                    onChange={handleInputChange}
                  />
                  {errors.tyreNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.tyreNumber}</p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="tyreSize"
                  >
                    Tyre Size <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="tyreSize"
                    name="tyreSize"
                    className={`w-full px-3 py-2 border ${errors.tyreSize ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    value={formData.tyreSize}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Size</option>
                    {tyreSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  {errors.tyreSize && (
                    <p className="mt-1 text-sm text-red-600">{errors.tyreSize}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="type">
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Type</option>
                    {tyreTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="pattern">
                    Pattern
                  </label>
                  <select
                    id="pattern"
                    name="pattern"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.pattern}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Pattern</option>
                    {getAvailablePatterns().map((pattern) => (
                      <option key={pattern} value={pattern}>
                        {pattern}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Manufacturer Details */}
            <div className="lg:col-span-3">
              <h3 className="font-medium text-gray-700 mb-3">Manufacturer & Purchase Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="manufacturer"
                  >
                    Manufacturer <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="manufacturer"
                    name="manufacturer"
                    className={`w-full px-3 py-2 border ${errors.manufacturer ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Manufacturer</option>
                    {manufacturers.map((mfg) => (
                      <option key={mfg} value={mfg}>
                        {mfg}
                      </option>
                    ))}
                  </select>
                  {errors.manufacturer && (
                    <p className="mt-1 text-sm text-red-600">{errors.manufacturer}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="year">
                    Year
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <select
                      id="year"
                      name="year"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={formData.year}
                      onChange={handleInputChange}
                    >
                      {[...Array(5)].map((_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cost">
                    Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">R</span>
                    <input
                      type="number"
                      id="cost"
                      name="cost"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      value={formData.cost}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="datePurchased"
                  >
                    Date Purchased
                  </label>
                  <input
                    type="date"
                    id="datePurchased"
                    name="datePurchased"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.datePurchased}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="lg:col-span-3">
              <h3 className="font-medium text-gray-700 mb-3">Status & Condition</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="condition"
                  >
                    Condition
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.condition}
                    onChange={handleInputChange}
                  >
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                    <option value="Retreaded">Retreaded</option>
                    <option value="Scrap">Scrap</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
                    Tyre Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="In-Service">In-Service</option>
                    <option value="In-Stock">In-Stock</option>
                    <option value="Repair">Repair</option>
                    <option value="Scrap">Scrap</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="mountStatus"
                  >
                    Mount Status
                  </label>
                  <select
                    id="mountStatus"
                    name="mountStatus"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.mountStatus}
                    onChange={handleInputChange}
                  >
                    <option value="Not Mounted">Not Mounted</option>
                    <option value="Mounted">Mounted</option>
                    <option value="Removed">Removed</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="treadDepth"
                  >
                    Tread Depth (mm)
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                      type="number"
                      id="treadDepth"
                      name="treadDepth"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      step="0.1"
                      min="0"
                      max="20"
                      value={formData.treadDepth}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Assignment */}
            <div className="lg:col-span-3">
              <h3 className="font-medium text-gray-700 mb-3">Vehicle Assignment</h3>

              {/* Vehicle Position Diagram */}
              {formData.vehicleType && formData.mountStatus === "Mounted" && (
                <div className="mb-4">
                  <VehiclePositionDiagram
                    vehicleType={formData.vehicleType}
                    positions={availablePositions}
                    selectedPosition={formData.axlePosition}
                    onPositionClick={(positionId) => {
                      setFormData((prev) => ({
                        ...prev,
                        axlePosition: positionId,
                      }));
                      if (errors.axlePosition) {
                        setErrors((prev) => ({ ...prev, axlePosition: undefined }));
                      }
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="vehicleType"
                  >
                    Vehicle Type
                  </label>
                  <div className="relative">
                    <Truck className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <select
                      id="vehicleType"
                      name="vehicleType"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={selectedVehicleType}
                      onChange={handleVehicleTypeChange}
                    >
                      {vehicleTypes.map((vType) => (
                        <option key={vType.id} value={vType.id}>
                          {vType.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="vehicleAssigned"
                  >
                    Vehicle Assigned{" "}
                    {formData.mountStatus === "Mounted" && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Truck className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <select
                      id="vehicleAssigned"
                      name="vehicleAssigned"
                      className={`w-full pl-10 pr-3 py-2 border ${errors.vehicleAssigned ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      value={formData.vehicleAssigned}
                      onChange={handleInputChange}
                      disabled={formData.mountStatus !== "Mounted"}
                    >
                      <option value="">Select Vehicle</option>
                      <option value="MAT001">MAT001 - Volvo FH16</option>
                      <option value="MAT002">MAT002 - Mercedes Actros</option>
                      <option value="MAT003">MAT003 - Scania R450</option>
                      <option value="MAT004">MAT004 - MAN TGX</option>
                      <option value="MAT005">MAT005 - DAF XF</option>
                    </select>
                  </div>
                  {errors.vehicleAssigned && (
                    <p className="mt-1 text-sm text-red-600">{errors.vehicleAssigned}</p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="axlePosition"
                  >
                    Axle Position{" "}
                    {formData.mountStatus === "Mounted" && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    id="axlePosition"
                    name="axlePosition"
                    className={`w-full px-3 py-2 border ${errors.axlePosition ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    value={formData.axlePosition}
                    onChange={handleInputChange}
                    disabled={formData.mountStatus !== "Mounted"}
                  >
                    <option value="">Select Position</option>
                    {getAvailablePositions().map((pos: { id: string; name: string }) => (
                      <option key={pos.id} value={pos.id}>
                        {pos.name}
                      </option>
                    ))}
                  </select>
                  {errors.axlePosition && (
                    <p className="mt-1 text-sm text-red-600">{errors.axlePosition}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="kmRun">
                    KM Run
                  </label>
                  <input
                    type="number"
                    id="kmRun"
                    name="kmRun"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="0"
                    value={formData.kmRun}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="kmLimit">
                    KM Limit
                  </label>
                  <input
                    type="number"
                    id="kmLimit"
                    name="kmLimit"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="0"
                    value={formData.kmLimit}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Tyre Configuration Guide */}
            {selectedVehicleType !== "standard" && (
              <div className="lg:col-span-3 mt-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">
                    {selectedVehicleType === "reefer" && "REEFER (3-Axle Trailer, Single Tyres)"}
                    {selectedVehicleType === "horse" && "HORSE (Truck Tractor)"}
                    {selectedVehicleType === "interlink" &&
                      "INTERLINK (4-Axle Trailer, Dual Tyres)"}
                    Tyre Position Guide
                  </h4>
                  <div className="text-xs text-gray-600 font-mono whitespace-pre-wrap">
                    {selectedVehicleType === "reefer" &&
                      `
| Axle   | Left Side | Right Side |
|--------|-----------|------------|
| 1      | T1        | T2         |
| 2      | T3        | T4         |
| 3      | T5        | T6         |
| Spare  | SP1       | SP2        |

Array Format: [T1, T2, T3, T4, T5, T6, SP1, SP2]
                    `}
                    {selectedVehicleType === "horse" &&
                      `
| Axle   | Left Side | Right Side |
|--------|-----------|------------|
| 1      | V1        | V2         |
| 2      | V3, V4    | V5, V6     |
| 3      | V7, V8    | V9, V10    |
| Spare  |   SP      |            |

Array Format: [V1, V2, V3, V4, V5, V6, V7, V8, V9, V10, SP]
                    `}
                    {selectedVehicleType === "interlink" &&
                      `
| Axle     | Left Rear Outer | Left Rear Inner | Right Rear Outer | Right Rear Inner |
|----------|-----------------|-----------------|------------------|------------------|
| Axle 1   | T1              | T5              | T2               | T6               |
| Axle 2   | T3              | T7              | T4               | T8               |
| Axle 3   | T9              | T13             | T10              | T14              |
| Axle 4   | T11             | T15             | T12              | T16              |
| Spare    | SP1             | SP2             |                  |                  |

Array Format: [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14, T15, T16, SP1, SP2]
                    `}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Additional notes or observations about this tyre..."
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                icon={<X className="w-4 h-4 mr-2" />}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              icon={<Save className="w-4 h-4 mr-2" />}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : initialData?.id ? "Update Tyre" : "Add Tyre"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddNewTyreForm;
