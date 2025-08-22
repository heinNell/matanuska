import React, { useState, useEffect } from "react";
import { useWialonUnitSensors } from "../../hooks/useWialonUnitSensors";
import { useWialonEvents } from "../../hooks/useWialonEvents";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { useWialonContext } from "../../context/WialonContext";
import { FuelParameterUpdater } from "../../components/FuelParameterUpdater";

export const FleetLiveDashboard: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<number>(0);

  const { units, loading: isLoading, error: wialonError } = useWialonContext();

  const { prefs, savePrefs } = useUserPreferences("current-user");

  /**
   * Sensor data for selectedUnit
   * Pass:
   *     ① unitId
   *     ② sensorIds (empty object for now – pass real IDs when known)
   */
  const {
    fuel,
    speed,
    engineHours,
    ignition,
    loading: sensorLoading,
    error: sensorError,
  } = useWialonUnitSensors(selectedUnit, {});

  /** Live events */
  const now = Math.floor(Date.now() / 1000);
  const events = useWialonEvents(selectedUnit, "sensors", now - 86_400, now);

  useEffect(() => {
    if (prefs?.lastSelectedUnit && !selectedUnit) {
      setSelectedUnit(prefs.lastSelectedUnit);
    }
  }, [prefs, selectedUnit]);

  /** Save selected unit to user prefs */
  const handleUnitSelect = (unitId: number) => {
    setSelectedUnit(unitId);
    if (savePrefs) {
      savePrefs({ ...prefs, lastSelectedUnit: unitId });
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading Wialon units...</div>;
  }

  if (wialonError) {
    return <div className="p-8 text-red-600">Error: {wialonError instanceof Error ? wialonError.message : String(wialonError)}</div>;
  }

  if (!units || units.length === 0) {
    return <div className="p-8">No units available</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Fleet Live Dashboard</h1>

      {/* Unit selector */}
      <div className="mb-6">
        <label className="block mb-2">Select Vehicle:</label>
        <select
          value={selectedUnit || ""}
          onChange={(e) => handleUnitSelect(Number(e.target.value))}
          className="border p-2 rounded"
        >
          <option value="">Choose unit...</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} (ID: {u.id})
            </option>
          ))}
        </select>
      </div>

      {/* Show errors if any */}
      {sensorError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded">
          Sensor error: {sensorError instanceof Error ? sensorError.message : String(sensorError)}
        </div>
      )}

      {/* Live sensor data */}
      {selectedUnit && (
        <div className="mb-6 p-4 bg-blue-50 border rounded">
          <h2 className="font-semibold mb-2">Live Data</h2>
          {sensorLoading ? (
            <p>Loading sensors...</p>
          ) : (
            <p>
              Fuel: {fuel?.toString() ?? "—"}% | Ignition: {ignition ? "ON" : "OFF"} |{" "}
              Speed: {speed ?? "—"} km/h | Engine h: {engineHours ?? "—"}
            </p>
          )}
        </div>
      )}

      {/* Fuel Parameter Updater */}
      {selectedUnit && (
        <div className="mb-6">
          <FuelParameterUpdater
            itemId={selectedUnit}
          />
        </div>
      )}

      {/* 24-hour events table */}
      {selectedUnit && events && events.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Recent Events (24h)</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">Time</th>
                  <th className="border px-2 py-1 text-left">Event</th>
                  <th className="border px-2 py-1 text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 20).map((event, index) => (
                  <tr key={event.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border px-2 py-1">
                      {event.time.toLocaleString()}
                    </td>
                    <td className="border px-2 py-1">{event.type || "—"}</td>
                    <td className="border px-2 py-1">
                      {typeof event.value === 'string' ? event.value : JSON.stringify(event.value) || "No description"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedUnit && (!events || events.length === 0) && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <p>No events found for the last 24 hours.</p>
        </div>
      )}
    </div>
  );
};
