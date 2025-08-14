import { Button } from "@/components/ui/Button";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  FileText,
  Filter,
  Plus,
  Tag,
  Target,
} from "lucide-react";
import React, { useState } from "react";
import Card, { CardContent, CardHeader } from "../ui/Card";
import Modal from "../ui/Modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";

// Import type utilities from the tyreConstants file
import MoveTyreModal from "@/components/Models/Tyre/MoveTyreModal";
import TyreInspectionModal from "@/components/Models/Tyre/TyreInspectionModal";
import TyreForm from "@/components/forms/tyre/TyreForm";
import { useTyreStores } from "@/context/TyreStoresContext";
import type { StockEntry } from "@/types/tyre";
import { getUniqueTyreBrands } from "../../utils/tyreConstants";

interface TyreInventoryItem {
  id: string;
  brand: string;
  model?: string;
  pattern?: string;
  size: string;
  quantity: number;
  reorderLevel: number;
  cost: number;
  supplier: {
    name: string;
    id: string;
  };
  storeLocation: string;
  status: string;
}

// Mock data
const mockTyres: TyreInventoryItem[] = [
  {
    id: "tyre1",
    brand: "Firemax",
    model: "FM18",
    pattern: "TR688",
    size: "315/80R22.5",
    quantity: 5,
    reorderLevel: 2,
    cost: 3200,
    supplier: {
      name: "Field Tyre Services",
      id: "FTS001",
    },
    storeLocation: "Vichels Store",
    status: "in_stock",
  },
  {
    id: "tyre2",
    brand: "TRIANGLE",
    model: "TR688",
    pattern: "TR688",
    size: "315/80R22.5",
    quantity: 2,
    reorderLevel: 2,
    cost: 3500,
    supplier: {
      name: "Field Tyre Services",
      id: "FTS001",
    },
    storeLocation: "Vichels Store",
    status: "in_stock",
  },
  {
    id: "tyre3",
    brand: "Terraking",
    model: "HS102",
    pattern: "HS102",
    size: "315/80R22.5",
    quantity: 0,
    reorderLevel: 2,
    cost: 3100,
    supplier: {
      name: "Field Tyre Services",
      id: "FTS001",
    },
    storeLocation: "Vichels Store",
    status: "on_order",
  },
  {
    id: "tyre4",
    brand: "Compasal",
    model: "CPD82",
    pattern: "CPD82",
    size: "315/80R22.5",
    quantity: 3,
    reorderLevel: 2,
    cost: 3300,
    supplier: {
      name: "Field Tyre Services",
      id: "FTS001",
    },
    storeLocation: "Vichels Store",
    status: "in_stock",
  },
  {
    id: "tyre5",
    brand: "Perelli",
    model: "FG01S",
    pattern: "FG01S",
    size: "315/80R22.5",
    quantity: 1,
    reorderLevel: 2,
    cost: 4200,
    supplier: {
      name: "Field Tyre Services",
      id: "FTS001",
    },
    storeLocation: "Vichels Store",
    status: "in_stock",
  },
];

interface TyreManagementViewProps {
  activeTab?: string;
}

