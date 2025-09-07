import { Button } from "../../components/ui/Button";
import { Calendar, Download, Filter } from "lucide-react";
import React from "react";
import { Card, CardContent, CardHeader } from "../ui/Card";

const PerformanceAnalytics: React.FC = () => {
  // These would be replaced with actual charts in a real implementation
  // For now, using colored bars to simulate charts
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Driver Performance Analytics</h1>

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

          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Overall Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-sm text-gray-600">Safety Score</p>
              <p className="text-3xl font-bold text-green-600">92.7%</p>
              <p className="text-xs text-green-600">+2.3% from last period</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-sm text-gray-600">On-Time Rate</p>
              <p className="text-3xl font-bold text-blue-600">87.5%</p>
              <p className="text-xs text-red-600">-1.2% from last period</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-sm text-gray-600">Fuel Efficiency</p>
              <p className="text-3xl font-bold text-purple-600">78.9%</p>
              <p className="text-xs text-green-600">+0.8% from last period</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-sm text-gray-600">Compliance Rate</p>
              <p className="text-3xl font-bold text-yellow-600">96.3%</p>
              <p className="text-xs text-gray-600">No change from last period</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Driver Performance Comparison */}
      <Card>
        <CardHeader title="Driver Performance Comparison" />
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              Comparing top 5 drivers based on overall performance
            </div>
            <div className="flex space-x-2">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option value="overall">Overall Performance</option>
                  <option value="safety">Safety Score</option>
                  <option value="ontime">On-Time Rate</option>
                  <option value="fuel">Fuel Efficiency</option>
                </select>
              </div>
            </div>
          </div>

          {/* Simulated Bar Chart */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">John Doe</span>
                <span className="text-sm text-gray-600">94.2%</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "94.2%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Sarah Williams</span>
                <span className="text-sm text-gray-600">91.8%</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "91.8%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Michael Johnson</span>
                <span className="text-sm text-gray-600">88.5%</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "88.5%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Jane Smith</span>
                <span className="text-sm text-gray-600">86.3%</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "86.3%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Robert Brown</span>
                <span className="text-sm text-gray-600">82.9%</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "82.9%" }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Safety Score Trend */}
        <Card>
          <CardHeader title="Safety Score Trend" />
          <CardContent>
            {/* Simulated Line Chart */}
            <div className="h-64 flex items-end justify-between px-2">
              <div className="w-[8%] bg-blue-500 rounded-t-md h-[60%]" />
              <div className="w-[8%] bg-blue-500 rounded-t-md h-[70%]" />
              <div className="w-[8%] bg-blue-500 rounded-t-md h-[65%]" />
              <div className="w-[8%] bg-blue-500 rounded-t-md h-[75%]" />
              <div className="w-[8%] bg-blue-500 rounded-t-md h-[72%]" />
              <div className="w-[8%] bg-blue-500 rounded-t-md h-[80%]" />
              <div className="w-[8%] bg-blue-500 rounded-t-md h-[82%]" />
              <div className="w-[8%] bg-blue-500 rounded-t-md h-[85%]" />
              <div className="w-[8%] bg-blue-500 rounded-t-md h-[90%]" />
              <div className="w-[8%] bg-blue-500 rounded-t-md h-[93%]" />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <div>Jan</div>
              <div>Feb</div>
              <div>Mar</div>
              <div>Apr</div>
              <div>May</div>
              <div>Jun</div>
              <div>Jul</div>
              <div>Aug</div>
              <div>Sep</div>
              <div>Oct</div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Safety scores have shown consistent improvement over the last 10 months, with a
              significant jump in the last quarter.
            </div>
          </CardContent>
        </Card>

        {/* On-Time Delivery Trend */}
        <Card>
          <CardHeader title="On-Time Delivery Trend" />
          <CardContent>
            {/* Simulated Line Chart */}
            <div className="h-64 flex items-end justify-between px-2">
              <div className="w-[8%] bg-green-500 rounded-t-md h-[88%]" />
              <div className="w-[8%] bg-green-500 rounded-t-md h-[85%]" />
              <div className="w-[8%] bg-green-500 rounded-t-md h-[90%]" />
              <div className="w-[8%] bg-green-500 rounded-t-md h-[82%]" />
              <div className="w-[8%] bg-green-500 rounded-t-md h-[80%]" />
              <div className="w-[8%] bg-green-500 rounded-t-md h-[75%]" />
              <div className="w-[8%] bg-green-500 rounded-t-md h-[83%]" />
              <div className="w-[8%] bg-green-500 rounded-t-md h-[87%]" />
              <div className="w-[8%] bg-green-500 rounded-t-md h-[85%]" />
              <div className="w-[8%] bg-green-500 rounded-t-md h-[87%]" />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <div>Jan</div>
              <div>Feb</div>
              <div>Mar</div>
              <div>Apr</div>
              <div>May</div>
              <div>Jun</div>
              <div>Jul</div>
              <div>Aug</div>
              <div>Sep</div>
              <div>Oct</div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              On-time delivery rates saw a slight decline during mid-year but have recovered in
              recent months.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics Breakdown */}
      <Card>
        <CardHeader title="Performance Metrics Breakdown" />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metric
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Previous
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry Avg
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Hard Braking Events
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    1.2 per 100km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    1.8 per 100km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">-33.3%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2.1 per 100km
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Speeding Events
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2.5 per 100km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2.2 per 100km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">+13.6%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    3.0 per 100km
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Fuel Consumption
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    32.5 L/100km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    33.8 L/100km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">-3.8%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    34.2 L/100km
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Idle Time
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">8.2%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">9.5%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">-13.7%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10.3%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Route Adherence
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">94.8%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">93.2%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+1.7%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">91.5%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Customer Satisfaction
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4.7/5.0</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4.6/5.0</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+2.2%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4.3/5.0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceAnalytics;
