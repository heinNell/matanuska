import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input, Select, TextArea } from "../../components/ui/FormElements";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { TYRE_REFERENCE_DATA } from "../../data/tyreReferenceData";
import React, { useState } from "react";
import TyreInventoryFilters from "./TyreInventoryFilters";
// Placeholder for missing module
import { Badge } from "../../components/ui/badge";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Download,
  Edit,
  Eye,
  Package,
  Plus,
} from "lucide-react";

interface TyreSize {
  width: number;
  aspectRatio: number;
  rimDiameter: number;
}

interface TyreCondition {
  treadDepth: number;
  pressure: number;
  status: "good" | "warning" | "critical" | "needs_replacement";
  lastInspection: string;
}

interface TyreInspection {
  inspectionId: string;
  date: string;
  inspector: string;
  treadDepth: number;
  pressure: number;
  condition: string;
  notes: string;
}

interface Tyre {
  tyreId: string;
  serialNumber: string;
  dotCode: string;
  manufacturingDate: string;
  brand: string;
  model: string;
  pattern: string;
  size: TyreSize;
  loadIndex: number;
  speedRating: string;
  type: "steer" | "drive" | "trailer" | "spare";
  purchaseDetails: {
    date: string;
    cost: number;
    supplier: string;
    warranty: string;
  };
  installation: {
    vehicleId: string;
    position: string;
    mileageAtInstallation: number;
    installationDate: string;
  };
  condition: TyreCondition;
  status: "new" | "used" | "retreaded" | "scrapped";
  mountStatus: "on_vehicle" | "in_store" | "spare";
  kmRun: number;
  kmRunLimit: number;
  inspectionHistory: TyreInspection[];
  notes: string;
}

// Replace hardcoded values with TYRE_REFERENCE_DATA
const TYRE_BRANDS = TYRE_REFERENCE_DATA.brands;
// const TYRE_PATTERNS = TYRE_REFERENCE_DATA.patterns;
// const TYRE_SIZES = TYRE_REFERENCE_DATA.sizes;

const TYRE_TYPES = [
  { label: "Steer", value: "steer" },
  { label: "Drive", value: "drive" },
  { label: "Trailer", value: "trailer" },
  { label: "Spare", value: "spare" },
];

// Add the provided tyre reference list
const TYRE_REFERENCE_LIST = [
  { brand: "Firemax", pattern: "", size: "315/80R22.5", position: "Drive" },
  { brand: "TRIANGLE", pattern: "TR688", size: "315/80R22.5", position: "Drive" },
  { brand: "Terraking", pattern: "HS102", size: "315/80R22.5", position: "Drive" },
  { brand: "Compasal", pattern: "TR688", size: "315/80R22.5", position: "Drive" },
  { brand: "Windforce", pattern: "WD2020", size: "315/80R22.5", position: "Drive" },
  { brand: "Windforce", pattern: "WD2060", size: "315/80R22.5", position: "Drive" },
  { brand: "Compasal", pattern: "CPD82", size: "315/80R22.5", position: "Drive" },
  { brand: "Perelli", pattern: "FG01S", size: "315/80R22.5", position: "Drive" },
  { brand: "POWERTRAC", pattern: "TractionPro", size: "315/80R22.5", position: "Drive" },
  { brand: "SUNFULL", pattern: "HF638", size: "315/80R22.5", position: "Drive" },
  { brand: "SUNFULL", pattern: "HF768", size: "315/80R22.5", position: "Drive" },
  { brand: "FORMULA", pattern: "", size: "315/80R22.16", position: "Drive" },
  { brand: "PIRELLI", pattern: "", size: "315/80R22.17", position: "Drive" },
  { brand: "Wellplus", pattern: "WDM16", size: "315/80R22.5", position: "Drive" },
  // Add more entries as needed
];

