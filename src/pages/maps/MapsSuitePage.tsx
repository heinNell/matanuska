import { Globe2, Info, Map, RefreshCw, Route, Satellite, Truck } from "lucide-react";
import React, { lazy, Suspense, useMemo, useState } from "react";

/**
 * Component imports from actual paths in the project
 */
const FleetMapComponent = lazy(() => import("@/components/Map/FleetMapComponent"));
const EnhancedMapComponent = lazy(() => import("@/components/Map/EnhancedMapComponent"));
const WialonMapComponent = lazy(() => import("@/components/Map/WialonMapComponent"));
const WialonMobileView = lazy(() => import("@/components/Map/WialonMobileView"));
const MapsView = lazy(() => import("@/components/Map/MapsView"));

type TabId = "fleet" | "enhanced" | "wialonLive" | "wialonWeb";

interface VehicleProps {
  name?: string;
  brand?: string;
  model?: string;
  vehicleType?: string;
  year?: string;
  fuelType?: string;
  cargoType?: string;
  engineModel?: string;
  phone?: string;
}

const TabButton: React.FC<{
  id: TabId;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap",
      active
        ? "bg-blue-600 text-white shadow"
        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    ].join(" ")}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const Loading = () => (
  <div className="flex h-full min-h-[320px] items-center justify-center">
    <div className="flex items-center gap-3 text-gray-600">
      <RefreshCw className="h-5 w-5 animate-spin" />
      <span>Loading…</span>
    </div>
  </div>
);

const MapsSuitePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("fleet");

  // For Fleet tab (GeoJSON) — shows on right info panel
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedVehicleProps, setSelectedVehicleProps] = useState<VehicleProps | null>(null);

  const vehicleHeader = useMemo(() => {
    if (!selectedVehicleProps?.name) return selectedVehicleId ?? "No vehicle selected";
    const year = selectedVehicleProps.year ? ` (${selectedVehicleProps.year})` : "";
    return `${selectedVehicleProps.name}${year}`;
  }, [selectedVehicleId, selectedVehicleProps]);

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[500px] flex-col bg-gray-50">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-3 gap-2 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Map className="h-5 w-5 text-blue-600" />
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">Maps & Tracking</h1>
        </div>
        <div className="flex items-center">
          <a
            href="https://hosting.wialon.com/"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-gray-200 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
            title="Open Wialon (new tab)"
          >
            Open Wialon
          </a>
        </div>
      </header>

      {/* Tabs - Scrollable horizontally on mobile */}
      <div className="border-b border-gray-200 bg-white overflow-x-auto">
        <div className="mx-auto flex items-center gap-2 px-3 py-2 min-w-max sm:px-4">
          <TabButton
            id="fleet"
            active={activeTab === "fleet"}
            onClick={() => setActiveTab("fleet")}
            icon={<Globe2 className="h-4 w-4" />}
            label="Fleet (GeoJSON)"
          />
          <TabButton
            id="enhanced"
            active={activeTab === "enhanced"}
            onClick={() => setActiveTab("enhanced")}
            icon={<Route className="h-4 w-4" />}
            label="Enhanced (Routes + Places)"
          />
          <TabButton
            id="wialonLive"
            active={activeTab === "wialonLive"}
            onClick={() => setActiveTab("wialonLive")}
            icon={<Satellite className="h-4 w-4" />}
            label="Wialon Live (Leaflet)"
          />
          <TabButton
            id="wialonWeb"
            active={activeTab === "wialonWeb"}
            onClick={() => setActiveTab("wialonWeb")}
            icon={<Truck className="h-4 w-4" />}
            label="Wialon Web"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full w-full" role="region" aria-label="Map content">
            <Suspense fallback={<Loading />}>
              {activeTab === "fleet" && (
                <FleetMapComponent
                  className="h-full"
                  style={{ height: "100%" }}
                  initialZoom={6}
                  initialCenter={{ lat: -22.5597, lng: 17.0832 }}
                  onVehicleSelect={(vehicleId, props) => {
                    setSelectedVehicleId(vehicleId);
                    setSelectedVehicleProps(props ?? null);
                  }}
                />
              )}

              {activeTab === "enhanced" && (
                <div className="h-full w-full p-2 sm:p-3">
                  {/* Example defaults – tweak as needed */}
                  <EnhancedMapComponent
                    className="h-full"
                    width="100%"
                    height="calc(100vh - 12rem)" // Adjusted for mobile
                    center={{ lat: -25.7479, lng: 28.2293 }} // Pretoria
                    zoom={11}
                    showMapTypeControl={false}
                    showStreetViewControl={window.innerWidth > 640} // Hide on small screens
                    showZoomControl
                    showFullscreenControl
                    showPlacesSearch
                    showRoutes={false} // flip to true if you pass 2+ locations
                    defaultIconType="default"
                    onLocationSelect={(loc) => console.debug("Selected location", loc)}
                  />
                </div>
              )}

              {activeTab === "wialonLive" && (
                <>
                  {/* Show WialonMapComponent on desktop, hidden on mobile */}
                  <div className="hidden md:block h-full">
                    <WialonMapComponent />
                  </div>
                  {/* Show WialonMobileView on mobile, hidden on desktop */}
                  <div className="md:hidden h-full">
                    <Suspense
                      fallback={<div className="p-4 text-center">Loading mobile view...</div>}
                    >
                      <WialonMobileView
                        mapRef={React.useRef<HTMLDivElement>(null)}
                        isLoading={false}
                        isLoggedIn
                        units={[]}
                        trackingOrders={[]}
                        onSelectUnit={(unitId: string) => console.log("Selected unit", unitId)}
                        selectedUnit=""
                      />
                    </Suspense>
                  </div>
                </>
              )}

              {activeTab === "wialonWeb" && <MapsView />}
            </Suspense>
          </div>
        </main>

        {/* Bottom panel on mobile, right panel on desktop */}
        {activeTab === "fleet" && selectedVehicleId && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-10 max-h-[50vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-gray-900">Vehicle Details</h2>
              </div>
              <button
                onClick={() => setSelectedVehicleId(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-3 p-3 text-sm">
              <div>
                <div className="text-xs text-gray-500">Selected</div>
                <div className="font-medium text-gray-900">{vehicleHeader}</div>
                <div className="text-xs text-gray-500">ID: {selectedVehicleId}</div>
              </div>

              <dl className="grid grid-cols-1 gap-2">
                {selectedVehicleProps?.brand || selectedVehicleProps?.model ? (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Vehicle</dt>
                    <dd className="font-medium text-gray-900 text-right">
                      {selectedVehicleProps?.brand ?? ""} {selectedVehicleProps?.model ?? ""}
                      {selectedVehicleProps?.year ? ` (${selectedVehicleProps.year})` : ""}
                    </dd>
                  </div>
                ) : null}

                {selectedVehicleProps?.vehicleType ? (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Type</dt>
                    <dd className="font-medium text-gray-900">
                      {selectedVehicleProps.vehicleType}
                    </dd>
                  </div>
                ) : null}

                {selectedVehicleProps?.engineModel ? (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Engine</dt>
                    <dd className="font-medium text-gray-900">
                      {selectedVehicleProps.engineModel}
                    </dd>
                  </div>
                ) : null}

                {selectedVehicleProps?.fuelType ? (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Fuel</dt>
                    <dd className="font-medium text-gray-900">{selectedVehicleProps.fuelType}</dd>
                  </div>
                ) : null}

                {selectedVehicleProps?.cargoType ? (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Cargo</dt>
                    <dd className="font-medium text-gray-900">{selectedVehicleProps.cargoType}</dd>
                  </div>
                ) : null}

                {selectedVehicleProps?.phone ? (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Contact</dt>
                    <dd className="font-medium text-gray-900">{selectedVehicleProps.phone}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </div>
        )}

        {/* Right info panel – only meaningful for Fleet (GeoJSON), visible on desktop */}
        <aside className="hidden md:block w-[300px] lg:w-[320px] shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
          <div className="flex items-center gap-2 border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3">
            <Info className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">Vehicle Details</h2>
          </div>

          {activeTab !== "fleet" ? (
            <div className="px-4 py-6 text-sm text-gray-600">
              Switch to <span className="font-medium">Fleet (GeoJSON)</span> and click a marker to
              view details here.
            </div>
          ) : selectedVehicleId ? (
            <div className="space-y-4 p-4 text-sm">
              <div>
                <div className="text-xs text-gray-500">Selected</div>
                <div className="font-medium text-gray-900">{vehicleHeader}</div>
                <div className="text-xs text-gray-500">ID: {selectedVehicleId}</div>
              </div>

              <dl className="grid grid-cols-1 gap-2">
                {selectedVehicleProps?.brand || selectedVehicleProps?.model ? (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Vehicle</dt>
                    <dd className="font-medium text-gray-900 text-right">
                      {selectedVehicleProps?.brand ?? ""} {selectedVehicleProps?.model ?? ""}
                      {selectedVehicleProps?.year ? ` (${selectedVehicleProps.year})` : ""}
                    </dd>
                  </div>
                ) : null}

                {selectedVehicleProps?.vehicleType ? (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Type</dt>
                    <dd className="font-medium text-gray-900">
                      {selectedVehicleProps.vehicleType}
                    </dd>
                  </div>
                ) : null}

                {selectedVehicleProps?.engineModel ? (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Engine</dt>
                    <dd className="font-medium text-gray-900">
                      {selectedVehicleProps.engineModel}
                    </dd>
                  </div>
                ) : null}

                {selectedVehicleProps?.fuelType ? (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Fuel</dt>
                    <dd className="font-medium text-gray-900">{selectedVehicleProps.fuelType}</dd>
                  </div>
                ) : null}

                {selectedVehicleProps?.cargoType ? (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Cargo</dt>
                    <dd className="font-medium text-gray-900">{selectedVehicleProps.cargoType}</dd>
                  </div>
                ) : null}

                {selectedVehicleProps?.phone ? (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Contact</dt>
                    <dd className="font-medium text-gray-900">{selectedVehicleProps.phone}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          ) : (
            <div className="px-4 py-6 text-sm text-gray-600">
              Click a vehicle marker to see details.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default MapsSuitePage;
