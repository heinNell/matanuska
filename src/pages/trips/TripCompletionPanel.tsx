import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import React, { useState } from "react";

interface TripCompletionPanelProps {
  canComplete: boolean;
  onComplete: () => void;
}

const TripCompletionPanel: React.FC<TripCompletionPanelProps> = ({ canComplete, onComplete }) => {
  const [proofOfDelivery, setProofOfDelivery] = useState<File | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [odometerEnd, setOdometerEnd] = useState<number>(0);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
  const [vehicleInspected, setVehicleInspected] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofOfDelivery(e.target.files[0]);
    }
  };

  const handleComplete = () => {
    if (!canComplete) {
      alert("Cannot complete trip: Please resolve all flagged costs first");
      return;
    }

    if (!proofOfDelivery) {
      alert("Proof of delivery is required");
      return;
    }

    if (!deliveryConfirmed || !vehicleInspected) {
      alert("Please complete all required checks");
      return;
    }

    onComplete();
  };

  const completionChecklist = [
    {
      id: "delivery",
      label: "Delivery confirmed by client",
      checked: deliveryConfirmed,
      onChange: setDeliveryConfirmed,
      required: true,
    },
    {
      id: "vehicle",
      label: "Vehicle post-trip inspection completed",
      checked: vehicleInspected,
      onChange: setVehicleInspected,
      required: true,
    },
  ];

  const allRequiredChecked = completionChecklist
    .filter((item) => item.required)
    .every((item) => item.checked);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Complete Trip</h3>

        {!canComplete && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">⚠️ Cannot Complete Trip</h4>
            <p className="text-sm text-red-700">
              Please resolve all flagged costs before completing the trip.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Completion Checklist */}
          <div>
            <h4 className="font-medium mb-3">Completion Checklist</h4>
            <div className="space-y-3">
              {completionChecklist.map((item) => (
                <label key={item.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.onChange(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className={item.required ? "font-medium" : ""}>
                    {item.label}
                    {item.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Proof of Delivery */}
          <div>
            <label className="block text-sm font-medium mb-1">Proof of Delivery *</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {proofOfDelivery && (
              <p className="text-sm text-green-600 mt-1">✓ Selected: {proofOfDelivery.name}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Upload signed delivery note, photos, or other delivery confirmation
            </p>
          </div>

          {/* End Odometer Reading */}
          <div>
            <label className="block text-sm font-medium mb-1">End Odometer Reading (km)</label>
            <Input
              type="number"
              value={odometerEnd.toString()}
              onChange={(e) => setOdometerEnd(parseInt(e.target.value) || 0)}
              placeholder="Enter end odometer reading"
            />
          </div>

          {/* Completion Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Completion Notes</label>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Any additional notes about trip completion..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div className="text-sm text-gray-500">
              {!allRequiredChecked && "Complete all required items to proceed"}
              {!canComplete && "Resolve flagged costs to enable completion"}
            </div>
            <Button
              onClick={handleComplete}
              disabled={!canComplete || !allRequiredChecked || !proofOfDelivery}
              className={
                canComplete && allRequiredChecked && proofOfDelivery
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
            >
              Complete Trip
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TripCompletionPanel;
