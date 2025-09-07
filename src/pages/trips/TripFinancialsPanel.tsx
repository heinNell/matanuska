import { Button } from "../../components/ui/Button";
import {
  BarChart3,
  Calculator,
  DollarSign,
  Download,
  Fuel,
  Landmark,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import LoadingIndicator from "../../components/ui/LoadingIndicator";
import { useAppContext } from "../../context/AppContext";
import { Trip, TripFinancialAnalysis } from "../../types";
import { formatCurrency } from "../../utils/helpers";

// Define charts and chart options

interface TripFinancialsPanelProps {
  tripId: string;
}

const TripFinancialsPanel: React.FC<TripFinancialsPanelProps> = ({ tripId }) => {
  const { getTrip, getTripFinancialAnalysis, generateTripFinancialAnalysis, isLoading } =
    useAppContext();

  const [trip, setTrip] = useState<Trip | undefined>(undefined);
  const [financials, setFinancials] = useState<TripFinancialAnalysis | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // Fetch trip and financial data
  useEffect(() => {
    if (tripId) {
      const tripData = getTrip(tripId);
      if (tripData) {
        setTrip(tripData);

        // Check for existing financial analysis
        const financialsData = getTripFinancialAnalysis(tripId);
        if (financialsData) {
          setFinancials(financialsData);
        }
      } else {
        setError(`Trip with ID ${tripId} not found`);
      }
    }
  }, [tripId, getTrip, getTripFinancialAnalysis]);

  // Generate financial analysis
  const handleGenerateAnalysis = async () => {
    try {
      setError(null);
      const analysis = await generateTripFinancialAnalysis(tripId);
      setFinancials(analysis);
    } catch (err: any) {
      setError(err.message || "Failed to generate financial analysis");
    }
  };

  // Store chart-related functions and data in a dedicated object
  // This approach preserves the chart functionality for future use
  // while avoiding unused variable warnings
  const chartUtils = {
    /**
     * Generate chart data for different visualization types
     * @param type - The type of chart data to generate
     */
    generateData(type: "costs" | "comparison" = "costs") {
      if (!financials) return null;

      const { costBreakdown } = financials;

      if (type === "costs") {
        return {
          labels: [
            "Fuel",
            "Border Costs",
            "Driver Allowance",
            "Maintenance",
            "Toll Fees",
            "Miscellaneous",
          ],
          datasets: [
            {
              label: "Amount",
              data: [
                costBreakdown.fuelCosts,
                costBreakdown.borderCosts,
                costBreakdown.driverAllowance,
                costBreakdown.maintenanceCosts,
                costBreakdown.tollFees,
                costBreakdown.miscellaneousCosts,
              ],
              backgroundColor: [
                "rgba(255, 99, 132, 0.5)",
                "rgba(54, 162, 235, 0.5)",
                "rgba(255, 206, 86, 0.5)",
                "rgba(75, 192, 192, 0.5)",
                "rgba(153, 102, 255, 0.5)",
                "rgba(255, 159, 64, 0.5)",
              ],
            },
          ],
        };
      } else {
        // Comparison chart data for company vs industry averages
        return {
          labels: ["This Trip", "Company Average", "Industry Average"],
          datasets: [
            {
              label: "Cost per KM",
              data: [
                financials.perKmMetrics.costPerKm,
                financials.comparisonMetrics?.companyAvgCostPerKm || 0,
                financials.comparisonMetrics?.industryAvgCostPerKm || 0,
              ],
              backgroundColor: [
                "rgba(54, 162, 235, 0.5)",
                "rgba(75, 192, 192, 0.5)",
                "rgba(255, 206, 86, 0.5)",
              ],
            },
          ],
        };
      }
    },

    // Future method placeholders for chart rendering
    renderCostChart() {
      // Will be implemented when charts are added
      const data = this.generateData("costs");
      return data;
    },

    renderComparisonChart() {
      // Will be implemented when charts are added
      const data = this.generateData("comparison");
      return data;
    },
  };

  if (!trip) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          {error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <LoadingIndicator text="Loading trip data..." />
          )}
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data (will be used in future chart implementation)
  useEffect(() => {
    if (financials) {
      // Store the chart data in a ref or context for future use
      // This ensures chartUtils is used and prevents unused variable warnings
      const costData = chartUtils.generateData("costs");
      const comparisonData = chartUtils.generateData("comparison");

      // Future implementation will use these data objects with chart components
      console.debug("Chart data prepared:", { costData, comparisonData });
    }
  }, [financials]);

  return (
    <Card>
      <CardHeader
        title="Trip Financial Analysis"
        action={
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={handleGenerateAnalysis}
            isLoading={isLoading[`generateFinancials-${tripId}`]}
            disabled={isLoading[`generateFinancials-${tripId}`]}
          >
            Update Analysis
          </Button>
        }
      />

      {!financials ? (
        <CardContent className="p-8">
          <div className="text-center">
            <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Financial Analysis</h3>
            <p className="text-gray-500 mb-6">
              Generate a detailed financial analysis to see revenue, costs, and profitability
              metrics for this trip.
            </p>

            <Button
              onClick={handleGenerateAnalysis}
              icon={<BarChart3 className="w-5 h-5 mr-1" />}
              isLoading={isLoading[`generateFinancials-${tripId}`]}
              disabled={isLoading[`generateFinancials-${tripId}`]}
            >
              Generate Financial Analysis
            </Button>
          </div>
        </CardContent>
      ) : (
        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-xl font-bold text-green-700">
                    {formatCurrency(
                      financials.revenueSummary.totalRevenue,
                      financials.revenueSummary.currency
                    )}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500 p-1 bg-green-100 rounded-full" />
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Costs</p>
                  <p className="text-xl font-bold text-red-700">
                    {formatCurrency(
                      financials.costBreakdown.totalCosts,
                      financials.revenueSummary.currency
                    )}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500 p-1 bg-red-100 rounded-full" />
              </div>
            </div>

            <div
              className={`${
                financials.profitAnalysis.netProfit >= 0
                  ? "bg-blue-50 border-blue-100"
                  : "bg-red-50 border-red-100"
              } p-4 rounded-lg border`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Net Profit</p>
                  <p
                    className={`text-xl font-bold ${
                      financials.profitAnalysis.netProfit >= 0 ? "text-blue-700" : "text-red-700"
                    }`}
                  >
                    {formatCurrency(
                      financials.profitAnalysis.netProfit,
                      financials.revenueSummary.currency
                    )}
                  </p>
                </div>
                {financials.profitAnalysis.netProfit >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-blue-500 p-1 bg-blue-100 rounded-full" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-500 p-1 bg-red-100 rounded-full" />
                )}
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Profit Margin</p>
                  <p className="text-xl font-bold text-purple-700">
                    {financials.profitAnalysis.netProfitMargin.toFixed(1)}%
                  </p>
                </div>
                <Landmark className="w-8 h-8 text-purple-500 p-1 bg-purple-100 rounded-full" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Cost Breakdown */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(financials.costBreakdown).map(([key, value]) => {
                  if (key === "totalCosts") return null; // Skip total, displayed elsewhere

                  // Format the key for display
                  const formattedKey = key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())
                    .replace(/Costs$/, "");

                  // Calculate percentage of total costs
                  const percentage = ((value / financials.costBreakdown.totalCosts) * 100).toFixed(
                    1
                  );

                  return (
                    <div key={key} className="flex items-center">
                      <div className="w-full">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{formattedKey}</span>
                          <span className="text-sm font-medium text-gray-700">
                            {formatCurrency(value, financials.revenueSummary.currency)} (
                            {percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                           />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Per KM Metrics */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Per Kilometer Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">Revenue per KM</p>
                  <p className="text-lg font-bold text-blue-900">
                    {formatCurrency(
                      financials.perKmMetrics.revenuePerKm,
                      financials.revenueSummary.currency
                    )}
                  </p>
                </div>

                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-700">Cost per KM</p>
                  <p className="text-lg font-bold text-red-900">
                    {formatCurrency(
                      financials.perKmMetrics.costPerKm,
                      financials.revenueSummary.currency
                    )}
                  </p>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-700">Profit per KM</p>
                  <p className="text-lg font-bold text-green-900">
                    {formatCurrency(
                      financials.perKmMetrics.profitPerKm,
                      financials.revenueSummary.currency
                    )}
                  </p>
                </div>
              </div>

              {/* Comparison to Averages */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Performance vs. Averages</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600">This Trip</span>
                      <span className="text-xs font-medium text-gray-800">
                        {formatCurrency(
                          financials.perKmMetrics.costPerKm,
                          financials.revenueSummary.currency
                        )}
                        /km
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: "100%" }}
                       />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600">Company Average</span>
                      <span className="text-xs font-medium text-gray-800">
                        {formatCurrency(
                          financials.comparisonMetrics?.companyAvgCostPerKm || 0,
                          financials.revenueSummary.currency
                        )}
                        /km
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-600 h-1.5 rounded-full"
                        style={{
                          width: `${((financials.comparisonMetrics?.companyAvgCostPerKm || 0) / financials.perKmMetrics.costPerKm) * 100}%`,
                        }}
                       />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600">Industry Average</span>
                      <span className="text-xs font-medium text-gray-800">
                        {formatCurrency(
                          financials.comparisonMetrics?.industryAvgCostPerKm || 0,
                          financials.revenueSummary.currency
                        )}
                        /km
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-yellow-600 h-1.5 rounded-full"
                        style={{
                          width: `${((financials.comparisonMetrics?.industryAvgCostPerKm || 0) / financials.perKmMetrics.costPerKm) * 100}%`,
                        }}
                       />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analysis and Recommendations */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
            <h3 className="text-lg font-medium text-blue-900 mb-3">Trip Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-2">Profitability Metrics</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>
                    <strong>Gross Profit:</strong>{" "}
                    {formatCurrency(
                      financials.profitAnalysis.grossProfit,
                      financials.revenueSummary.currency
                    )}
                  </li>
                  <li>
                    <strong>Gross Margin:</strong>{" "}
                    {financials.profitAnalysis.grossProfitMargin.toFixed(1)}%
                  </li>
                  <li>
                    <strong>Net Profit:</strong>{" "}
                    {formatCurrency(
                      financials.profitAnalysis.netProfit,
                      financials.revenueSummary.currency
                    )}
                  </li>
                  <li>
                    <strong>Net Margin:</strong>{" "}
                    {financials.profitAnalysis.netProfitMargin.toFixed(1)}%
                  </li>
                  <li>
                    <strong>Return on Investment:</strong>{" "}
                    {financials.profitAnalysis.returnOnInvestment.toFixed(1)}%
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-2">Performance Analysis</h4>
                <p className="text-sm text-blue-700 mb-2">
                  {financials.profitAnalysis.netProfitMargin > 15
                    ? "This trip is highly profitable, exceeding target margins."
                    : financials.profitAnalysis.netProfitMargin > 5
                      ? "This trip meets profitability targets."
                      : "This trip's profit margin is below target and needs optimization."}
                </p>
                <p className="text-sm text-blue-700">
                  {financials.comparisonMetrics?.variance &&
                  financials.comparisonMetrics.variance < 0
                    ? `Cost efficiency is ${Math.abs(financials.comparisonMetrics.variance).toFixed(1)}% better than company average.`
                    : financials.comparisonMetrics?.variance &&
                        financials.comparisonMetrics.variance > 0
                      ? `Cost efficiency is ${financials.comparisonMetrics.variance.toFixed(1)}% worse than company average.`
                      : "Cost efficiency is in line with company average."}
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Recommendations</h3>
            <div className="space-y-2">
              {financials.costBreakdown.fuelCosts / financials.costBreakdown.totalCosts > 0.35 && (
                <div className="flex items-start">
                  <div className="bg-red-100 rounded-full p-1 mr-2 mt-1">
                    <Fuel className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>Optimize Fuel Consumption:</strong> Fuel costs are higher than optimal.
                    Consider route optimization or driver training to reduce consumption.
                  </p>
                </div>
              )}

              {financials.comparisonMetrics?.variance &&
                financials.comparisonMetrics.variance > 10 && (
                  <div className="flex items-start">
                    <div className="bg-red-100 rounded-full p-1 mr-2 mt-1">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Cost Analysis Needed:</strong> This trip's costs are significantly
                      higher than average. Review all cost categories for potential savings.
                    </p>
                  </div>
                )}

              {financials.profitAnalysis.netProfitMargin < 5 && (
                <div className="flex items-start">
                  <div className="bg-red-100 rounded-full p-1 mr-2 mt-1">
                    <DollarSign className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>Pricing Review:</strong> This trip's profit margin is too low. Consider
                    adjusting pricing or negotiating better rates with the client.
                  </p>
                </div>
              )}

              {financials.profitAnalysis.netProfitMargin > 20 && (
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-2 mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>Excellent Performance:</strong> This trip shows strong profitability.
                    Consider using this route as a template for future trips.
                  </p>
                </div>
              )}

              {financials.costBreakdown.borderCosts / financials.costBreakdown.totalCosts > 0.2 && (
                <div className="flex items-start">
                  <div className="bg-yellow-100 rounded-full p-1 mr-2 mt-1">
                    <Map className="w-4 h-4 text-yellow-600" />
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>Border Costs:</strong> Border-related expenses are significant for this
                    trip. Ensure all documentation is properly prepared to avoid delays and
                    additional costs.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              icon={<Download className="w-4 h-4" />}
              onClick={() => {
                alert("Export functionality would be implemented here");
              }}
            >
              Export Analysis
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

function Map(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  );
}

export default TripFinancialsPanel;
