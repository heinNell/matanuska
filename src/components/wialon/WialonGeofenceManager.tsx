import useWialonGeofences from "../../hooks/useWialonGeofences";
import { useWialonResources } from "../../hooks/useWialonResources";
import { useWialonSdk } from "../../hooks/useWialonSdk";
import { useWialonSession } from "../../hooks/useWialonSession";
import React, { useState } from "react";
import { Circle, MapContainer, Polygon, Polyline, TileLayer, useMapEvents } from "react-leaflet";

import type { LatLngTuple } from "leaflet";
import type { WialonGeofence } from "../../types/wialon-types";

// Default map center (Johannesburg)
const center: LatLngTuple = [-26.2041, 28.0473];

/**
 * WialonGeofenceManager Component
 * Displays and manages geofences from Wialon resources
 */
export const WialonGeofenceManager: React.FC = () => {
  // SDK and session management
  const sdkReady = useWialonSdk();
  const { loggedIn, error: sessionError, session } = useWialonSession(sdkReady);
  const resources = useWialonResources(session, loggedIn);

  // Component state
  const [componentError, setComponentError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [localSelectedResourceId, setLocalSelectedResourceId] = useState<string | number | null>(null);

  // Geofence hook with enhanced error handling
  const {
    geofences,
    resources: resList,
    selectedResourceId,
    selectResource,
    isLoading,
    error: geofenceError
  } = useWialonGeofences(resources, localSelectedResourceId);

  // New geofence state
  const [newCircle, setNewCircle] = useState<{ lat: number; lng: number; radius: number } | null>(
    null
  );
  const [name, setName] = useState("");

  // Custom selectResource handler to update local state
  const handleSelectResource = (id: string | number) => {
    setLocalSelectedResourceId(id);
    selectResource(id);
  };

  // Aggregate errors from different sources
  const error = sessionError || geofenceError || componentError;

  // Map click handler for circle creation
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        try {
          if (!e || !e.latlng) return;

          const lat = typeof e.latlng.lat === 'number' ? e.latlng.lat : 0;
          const lng = typeof e.latlng.lng === 'number' ? e.latlng.lng : 0;

          setNewCircle({
            lat,
            lng,
            radius: 500 // Default radius
          });
        } catch (err) {
          console.error("Error handling map click:", err);
          setComponentError("Failed to capture map location");
        }
      },
    });
    return null;
  }

  /**
   * Creates a new geofence using Wialon API
   */
  const handleCreateGeofence = () => {
    // Clear previous errors
    setComponentError(null);
    setIsCreating(true);

    try {
      // Validate required inputs
      if (!selectedResourceId) {
        throw new Error("No resource selected");
      }

      if (!session) {
        throw new Error("No active Wialon session");
      }

      if (!newCircle) {
        throw new Error("No location selected on map");
      }

      if (!name || name.trim() === '') {
        throw new Error("Geofence name is required");
      }

      // Validate window.wialon is available
      if (!window.wialon || !window.wialon.core) {
        throw new Error("Wialon SDK not properly initialized");
      }

      // Get resource object
      const res = window.wialon.core.Session.getInstance().getItem(Number(selectedResourceId));

      // Validate resource object
      if (!res) {
        throw new Error(`Resource ${selectedResourceId} not found`);
      }

      // Validate createZone method exists
      if (typeof res.createZone !== 'function') {
        throw new Error("Selected resource doesn't support geofence creation");
      }

      // Create the zone with proper error handling
      res.createZone(
        {
          n: name.trim(),
          t: 3, // circle type
          f: 0, // flags
          w: newCircle.radius,
          c: 2566914048, // color
          p: [{ x: newCircle.lng, y: newCircle.lat, r: newCircle.radius }],
        },
        (code: number, data: any) => {
          try {
            setIsCreating(false);

            if (code !== 0) {
              // Get error text if available
              const errorText = window.wialon?.core?.Errors?.getErrorText ?
                window.wialon.core.Errors.getErrorText(code) :
                `Error code: ${code}`;

              setComponentError(`Failed to create geofence: ${errorText}`);
            } else {
              // Success case
              alert(`Geofence "${data?.n || 'Unknown'}" created successfully`);
              setNewCircle(null); // Reset selection
              setName(""); // Clear name field
            }
          } catch (err) {
            console.error("Error in createZone callback:", err);
            setComponentError("Error processing geofence creation response");
            setIsCreating(false);
          }
        }
      );
    } catch (err) {
      console.error("Error creating geofence:", err);
      setComponentError(`${err instanceof Error ? err.message : String(err)}`);
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Wialon Geofence Manager</h2>

      {/* Status indicators */}
      <div className="mb-4">
        <span className={`px-2 py-1 rounded text-sm ${sdkReady ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          SDK: {sdkReady ? 'Ready' : 'Loading...'}
        </span>
        <span className={`ml-2 px-2 py-1 rounded text-sm ${loggedIn ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          Session: {loggedIn ? 'Active' : 'Not logged in'}
        </span>
        {isLoading && (
          <span className="ml-2 px-2 py-1 rounded text-sm bg-blue-100 text-blue-700">
            Loading geofences...
          </span>
        )}
        {isCreating && (
          <span className="ml-2 px-2 py-1 rounded text-sm bg-blue-100 text-blue-700">
            Creating geofence...
          </span>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 rounded border border-red-300">
          {error}
        </div>
      )}

      {/* Resource selector */}
      <div className="mb-4">
        <label className="block mb-2">
          Resource:
          <select
            value={selectedResourceId ?? ""}
            onChange={(e) => handleSelectResource(Number(e.target.value))}
            className="ml-2 p-1 border rounded"
            disabled={!loggedIn || !Array.isArray(resList) || resList.length === 0}
          >
            <option value="">-- select resource --</option>
            {Array.isArray(resList) && resList.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name || `Resource ${r.id}`}
              </option>
            ))}
          </select>
        </label>
        {(!resList || resList.length === 0) && loggedIn && (
          <p className="text-sm text-yellow-600">No resources available. Make sure you have access to resources with geofence data.</p>
        )}
      </div>

      {/* Map display */}
      <div className="border rounded overflow-hidden">
        <MapContainer center={center} zoom={6} style={{ height: 400, width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://osm.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler />

          {/* Render existing geofences with safety checks */}
          {Array.isArray(geofences) && geofences.map((zone: WialonGeofence) => {
            // Validate zone before rendering
            if (!zone || typeof zone !== 'object') return null;

            try {
              // Circle type geofence
              if (zone.t === 3 && Array.isArray(zone.p) && zone.p.length > 0 &&
                  typeof zone.p[0]?.y === 'number' && typeof zone.p[0]?.x === 'number') {
                return (
                  <Circle
                    key={zone.id || Math.random().toString()}
                    center={[zone.p[0].y, zone.p[0].x]}
                    radius={zone.w || 0}
                    color="#FF0000"
                  />
                );
              }
              // Polygon type geofence
              else if (zone.t === 2 && Array.isArray(zone.p) && zone.p.length > 0) {
                return (
                  <Polygon
                    key={zone.id || Math.random().toString()}
                    positions={zone.p.filter(pt => typeof pt?.y === 'number' && typeof pt?.x === 'number')
                                    .map(pt => [pt.y, pt.x])}
                    color="#0000FF"
                  />
                );
              }
              // Polyline type geofence
              else if (Array.isArray(zone.p) && zone.p.length > 0) {
                return (
                  <Polyline
                    key={zone.id || Math.random().toString()}
                    positions={zone.p.filter(pt => typeof pt?.y === 'number' && typeof pt?.x === 'number')
                                    .map(pt => [pt.y, pt.x])}
                    color="#00FF00"
                  />
                );
              }
            } catch (err) {
              console.error(`Error rendering geofence ${zone.id}:`, err);
            }

            return null;
          })}

          {/* Show new circle being created */}
          {newCircle && (
            <Circle
              center={[newCircle.lat, newCircle.lng]}
              radius={newCircle.radius}
              pathOptions={{ color: "green", fillOpacity: 0.3 }}
            />
          )}
        </MapContainer>
      </div>

      {/* Geofence creation form */}
      <div className="mt-4 p-3 border rounded">
        <h3 className="text-lg font-medium mb-2">Create New Geofence</h3>
        <p className="text-sm text-gray-600 mb-2">Click on the map to place a geofence, then enter a name and save.</p>

        <div className="flex items-center space-x-2">
          <input
            placeholder="Geofence name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!newCircle || isCreating}
            className="p-2 border rounded flex-grow"
          />
          <button
            onClick={handleCreateGeofence}
            disabled={!newCircle || !name || !selectedResourceId || isCreating}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
          >
            {isCreating ? 'Creating...' : 'Save Geofence'}
          </button>
        </div>

        {newCircle && (
          <div className="mt-2 text-sm text-gray-600">
            Position: {newCircle.lat.toFixed(6)}, {newCircle.lng.toFixed(6)} |
            Radius: {newCircle.radius}m
          </div>
        )}
      </div>
    </div>
  );
};

// Provide both named and default exports
export default WialonGeofenceManager;
// This component manages Wialon geofences with defensive coding patterns to prevent property access errors
