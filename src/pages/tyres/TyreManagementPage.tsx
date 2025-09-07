import {
  AlertCircle,
  Archive,
  BarChart3,
  CircleDashed,
  ClipboardList,
  DollarSign,
  Download,
  FileSearch,
  FileText,
  Gauge,
  Layout,
  Plus,
  RotateCw,
  Search,
  TrendingUp,
  Truck,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react"; // Added useMemo
import { Link } from "react-router-dom";
import TyreFormModal from "../../components/Models/Tyre/TyreFormModal";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
// Using the Tyre type directly from tyreData.ts instead of TyreModel
import { useTyreReferenceData } from "../../context/TyreReferenceDataContext";
// Renamed import to avoid conflict with local declaration
// Removed unused adaptTyreFormat import after local adapter implementation

// Import all necessary Enums and Types from your tyreData.ts file
// Ensure this path is correct relative to TyreManagementPage.tsx
import type {
  Tyre,
  TyreType,
  TyreStatus,
  TyreMountStatus,
  TyreConditionStatus,
} from "../../types/tyre";
import { TyreStoreLocation } from "../../types/tyre";

// Import tyre components that need to be integrated
import TyreAnalytics from "../../components/Tyremanagement/TyreAnalytics";
import { TyreCostAnalysis } from "../../components/Tyremanagement/TyreCostAnalysis";
import { TyreInventoryStats } from "../../components/Tyremanagement/TyreInventoryStats";
import TyrePerformanceReport from "../../components/Tyremanagement/TyrePerformanceReport";
import { TyreReportGenerator } from "../../components/Tyremanagement/TyreReportGenerator";
import { TyreReports } from "../../components/Tyremanagement/TyreReports";
import TyreDashboard from "./TyreDashboard";
// Define tabs for navigation
type TabType = "inventory" | "dashboard" | "analytics" | "reports";

/**
 * Local adapter to reshape Tyre[] (domain model) into shapes legacy dashboard/analytics expect.
 * Avoid name collision with imported adaptTyreFormat by keeping local function name.
 */
const adaptTyreFormatIfNeeded = (tyres: Tyre[], targetComponent: string) => {
  if (!tyres) return [];

  switch (targetComponent) {
    case "TyreDashboard":
      // TyreDashboard might expect additional calculated fields
      return tyres.map((tyre) => ({
        ...tyre,
        // Map any missing properties needed by TyreDashboard
        installDetails: tyre.installation
          ? {
              date: tyre.installation.installationDate,
              position: tyre.installation.position,
              mileage: tyre.installation.mileageAtInstallation,
              vehicle: tyre.installation.vehicleId,
            }
          : undefined,
        // Add any other fields needed by the dashboard
        condition: {
          ...tyre.condition,
          // Ensure these fields exist for compatibility
          currentDepth: tyre.condition?.treadDepth || 0,
          wearStatus: tyre.condition?.status || "unknown",
        },
        // Always ensure these properties exist
        type: tyre.type,
        size: tyre.size || { width: 0, aspectRatio: 0, rimDiameter: 0, displayString: "Unknown" },
        calculatedValue: tyre.condition?.treadDepth
          ? tyre.purchaseDetails?.cost / tyre.condition.treadDepth
          : 0,
        ageInDays: tyre.manufacturingDate
          ? Math.floor(
              (new Date().getTime() - new Date(tyre.manufacturingDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0,
      }));

    case "TyreCostAnalysis":
      // Ensure cost data is properly formatted
      return tyres.map((tyre) => ({
        ...tyre,
        costPerKm: tyre.kmRun > 0 ? tyre.purchaseDetails?.cost / (tyre.kmRun * 1.60934) : 0,
        totalCost: tyre.purchaseDetails?.cost || 0,
      }));

    case "TyrePerformanceReport":
      // Add performance metrics
      return tyres.map((tyre) => ({
        ...tyre,
        performance: {
          wearRate:
            tyre.kmRun > 0 && tyre.condition?.treadDepth
              ? ((10 - tyre.condition.treadDepth) / (tyre.kmRun * 1.60934)) * 10000
              : 0,
          costEfficiency: tyre.kmRun > 0 ? tyre.purchaseDetails?.cost / (tyre.kmRun * 1.60934) : 0,
        },
      }));

    case "TyreAnalytics":
      // Ensure analytics-specific fields are present
      return tyres.map((tyre) => ({
        ...tyre,
        metrics: {
          costPerMile: tyre.kmRun > 0 ? tyre.purchaseDetails?.cost / tyre.kmRun : 0,
          treadWearRate:
            tyre.kmRun > 0 && tyre.condition?.treadDepth
              ? ((10 - tyre.condition.treadDepth) / (tyre.kmRun * 1.60934)) * 10000
              : 0,
          expectedRemainingLife: tyre.condition?.treadDepth
            ? (tyre.condition.treadDepth / 10) * (tyre.kmRunLimit || 50000)
            : 0,
        },
      }));

    default:
      // Return the original format for most components
      return tyres;
  }
};

const TyreManagementPage: React.FC = () => {
  const [tyres, setTyres] = useState<Tyre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editTyre, setEditTyre] = useState<Tyre | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<TyreStatus | null>(null); // Changed type to TyreStatus
  const [activeTab, setActiveTab] = useState<TabType>("inventory");

  // Sub-tab states for Analytics and Reports sections
  const [analyticsSubTab, setAnalyticsSubTab] = useState<"overview" | "cost">("overview");
  const [reportsSubTab, setReportsSubTab] = useState<"summary" | "performance" | "generator">(
    "summary"
  );

  const { brands } = useTyreReferenceData();
  const [brandFilter, setBrandFilter] = useState<string>("all");

  // Define defaultNewTyre using Enum members and ensuring all required fields are present
  // This is wrapped in useMemo to prevent re-creation on every render, which is good practice.
  const defaultNewTyre: Partial<Tyre> = useMemo(
    () => ({
      serialNumber: `TY-${Math.floor(1000 + Math.random() * 9000)}`,
      dotCode: "",
      manufacturingDate: new Date().toISOString().slice(0, 10),
      brand: "",
      model: "",
      pattern: "",
      size: { width: 0, aspectRatio: 0, rimDiameter: 0 },
      loadIndex: 0,
      speedRating: "",
  type: ("steer" satisfies TyreType),
      purchaseDetails: {
        date: new Date().toISOString().slice(0, 10),
        cost: 0,
        supplier: "",
        warranty: "",
        invoiceNumber: "", // Added as it's optional but good to initialize
      },
      installation: {
        vehicleId: "",
        position: "SP",
        mileageAtInstallation: 0,
        installationDate: "",
        installedBy: "",
      },
      condition: {
        treadDepth: 20,
        pressure: 0,
        temperature: 0,
  status: "good" as TyreConditionStatus,
        lastInspectionDate: new Date().toISOString().slice(0, 10),
        nextInspectionDue: "", // Corrected: Ensures this required field is present
      },
  status: "new" as TyreStatus,
  mountStatus: "unmounted" as TyreMountStatus,
      maintenanceHistory: {
        rotations: [],
        repairs: [],
        inspections: [],
      },
      kmRun: 0,
      kmRunLimit: 60000,
      notes: "",
      location: TyreStoreLocation.HOLDING_BAY, // Corrected to use enum member
    }),
    []
  ); // Empty dependency array means it's created once

  // Function to fetch tyres from Firestore
  const fetchTyres = async () => {
    try {
      setLoading(true);

      // Dynamically import Firebase modules
      // Assuming 'db' is exported from '../../firebase'
      const { collection, query, getDocs, orderBy } = await import("firebase/firestore");
      const { db } = await import("../../firebase"); // Make sure this path is correct

      // Create a query against the 'tyres' collection
      const q = query(collection(db, "tyres"), orderBy("createdAt", "desc"));

      const querySnapshot = await getDocs(q);
      const tyreList: Tyre[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Tyre, "id">;
        tyreList.push({
          id: doc.id,
          ...data,
        } as Tyre);
      });

      setTyres(tyreList);
      setError(null);
    } catch (err) {
      console.error("Error fetching tyre data:", err);
      setError("Failed to load tyre inventory data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Load tyres on component mount
  useEffect(() => {
    fetchTyres();
  }, []);

  // Filter tyres based on search query and status filter
  const filteredTyres = tyres.filter((tyre) => {
    // Create a searchable string from relevant tyre properties
    const searchableText = [
      tyre.serialNumber,
      tyre.brand,
      tyre.model,
      tyre.pattern,
      tyre.size ? `${tyre.size.width}/${tyre.size.aspectRatio}R${tyre.size.rimDiameter}` : "",
      tyre.status,
      tyre.notes,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = !searchQuery || searchableText.includes(searchQuery.toLowerCase());
    // Directly compare with filterStatus, which is now TyreStatus or null
    const matchesFilter = !filterStatus || tyre.status === filterStatus;
    const matchesBrand = brandFilter === "all" || tyre.brand === brandFilter;
    return matchesSearch && matchesFilter && matchesBrand;
  });

  // Convert tyres to inventory format for TyreInventoryStats
  const inventoryData = tyres.map((tyre) => ({
    quantity: 1, // Each tyre is counted as 1
    minStock: 2, // Default minimum stock level
    cost: tyre.purchaseDetails?.cost || 0,
  }));

  // Handle adding a new tyre
  const handleAddTyre = async (data: Omit<Tyre, "id">): Promise<void> => {
    try {
      console.log("Adding new tyre:", data);

      // Dynamically import Firebase modules
      const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
      const { db } = await import("../../firebase");

      // Save to Firestore
      const docRef = await addDoc(collection(db, "tyres"), {
        ...data,
        createdAt: serverTimestamp(),
      });

      // Add the new tyre to the local state with the Firestore ID
      setTyres((prevTyres) => [
        {
          id: docRef.id,
          ...data,
        } as Tyre,
        ...prevTyres,
      ]);

      // Close the form
      setShowAddForm(false);

      // Show a success toast/notification (assuming react-hot-toast is installed and used)
      // toast.success("Tyre added successfully!");
      alert("Tyre added successfully!"); // Fallback to alert
    } catch (err) {
      console.error("Error adding tyre:", err);
      // toast.error("Failed to add tyre. Please try again.");
      alert("Failed to add tyre. Please try again."); // Fallback to alert
      throw err; // Re-throw to ensure Promise rejection
    }
  };

  // Handle updating an existing tyre
  const handleUpdateTyre = async (data: Tyre): Promise<void> => {
    try {
      if (!data.id) throw new Error("Tyre ID is required for updates");

      // Dynamically import Firebase modules
      const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore");
      const { db } = await import("../../firebase");

      // Reference to the tyre document
      const tyreRef = doc(db, "tyres", data.id);

      // Create a shallow copy without id field for update
      const dataWithoutId = { ...data } as any;
      delete (dataWithoutId).id;
      await updateDoc(tyreRef, { ...dataWithoutId, updatedAt: serverTimestamp() });

      // Update the tyre in the local state
      setTyres((prevTyres) => prevTyres.map((tyre) => (tyre.id === data.id ? data : tyre)));

      // Reset edit state
      setEditTyre(null);

      // Show success message
      // toast.success("Tyre updated successfully!");
      alert("Tyre updated successfully!"); // Fallback to alert
    } catch (err) {
      console.error("Error updating tyre:", err);
      // toast.error("Failed to update tyre. Please try again.");
      alert("Failed to update tyre. Please try again."); // Fallback to alert
      throw err; // Re-throw to ensure Promise rejection
    }
  };

  // Map TyreStatus enum values (domain) to legacy dashboard string statuses used in TyreDashboard logic
  const getStatusColor = (status: TyreStatus) => {
    switch (status) {
      case "in_service":
        return "text-green-600 bg-green-50";
      case "new":
      case "spare":
        return "text-blue-600 bg-blue-50";
      case "retreaded":
        return "text-amber-600 bg-amber-50";
      case "scrapped":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Convert domain Tyre -> legacy TyreDoc expected by TyreDashboard
  const toTyreDoc = (t: Tyre): any => ({
    id: t.id,
    brand: t.brand,
    model: t.model,
    serialNumber: t.serialNumber,
    size:
      t.size?.displayString ||
      (t.size ? `${t.size.width}/${t.size.aspectRatio}R${t.size.rimDiameter}` : ""),
    status: t.status, // keep enum value; dashboard just displays it
    location: t.location,
    vehicleId: t.installation?.vehicleId,
    vehicleReg: t.installation?.vehicleId,
    position: t.installation?.position,
    purchaseDate: t.purchaseDetails?.date || "",
    purchasePrice: t.purchaseDetails?.cost || 0,
    treadDepth: t.condition?.treadDepth,
    lastInspection: t.condition?.lastInspectionDate,
    notes: t.notes,
    kmRun: t.kmRun,
    kmRunLimit: t.kmRunLimit,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tyre Management</h1>
          <p className="text-gray-500">Manage your vehicle tyres and track their lifecycle</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            icon={<RotateCw className="w-4 h-4" />}
            onClick={() => {
              setLoading(true);
              setError(null);
              // Re-fetch data
              fetchTyres();
            }}
          >
            Refresh
          </Button>
          <Button variant="outline" icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddForm(true)}>
            Add New Tyre
          </Button>
          <Link to="/tyres/reference-data">
            <Button variant="outline">Reference Data</Button>
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === "dashboard"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <BarChart3 className="mr-2 h-5 w-5" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === "inventory"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Layout className="mr-2 h-5 w-5" />
            Inventory
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === "analytics"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Gauge className="mr-2 h-5 w-5" />
            Analytics
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === "reports"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <ClipboardList className="mr-2 h-5 w-5" />
            Reports
          </button>
        </nav>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="bg-white p-8 rounded-lg shadow flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700" />
          <span className="ml-3 text-gray-700">Loading tyre inventory...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
          <p className="text-red-700 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </p>
        </div>
      )}

      {/* Tab Content - Render different components based on active tab */}
      {!loading && !error && (
        <>
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-4">
                        <Archive className="text-blue-600 w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Tyres</p>
                        <p className="text-xl font-bold text-gray-900">{tyres.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-4">
                        <Truck className="text-green-600 w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">In Service</p>
                        <p className="text-xl font-bold text-gray-900">
                          {tyres.filter((t) => t.status === "in_service").length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-amber-100 rounded-lg mr-4">
                        <CircleDashed className="text-amber-600 w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Available (New/Spare)</p>
                        <p className="text-xl font-bold text-gray-900">
                          {
                            tyres.filter((t) => ["new", "spare"].includes(t.status as any)).length
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg mr-4">
                        <AlertCircle className="text-red-600 w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Retreaded/Scrapped</p>
                        <p className="text-xl font-bold text-gray-900">
                          {
                            tyres.filter((t) => ["retreaded", "scrapped"].includes(t.status as any)).length
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Render the TyreDashboard component */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Tyre Dashboard</h2>
                </CardHeader>
                <CardContent>
                  {tyres.length > 0 ? (
                    <TyreDashboard
                      tyres={tyres.map(toTyreDoc)}
                      stock={tyres.map((t) => ({
                        id: t.id || "",
                        name: `${t.brand} ${t.model}`,
                        quantity: 1,
                        reorderLevel: 5,
                        cost: t.purchaseDetails?.cost || 0,
                        lastUpdated: new Date().toISOString().slice(0, 10),
                        location: t.location || "Warehouse",
                      }))}
                      assignments={tyres
                        .filter((t) => t.installation?.vehicleId)
                        .map((t) => ({
                          tyreId: t.id || "",
                          vehicleReg: t.installation?.vehicleId || "",
                          position: t.installation?.position || "",
                        }))}
                    />
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No tyre data available for the dashboard.</p>
                      <p className="mt-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowAddForm(true)}
                          icon={<Plus className="w-4 h-4 mr-1" />}
                        >
                          Add Tyres
                        </Button>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              {/* Inventory Stats from TyreInventoryStats */}
              <TyreInventoryStats inventory={inventoryData} />

              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tyres by ID, size, manufacturer..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={filterStatus === null ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(null)}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === "in_service" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("in_service")}
                  >
                    In Service
                  </Button>
                  <Button
                    variant={filterStatus === "new" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("new")}
                  >
                    New
                  </Button>
                  <Button
                    variant={filterStatus === "spare" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("spare")}
                  >
                    Spare
                  </Button>
                  <Button
                    variant={filterStatus === "retreaded" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("retreaded")}
                  >
                    Retreaded
                  </Button>
                  <Button
                    variant={filterStatus === "scrapped" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("scrapped")}
                  >
                    Scrapped
                  </Button>
                  {brands?.length ? (
                    <select
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    >
                      <option value="all">All Brands</option>
                      {brands.map((b: any) => (
                        <option key={b.id || b.name} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>
              </div>

              {/* Tyres Table */}
              <Card>
                <CardHeader title="Tyre Inventory" />
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tyre Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Manufacturer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pattern
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vehicle
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTyres.map((tyre) => (
                          <tr key={tyre.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {tyre.serialNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {tyre.size
                                ? `${tyre.size.width}/${tyre.size.aspectRatio}R${tyre.size.rimDiameter}`
                                : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {tyre.brand}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {tyre.pattern}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tyre.status)}`}
                              >
                                {tyre.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {tyre.installation?.vehicleId || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {tyre.installation?.position || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-2">
                                <button
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit Tyre"
                                  onClick={() => setEditTyre(tyre)}
                                >
                                  <FileSearch className="w-4 h-4" />
                                </button>
                                <Link
                                  to={`/tyres/${tyre.id}/history`}
                                  className="text-green-600 hover:text-green-900"
                                  title="View History"
                                >
                                  <TrendingUp className="w-4 h-4" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {filteredTyres.length === 0 && (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-6 py-10 text-center text-sm text-gray-500"
                            >
                              No tyres found matching your search criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center p-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700" />
                  <span className="ml-3 text-gray-700">Loading analytics...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
                  <p className="text-red-700 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Error loading analytics data
                  </p>
                </div>
              ) : tyres.length === 0 ? (
                <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100 text-center">
                  <FileSearch className="h-12 w-12 mx-auto text-blue-500 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    No Tyre Data Available
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Please add some tyres to your inventory to see analytics.
                  </p>
                  <Button onClick={() => setShowAddForm(true)} icon={<Plus className="w-4 h-4" />}>
                    Add Your First Tyre
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="mb-6 border-b border-gray-200">
                    <div className="flex space-x-4 pb-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className={`${analyticsSubTab === "overview" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"} rounded-none px-2 py-1 h-auto`}
                        onClick={() => setAnalyticsSubTab("overview")}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Overview
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className={`${analyticsSubTab === "cost" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"} rounded-none px-2 py-1 h-auto`}
                        onClick={() => setAnalyticsSubTab("cost")}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Cost Analysis
                      </Button>
                    </div>
                  </div>

                  {analyticsSubTab === "overview" && <TyreAnalytics />}
                  {analyticsSubTab === "cost" && (
                    <TyreCostAnalysis tyreData={adaptTyreFormatIfNeeded(tyres, "TyreAnalytics")} />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center p-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700" />
                  <span className="ml-3 text-gray-700">Loading reports...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
                  <p className="text-red-700 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Error loading report data
                  </p>
                </div>
              ) : tyres.length === 0 ? (
                <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100 text-center">
                  <FileSearch className="h-12 w-12 mx-auto text-blue-500 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    No Tyre Data Available
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Please add some tyres to your inventory to see reports.
                  </p>
                  <Button onClick={() => setShowAddForm(true)} icon={<Plus className="w-4 h-4" />}>
                    Add Your First Tyre
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="mb-6 border-b border-gray-200">
                    <div className="flex space-x-4 pb-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className={`${reportsSubTab === "summary" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"} rounded-none px-2 py-1 h-auto`}
                        onClick={() => setReportsSubTab("summary")}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Summary Reports
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className={`${reportsSubTab === "performance" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"} rounded-none px-2 py-1 h-auto`}
                        onClick={() => setReportsSubTab("performance")}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Performance Reports
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className={`${reportsSubTab === "generator" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"} rounded-none px-2 py-1 h-auto`}
                        onClick={() => setReportsSubTab("generator")}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Report Generator
                      </Button>
                    </div>
                  </div>

                  {reportsSubTab === "summary" && <TyreReports />}
                  {reportsSubTab === "performance" && <TyrePerformanceReport />}
                  {reportsSubTab === "generator" && (
                    <TyreReportGenerator
                      onGenerateReport={(type, dateRange, brand) => {
                        console.log(
                          `Generating ${type} report for ${brand} over ${dateRange} days`
                        );
                        // Implementation for report generation would go here
                        alert(`Generated ${type} report for ${brand} over ${dateRange} days`);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Add Tyre Modal */}
      {showAddForm && (
        <TyreFormModal
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSubmit={async (tyreData: Partial<Tyre>): Promise<void> => {
            // Check if initialData.purchaseDetails.invoiceNumber is missing, set to empty string
            if (tyreData.purchaseDetails) {
              if (!tyreData.purchaseDetails.invoiceNumber) {
                tyreData.purchaseDetails.invoiceNumber = "";
              }
            } else {
              // Create a properly typed purchase details object
              tyreData.purchaseDetails = {
                date: new Date().toISOString().slice(0, 10),
                cost: 0,
                supplier: "",
                warranty: "",
                invoiceNumber: "",
              };
            }
            await handleAddTyre(tyreData as Omit<Tyre, "id">);
          }}
          editMode={false}
          initialData={defaultNewTyre} // Pass the memoized default new tyre data
        />
      )}

      {/* Edit Tyre Modal */}
      {editTyre && (
        <TyreFormModal
          isOpen={!!editTyre}
          onClose={() => setEditTyre(null)}
          onSubmit={async (tyreData: Partial<Tyre>): Promise<void> => {
            await handleUpdateTyre(tyreData as Tyre);
          }}
          editMode
          initialData={editTyre} // Pass the selected tyre directly
        />
      )}
    </div>
  );
};

export default TyreManagementPage;
