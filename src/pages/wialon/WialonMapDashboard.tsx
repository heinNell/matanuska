import React, { useRef } from "react";

// Build Wialon direct URL from environment (token injected at build time)
const WIALON_TOKEN = (import.meta as any).env?.VITE_WIALON_TOKEN as string | undefined;
const WIALON_DIRECT_URL = WIALON_TOKEN
  ? `https://hosting.wialon.com/?token=${encodeURIComponent(WIALON_TOKEN)}&lang=en`
  : undefined;

// === FUNKSIE OM DIREK IN WIALON TE OPEN ===
function openWialonDashboard() {
  window.open(WIALON_DIRECT_URL, "_blank", "width=1200,height=800");
}

// === HOOF KOMPONENT ===
const WialonMapDashboard: React.FC = () => {
  // Jou ander state/effects soos voorheen...
  const mapRef = useRef<HTMLDivElement>(null);

  // Jy kan jou kaart/effects ens hierby voeg soos gewoonlik

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Title row */}
      <div className="flex justify-between items-center border-b p-4">
        <h1 className="text-xl font-bold">Wialon Map Dashboard</h1>
        {/* Die Wialon Dashboard knoppie */}
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ml-4 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={openWialonDashboard}
          disabled={!WIALON_DIRECT_URL}
          title={
            !WIALON_DIRECT_URL
              ? "WIALON token missing (set VITE_WIALON_TOKEN)"
              : "Open Wialon Dashboard"
          }
        >
          Open Wialon Dashboard
        </button>
      </div>

      {/* Ander dashboard inhoud */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-1/4 p-4 border-r">
          <p>Hier kom jou units, opsies, ens.</p>
          {!WIALON_DIRECT_URL && (
            <p className="mt-2 text-sm text-red-600">
              Geen Wialon token gevind nie. Stel VITE_WIALON_TOKEN in jou omgewing.
            </p>
          )}
        </div>
        {/* Map area */}
        <div ref={mapRef} className="flex-1 h-[calc(100vh-150px)]" />
      </div>
    </div>
  );
};

export default WialonMapDashboard;
