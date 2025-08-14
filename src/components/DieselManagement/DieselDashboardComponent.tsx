import React, { useState } from "react";
import { Link } from "react-router-dom";

/**
 * Dashboard component for diesel management with overview statistics and quick access to features
 */
const DieselDashboardComponent: React.FC = () => {
  // State for the selected date range filter
  const [dateRange, setDateRange] = useState<string>("thisMonth");

  // Mock data
  const fuelData = {
    totalLiters: 24680,
    totalCost: 35721.5,
    averageCost: 1.45,
    totalVehicles: 47,
    fuelEfficiency: 8.7, // km/L
    averagePerVehicle: 525.1, // L
    savings: 2150.75,
    fuelThefts: 3,
    carbonEmissions: 64.2, // tons
  };

  // Chart data placeholders
  const chartData = {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    consumption: [1800, 1950, 2100, 2050, 2200, 2150, 2300, 2250, 2100, 2050, 1950, 1900],
    costs: [2610, 2827, 3045, 2972, 3190, 3117, 3335, 3262, 3045, 2972, 2827, 2755],
  };

  // Recent fuel entries (mock data)
  const recentEntries = [
    {
      id: "FL-1234",
      vehicle: "TRK-101",
      liters: 150,
      cost: 217.5,
      date: "2023-07-21",
      location: "Main Depot",
      driver: "John Doe",
    },
    {
      id: "FL-1233",
      vehicle: "TRK-105",
      liters: 200,
      cost: 290.0,
      date: "2023-07-20",
      location: "Highway Station",
      driver: "Jane Smith",
    },
    {
      id: "FL-1232",
      vehicle: "TRK-103",
      liters: 175,
      cost: 253.75,
      date: "2023-07-19",
      location: "City Gas",
      driver: "Mike Johnson",
    },
    {
      id: "FL-1231",
      vehicle: "TRK-102",
      liters: 160,
      cost: 232.0,
      date: "2023-07-18",
      location: "Main Depot",
      driver: "Sarah Williams",
    },
    {
      id: "FL-1230",
      vehicle: "TRK-104",
      liters: 180,
      cost: 261.0,
      date: "2023-07-17",
      location: "Rural Station",
      driver: "David Brown",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-between items-center">
        <div>
          <label htmlFor="date-range" className="mr-2 font-medium">
            Date Range:
          </label>
          <select
            id="date-range"
            className="border rounded-md px-3 py-1.5"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisYear">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <div className="flex space-x-2">
          <Link
            to="/diesel/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Fuel Entry
          </Link>
          <Link
            to="/diesel/analytics"
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
          >
            View Analytics
          </Link>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Fuel (Liters)</h3>
          <p className="text-2xl font-bold text-blue-600">
            {fuelData.totalLiters.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Cost</h3>
          <p className="text-2xl font-bold text-red-600">
            $
            {fuelData.totalCost.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Average Cost per Liter</h3>
          <p className="text-2xl font-bold text-gray-700">${fuelData.averageCost.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Cost Savings</h3>
          <p className="text-2xl font-bold text-green-600">
            $
            {fuelData.savings.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* Fuel Consumption & Cost Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Fuel Consumption Trend</h2>
          {/* Chart placeholder */}
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">Fuel Consumption Chart</p>
              <p className="text-gray-400 text-sm">Monthly consumption trend visualization</p>
              <p className="text-sm mt-2">
                Highest consumption: {Math.max(...chartData.consumption).toLocaleString()} L (
                {
                  chartData.months[
                    chartData.consumption.indexOf(Math.max(...chartData.consumption))
                  ]
                }
                )
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Fuel Cost Analysis</h2>
          {/* Chart placeholder */}
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">Fuel Cost Chart</p>
              <p className="text-gray-400 text-sm">Monthly cost trend visualization</p>
              <p className="text-sm mt-2">
                Highest cost: ${Math.max(...chartData.costs).toLocaleString()} (
                {chartData.months[chartData.costs.indexOf(Math.max(...chartData.costs))]})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fuel Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Average Efficiency</h3>
          <p className="text-2xl font-bold text-blue-600">
            {fuelData.fuelEfficiency.toFixed(1)} km/L
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Avg. Consumption per Vehicle</h3>
          <p className="text-2xl font-bold text-blue-600">
            {fuelData.averagePerVehicle.toFixed(1)} L
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Carbon Emissions</h3>
          <p className="text-2xl font-bold text-gray-700">{fuelData.carbonEmissions} tons</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/diesel/new"
              className="bg-blue-600 text-white py-2 px-3 rounded text-center hover:bg-blue-700"
            >
              Add Fuel Entry
            </Link>
            <Link
              to="/diesel/fuel-cards"
              className="bg-gray-100 text-gray-800 py-2 px-3 rounded text-center hover:bg-gray-200"
            >
              Manage Fuel Cards
            </Link>
            <Link
              to="/diesel/theft-detection"
              className="bg-gray-100 text-gray-800 py-2 px-3 rounded text-center hover:bg-gray-200"
            >
              Fuel Theft Alerts
            </Link>
            <Link
              to="/diesel/stations"
              className="bg-gray-100 text-gray-800 py-2 px-3 rounded text-center hover:bg-gray-200"
            >
              Fuel Stations
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Alerts</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-yellow-200 bg-yellow-50 rounded">
              <span>Unusual consumption detected for TRK-102</span>
              <Link to="/diesel/alerts" className="text-blue-600 hover:underline text-sm">
                View
              </Link>
            </div>
            <div className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded">
              <span>Potential fuel theft: TRK-105</span>
              <Link to="/diesel/theft-detection" className="text-blue-600 hover:underline text-sm">
                Investigate
              </Link>
            </div>
            <div className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded">
              <span>Fuel price drop at Main Depot station</span>
              <Link to="/diesel/stations" className="text-blue-600 hover:underline text-sm">
                Details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Fuel Entries */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Recent Fuel Entries</h2>
          <Link to="/diesel/logs" className="text-blue-600 hover:text-blue-800">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liters
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{entry.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{entry.vehicle}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{entry.liters}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">${entry.cost.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{entry.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{entry.location}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{entry.driver}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => console.log("View entry", entry.id)}
                      >
                        View
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-800"
                        onClick={() => console.log("Edit entry", entry.id)}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vehicle Efficiency Ranking */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Vehicle Efficiency Ranking</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg bg-green-50 border-green-200">
            <h3 className="font-medium">Most Efficient</h3>
            <p className="text-lg mt-2">TRK-103</p>
            <p className="text-green-600">10.2 km/L</p>
          </div>
          <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
            <h3 className="font-medium">Average</h3>
            <p className="text-lg mt-2">TRK-101</p>
            <p className="text-yellow-600">8.7 km/L</p>
          </div>
          <div className="p-4 border rounded-lg bg-red-50 border-red-200">
            <h3 className="font-medium">Least Efficient</h3>
            <p className="text-lg mt-2">TRK-105</p>
            <p className="text-red-600">6.8 km/L</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DieselDashboardComponent;
