import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import SyncIndicator from "../../components/ui/SyncIndicator";
import { BarChart2, Calendar, Download, Leaf, Truck } from "lucide-react";
import React, { useState } from "react";

const CarbonFootprintCalc: React.FC = () => {
  const [timeRange, setTimeRange] = useState("month");

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Carbon Footprint Calculator</h2>
        <div className="flex space-x-2">
          <Button variant="outline" icon={<Download className="w-4 h-4" />}>
            Export Report
          </Button>
          <SyncIndicator />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Total CO2 Emissions</h3>
              <Leaf className="h-5 w-5 text-green-500" />
            </div>
            <p className="mt-2 text-3xl font-bold">24.5 tons</p>
            <p className="text-sm text-gray-500">From fleet operations this {timeRange}</p>
            <div className="mt-4 text-sm">
              <span className="text-red-500 font-medium">+2.3 tons</span>
              <span className="text-gray-500"> vs last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Average per Trip</h3>
              <Truck className="h-5 w-5 text-blue-500" />
            </div>
            <p className="mt-2 text-3xl font-bold">0.82 tons</p>
            <p className="text-sm text-gray-500">CO2 per completed trip</p>
            <div className="mt-4 text-sm">
              <span className="text-green-500 font-medium">-0.05 tons</span>
              <span className="text-gray-500"> vs last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">CO2 per Ton-KM</h3>
              <BarChart2 className="h-5 w-5 text-purple-500" />
            </div>
            <p className="mt-2 text-3xl font-bold">48 g/ton-km</p>
            <p className="text-sm text-gray-500">Industry avg: 62 g/ton-km</p>
            <div className="mt-4 text-sm">
              <span className="text-green-500 font-medium">22% better</span>
              <span className="text-gray-500"> than industry average</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Emissions by Vehicle Type</h3>

          {/* This would be a chart in a real implementation */}
          <div className="bg-gray-100 p-6 rounded-lg flex flex-col items-center justify-center h-64">
            <p className="text-gray-500">
              Bar chart showing emissions by vehicle type would appear here
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Using real data from Firestore in the actual implementation
            </p>
          </div>

          <div className="mt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Vehicle Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fleet Count
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total CO2 (tons)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    CO2 per Vehicle
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Heavy Duty Trucks
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">12</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">15.8</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1.32</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">64.5%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Medium Duty Trucks
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">8</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">6.2</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0.78</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">25.3%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Light Delivery Vehicles
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2.5</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0.50</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10.2%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Emission Reduction Opportunities</h3>

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">Route Optimization</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Potential CO2 reduction of 2.8 tons per month by optimizing routes to reduce
                  distance traveled.
                </p>
                <Button size="sm">View Details</Button>
              </div>

              <div className="flex-1 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">Driver Training</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Estimated 1.5 tons CO2 savings through eco-driving techniques training for fleet
                  drivers.
                </p>
                <Button size="sm">View Details</Button>
              </div>

              <div className="flex-1 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">Fleet Modernization</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Replacing 3 oldest vehicles could reduce emissions by 4.2 tons annually.
                </p>
                <Button size="sm">View Details</Button>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Emission Targets</h4>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">2025 Target: 15% Reduction</span>
                    <span className="text-sm font-medium">42%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "42%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">2026 Target: 25% Reduction</span>
                    <span className="text-sm font-medium">18%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-yellow-500 h-2.5 rounded-full"
                      style={{ width: "18%" }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">2027 Target: 40% Reduction</span>
                    <span className="text-sm font-medium">5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: "5%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CarbonFootprintCalc;
