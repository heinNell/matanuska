// src/components/Map/wialon/WialonDashboard.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import L from "leaflet";

// Wialon constants
const TOKEN = "c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053";
const WIALON_API_URL = "https://hst-api.wialon.com";
const WIALON_SDK_URL = "https://hst-api.wialon.com/wsdk/script/wialon.js";

// State holders outside component
let wialonInitialized = false;
let session: W.Session | null = null;
let units: WialonUnit[] = [];

// Logger
const log = (msg: string, error = false) =>
  error ? console.error(`[Wialon SDK] ${msg}`) : console.log(`[Wialon SDK] ${msg}`);

// Load SDK script
const wialonSdkLoadedPromise = new Promise<void>((resolve, reject) => {
  if (typeof window === "undefined") return resolve();
  if (window.wialon && window.W) return resolve();

  const script = document.createElement("script");
  script.src = WIALON_SDK_URL;
  script.async = true;
  script.onload = () => {
    const check = setInterval(() => {
      if (window.wialon && window.W) {
        clearInterval(check);
        resolve();
      }
    }, 100);
    setTimeout(() => {
      clearInterval(check);
      reject(new Error("Wialon SDK load timeout"));
    }, 10000);
  };
  script.onerror = () => reject(new Error("Failed to load Wialon SDK"));
  document.head.appendChild(script);
});

// Init Wialon
export async function initializeWialon(): Promise<boolean> {
  if (wialonInitialized) return true;
  try {
    await wialonSdkLoadedPromise;
    const W = window.wialon;
    session = W.core.Session.getInstance();
    session.initSession(WIALON_API_URL);

    const login = await new Promise<boolean>((res) => {
      session!.loginToken(TOKEN, "", (code: number) => {
        if (code) {
          log(`Login failed: ${W.core.Errors.getErrorText(code)}`, true);
          res(false);
        } else {
          res(true);
        }
      });
    });
    if (!login) return false;

    session.loadLibrary("itemIcon");

    const flags =
      W.item.Item.dataFlag.base |
      W.item.Unit.dataFlag.sensors |
      W.item.Unit.dataFlag.lastMessage |
      W.item.Unit.dataFlag.lastPosition;

    const updated = await new Promise<boolean>((res) => {
      session!.updateDataFlags([{ type: "type", data: "avl_unit", flags, mode: 0 }], (code: number) => {
        if (code) {
          log(`Update flags failed: ${W.core.Errors.getErrorText(code)}`, true);
          res(false);
        } else {
          units = session!.getItems("avl_unit") as WialonUnit[];
          res(true);
        }
      });
    });

    if (updated) wialonInitialized = true;
    return updated;
  } catch (e) {
    log(`Init error: ${String(e)}`, true);
    return false;
  }
}

// Get loaded units
export function getWialonUnits() {
  return units;
}

// Get details for one unit
export function getUnitDetails(unitId: number) {
  const unit = units.find((u) => u.getId() === unitId);
  if (!unit) return null;
  const pos = unit.getPosition();
  return {
    id: unitId,
    name: unit.getName(),
    iconUrl: unit.getIconUrl(32),
    position: pos
      ? {
          latitude: pos.y,
          longitude: pos.x,
          speed: pos.s,
          course: pos.c,
          timestamp: pos.t,
          satellites: pos.sc,
        }
      : null,
    uniqueId: unit.getUniqueId(),
    registration: unit.getCustomProperty("registration_plate"),
  };
}

const WialonDashboard: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const [unitsList, setUnitsList] = useState<WialonUnit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<number, L.Marker>>({});

  // Init SDK + fetch units
  const init = useCallback(async () => {
    const ok = await initializeWialon();
    setInitialized(ok);
    if (ok) setUnitsList(getWialonUnits());
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  // Init map
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([-26.21, 28.04], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }
  }, []);

  // Update markers when units change
  useEffect(() => {
    if (!mapRef.current || !initialized) return;

    unitsList.forEach((unit) => {
      const pos = unit.getPosition();
      if (!pos) return;
      const latLng: L.LatLngExpression = [pos.y, pos.x];
      const iconUrl = unit.getIconUrl(32);

      if (markersRef.current[unit.getId()]) {
        markersRef.current[unit.getId()].setLatLng(latLng);
      } else {
        const marker = L.marker(latLng, {
          icon: L.icon({
            iconUrl,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        });

        if (mapRef.current) {
          marker.addTo(mapRef.current);
        }

        marker.bindPopup(`<b>${unit.getName()}</b><br>Speed: ${pos.s} km/h`);
        marker.on("click", () => {
          setSelectedUnitId(unit.getId());
        });

        markersRef.current[unit.getId()] = marker;
      }
    });
  }, [unitsList, initialized]);

  return (
    <div className="flex">
      {/* Unit List */}
      <div className="w-1/3 p-4 overflow-y-auto h-screen bg-gray-50">
        <h2 className="text-xl font-bold mb-4">Fleet Units</h2>
        {!initialized && <p>Loading...</p>}
        {unitsList.map((u) => (
          <div
            key={u.getId()}
            className={`p-2 mb-2 rounded cursor-pointer ${
              selectedUnitId === u.getId() ? "bg-blue-100" : "bg-white"
            }`}
            onClick={() => {
              setSelectedUnitId(u.getId());
              const pos = u.getPosition();
              if (pos && mapRef.current) {
                mapRef.current.setView([pos.y, pos.x], 14);
                markersRef.current[u.getId()]?.openPopup();
              }
            }}
          >
            {u.getName()}
          </div>
        ))}
      </div>

      {/* Map */}
      <div id="map" className="w-2/3 h-screen" />
    </div>
  );
};

export default WialonDashboard;