export const TyreManagementSystem: React.FC = () => {
  const [tyres, setTyres] = useState<Tyre[]>([
    {
      tyreId: "TYR-001",
      serialNumber: "MIC2024001",
      dotCode: "DOT HJYR VOR2 0124",
      manufacturingDate: "2024-01-15",
      brand: "Michelin",
      model: "X Line Energy D",
      pattern: "TR688",
      size: { width: 315, aspectRatio: 80, rimDiameter: 22.5 },
      loadIndex: 152,
      speedRating: "L",
      type: "drive",
      purchaseDetails: {
        date: "2024-02-01",
        cost: 4500,
        supplier: "Tyre Pro Ltd",
        warranty: "2 years",
      },
      installation: {
        vehicleId: "14L",
        position: "POS3",
        mileageAtInstallation: 45000,
        installationDate: "2024-02-01",
      },
      condition: {
        treadDepth: 14.5,
        pressure: 110,
        status: "good",
        lastInspection: "2024-06-15",
      },
      status: "used",
      mountStatus: "on_vehicle",
      kmRun: 25000,
      kmRunLimit: 100000,
      inspectionHistory: [
        {
          inspectionId: "INS-001",
          date: "2024-06-15",
          inspector: "Workshop",
          treadDepth: 14.5,
          pressure: 110,
          condition: "good",
          notes: "Normal wear pattern",
        },
      ],
      notes: "Good condition, regular rotation schedule",
    },
  ]);

  const [activeTab, setActiveTab] = useState("inventory");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [newTyre, setNewTyre] = useState<Partial<Tyre>>({
    serialNumber: "",
    brand: "",
    model: "",
    pattern: "",
    size: { width: 315, aspectRatio: 80, rimDiameter: 22.5 },
    type: "drive",
    purchaseDetails: {
  date: new Date().toISOString().slice(0, 10),
      cost: 0,
      supplier: "",
      warranty: "2 years",
    },
    condition: {
      treadDepth: 20,
      pressure: 110,
      status: "good",
  lastInspection: new Date().toISOString().slice(0, 10),
    },
    status: "new",
    mountStatus: "in_store",
    kmRun: 0,
    kmRunLimit: 100000,
    notes: "",
  });

  const [availablePatterns, setAvailablePatterns] = useState<string[]>([]);

  const getConditionColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      case "needs_replacement":
        return "text-red-800 bg-red-200";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "text-blue-600 bg-blue-100";
      case "used":
        return "text-gray-600 bg-gray-100";
      case "retreaded":
        return "text-purple-600 bg-purple-100";
      case "scrapped":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const calculateCostPerKm = (tyre: Tyre) => {
    if (tyre.kmRun === 0) return 0;
    const kmRun = tyre.kmRun * 1.60934; // Convert miles to km
    return tyre.purchaseDetails.cost / kmRun;
  };

  const calculateRemainingLife = (tyre: Tyre) => {
    const currentTread = tyre.condition.treadDepth;
    const minimumTread = 3; // Legal minimum
    const newTyreDepth = 20; // Assume new tyre starts at 20mm

    const usedTread = newTyreDepth - currentTread;
    const remainingTread = currentTread - minimumTread;

    if (usedTread <= 0 || tyre.kmRun === 0) return 100000;

    const wearRate = usedTread / tyre.kmRun;
    return Math.max(remainingTread / wearRate, 0);
  };

  const filteredTyres = tyres.filter((tyre) => {
    const matchesSearch =
      searchTerm === "" ||
      tyre.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tyre.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = filterBrand === "" || tyre.brand === filterBrand;
    return matchesSearch && matchesBrand;
  });

  const handleAddTyre = () => {
    if (!newTyre.serialNumber || !newTyre.brand) {
      // Replace with UI-based error display
      console.error("Please fill in required fields");
      return;
    }

  const today = new Date().toISOString().slice(0, 10);

    // Deep-merge defaults to avoid any string | undefined issues
    const mergedPurchaseDetails = {
      date: newTyre.purchaseDetails?.date ?? today,
      cost: newTyre.purchaseDetails?.cost ?? 0,
      supplier: newTyre.purchaseDetails?.supplier ?? "",
      warranty: newTyre.purchaseDetails?.warranty ?? "2 years",
    };

    const mergedInstallation = {
      vehicleId: newTyre.installation?.vehicleId ?? "",
      position: newTyre.installation?.position ?? "",
      mileageAtInstallation: newTyre.installation?.mileageAtInstallation ?? 0,
      installationDate: newTyre.installation?.installationDate ?? "",
    };

    const mergedCondition = {
      treadDepth: newTyre.condition?.treadDepth ?? 20,
      pressure: newTyre.condition?.pressure ?? 110,
      status: newTyre.condition?.status ?? "good",
      lastInspection: newTyre.condition?.lastInspection ?? today,
    };

    const tyreToAdd: Tyre = {
      tyreId: `TYR-${Date.now()}`,
      serialNumber: newTyre.serialNumber ?? "",
      dotCode: newTyre.dotCode ?? "",
      manufacturingDate: newTyre.manufacturingDate ?? today,
      brand: newTyre.brand ?? "",
      model: newTyre.model ?? "",
      pattern: newTyre.pattern ?? "",
      size: newTyre.size ?? { width: 315, aspectRatio: 80, rimDiameter: 22.5 },
      loadIndex: newTyre.loadIndex ?? 152,
      speedRating: newTyre.speedRating ?? "L",
      type: newTyre.type ?? "drive",
      purchaseDetails: mergedPurchaseDetails,
      installation: mergedInstallation,
      condition: mergedCondition,
      status: newTyre.status ?? "new",
      mountStatus: newTyre.mountStatus ?? "in_store",
      kmRun: newTyre.kmRun ?? 0,
      kmRunLimit: newTyre.kmRunLimit ?? 100000,
      inspectionHistory: [],
      notes: newTyre.notes ?? "",
    };

    setTyres((prev) => [...prev, tyreToAdd]);
    setShowAddForm(false);

    // Reset form
    setNewTyre({
      serialNumber: "",
      brand: "",
      model: "",
      pattern: "",
      size: { width: 315, aspectRatio: 80, rimDiameter: 22.5 },
      type: "drive",
      purchaseDetails: {
  date: new Date().toISOString().slice(0, 10),
        cost: 0,
        supplier: "",
        warranty: "2 years",
      },
      condition: {
        treadDepth: 20,
        pressure: 110,
        status: "good",
  lastInspection: new Date().toISOString().slice(0, 10),
      },
      status: "new",
      mountStatus: "in_store",
      kmRun: 0,
      kmRunLimit: 100000,
      notes: "",
    });

    // Replace with UI-based success message
    console.log("New tyre has been added to inventory");
  };

  const exportToCSV = () => {
    const headers = [
      "Tyre ID",
      "Serial Number",
      "Brand",
      "Model",
      "Pattern",
      "Size",
      "Type",
      "Status",
      "Condition",
      "Vehicle",
      "Position",
      "Miles Run",
      "Tread Depth",
      "Pressure",
      "Cost",
      "Cost per KM",
      "Remaining Life",
      "Last Inspection",
    ];

    const csvData = filteredTyres.map((tyre) => [
      tyre.tyreId,
      tyre.serialNumber,
      tyre.brand,
      tyre.model,
      tyre.pattern,
      `${tyre.size.width}/${tyre.size.aspectRatio}R${tyre.size.rimDiameter}`,
      tyre.type,
      tyre.status,
      tyre.condition.status,
      tyre.installation.vehicleId,
      tyre.installation.position,
      tyre.kmRun,
      tyre.condition.treadDepth,
      tyre.condition.pressure,
      tyre.purchaseDetails.cost,
      calculateCostPerKm(tyre).toFixed(3),
      Math.round(calculateRemainingLife(tyre)),
      tyre.condition.lastInspection,
    ]);

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tyre-inventory.csv";
    a.click();
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setNewTyre((prev) => ({ ...prev, brand: value }));
    const patterns = TYRE_REFERENCE_LIST.filter((item) => item.brand === value).map(
      (item) => item.pattern
    );
    setAvailablePatterns(patterns);
  };

  const handlePatternChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setNewTyre((prev) => ({ ...prev, pattern: value }));
  };

  const handleButtonClick = (action: string) => {
    switch (action) {
      case "export":
        exportToCSV();
        break;
      case "addTyre":
        setShowAddForm(true);
        break;
      case "closeModal":
        setShowAddForm(false);
        break;
      case "submitTyre":
        handleAddTyre();
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tyre Management System</h1>
          <p className="text-gray-600">Complete tyre lifecycle management and analytics</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleButtonClick("export")}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => handleButtonClick("addTyre")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Tyre
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inventory">Tyre Inventory</TabsTrigger>
          <TabsTrigger value="analytics">Cost Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <TyreInventoryFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                brandFilter={filterBrand}
                setBrandFilter={setFilterBrand}
                brands={TYRE_BRANDS}
              />
            </CardContent>
          </Card>

          {/* Tyre Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tyre Inventory ({filteredTyres.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTyres.map((tyre) => (
                  <div key={tyre.tyreId} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold">{tyre.serialNumber}</h4>
                          <Badge className={getStatusColor(tyre.status)}>
                            {tyre.status.toUpperCase()}
                          </Badge>
                          <Badge className={getConditionColor(tyre.condition.status)}>
                            {tyre.condition.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Brand/Pattern</p>
                            <p className="font-medium">
                              {tyre.brand} {tyre.pattern}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Size</p>
                            <p className="font-medium">
                              {tyre.size.width}/{tyre.size.aspectRatio}R{tyre.size.rimDiameter}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Vehicle/Position</p>
                            <p className="font-medium">
                              {tyre.installation.vehicleId
                                ? `${tyre.installation.vehicleId} - ${tyre.installation.position}`
                                : "In Store"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Tread Depth</p>
                            <p className="font-medium">{tyre.condition.treadDepth}mm</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Miles Run</p>
                            <p className="font-medium">{tyre.kmRun.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Cost/KM</p>
                            <p className="font-medium">R{calculateCostPerKm(tyre).toFixed(3)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Cost Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Total Tyres</p>
                    <p className="text-2xl font-bold">{tyres.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Good Condition</p>
                    <p className="text-2xl font-bold text-green-600">
                      {tyres.filter((t) => t.condition.status === "good").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Needs Attention</p>
                    <p className="text-2xl font-bold text-red-600">
                      {
                        tyres.filter(
                          (t) =>
                            t.condition.status === "critical" ||
                            t.condition.status === "needs_replacement"
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Avg Cost/KM</p>
                    <p className="text-2xl font-bold">
                      R
                      {(
                        tyres.reduce((sum, t) => sum + calculateCostPerKm(t), 0) / tyres.length
                      ).toFixed(3)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Tyre Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Tyre</h2>
              <Button variant="outline" onClick={() => handleButtonClick("closeModal")}>
                Cancel
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Serial Number *"
                  value={newTyre.serialNumber || ""}
                  onChange={(e) =>
                    setNewTyre((prev) => ({ ...prev, serialNumber: e.target.value }))
                  }
                  placeholder="Enter serial number"
                />
                <Select
                  label="Brand *"
                  value={newTyre.brand || ""}
                  onChange={handleBrandChange}
                  options={[
                    { label: "Select brand...", value: "" },
                    ...TYRE_REFERENCE_LIST.map((item) => ({
                      label: item.brand,
                      value: item.brand,
                    })).filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i),
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Model"
                  value={newTyre.model || ""}
                  onChange={(e) => setNewTyre((prev) => ({ ...prev, model: e.target.value }))}
                  placeholder="Enter model"
                />
                <Select
                  label="Pattern"
                  value={newTyre.pattern || ""}
                  onChange={handlePatternChange}
                  options={[
                    { label: "Select pattern...", value: "" },
                    ...availablePatterns.map((pattern) => ({ label: pattern, value: pattern })),
                  ]}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Width (mm)"
                  type="number"
                  value={String(newTyre.size?.width || 315)}
                  onChange={(e) => {
                    const width = parseInt(e.target.value) || 315;
                    setNewTyre((prev) => ({ ...prev, size: { ...prev.size!, width } }));
                  }}
                />
                <Input
                  label="Aspect Ratio (%)"
                  type="number"
                  value={String(newTyre.size?.aspectRatio || 80)}
                  onChange={(e) => {
                    const aspectRatio = parseInt(e.target.value) || 80;
                    setNewTyre((prev) => ({ ...prev, size: { ...prev.size!, aspectRatio } }));
                  }}
                />
                <Input
                  label="Rim Diameter (in)"
                  type="number"
                  value={String(newTyre.size?.rimDiameter || 22.5)}
                  onChange={(e) => {
                    const rimDiameter = parseFloat(e.target.value) || 22.5;
                    setNewTyre((prev) => ({ ...prev, size: { ...prev.size!, rimDiameter } }));
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Type"
                  value={newTyre.type || "drive"}
                  onChange={(e) => setNewTyre((prev) => ({ ...prev, type: e.target.value as any }))}
                  options={TYRE_TYPES}
                />
              </div>

              <TextArea
                label="Notes"
                value={newTyre.notes || ""}
                onChange={(e) => setNewTyre((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
              />

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleButtonClick("closeModal")}>
                  Cancel
                </Button>
                <Button onClick={() => handleButtonClick("submitTyre")}>Add Tyre</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
