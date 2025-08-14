import { Globe2, Info, Map, RefreshCw, Satellite, Truck } from "lucide-react";
import React, { lazy, Suspense, useMemo, useState } from "react";

/**
 * Expected component locations (adjust if your paths differ):
 *  - "@/components/Map/FleetMapComponent"
 *  - "@/components/Map/WialonMapComponent"
 *  - "@/components/Map/MapsView"
 *
 * FleetMapComponent must support:
 *   onVehicleSelect?: (vehicleId: string, properties: any) => void
 */

const FleetMapComponent = lazy(() => import("@/components/Map/FleetMapComponent"));
const WialonMapComponent = lazy(() => import("@/components/Map/WialonMapComponent"));
const MapsView = lazy(() => import("@/components/Map/MapsView"));

type TabId = "fleet" | "wialonLive" | "wialonWeb";

type VehicleProps = {
  name?: string;
  brand?: string;
  model?: string;
  vehicleType?: string;
  year?: string;
  fuelType?: string;
  cargoType?: string;
  engineModel?: string;
  phone?: string;
};

const TabButton: React.FC<{
  id: TabId;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ id, active, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition",
      active
        ? "bg-blue-600 text-white shadow"
        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    ].join(" ")}
    aria-pressed={active}
    aria-controls={`panel-${id}`}
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

const MapsDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("fleet");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedVehicleProps, setSelectedVehicleProps] = useState<VehicleProps | null>(null);

  // Simple derived label for the info panel
  const vehicleHeader = useMemo(() => {
    if (!selectedVehicleProps?.name) return selectedVehicleId ?? "No vehicle selected";
    const year = selectedVehicleProps.year ? ` (${selectedVehicleProps.year})` : "";
    return `${selectedVehicleProps.name}${year}`;
  }, [selectedVehicleId, selectedVehicleProps]);

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[720px] flex-col bg-gray-50">
      {/* Page header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Map className="h-5 w-5 text-blue-600" />
          <h1 className="text-lg font-semibold text-gray-900">Maps & Tracking</h1>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://hosting.wialon.com/"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            title="Open Wialon (new tab)"
          >
            Open Wialon
          </a>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-screen-2xl items-center gap-2 px-4 py-2">
          <TabButton
            id="fleet"
            active={activeTab === "fleet"}
            onClick={() => setActiveTab("fleet")}
            icon={<Globe2 className="h-4 w-4" />}
            label="Fleet (Google Maps)"
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

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main map area */}
        <main className="flex-1 overflow-hidden">
          <div
            id={`panel-${activeTab}`}
            className="h-full w-full"
            role="region"
            aria-label="Map content"
          >
            <Suspense fallback={<Loading />}>
              {activeTab === "fleet" && (
                <div className="h-full w-full">
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
                </div>
              )}

              {activeTab === "wialonLive" && (
                <div className="h-full w-full overflow-auto">
                  {/* Note: WialonMapComponent internally uses full-height layout; we let it scroll if taller */}
                  <WialonMapComponent />
                </div>
              )}

              {activeTab === "wialonWeb" && (
                <div className="h-full w-full">
                  <MapsView />
                </div>
              )}
            </Suspense>
          </div>
        </main>

        {/* Right info panel (contextual; shows Fleet selection details) */}
        <aside className="hidden w-[320px] shrink-0 border-l border-gray-200 bg-white md:block">
          <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
            <Info className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">Vehicle Details</h2>
          </div>

          {activeTab !== "fleet" ? (
            <div className="px-4 py-6 text-sm text-gray-600">
              Switch to <span className="font-medium">Fleet (Google Maps)</span> and click a marker
              to view details here.
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
                    <dd className="font-medium text-gray-900">
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

export default MapsDashboardPage;
