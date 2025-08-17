import { Button } from "../../components/ui/Button";
import Card, { CardContent, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/FormElements";
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Edit,
  Navigation,
  Save,
  Target,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import Modal from "../../components/ui/Modal";
import { Tooltip } from "../../components/ui/Tooltip";
import { useAppContext } from "../../context/AppContext";
import { Trip } from "../../types";

// ─── Utilities ───────────────────────────────────────────────────
import { calculateTotalCosts, formatCurrency } from "../../utils/helpers";

interface YTDMetrics {
  year: number;
  totalKms: number;
  ipk: number; // Income per KM
  operationalCpk: number; // Operational Cost per KM
  revenue: number;
  ebit: number;
  ebitMargin: number;
  netProfit: number;
  netProfitMargin: number;
  roe: number; // Return on Equity
  roic: number; // Return on Invested Capital
  lastUpdated: string;
  updatedBy: string;
}

interface WeeklyMetrics {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  totalKilometers: number;
  ipk: number;
  cpk: number;
  tripCount: number;
  profitMargin: number;
  currency: "ZAR" | "USD";
}

interface YearToDateKPIsProps {
  trips?: Trip[];
}

const YearToDateKPIs: React.FC<YearToDateKPIsProps> = (props) => {
  const { trips: contextTrips } = useAppContext();

  // Use props if provided, otherwise use context
  const trips = props.trips || contextTrips;

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingYear, setEditingYear] = useState<2024 | 2025 | null>(null);
  const [formData, setFormData] = useState<Partial<YTDMetrics>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Current YTD data - updated manually monthly
  const [ytdData, setYtdData] = useState<Record<number, YTDMetrics>>({
    2025: {
      year: 2025,
      totalKms: 358013,
      ipk: 2.03,
      operationalCpk: 1.8,
      revenue: 726150.0,
      ebit: 114342.0,
      ebitMargin: 15.7,
      netProfit: 79552.0,
      netProfitMargin: 11.0,
      roe: 19.0,
      roic: 32.0,
      lastUpdated: "2025-01-15T00:00:00Z",
      updatedBy: "Fleet Manager",
    },
    2024: {
      year: 2024,
      totalKms: 279360,
      ipk: 2.06,
      operationalCpk: 2.11,
      revenue: 611387.0,
      ebit: 46998.0,
      ebitMargin: 7.7,
      netProfit: 4780.0,
      netProfitMargin: 1.0,
      roe: 1.0,
      roic: 9.0,
      lastUpdated: "2024-12-31T00:00:00Z",
      updatedBy: "Operations Manager",
    },
  });

  // Load YTD data from localStorage on component mount
  useEffect(() => {
    const savedYtdData = localStorage.getItem("ytdData");
    if (savedYtdData) {
      try {
        const parsedData = JSON.parse(savedYtdData);
        if (parsedData.USD && parsedData.ZAR) {
          setYtdData(parsedData);
        }
      } catch (error) {
        console.error("Error parsing saved YTD data:", error);
      }
    }
  }, []);

  // Save YTD data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("ytdData", JSON.stringify(ytdData));
  }, [ytdData]);

  // Calculate weekly metrics from completed trips
  const weeklyMetrics = useMemo(() => {
    const completedTrips = trips.filter(
      (trip) => trip.status === "completed" || trip.status === "invoiced" || trip.status === "paid"
    );

    const weeklyData: Record<string, WeeklyMetrics> = {};

    completedTrips.forEach((trip) => {
      // Use offload dates or endDate as fallback
      const offloadDate = trip.finalOffloadDateTime || trip.actualOffloadDateTime || trip.endDate;
      if (!offloadDate) return;

      const date = new Date(offloadDate);

      // Monday of the week (ISO week starts Monday)
      const monday = new Date(date);
      monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));

      // Sunday of the week
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const weekKey = `${monday.getFullYear()}-W${getWeekNumber(monday)}-${trip.revenueCurrency}`;

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          weekNumber: getWeekNumber(monday),
          weekStart: monday.toISOString().split("T")[0],
          weekEnd: sunday.toISOString().split("T")[0],
          totalRevenue: 0,
          totalCosts: 0,
          grossProfit: 0,
          totalKilometers: 0,
          ipk: 0,
          cpk: 0,
          tripCount: 0,
          profitMargin: 0,
          currency: trip.revenueCurrency,
        };
      }

      const week = weeklyData[weekKey];
      const tripCosts = calculateTotalCosts(trip.costs);
      const additionalCosts =
        trip.additionalCosts?.reduce((sum, cost) => sum + cost.amount, 0) || 0;
      const totalTripCosts = tripCosts + additionalCosts;

      week.totalRevenue += trip.baseRevenue;
      week.totalCosts += totalTripCosts;
      week.grossProfit += trip.baseRevenue - totalTripCosts;
      week.totalKilometers += trip.distanceKm || 0;
      week.tripCount += 1;
    });

    // Calculate IPK, CPK, and Profit Margin
    Object.values(weeklyData).forEach((week) => {
      week.ipk = week.totalKilometers > 0 ? week.totalRevenue / week.totalKilometers : 0;
      week.cpk = week.totalKilometers > 0 ? week.totalCosts / week.totalKilometers : 0;
      week.profitMargin = week.totalRevenue > 0 ? (week.grossProfit / week.totalRevenue) * 100 : 0;
    });

    return Object.values(weeklyData).sort(
      (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
    );
  }, [trips]);

  // Helper: ISO Week Number calculation
  function getWeekNumber(date: Date): number {
    const target = new Date(date.valueOf());
    const dayNum = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNum + 3);
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    const diff = target.getTime() - firstThursday.getTime();
    return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
  }

  const current2025 = ytdData[2025];
  const previous2024 = ytdData[2024];

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, percentage: 0 };
    const change = current - previous;
    const percentage = (change / previous) * 100;
    return { value: change, percentage };
  };

  const kmsChange = calculateChange(current2025.totalKms, previous2024.totalKms);
  const ipkChange = calculateChange(current2025.ipk, previous2024.ipk);
  const cpkChange = calculateChange(current2025.operationalCpk, previous2024.operationalCpk);
  const revenueChange = calculateChange(current2025.revenue, previous2024.revenue);
  const ebitChange = calculateChange(current2025.ebit, previous2024.ebit);
  const netProfitChange = calculateChange(current2025.netProfit, previous2024.netProfit);
  const roeChange = calculateChange(current2025.roe, previous2024.roe);
  const roicChange = calculateChange(current2025.roic, previous2024.roic);

  const handleEdit = (year: 2024 | 2025) => {
    setEditingYear(year);
    setFormData({ ...ytdData[year] });
    setShowEditModal(true);
  };

  const handleChange = (field: string, value: string) => {
    const numValue = parseFloat(value);
    setFormData((prev) => ({ ...prev, [field]: numValue }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.totalKms || formData.totalKms <= 0) {
      newErrors.totalKms = "Total KMs must be greater than 0";
    }
    if (!formData.revenue || formData.revenue <= 0) {
      newErrors.revenue = "Revenue must be greater than 0";
    }
    if (!formData.ipk || formData.ipk <= 0) {
      newErrors.ipk = "IPK must be greater than 0";
    }
    if (!formData.operationalCpk || formData.operationalCpk <= 0) {
      newErrors.operationalCpk = "Operational CPK must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!editingYear || !validateForm()) return;

    const updatedData = {
      ...formData,
      year: editingYear,
      lastUpdated: new Date().toISOString(),
      updatedBy: "Current User",
    } as YTDMetrics;

    setYtdData((prev) => ({
      ...prev,
      [editingYear]: updatedData,
    }));

    // Save to localStorage for persistence
    localStorage.setItem(
      "ytdData",
      JSON.stringify({
        ...ytdData,
        [editingYear]: updatedData,
      })
    );

    setShowEditModal(false);
    setEditingYear(null);
    setFormData({});
    setErrors({});

    alert(
      `${editingYear} YTD metrics updated successfully!\n\nData will be used for monthly performance tracking and year-over-year comparisons.`
    );
  };

  const handleClose = () => {
    setShowEditModal(false);
    setEditingYear(null);
    setFormData({});
    setErrors({});
  };

  const exportWeeklyReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "WEEKLY REVENUE REPORTING - AUTOMATED CYCLE\n";
    csvContent += `Generated on,${new Date().toLocaleDateString()}\n\n`;

    csvContent +=
      "Week Number,Week Start,Week End,Trip Count,Total Revenue,Currency,Total Costs,Gross Profit,Profit Margin %,Total KM,IPK,CPK\n";
    weeklyMetrics.forEach((week) => {
      csvContent += `${week.weekNumber},"${week.weekStart}","${week.weekEnd}",${week.tripCount},${week.totalRevenue.toFixed(2)},${week.currency},${week.totalCosts.toFixed(2)},${week.grossProfit.toFixed(2)},${week.profitMargin.toFixed(2)},${week.totalKilometers},${week.ipk.toFixed(3)},${week.cpk.toFixed(3)}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `weekly-revenue-report-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const MetricCard = ({
    title,
    current,
    previous,
    change,
    format = "number",
    suffix = "",
    icon: Icon,
    colorClass = "text-blue-600",
  }: {
    title: string;
    current: number;
    previous: number;
    change: { value: number; percentage: number };
    format?: "number" | "currency" | "percentage";
    suffix?: string;
    icon: any;
    colorClass?: string;
  }) => {
    const formatValue = (value: number) => {
      switch (format) {
        case "currency":
          return formatCurrency(value, "USD");
        case "percentage":
          return `${value.toFixed(1)}%`;
        default:
          return value.toLocaleString();
      }
    };

    const isPositive = change.percentage > 0;
    const isNegative = change.percentage < 0;

    // For operational costs, negative change is good (cost reduction)
    const isGoodChange = title.includes("Operational") ? isNegative : isPositive;

    return (
      <Card className="flex flex-col justify-between">
        <CardHeader>
          <div className="flex flex-col">
            <span className="flex items-center gap-2">
              <Icon className={`w-5 h-5 ${colorClass}`} />
              {title}
            </span>
            <span className="text-xs text-gray-500">2025 YTD</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {formatValue(current)}
            {suffix}
          </div>
          <div className="text-sm text-gray-500">{formatValue(previous)} 2024 YTD</div>
          <div className="flex items-center gap-2 mt-2">
            {change.percentage !== 0 && (
              <>
                {isGoodChange ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span
                  className={`text-sm font-medium ${isGoodChange ? "text-green-600" : "text-red-600"}`}
                >
                  {change.percentage > 0 ? "+" : ""}
                  {change.percentage.toFixed(1)}%
                </span>
                <Tooltip text="Compared to previous year" />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  // Handler for toggling week expansion
  const toggleWeekExpansion = (weekKey: string) => {
    setExpandedWeek(expandedWeek === weekKey ? null : weekKey);
  };

  // Map trips to weeks for detailed view
  const weeklyTripsMap = useMemo(() => {
    const map: Record<string, Trip[]> = {};
    trips.forEach((trip) => {
      const offloadDate = trip.finalOffloadDateTime || trip.actualOffloadDateTime || trip.endDate;
      if (!offloadDate) return;
      const date = new Date(offloadDate);
      const monday = new Date(date);
      monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
      const weekKey = `${monday.getFullYear()}-W${getWeekNumber(monday)}-${trip.revenueCurrency}`;
      if (!map[weekKey]) map[weekKey] = [];
      map[weekKey].push(trip);
    });
    return map;
  }, [trips]);

  return (
    <div className="space-y-8">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-500" />
        <div>
          <div className="font-semibold text-blue-800">Monthly Update Schedule</div>
          <div className="text-blue-700 text-sm">
            YTD metrics are updated manually on the 15th of every month. Data is independent of
            trip-based calculations and maintained separately for strategic reporting.
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Kilometers"
          current={current2025.totalKms}
          previous={previous2024.totalKms}
          change={kmsChange}
          icon={Navigation}
          colorClass="text-purple-600"
        />

        <MetricCard
          title="Income Per KM (IPK)"
          current={current2025.ipk}
          previous={previous2024.ipk}
          change={ipkChange}
          format="currency"
          icon={DollarSign}
          colorClass="text-green-600"
        />

        <MetricCard
          title="Operational Cost Per KM"
          current={current2025.operationalCpk}
          previous={previous2024.operationalCpk}
          change={cpkChange}
          format="currency"
          icon={TrendingDown}
          colorClass="text-red-600"
        />

        <MetricCard
          title="Total Revenue"
          current={current2025.revenue}
          previous={previous2024.revenue}
          change={revenueChange}
          format="currency"
          icon={DollarSign}
          colorClass="text-green-600"
        />

        <MetricCard
          title="EBIT"
          current={current2025.ebit}
          previous={previous2024.ebit}
          change={ebitChange}
          format="currency"
          icon={TrendingUp}
          colorClass="text-blue-600"
        />

        <MetricCard
          title="Net Profit"
          current={current2025.netProfit}
          previous={previous2024.netProfit}
          change={netProfitChange}
          format="currency"
          icon={Award}
          colorClass="text-green-600"
        />

        {/* Edit buttons for both years */}
        <div className="flex justify-end col-span-full mb-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEdit(2025)}
          >
            Edit 2025 Metrics
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEdit(2024)}
          >
            Edit 2024 Metrics
          </Button>
        </div>
      </div>

      {/* Margin & Return Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="EBIT Margin"
          current={current2025.ebitMargin}
          previous={previous2024.ebitMargin}
          change={calculateChange(current2025.ebitMargin, previous2024.ebitMargin)}
          format="percentage"
          icon={BarChart3}
          colorClass="text-blue-600"
        />

        <MetricCard
          title="Net Profit Margin"
          current={current2025.netProfitMargin}
          previous={previous2024.netProfitMargin}
          change={calculateChange(current2025.netProfitMargin, previous2024.netProfitMargin)}
          format="percentage"
          icon={Target}
          colorClass="text-green-600"
        />

        <MetricCard
          title="Return on Equity (ROE)"
          current={current2025.roe}
          previous={previous2024.roe}
          change={roeChange}
          format="percentage"
          icon={TrendingUp}
          colorClass="text-purple-600"
        />

        <MetricCard
          title="Return on Invested Capital (ROIC)"
          current={current2025.roic}
          previous={previous2024.roic}
          change={roicChange}
          format="percentage"
          icon={Activity}
          colorClass="text-orange-600"
        />
      </div>

      {/* Weekly Revenue Reporting */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Automated Weekly Revenue Reporting</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={exportWeeklyReport}
              icon={<Download className="w-4 h-4" />}
            >
              Export Weekly Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <h4 className="text-sm font-medium text-green-800 mb-2">Automated Calculation Logic</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p>
                • <strong>Trigger:</strong> Offloading date marks trip completion and inclusion in
                weekly report
              </p>
              <p>
                • <strong>Revenue:</strong> Base revenue from completed trips
              </p>
              <p>
                • <strong>Costs:</strong> Fixed costs (per day) + Variable costs (per km) +
                Additional costs
              </p>
              <p>
                • <strong>IPK:</strong> Trip Revenue ÷ Total Kilometers
              </p>
              <p>
                • <strong>CPK:</strong> Total Trip Cost ÷ Total Kilometers
              </p>
              <p>
                • <strong>Cycle:</strong> Monday to Sunday, automatically rolls over at midnight
              </p>
            </div>
          </div>

          {weeklyMetrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Week</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Period</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500">Trips</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500">Revenue</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-500">Currency</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500">Costs</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500">
                      Gross Profit
                    </th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500">Margin %</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500">KM</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500">IPK</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500">CPK</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyMetrics.slice(0, 6).map((week) => {
                    const weekKey = `${week.weekStart.slice(0, 4)}-W${week.weekNumber}-${week.currency}`;
                    const isExpanded = expandedWeek === weekKey;
                    return (
                      <React.Fragment key={`${week.weekStart}-${week.weekNumber}-${week.currency}`}>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 text-sm font-medium text-gray-900 flex items-center gap-2">
                            <button
                              className="focus:outline-none"
                              aria-label={
                                isExpanded ? "Collapse week details" : "Expand week details"
                              }
                              onClick={() => toggleWeekExpansion(weekKey)}
                            >
                              {isExpanded ? (
                                <svg
                                  className="w-4 h-4 text-blue-500"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                                </svg>
                              ) : (
                                <svg
                                  className="w-4 h-4 text-blue-500"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              )}
                            </button>
                            Week {week.weekNumber}
                          </td>
                          <td className="py-3 text-sm text-gray-900">
                            {new Date(week.weekStart).toLocaleDateString()} -{" "}
                            {new Date(week.weekEnd).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-sm text-gray-900 text-right">
                            {week.tripCount}
                          </td>
                          <td className="py-3 text-sm font-medium text-green-600 text-right">
                            {formatCurrency(week.totalRevenue, week.currency)}
                          </td>
                          <td className="py-3 text-sm text-gray-900 text-center">
                            {week.currency}
                          </td>
                          <td className="py-3 text-sm font-medium text-red-600 text-right">
                            {formatCurrency(week.totalCosts, week.currency)}
                          </td>
                          <td
                            className={`py-3 text-sm font-medium text-right ${week.grossProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(week.grossProfit, week.currency)}
                          </td>
                          <td
                            className={`py-3 text-sm font-medium text-right ${week.profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {week.profitMargin.toFixed(1)}%
                          </td>
                          <td className="py-3 text-sm text-gray-900 text-right">
                            {week.totalKilometers.toLocaleString()}
                          </td>
                          <td className="py-3 text-sm text-gray-900 text-right">
                            {formatCurrency(week.ipk, week.currency)}
                          </td>
                          <td className="py-3 text-sm text-gray-900 text-right">
                            {formatCurrency(week.cpk, week.currency)}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-blue-50">
                            <td colSpan={11} className="p-4">
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b border-blue-200">
                                      <th className="text-left py-2 font-medium text-blue-700">
                                        Trip ID
                                      </th>
                                      <th className="text-left py-2 font-medium text-blue-700">
                                        Customer
                                      </th>
                                      <th className="text-left py-2 font-medium text-blue-700">
                                        Offload Date
                                      </th>
                                      <th className="text-right py-2 font-medium text-blue-700">
                                        Revenue
                                      </th>
                                      <th className="text-right py-2 font-medium text-blue-700">
                                        Costs
                                      </th>
                                      <th className="text-right py-2 font-medium text-blue-700">
                                        Profit
                                      </th>
                                      <th className="text-right py-2 font-medium text-blue-700">
                                        Margin %
                                      </th>
                                      <th className="text-right py-2 font-medium text-blue-700">
                                        KM
                                      </th>
                                      <th className="text-right py-2 font-medium text-blue-700">
                                        IPK
                                      </th>
                                      <th className="text-right py-2 font-medium text-blue-700">
                                        CPK
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(weeklyTripsMap[weekKey] || []).map((trip) => {
                                      const offloadDate =
                                        trip.finalOffloadDateTime ||
                                        trip.actualOffloadDateTime ||
                                        trip.endDate;
                                      const tripCosts = calculateTotalCosts(trip.costs);
                                      const additionalCosts =
                                        trip.additionalCosts?.reduce(
                                          (sum, cost) => sum + cost.amount,
                                          0
                                        ) || 0;
                                      const totalTripCosts = tripCosts + additionalCosts;
                                      const grossProfit = trip.baseRevenue - totalTripCosts;
                                      const margin =
                                        trip.baseRevenue > 0
                                          ? (grossProfit / trip.baseRevenue) * 100
                                          : 0;
                                      const ipk =
                                        trip.distanceKm && trip.distanceKm > 0
                                          ? trip.baseRevenue / trip.distanceKm
                                          : 0;
                                      const cpk =
                                        trip.distanceKm && trip.distanceKm > 0
                                          ? totalTripCosts / trip.distanceKm
                                          : 0;
                                      return (
                                        <tr
                                          key={trip.id}
                                          className="border-b border-blue-100 hover:bg-blue-100/50"
                                        >
                                          <td className="py-2 text-blue-900">{trip.id}</td>
                                          <td className="py-2 text-blue-900">
                                            {trip.clientName || "-"}
                                          </td>
                                          <td className="py-2 text-blue-900">
                                            {offloadDate
                                              ? new Date(offloadDate).toLocaleDateString()
                                              : "-"}
                                          </td>
                                          <td className="py-2 text-right text-green-700">
                                            {formatCurrency(trip.baseRevenue, trip.revenueCurrency)}
                                          </td>
                                          <td className="py-2 text-right text-red-700">
                                            {formatCurrency(totalTripCosts, trip.revenueCurrency)}
                                          </td>
                                          <td
                                            className={`py-2 text-right ${grossProfit >= 0 ? "text-green-700" : "text-red-700"}`}
                                          >
                                            {formatCurrency(grossProfit, trip.revenueCurrency)}
                                          </td>
                                          <td
                                            className={`py-2 text-right ${margin >= 0 ? "text-green-700" : "text-red-700"}`}
                                          >
                                            {margin.toFixed(1)}%
                                          </td>
                                          <td className="py-2 text-right">
                                            {trip.distanceKm?.toLocaleString() || "-"}
                                          </td>
                                          <td className="py-2 text-right">
                                            {formatCurrency(ipk, trip.revenueCurrency)}
                                          </td>
                                          <td className="py-2 text-right">
                                            {formatCurrency(cpk, trip.revenueCurrency)}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No completed trips yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Weekly metrics will appear here once trips are completed and offloaded.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Year-over-Year Performance Summary</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Operational Efficiency */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Operational Efficiency</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Distance Coverage</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-purple-600">
                      +{kmsChange.value.toLocaleString()} km
                    </span>
                    <p className="text-xs text-gray-500">
                      {kmsChange.percentage.toFixed(1)}% increase
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Cost Efficiency</span>
                  <div className="text-right">
                    <span
                      className={`text-lg font-bold ${cpkChange.percentage < 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {cpkChange.percentage > 0 ? "+" : ""}
                      {formatCurrency(cpkChange.value, "USD")}
                    </span>
                    <p className="text-xs text-gray-500">
                      {cpkChange.percentage.toFixed(1)}%{" "}
                      {cpkChange.percentage < 0 ? "improvement" : "increase"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Revenue per KM</span>
                  <div className="text-right">
                    <span
                      className={`text-lg font-bold ${ipkChange.percentage > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {ipkChange.percentage > 0 ? "+" : ""}
                      {formatCurrency(ipkChange.value, "USD")}
                    </span>
                    <p className="text-xs text-gray-500">
                      {ipkChange.percentage.toFixed(1)}%{" "}
                      {ipkChange.percentage > 0 ? "increase" : "decrease"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Performance */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Revenue Growth</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-600">
                      +{formatCurrency(revenueChange.value, "USD")}
                    </span>
                    <p className="text-xs text-gray-500">
                      {revenueChange.percentage.toFixed(1)}% increase
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">EBIT Improvement</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600">
                      +{formatCurrency(ebitChange.value, "USD")}
                    </span>
                    <p className="text-xs text-gray-500">
                      {ebitChange.percentage.toFixed(1)}% increase
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Net Profit Growth</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-purple-600">
                      +{formatCurrency(netProfitChange.value, "USD")}
                    </span>
                    <p className="text-xs text-gray-500">
                      {netProfitChange.percentage.toFixed(0)}% increase
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Key Performance Insights</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                • <strong>Exceptional Growth:</strong> Net profit increased by{" "}
                {netProfitChange.percentage.toFixed(0)}% year-over-year, demonstrating strong
                operational improvements
              </p>
              <p>
                • <strong>Efficiency Gains:</strong>{" "}
                {cpkChange.percentage < 0
                  ? "Operational costs per KM decreased"
                  : "Operational costs per KM increased"}{" "}
                by {Math.abs(cpkChange.percentage).toFixed(1)}%
              </p>
              <p>
                • <strong>Scale Expansion:</strong> Total distance coverage increased by{" "}
                {kmsChange.percentage.toFixed(1)}%, showing business growth
              </p>
              <p>
                • <strong>Return Performance:</strong> ROE improved from {previous2024.roe}% to{" "}
                {current2025.roe}%, ROIC from {previous2024.roic}% to {current2025.roic}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={handleClose}
        title={`Edit ${editingYear} YTD Metrics`}
        className="max-w-4xl"
      >
        {formData && editingYear && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800">
                    Monthly Update - {editingYear}
                  </h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Update YTD metrics for strategic reporting. These values are independent of
                    trip-based calculations and should be updated monthly on the 15th based on
                    comprehensive financial analysis.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Total Kilometers"
                type="number"
                step="1"
                value={formData.totalKms?.toString() || ""}
                onChange={(e) => handleChange("totalKms", e.target.value)}
                error={errors.totalKms}
              />

              <Input
                label="Income Per KM (IPK) - USD"
                type="number"
                step="0.01"
                value={formData.ipk?.toString() || ""}
                onChange={(e) => handleChange("ipk", e.target.value)}
                error={errors.ipk}
              />

              <Input
                label="Operational Cost Per KM - USD"
                type="number"
                step="0.01"
                value={formData.operationalCpk?.toString() || ""}
                onChange={(e) => handleChange("operationalCpk", e.target.value)}
                error={errors.operationalCpk}
              />

              <Input
                label="Total Revenue - USD"
                type="number"
                step="0.01"
                value={formData.revenue?.toString() || ""}
                onChange={(e) => handleChange("revenue", e.target.value)}
                error={errors.revenue}
              />

              <Input
                label="EBIT - USD"
                type="number"
                step="0.01"
                value={formData.ebit?.toString() || ""}
                onChange={(e) => handleChange("ebit", e.target.value)}
              />

              <Input
                label="EBIT Margin (%)"
                type="number"
                step="0.01"
                value={formData.ebitMargin?.toString() || ""}
                onChange={(e) => handleChange("ebitMargin", e.target.value)}
              />

              <Input
                label="Net Profit - USD"
                type="number"
                step="0.01"
                value={formData.netProfit?.toString() || ""}
                onChange={(e) => handleChange("netProfit", e.target.value)}
              />

              <Input
                label="Net Profit Margin (%)"
                type="number"
                step="0.01"
                value={formData.netProfitMargin?.toString() || ""}
                onChange={(e) => handleChange("netProfitMargin", e.target.value)}
              />

              <Input
                label="Return on Equity (ROE) (%)"
                type="number"
                step="0.01"
                value={formData.roe?.toString() || ""}
                onChange={(e) => handleChange("roe", e.target.value)}
              />

              <Input
                label="Return on Invested Capital (ROIC) (%)"
                type="number"
                step="0.01"
                value={formData.roic?.toString() || ""}
                onChange={(e) => handleChange("roic", e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={handleClose} icon={<X className="w-4 h-4" />}>
                Cancel
              </Button>
              <Button onClick={handleSave} icon={<Save className="w-4 h-4" />}>
                Save {editingYear} Metrics
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default YearToDateKPIs;
