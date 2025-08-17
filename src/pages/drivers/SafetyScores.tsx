import { Button } from "../../components/ui/Button";
import { AlertTriangle, CheckCircle, Info, Shield, TrendingDown, TrendingUp } from "lucide-react";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Card, { CardContent, CardHeader } from "../../components/ui/Card";

// Mock data for driver safety scores
const mockSafetyData = [
  {
    id: "1",
    name: "John Doe",
    safetyScore: 92,
    trend: "up",
    incidents: 0,
    lastIncidentDate: null,
    riskLevel: "Low",
    trainingStatus: "Complete",
    safetyTips: ["Maintain safe following distance", "Regular vehicle inspection"],
  },
  {
    id: "2",
    name: "Jane Smith",
    safetyScore: 88,
    trend: "down",
    incidents: 1,
    lastIncidentDate: "2023-04-15",
    riskLevel: "Medium",
    trainingStatus: "Due",
    safetyTips: ["Complete defensive driving course", "Improve braking technique"],
  },
  {
    id: "3",
    name: "Mike Johnson",
    safetyScore: 75,
    trend: "down",
    incidents: 2,
    lastIncidentDate: "2023-06-22",
    riskLevel: "High",
    trainingStatus: "Overdue",
    safetyTips: ["Complete mandatory safety review", "Schedule coaching session"],
  },
  {
    id: "4",
    name: "Sarah Williams",
    safetyScore: 95,
    trend: "up",
    incidents: 0,
    lastIncidentDate: null,
    riskLevel: "Low",
    trainingStatus: "Complete",
    safetyTips: ["Continue excellent defensive driving", "Share best practices with team"],
  },
];

/**
 * SafetyScores Component
 * Displays safety scores and metrics for drivers
 */
const SafetyScores: React.FC = () => {
  const { driverId } = useParams<{ driverId?: string }>();
  const [safetyData] = useState(mockSafetyData);
  const [timeRange, setTimeRange] = useState("6months");

  // If we have a driverId, filter for just that driver
  const filteredData = driverId
    ? safetyData.filter((driver) => driver.id === driverId)
    : safetyData;

  // Sort by safety score (descending)
  const sortedData = [...filteredData].sort((a, b) => b.safetyScore - a.safetyScore);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Driver Safety Scores</h1>
          <p className="text-gray-600">Monitor and manage driver safety performance</p>
        </div>

        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
            <option value="all">All Time</option>
          </select>

          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {/* Company-wide safety metrics */}
      {!driverId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="bg-blue-50 pb-2">
              <h3 className="font-medium text-blue-800">Fleet Average Score</h3>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-blue-700">87.5</div>
              <p className="text-sm text-gray-500 mt-1">Score out of 100</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-green-50 pb-2">
              <h3 className="font-medium text-green-800">Incident-Free Drivers</h3>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-green-700">75%</div>
              <p className="text-sm text-gray-500 mt-1">2 drivers need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-orange-50 pb-2">
              <h3 className="font-medium text-orange-800">Training Compliance</h3>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-orange-700">85%</div>
              <p className="text-sm text-gray-500 mt-1">3 training sessions due</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Driver Safety Scores List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Safety Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Incidents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Training
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {driver.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                          driver.safetyScore >= 90
                            ? "bg-green-100 text-green-800"
                            : driver.safetyScore >= 80
                              ? "bg-blue-100 text-blue-800"
                              : driver.safetyScore >= 70
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {driver.safetyScore}
                      </div>
                      <span>{driver.safetyScore}/100</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {driver.trend === "up" ? (
                      <span className="inline-flex items-center text-green-700">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Improving
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-700">
                        <TrendingDown className="w-4 h-4 mr-1" />
                        Declining
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        driver.riskLevel === "Low"
                          ? "bg-green-100 text-green-800"
                          : driver.riskLevel === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {driver.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {driver.incidents === 0 ? (
                      <span className="inline-flex items-center text-green-700">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        None
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-700">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {driver.incidents} {driver.incidents === 1 ? "incident" : "incidents"}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        driver.trainingStatus === "Complete"
                          ? "bg-green-100 text-green-800"
                          : driver.trainingStatus === "Due"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {driver.trainingStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Info className="w-5 h-5" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-800">
                        <Shield className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No driver data available for the selected filters.</p>
          </div>
        )}
      </div>

      {/* Safety Tips Section */}
      {driverId && filteredData.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-lg font-medium">Safety Recommendations</h3>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {filteredData[0].safetyTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SafetyScores;
