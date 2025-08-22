import { Button } from "../../components/ui/Button";
import {
  Activity,
  BarChart,
  Download,
  MapPin,
  PieChart,
  RefreshCw,
  TrendingUp,
  User,
} from "lucide-react";
import React, { useState } from "react";
import DriverPerformanceOverview from "../../components/DriverManagement/DriverPerformanceOverview";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import SyncIndicator from "../../components/ui/SyncIndicator";
import { useAppContext } from "../../context/AppContext";

const DriverPerformancePage: React.FC = () => {
  const { isLoading } = useAppContext();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">("month");

  // Mock data for driver performance
  const driversData = [
    {
      id: "driver1",
      name: "John Doe",
      tripsCompleted: 42,
      onTimePercentage: 96,
      fuelEfficiency: 8.5,
      safetyScore: 94,
      safetyIncidents: 0,
      customerFeedback: 4.8,
    },
    {
      id: "driver2",
      name: "Jane Smith",
      tripsCompleted: 38,
      onTimePercentage: 92,
      fuelEfficiency: 9.2,
      safetyScore: 90,
      safetyIncidents: 1,
      customerFeedback: 4.6,
    },
    {
      id: "driver3",
      name: "Michael Johnson",
      tripsCompleted: 45,
      onTimePercentage: 89,
      fuelEfficiency: 7.9,
      safetyScore: 88,
      safetyIncidents: 1,
      customerFeedback: 4.5,
    },
    {
      id: "driver4",
      name: "David Williams",
      tripsCompleted: 36,
      onTimePercentage: 94,
      fuelEfficiency: 8.8,
      safetyScore: 92,
      safetyIncidents: 0,
      customerFeedback: 4.7,
    },
    {
      id: "driver5",
      name: "Sarah Miller",
      tripsCompleted: 40,
      onTimePercentage: 90,
      fuelEfficiency: 8.2,
      safetyScore: 91,
      safetyIncidents: 1,
      customerFeedback: 4.6,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Integrated detailed performance overview component */}
      <DriverPerformanceOverview />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Performance</h1>
          <p className="text-gray-600">Analytics and metrics for driver performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <SyncIndicator />
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
            <button
              className={`px-3 py-1 text-sm rounded ${timeRange === "week" ? "bg-white shadow" : ""}`}
              onClick={() => setTimeRange("week")}
            >
              Week
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${timeRange === "month" ? "bg-white shadow" : ""}`}
              onClick={() => setTimeRange("month")}
            >
              Month
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${timeRange === "quarter" ? "bg-white shadow" : ""}`}
              onClick={() => setTimeRange("quarter")}
            >
              Quarter
            </button>
          </div>
          <Button variant="outline" icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Button
            variant="outline"
            icon={<RefreshCw className="w-4 h-4" />}
            disabled={isLoading?.fetchingPerformance}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. On-Time Rate</p>
                <p className="text-2xl font-bold text-gray-900">92%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full mr-4">
                <MapPin className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">386</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full mr-4">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Safety Incidents</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Driver Leaderboard */}
      <Card>
        <CardHeader title="Driver Performance Rankings" />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trips Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    On-Time %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fuel Efficiency (km/l)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Safety Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Feedback
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {driversData.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                          {driver.name.charAt(0)}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.tripsCompleted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            driver.onTimePercentage >= 95
                              ? "bg-green-100 text-green-800"
                              : driver.onTimePercentage >= 90
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {driver.onTimePercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.fuelEfficiency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            driver.safetyScore >= 92
                              ? "bg-green-500"
                              : driver.safetyScore >= 85
                                ? "bg-blue-500"
                                : "bg-yellow-500"
                          }`}
                          style={{ width: `${driver.safetyScore}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {driver.safetyScore}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(driver.customerFeedback) ? "text-yellow-400" : "text-gray-300"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                        <span className="ml-1 text-sm text-gray-500">
                          {driver.customerFeedback}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button size="sm" variant="outline">
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Trip On-Time Performance" />
          <CardContent>
            <div className="flex justify-center items-center h-64">
              <BarChart className="h-32 w-32 text-gray-300" />
              <div className="text-sm text-gray-500 mt-4 text-center">
                This chart would display on-time performance trends
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Safety Incidents by Category" />
          <CardContent>
            <div className="flex justify-center items-center h-64">
              <PieChart className="h-32 w-32 text-gray-300" />
              <div className="ml-6 space-y-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm">Speeding (2)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Harsh Braking (1)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm">Rapid Acceleration (1)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm">Other (1)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverPerformancePage;
