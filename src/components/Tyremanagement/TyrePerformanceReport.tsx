import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CircleDot,
  Download,
  Info,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TyrePerformanceData {
  brandComparison: {
    brand: string;
    averageMileage: number;
    averageCostPerKm: number;
    count: number;
  }[];
  mileageBySize: {
    size: string;
    averageMileage: number;
    count: number;
  }[];
  wearPatterns: {
    pattern: string;
    count: number;
    percentage: number;
  }[];
  costAnalysis: {
    month: string;
    replacementCost: number;
    maintenanceCost: number;
    total: number;
  }[];
  vehicleComparison: {
    vehicleReg: string;
    tyreLifespan: number;
    replacementFrequency: number;
  }[];
  positionAnalysis: {
    position: string;
    averageLifespan: number;
    wearRate: number;
    failureRate: number;
  }[];
  failureReasons: {
    reason: string;
    count: number;
    percentage: number;
  }[];
  seasonalPerformance: {
    season: string;
    wearRate: number;
    failureRate: number;
    costPerKm: number;
  }[];
}

// Color palette for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#8dd1e1",
  "#a4de6c",
  "#d0ed57",
];

const TyrePerformanceReport: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<TyrePerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<"6months" | "1year" | "2years" | "3years">("1year");
  const [brandFilter] = useState<string>("all"); // reserved for future dynamic filtering
  const [vehicleFilter] = useState<string>("all"); // reserved for future dynamic filtering

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);

        // Mock data for demonstration
        // In a real app, you'd fetch this data from Firestore
        const mockData: TyrePerformanceData = {
          brandComparison: [
            { brand: "Michelin", averageMileage: 120000, averageCostPerKm: 0.025, count: 48 },
            { brand: "Goodyear", averageMileage: 110000, averageCostPerKm: 0.022, count: 36 },
            { brand: "Bridgestone", averageMileage: 115000, averageCostPerKm: 0.024, count: 42 },
            { brand: "Continental", averageMileage: 105000, averageCostPerKm: 0.021, count: 30 },
            { brand: "Pirelli", averageMileage: 100000, averageCostPerKm: 0.026, count: 24 },
          ],
          mileageBySize: [
            { size: "295/80R22.5", averageMileage: 115000, count: 62 },
            { size: "315/70R22.5", averageMileage: 110000, count: 48 },
            { size: "385/65R22.5", averageMileage: 105000, count: 36 },
            { size: "315/80R22.5", averageMileage: 120000, count: 54 },
            { size: "275/70R22.5", averageMileage: 100000, count: 28 },
          ],
          wearPatterns: [
            { pattern: "Even Wear", count: 124, percentage: 48 },
            { pattern: "Center Wear", count: 56, percentage: 22 },
            { pattern: "Edge Wear", count: 42, percentage: 16 },
            { pattern: "One-sided", count: 24, percentage: 9 },
            { pattern: "Feathering", count: 12, percentage: 5 },
          ],
          costAnalysis: [
            { month: "Jan", replacementCost: 8400, maintenanceCost: 1200, total: 9600 },
            { month: "Feb", replacementCost: 6200, maintenanceCost: 980, total: 7180 },
            { month: "Mar", replacementCost: 7800, maintenanceCost: 1050, total: 8850 },
            { month: "Apr", replacementCost: 5400, maintenanceCost: 920, total: 6320 },
            { month: "May", replacementCost: 9200, maintenanceCost: 1350, total: 10550 },
            { month: "Jun", replacementCost: 8100, maintenanceCost: 1100, total: 9200 },
            { month: "Jul", replacementCost: 7600, maintenanceCost: 1250, total: 8850 },
            { month: "Aug", replacementCost: 6800, maintenanceCost: 980, total: 7780 },
            { month: "Sep", replacementCost: 9500, maintenanceCost: 1400, total: 10900 },
            { month: "Oct", replacementCost: 7200, maintenanceCost: 1050, total: 8250 },
            { month: "Nov", replacementCost: 6400, maintenanceCost: 900, total: 7300 },
            { month: "Dec", replacementCost: 8800, maintenanceCost: 1300, total: 10100 },
          ],
          vehicleComparison: [
            { vehicleReg: "TRK-001", tyreLifespan: 110000, replacementFrequency: 4.2 },
            { vehicleReg: "TRK-002", tyreLifespan: 98000, replacementFrequency: 4.8 },
            { vehicleReg: "TRK-003", tyreLifespan: 115000, replacementFrequency: 4.0 },
            { vehicleReg: "TRK-004", tyreLifespan: 105000, replacementFrequency: 4.5 },
            { vehicleReg: "TRK-005", tyreLifespan: 118000, replacementFrequency: 3.8 },
            { vehicleReg: "TRK-006", tyreLifespan: 102000, replacementFrequency: 4.6 },
            { vehicleReg: "TRK-007", tyreLifespan: 97000, replacementFrequency: 4.9 },
            { vehicleReg: "TRK-008", tyreLifespan: 112000, replacementFrequency: 4.1 },
          ],
          positionAnalysis: [
            { position: "Front Left", averageLifespan: 105000, wearRate: 0.85, failureRate: 0.12 },
            { position: "Front Right", averageLifespan: 106000, wearRate: 0.84, failureRate: 0.11 },
            {
              position: "Rear Left Outer",
              averageLifespan: 112000,
              wearRate: 0.78,
              failureRate: 0.08,
            },
            {
              position: "Rear Left Inner",
              averageLifespan: 116000,
              wearRate: 0.75,
              failureRate: 0.06,
            },
            {
              position: "Rear Right Inner",
              averageLifespan: 115000,
              wearRate: 0.76,
              failureRate: 0.07,
            },
            {
              position: "Rear Right Outer",
              averageLifespan: 110000,
              wearRate: 0.8,
              failureRate: 0.09,
            },
          ],
          failureReasons: [
            { reason: "Puncture", count: 42, percentage: 34 },
            { reason: "Sidewall Damage", count: 24, percentage: 19 },
            { reason: "Tread Separation", count: 18, percentage: 14 },
            { reason: "Blowout", count: 15, percentage: 12 },
            { reason: "Bead Failure", count: 12, percentage: 10 },
            { reason: "Other", count: 14, percentage: 11 },
          ],
          seasonalPerformance: [
            { season: "Winter", wearRate: 0.92, failureRate: 0.14, costPerKm: 0.028 },
            { season: "Spring", wearRate: 0.78, failureRate: 0.09, costPerKm: 0.023 },
            { season: "Summer", wearRate: 0.82, failureRate: 0.07, costPerKm: 0.022 },
            { season: "Autumn", wearRate: 0.86, failureRate: 0.11, costPerKm: 0.025 },
          ],
        };

        setPerformanceData(mockData);
        setError(null);
      } catch (err) {
        console.error("Error fetching tyre performance data:", err);
        setError("Failed to load tyre performance data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [timeFrame, brandFilter, vehicleFilter]);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const handleExportReport = () => {
    alert(
      "Report export functionality would go here - would generate PDF report with all charts and analysis."
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!performanceData) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <BarChart3 className="mr-2 text-primary-600" size={28} />
          Tyre Performance Report
        </h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="text-gray-500" size={20} />
            <select
              value={timeFrame}
              onChange={(e) =>
                setTimeFrame(e.target.value as "6months" | "1year" | "2years" | "3years")
              }
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
              <option value="2years">Last 2 Years</option>
              <option value="3years">Last 3 Years</option>
            </select>
          </div>

          <button
            onClick={handleExportReport}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Download size={18} className="mr-1" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 font-medium mb-1">Average Tyre Lifespan</div>
          <div className="text-3xl font-bold">
            {Math.round(
              performanceData.brandComparison.reduce(
                (sum, brand) => sum + brand.averageMileage,
                0
              ) / performanceData.brandComparison.length
            ).toLocaleString()}
            <span className="text-lg ml-1">km</span>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <TrendingUp size={16} className="mr-1" />
            <span>5.2% increase from last period</span>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-green-500">
          <div className="text-sm text-gray-600 font-medium mb-1">Average Cost per KM</div>
          <div className="text-3xl font-bold">
            $
            {(
              performanceData.brandComparison.reduce(
                (sum, brand) => sum + brand.averageCostPerKm,
                0
              ) / performanceData.brandComparison.length
            ).toFixed(3)}
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <TrendingUp size={16} className="mr-1" />
            <span>3.8% decrease from last period</span>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-amber-500">
          <div className="text-sm text-gray-600 font-medium mb-1">Annual Tyre Cost</div>
          <div className="text-3xl font-bold">
            $
            {performanceData.costAnalysis
              .reduce((sum, month) => sum + month.total, 0)
              .toLocaleString()}
          </div>
          <div className="mt-2 flex items-center text-sm text-amber-600">
            <RefreshCw size={16} className="mr-1" />
            <span>2.1% increase from last period</span>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-purple-500">
          <div className="text-sm text-gray-600 font-medium mb-1">Failure Rate</div>
          <div className="text-3xl font-bold">
            {(
              (performanceData.failureReasons.reduce((sum, reason) => sum + reason.count, 0) /
                performanceData.brandComparison.reduce((sum, brand) => sum + brand.count, 0)) *
              100
            ).toFixed(1)}
            %
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <TrendingUp size={16} className="mr-1" />
            <span>1.7% decrease from last period</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Brand Comparison */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Brand Performance Comparison</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData.brandComparison}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="brand" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "averageMileage")
                      return [`${value.toLocaleString()} km`, "Average Mileage"];
                    if (name === "averageCostPerKm") return [`$${value}`, "Cost per KM"];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="averageMileage"
                  name="Average Mileage (km)"
                  fill="#8884d8"
                />
                <Bar
                  yAxisId="right"
                  dataKey="averageCostPerKm"
                  name="Cost per KM ($)"
                  fill="#82ca9d"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <p>
              Analysis: Michelin tyres show the highest average lifespan, while Continental provides
              the lowest cost per kilometer.
            </p>
          </div>
        </div>

        {/* Wear Patterns */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Tyre Wear Pattern Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData.wearPatterns}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="pattern"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {performanceData.wearPatterns.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} tyres`, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <p>
              Analysis: 48% of tyres show even wear patterns, indicating good alignment and pressure
              maintenance. Center wear (22%) suggests over-inflation issues.
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Cost Analysis */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Tyre Cost Analysis</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData.costAnalysis}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => [formatCurrency(value as number), ""]} />
                <Legend />
                <Bar dataKey="replacementCost" name="Replacement Cost" stackId="a" fill="#8884d8" />
                <Bar dataKey="maintenanceCost" name="Maintenance Cost" stackId="a" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <p>
              Analysis: September shows the highest total tyre costs at $10,900, while April had the
              lowest at $6,320. Seasonal peaks appear in May and September.
            </p>
          </div>
        </div>

        {/* Position Analysis */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Tyre Position Performance</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData.positionAnalysis}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="position" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="averageLifespan"
                  name="Avg. Lifespan (km)"
                  fill="#8884d8"
                />
                <Bar yAxisId="right" dataKey="wearRate" name="Wear Rate" fill="#82ca9d" />
                <Bar yAxisId="right" dataKey="failureRate" name="Failure Rate" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <p>
              Analysis: Front position tyres have shorter lifespans and higher wear rates compared
              to rear inner positions. Consider rotation strategies to optimize overall tyre life.
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Comparison */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Vehicle Tyre Performance</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="replacementFrequency" name="Replacements per Year" />
                <YAxis type="number" dataKey="tyreLifespan" name="Tyre Lifespan (km)" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(value, name, props) => {
                    const vehicle = performanceData.vehicleComparison.find(
                      (v) =>
                        v.replacementFrequency === props.payload.replacementFrequency &&
                        v.tyreLifespan === props.payload.tyreLifespan
                    );
                    return [
                      value,
                      name === "tyreLifespan" ? "Lifespan (km)" : "Replacements/Year",
                      vehicle?.vehicleReg,
                    ];
                  }}
                />
                <Legend />
                <Scatter name="Vehicles" data={performanceData.vehicleComparison} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <p>
              Analysis: TRK-005 shows the best tyre performance with highest lifespan and lowest
              replacement frequency, while TRK-007 shows the poorest performance.
            </p>
          </div>
        </div>

        {/* Failure Reasons */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Tyre Failure Analysis</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData.failureReasons}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="reason"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {performanceData.failureReasons.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} occurrences`, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <p>
              Analysis: Punctures account for 34% of tyre failures, suggesting a need for better
              road hazard avoidance training and possibly more puncture-resistant tyres.
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Key Insights & Recommendations</h2>

        <div className="space-y-4">
          <div className="flex items-start">
            <CircleDot className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" size={18} />
            <div>
              <p className="font-medium">Brand Selection</p>
              <p className="text-gray-600">
                Michelin tyres demonstrate the best overall value with highest lifespan despite
                slightly higher cost per km. Consider standardizing on Michelin for key routes and
                Continental for secondary routes.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <CircleDot className="text-green-500 mt-0.5 mr-3 flex-shrink-0" size={18} />
            <div>
              <p className="font-medium">Maintenance Improvements</p>
              <p className="text-gray-600">
                The high rate of center wear (22%) indicates systemic over-inflation issues.
                Implement weekly pressure checks and adjust inflation standards based on seasonal
                temperature variations.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <CircleDot className="text-amber-500 mt-0.5 mr-3 flex-shrink-0" size={18} />
            <div>
              <p className="font-medium">Vehicle-Specific Action</p>
              <p className="text-gray-600">
                Vehicles TRK-002 and TRK-007 show significantly higher tyre wear rates. Schedule
                alignment checks and driver behavior analysis for these vehicles to identify root
                causes.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <CircleDot className="text-purple-500 mt-0.5 mr-3 flex-shrink-0" size={18} />
            <div>
              <p className="font-medium">Rotation Strategy</p>
              <p className="text-gray-600">
                Implement a more aggressive rotation schedule to balance the 10% lifespan difference
                between front and rear positions. Consider moving from 25,000 km rotation intervals
                to 15,000 km intervals.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <CircleDot className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={18} />
            <div>
              <p className="font-medium">Seasonal Planning</p>
              <p className="text-gray-600">
                Winter shows 15% higher wear rates and 100% higher failure rates. Schedule major
                tyre replacements before winter and consider specialized winter compounds for
                critical routes.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center text-amber-600">
            <AlertTriangle size={20} className="mr-2" />
            <span className="font-medium">Key Action Required</span>
          </div>
          <button
            onClick={handleExportReport}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Download size={18} className="mr-1" />
            Export Full Report
          </button>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              This report analyses{" "}
              {performanceData.brandComparison.reduce((sum, brand) => sum + brand.count, 0)} tyres
              across {performanceData.vehicleComparison.length} vehicles over the selected time
              period. For more detailed analysis, export the full report or adjust the time frame.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TyrePerformanceReport;
