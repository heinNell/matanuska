import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Select } from "../../components/ui/FormElements";
import SyncIndicator from "../../components/ui/SyncIndicator";
import { BarChart, Download, Filter, PieChart, TrendingDown, TrendingUp } from "lucide-react";
import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";

const CostAnalysisPage: React.FC = () => {
  const { isLoading } = useAppContext();
  const [timeframe, setTimeframe] = useState<string>("month");
  const [filterType, setFilterType] = useState<string>("all");

  // Mock cost data
  const costData = [
    { category: "Fuel", amount: 15425, percentage: 45 },
    { category: "Maintenance", amount: 8250, percentage: 24 },
    { category: "Driver Salary", amount: 6200, percentage: 18 },
    { category: "Tolls", amount: 1750, percentage: 5 },
    { category: "Insurance", amount: 1200, percentage: 4 },
    { category: "Miscellaneous", amount: 1375, percentage: 4 },
  ];

  // Mock trip cost data
  const tripCostData = [
    {
      id: "TR-2345",
      origin: "Windhoek",
      destination: "Walvis Bay",
      distance: 380,
      totalCost: 4250,
      costPerKm: 11.18,
    },
    {
      id: "TR-2346",
      origin: "Windhoek",
      destination: "Swakopmund",
      distance: 360,
      totalCost: 4100,
      costPerKm: 11.39,
    },
    {
      id: "TR-2347",
      origin: "Windhoek",
      destination: "Lüderitz",
      distance: 680,
      totalCost: 7500,
      costPerKm: 11.03,
    },
    {
      id: "TR-2348",
      origin: "Windhoek",
      destination: "Keetmanshoop",
      distance: 500,
      totalCost: 5600,
      costPerKm: 11.2,
    },
    {
      id: "TR-2349",
      origin: "Windhoek",
      destination: "Rundu",
      distance: 720,
      totalCost: 8200,
      costPerKm: 11.39,
    },
  ];

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NA", {
      style: "currency",
      currency: "NAD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trip Cost Analysis</h1>
          <p className="text-gray-600">Analyze and track costs across your fleet operations</p>
        </div>
        <div className="flex items-center space-x-3">
          <SyncIndicator />
          <Select
            label="Timeframe"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            options={[
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
              { value: "quarter", label: "This Quarter" },
              { value: "year", label: "This Year" },
            ]}
          />
          <Button variant="outline" icon={<Filter className="w-4 h-4" />}>
            More Filters
          </Button>
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            disabled={isLoading?.exportingData}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Cost Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <BarChart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(34200)}</p>
                <p className="text-xs text-green-600">+4.2% from last period</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <TrendingDown className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Cost per Trip</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(4275)}</p>
                <p className="text-xs text-green-600">-2.1% from last period</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full mr-4">
                <TrendingDown className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Cost per KM</p>
                <p className="text-2xl font-bold text-gray-900">N$ 11.24</p>
                <p className="text-xs text-green-600">-0.8% from last period</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full mr-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Fuel Cost %</p>
                <p className="text-2xl font-bold text-gray-900">45%</p>
                <p className="text-xs text-red-600">+1.5% from last period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Cost Breakdown" />
          <CardContent>
            <div className="flex justify-center items-center h-64">
              <PieChart className="h-32 w-32 text-gray-300" />
              <div className="ml-6 space-y-2">
                {costData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 bg-${
                          ["blue", "green", "yellow", "purple", "red", "indigo"][index % 6]
                        }-500`}
                      ></div>
                      <span className="text-sm">{item.category}</span>
                    </div>
                    <div className="flex space-x-4">
                      <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
                      <span className="text-sm text-gray-500 w-10 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Cost Trend (Last 6 Months)" />
          <CardContent>
            <div className="flex justify-center items-center h-64">
              <BarChart className="h-32 w-32 text-gray-300" />
              <div className="text-sm text-gray-500 mt-4 text-center">
                This chart would display cost trends over time
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trip Cost Analysis Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Trip Costs</h2>
            <Select
              label="Filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: "all", label: "All Routes" },
                { value: "coastal", label: "Coastal Routes" },
                { value: "northern", label: "Northern Routes" },
                { value: "southern", label: "Southern Routes" },
              ]}
              className="w-48"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost/KM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tripCostData.map((trip, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {trip.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trip.origin} to {trip.destination}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trip.distance} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(trip.totalCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      N$ {trip.costPerKm.toFixed(2)}
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

      {/* Cost Saving Opportunities */}
      <Card>
        <CardHeader title="Cost Saving Opportunities" />
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start p-4 border rounded-lg">
              <div className="p-2 bg-green-100 rounded-full mr-4">
                <TrendingDown className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Optimize Fuel Consumption</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Potential saving of N$ 2,450 per month by implementing eco-driving training and
                  route optimization.
                </p>
              </div>
            </div>
            <div className="flex items-start p-4 border rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full mr-4">
                <TrendingDown className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Preventive Maintenance</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Potential saving of N$ 1,800 per month by implementing better preventive
                  maintenance schedules.
                </p>
              </div>
            </div>
            <div className="flex items-start p-4 border rounded-lg">
              <div className="p-2 bg-yellow-100 rounded-full mr-4">
                <TrendingDown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Load Optimization</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Potential saving of N$ 1,250 per month by improving load factors and reducing
                  empty trips.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostAnalysisPage;
