import { Button } from "@/components/ui/Button";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import {
  BarChart,
  Calendar,
  Clock,
  DollarSign,
  Download,
  PieChart,
  TrendingUp,
  Wrench,
} from "lucide-react";
import React from "react";

const WorkshopAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart className="w-7 h-7 mr-2 text-blue-500" />
            Workshop Analytics Dashboard
          </h2>
          <p className="text-gray-600">
            Comprehensive analytics for workshop operations, costs, and efficiency
          </p>
        </div>
        <div>
          <Button variant="outline" icon={<Download className="w-4 h-4" />}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Jobs Completed</p>
                <p className="text-2xl font-bold text-blue-600">248</p>
                <p className="text-xs text-gray-400">Last 30 days</p>
              </div>
              <Wrench className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Avg. Completion Time</p>
                <p className="text-2xl font-bold text-green-600">3.2 days</p>
                <p className="text-xs text-gray-400">All job types</p>
              </div>
              <Clock className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Workshop Revenue</p>
                <p className="text-2xl font-bold text-purple-600">R287,450</p>
                <p className="text-xs text-gray-400">Last 30 days</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Parts Used</p>
                <p className="text-2xl font-bold text-orange-600">1,248</p>
                <p className="text-xs text-gray-400">Inventory items</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Types Chart */}
        <Card>
          <CardHeader title="Job Types Distribution" />
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Pie chart showing distribution of job types would be displayed here in production
                  environment.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 max-w-xs mx-auto text-sm">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    <span>Scheduled Maintenance (36%)</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <span>Repairs (24%)</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                    <span>Tyre Services (18%)</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    <span>Inspections (22%)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Times Chart */}
        <Card>
          <CardHeader title="Average Completion Times (Days)" />
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Bar chart showing average completion times would be displayed here in production
                  environment.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-2 max-w-xs mx-auto text-sm">
                  <div className="flex items-center justify-between">
                    <span>Oil Changes:</span>
                    <span className="font-medium">0.5 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Brake Jobs:</span>
                    <span className="font-medium">1.2 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Major Services:</span>
                    <span className="font-medium">3.7 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Engine Repairs:</span>
                    <span className="font-medium">5.8 days</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workshop Productivity */}
        <Card>
          <CardHeader title="Workshop Productivity" />
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">Technician Utilization</span>
                  <span className="text-sm font-medium text-gray-900">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">Bay Utilization</span>
                  <span className="text-sm font-medium text-gray-900">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "92%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">Parts Availability</span>
                  <span className="text-sm font-medium text-gray-900">78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: "78%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">On-Time Completion</span>
                  <span className="text-sm font-medium text-gray-900">81%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: "81%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Analysis */}
        <Card>
          <CardHeader title="Workshop Cost Analysis" />
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Labor Costs</p>
                  <p className="text-lg font-bold text-gray-900">R145,720</p>
                </div>
                <span className="text-sm text-gray-600">50.6%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Parts Costs</p>
                  <p className="text-lg font-bold text-gray-900">R98,450</p>
                </div>
                <span className="text-sm text-gray-600">34.2%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Overhead</p>
                  <p className="text-lg font-bold text-gray-900">R43,280</p>
                </div>
                <span className="text-sm text-gray-600">15.0%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="text-sm text-blue-600">Total Costs</p>
                  <p className="text-lg font-bold text-blue-900">R287,450</p>
                </div>
                <span className="text-sm text-blue-600">100%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trending Jobs */}
      <Card>
        <CardHeader
          title="Trending Maintenance Issues"
          action={
            <Button size="sm" variant="outline" icon={<Download className="w-4 h-4" />}>
              Export
            </Button>
          }
        />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Issue
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Affected Fleet
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Occurrences
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Avg. Repair Cost
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Brake System Failures
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    21H, 22H, 23H
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    24
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    R3,450
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <TrendingUp className="w-5 h-5 text-red-500 inline-block" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Electrical System Issues
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">All Fleets</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    18
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    R2,180
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <TrendingUp className="w-5 h-5 text-orange-500 inline-block" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Suspension Components
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    26H, 28H, 31H
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    12
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    R5,640
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <TrendingUp className="w-5 h-5 text-green-500 inline-block" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Cooling System Leaks
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">22H, 24H</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    9
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    R1,920
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <TrendingUp className="w-5 h-5 text-green-500 inline-block" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-blue-800 mb-4">About Workshop Analytics</h2>
        <p className="text-blue-700 mb-4">
          This dashboard provides key insights into workshop operations, performance metrics, and
          maintenance trends. In a production environment, this data would be pulled from Firestore
          collections tracking job cards, inspections, parts inventory, and labor records.
        </p>
        <p className="text-blue-700">Use these analytics to identify:</p>
        <ul className="list-disc pl-5 space-y-1 text-blue-700 mt-2">
          <li>Recurring maintenance issues across your fleet</li>
          <li>Opportunities to improve workshop efficiency</li>
          <li>Cost trends for better budget planning</li>
          <li>Parts consumption patterns for inventory optimization</li>
          <li>Technician productivity and utilization</li>
        </ul>
      </div>
    </div>
  );
};

export default WorkshopAnalytics;
