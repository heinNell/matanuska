import { Button } from "@/components/ui/Button";
import { BarChart, Download, Filter, PieChart, Plus, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/Card";
import SyncIndicator from "../ui/SyncIndicator";

interface TyreRecord {
  id: string;
  tyreNumber: string;
  manufacturer: string;
  condition: "New" | "Good" | "Fair" | "Poor" | "Retreaded";
  status: "In-Service" | "In-Stock" | "Repair" | "Scrap";
  vehicleAssignment: string;
  km: number;
  kmLimit: number;
  treadDepth: number;
  mountStatus: string;
  axlePosition?: string;
  lastInspection?: string;
  datePurchased?: string;
  size?: string;
  pattern?: string;
}

interface TyreInventoryDashboardProps {
  onAddTyre?: () => void;
  onViewTyreDetail?: (id: string) => void;
  onEditTyre?: (id: string) => void;
}

const TyreInventoryDashboard: React.FC<TyreInventoryDashboardProps> = ({
  onAddTyre,
  onViewTyreDetail,
  onEditTyre,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterManufacturer, setFilterManufacturer] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterCondition, setFilterCondition] = useState<string>("");
  const [sortBy, setSortBy] = useState<keyof TyreRecord>("tyreNumber");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(false);
  const [tyres, setTyres] = useState<TyreRecord[]>([]);

  // Mock data for initial load
  const mockTyres: TyreRecord[] = [
    {
      id: "1",
      tyreNumber: "T1001",
      manufacturer: "Michelin",
      condition: "Good",
      status: "In-Service",
      vehicleAssignment: "MAT001",
      km: 15000,
      kmLimit: 60000,
      treadDepth: 8.5,
      mountStatus: "Mounted",
      axlePosition: "Front Left",
      lastInspection: "2025-06-15",
      datePurchased: "2025-01-10",
      size: "295/80R22.5",
      pattern: "X MultiWay 3D XZE",
    },
    {
      id: "2",
      tyreNumber: "T1002",
      manufacturer: "Goodyear",
      condition: "Fair",
      status: "In-Service",
      vehicleAssignment: "MAT001",
      km: 25000,
      kmLimit: 60000,
      treadDepth: 6.2,
      mountStatus: "Mounted",
      axlePosition: "Front Right",
      lastInspection: "2025-06-15",
      datePurchased: "2025-01-10",
      size: "295/80R22.5",
      pattern: "KMAX S",
    },
    {
      id: "3",
      tyreNumber: "T1003",
      manufacturer: "Bridgestone",
      condition: "New",
      status: "In-Stock",
      vehicleAssignment: "",
      km: 0,
      kmLimit: 80000,
      treadDepth: 14.0,
      mountStatus: "Not Mounted",
      datePurchased: "2025-06-01",
      size: "315/80R22.5",
      pattern: "R168",
    },
    {
      id: "4",
      tyreNumber: "T1004",
      manufacturer: "Continental",
      condition: "Poor",
      status: "Repair",
      vehicleAssignment: "MAT003",
      km: 48000,
      kmLimit: 60000,
      treadDepth: 3.2,
      mountStatus: "Removed",
      axlePosition: "Rear Right Outer",
      lastInspection: "2025-07-02",
      datePurchased: "2024-10-15",
      size: "315/80R22.5",
      pattern: "HDR2+",
    },
    {
      id: "5",
      tyreNumber: "T1005",
      manufacturer: "Pirelli",
      condition: "Retreaded",
      status: "In-Service",
      vehicleAssignment: "MAT002",
      km: 12000,
      kmLimit: 40000,
      treadDepth: 10.5,
      mountStatus: "Mounted",
      axlePosition: "Drive Axle Left Inner",
      lastInspection: "2025-06-28",
      datePurchased: "2024-12-05",
      size: "315/80R22.5",
      pattern: "FH:01",
    },
    {
      id: "6",
      tyreNumber: "T1006",
      manufacturer: "Goodyear",
      condition: "Good",
      status: "In-Service",
      vehicleAssignment: "MAT002",
      km: 18500,
      kmLimit: 60000,
      treadDepth: 7.8,
      mountStatus: "Mounted",
      axlePosition: "Drive Axle Left Outer",
      lastInspection: "2025-06-28",
      datePurchased: "2024-12-05",
      size: "315/80R22.5",
      pattern: "KMAX D",
    },
    {
      id: "7",
      tyreNumber: "T1007",
      manufacturer: "Michelin",
      condition: "Retreaded",
      status: "Scrap",
      vehicleAssignment: "",
      km: 75000,
      kmLimit: 60000,
      treadDepth: 1.8,
      mountStatus: "Removed",
      datePurchased: "2024-05-20",
      size: "295/80R22.5",
      pattern: "X MultiWay 3D XDE",
    },
  ];

  // Load tyres on component mount
  useEffect(() => {
    setIsLoading(true);
    // Simulate API fetch
    setTimeout(() => {
      setTyres(mockTyres);
      setIsLoading(false);
    }, 800);
  }, []);

  // Filter and sort tyres
  const filteredTyres = tyres
    .filter((tyre) => {
      const matchesSearch =
        searchTerm === "" ||
        tyre.tyreNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tyre.vehicleAssignment.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesManufacturer =
        filterManufacturer === "" || tyre.manufacturer === filterManufacturer;

      const matchesStatus = filterStatus === "" || tyre.status === filterStatus;

      const matchesCondition = filterCondition === "" || tyre.condition === filterCondition;

      return matchesSearch && matchesManufacturer && matchesStatus && matchesCondition;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  // Toggle sort direction
  const handleSort = (field: keyof TyreRecord) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  // Calculate summary statistics
  const totalTyres = tyres.length;
  const inServiceTyres = tyres.filter((t) => t.status === "In-Service").length;
  const inStockTyres = tyres.filter((t) => t.status === "In-Stock").length;
  const repairTyres = tyres.filter((t) => t.status === "Repair").length;
  const scrapTyres = tyres.filter((t) => t.status === "Scrap").length;

  // Get unique manufacturers for filter dropdown
  const manufacturers = Array.from(new Set(tyres.map((t) => t.manufacturer)));

  // Generate condition class
  const getConditionClass = (condition: string) => {
    switch (condition) {
      case "New":
        return "bg-green-100 text-green-800";
      case "Good":
        return "bg-blue-100 text-blue-800";
      case "Fair":
        return "bg-yellow-100 text-yellow-800";
      case "Poor":
        return "bg-red-100 text-red-800";
      case "Retreaded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Generate status class
  const getStatusClass = (status: string) => {
    switch (status) {
      case "In-Service":
        return "bg-green-100 text-green-800";
      case "In-Stock":
        return "bg-blue-100 text-blue-800";
      case "Repair":
        return "bg-yellow-100 text-yellow-800";
      case "Scrap":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate tread percentage
  const calculateTreadPercentage = (current: number, original = 14) => {
    return Math.round((current / original) * 100);
  };

  // Format numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Tyre Inventory</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={onAddTyre}>
            Add Tyre
          </Button>
          <SyncIndicator />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Tyres</h3>
            <p className="text-2xl font-bold text-gray-900">{totalTyres}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-500">In Service</h3>
            <p className="text-2xl font-bold text-green-600">{inServiceTyres}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-500">In Stock</h3>
            <p className="text-2xl font-bold text-blue-600">{inStockTyres}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-500">In Repair</h3>
            <p className="text-2xl font-bold text-yellow-600">{repairTyres}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Scrapped</h3>
            <p className="text-2xl font-bold text-red-600">{scrapTyres}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-md shadow">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by tyre number or vehicle..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Filters:</span>
          </div>

          <div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={filterManufacturer}
              onChange={(e) => setFilterManufacturer(e.target.value)}
            >
              <option value="">All Manufacturers</option>
              {manufacturers.map((mfg) => (
                <option key={mfg} value={mfg}>
                  {mfg}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="In-Service">In Service</option>
              <option value="In-Stock">In Stock</option>
              <option value="Repair">Repair</option>
              <option value="Scrap">Scrap</option>
            </select>
          </div>

          <div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
            >
              <option value="">All Conditions</option>
              <option value="New">New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Retreaded">Retreaded</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={<BarChart className="w-4 h-4" />}>
              Analytics
            </Button>
            <Button variant="outline" size="sm" icon={<PieChart className="w-4 h-4" />}>
              Reports
            </Button>
          </div>
        </div>
      </div>

      {/* Tyre Inventory Table */}
      <div className="bg-white rounded-md shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("tyreNumber")}
                >
                  Tyre Number {sortBy === "tyreNumber" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("manufacturer")}
                >
                  Manufacturer {sortBy === "manufacturer" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("condition")}
                >
                  Condition {sortBy === "condition" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  Status {sortBy === "status" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("vehicleAssignment")}
                >
                  Vehicle {sortBy === "vehicleAssignment" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("km")}
                >
                  KM Run {sortBy === "km" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("treadDepth")}
                >
                  Tread {sortBy === "treadDepth" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("mountStatus")}
                >
                  Mount Status {sortBy === "mountStatus" && (sortDirection === "asc" ? "↑" : "↓")}
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
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Loading tyre inventory...</p>
                  </td>
                </tr>
              ) : filteredTyres.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    No tyres found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredTyres.map((tyre) => (
                  <tr key={tyre.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tyre.tyreNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tyre.manufacturer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getConditionClass(tyre.condition)}`}
                      >
                        {tyre.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(tyre.status)}`}
                      >
                        {tyre.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tyre.vehicleAssignment || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(tyre.km)} / {formatNumber(tyre.kmLimit)} km
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full ${tyre.km > tyre.kmLimit * 0.8 ? "bg-red-500" : "bg-blue-500"}`}
                          style={{ width: `${Math.min(100, (tyre.km / tyre.kmLimit) * 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tyre.treadDepth} mm
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            calculateTreadPercentage(tyre.treadDepth) > 70
                              ? "bg-green-500"
                              : calculateTreadPercentage(tyre.treadDepth) > 30
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${calculateTreadPercentage(tyre.treadDepth)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tyre.mountStatus}
                      {tyre.axlePosition && (
                        <div className="text-xs text-gray-400">{tyre.axlePosition}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => onViewTyreDetail && onViewTyreDetail(tyre.id)}
                      >
                        View
                      </button>
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => onEditTyre && onEditTyre(tyre.id)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TyreInventoryDashboard;
