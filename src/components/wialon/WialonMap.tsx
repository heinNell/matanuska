import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useWialonContext } from "../../context/WialonContext";
import { ExtendedWialonUnit } from "../../hooks/useWialon";

// Fix for default marker icons in Leaflet with webpack/vite
// You'll need to add these icon files to your public folder
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

// Custom vehicle icon
const createVehicleIcon = (isSelected: boolean, iconUrl?: string) => {
  return L.divIcon({
    html: `
      <div class="vehicle-marker ${isSelected ? "selected" : ""}">
        <img src="${iconUrl || "/assets/car-icon.png"}" alt="Vehicle" />
      </div>
    `,
    className: "",
    iconSize: [32, 32],
  });
};

interface WialonMapProps {
  height?: string | number;
  width?: string | number;
  className?: string;
  center?: [number, number]; // Default center if no units
  zoom?: number;
}

const WialonMap: React.FC<WialonMapProps> = ({
  height = "500px",
  width = "100%",
  className = "",
  center = [0, 0], // Default center (will be overridden if units available)
  zoom = 12,
}) => {
  const { units, loading, error, selectedUnit, setSelectedUnit } = useWialonContext();
  const mapRef = useRef<L.Map | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);

  // Update map center when selected unit changes
  useEffect(() => {
    if (selectedUnit?.position && mapRef.current) {
      const newCenter: [number, number] = [
        selectedUnit.position.latitude,
        selectedUnit.position.longitude,
      ];
      setMapCenter(newCenter);
      mapRef.current.setView(newCenter, zoom);
    }
  }, [selectedUnit, zoom]);

  // Handle unit selection
  const handleUnitClick = (unit: ExtendedWialonUnit) => {
    setSelectedUnit(unit);
  };

  // Calculate initial map center based on available units
  useEffect(() => {
    if (units && units.length > 0) {
      // Try to find a unit with position
      const unitWithPosition = units.find((unit) => unit.position);

      if (unitWithPosition && unitWithPosition.position) {
        setMapCenter([unitWithPosition.position.latitude, unitWithPosition.position.longitude]);
      }
    }
  }, [units]);

  if (error) {
    return <div className="wialon-map-error">Error loading Wialon data: {error.message}</div>;
  }

  return (
    <div className={`wialon-map-container ${className}`} style={{ height, width }}>
      {loading && <div className="wialon-map-loading">Loading map data...</div>}

      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {units &&
          units.map((unit) => {
            if (!unit.position) return null;

            const isSelected = selectedUnit?.id === unit.id;
            const position: [number, number] = [unit.position.latitude, unit.position.longitude];

            return (
              <Marker
                key={unit.id}
                position={position}
                icon={createVehicleIcon(isSelected, unit.iconUrl)}
                eventHandlers={{
                  click: () => handleUnitClick(unit),
                }}
              >
                <Popup>
                  <div className="wialon-unit-popup">
                    <h3>{unit.name}</h3>
                    {unit.registration && <p>Registration: {unit.registration}</p>}
                    {unit.position && (
                      <>
                        <p>Speed: {unit.position.speed} km/h</p>
                        <p>
                          Last update: {new Date(unit.position.timestamp * 1000).toLocaleString()}
                        </p>
                      </>
                    )}
                    <button onClick={() => setSelectedUnit(unit)}>Select</button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      <style>{`
        .wialon-map-container {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .wialon-map-loading {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .wialon-map-error {
          padding: 20px;
          background-color: #fff0f0;
          border: 1px solid #ffcccc;
          border-radius: 8px;
          color: #d32f2f;
          text-align: center;
        }

        .vehicle-marker {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          transition: transform 0.2s ease;
        }

        .vehicle-marker.selected {
          transform: scale(1.2);
          z-index: 1000;
        }

        .vehicle-marker img {
          width: 100%;
          height: 100%;
        }

        .wialon-unit-popup h3 {
          margin: 0 0 10px;
          font-size: 16px;
        }

        .wialon-unit-popup p {
          margin: 5px 0;
          font-size: 14px;
        }

        .wialon-unit-popup button {
          margin-top: 10px;
          padding: 5px 10px;
          background-color: #1976d2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .wialon-unit-popup button:hover {
          background-color: #1565c0;
        }
      `}</style>
    </div>
  );
};

export default WialonMap;
