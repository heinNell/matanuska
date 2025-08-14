import React, { useState, useEffect } from "react";
import { Search, Filter, Plus, ScanLine, RefreshCw } from "lucide-react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/FormElements";
import TyreCardMobile from "./TyreCardMobile";
import TyreScanner from "./TyreScanner";

interface Tyre {
  id: string;
  tyreNumber: string;
  manufacturer: string;
  tyreSize: string;
  pattern?: string;
  condition: string;
  status: string;
  mountStatus: string;
  axlePosition?: string;
  vehicleId?: string;
  cost?: number;
  datePurchased?: string;
  kmRun?: number;
  lastInspection?: string;
}

interface TyreListMobileProps {
  tyres: Tyre[];
  loading?: boolean;
  onRefresh?: () => void;
  onAddNew?: () => void;
  onScanTyre?: (tyre: Tyre) => void;
  onEditTyre?: (tyre: Tyre) => void;
  onViewDetails?: (tyre: Tyre) => void;
  enableScanner?: boolean;
}

const TyreListMobile: React.FC<TyreListMobileProps> = ({
  tyres,
  loading = false,
  onRefresh,
  onAddNew,
  onScanTyre,
  onEditTyre,
  onViewDetails,
  enableScanner = true,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [filteredTyres, setFilteredTyres] = useState<Tyre[]>([]);

  // Filter tyres based on search and filters
  useEffect(() => {
    let filtered = tyres;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (tyre) =>
          tyre.tyreNumber.toLowerCase().includes(searchLower) ||
          tyre.manufacturer.toLowerCase().includes(searchLower) ||
          tyre.tyreSize.toLowerCase().includes(searchLower) ||
          (tyre.pattern && tyre.pattern.toLowerCase().includes(searchLower)) ||
          (tyre.axlePosition && tyre.axlePosition.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (tyre) => tyre.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Condition filter
    if (conditionFilter !== "all") {
      filtered = filtered.filter(
        (tyre) => tyre.condition.toLowerCase() === conditionFilter.toLowerCase()
      );
    }

    setFilteredTyres(filtered);
  }, [tyres, searchTerm, statusFilter, conditionFilter]);

  const handleScanComplete = (scanData: { barcode?: string; photo?: string }) => {
    if (scanData.barcode) {
      // Find tyre by barcode/QR code
      const foundTyre = tyres.find(
        (tyre) => tyre.tyreNumber === scanData.barcode || tyre.id === scanData.barcode
      );

      if (foundTyre && onScanTyre) {
        onScanTyre(foundTyre);
      } else {
        // If not found, search for it
        setSearchTerm(scanData.barcode || "");
      }
    }
    setShowScanner(false);
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "in-service", label: "In Service" },
    { value: "maintenance", label: "Maintenance" },
    { value: "out-of-service", label: "Out of Service" },
    { value: "spare", label: "Spare" },
  ];

  const conditionOptions = [
    { value: "all", label: "All Conditions" },
    { value: "new", label: "New" },
    { value: "used", label: "Used" },
    { value: "retreaded", label: "Retreaded" },
    { value: "scrap", label: "Scrap" },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="p-4">
          {/* Search Bar */}
          <div className="flex space-x-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                label="Search"
                type="text"
                placeholder="Search tyres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-blue-50 border-blue-300" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>

            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-3 pt-3 border-t">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-blue-500"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    value={conditionFilter}
                    onChange={(e) => setConditionFilter(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-blue-500"
                  >
                    {conditionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-3">
            {enableScanner && (
              <Button onClick={() => setShowScanner(true)} variant="outline" className="flex-1">
                <ScanLine className="h-4 w-4 mr-2" />
                Scan QR
              </Button>
            )}

            {onAddNew && (
              <Button onClick={onAddNew} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add Tyre
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="px-4 py-2 bg-gray-100 border-b">
        <p className="text-sm text-gray-600">
          {loading ? "Loading..." : `${filteredTyres.length} of ${tyres.length} tyres`}
        </p>
      </div>

      {/* Tyre List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading tyres...</span>
          </div>
        ) : filteredTyres.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== "all" || conditionFilter !== "all"
                ? "No tyres match your search criteria"
                : "No tyres found"}
            </p>
            {onAddNew && (
              <Button onClick={onAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Tyre
              </Button>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredTyres.map((tyre) => (
              <TyreCardMobile
                key={tyre.id}
                tyre={tyre}
                onScan={onScanTyre ? () => onScanTyre(tyre) : undefined}
                onEdit={onEditTyre ? () => onEditTyre(tyre) : undefined}
                onViewDetails={onViewDetails ? () => onViewDetails(tyre) : undefined}
                compact={filteredTyres.length > 10}
              />
            ))}
          </div>
        )}
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <TyreScanner
          scanMode="barcode"
          title="Scan Tyre QR Code"
          onScanComplete={handleScanComplete}
          onCancel={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default TyreListMobile;
