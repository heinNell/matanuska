import React, { useEffect, useState } from "react";
import EnhancedMapComponent from "../components/Map/EnhancedMapComponent";
import { useFleetList } from "../hooks/useFleetList";
import { Location } from "../types/mapTypes";
import { useWialon } from "@/context/WialonProvider";

// Define GeoJSON interfaces


// type GeoJSONData = { ... }; // Remove or comment out if not used

interface FleetOption {
  value: string;
  label: string;
  registration: string;
}

/**
 * FleetLocationMapPage - A page that displays fleet locations on an enhanced map
 * with route drawing and location details
 */
const FleetLocationMapPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Location[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [showRoutes, setShowRoutes] = useState<boolean>(false);
  const { fleetOptions } = useFleetList() as { fleetOptions: FleetOption[] };

  // Wialon integration
  const { loggedIn, initializing, error, units, login, token } = useWialon();

  // On mount: auto-login to Wialon if not initializing/logged in
  useEffect(() => {
    if (!initializing && !loggedIn && token) {
      login(token);
    }
  }, [initializing, loggedIn, login, token]);

  // When Wialon units are available, use them for the map
  useEffect(() => {
    if (loggedIn && units && units.length > 0) {
      // Convert Wialon units to Location[]
      const wialonLocations = units.map((unit: any) => ({
        lat: unit.lat ?? 0,
        lng: unit.lon ?? 0,
        title: unit.name ?? unit.id,
        info: unit.id,
        customFields: unit,
      }));
      setVehicles(wialonLocations);
    }
  }, [loggedIn, units]);


  // Filter vehicles if a specific one is selected
  const displayedVehicles = selectedVehicle
    ? vehicles.filter((v: Location) => v.title?.includes(selectedVehicle))
    : vehicles;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-4">Fleet Location Map</h1>

        {/* Wialon status */}
        <div className="mb-4">
          {initializing && <span className="text-blue-600">Initializing Wialon session...</span>}
          {!initializing && error && (
            <span className="text-red-600">Wialon Error: {error.message}</span>
          )}
          {!initializing && !error && !loggedIn && (
            <span className="text-yellow-700">Not logged in to Wialon. <button className="ml-2 px-2 py-1 bg-blue-500 text-white rounded" onClick={() => login(token || undefined)}>Login</button></span>
          )}
        </div>

        {/* Controls */}
        <div className="mb-4 flex flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Select Vehicle:</label>
            <select
              value={selectedVehicle || ""}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedVehicle(e.target.value || null)
              }
              className="border rounded px-2 py-1"
            >
              <option value="">All Vehicles</option>
              {fleetOptions.map((fleet) => (
                <option key={fleet.value} value={fleet.value}>
                  {fleet.value} - {fleet.registration}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="show-routes"
              checked={showRoutes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowRoutes(e.target.checked)}
              className="rounded text-blue-500"
            />
            <label htmlFor="show-routes" className="text-sm font-medium">
              Show Routes
            </label>
          </div>
        </div>

        {/* Map component */}
        <EnhancedMapComponent
          locations={displayedVehicles}
          height="600px"
          showPlacesSearch={true}
          showRoutes={showRoutes}
          routeOptions={{
            strokeColor: "#3B82F6",
            mode: "driving",
            optimizeWaypoints: true,
          }}
          defaultIconType="vehicle"
          onLocationSelect={(location: Location) => {
            console.log("Selected vehicle:", location);
          }}
        />

        <div className="mt-6 text-sm text-gray-500">
          <p>
            This map shows the current location of fleet vehicles. Select a vehicle from the
            dropdown to focus on it.
          </p>
          <p>Enable "Show Routes" to visualize the path between multiple vehicles.</p>
        </div>
      </div>
    </div>
  );
};

export default FleetLocationMapPage;
