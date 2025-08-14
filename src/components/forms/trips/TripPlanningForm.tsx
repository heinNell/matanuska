import React, { useState } from "react";
import { Trip, DelayReason } from "../../../types";

interface TripPlanningFormProps {
  trip: Trip;
  onUpdate: (trip: Trip) => void;
  onAddDelay: (delay: Omit<DelayReason, "id">) => void;
}

const TripPlanningForm: React.FC<TripPlanningFormProps> = ({ trip, onUpdate, onAddDelay }) => {
  const [localTrip, setLocalTrip] = useState({ ...trip });
  const [delayModal, setDelayModal] = useState(false);
  const [delayType, setDelayType] = useState<DelayReason["delayType"] | "">("");
  const [delayDescription, setDelayDescription] = useState("");
  const [delayDuration, setDelayDuration] = useState<number>(0);
  const [delaySeverity, setDelaySeverity] = useState<DelayReason["severity"] | "">("");
  const [auditLog, setAuditLog] = useState(trip.editHistory || []);

  const handleChange = (field: keyof Trip, value: any) => {
    setLocalTrip((prev) => {
      const updated = { ...prev, [field]: value };
      setAuditLog((log) => [
        ...log,
        {
          id: `${prev.id}-${field}-${Date.now()}`,
          tripId: prev.id,
          editedBy: "CurrentUser", // Replace with user context
          editedAt: new Date().toISOString(),
          reason: `Changed ${field} to ${value}`,
          fieldChanged: field as string,
          oldValue: String((prev as any)[field] ?? ""),
          newValue: String(value),
          changeType: "update",
        },
      ]);
      onUpdate(updated);
      return updated;
    });
  };

  const addDelay = () => {
    if (!delayType || !delayDescription || !delaySeverity || !delayDuration) return;
    const delay: Omit<DelayReason, "id"> = {
      tripId: trip.id,
      delayType: delayType as DelayReason["delayType"],
      description: delayDescription,
      delayDuration,
      severity: delaySeverity as DelayReason["severity"],
      reportedAt: new Date().toISOString(),
      reportedBy: "CurrentUser",
    };
    onAddDelay(delay);
    setDelayModal(false);
    setDelayType("");
    setDelayDescription("");
    setDelayDuration(0);
    setDelaySeverity("");
  };

  const formatDate = (dt?: string) => (dt ? new Date(dt).toLocaleString() : "N/A");

  // Timeline points using real Trip fields
  const timeline = [
    {
      label: "Planned Departure",
      date: localTrip.plannedDepartureDateTime,
      actual: localTrip.actualDepartureDateTime,
    },
    {
      label: "Planned Arrival",
      date: localTrip.plannedArrivalDateTime,
      actual: localTrip.actualArrivalDateTime,
    },
    {
      label: "Planned Offload",
      date: localTrip.plannedOffloadDateTime,
      actual: localTrip.actualOffloadDateTime,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Trip Planning & Timeline</h2>
      <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 gap-4">
        <div>
          <label className="block font-semibold mb-1">Route</label>
          <input
            className="border rounded p-2 w-full"
            value={localTrip.route}
            onChange={(e) => handleChange("route", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Driver Name</label>
          <input
            className="border rounded p-2 w-full"
            value={localTrip.driverName}
            onChange={(e) => handleChange("driverName", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Fleet Number</label>
          <input
            className="border rounded p-2 w-full"
            value={localTrip.fleetNumber}
            onChange={(e) => handleChange("fleetNumber", e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold mb-1">Planned Departure</label>
            <input
              type="datetime-local"
              className="border rounded p-2 w-full"
              value={localTrip.plannedDepartureDateTime?.slice(0, 16) || ""}
              onChange={(e) => handleChange("plannedDepartureDateTime", e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Actual Departure</label>
            <input
              type="datetime-local"
              className="border rounded p-2 w-full"
              value={localTrip.actualDepartureDateTime?.slice(0, 16) || ""}
              onChange={(e) => handleChange("actualDepartureDateTime", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold mb-1">Planned Arrival</label>
            <input
              type="datetime-local"
              className="border rounded p-2 w-full"
              value={localTrip.plannedArrivalDateTime?.slice(0, 16) || ""}
              onChange={(e) => handleChange("plannedArrivalDateTime", e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Actual Arrival</label>
            <input
              type="datetime-local"
              className="border rounded p-2 w-full"
              value={localTrip.actualArrivalDateTime?.slice(0, 16) || ""}
              onChange={(e) => handleChange("actualArrivalDateTime", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold mb-1">Planned Offload</label>
            <input
              type="datetime-local"
              className="border rounded p-2 w-full"
              value={localTrip.plannedOffloadDateTime?.slice(0, 16) || ""}
              onChange={(e) => handleChange("plannedOffloadDateTime", e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Actual Offload</label>
            <input
              type="datetime-local"
              className="border rounded p-2 w-full"
              value={localTrip.actualOffloadDateTime?.slice(0, 16) || ""}
              onChange={(e) => handleChange("actualOffloadDateTime", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1">Status</label>
          <select
            className="border rounded p-2 w-full"
            value={localTrip.status}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="invoiced">Invoiced</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            className="border rounded p-2 w-full"
            value={localTrip.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={2}
          />
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={() => setDelayModal(true)}>
            Add Delay Reason
          </button>
        </div>
      </form>

      {/* Timeline Visualization */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Timeline</h3>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {timeline.map((point, i) => (
            <div key={i} className="flex flex-col items-center md:flex-row md:gap-2">
              <div className="text-center">
                <div className="font-medium">{point.label}</div>
                <div className="text-gray-700">{formatDate(point.date)}</div>
                {point.actual && (
                  <div className="text-green-700 text-xs">Actual: {formatDate(point.actual)}</div>
                )}
              </div>
              {i < timeline.length - 1 && (
                <div className="md:w-16 w-2 h-8 md:h-1 bg-gray-300 my-2 md:my-0 md:mx-2 rounded-full" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Delays Section */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Delays</h3>
        {localTrip.delayReasons && localTrip.delayReasons.length > 0 ? (
          <ul>
            {localTrip.delayReasons.map((d, i) => (
              <li key={d.id || i} className="mb-1">
                <b>{d.delayType}</b>: {d.description} ({d.delayDuration}h, {d.severity})
                <span className="text-gray-500"> ({formatDate(d.reportedAt)})</span>
                <span className="text-xs text-gray-400 ml-2">by {d.reportedBy}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-400">No delays recorded</div>
        )}
      </div>

      {/* Audit Log */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Audit Log</h3>
        {auditLog.length > 0 ? (
          <ul>
            {auditLog.map((entry, i) => (
              <li key={i} className="text-xs">
                [{formatDate(entry.editedAt)}] <b>{entry.editedBy}</b>: {entry.reason} (Field:{" "}
                {entry.fieldChanged}, {entry.oldValue} → {entry.newValue})
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-400">No changes logged</div>
        )}
      </div>

      {/* Add Delay Modal */}
      {delayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded shadow w-full max-w-lg">
            <h3 className="font-bold mb-3">Add Delay Reason</h3>
            <div>
              <label className="block mb-1 font-medium">Delay Type</label>
              <select
                className="border rounded p-2 w-full mb-2"
                value={delayType}
                onChange={(e) => setDelayType(e.target.value as DelayReason["delayType"])}
              >
                <option value="">Select Type</option>
                <option value="border_delays">Border Delays</option>
                <option value="breakdown">Breakdown</option>
                <option value="customer_not_ready">Customer Not Ready</option>
                <option value="paperwork_issues">Paperwork Issues</option>
                <option value="weather_conditions">Weather Conditions</option>
                <option value="traffic">Traffic</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <input
                className="border rounded p-2 w-full mb-2"
                value={delayDescription}
                onChange={(e) => setDelayDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Duration (hours)</label>
              <input
                type="number"
                className="border rounded p-2 w-full mb-2"
                value={delayDuration}
                onChange={(e) => setDelayDuration(Number(e.target.value))}
                min={0}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Severity</label>
              <select
                className="border rounded p-2 w-full mb-2"
                value={delaySeverity}
                onChange={(e) => setDelaySeverity(e.target.value as DelayReason["severity"])}
              >
                <option value="">Select Severity</option>
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="btn-primary" onClick={addDelay}>
                Add
              </button>
              <button className="btn-secondary" onClick={() => setDelayModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripPlanningForm;
