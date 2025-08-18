import DieselEditModal from "../../components/Models/Diesel/DieselEditModal";
import DieselImportModal from "../../components/Models/Diesel/DieselImportModal";
import DieselNormsModal from "../../components/Models/Diesel/DieselNormsModal";
import EnhancedDieselDebriefModal from "../../components/Models/Diesel/EnhancedDieselDebriefModal";
import ManualDieselEntryModal from "../../components/Models/Diesel/ManualDieselEntryModal";
import TripLinkageModal from "../../components/Models/Trips/TripLinkageModal";
import { Fuel } from "lucide-react";
import React, { useEffect, useState } from "react";
import DieselDashboardFilters from "../../components/diesel/DieselDashboardFilters";
import DieselDashboardHeader from "../../components/diesel/DieselDashboardHeader";
import DieselDashboardSummary from "../../components/diesel/DieselDashboardSummary";
import DieselRecordsCards from "../../components/diesel/DieselRecordsCards";
import DieselRecordsTable from "../../components/diesel/DieselRecordsTable";
import AutomaticProbeVerificationModal from "../../components/Models/Diesel/AutomaticProbeVerificationModal";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { useAppContext } from "../../context/AppContext";
import { useSyncContext } from "../../context/SyncContext";
import { DieselConsumptionRecord as BaseDieselConsumptionRecord } from "../../types";
import { ExtendedDieselConsumptionRecord } from "../../types/types";

interface DieselDashboardProps {
  className?: string;
}

// Simulated functions that will need to be added to AppContext
const loadDieselRecords = async () => {
  console.log("Loading diesel records...");
  // This would be implemented in AppContext
  return Promise.resolve();
};

const syncDieselFromWialon = async () => {
  console.log("Syncing diesel from Wialon...");
  // This would be implemented in AppContext
  return Promise.resolve();
};

