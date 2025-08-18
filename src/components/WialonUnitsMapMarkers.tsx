import React, { FC, useEffect, useRef, useState } from 'react';

// This file assumes a global 'map' object is available from a parent component
// and that Leaflet.js is loaded in the HTML.

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
    const markersRef = useRef<{ [key: number]: L.Marker }>({});

    useEffect(() => {
        if (!map) return;

        // Cleanup function
        return () => {
            Object.values(markersRef.current).forEach(marker => map.removeLayer(marker));
            markersRef.current = {};
        };
    }, [map]);

    useEffect(() => {
        if (!map || !units) return;

        const currentMarkers = markersRef.current;
        const newMarkers = {};

        units.forEach(unit => {
            const { id, position, name, iconUrl } = unit;

            if (!position) return;

            let marker = currentMarkers[id];

            if (marker) {
                // Update existing marker position
                marker.setLatLng([position.lat, position.lng]);
                marker.setIcon(L.icon({ iconUrl, iconAnchor: [16, 16] }));
            } else {
                // Create new marker
                marker = L.marker([position.lat, position.lng], {
                    icon: L.icon({ iconUrl, iconAnchor: [16, 16] })
                }).addTo(map);
            }

            // Update marker popup content
            marker.setPopupContent(`<b>${name}</b><br>Lat: ${position.lat}<br>Lng: ${position.lng}`);
            newMarkers[id] = marker;
        });

        // Remove markers that are no longer in the units list
        Object.keys(currentMarkers).forEach(id => {
            if (!newMarkers[id]) {
                map.removeLayer(currentMarkers[id]);
            }
        });

        markersRef.current = newMarkers;
    }, [map, units]);

    return null; // This component doesn't render any DOM elements itself
};

export default WialonUnitsMapMarkers;
