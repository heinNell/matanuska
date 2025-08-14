import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import SyncIndicator from "@/components/ui/SyncIndicator";
import { Filter, Search, TrendingDown, TrendingUp, User } from "lucide-react";
import React, { useState } from "react";

interface DriverFuelScore {
  id: string;
  driverName: string;
  idlingScore: number;
  accelerationScore: number;
  speedScore: number;
  overallScore: number;
  fuelEfficiency: number;
  rpmRanking: number;
  brakeCount: number;
  improvementTrend: "improving" | "declining" | "stable";
}

const DriverFuelBehavior: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("overallScore");
  const [sortOrder, setSortOrder] = useState("desc");

  // Mock data for demonstration
  const driverScores: DriverFuelScore[] = [
    {
      id: "driver-001",
      driverName: "John Smith",
      idlingScore: 85,
      accelerationScore: 92,
      speedScore: 78,
      overallScore: 85,
      fuelEfficiency: 3.4,
      rpmRanking: 1,
      brakeCount: 15,
      improvementTrend: "improving",
    },
    {
      id: "driver-002",
      driverName: "Jane Doe",
      idlingScore: 76,
      accelerationScore: 68,
      speedScore: 84,
      overallScore: 76,
      fuelEfficiency: 3.1,
      rpmRanking: 3,
      brakeCount: 22,
      improvementTrend: "stable",
    },
    {
      id: "driver-003",
      driverName: "Mike Johnson",
      idlingScore: 92,
      accelerationScore: 88,
      speedScore: 90,
      overallScore: 90,
      fuelEfficiency: 3.6,
      rpmRanking: 2,
      brakeCount: 12,
      improvementTrend: "improving",
    },
    {
      id: "driver-004",
      driverName: "Sarah Williams",
      idlingScore: 64,
      accelerationScore: 72,
      speedScore: 68,
      overallScore: 68,
      fuelEfficiency: 2.9,
      rpmRanking: 5,
      brakeCount: 28,
      improvementTrend: "declining",
    },
    {
      id: "driver-005",
      driverName: "Alex Brown",
      idlingScore: 82,
      accelerationScore: 75,
      speedScore: 80,
      overallScore: 79,
      fuelEfficiency: 3.3,
      rpmRanking: 4,
      brakeCount: 18,
      improvementTrend: "stable",
    },
  ];

  // Handle search filter
  const filteredDrivers = driverScores.filter((driver) =>
    driver.driverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle sorting
  const sortedDrivers = [...filteredDrivers].sort((a, b) => {
    const fieldA = a[sortField as keyof DriverFuelScore];
    const fieldB = b[sortField as keyof DriverFuelScore];

    if (typeof fieldA === "number" && typeof fieldB === "number") {
      return sortOrder === "asc" ? fieldA - fieldB : fieldB - fieldA;
    }

    // For string fields
    if (typeof fieldA === "string" && typeof fieldB === "string") {
      return sortOrder === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
    }

    return 0;
  });

  // Handle sort change
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc"); // Default to descending for new sort field
    }
  };

  // Get score color class
  const getScoreColorClass = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  // Get trend indicator
  const getTrendIndicator = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Driver Fuel Behavior</h2>
        <SyncIndicator />
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by driver name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Top Performer</h3>
              <User className="h-5 w-5 text-blue-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-green-600">Mike Johnson</p>
            <p className="text-sm text-gray-500">90/100 Fuel Efficiency Score</p>
            <div className="mt-4 text-sm">
              <span className="text-green-500 font-medium">3.6 km/L</span>
              <span className="text-gray-500"> average fuel efficiency</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Needs Improvement</h3>
              <User className="h-5 w-5 text-red-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-red-600">Sarah Williams</p>
            <p className="text-sm text-gray-500">68/100 Fuel Efficiency Score</p>
            <div className="mt-4 text-sm">
              <span className="text-red-500 font-medium">2.9 km/L</span>
              <span className="text-gray-500"> average fuel efficiency</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Fleet Average</h3>
              <Filter className="h-5 w-5 text-gray-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-yellow-600">79.6</p>
            <p className="text-sm text-gray-500">Overall fuel efficiency score</p>
            <div className="mt-4 text-sm">
              <span className="text-blue-500 font-medium">3.3 km/L</span>
              <span className="text-gray-500"> average fuel efficiency</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("driverName")}
                  >
                    Driver Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("overallScore")}
                  >
                    Overall Score
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("idlingScore")}
                  >
                    Idling
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("accelerationScore")}
                  >
                    Acceleration
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("speedScore")}
                  >
                    Speed
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("fuelEfficiencyScore")}
                  >
                    Fuel Efficiency
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("harshBrakingScore")}
                  >
                    Harsh Braking
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {driver.driverName}
                          </div>
                          <div className="text-xs text-gray-500">Rank: {driver.rpmRanking}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-bold ${getScoreColorClass(driver.overallScore)}`}
                      >
                        {driver.overallScore}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            driver.overallScore >= 85
                              ? "bg-green-500"
                              : driver.overallScore >= 70
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${driver.overallScore}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-medium ${getScoreColorClass(driver.idlingScore)}`}
                      >
                        {driver.idlingScore}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-medium ${getScoreColorClass(driver.accelerationScore)}`}
                      >
                        {driver.accelerationScore}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-medium ${getScoreColorClass(driver.speedScore)}`}
                      >
                        {driver.speedScore}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.fuelEfficiency.toFixed(1)} km/L
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.brakeCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {getTrendIndicator(driver.improvementTrend)}
                        <span className="ml-1">{driver.improvementTrend}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Improvement Recommendations</h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium">Idling Reduction</h4>
              <p className="text-sm text-gray-600">
                Train drivers to minimize excessive idling by turning off engines during stops
                longer than 2 minutes. This can reduce fuel consumption by up to 5%.
              </p>
            </div>

            <div>
              <h4 className="text-md font-medium">Progressive Acceleration</h4>
              <p className="text-sm text-gray-600">
                Encourage smooth, gradual acceleration rather than aggressive starts. This technique
                can improve fuel efficiency by 10-15% in urban environments.
              </p>
            </div>

            <div>
              <h4 className="text-md font-medium">Optimal Speed Management</h4>
              <p className="text-sm text-gray-600">
                Maintain consistent speeds and avoid exceeding optimal fuel efficiency range
                (typically 80-90 km/h for heavy vehicles). Every 10 km/h above 90 km/h increases
                fuel consumption by approximately 10%.
              </p>
            </div>

            <div>
              <h4 className="text-md font-medium">Anticipatory Driving</h4>
              <p className="text-sm text-gray-600">
                Look ahead to anticipate traffic changes and avoid unnecessary braking. This reduces
                fuel-consuming acceleration cycles.
              </p>
            </div>

            <div className="mt-6">
              <Button>Schedule Driver Training</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverFuelBehavior;
