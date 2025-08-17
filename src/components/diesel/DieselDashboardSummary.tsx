import { Button } from "../../components/ui/Button";
import { Download } from "lucide-react";
import React from "react";
import { formatCurrency } from "../../utils/helpers";

interface DieselDashboardSummaryProps {
  recordCount: number;
  totalLiters: number;
  totalCost: number;
  onExport: () => void;
}

const DieselDashboardSummary: React.FC<DieselDashboardSummaryProps> = ({
  recordCount,
  totalLiters,
  totalCost,
  onExport,
}) => {
  const formatNumber = (num: number, decimals = 2) => {
    return num.toFixed(decimals);
  };

  return (
    <div className="mb-4 flex justify-between items-center">
      <div className="space-x-4">
        <span className="font-medium">
          Total Records: <span className="text-blue-600">{recordCount}</span>
        </span>
        <span className="font-medium">
          Total Liters: <span className="text-blue-600">{formatNumber(totalLiters)}</span>
        </span>
        <span className="font-medium">
          Total Cost: <span className="text-blue-600">{formatCurrency(totalCost)}</span>
        </span>
      </div>
      <Button variant="outline" onClick={onExport} className="flex items-center text-sm">
        <Download className="mr-1 h-4 w-4" />
        Export
      </Button>
    </div>
  );
};

export default DieselDashboardSummary;
