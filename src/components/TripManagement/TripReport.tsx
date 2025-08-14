import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { DelayReason, Trip } from "../../types";

interface TripReportProps {
  trip: Trip;
  onAddDelay?: (delay: Omit<DelayReason, "id">) => void;
  onDrillDownDelay?: (delay: DelayReason) => void;
}

const TripReport: React.FC<TripReportProps> = ({ trip, onAddDelay, onDrillDownDelay }) => {
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [delayDescription, setDelayDescription] = useState("");
  const [delayDuration, setDelayDuration] = useState(0);
  const [delayType, setDelayType] = useState<DelayReason["delayType"] | "">("");
  const [delaySeverity, setDelaySeverity] = useState<DelayReason["severity"] | "">("");
  const [selectedDelay, setSelectedDelay] = useState<DelayReason | null>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    // @ts-expect-error: react-to-print uses 'content' as a valid option
    content: () => printRef.current,
    documentTitle: `Trip_Report_${trip.id}`,
  });

  const addDelay = () => {
    if (delayDescription.trim() && delayType && delaySeverity) {
      onAddDelay?.({
        tripId: trip.id,
        delayType: delayType as DelayReason["delayType"],
        description: delayDescription,
        delayDuration: delayDuration,
        severity: delaySeverity as DelayReason["severity"],
        reportedAt: new Date().toISOString(),
        reportedBy: "CurrentUser",
      });
      setDelayDescription("");
      setDelayDuration(0);
      setDelayType("");
      setDelaySeverity("");
      setShowDelayModal(false);
    }
  };

  const formatDate = (dt?: string) => (dt ? new Date(dt).toLocaleString() : "N/A");

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <button className="btn-primary" onClick={handlePrint}>
          Print / Export PDF
        </button>
        <button className="btn-secondary" onClick={() => setShowDelayModal(true)}>
          Add Delay Reason
        </button>
      </div>

      <div ref={printRef} className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-2">Trip Report: {trip.id}</h2>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div>
              <b>Route:</b> {trip.route}
            </div>
            <div>
              <b>Driver:</b> {trip.driverName}
            </div>
            <div>
              <b>Fleet Number:</b> {trip.fleetNumber}
            </div>
          </div>
          <div>
            <div>
              <b>Status:</b>{" "}
              <span
                className={
                  trip.status === "completed"
                    ? "text-green-600"
                    : trip.status === "active"
                      ? "text-yellow-600"
                      : "text-gray-500"
                }
              >
                {trip.status}
              </span>
            </div>
            <div>
              <b>Planned Arrival:</b> {formatDate(trip.plannedArrivalDateTime)}
            </div>
            <div>
              <b>Actual Arrival:</b> {formatDate(trip.actualArrivalDateTime)}
            </div>
            <div>
              <b>Planned Departure:</b> {formatDate(trip.plannedDepartureDateTime)}
            </div>
            <div>
              <b>Actual Departure:</b> {formatDate(trip.actualDepartureDateTime)}
            </div>
          </div>
        </div>

        {/* Timeline Visualization */}
        <Timeline trip={trip} />

        {/* Delays Section */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Delay Reasons</h3>
          {trip.delayReasons && trip.delayReasons.length > 0 ? (
            <ul>
              {trip.delayReasons.map((d, i) => (
                <li
                  key={d.id || i}
                  className="mb-1 hover:underline cursor-pointer"
                  onClick={() => {
                    setSelectedDelay(d);
                    onDrillDownDelay?.(d);
                  }}
                  title="Click for audit log"
                >
                  <b>{d.delayType.replace(/_/g, " ")}</b>: {d.description} ({d.severity},{" "}
                  {d.delayDuration}h)
                  <span className="text-gray-500"> ({formatDate(d.reportedAt)})</span>
                  <span className="text-xs text-gray-400 ml-2">by {d.reportedBy}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400">No delays recorded</div>
          )}
        </div>
      </div>

      {/* Add Delay Modal */}
      {showDelayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-30">
          <div className="bg-white p-5 rounded shadow w-full max-w-md">
            <h3 className="font-bold mb-3">Add Delay Reason</h3>
            <div>
              <label className="block mb-1 font-medium">Type</label>
              <input
                className="border rounded p-2 w-full mb-2"
                value={delayType}
                onChange={(e) => setDelayType(e.target.value as DelayReason["delayType"])}
                placeholder="e.g. border_delays, breakdown, etc."
              />
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
              <input
                className="border rounded p-2 w-full mb-2"
                value={delaySeverity}
                onChange={(e) => setDelaySeverity(e.target.value as DelayReason["severity"])}
                placeholder="minor, moderate, major, critical"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button className="btn-primary" onClick={addDelay}>
                Add
              </button>
              <button className="btn-secondary" onClick={() => setShowDelayModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drilldown Delay Modal */}
      {selectedDelay && (
        <DelayAuditModal delay={selectedDelay} onClose={() => setSelectedDelay(null)} />
      )}
    </div>
  );
};

// ---- Timeline Component ----

const Timeline: React.FC<{ trip: Trip }> = ({ trip }) => {
  const points = [
    {
      label: "Planned Arrival",
      date: trip.plannedArrivalDateTime,
      actual: trip.actualArrivalDateTime,
      status: "planned",
    },
    {
      label: "Planned Departure",
      date: trip.plannedDepartureDateTime,
      actual: trip.actualDepartureDateTime,
      status: "planned",
    },
  ];

  return (
    <div className="my-6">
      <h3 className="font-semibold mb-2">Trip Timeline</h3>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {points.map((pt, i) => (
          <div key={i} className="flex flex-col items-center md:flex-row md:gap-2">
            <div className="text-center">
              <div className="font-medium">{pt.label}</div>
              <div className="text-gray-700">
                {pt.date ? new Date(pt.date).toLocaleString() : "N/A"}
              </div>
              {pt.actual && (
                <div className="text-green-700 text-xs">
                  Actual: {pt.actual ? new Date(pt.actual).toLocaleString() : "N/A"}
                </div>
              )}
            </div>
            {i < points.length - 1 && (
              <div className="md:w-16 w-2 h-8 md:h-1 bg-gray-300 my-2 md:my-0 md:mx-2 rounded-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---- Delay Audit Modal ----

const DelayAuditModal: React.FC<{ delay: DelayReason; onClose: () => void }> = ({
  delay,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
      <div className="bg-white p-6 rounded shadow w-full max-w-lg">
        <h3 className="font-bold mb-2">Delay Details</h3>
        <div>
          <b>Type:</b> {delay.delayType.replace(/_/g, " ")}
        </div>
        <div>
          <b>Description:</b> {delay.description}
        </div>
        <div>
          <b>Duration:</b> {delay.delayDuration} hours
        </div>
        <div>
          <b>Severity:</b> {delay.severity}
        </div>
        <div>
          <b>Reported At:</b>{" "}
          {delay.reportedAt ? new Date(delay.reportedAt).toLocaleString() : "N/A"}
        </div>
        <div>
          <b>Reported By:</b> {delay.reportedBy}
        </div>
        {delay.resolutionNotes && (
          <div>
            <b>Resolution Notes:</b> {delay.resolutionNotes}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripReport;
