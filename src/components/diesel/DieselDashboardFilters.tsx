import { Button } from "@/components/ui/Button";
import { Search, Settings } from "lucide-react";
import React from "react";
import FleetSelector from "../common/FleetSelector";

interface DieselDashboardFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  dateRange: { from: string; to: string };
  onDateRangeChange: (range: { from: string; to: string }) => void;
  selectedVehicles: string[];
  onVehicleSelectionChange: (vehicles: string[]) => void;
  onShowDieselNorms: () => void;
  viewMode: "card" | "table";
  onViewModeChange: (mode: "card" | "table") => void;
}

const DieselDashboardFilters: React.FC<DieselDashboardFiltersProps> = ({
  searchTerm,
  onSearchTermChange,
  dateRange,
  onDateRangeChange,
  selectedVehicles,
  onVehicleSelectionChange,
  onShowDieselNorms,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-1 flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by fleet number..."
            className="pl-9 w-full p-2 border rounded"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>

        <div className="flex gap-2 min-w-[200px]">
          <input
            type="date"
            className="flex-1 p-2 border rounded"
            value={dateRange.from}
            onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
          />
          <span className="self-center">to</span>
          <input
            type="date"
            className="flex-1 p-2 border rounded"
            value={dateRange.to}
            onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" onClick={onShowDieselNorms} className="flex items-center text-sm">
          <Settings className="mr-1 h-4 w-4" />
          Norms
        </Button>
        <div className="flex border rounded overflow-hidden">
          <button
            onClick={() => onViewModeChange("card")}
            className={`px-3 py-1 ${
              viewMode === "card" ? "bg-blue-100 text-blue-700" : "bg-white"
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => onViewModeChange("table")}
            className={`px-3 py-1 ${
              viewMode === "table" ? "bg-blue-100 text-blue-700" : "bg-white"
            }`}
          >
            Table
          </button>
        </div>
      </div>
      <div className="mt-4 w-full">
        <FleetSelector
          label="Filter by fleet:"
          value={selectedVehicles[0] || ""}
          onChange={(vehicle) => onVehicleSelectionChange([vehicle])}
          placeholder="Select vehicle"
        />
      </div>
    </div>
  );
};

export default DieselDashboardFilters;