const DieselDashboard: React.FC<DieselDashboardProps> = ({ className = "" }) => {
  const { dieselRecords, deleteDieselRecord, isLoading } = useAppContext();

  // Sync context will be used with SyncIndicator component if needed
  useSyncContext();

  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDieselNormsModal, setShowDieselNormsModal] = useState(false);
  const [showDebriefModal, setShowDebriefModal] = useState(false);
  const [showProbeModal, setShowProbeModal] = useState(false);
  const [showLinkageModal, setShowLinkageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ExtendedDieselConsumptionRecord | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ExtendedDieselConsumptionRecord;
    direction: "ascending" | "descending";
  }>({
    key: "date" as keyof ExtendedDieselConsumptionRecord,
    direction: "descending",
  });

  // Load diesel records on mount
  useEffect(() => {
    if (loadDieselRecords) {
      loadDieselRecords();
    }
  }, [loadDieselRecords]);

  // Map base DieselConsumptionRecord to ExtendedDieselConsumptionRecord
  const mapToExtendedRecord = (
    record: BaseDieselConsumptionRecord
  ): ExtendedDieselConsumptionRecord => {
    return {
      ...record,
      vehicleId: record.fleetNumber, // Map fleetNumber to vehicleId
      timestamp: record.date, // Map date to timestamp
      liters: record.litresFilled, // Map litresFilled to liters
      cost: record.totalCost, // Map totalCost to cost
      location: record.fuelStation, // Map fuelStation to location
      odometer: record.kmReading, // Map kmReading to odometer
      verified: record.probeVerified || false, // Map probeVerified to verified
      flagged: false, // Default for flagged
    };
  };

  // Filter and sort records
  const getFilteredRecords = () => {
    // First map to extended records
    return dieselRecords
      .map(mapToExtendedRecord)
      .filter((record) => {
        // Filter by selected vehicles
        if (
          selectedVehicles.length > 0 &&
          record.vehicleId &&
          !selectedVehicles.includes(record.vehicleId)
        ) {
          return false;
        }

        // Filter by search term
        if (
          searchTerm &&
          record.vehicleId &&
          !record.vehicleId.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }

        // Filter by date range
        if (
          dateRange.from &&
          record.timestamp &&
          new Date(record.timestamp) < new Date(dateRange.from)
        ) {
          return false;
        }

        if (
          dateRange.to &&
          record.timestamp &&
          new Date(record.timestamp) > new Date(dateRange.to + "T23:59:59")
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortConfig.key === "timestamp") {
          // Special case for dates
          const timestampA = a[sortConfig.key];
          const timestampB = b[sortConfig.key];
          const dateA = timestampA ? new Date(timestampA).getTime() : 0;
          const dateB = timestampB ? new Date(timestampB).getTime() : 0;
          return sortConfig.direction === "ascending" ? dateA - dateB : dateB - dateA;
        } else {
          // General case for other fields
          // Cast to any to avoid type issues with accessing dynamic properties
          const aValue = (a as any)[sortConfig.key];
          const bValue = (b as any)[sortConfig.key];

          if (aValue < bValue) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
          return 0;
        }
      });
  };

  const filteredRecords = getFilteredRecords();

  // Handle sorting
  const requestSort = (key: keyof ExtendedDieselConsumptionRecord) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const totalLiters = filteredRecords.reduce(
    (sum, record) => sum + (record.liters || record.litresFilled || 0),
    0
  );
  const totalCost = filteredRecords.reduce(
    (sum, record) => sum + (record.cost || record.totalCost || 0),
    0
  );

  // Get unique vehicles for filtering
  // This was previously used with the FleetSelector but is now commented out since we updated to use
  // the value/onChange pattern instead of selectedVehicles/availableVehicles
  /*
  const uniqueVehicles = Array.from(
    new Set(
      dieselRecords.map((record) => mapToExtendedRecord(record).vehicleId || record.fleetNumber)
    )
  );
  */

  // Handle vehicle selection
  const handleVehicleSelection = (vehicles: string[]) => {
    setSelectedVehicles(vehicles);
  };

  // Handle record deletion
  const handleDeleteRecord = async (recordId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this diesel record? This action cannot be undone."
      )
    ) {
      setIsDeleting((prev) => ({ ...prev, [recordId]: true }));
      try {
        await deleteDieselRecord(recordId);
      } catch (error) {
        console.error("Failed to delete record:", error);
        alert("Failed to delete record. Please try again.");
      } finally {
        setIsDeleting((prev) => ({ ...prev, [recordId]: false }));
      }
    }
  };

  // Handle Wialon sync
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncDieselFromWialon();
    } catch (error) {
      console.error("Failed to sync with Wialon:", error);
      alert("Failed to sync diesel data from Wialon. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle record edit
  const handleEditRecord = (record: ExtendedDieselConsumptionRecord) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  // Handle trip linkage
  const handleLinkToTrip = (record: ExtendedDieselConsumptionRecord) => {
    setSelectedRecord(record);
    setShowLinkageModal(true);
  };

  // Handle debrief
  const handleDebrief = (record: ExtendedDieselConsumptionRecord) => {
    setSelectedRecord(record);
    setShowDebriefModal(true);
  };

  // Handle probe verification
  const handleProbeVerification = (record: ExtendedDieselConsumptionRecord) => {
    setSelectedRecord(record);
    setShowProbeModal(true);
  };

  // Format numbers for display
  const formatNumber = (num: number, decimals = 2) => {
    return num.toFixed(decimals);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <DieselDashboardHeader
        onAddRecord={() => setShowManualEntryModal(true)}
        onImport={() => setShowImportModal(true)}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      <Card>
        <CardHeader className="pb-2">
          <DieselDashboardFilters
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            selectedVehicles={selectedVehicles}
            onVehicleSelectionChange={handleVehicleSelection}
            onShowDieselNorms={() => setShowDieselNormsModal(true)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </CardHeader>

        <CardContent>
          <DieselDashboardSummary
            recordCount={filteredRecords.length}
            totalLiters={totalLiters}
            totalCost={totalCost}
            onExport={() => console.log("Exporting...")}
          />

          {isLoading ? (
            <div className="flex justify-center p-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center p-10">
              <Fuel className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Diesel Records</h3>
              <p className="mt-1 text-sm text-gray-500">
                No records match your current filters or no records have been added yet.
              </p>
              <div className="mt-6">
                <Button onClick={() => setShowManualEntryModal(true)}>Add New Record</Button>
              </div>
            </div>
          ) : viewMode === "table" ? (
            <DieselRecordsTable
              records={filteredRecords}
              onSort={requestSort}
              sortConfig={sortConfig}
              onEdit={handleEditRecord}
              onDelete={handleDeleteRecord}
              onDebrief={handleDebrief}
              onVerify={handleProbeVerification}
              onLink={handleLinkToTrip}
              isDeleting={isDeleting}
            />
          ) : (
            <DieselRecordsCards
              records={filteredRecords}
              onEdit={handleEditRecord}
              onDelete={handleDeleteRecord}
              onDebrief={handleDebrief}
              onVerify={handleProbeVerification}
              onLink={handleLinkToTrip}
              isDeleting={isDeleting}
            />
          )}
        </CardContent>
      </Card>
      {showManualEntryModal && (
        <ManualDieselEntryModal
          isOpen={showManualEntryModal}
          onClose={() => setShowManualEntryModal(false)}
        />
      )}

      {showImportModal && (
        <DieselImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} />
      )}

      {showDieselNormsModal && (
        <DieselNormsModal
          isOpen={showDieselNormsModal}
          onClose={() => setShowDieselNormsModal(false)}
          norms={[]} // Add empty norms array
          onUpdateNorms={(norms) => console.log("Norms updated", norms)}
        />
      )}

      {showDebriefModal && selectedRecord && (
        <EnhancedDieselDebriefModal
          isOpen={showDebriefModal}
          onClose={() => {
            setShowDebriefModal(false);
            setSelectedRecord(null);
          }}
          records={[selectedRecord]} // Changed from record to records array
          norms={[]} // Added required norms prop
        />
      )}

      {showProbeModal && selectedRecord && (
        <AutomaticProbeVerificationModal
          isOpen={showProbeModal}
          onClose={() => {
            setShowProbeModal(false);
            setSelectedRecord(null);
          }}
          dieselRecordId={selectedRecord.id}
        />
      )}

      {showLinkageModal && selectedRecord && (
        <TripLinkageModal
          isOpen={showLinkageModal}
          onClose={() => {
            setShowLinkageModal(false);
            setSelectedRecord(null);
          }}
          dieselRecordId={selectedRecord.id} // Changed from dieselRecord to dieselRecordId
        />
      )}

      {showEditModal && selectedRecord && (
        <DieselEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRecord(null);
          }}
          dieselRecordId={selectedRecord.id} // Changed from record to dieselRecordId
        />
      )}
    </div>
  );
};

export default DieselDashboard;
