import React from "react";

export interface FleetMapComponentProps {
  className?: string;
  style?: React.CSSProperties;
  initialZoom?: number;
  initialCenter?: { lat: number; lng: number };
  onVehicleSelect?: (vehicleId: string, props?: Record<string, any>) => void;
}

// Minimal placeholder implementation. Replace with real map logic.
const FleetMapComponent: React.FC<FleetMapComponentProps> = ({
  className,
  style,
  initialZoom = 5,
  initialCenter = { lat: 0, lng: 0 },
  onVehicleSelect,
}) => {
  return (
    <div
      className={className}
      style={{ position: "relative", background: "#eef2f5", ...style }}
      data-initial-zoom={initialZoom}
      data-initial-center={`${initialCenter.lat},${initialCenter.lng}`}
    >
      <div className="p-4 text-sm text-gray-600">FleetMap placeholder (zoom {initialZoom})</div>
      <button
        onClick={() =>
          onVehicleSelect?.("VEH-123", {
            name: "Demo Truck",
            brand: "BrandX",
            model: "ModelY",
            year: "2024",
          })
        }
        className="m-4 rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
      >
        Simulate Select Vehicle
      </button>
    </div>
  );
};

export default FleetMapComponent;
