import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import React, { useState } from "react";

interface FlaggedCost {
  id: string;
  description: string;
  amount: number;
  flagReason: string;
  isFlagged: boolean;
}

interface FlagInvestigationPanelProps {
  flaggedCosts: FlaggedCost[];
  onResolve: (costId: string) => void;
}

const FlagInvestigationPanel: React.FC<FlagInvestigationPanelProps> = ({
  flaggedCosts,
  onResolve,
}) => {
  const [selectedCost, setSelectedCost] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const handleResolve = (costId: string) => {
    if (!resolutionNote.trim()) {
      alert("Please provide a resolution note");
      return;
    }

    onResolve(costId);
    setSelectedCost(null);
    setResolutionNote("");
  };

  const getFlagReason = (cost: FlaggedCost): string => {
    if (cost.amount > 1000) return "High amount (>R1000)";
    if (cost.description.toLowerCase().includes("unusual")) return "Unusual expense";
    return "Requires approval";
  };

  if (flaggedCosts.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="text-green-600 text-4xl mb-4">✓</div>
          <h3 className="text-xl font-semibold text-green-600 mb-2">No Flags to Resolve</h3>
          <p className="text-gray-600">All costs have been reviewed and approved.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">
          Flag Investigation ({flaggedCosts.length} items)
        </h3>

        <div className="space-y-4">
          {flaggedCosts.map((cost) => (
            <div key={cost.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-red-800">{cost.description}</h4>
                  <p className="text-sm text-red-600">🚩 {getFlagReason(cost)}</p>
                  <p className="text-lg font-semibold text-red-700">R{cost.amount.toFixed(2)}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedCost(selectedCost === cost.id ? null : cost.id)}
                >
                  {selectedCost === cost.id ? "Cancel" : "Investigate"}
                </Button>
              </div>

              {selectedCost === cost.id && (
                <div className="border-t border-red-200 pt-3 mt-3">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Investigation Notes</label>
                      <textarea
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                        placeholder="Explain why this cost is valid and should be approved..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>Investigation Checklist:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Verify receipt/documentation</li>
                        <li>Confirm business necessity</li>
                        <li>Check approval authorization</li>
                        <li>Validate amount accuracy</li>
                      </ul>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setSelectedCost(null)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleResolve(cost.id)}
                        disabled={!resolutionNote.trim()}
                      >
                        Approve & Resolve
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {flaggedCosts.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ Action Required</h4>
            <p className="text-sm text-yellow-700">
              All flagged costs must be investigated and resolved before proceeding to trip
              completion.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FlagInvestigationPanel;
