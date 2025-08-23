import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { BarChart3, Calendar, Download, TrendingDown, TrendingUp, Truck } from "lucide-react";
import React, { useState } from "react";
import { DieselConsumptionRecord } from "../../types";
import { formatCurrency } from "../../utils/helpers";

interface DieselAnalysisProps {
  dieselRecords?: DieselConsumptionRecord[];
}

const DieselAnalysis: React.FC<DieselAnalysisProps> = ({ dieselRecords = [] }) => {
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  // Defensive: Accept possibly undefined fields everywhere
  const calculateStats = (records: DieselConsumptionRecord[]) => {
    const filtered = records.filter((record) => {
      if (dateRange.start && (!record.date || record.date < dateRange.start)) return false;
      if (dateRange.end && (!record.date || record.date > dateRange.end)) return false;
      return true;
    });

    if (filtered.length === 0) {
      return {
        totalLitres: 0,
        avgLitresPerDay: 0,
        totalCostZAR: 0,
        avgKmPerLitre: 0,
        fleetConsumption: {} as Record<string, { litres: number; cost: number }>,
        monthlyConsumption: {} as Record<string, { litres: number; cost: number }>,
        avgCostPerLitre: 0,
        percentReeferUsage: 0,
        avgLitresPerHour: 0,
        recordsCount: 0,
      };
    }

    const totalLitres = filtered.reduce((sum, r) => sum + (r.litresFilled ?? 0), 0);

    // Group by date to calculate avg per day
    const uniqueDates = new Set(filtered.map((r) => r.date ?? ""));
    const avgLitresPerDay = totalLitres / Math.max(uniqueDates.size, 1);

    const totalCostZAR = filtered
      .filter((r) => r.currency !== "USD")
      .reduce((sum, r) => sum + (r.totalCost ?? 0), 0);

    // Calculate average km per litre for non-reefer units
    const nonReeferRecords = filtered.filter((r) => !r.isReeferUnit);
    const validKmRecords = nonReeferRecords.filter((r) => (r.kmPerLitre ?? 0) > 0);
    const avgKmPerLitre =
      validKmRecords.length > 0
        ? validKmRecords.reduce((sum, r) => sum + (r.kmPerLitre ?? 0), 0) / validKmRecords.length
        : 0;

    // Group by fleet for fleet consumption analysis
    const fleetConsumption: Record<string, { litres: number; cost: number }> = {};
    filtered.forEach((r) => {
      const fleetNum = r.fleetNumber ?? "";
      if (!fleetNum) return; // Skip if empty

      if (!fleetConsumption[fleetNum]) {
        fleetConsumption[fleetNum] = { litres: 0, cost: 0 };
      }

      fleetConsumption[fleetNum].litres += r.litresFilled ?? 0;
      fleetConsumption[fleetNum].cost += r.totalCost ?? 0;
    });

    // Group by month for trend analysis
    const monthlyConsumption: Record<string, { litres: number; cost: number }> = {};
    filtered.forEach((r) => {
      const yearMonth = r.date?.substring(0, 7) ?? "";
      if (!yearMonth) return;
      if (!monthlyConsumption[yearMonth]) {
        monthlyConsumption[yearMonth] = { litres: 0, cost: 0 };
      }
      monthlyConsumption[yearMonth].litres += r.litresFilled ?? 0;
      monthlyConsumption[yearMonth].cost += r.totalCost ?? 0;
    });

    // Calculate average cost per litre
    const avgCostPerLitre =
      totalLitres > 0
        ? filtered.reduce((sum, r) => sum + (r.totalCost ?? 0), 0) / totalLitres
        : 0;

    // Calculate percentage of reefer usage
    const reeferLitres = filtered
      .filter((r) => r.isReeferUnit)
      .reduce((sum, r) => sum + (r.litresFilled ?? 0), 0);
    const percentReeferUsage = totalLitres > 0 ? (reeferLitres / totalLitres) * 100 : 0;

    // Calculate average litres per hour for reefer units
    const reeferRecords = filtered.filter((r) => r.isReeferUnit && (r.litresPerHour ?? 0) > 0);
    const avgLitresPerHour =
      reeferRecords.length > 0
        ? reeferRecords.reduce((sum, r) => sum + (r.litresPerHour ?? 0), 0) / reeferRecords.length
        : 0;

    return {
      totalLitres,
      avgLitresPerDay,
      totalCostZAR,
      avgKmPerLitre,
      fleetConsumption,
      monthlyConsumption,
      avgCostPerLitre,
      percentReeferUsage,
      avgLitresPerHour,
      recordsCount: filtered.length,
    };
  };

  const stats = calculateStats(dieselRecords);

  // Top 5 fleets by consumption
  const sortedFleetConsumption = Object.entries(stats.fleetConsumption ?? {})
    .sort(([, a], [, b]) => b.litres - a.litres)
    .slice(0, 5);

  // Last 6 months
  const sortedMonthlyConsumption = Object.entries(stats.monthlyConsumption ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6);

  // Defensive: Accept undefined and handle safely
  const formatMonthName = (yearMonth?: string): string => {
    if (!yearMonth) return "";
    const [year, month] = yearMonth.split("-");
    if (!year || !month) return "";
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "short" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Diesel Consumption Analysis</h2>
        <Button
          variant="outline"
          icon={<Download className="w-4 h-4" />}
          onClick={() => {
            // In a real implementation, this would export data to CSV/Excel
            alert("Export functionality would be implemented here");
          }}
        >
          Export Analysis
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader title="Filter Data" />
        <CardContent>
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2"
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <Button onClick={() => setDateRange({ start: "", end: "" })}>Clear Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Consumption</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalLitres.toLocaleString()} L
                </p>
                <p className="text-xs text-gray-400">
                  {stats.avgLitresPerDay.toFixed(1)} L per day avg
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Cost</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.totalCostZAR, "ZAR")}
                </p>
                <p className="text-xs text-gray-400">
                  {formatCurrency(stats.avgCostPerLitre, "ZAR")}/L avg
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Efficiency (Non-Reefer)</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.avgKmPerLitre.toFixed(2)} km/L
                </p>
                <p className="text-xs text-gray-400">Fleet average</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Reefer Consumption</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.avgLitresPerHour.toFixed(2)} L/hr
                </p>
                <p className="text-xs text-gray-400">
                  {stats.percentReeferUsage.toFixed(1)}% of total diesel
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Consumption Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Top Fleet Consumers" />
          <CardContent>
            {sortedFleetConsumption.length > 0 ? (
              <div className="space-y-4">
                {sortedFleetConsumption.map(([fleet, data]) => (
                  <div key={fleet} className="relative">
                    <div className="flex items-center mb-1">
                      <span className="w-24 text-sm font-medium">{fleet}</span>
                      <div className="flex-grow h-4 bg-gray-100 rounded-full overflow-hidden ml-2">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(data.litres / stats.totalLitres) * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium">
                        {data.litres.toLocaleString()} L
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 ml-24">
                      {formatCurrency(data.cost, "ZAR")} •
                      {((data.litres / stats.totalLitres) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Truck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No fleet data available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Apply different filters or add more diesel records.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Monthly Consumption Trend" />
          <CardContent>
            {sortedMonthlyConsumption.length > 0 ? (
              <div className="space-y-4">
                {sortedMonthlyConsumption.map(([month, data]) => (
                  <div key={month ?? "unknown"} className="relative">
                    <div className="flex items-center mb-1">
                      <span className="w-24 text-sm font-medium">{formatMonthName(month)}</span>
                      <div className="flex-grow h-4 bg-green-500 rounded-full overflow-hidden ml-2">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${(data.litres / (stats.totalLitres * 0.5)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium">
                        {data.litres.toLocaleString()} L
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 ml-24">
                      {formatCurrency(data.cost, "ZAR")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No trend data available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Need data spanning multiple months for trend analysis.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Efficiency Analysis */}
      <Card>
        <CardHeader title="Efficiency Analysis" />
        <CardContent>
          {stats.recordsCount > 0 ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Non-Reefer Efficiency</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Average KM/L:</span>
                      <span className="text-sm font-bold text-blue-800">
                        {stats.avgKmPerLitre.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Expected Range:</span>
                      <span className="text-sm font-bold text-blue-800">2.8 - 3.5 KM/L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Performance:</span>
                      <span
                        className={`text-sm font-bold ${stats.avgKmPerLitre >= 3.0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {stats.avgKmPerLitre >= 3.5
                          ? "Excellent"
                          : stats.avgKmPerLitre >= 3.0
                            ? "Good"
                            : stats.avgKmPerLitre >= 2.8
                              ? "Average"
                              : "Poor"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-800 mb-2">Reefer Efficiency</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-700">Average L/hr:</span>
                      <span className="text-sm font-bold text-purple-800">
                        {stats.avgLitresPerHour.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-700">Expected Range:</span>
                      <span className="text-sm font-bold text-purple-800">3.0 - 4.0 L/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-700">Performance:</span>
                      <span
                        className={`text-sm font-bold ${stats.avgLitresPerHour <= 3.5 ? "text-green-600" : "text-red-600"}`}
                      >
                        {stats.avgLitresPerHour <= 3.0
                          ? "Excellent"
                          : stats.avgLitresPerHour <= 3.5
                            ? "Good"
                            : stats.avgLitresPerHour <= 4.0
                              ? "Average"
                              : "Poor"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-green-800 mb-2">Cost Efficiency</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Average Cost/Litre:</span>
                      <span className="text-sm font-bold text-green-800">
                        {formatCurrency(stats.avgCostPerLitre, "ZAR")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Cost Per KM:</span>
                      <span className="text-sm font-bold text-green-800">
                        {stats.avgKmPerLitre > 0
                          ? formatCurrency(stats.avgCostPerLitre / stats.avgKmPerLitre, "ZAR")
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Reefer Usage:</span>
                      <span className="text-sm font-bold text-green-800">
                        {stats.percentReeferUsage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-medium text-gray-800 mb-2">
                  Optimization Recommendations
                </h3>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {stats.avgKmPerLitre < 2.8 && (
                    <li>
                      Non-reefer efficiency is below target. Consider vehicle maintenance checks and
                      driver training.
                    </li>
                  )}
                  {stats.avgLitresPerHour > 4.0 && (
                    <li>
                      Reefer units are consuming more fuel than expected. Check for maintenance
                      issues or improper temperature settings.
                    </li>
                  )}
                  {stats.avgCostPerLitre > 25 && (
                    <li>
                      Fuel costs are above market average. Review procurement strategy and fuel
                      supplier contracts.
                    </li>
                  )}
                  <li>
                    Implement a driver incentive program for fuel-efficient driving practices.
                  </li>
                  <li>
                    Consider route optimization to reduce unnecessary mileage and fuel consumption.
                  </li>
                  <li>
                    Ensure all vehicles receive regular maintenance with special attention to fuel
                    systems.
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No analysis data available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Apply different filters or add more diesel records.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DieselAnalysis;
