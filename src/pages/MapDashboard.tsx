import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { formatAddress, calculateDistance } from "../utils/mapUtils";
import { fetchVehicleData } from "../api/vehicleApi";

// --- TYPES ---
interface Vehicle {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  status: "active" | "inactive" | "maintenance";
  lastUpdate: string;
}

const DEFAULT_CENTER = { lat: 61.2181, lng: -149.9003 }; // Example: Anchorage, AK

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.75rem",
  minHeight: 400,
};

// --- MAIN COMPONENT ---
const MapDashboard: React.FC = () => {
  // State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Google Map state
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeInfoWindowId, setActiveInfoWindowId] = useState<string | null>(null);

  // Refs
  const refreshTimerRef = useRef<number | null>(null);

  // --- VEHICLE DATA LOADING ---
  const loadVehicleData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchVehicleData();
      setVehicles(data);
    } catch (error) {
      console.error("Error loading vehicle data:", error);
      setMapError("Error loading vehicle data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and polling
  useEffect(() => {
    loadVehicleData();
    refreshTimerRef.current = window.setInterval(loadVehicleData, 60000);
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [loadVehicleData]);

  // --- FILTER VEHICLES ---
  useEffect(() => {
    if (!searchQuery) {
      setFilteredVehicles(vehicles);
      return;
    }
    const query = searchQuery.toLowerCase();
    setFilteredVehicles(
      vehicles.filter((vehicle) => {
        if (vehicle.name.toLowerCase().includes(query)) return true;
        if (selectedVehicle) {
          const distance = calculateDistance(
            selectedVehicle.location.lat,
            selectedVehicle.location.lng,
            vehicle.location.lat,
            vehicle.location.lng
          );
          if (distance <= 10) return true;
        }
        if (vehicle.location) {
          const coordString = formatAddress(vehicle.location);
          if (coordString.toLowerCase().includes(query)) return true;
        }
        return false;
      })
    );
  }, [searchQuery, vehicles, selectedVehicle]);

  // --- MAP EVENT HANDLERS ---
  const handleMapLoad = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    setMapError(null);
  };

  const handleMapError = (error: Error) => {
    setMapError(error.message);
    console.error("Map error:", error);
  };

  // --- UI HELPERS ---
  const getVehicleStatusColor = (status: Vehicle["status"]): string => {
    switch (status) {
      case "active":
        return "#4CAF50"; // Green
      case "inactive":
        return "#9E9E9E"; // Gray
      case "maintenance":
        return "#FFC107"; // Amber
      default:
        return "#2196F3"; // Blue
    }
  };

  // --- RENDER ---
  return (
    <div className="map-dashboard-container flex h-screen">
      {/* SIDEBAR */}
      <div className="map-sidebar w-80 min-w-[280px] bg-white border-r flex flex-col">
        <div className="map-search p-4 border-b">
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input w-full mb-2 px-3 py-2 border rounded"
          />
          <button
            className="refresh-button w-full mb-2 py-2 bg-blue-600 text-white rounded"
            onClick={loadVehicleData}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh"}
          </button>
          <Link to="/wialon-dashboard" className="wialon-link block text-xs text-blue-700 underline hover:text-blue-900">
            Switch to Wialon Tracking
          </Link>
        </div>
        <div className="vehicle-list p-4 overflow-y-auto flex-1">
          <h3 className="font-semibold mb-2 text-gray-900">Vehicles ({filteredVehicles.length})</h3>
          {filteredVehicles.length === 0 && !isLoading && (
            <p className="no-results text-gray-400">No vehicles found</p>
          )}
          {isLoading ? (
            <p className="loading-message text-blue-500">Loading vehicles...</p>
          ) : (
            filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className={`vehicle-item flex items-center p-2 mb-1 rounded cursor-pointer transition ${
                  selectedVehicle?.id === vehicle.id ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setActiveInfoWindowId(vehicle.id);
                  if (map) {
                    map.panTo(vehicle.location);
                    map.setZoom(Math.max(map.getZoom() || 12, 13));
                  }
                }}
              >
                <span
                  className="status-indicator inline-block w-3 h-3 rounded-full mr-2"
                  style={{ background: getVehicleStatusColor(vehicle.status) }}
                  title={vehicle.status}
                />
                <div className="vehicle-details flex-1">
                  <h4 className="text-xs font-semibold mb-0">{vehicle.name}</h4>
                  <p className="text-xs text-gray-500">Last updated: {new Date(vehicle.lastUpdate).toLocaleTimeString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MAP AREA */}
      <div className="map-container flex-1 relative">
        {/* Map error handling */}
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white bg-opacity-90">
            <div className="p-6 border rounded bg-red-50 text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error loading map</h3>
              <p className="mb-4 text-red-800">{mapError}</p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          </div>
        )}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={selectedVehicle ? selectedVehicle.location : DEFAULT_CENTER}
          zoom={12}
          onLoad={handleMapLoad}
        >
          {filteredVehicles.map((vehicle) => (
            <Marker
              key={vehicle.id}
              position={vehicle.location}
              title={vehicle.name}
              icon={{
                path: window.google?.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: getVehicleStatusColor(vehicle.status),
                fillOpacity: 0.8,
                strokeWeight: 2,
                strokeColor: "#fff",
              }}
              onClick={() => {
                setSelectedVehicle(vehicle);
                setActiveInfoWindowId(vehicle.id);
              }}
              animation={window.google?.maps.Animation.DROP}
            >
              {activeInfoWindowId === vehicle.id && (
                <InfoWindow
                  position={vehicle.location}
                  onCloseClick={() => setActiveInfoWindowId(null)}
                >
                  <div className="text-xs">
                    <h3 className="font-semibold mb-1">{vehicle.name}</h3>
                    <p>
                      <strong>ID:</strong> {vehicle.id}
                    </p>
                    <p>
                      <strong>Status:</strong> {vehicle.status}
                    </p>
                    <p>
                      <strong>Last Update:</strong> {new Date(vehicle.lastUpdate).toLocaleString()}
                    </p>
                    <p>
                      <strong>Location:</strong> {vehicle.location.lat.toFixed(6)}, {vehicle.location.lng.toFixed(6)}
                    </p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
      </div>
    </div>
  );
};

export default MapDashboard;
