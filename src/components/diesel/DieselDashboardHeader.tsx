import { Button } from "@/components/ui/Button";
import { Plus, RefreshCw, Upload } from "lucide-react";
import React from "react";
import SyncIndicator from "../ui/SyncIndicator";

interface DieselDashboardHeaderProps {
  onAddRecord: () => void;
  onImport: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

const DieselDashboardHeader: React.FC<DieselDashboardHeaderProps> = ({
  onAddRecord,
  onImport,
  onSync,
  isSyncing,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold">Diesel Consumption</h2>
        <p className="text-sm text-gray-600">Track and manage diesel usage across your fleet</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={onAddRecord} className="flex items-center">
          <Plus className="mr-1 h-4 w-4" />
          Add Record
        </Button>
        <Button onClick={onImport} variant="outline" className="flex items-center">
          <Upload className="mr-1 h-4 w-4" />
          Import
        </Button>
        <Button
          onClick={onSync}
          variant="outline"
          disabled={isSyncing}
          className="flex items-center"
        >
          <RefreshCw className={`mr-1 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync Wialon"}
        </Button>
        <SyncIndicator />
      </div>
    </div>
  );
};

export default DieselDashboardHeader;
