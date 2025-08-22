import { Button } from "../../components/ui/Button";
import {
  AlertOctagon,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Filter,
  Search,
} from "lucide-react";
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";

// Types
interface Violation {
  id: string;
  driverId: string;
  driverName: string;
  date: string; // ISO string
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
  status: "pending" | "under-review" | "resolved";
  actionTaken: string | null;
  location: string;
  vehicleId: string;
  vehiclePlate: string;
}

// Mock violations data
const mockViolations: Violation[] = [
  {
    id: "vio-001",
    driverId: "drv-001",
    driverName: "John Doe",
    date: "2023-10-10T09:15:00",
    type: "speeding",
    description: "Exceeded speed limit by 15 km/h on Accra-Tema Motorway",
    severity: "medium",
    status: "pending",
    actionTaken: null,
    location: "Accra-Tema Motorway, km 15",
    vehicleId: "veh-002",
    vehiclePlate: "GH-2345-21",
  },
  {
    id: "vio-002",
    driverId: "drv-002",
    driverName: "Jane Smith",
    date: "2023-10-09T14:30:00",
    type: "hard-braking",
    description: "Multiple hard braking events within short period",
    severity: "low",
    status: "resolved",
    actionTaken: "Driver coaching completed on 2023-10-12",
    location: "Kumasi Road, near Konongo",
    vehicleId: "veh-005",
    vehiclePlate: "GH-8901-21",
  },
  {
    id: "vio-003",
    driverId: "drv-003",
    driverName: "Michael Johnson",
    date: "2023-10-05T11:45:00",
    type: "hours-of-service",
    description: "Exceeded daily driving hours limit by 1.5 hours",
    severity: "high",
    status: "under-review",
    actionTaken: null,
    location: "N/A (HOS Violation)",
    vehicleId: "veh-008",
    vehiclePlate: "GH-4567-22",
  },
  {
    id: "vio-004",
    driverId: "drv-001",
    driverName: "John Doe",
    date: "2023-09-28T16:20:00",
    type: "unauthorized-stop",
    description: "Unscheduled stop for 45 minutes outside of approved rest areas",
    severity: "medium",
    status: "resolved",
    actionTaken: "Warning issued on 2023-09-30",
    location: "Takoradi Road, 10km east of Agona",
    vehicleId: "veh-002",
    vehiclePlate: "GH-2345-21",
  },
  {
    id: "vio-005",
    driverId: "drv-005",
    driverName: "Robert Brown",
    date: "2023-10-08T07:55:00",
    type: "idling",
    description: "Excessive idling for 75 minutes at delivery location",
    severity: "low",
    status: "pending",
    actionTaken: null,
    location: "Tema Industrial Area",
    vehicleId: "veh-010",
    vehiclePlate: "GH-1234-22",
  },
  {
    id: "vio-006",
    driverId: "drv-004",
    driverName: "Sarah Williams",
    date: "2023-09-20T12:10:00",
    type: "route-deviation",
    description: "Significant deviation from approved route (25km)",
    severity: "medium",
    status: "resolved",
    actionTaken: "Explanation accepted - road closure required detour",
    location: "Between Accra and Cape Coast",
    vehicleId: "veh-003",
    vehiclePlate: "GH-7890-21",
  },
  {
    id: "vio-007",
    driverId: "drv-003",
    driverName: "Michael Johnson",
    date: "2023-10-12T08:30:00",
    type: "mobile-usage",
    description: "Mobile phone usage while driving detected",
    severity: "high",
    status: "under-review",
    actionTaken: null,
    location: "Accra Central",
    vehicleId: "veh-008",
    vehiclePlate: "GH-4567-22",
  },
];

