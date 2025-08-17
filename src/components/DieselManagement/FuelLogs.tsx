import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import SyncIndicator from "../../components/ui/SyncIndicator";
import { Calendar, Download, Filter, Search } from "lucide-react";
import React, { useEffect, useState } from "react";

interface FuelEntry {
  id: string;
  date: string;
  fleetNumber: string;
  driver: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  station: string;
  odometer: number;
  notes?: string;
}

const FuelLogs: React.FC = () => {
  // State for fuel logs
  const [fuelLogs, setFuelLogs] = useState<FuelEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<FuelEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [fleetFilter, setFleetFilter] = useState("all");

  // Handle export button click
  const handleExport = () => {
    console.log("Exporting fuel logs...");
    // Export logic would go here
  };

  // Mock data for demo purposes
  useEffect(() => {
    // In a real implementation, this would fetch from Firestore
    const mockLogs: FuelEntry[] = [
      {
        id: "1",
        date: "2025-07-08",
        fleetNumber: "MT-1001",
        driver: "John Smith",
        liters: 120,
        costPerLiter: 1.45,
        totalCost: 174,
        station: "Shell Highway Station",
        odometer: 56789,
      },
      {
        id: "2",
        date: "2025-07-07",
        fleetNumber: "MT-1002",
        driver: "Jane Doe",
        liters: 95,
        costPerLiter: 1.42,
        totalCost: 134.9,
        station: "Total Energies",
        odometer: 34521,
      },
      {
        id: "3",
        date: "2025-07-06",
        fleetNumber: "MT-1001",
        driver: "John Smith",
        liters: 105,
        costPerLiter: 1.44,
        totalCost: 151.2,
        station: "BP Express",
        odometer: 56234,
      },
    ];

    setFuelLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, []);

  // Filter logs when search term or filters change
  useEffect(() => {
    let filtered = [...fuelLogs];

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.fleetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.station.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      filtered = filtered.filter((log) => {
        const logDate = new Date(log.date);

        if (dateFilter === "today") {
          return logDate.toDateString() === today.toDateString();
        } else if (dateFilter === "yesterday") {
          return logDate.toDateString() === yesterday.toDateString();
        } else if (dateFilter === "week") {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return logDate >= weekAgo;
        } else if (dateFilter === "month") {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return logDate >= monthAgo;
        }

        return true;
      });
    }

    // Apply fleet filter
    if (fleetFilter !== "all") {
      filtered = filtered.filter((log) => log.fleetNumber === fleetFilter);
    }

    setFilteredLogs(filtered);
  }, [searchTerm, dateFilter, fleetFilter, fuelLogs]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Get unique fleet numbers for filter
  const fleetNumbers = Array.from(new Set(fuelLogs.map((log) => log.fleetNumber)));

  // View handler (placeholder; integrate with modal or navigation later)
  const handleViewLog = (log: FuelEntry) => {
    console.log("Viewing fuel log", log);
  };

  return (
    <div className="space-y-6">
      {/* Header / Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Fuel Logs</h2>
        <div className="flex space-x-2">
          <Button variant="outline" icon={<Download className="w-4 h-4" />} onClick={handleExport}>
            Export
          </Button>
          <SyncIndicator />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by fleet number, driver, or station..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Filter className="w-5 h-5 text-gray-400" />
          </div>
          <select
            value={fleetFilter}
            onChange={(e) => setFleetFilter(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Fleet</option>
            {fleetNumbers.map((fleet) => (
              <option key={fleet} value={fleet}>
                {fleet}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fuel Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fleet #
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Driver
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Liters
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price/L
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total Cost
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Station
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Odometer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                      No fuel logs found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(log.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.fleetNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.driver}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.liters}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.costPerLiter.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.totalCost.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.station}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.odometer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => handleViewLog(log)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FuelLogs;
