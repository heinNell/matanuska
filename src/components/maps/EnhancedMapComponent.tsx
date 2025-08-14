import React from "react";

export interface EnhancedMapComponentProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  center?: { lat: number; lng: number };
  zoom?: number;
  showMapTypeControl?: boolean;
  showStreetViewControl?: boolean;
  showZoomControl?: boolean;
  showFullscreenControl?: boolean;
  showPlacesSearch?: boolean;
  showRoutes?: boolean;
  defaultIconType?: string;
  onLocationSelect?: (loc: { lat: number; lng: number; label?: string }) => void;
}

const EnhancedMapComponent: React.FC<EnhancedMapComponentProps> = ({
  className,
  width = "100%",
  height = 400,
  center = { lat: 0, lng: 0 },
  zoom = 8,
  onLocationSelect,
}) => {
  return (
    <div
      className={className}
      style={{ width, height, background: "#f5f7fa", position: "relative" }}
      data-center={`${center.lat},${center.lng}`}
      data-zoom={zoom}
    >
      <div className="p-4 text-sm text-gray-600">Enhanced map placeholder (zoom {zoom})</div>
      <button
        onClick={() =>
          onLocationSelect?.({
            lat: center.lat + 0.01,
            lng: center.lng + 0.01,
            label: "Sample Point",
          })
        }
        className="m-4 rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
      >
        Simulate Location Select
      </button>
    </div>
  );
};

export default EnhancedMapComponent;
