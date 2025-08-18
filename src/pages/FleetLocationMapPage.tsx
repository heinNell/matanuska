import React, { useEffect, useState } from "react";
import EnhancedMapComponent from "../components/Map/EnhancedMapComponent";
import { useFleetList } from "../hooks/useFleetList";
import { Location } from "../types/mapTypes";

// Define GeoJSON interfaces
interface GeoJSONPoint {
  type: string;
  coordinates: number[];
}

interface GeoJSONFeature {
  type: string;
  properties: {
    name: string;
    uid: string;
    brand: string | null;
    model: string | null;
    year: number | string | null;
    fuel_type: string | null;
    cargo_type?: string;
    effective_capacity?: string;
    sensors?: string;
    vehicle_class?: string;
  };
  geometry: GeoJSONPoint;
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

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

  // This would be replaced with real data from your fleet tracking system
  useEffect(() => {
    // Simulated vehicle location data - in a real app this would come from Firebase/Wialon
    const vehicleGeoJSON: GeoJSONData = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "21H - ADS 4865",
            uid: "352592576757652",
            brand: "Scania",
            model: "G460",
            year: 2010,
            fuel_type: "Diesel",
            cargo_type: "32 Ton",
            effective_capacity: "Unknown",
            sensors: "LHS Tank, RHS Tank",
          },
          geometry: {
            type: "Point",
            coordinates: [31.053, -17.829],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "28H - AFQ 1329 (Int Sim)",
            uid: "352592576816946",
            brand: "Shacman",
            model: "X3000",
            year: 2020,
            fuel_type: "Diesel",
            cargo_type: "32 Ton",
            effective_capacity: "600",
            sensors: "Small Tank, Big Tank",
          },
          geometry: {
            type: "Point",
            coordinates: [31.053, -17.829],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "22H - AGZ 3812 (ADS 4866)",
            uid: "864454077916934",
            brand: "Scania",
            model: "Unknown",
            year: "Unknown",
            fuel_type: "Diesel",
            cargo_type: "32 Ton",
            effective_capacity: "900",
            sensors: "Unknown",
          },
          geometry: {
            type: "Point",
            coordinates: [31.053, -17.829],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "23H - AFQ 1324 (Int Sim)",
            uid: "352592576285704",
            brand: "Shacman",
            model: "X3000",
            year: 2020,
            fuel_type: "Diesel",
            cargo_type: "29.5 Ton (reefer)",
            effective_capacity: "600",
            sensors: "Small Tank, Big Tank",
          },
          geometry: {
            type: "Point",
            coordinates: [31.053, -17.829],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "31H - AGZ 1963 (Int sim)",
            uid: "864454077925646",
            brand: "Teltonika",
            model: "FMC920",
            year: 2020,
            fuel_type: "Diesel",
            cargo_type: "Unknown",
            effective_capacity: "N/A",
            sensors: "RHS Tank, LHS Tank",
          },
          geometry: {
            type: "Point",
            coordinates: [31.053, -17.829],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "26H - AFQ 1327 (Int Sim)",
            uid: "357544376232183",
            brand: "Shacman",
            model: "X3000",
            year: 2020,
            fuel_type: "Diesel",
            cargo_type: "32 Ton",
            effective_capacity: "600",
            sensors: "Big Tank, Small Tank",
          },
          geometry: {
            type: "Point",
            coordinates: [31.053, -17.829],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "24H - AFQ 1325 (Int Sim)",
            uid: "352625693727222",
            brand: "Shacman",
            model: "X3000",
            year: 2020,
            fuel_type: "Diesel",
            cargo_type: "32 Ton",
            effective_capacity: "600",
            sensors: "Big Tank, Small Tank",
          },
          geometry: {
            type: "Point",
            coordinates: [31.053, -17.829],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "29H - AGJ 3466",
            uid: "864454076614506",
            vehicle_class: "empty_vehicle",
            brand: null,
            model: null,
            year: null,
            fuel_type: null,
            sensors: "Big Tank, Small Tank",
          },
          geometry: {
            type: "Point",
            coordinates: [31.053, -17.829],
          },
        },
      ],
    };

    // Convert GeoJSON features to Location objects
    const vehicleLocations: Location[] = vehicleGeoJSON.features
      .filter((feature) => {
        const coordinates = feature.geometry.coordinates;
        return typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number';
      })
      .map((feature) => {
        const [lng, lat] = feature.geometry.coordinates as [number, number];

        return {
          lat,
          lng,
          title: feature.properties.name,
          info: `${feature.properties.brand || ""} ${feature.properties.model || ""}`,
          customFields: {
            uid: feature.properties.uid,
            brand: feature.properties.brand || "",
            model: feature.properties.model || "",
            year: feature.properties.year?.toString() || "",
            fuel_type: feature.properties.fuel_type || "",
            ...(feature.properties.cargo_type && { cargo_type: feature.properties.cargo_type }),
            ...(feature.properties.effective_capacity && {
              effective_capacity: feature.properties.effective_capacity,
            }),
            ...(feature.properties.sensors && { sensors: feature.properties.sensors }),
          },
        };
      });    setVehicles(vehicleLocations);
  }, []);

  // Filter vehicles if a specific one is selected
  const displayedVehicles = selectedVehicle
    ? vehicles.filter((v: Location) => v.title?.includes(selectedVehicle))
    : vehicles;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-4">Fleet Location Map</h1>

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
