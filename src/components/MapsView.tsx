import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { CONFIG } from "../config";
import type { FleetItem } from "../services/wialonService";

type Props = {
  vehicles: FleetItem[];
  onMarkerClick?: (v: FleetItem) => void;
};

export default function MapView({ vehicles, onMarkerClick }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markers = useRef<Map<number, google.maps.Marker>>(new Map());

  // init map
  useEffect(() => {
    const loader = new Loader({ apiKey: CONFIG.GOOGLE_MAPS_API_KEY, libraries: ["places"] });
    loader.load().then(() => {
      if (!mapRef.current) return;
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: CONFIG.DEFAULT_CENTER,
        zoom: 11,
        styles: [
          { featureType: "all", elementType: "geometry", stylers: [{ color: "#1f2937" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
        ],
      });
    });
  }, []);

  // update markers on vehicles change
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const existing = markers.current;

    // remove missing
    for (const [id, marker] of existing.entries()) {
      if (!vehicles.some((v) => v.id === id && v.position)) {
        marker.setMap(null);
        existing.delete(id);
      }
    }

    // add/update
    for (const v of vehicles) {
      if (!v.position) continue;
      const iconColor =
        v.status === "active" ? "#10b981" : v.status === "idle" ? "#f59e0b" : "#ef4444";
      const icon: google.maps.Symbol = {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: iconColor,
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: iconColor,
        rotation: v.heading ?? 0,
      };

      const existingMarker = existing.get(v.id);
      if (existingMarker) {
        existingMarker.setPosition(v.position);
        existingMarker.setIcon(icon);
        existingMarker.setTitle(v.name);
      } else {
        const m = new google.maps.Marker({
          position: v.position,
          map,
          title: v.name,
          icon,
        });
        m.addListener("click", () => onMarkerClick?.(v));
        existing.set(v.id, m);
      }
    }
  }, [vehicles, onMarkerClick]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}
