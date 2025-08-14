import React, { useCallback, useEffect, useRef, useState } from "react";
import { getFleetGeoJson } from "../../utils/fleetGeoJson";
import GoogleMapComponent from "./GoogleMapComponent";

interface FleetMapProps {
  className?: string;
  style?: React.CSSProperties;
  centerOn?: string; // Vehicle ID to center on
  initialZoom?: number;
  initialCenter?: { lat: number; lng: number };
  onVehicleSelect?: (vehicleId: string, properties: any) => void;
}

/**
 * Fleet Map Component
 *
 * Displays vehicle fleet on Google Maps using GeoJSON data
 * Allows interaction with vehicles and displays vehicle information
 */
const FleetMapComponent: React.FC<FleetMapProps> = ({
  className = "",
  style = {},
  centerOn,
  initialZoom = 6,
  initialCenter = { lat: -22.5597, lng: 17.0832 }, // Default to Windhoek, Namibia
  onVehicleSelect,
}) => {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const geoJsonLayer = useRef<google.maps.Data | null>(null);

  // Load fleet data onto the map
  const loadFleetData = useCallback(() => {
    if (!mapInstance) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]);

    if (geoJsonLayer.current) {
      geoJsonLayer.current.setMap(null);
    }

    // Create info window if it doesn't exist
    if (!infoWindow) {
      setInfoWindow(new google.maps.InfoWindow());
    }

    // Get fleet GeoJSON data
    const fleetData = getFleetGeoJson();

    // Create new GeoJSON layer
    const layer = new google.maps.Data({
      map: mapInstance,
    });
    geoJsonLayer.current = layer;

    // Add GeoJSON features to the map
    layer.addGeoJson(fleetData);

    // Set marker styling based on vehicle properties
    layer.setStyle((feature) => {
      const vehicleType = feature.getProperty("vehicleType");

      let iconUrl = "https://maps.google.com/mapfiles/ms/icons/red-dot.png"; // Default

      // Choose icon based on vehicle type
      if (vehicleType === "heavy_truck") {
        iconUrl = "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
      } else if (vehicleType === "empty_vehicle") {
        iconUrl = "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
      }

      return {
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(32, 32),
        },
        title: feature.getProperty("name") as string | undefined,
      } as google.maps.Data.StyleOptions;
    });

    // Add click listeners to features
    layer.addListener("click", (event: google.maps.Data.MouseEvent) => {
      const feature = event.feature;
      const vehicleId = feature.getProperty("id") as string;
      const properties = {
        name: feature.getProperty("name") as string | undefined,
        brand: feature.getProperty("brand") as string | undefined,
        model: feature.getProperty("model") as string | undefined,
        vehicleType: feature.getProperty("vehicleType") as string | undefined,
        year: feature.getProperty("year") as string | undefined,
        fuelType: feature.getProperty("fuelType") as string | undefined,
        cargoType: feature.getProperty("cargoType") as string | undefined,
        engineModel: feature.getProperty("engineModel") as string | undefined,
        phone: feature.getProperty("phone") as string | undefined,
      };

      // Show info window with vehicle details
      if (infoWindow) {
        // Create responsive info window content
        const isMobile = window.innerWidth < 640;
        const fontSize = isMobile ? "14px" : "16px";
        const padding = isMobile ? "6px" : "8px";
        const detailFontSize = isMobile ? "12px" : "14px";
        const maxWidth = isMobile ? "200px" : "300px";

        const content = `
          <div style="padding: ${padding}; max-width: ${maxWidth};">
            <h3 style="margin: 0 0 ${padding} 0; font-size: ${fontSize};">${properties.name}</h3>
            <div style="font-size: ${detailFontSize};">
              ${
                properties.brand && properties.model
                  ? `<p style="margin: 2px 0;"><strong>Vehicle:</strong> ${properties.brand} ${properties.model} ${properties.year || ""}</p>`
                  : ""
              }
              ${
                properties.vehicleType
                  ? `<p style="margin: 2px 0;"><strong>Type:</strong> ${properties.vehicleType}</p>`
                  : ""
              }
              ${
                !isMobile && properties.engineModel
                  ? `<p style="margin: 2px 0;"><strong>Engine:</strong> ${properties.engineModel}</p>`
                  : ""
              }
              ${
                properties.fuelType
                  ? `<p style="margin: 2px 0;"><strong>Fuel:</strong> ${properties.fuelType}</p>`
                  : ""
              }
              ${
                !isMobile && properties.cargoType
                  ? `<p style="margin: 2px 0;"><strong>Cargo:</strong> ${properties.cargoType}</p>`
                  : ""
              }
              ${
                properties.phone
                  ? `<p style="margin: 2px 0;"><strong>Contact:</strong> ${properties.phone}</p>`
                  : ""
              }
            </div>
          </div>
        `;

        infoWindow.setContent(content);
        infoWindow.setPosition(event.latLng);
        infoWindow.open(mapInstance);
      }

      // Call callback if provided
      if (onVehicleSelect) {
        onVehicleSelect(vehicleId, properties);
      }
    });

    // If centerOn is provided, find and center on that vehicle
    if (centerOn && fleetData.features) {
      const vehicle = fleetData.features.find(
        (feature) => feature.properties && feature.properties.id === centerOn
      );

      if (vehicle && vehicle.geometry && vehicle.geometry.coordinates) {
        const [lng, lat] = vehicle.geometry.coordinates;
        mapInstance.setCenter({ lat, lng });
        mapInstance.setZoom(15); // Zoom in closer
      }
    }
  }, [mapInstance, markers, infoWindow, centerOn, onVehicleSelect]);

  // Load fleet data when map instance changes
  useEffect(() => {
    if (mapInstance) {
      loadFleetData();
    }
  }, [mapInstance, loadFleetData]);

  // Update when centerOn changes
  useEffect(() => {
    if (mapInstance && centerOn) {
      loadFleetData();
    }
  }, [centerOn, mapInstance, loadFleetData]);

  return (
    <GoogleMapComponent
      center={initialCenter}
      zoom={initialZoom}
      className={className}
      style={style}
      onMapLoad={(map) => setMapInstance(map)}
    />
  );
};

export default FleetMapComponent;
