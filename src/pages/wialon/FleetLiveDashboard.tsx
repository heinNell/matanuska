/*  src/pages/wialon/FleetLiveDashboard.tsx  */
import React, { useState } from "react";
import { useWialonUnitSensors } from "@/hooks/useWialonUnitSensors";   // ← actual file name
import { useWialonEvents } from "@/hooks/useWialonEvents";
import { FuelParameterUpdater } from "@/components/FuelParameterUpdater";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useWialonContext } from "@/context/WialonContext";

export const FleetLiveDashboard: React.FC = () => {
  const { units } = useWialonContext();

  /** Pick the first unit (if any) as default selection */
  const [selectedUnit, setSelectedUnit] = useState<number>(
    units?.[0]?.id ?? 0
  );

  /**
   * ▶ Hook call – now passes BOTH parameters:
   *    ① unitId
   *    ② sensorIds (empty object for now – pass real IDs when known)
   */
  const {
    fuel,
    speed,
    engineHours,
    ignition,
    loading: sensorLoading,
    error: sensorError,
  } = useWialonUnitSensors(selectedUnit, {});

  /** Live events (unchanged) */
  const now = Math.floor(Date.now() / 1000);
  const events = useWialonEvents(selectedUnit, "sensors", now - 86_400, now);

  /** User-specific prefs */
  const { prefs, savePrefs } = useUserPreferences("CURRENT_USER_ID");

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Fleet Live Dashboard</h1>

      {/* ---------- Unit selector ---------- */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Select Unit:</label>
        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(Number(e.target.value))}
          className="border p-2 rounded"
        >
          {units?.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* ---------- Top widgets ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Live sensor block */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Live Fuel Sensor Value</h2>
          {sensorLoading && <p className="text-sm text-gray-500">Loading…</p>}
          {sensorError && (
            <p className="text-sm text-red-600">Error: {sensorError}</p>
          )}
          {!sensorLoading && !sensorError && (
            <>
              <p className="text-xl">{fuel ?? "—"}</p>
              <p className="text-sm text-gray-500">
                Speed: {speed ?? "—"} km/h&nbsp;| Engine&nbsp;h:{" "}
                {engineHours ?? "—"}&nbsp;| Ignition:{" "}
                {ignition == null ? "—" : ignition ? "On" : "Off"}
              </p>
            </>
          )}
        </div>

        {/* Fuel parameter updater */}
        <FuelParameterUpdater itemId={selectedUnit} />

        {/* User prefs */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Preferences</h2>
          <button
            className="bg-slate-600 text-white px-3 py-1 rounded mb-2"
            onClick={() => savePrefs({ lastUnit: selectedUnit })}
          >
            Save Default Unit
          </button>
          <div className="text-sm">
            Current default unit:&nbsp;
            <span className="font-mono">{prefs?.lastUnit ?? "—"}</span>
          </div>
        </div>
      </div>

      {/* ---------- 24-hour events table ---------- */}
      <div className="mt-8 bg-white p-4 rounded shadow overflow-x-auto">
        <h2 className="font-semibold mb-2">Last 24 h Sensor Events</h2>
        {events.length === 0 ? (
          <p className="text-sm text-gray-500">No events found.</p>
        ) : (
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left">ID</th>
                <th className="px-2 py-1 text-left">Type</th>
                <th className="px-2 py-1 text-left">Value</th>
                <th className="px-2 py-1 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} className="odd:bg-gray-50">
                  <td className="px-2 py-1">{ev.id}</td>
                  <td className="px-2 py-1">{ev.type}</td>
                  <td className="px-2 py-1">
                    {typeof ev.value === "object"
                      ? JSON.stringify(ev.value)
                      : ev.value}
                  </td>
                  <td className="px-2 py-1">
                    {new Date(ev.time * 1000).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
