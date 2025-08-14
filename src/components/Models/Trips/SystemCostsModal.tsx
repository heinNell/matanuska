import { AlertCircle, Check } from "lucide-react";
import React, { useState } from "react";
import { CostEntry, Trip } from "../../../types";
import { formatCurrency } from "../../../utils/formatters";
import { Button } from "../../ui/Button";
import Modal from "../../ui/Modal";

interface SystemCostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripData: Trip;
  onGenerateCosts?: (costs: Omit<CostEntry, "id" | "attachments">[]) => Promise<void>;
}

const SystemCostsModal: React.FC<SystemCostsModalProps> = ({
  isOpen,
  onClose,
  tripData,
  onGenerateCosts,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateInfo] = useState({
    currency: "ZAR",
    effectiveDate: new Date().toISOString().split("T")[0],
    lastUpdated: new Date().toISOString().split("T")[0],
    updatedBy: "System Default",
  });

  // Calculate trip duration in days
  const calculateTripDuration = () => {
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1; // Ensure at least 1 day
  };

  const tripDuration = calculateTripDuration();
  const distance = tripData.distanceKm || 0;

  // Per-kilometer costs
  const perKmCosts = [
    { type: "Repair & Maintenance per KM", rate: 2.5, distance, total: 2.5 * distance },
    { type: "Tyre Cost per KM", rate: 1.8, distance, total: 1.8 * distance },
  ];

  // Per-day fixed costs
  const perDayCosts = [
    { type: "GIT Insurance", ratePerDay: 80.0, days: tripDuration, total: 80.0 * tripDuration },
    {
      type: "Short-Term Insurance",
      ratePerDay: 60.0,
      days: tripDuration,
      total: 60.0 * tripDuration,
    },
    { type: "Tracking Cost", ratePerDay: 40.0, days: tripDuration, total: 40.0 * tripDuration },
    {
      type: "Fleet Management System",
      ratePerDay: 20.0,
      days: tripDuration,
      total: 20.0 * tripDuration,
    },
    { type: "Licensing", ratePerDay: 15.0, days: tripDuration, total: 15.0 * tripDuration },
    { type: "VID / Roadworthy", ratePerDay: 10.0, days: tripDuration, total: 10.0 * tripDuration },
    { type: "Wages", ratePerDay: 300.0, days: tripDuration, total: 300.0 * tripDuration },
    { type: "Depreciation", ratePerDay: 150.0, days: tripDuration, total: 150.0 * tripDuration },
  ];

  // Calculate total system costs
  const totalPerKmCosts = perKmCosts.reduce((sum, cost) => sum + cost.total, 0);
  const totalPerDayCosts = perDayCosts.reduce((sum, cost) => sum + cost.total, 0);
  const totalSystemCosts = totalPerKmCosts + totalPerDayCosts;

  const handleGenerateCosts = async () => {
    if (!onGenerateCosts) return;

    try {
      setIsSubmitting(true);

      // Prepare cost entries
      const today = new Date().toISOString().split("T")[0];

      const systemCosts: Omit<CostEntry, "id" | "attachments">[] = [
        // Per-kilometer costs
        ...perKmCosts.map(
          (cost) =>
            ({
              category: "System Costs",
              subCategory: cost.type,
              currency: (tripData as any).revenueCurrency || rateInfo.currency,
              amount: cost.total,
              referenceNumber: `SYS-KM-${Date.now()}`,
              date: today,
              // Provide calculation & context in notes for auditing
              notes: `System generated per-kilometer cost (${cost.rate} per km × ${distance} km)`,
              isFlagged: false,
              isSystemGenerated: true,
              systemCostType: "per-km" as const,
              calculationDetails: `${distance} km × ${cost.rate.toFixed(2)} per km`,
              tripId: tripData.id,
            }) as Omit<CostEntry, "id" | "attachments">
        ),

        // Per-day costs
        ...perDayCosts.map(
          (cost) =>
            ({
              category: "System Costs",
              subCategory: cost.type,
              currency: (tripData as any).revenueCurrency || rateInfo.currency,
              amount: cost.total,
              referenceNumber: `SYS-DAY-${Date.now()}`,
              date: today,
              notes: `System generated per-day cost (${cost.ratePerDay} per day × ${tripDuration} days)`,
              isFlagged: false,
              isSystemGenerated: true,
              systemCostType: "per-day" as const,
              calculationDetails: `${tripDuration} days × ${cost.ratePerDay.toFixed(2)} per day`,
              tripId: tripData.id,
            }) as Omit<CostEntry, "id" | "attachments">
        ),
      ];

      // Submit the costs
      await onGenerateCosts(systemCosts);
      onClose();
    } catch (error) {
      console.error("Error generating system costs:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Automatic Operational Cost Injection"
      maxWidth="2xl"
    >
      <div className="p-6 space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                System will automatically apply predefined per-kilometer and per-day fixed cost
                factors to ensure true operational profitability assessment.
              </p>
            </div>
          </div>
        </div>

        {/* Rate Information */}
        <div className="bg-green-50 border border-green-100 rounded-md p-4">
          <h3 className="text-sm font-medium text-green-800 mb-2">Applied Rate Version</h3>
          <div className="space-y-1 text-sm text-green-700">
            <p>Currency: {rateInfo.currency}</p>
            <p>Effective Date: {rateInfo.effectiveDate}</p>
            <p>Last Updated: {rateInfo.lastUpdated}</p>
            <p>Updated By: {rateInfo.updatedBy}</p>
            <p className="text-xs italic mt-2">
              * These rates are applicable to this trip based on the trip start date (
              {tripData.startDate.split("T")[0]})
            </p>
          </div>
        </div>

        {/* Trip Details */}
        <div className="grid grid-cols-3 gap-6">
          <div className="border rounded-md p-4 text-center">
            <div className="flex items-center justify-center mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <span className="ml-1 text-sm text-gray-500">Distance</span>
            </div>
            <div className="text-lg font-semibold">{distance} km</div>
          </div>

          <div className="border rounded-md p-4 text-center">
            <div className="flex items-center justify-center mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="ml-1 text-sm text-gray-500">Duration</span>
            </div>
            <div className="text-lg font-semibold">{tripDuration} days</div>
            <div className="text-xs text-gray-500">
              {tripData.startDate.split("T")[0]} to {tripData.endDate.split("T")[0]}
            </div>
          </div>

          <div className="border rounded-md p-4 text-center">
            <div className="flex items-center justify-center mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                />
              </svg>
              <span className="ml-1 text-sm text-gray-500">Currency</span>
            </div>
            <div className="text-lg font-semibold">ZAR</div>
            <div className="text-xs text-gray-500">Using ZAR rates</div>
          </div>
        </div>

        {/* Per-Kilometer Costs */}
        <div>
          <h3 className="text-md font-semibold mb-3">Per-Kilometer Costs</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Type
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate/km
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distance
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {perKmCosts.map((cost, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cost.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    R{cost.rate.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    {distance} km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                    {formatCurrency(cost.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Per-Day Fixed Costs */}
        <div>
          <h3 className="text-md font-semibold mb-3">Per-Day Fixed Costs</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Type
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate/Day
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. of Days
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {perDayCosts.map((cost, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cost.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    R{cost.ratePerDay.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    {tripDuration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                    {formatCurrency(cost.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total System Costs */}
        <div className="bg-green-50 border border-green-100 rounded-md p-4 flex justify-between items-center">
          <div>
            <h3 className="text-md font-medium text-green-800">Total System Costs</h3>
            <p className="text-sm text-green-700">
              10 cost entries will be automatically generated
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-800">
              {formatCurrency(totalSystemCosts)}
            </div>
            <div className="text-sm text-green-700">Operational overhead</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <Button onClick={onClose} variant="outline" type="button" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerateCosts}
            variant="primary"
            type="button"
            disabled={isSubmitting}
            icon={<Check className="h-4 w-4" />}
          >
            {isSubmitting
              ? "Generating..."
              : `Generate System Costs (${perKmCosts.length + perDayCosts.length} entries)`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SystemCostsModal;