const TyreManagementView: React.FC<TyreManagementViewProps> = ({ activeTab = "inventory" }) => {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [activeTabState, setActiveTab] = useState(activeTab);
  const [tyres, setTyres] = useState<TyreInventoryItem[]>(mockTyres);
  /* eslint-enable @typescript-eslint/no-unused-vars */
  const [expandedTyre, setExpandedTyre] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    brand: "",
    size: "",
    status: "",
    lowStock: false,
  });
  // Inventory form modal state
  const [showTyreForm, setShowTyreForm] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [selectedFleetNumber, setSelectedFleetNumber] = useState<string>("");
  // TyreStores modal state
  const { stores } = useTyreStores();
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveFromStoreId, setMoveFromStoreId] = useState<string>("");
  const [moveEntryData, setMoveEntryData] = useState<StockEntry | null>(null);

  // Filter tyres based on the selected filters
  const filteredTyres = tyres.filter((tyre) => {
    if (filters.brand && tyre.brand !== filters.brand) return false;
    if (filters.size && tyre.size !== filters.size) return false;
    if (filters.status && tyre.status !== filters.status) return false;
    if (filters.lowStock && tyre.quantity > tyre.reorderLevel) return false;
    return true;
  });

  // Total values for the inventory
  const totalValue = filteredTyres.reduce((sum, tyre) => sum + tyre.cost * tyre.quantity, 0);
  const totalQuantity = filteredTyres.reduce((sum, tyre) => sum + tyre.quantity, 0);
  const lowStockCount = filteredTyres.filter((tyre) => tyre.quantity <= tyre.reorderLevel).length;

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({
      brand: "",
      size: "",
      status: "",
      lowStock: false,
    });
  };

  // Button click handlers
  const handleExportClick = () => {
    console.log("Export clicked");
    // Add export functionality here
  };

  const handleAddTyreClick = () => {
    setShowTyreForm(true);
  };

  const handleClearFiltersClick = () => {
    clearFilters();
  };

  const handleExpandTyreClick = (id: string) => {
    toggleExpand(id);
  };

  const handleMoveTyreClick = (storeId: string, entry: StockEntry) => {
    openMoveModal(storeId, entry);
  };

  const handleInspectTyreClick = () => {
    openInspectionModal("demo-position", "demo-fleet");
  };

  // Toggle expanded view for a tyre
  const toggleExpand = (id: string) => {
    setExpandedTyre(expandedTyre === id ? null : id);
  };

  // Handlers for inventory and inspection
  const handleTyreSubmit = async (tyre: any): Promise<void> => {
    console.log("New tyre submitted", tyre);
    setShowTyreForm(false);
    return Promise.resolve();
  };
  const handleInspectionSubmit = (inspection: any) => {
    console.log("Inspection submitted", inspection);
    setShowInspectionModal(false);
  };

  const openInspectionModal = (position: string, fleetNumber: string) => {
    setSelectedPosition(position);
    setSelectedFleetNumber(fleetNumber);
    setShowInspectionModal(true);
  };

  const openMoveModal = (storeId: string, entry: StockEntry) => {
    setMoveFromStoreId(storeId);
    setMoveEntryData(entry);
    setShowMoveModal(true);
  };
  const closeMoveModal = () => {
    setShowMoveModal(false);
    setMoveEntryData(null);
    setMoveFromStoreId("");
  };

  // Get unique brands from the tyre constants
  const brands = getUniqueTyreBrands();
  const statuses = ["in_stock", "on_order", "backordered", "depleted"];
  // Get unique sizes from tyres
  const sizes = Array.from(new Set(tyres.map((tyre) => tyre.size)));

  function formatCurrency(amount: number, currency: string): React.ReactNode {
    // Support 'ZAR', 'USD', or 'ZAR/USD' for display
    let symbol = "";
    if (currency === "ZAR" || currency === "ZAR/USD") symbol = "R";
    else if (currency === "USD") symbol = "$";

    // Format with 2 decimals, thousands separator
    const formatted = amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (currency === "ZAR/USD") {
      // Show both ZAR and USD (mock conversion, e.g. 1 USD = 18 ZAR)
      const usdValue = amount / 18;
      return (
        <span>
          R{formatted}{" "}
          <span className="text-xs text-gray-500">
            ($
            {usdValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            )
          </span>
        </span>
      );
    }

    return `${symbol}${formatted}`;
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Target className="mr-2 w-8 h-8 text-blue-600" />
          Tyre Management System
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportClick}
          >
            Export
          </Button>
          <Button icon={<Plus className="w-4 h-4" />} onClick={handleAddTyreClick}>
            Add Tyre Stock
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            <span>Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="position" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>Position Mapping</span>
          </TabsTrigger>
          <TabsTrigger value="inspection" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Inspections</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span>Cost Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Replacement Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="stores" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            <span>Stores</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-6">
          {/* Inventory Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Inventory</p>
                    <p className="text-2xl font-bold text-blue-600">{totalQuantity} tyres</p>
                    <p className="text-xs text-gray-400">{filteredTyres.length} unique items</p>
                  </div>
                  <Tag className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Value</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalValue, "ZAR/USD")}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatCurrency(totalValue / Math.max(1, totalQuantity), "ZAR/USD")} avg per
                      tyre
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Low Stock Alert</p>
                    <p className="text-2xl font-bold text-red-600">{lowStockCount} items</p>
                    <p className="text-xs text-gray-400">below minimum stock level</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">On Order</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {filteredTyres.filter((t) => t.status === "on_order").length} items
                    </p>
                    <p className="text-xs text-gray-400">awaiting delivery</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader title="Filter Inventory" />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  className="border border-gray-300 rounded-md px-3 py-2"
                  value={filters.brand}
                  onChange={(e) => handleFilterChange("brand", e.target.value)}
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>

                <select
                  className="border border-gray-300 rounded-md px-3 py-2"
                  value={filters.size}
                  onChange={(e) => handleFilterChange("size", e.target.value)}
                >
                  <option value="">All Sizes</option>
                  {sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>

                <select
                  className="border border-gray-300 rounded-md px-3 py-2"
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </select>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="lowStock"
                    checked={filters.lowStock}
                    onChange={(e) => handleFilterChange("lowStock", e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="lowStock" className="text-sm font-medium text-gray-700">
                    Low Stock Only
                  </label>

                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto"
                    icon={<Filter className="w-4 h-4" />}
                    onClick={handleClearFiltersClick}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tyre Inventory Table */}
          <Card>
            <CardHeader title={`Tyre Inventory (${filteredTyres.length})`} />
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Brand/Model
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Size
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        In Stock
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Min Stock
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Unit Cost
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Value
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTyres.map((tyre) => (
                      <React.Fragment key={tyre.id}>
                        <tr
                          className={`hover:bg-gray-50 ${tyre.quantity <= tyre.reorderLevel ? "bg-red-50" : ""}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              className="flex items-center"
                              onClick={() => handleExpandTyreClick(tyre.id)}
                            >
                              {expandedTyre === tyre.id ? (
                                <ChevronDown className="w-4 h-4 mr-2 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {tyre.brand}
                                </div>
                                <div className="text-sm text-gray-500">{tyre.model || "-"}</div>
                              </div>
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{tyre.size}</div>
                            <div className="text-sm text-gray-500">{tyre.pattern || "-"}</div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm text-center ${
                              tyre.quantity <= tyre.reorderLevel
                                ? "text-red-600 font-bold"
                                : "text-gray-900"
                            }`}
                          >
                            {tyre.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {tyre.reorderLevel}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                                tyre.status === "in_stock"
                                  ? "bg-green-100 text-green-800"
                                  : tyre.status === "on_order"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : tyre.status === "backordered"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-red-100 text-red-800"
                              }`}
                            >
                              {tyre.status.replace("_", " ").toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatCurrency(tyre.cost, "ZAR")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatCurrency(tyre.cost * tyre.quantity, "ZAR")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Button size="xs" variant="outline">
                              Manage
                            </Button>
                          </td>
                        </tr>

                        {/* Expanded View */}
                        {expandedTyre === tyre.id && (
                          <tr>
                            <td colSpan={8} className="px-6 py-4 bg-gray-50">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                                    Details
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Brand: <span className="font-medium">{tyre.brand}</span>
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Model: <span className="font-medium">{tyre.model || "-"}</span>
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Pattern:{" "}
                                    <span className="font-medium">{tyre.pattern || "-"}</span>
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Size: <span className="font-medium">{tyre.size}</span>
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                                    Inventory
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Quantity: <span className="font-medium">{tyre.quantity}</span>
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Min Stock:{" "}
                                    <span className="font-medium">{tyre.reorderLevel}</span>
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Location:{" "}
                                    <span className="font-medium">{tyre.storeLocation}</span>
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Status:{" "}
                                    <span className="font-medium">
                                      {tyre.status.replace("_", " ").toUpperCase()}
                                    </span>
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                                    Supplier
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Supplier:{" "}
                                    <span className="font-medium">{tyre.supplier.name}</span>
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Cost:{" "}
                                    <span className="font-medium">
                                      {formatCurrency(tyre.cost, "ZAR")}
                                    </span>
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Total Value:{" "}
                                    <span className="font-medium">
                                      {formatCurrency(tyre.cost * tyre.quantity, "ZAR")}
                                    </span>
                                  </p>
                                  <div className="mt-2">
                                    <Button size="xs">Adjust Stock</Button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>

                {filteredTyres.length === 0 && (
                  <div className="text-center py-8">
                    <Target className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tyres found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {filters.brand || filters.size || filters.status || filters.lowStock
                        ? "No tyres match your filter criteria."
                        : "Add some tyres to your inventory to get started."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* VehicleTyreStore Live Entries */}
          {stores.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Vehicle Tyre Store Entries</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stores
                    .find((s) => s.id === "VehicleTyreStore")
                    ?.entries.map((entry) => (
                      <div
                        key={entry.tyreId}
                        className="flex items-center justify-between border p-2 rounded"
                      >
                        <div>
                          <p className="font-medium">{entry.tyreId}</p>
                          <p className="text-sm text-gray-600">Status: {entry.status}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleMoveTyreClick("VehicleTyreStore", entry)}
                        >
                          Move
                        </Button>
                      </div>
                    ))}
                  {stores.find((s) => s.id === "VehicleTyreStore")?.entries.length === 0 && (
                    <p className="text-gray-500">No entries in Vehicle Tyre Store</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="position" className="mt-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tyre Position Mapping</h3>
            <p className="text-gray-600 mb-6">
              The position mapping view shows the current tyres installed on each fleet vehicle,
              their condition, and history.
            </p>

            <div className="mb-4">
              <select className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-auto">
                <option value="">Select a fleet vehicle...</option>
                <option value="21H">21H - SCANIA G460</option>
                <option value="22H">22H - SCANIA G460</option>
                <option value="23H">23H - SHACMAN X3000</option>
                <option value="24H">24H - SCANIA G460</option>
                <option value="1T">1T - AFRIT FLAT DECK</option>
                <option value="4F">4F - SERCO REEFER</option>
              </select>
            </div>

            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <Target className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Select a Vehicle</h3>
              <p className="mt-1 text-gray-500 max-w-md mx-auto">
                Choose a fleet vehicle from the dropdown above to view its tyre position map,
                current tyre status, and installation details.
              </p>
            </div>

            <div className="mt-6 text-center">
              <Button variant="outline" onClick={handleInspectTyreClick}>
                Inspect Tyre (Demo)
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inspection" className="mt-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tyre Inspections</h3>
            <p className="text-gray-600 mb-6">
              Track tyre inspections, including tread depth measurements, pressure checks, and wear
              patterns.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Upcoming Inspections</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Fleet 21H is due for inspection in 2 days</li>
                      <li>Fleet 22H is due for inspection in 5 days</li>
                      <li>Fleet 24H inspection is overdue by 3 days</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-700">Recent Inspections</h4>
              <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                New Inspection Form
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Fleet
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Inspector
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Positions Checked
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Issues Found
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      2025-06-25
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">21H</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      John Smith
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      10/10
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-green-100 text-green-800">
                        None
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button size="xs" variant="outline">
                        View
                      </Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      2025-06-20
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">22H</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Maria Rodriguez
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      10/10
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-red-100 text-red-800">
                        2 Issues
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button size="xs" variant="outline">
                        View
                      </Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      2025-06-18
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">24H</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      David Johnson
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      10/10
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-red-100 text-red-800">
                        1 Issue
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button size="xs" variant="outline">
                        View
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tyre Cost Analysis</h3>
            <p className="text-gray-600 mb-6">
              Analyze tyre costs, performance, and lifespan to make informed procurement decisions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <h4 className="text-md font-medium text-blue-800 mb-3">Cost Per Kilometer (CPK)</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-blue-700">Fleet Average CPK:</p>
                    <p className="text-xl font-bold text-blue-900">R0.38 / km</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-blue-700">Brand Performance:</p>
                    <div className="flex justify-between items-center text-sm">
                      <span>Firemax</span>
                      <span className="font-medium">R0.42 / km</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Triangle</span>
                      <span className="font-medium">R0.39 / km</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Terraking</span>
                      <span className="font-medium">R0.36 / km</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Perelli</span>
                      <span className="font-medium">R0.34 / km</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                <h4 className="text-md font-medium text-green-800 mb-3">Average Tyre Lifespan</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-green-700">Fleet Average Lifespan:</p>
                    <p className="text-xl font-bold text-green-900">85,000 km</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-green-700">Position Performance:</p>
                    <div className="flex justify-between items-center text-sm">
                      <span>Steer Position</span>
                      <span className="font-medium">75,000 km</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Drive Position</span>
                      <span className="font-medium">90,000 km</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Trailer Position</span>
                      <span className="font-medium">95,000 km</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-800 mb-3">
                Optimization Recommendations
              </h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                <li>
                  Consider increasing order quantities of Perelli tyres due to their superior cost
                  per kilometer performance.
                </li>
                <li>Evaluate tyre rotation practices to improve steer position lifespan.</li>
                <li>
                  Schedule training for technicians on proper tyre installation to reduce premature
                  failures.
                </li>
                <li>
                  Implement regular tread depth monitoring to identify abnormal wear patterns early.
                </li>
                <li>Review tyre pressure maintenance procedures to ensure optimal performance.</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Replacement Schedule</h3>
            <p className="text-gray-600 mb-6">
              Plan ahead for tyre replacements based on projected wear rates and inspection history.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Upcoming Replacements</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Fleet 21H (positions 3, 4) - Due within 7 days based on wear rate</li>
                      <li>Fleet 23H (positions 1, 2) - Due within 14 days based on wear rate</li>
                      <li>
                        Fleet 1T (positions 5, 6, 7, 8) - Due within 30 days based on wear rate
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Fleet
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Position
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Current Tyre
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Installation Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Current Tread (mm)
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Wear Rate (mm/1000km)
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Estimated Replacement
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      21H
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Position 3
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Firemax FM18 (315/80R22.5)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      2025-03-15
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium text-center">
                      4.5 mm
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      0.6 mm / 1000km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-red-100 text-red-800">
                        7 days
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button size="xs" variant="outline">
                        Schedule
                      </Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      21H
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Position 4
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Firemax FM18 (315/80R22.5)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      2025-03-15
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium text-center">
                      4.2 mm
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      0.6 mm / 1000km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-red-100 text-red-800">
                        6 days
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button size="xs" variant="outline">
                        Schedule
                      </Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      23H
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Position 1
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Triangle TR688 (315/80R22.5)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      2025-04-02
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium text-center">
                      5.8 mm
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      0.55 mm / 1000km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-yellow-100 text-yellow-800">
                        14 days
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button size="xs" variant="outline">
                        Schedule
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stores" className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Tyre Stores</h3>
          {stores.map((store) => (
            <div key={store.id} className="mb-6">
              <h4 className="font-medium mb-2">{store.name}</h4>
              <div className="space-y-2">
                {store.entries.map((entry) => (
                  <div
                    key={entry.tyreId}
                    className="flex items-center justify-between border p-2 rounded"
                  >
                    <div>
                      <p className="font-medium">{entry.tyreId}</p>
                      <p className="text-sm text-gray-600">Status: {entry.status}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleMoveTyreClick("VehicleTyreStore", entry)}
                    >
                      Move
                    </Button>
                  </div>
                ))}
                {store.entries.length === 0 && (
                  <p className="text-gray-500">No entries in {store.name}</p>
                )}
              </div>
            </div>
          ))}

          {/* Move Modal */}
          {moveEntryData && (
            <MoveTyreModal
              isOpen={showMoveModal}
              onClose={closeMoveModal}
              fromStoreId={moveFromStoreId}
              entry={moveEntryData}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Add Tyre Inventory Form Modal */}
      {showTyreForm && (
        <Modal
          isOpen={showTyreForm}
          onClose={() => setShowTyreForm(false)}
          title="Add New Tyre to Inventory"
          maxWidth="lg"
        >
          <TyreForm onSubmit={handleTyreSubmit} />
        </Modal>
      )}

      {/* Tyre Inspection Modal */}
      {showInspectionModal && (
        <TyreInspectionModal
          open={showInspectionModal}
          onClose={() => setShowInspectionModal(false)}
          onSubmit={handleInspectionSubmit}
          tyrePosition={selectedPosition}
          fleetNumber={selectedFleetNumber}
        />
      )}
    </div>
  );
};

export default TyreManagementView;
