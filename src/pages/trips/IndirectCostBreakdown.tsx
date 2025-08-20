import { Calculator } from "lucide-react";
import React, { useState } from "react";
import { CostEntry, DEFAULT_SYSTEM_COST_RATES, SystemCostRates, Trip } from "../../types";
import { formatCurrency } from "../../utils/helpers";

interface SystemCostGeneratorProps {
  trip: Trip;
  onGenerateSystemCosts: (systemCosts: Omit<CostEntry, "id" | "attachments">[]) => void;
}

// Component aligned with default export & route expectations
const IndirectCostBreakdown: React.FC<SystemCostGeneratorProps> = ({
  trip,
  onGenerateSystemCosts,
}) => {
  const [systemRates] = useState<Record<"USD" | "ZAR", SystemCostRates>>(DEFAULT_SYSTEM_COST_RATES);

  const getApplicableRates = (currency: "USD" | "ZAR"): SystemCostRates => {
    const rates = systemRates[currency];
    const tripStartDate = new Date(trip.startDate);
    const rateEffectiveDate = new Date(rates.effectiveDate);
    return tripStartDate >= rateEffectiveDate ? rates : rates;
  };

  const rates = getApplicableRates(trip.revenueCurrency);

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const tripDurationDays =
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const perKmCosts = trip.distanceKm
    ? [
        {
          category: "System Costs",
          subCategory: "Repair & Maintenance per KM",
          amount: trip.distanceKm * rates.perKmCosts.repairMaintenance,
          rate: rates.perKmCosts.repairMaintenance,
          calculation: `${trip.distanceKm} km × ${formatCurrency(
            rates.perKmCosts.repairMaintenance,
            trip.revenueCurrency
          )}/km`,
        },
        {
          category: "System Costs",
          subCategory: "Tyre Cost per KM",
          amount: trip.distanceKm * rates.perKmCosts.tyreCost,
          rate: rates.perKmCosts.tyreCost,
          calculation: `${trip.distanceKm} km × ${formatCurrency(
            rates.perKmCosts.tyreCost,
            trip.revenueCurrency
          )}/km`,
        },
      ]
    : [];

  const perDayCosts = [
    {
      category: "System Costs",
      subCategory: "GIT Insurance",
      amount: tripDurationDays * rates.perDayCosts.gitInsurance,
      rate: rates.perDayCosts.gitInsurance,
      calculation: `${tripDurationDays} days × ${formatCurrency(
        rates.perDayCosts.gitInsurance,
        trip.revenueCurrency
      )}/day`,
    },
    {
      category: "System Costs",
      subCategory: "Short-Term Insurance",
      amount: tripDurationDays * rates.perDayCosts.shortTermInsurance,
      rate: rates.perDayCosts.shortTermInsurance,
      calculation: `${tripDurationDays} days × ${formatCurrency(
        rates.perDayCosts.shortTermInsurance,
        trip.revenueCurrency
      )}/day`,
    },
    {
      category: "System Costs",
      subCategory: "Tracking Cost",
      amount: tripDurationDays * rates.perDayCosts.trackingCost,
      rate: rates.perDayCosts.trackingCost,
      calculation: `${tripDurationDays} days × ${formatCurrency(
        rates.perDayCosts.trackingCost,
        trip.revenueCurrency
      )}/day`,
    },
    {
      category: "System Costs",
      subCategory: "Fleet Management System",
      amount: tripDurationDays * rates.perDayCosts.fleetManagementSystem,
      rate: rates.perDayCosts.fleetManagementSystem,
      calculation: `${tripDurationDays} days × ${formatCurrency(
        rates.perDayCosts.fleetManagementSystem,
        trip.revenueCurrency
      )}/day`,
    },
    {
      category: "System Costs",
      subCategory: "Licensing",
      amount: tripDurationDays * rates.perDayCosts.licensing,
      rate: rates.perDayCosts.licensing,
      calculation: `${tripDurationDays} days × ${formatCurrency(
        rates.perDayCosts.licensing,
        trip.revenueCurrency
      )}/day`,
    },
    {
      category: "System Costs",
      subCategory: "VID / Roadworthy",
      amount: tripDurationDays * rates.perDayCosts.vidRoadworthy,
      rate: rates.perDayCosts.vidRoadworthy,
      calculation: `${tripDurationDays} days × ${formatCurrency(
        rates.perDayCosts.vidRoadworthy,
        trip.revenueCurrency
      )}/day`,
    },
    {
      category: "System Costs",
      subCategory: "Wages",
      amount: tripDurationDays * rates.perDayCosts.wages,
      rate: rates.perDayCosts.wages,
      calculation: `${tripDurationDays} days × ${formatCurrency(
        rates.perDayCosts.wages,
        trip.revenueCurrency
      )}/day`,
    },
    {
      category: "System Costs",
      subCategory: "Depreciation",
      amount: tripDurationDays * rates.perDayCosts.depreciation,
      rate: rates.perDayCosts.depreciation,
      calculation: `${tripDurationDays} days × ${formatCurrency(
        rates.perDayCosts.depreciation,
        trip.revenueCurrency
      )}/day`,
    },
  ];

  const allSystemCosts = [...perKmCosts, ...perDayCosts];

  const handleGenerateSystemCosts = () => {
    const systemCostEntries: Omit<CostEntry, "id" | "attachments">[] = allSystemCosts.map(
      (cost, index) => ({
        tripId: trip.id,
        category: cost.category,
        subCategory: cost.subCategory,
        amount: cost.amount,
        currency: trip.revenueCurrency,
        referenceNumber: `SYS-${trip.id}-${String(index + 1).padStart(3, "0")}`,
        date: trip.startDate,
        notes: `System-generated operational overhead cost. ${cost.calculation}`,
        isFlagged: false,
        isSystemGenerated: true,
        systemCostType: cost.subCategory.includes("per KM") ? "per-km" : "per-day",
        calculationDetails: cost.calculation,
      })
    );

    onGenerateSystemCosts(systemCostEntries);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-lg font-bold text-gray-900">
            {trip.distanceKm ? `${trip.distanceKm} km` : "Not specified"}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-lg font-bold text-gray-900">{tripDurationDays} days</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-lg font-bold text-gray-900">{trip.revenueCurrency}</p>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={handleGenerateSystemCosts}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Calculator className="w-5 h-5 mr-2" />
          Generate System Costs ({allSystemCosts.length} entries)
        </button>
      </div>
    </div>
  );
};

export default IndirectCostBreakdown;