const DriverViolations: React.FC = () => {
  const [violations] = useState<Violation[]>(mockViolations);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");

  // Filter violations based on selected severity
  const filteredViolations =
    selectedSeverity === "all"
      ? violations
      : violations.filter((v) => v.severity === selectedSeverity);

  // Violation counts by type for the chart
  const violationsByType: Record<string, number> = violations.reduce(
    (acc: Record<string, number>, violation: Violation) => {
      acc[violation.type] = (acc[violation.type] || 0) + 1;
      return acc;
    },
    {}
  );

  // Sort types by count for display
  const sortedTypes = Object.entries(violationsByType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count }));

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  // Function to get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Low</span>
        );
      case "medium":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
            Medium
          </span>
        );
      case "high":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">High</span>;
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            {severity}
          </span>
        );
    }
  };

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Pending</span>
        );
      case "under-review":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
            Under Review
          </span>
        );
      case "resolved":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Resolved
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>
        );
    }
  };

  // Function to get violation icon
  const getViolationIcon = (type: string) => {
    switch (type) {
      case "speeding":
        return <span className="text-red-500">🚨</span>;
      case "hard-braking":
        return <span className="text-orange-500">⚠️</span>;
      case "hours-of-service":
        return <span className="text-purple-500">⏰</span>;
      case "unauthorized-stop":
        return <span className="text-blue-500">🛑</span>;
      case "idling":
        return <span className="text-yellow-500">⌛</span>;
      case "route-deviation":
        return <span className="text-green-500">🗺️</span>;
      case "mobile-usage":
        return <span className="text-red-500">📱</span>;
      default:
        return <span className="text-gray-500">❓</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Driver Violations</h1>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
              <option value="last180">Last 6 Months</option>
              <option value="last365">Last Year</option>
            </select>
          </div>

          <Button
            variant="outline"
            onClick={() => alert("Generate comprehensive violations report")}
          >
            Generate Report
          </Button>
        </div>
      </div>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-sm text-gray-600">Total Violations</p>
              <p className="text-3xl font-bold text-gray-900">{violations.length}</p>
              <p className="text-xs text-red-600">+3 from last period</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-sm text-gray-600">Pending Resolution</p>
              <p className="text-3xl font-bold text-orange-600">
                {
                  violations.filter((v) => v.status === "pending" || v.status === "under-review")
                    .length
                }
              </p>
              <p className="text-xs text-gray-600">Action required</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-sm text-gray-600">High Severity</p>
              <p className="text-3xl font-bold text-red-600">
                {violations.filter((v) => v.severity === "high").length}
              </p>
              <p className="text-xs text-red-600">Immediate attention needed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Violations by Type Chart */}
      <Card>
        <CardHeader title="Violations by Type" />
        <CardContent>
          <div className="space-y-4">
            {sortedTypes.map(({ type, count }) => (
              <div key={type}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium flex items-center">
                    {getViolationIcon(type)}
                    <span className="ml-2 capitalize">{type.replace(/-/g, " ")}</span>
                  </span>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(count / violations.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Violations List */}
      <Card>
        <CardHeader title="Violation Records" />
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="relative w-full md:w-64 mb-4 md:mb-0">
              <input
                type="text"
                placeholder="Search violations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            <div className="flex space-x-2">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                >
                  <option value="all">All Severity Levels</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredViolations.map((violation) => (
              <div
                key={violation.id}
                className={`border rounded-md overflow-hidden ${
                  violation.severity === "high"
                    ? "border-red-200"
                    : violation.severity === "medium"
                      ? "border-orange-200"
                      : "border-yellow-200"
                }`}
              >
                <div className="flex justify-between items-center p-4 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <AlertOctagon
                      className={`h-5 w-5 ${
                        violation.severity === "high"
                          ? "text-red-500"
                          : violation.severity === "medium"
                            ? "text-orange-500"
                            : "text-yellow-500"
                      }`}
                    />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 capitalize">
                        {violation.type.replace(/-/g, " ")} Violation
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatDate(violation.date)} • {violation.driverName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getSeverityBadge(violation.severity)}
                    {getStatusBadge(violation.status)}
                  </div>
                </div>

                <div className="p-4 bg-white">
                  <p className="text-sm text-gray-700 mb-3">{violation.description}</p>

                  <div className="flex flex-wrap gap-y-2">
                    <div className="w-full md:w-1/2 xl:w-1/3 flex items-start space-x-2">
                      <div className="bg-gray-100 p-1 rounded">
                        <Clock className="h-3 w-3 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm text-gray-900">{violation.location}</p>
                      </div>
                    </div>

                    <div className="w-full md:w-1/2 xl:w-1/3 flex items-start space-x-2">
                      <div className="bg-gray-100 p-1 rounded">
                        <FileText className="h-3 w-3 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Vehicle</p>
                        <p className="text-sm text-gray-900">{violation.vehiclePlate}</p>
                      </div>
                    </div>

                    {violation.actionTaken && (
                      <div className="w-full flex items-start space-x-2 mt-2">
                        <div className="bg-green-100 p-1 rounded">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Action Taken</p>
                          <p className="text-sm text-gray-900">{violation.actionTaken}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1"
                      onClick={() => alert(`View details for violation ${violation.id}`)}
                    >
                      <span>View Details</span>
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredViolations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No violations found matching the selected criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Repeat Offenders */}
      <Card>
        <CardHeader title="Drivers with Multiple Violations" />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Violations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Violation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Common Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Group violations by driver and count */}
                {Object.entries(
                  violations.reduce<
                    Record<
                      string,
                      {
                        driverId: string;
                        driverName: string;
                        count: number;
                        violations: Violation[];
                        latestDate: string | null;
                      }
                    >
                  >((acc, violation) => {
                    if (!acc[violation.driverId]) {
                      acc[violation.driverId] = {
                        driverId: violation.driverId,
                        driverName: violation.driverName,
                        count: 0,
                        violations: [],
                        latestDate: null,
                      };
                    }

                    const entry = acc[violation.driverId];
                    if (!entry) return acc; // Safety check, though this shouldn't happen

                    entry.count += 1;
                    entry.violations.push(violation);
                    const currentDate = new Date(violation.date);
                    if (!entry.latestDate || currentDate > new Date(entry.latestDate)) {
                      entry.latestDate = violation.date;
                    }
                    return acc;
                  }, {})
                )
                  .filter(([, data]) => data.count > 1)
                  .sort((a, b) => b[1].count - a[1].count)
                  .map(([driverId, data]) => {
                    // Find most common violation type
                    const typeCounts: Record<string, number> = data.violations.reduce(
                      (acc: Record<string, number>, violation: Violation) => {
                        acc[violation.type] = (acc[violation.type] || 0) + 1;
                        return acc;
                      },
                      {}
                    );

                    const mostCommonType = (Object.entries(typeCounts).sort(
                      (a, b) => b[1] - a[1]
                    )[0] || ["unknown", 0])[0];

                    return (
                      <tr key={driverId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{data.driverName}</div>
                          <div className="text-xs text-gray-500">ID: {driverId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium">{data.count}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {data.latestDate ? formatDate(data.latestDate) : "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize flex items-center">
                            {getViolationIcon(mostCommonType)}
                            <span className="ml-1">{mostCommonType.replace(/-/g, " ")}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alert(`View all violations for ${data.driverName}`)}
                          >
                            View History
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverViolations;
