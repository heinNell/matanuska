import { Button } from "@/components/ui/Button";
import React, { useState } from "react";

interface WialonMobileViewProps {
  mapRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  isLoggedIn: boolean;
  units: any[];
  trackingOrders: any[];
  onSelectUnit: (unitId: string) => void;
  selectedUnit: string;
}

/**
 * A mobile-friendly view for the Wialon tracking interface
 */
const WialonMobileView: React.FC<WialonMobileViewProps> = ({
  mapRef,
  isLoading,
  isLoggedIn,
  units,
  trackingOrders,
  onSelectUnit,
  selectedUnit,
}) => {
  const [showControls, setShowControls] = useState(false);

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" style={{ minHeight: "100%" }} />

        {/* Mobile Status Bar */}
        <div className="absolute top-0 left-0 right-0 bg-white bg-opacity-90 p-2 flex justify-between items-center shadow-md">
          <div>
            <h1 className="text-sm font-bold">Fleet Tracking</h1>
            {isLoading ? (
              <p className="text-xs text-blue-600">Loading data...</p>
            ) : isLoggedIn ? (
              <p className="text-xs text-green-600">Connected</p>
            ) : (
              <p className="text-xs text-red-600">Disconnected</p>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowControls(!showControls)}>
            {showControls ? "Hide Controls" : "Show Controls"}
          </Button>
        </div>
      </div>

      {/* Mobile Control Panel - Slides up from bottom */}
      {showControls && (
        <div className="bg-white shadow-lg border-t border-gray-200 p-3 max-h-[50vh] overflow-y-auto">
          <h2 className="text-base font-semibold mb-2">Units ({units.length})</h2>
          <div className="space-y-1 mb-4">
            {units.map((unit) => (
              <div
                key={unit.id}
                className={`p-2 rounded-md text-sm ${
                  unit.id === selectedUnit
                    ? "bg-blue-100 border-l-4 border-blue-500"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
                onClick={() => onSelectUnit(unit.id)}
              >
                <div className="font-medium">{unit.name}</div>
                <div className="flex items-center text-xs text-gray-600 space-x-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      unit.status === "active"
                        ? "bg-green-500"
                        : unit.status === "idle"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                    }`}
                  ></span>
                  <span>
                    {unit.status === "active"
                      ? "Active"
                      : unit.status === "idle"
                        ? "Idle"
                        : "Offline"}
                  </span>
                  {unit.position && <span>{Math.round(unit.position.s)} km/h</span>}
                </div>
              </div>
            ))}
            {units.length === 0 && <p className="text-sm text-gray-500">No units available</p>}
          </div>

          {trackingOrders.length > 0 && (
            <>
              <h2 className="text-base font-semibold mb-2">Active Orders</h2>
              <div className="space-y-2">
                {trackingOrders.map((order) => (
                  <div key={order.id} className="p-2 bg-gray-50 rounded-md text-sm">
                    <div className="font-medium">{order.orderId}</div>
                    <div className="text-xs text-gray-600">
                      Status: {order.status.replace("_", " ")}
                    </div>
                    {order.currentLocation && (
                      <div className="text-xs text-gray-600 mt-1">
                        Location: {order.currentLocation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default WialonMobileView;
