import { Button } from "../../components/ui/Button";
import {
  AlertTriangle,
  ArrowUpDown,
  Calendar,
  CheckCircle,
  Filter,
  Flag,
  Plus,
  Search,
  Truck,
  User,
} from "lucide-react";
import React, { useState } from "react";
import { formatDate } from "../../utils/helpers";
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

// Mock fault data
const mockFaults = [
  {
    id: "fault-1",
    fleetNumber: "28H",
    reportedBy: "Jonathan Bepete",
    category: "Brakes",
    subCategory: "Brake Pads",
    description: "Front brake pads worn below minimum thickness",
    severity: "critical",
    status: "open",
    reportedDate: "2025-07-15",
    assignedTo: "Workshop Manager",
  },
  {
    id: "fault-2",
    fleetNumber: "31H",
    reportedBy: "Peter Farai",
    category: "Engine",
    subCategory: "Cooling System",
    description: "Coolant leak from radiator",
    severity: "high",
    status: "in_progress",
    reportedDate: "2025-07-14",
    assignedTo: "Senior Mechanic",
  },
  {
    id: "fault-3",
    fleetNumber: "23H",
    reportedBy: "Lovemore Qochiwe",
    category: "Electrical",
    subCategory: "Lighting",
    description: "Left headlight not working",
    severity: "medium",
    status: "resolved",
    reportedDate: "2025-07-12",
    resolvedDate: "2025-07-13",
    assignedTo: "Electrician",
  },
];

const FaultTracking: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<"all" | "open" | "in_progress" | "resolved">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Filter faults based on active filter and search term
  const filteredFaults = mockFaults.filter((fault) => {
    // Apply status filter
    if (activeFilter !== "all" && fault.status !== activeFilter) {
      return false;
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        fault.fleetNumber.toLowerCase().includes(term) ||
        fault.category.toLowerCase().includes(term) ||
        fault.subCategory.toLowerCase().includes(term) ||
        fault.description.toLowerCase().includes(term) ||
        fault.reportedBy.toLowerCase().includes(term)
      );
    }

    return true;
  });

  // Function to get severity class
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get status class
  const getStatusClass = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Count faults by status
  const faultCounts = {
    all: mockFaults.length,
    open: mockFaults.filter((f) => f.status === "open").length,
    in_progress: mockFaults.filter((f) => f.status === "in_progress").length,
    resolved: mockFaults.filter((f) => f.status === "resolved").length,
  };

  // Count critical faults
  const criticalFaults = mockFaults.filter(
    (f) => f.severity === "critical" && f.status !== "resolved"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fault Tracking System</h2>
          <p className="text-gray-600">Track and manage vehicle faults and issues</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />}>Report New Fault</Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={criticalFaults > 0 ? "border-l-4 border-l-red-500" : ""}>
          <CardContent className="p-4">
            <CardTitle>Critical Faults</CardTitle>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Critical Faults</p>
                <p className="text-2xl font-bold text-red-600">{criticalFaults}</p>
                <p className="text-xs text-gray-500">Require immediate attention</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <CardTitle>Open Faults</CardTitle>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Open Faults</p>
                <p className="text-2xl font-bold text-orange-600">{faultCounts.open}</p>
                <p className="text-xs text-gray-500">Not yet assigned</p>
              </div>
              <Flag className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <CardTitle>In Progress</CardTitle>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{faultCounts.in_progress}</p>
                <p className="text-xs text-gray-500">Currently being addressed</p>
              </div>
              <Truck className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <CardTitle>Resolved</CardTitle>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{faultCounts.resolved}</p>
                <p className="text-xs text-gray-500">Fixed and verified</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center space-x-2 space-y-2 md:space-y-0">
            <Button
              size="sm"
              variant={activeFilter === "all" ? "primary" : "outline"}
              onClick={() => setActiveFilter("all")}
            >
              All Faults ({faultCounts.all})
            </Button>
            <Button
              size="sm"
              variant={activeFilter === "open" ? "primary" : "outline"}
              onClick={() => setActiveFilter("open")}
            >
              Open ({faultCounts.open})
            </Button>
            <Button
              size="sm"
              variant={activeFilter === "in_progress" ? "primary" : "outline"}
              onClick={() => setActiveFilter("in_progress")}
            >
              In Progress ({faultCounts.in_progress})
            </Button>
            <Button
              size="sm"
              variant={activeFilter === "resolved" ? "primary" : "outline"}
              onClick={() => setActiveFilter("resolved")}
            >
              Resolved ({faultCounts.resolved})
            </Button>

            <div className="ml-auto flex items-center space-x-2">
              <Button size="sm" variant="outline" icon={<Filter className="w-4 h-4" />}>
                Filter
              </Button>
              <Button size="sm" variant="outline" icon={<ArrowUpDown className="w-4 h-4" />}>
                Sort
              </Button>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search faults..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fault List */}
      <Card>
        <CardHeader title={`Fault List (${filteredFaults.length})`} />
        <CardContent>
          {filteredFaults.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No faults found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeFilter !== "all"
                  ? `No ${activeFilter} faults found.`
                  : "No faults have been reported yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaults.map((fault) => (
                <div
                  key={fault.id}
                  className={`p-4 rounded-lg border ${
                    fault.severity === "critical"
                      ? "border-l-4 border-l-red-500"
                      : fault.severity === "high"
                        ? "border-l-4 border-l-orange-500"
                        : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          Fleet {fault.fleetNumber} - {fault.category}: {fault.subCategory}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityClass(fault.severity)}`}
                        >
                          {fault.severity.toUpperCase()}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(fault.status)}`}
                        >
                          {fault.status === "in_progress"
                            ? "IN PROGRESS"
                            : fault.status.toUpperCase()}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-600">{fault.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Reported By</p>
                            <p className="text-sm font-medium">{fault.reportedBy}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Reported Date</p>
                            <p className="text-sm font-medium">{formatDate(fault.reportedDate)}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Assigned To</p>
                            <p className="text-sm font-medium">{fault.assignedTo}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {fault.status !== "resolved" && (
                        <Button size="sm" variant={fault.status === "open" ? "primary" : "outline"}>
                          {fault.status === "open" ? "Assign" : "Update Status"}
                        </Button>
                      )}
                      {fault.status === "open" && fault.severity === "critical" && (
                        <Button size="sm" variant="danger">
                          Create Job Card
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FaultTracking;
