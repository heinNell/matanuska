import React from "react";
import { useTripSelection } from "../../context/TripSelectionContext";

const SelectedTripBanner: React.FC = () => {
  const { selectedTrip, clearSelectedTrip } = useTripSelection();
  if (!selectedTrip) return null;
  return (
    <div
      role="status"
      className="px-3 py-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 flex items-center justify-between"
    >
      <span>
        Viewing trip: <strong>{selectedTrip.fleetNumber}</strong> • {selectedTrip.clientName} •{" "}
        {selectedTrip.driverName}
      </span>
      <button
        className="text-blue-600 hover:underline"
        onClick={clearSelectedTrip}
        aria-label="Clear selected trip"
      >
        Clear
      </button>
    </div>
  );
};

export default React.memo(SelectedTripBanner);
