import { Button } from "../../../components/ui/Button";
import React, { useEffect, useState } from "react";
import { CLIENTS, DRIVERS, FLEET_NUMBERS } from "../../../types/index";
import { Input, Select, TextArea } from "../../ui/FormElements";
import type { PlannedRoute } from "../../../types/trip";
import type { Trip } from "../../../types/index";
import type { TripFormData as TripFormDataType } from "../../../types/TripTypes";

interface TripFormProps {
  trip?: Trip;
  onSubmit: (tripData: TripFormDataType) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const TripForm: React.FC<TripFormProps> = ({
  trip,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [fleetNumber, setFleetNumber] = useState("");
  const [fleetUnitId, setFleetUnitId] = useState<number | "">("");
  const [clientName, setClientName] = useState("");
  const [driverName, setDriverName] = useState("");
  const [route, setRoute] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [distanceKm, setDistanceKm] = useState(0);
  const [baseRevenue, setBaseRevenue] = useState(0);
  const [revenueCurrency, setRevenueCurrency] = useState<"USD" | "ZAR">("ZAR");
  const [clientType, setClientType] = useState<"internal" | "external">("external");
  const [plannedRoute, setPlannedRoute] = useState<PlannedRoute>({
    origin: "",
    destination: "",
    waypoints: [],
  });
  const [waypoint, setWaypoint] = useState("");
  const [waypoints, setWaypoints] = useState<string[]>([]);

  useEffect(() => {
    if (trip) {
      setFleetNumber(trip.fleetNumber || "");
      setFleetUnitId(trip.fleetUnitId !== undefined ? Number(trip.fleetUnitId) || "" : "");
      setClientName(trip.clientName || "");
      setDriverName(trip.driverName || "");
      setRoute(trip.route || "");
      setStartDate(trip.startDate || new Date().toISOString().split("T")[0]);
      setEndDate(trip.endDate || new Date().toISOString().split("T")[0]);
      setDescription(trip.description || "");
      setDistanceKm(trip.distanceKm || 0);
      setBaseRevenue(trip.baseRevenue || 0);
      setRevenueCurrency(trip.revenueCurrency || "ZAR");
      setClientType(trip.clientType || "external");
      setPlannedRoute(trip.plannedRoute ?? { origin: "", destination: "", waypoints: [] });
      setWaypoints(trip.plannedRoute?.waypoints || []);
    }
  }, [trip]);

  const handleAddWaypoint = () => {
    const trimmed = waypoint.trim();
    if (trimmed) {
      setWaypoints((prev) => [...prev, trimmed]);
      setWaypoint("");
    }
  };

  const handleRemoveWaypoint = (index: number) => {
    setWaypoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      fleetNumber,
      fleetUnitId: fleetUnitId === "" ? undefined : Number(fleetUnitId),
      clientName,
      driverName,
      route,
  startDate: startDate || "",
  endDate: endDate || "",
      description,
      distanceKm,
      baseRevenue,
      revenueCurrency,
      clientType,
      plannedRoute: { ...plannedRoute, waypoints },
      paymentStatus: trip?.paymentStatus ?? "unpaid",
      followUpHistory: trip?.followUpHistory ?? [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Fleet Number"
          value={fleetNumber}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const selected = e.target.value;
            setFleetNumber(selected);
            // No Wialon mapping; reset/leave fleetUnitId unset
            setFleetUnitId("");
          }}
          options={[
            { value: "", label: "Select fleet number..." },
            ...(FLEET_NUMBERS || []).map((fleet: string) => ({ value: fleet, label: fleet })),
          ]}
        />

        <Select
          label="Client"
          value={clientName}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setClientName(e.target.value)}
          options={(CLIENTS || []).map((client: string) => ({ value: client, label: client }))}
        />

        <Select
          label="Client Type"
          value={clientType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setClientType(e.target.value as "internal" | "external")
          }
          options={[
            { value: "external", label: "External" },
            { value: "internal", label: "Internal" },
          ]}
        />

        <Select
          label="Driver"
          value={driverName}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDriverName(e.target.value)}
          options={(DRIVERS || []).map((driver: string) => ({ value: driver, label: driver }))}
        />

        <Input
          label="Route Name"
          value={route}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoute(e.target.value)}
          placeholder="e.g., JHB to CPT"
        />

        <Input
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
        />

        <Input
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
        />

        <Input
          label="Distance (km)"
          type="number"
          value={distanceKm.toString()}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setDistanceKm(parseFloat(e.target.value) || 0)
          }
        />

        <Input
          label="Base Revenue"
          type="number"
          value={baseRevenue.toString()}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setBaseRevenue(parseFloat(e.target.value) || 0)
          }
        />

        <Select
          label="Currency"
          value={revenueCurrency}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setRevenueCurrency(e.target.value as "USD" | "ZAR")
          }
          options={[
            { value: "ZAR", label: "ZAR" },
            { value: "USD", label: "USD" },
          ]}
        />
      </div>

      <div>
        <h3 className="text-md font-medium">Route Planning</h3>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Origin"
            value={plannedRoute.origin}
            onChange={(e) => setPlannedRoute({ ...plannedRoute, origin: e.target.value })}
          />
          <Input
            label="Destination"
            value={plannedRoute.destination}
            onChange={(e) => setPlannedRoute({ ...plannedRoute, destination: e.target.value })}
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium mb-1">Waypoints</label>
          <div className="flex space-x-2">
            <Input
              label="Waypoint"
              value={waypoint}
              onChange={(e) => setWaypoint(e.target.value)}
              className="flex-1"
              placeholder="Add waypoint"
            />
            <Button type="button" onClick={handleAddWaypoint} variant="outline">
              Add
            </Button>
          </div>

          {waypoints.length > 0 && (
            <ul className="mt-2 space-y-1">
              {waypoints.map((wp, i) => (
                <li key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span>{wp}</span>
                  <Button type="button" onClick={() => handleRemoveWaypoint(i)} variant="outline">
                    &times;
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <TextArea
        label="Description / Notes"
        value={description}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
        placeholder="Additional details about this trip"
        rows={3}
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" onClick={onCancel} variant="outline" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
          {trip ? "Update Trip" : "Create Trip"}
        </Button>
      </div>
    </form>
  );
};

export default TripForm;
