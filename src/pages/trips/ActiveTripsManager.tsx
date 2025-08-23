import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import React, { useMemo, useState } from "react";
import LoadImportModal from "../../components/Models/Trips/LoadImportModal";
import TripStatusUpdateModal from "../../components/Models/Trips/TripStatusUpdateModal";
import { useAppContext } from "../../context/AppContext";
import { Trip } from "../../types";
import {
  calculateTotalCosts,
  formatCurrency,
  formatDateForHeader,
  getFlaggedCostsCount,
  sortTripsByLoadingDate,
} from "../../utils/helpers";

interface ActiveTripsManagerProps {
  onViewTrip?: (tripId: string) => void;
}

const ActiveTripsManager: React.FC<ActiveTripsManagerProps> = ({ onViewTrip }) => {
  const { trips, updateTripStatus } = useAppContext();
  const activeTrips = trips.filter((t) => t.status === "active" || t.status === "shipped");

  // Filters
  const [filterFleet, setFilterFleet] = useState("");
  const [filterDriver, setFilterDriver] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [statusUpdateTrip, setStatusUpdateTrip] = useState<Trip | null>(null);
  const [statusUpdateType, setStatusUpdateType] = useState<"shipped" | "delivered">("shipped");

  const filteredTrips = useMemo(() => {
    return activeTrips.filter((t) => {
      if (filterFleet && t.fleetNumber !== filterFleet) return false;
      if (filterDriver && !t.driverName?.toLowerCase().includes(filterDriver.toLowerCase()))
        return false;
      if (filterClient && !t.clientName?.toLowerCase().includes(filterClient.toLowerCase()))
        return false;
      return true;
    });
  }, [activeTrips, filterFleet, filterDriver, filterClient]);

  const tripsByDate = useMemo(() => sortTripsByLoadingDate(filteredTrips), [filteredTrips]);
  const uniqueFleets = Array.from(new Set(activeTrips.map((t) => t.fleetNumber).filter(Boolean)));
  const uniqueDrivers = Array.from(new Set(activeTrips.map((t) => t.driverName).filter(Boolean)));
  const uniqueClients = Array.from(new Set(activeTrips.map((t) => t.clientName).filter(Boolean)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Active Trips</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters((s) => !s)}>
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button onClick={() => setIsImportModalOpen(true)}>Import Loads</Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardHeader title="Filters" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Fleet</label>
                <select
                  className="mt-1 w-full border rounded px-2 py-1"
                  value={filterFleet}
                  onChange={(e) => setFilterFleet(e.target.value)}
                >
                  <option value="">All</option>
                  {uniqueFleets.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Driver</label>
                <select
                  className="mt-1 w-full border rounded px-2 py-1"
                  value={filterDriver}
                  onChange={(e) => setFilterDriver(e.target.value)}
                >
                  <option value="">All</option>
                  {uniqueDrivers.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Client</label>
                <select
                  className="mt-1 w-full border rounded px-2 py-1"
                  value={filterClient}
                  onChange={(e) => setFilterClient(e.target.value)}
                >
                  <option value="">All</option>
                  {uniqueClients.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(tripsByDate).length === 0 && (
        <Card>
          <CardContent>No active trips found.</CardContent>
        </Card>
      )}

      {Object.entries(tripsByDate).map(([date, dayTrips]) => (
        <Card key={date}>
          <CardHeader title={formatDateForHeader(date)} subtitle={`${dayTrips.length} trip(s)`} />
          <CardContent className="space-y-4">
            {dayTrips.map((trip) => {
              const totalCosts = calculateTotalCosts(trip.costs || []);
              const flags = getFlaggedCostsCount(trip.costs || []);
              return (
                <div
                  key={trip.id}
                  className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="font-medium">
                      {trip.fleetNumber} • {trip.route}
                    </div>
                    <div className="text-sm text-gray-600">
                      Driver: {trip.driverName || "—"} | Client: {trip.clientName || "—"}
                    </div>
                    <div className="text-sm text-gray-500">
                      Revenue:{" "}
                      {formatCurrency(trip.baseRevenue || 0, trip.revenueCurrency || "ZAR")} •
                      Costs: {formatCurrency(totalCosts, trip.revenueCurrency || "ZAR")}
                    </div>
                    {flags > 0 && (
                      <div className="text-xs text-red-600">{flags} flagged cost(s)</div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" onClick={() => onViewTrip?.(trip.id)}>
                      View
                    </Button>
                    {trip.status === "active" && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setStatusUpdateTrip(trip);
                          setStatusUpdateType("shipped");
                        }}
                      >
                        Mark Shipped
                      </Button>
                    )}
                    {(trip.status === "active" || trip.status === "shipped") && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setStatusUpdateTrip(trip);
                          setStatusUpdateType("delivered");
                        }}
                      >
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <TripStatusUpdateModal
        isOpen={!!statusUpdateTrip}
        onClose={() => setStatusUpdateTrip(null)}
        trip={statusUpdateTrip as any}
        status={statusUpdateType}
        onUpdateStatus={async (id, status, notes) => {
          await updateTripStatus(id, status, notes);
          setStatusUpdateTrip(null);
        }}
      />

      <LoadImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
    </div>
  );
};

export default ActiveTripsManager;
