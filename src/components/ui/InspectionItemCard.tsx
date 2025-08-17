// src/components/workshop/InspectionItemCard.tsx
import React from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";

interface InspectionItemCardProps {
  id: string;
  title: string;
  description?: string;
  isCritical?: boolean;
  onStatusChange: (itemId: string, status: "pending" | "pass" | "fail", notes: string) => void;
  currentStatus?: "pending" | "pass" | "fail";
  currentNotes?: string;
  disabled?: boolean;
  // Legacy props for backward compatibility
  value?: string;
  status?: "pass" | "fail" | "n/a";
  notes?: string;
}

const statusColorMap: Record<string, string> = {
  pending: "text-yellow-600",
  pass: "text-green-600",
  fail: "text-red-600",
  "n/a": "text-gray-500",
};

export const InspectionItemCard: React.FC<InspectionItemCardProps> = ({
  id,
  title,
  description,
  isCritical,
  onStatusChange,
  currentStatus = "pending",
  currentNotes = "",
  disabled = false,
  // Legacy props
  value,
  status,
  notes,
}) => {
  // Use current props if available, fallback to legacy props
  const displayStatus = currentStatus || status || "pending";
  const displayNotes = currentNotes || notes || "";

  return (
    <Card className="w-full">
      <CardHeader>
        <h3 className="text-base font-semibold">{title}</h3>
        {description && <p className="text-sm text-gray-600">{description}</p>}
        {isCritical && <span className="text-xs text-red-600 font-medium">CRITICAL</span>}
      </CardHeader>
      <CardContent className="space-y-2">
        {value && <p className="text-sm">Value: {value}</p>}
        <p
          className={`text-sm font-medium ${statusColorMap[displayStatus] || statusColorMap["n/a"]}`}
        >
          Status: {displayStatus.toUpperCase()}
        </p>
        {displayNotes && <p className="text-xs text-muted-foreground">Notes: {displayNotes}</p>}

        {!disabled && onStatusChange && (
          <div className="mt-4 space-y-2">
            <div className="flex gap-2">
              {(["pending", "pass", "fail"] as const).map((statusOption) => (
                <button
                  key={statusOption}
                  onClick={() => onStatusChange(id, statusOption, displayNotes)}
                  className={`px-3 py-1 text-xs rounded ${
                    displayStatus === statusOption
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {statusOption.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
