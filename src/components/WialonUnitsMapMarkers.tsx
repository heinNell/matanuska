import { FC, useEffect, useRef } from 'react';
import * as L from 'leaflet'; // Explicitly import Leaflet as a module

// This file assumes a parent component manages the Leaflet map instance
// and passes it down as a prop.

interface Position {
    lat: number;
    lng: number;
}

interface UnitData {
    id: number;
    name: string;
    position: Position;
    iconUrl: string;
    // Add other relevant data for the popup
}

interface WialonUnitsMapMarkersProps {
    units: UnitData[];
    map: L.Map | null;
}

const WialonUnitsMapMarkers: FC<WialonUnitsMapMarkersProps> = ({ units, map }) => {
    // Use a Map object to store markers, with number as the key
    const markersRef = useRef<Map<number, L.Marker>>(new Map());

    useEffect(() => {
        if (!map) return;

        // Cleanup function: remove all markers from the map
        return () => {
            markersRef.current.forEach(marker => map.removeLayer(marker));
            markersRef.current.clear();
        };
    }, [map]);

    useEffect(() => {
        if (!map || !units) return;

        const currentMarkers = markersRef.current;
        const newUnits = new Map<number, UnitData>();
        units.forEach(unit => newUnits.set(unit.id, unit));

        // Update existing markers and add new ones
        newUnits.forEach((unit, id) => {
            const { position, name, iconUrl } = unit;
            if (!position) return;

            let marker = currentMarkers.get(id);

            if (marker) {
                // Update existing marker position
                marker.setLatLng([position.lat, position.lng]);
                marker.setIcon(L.icon({ iconUrl, iconAnchor: [16, 16] }));
            } else {
                // Create a new marker and add it to the map
                marker = L.marker([position.lat, position.lng], {
                    icon: L.icon({ iconUrl, iconAnchor: [16, 16] })
                }).addTo(map);
                currentMarkers.set(id, marker);
            }

            // Update marker popup content
            marker.setPopupContent(`<b>${name}</b><br>Lat: ${position.lat.toFixed(4)}<br>Lng: ${position.lng.toFixed(4)}`);
        });

        // Remove markers that are no longer in the units list
        currentMarkers.forEach((marker, id) => {
            if (!newUnits.has(id)) {
                map.removeLayer(marker);
                currentMarkers.delete(id);
            }
        });

    }, [map, units]);

    // This component doesn't render anything to the DOM
    return null;
};

export default WialonUnitsMapMarkers;
