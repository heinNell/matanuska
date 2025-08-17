import useWialonGeofences from "../../hooks/useWialonGeofences";
import { useWialonResources } from "../../hooks/useWialonResources";
import { useWialonSdk } from "../../hooks/useWialonSdk";
import { useWialonSession } from "../../hooks/useWialonSession";
import React, { useState } from "react";
import { Circle, MapContainer, Polygon, Polyline, TileLayer, useMapEvents } from "react-leaflet";

import type { LatLngTuple } from "leaflet";
const center: LatLngTuple = [-26.2041, 28.0473]; // Johannesburg

export const WialonGeofenceManager: React.FC = () => {
  const sdkReady = useWialonSdk();
  const { loggedIn, error, session } = useWialonSession(sdkReady);
  const resources = useWialonResources(session, loggedIn);
  const {
    geofences,
    resources: resList,
    selectedResourceId,
    selectResource,
  } = useWialonGeofences(session as any, loggedIn);

  // New geofence state
  const [newCircle, setNewCircle] = useState<{ lat: number; lng: number; radius: number } | null>(
    null
  );
  const [name, setName] = useState("");

  // Map click for circle creation
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setNewCircle({ lat: e.latlng.lat, lng: e.latlng.lng, radius: 500 });
      },
    });
    return null;
  }

  const handleCreateGeofence = () => {
    if (!selectedResourceId || !session || !newCircle || !name) return;
    const res = session.getItem(selectedResourceId as number);
    res.createZone(
      {
        n: name,
        t: 3, // circle
        f: 0,
        w: newCircle.radius,
        c: 2566914048, // color
        p: [{ x: newCircle.lng, y: newCircle.lat, r: newCircle.radius }],
      },
      (code: number, data: any) => {
        if (code) alert(window.wialon.core.Errors.getErrorText(code));
        else alert(`Geofence "${data.n}" created`);
      }
    );
  };

  return (
    <div>
      <h2>Geofence Manager</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <label>
        Resource:{" "}
        <select
          value={selectedResourceId ?? ""}
          onChange={(e) => selectResource(Number(e.target.value))}
        >
          <option value="">-- select resource --</option>
          {resList.map((r: any) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </label>

      <MapContainer center={center} zoom={6} style={{ height: 400, width: "100%", marginTop: 16 }}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />
        {geofences.map((zone: any) =>
          zone.t === 3 && zone.p && zone.p.length > 0 ? (
            <Circle
              key={zone.id}
              center={[zone.p[0].y, zone.p[0].x]}
              radius={zone.w ?? 0}
              color="#FF0000"
            />
          ) : zone.t === 2 && zone.p ? (
            <Polygon
              key={zone.id}
              positions={zone.p.map((pt: any) => [pt.y, pt.x])}
              color="#0000FF"
            />
          ) : zone.p ? (
            <Polyline
              key={zone.id}
              positions={zone.p.map((pt: any) => [pt.y, pt.x])}
              color="#00FF00"
            />
          ) : null
        )}
        {newCircle && (
          <Circle
            center={[newCircle.lat, newCircle.lng]}
            radius={newCircle.radius}
            pathOptions={{ color: "green" }}
          />
        )}
      </MapContainer>
      <div>
        <input
          placeholder="Geofence name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!newCircle}
        />
        <button
          onClick={handleCreateGeofence}
          disabled={!newCircle || !name || !selectedResourceId}
        >
          Save Geofence
        </button>
      </div>
    </div>
  );
};

export default WialonGeofenceManager;
