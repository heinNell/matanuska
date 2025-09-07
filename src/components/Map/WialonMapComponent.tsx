import React, { FC, useState, useEffect, useRef, useCallback } from 'react';
import "leaflet/dist/leaflet.css";

// Declare global types for external libraries (Wialon SDK, Leaflet, jQuery)
declare global {
  interface Window {
    L: any;
    wialon: any;
    $: any;
  }
}

// Data Interfaces
interface Resource {
  id: string;
  name: string;
}

interface Geofence {
  id: string;
  name: string;
  type: string;
}

interface Unit {
  id: string;
  name: string;
  uid: number;
  position?: {
    x: number;
    y: number;
    s: number; // speed
    t: number; // time
  };
  sensors: any[];
  status: "active" | "idle" | "offline";
  driver?: string;
}

interface TrackingOrder {
  id: string;
  orderId: string;
  status: "checking" | "in_transit" | "delivered";
  timeline: {
    checking: string;
    inTransit: string;
    delivered: string;
  };
  currentLocation?: string;
  destination?: string;
}

// Helper component for Unit List Item
const UnitListItem: FC<{ unit: Unit, onUnitClick: (unit: Unit) => void, isSelected: boolean }> = ({ unit, onUnitClick, isSelected }) => {
  return (
    <div
      className={`unit-item p-3 rounded-lg flex items-center justify-between shadow-sm hover:bg-gray-100 transition-colors cursor-pointer ${isSelected ? 'border-2 border-blue-500' : ''}`}
      onClick={() => onUnitClick(unit)}
    >
      <span className="unit-title font-medium text-gray-700">{unit.name}</span>
      <span className="unit-meta text-sm text-gray-500">ID: {unit.id}</span>
    </div>
  );
};

const WialonDashboard: FC = () => {
  // Wialon SDK Access Token
  const WIALON_TOKEN = "c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053";

  // State for data and UI
  const [resources, setResources] = useState<Resource[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [trackingOrders, setTrackingOrders] = useState<TrackingOrder[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedGeofenceId, setSelectedGeofenceId] = useState<string | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unitSensors, setUnitSensors] = useState<any[]>([]);

  // Refs for map instance and elements
  const mapRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const unitMarkers = useRef<any>({});
  const trackingPolylines = useRef<any>({});
  const geofenceLayer = useRef<any>(null);
  const unitEventIds = useRef<any>({});

  // Function to write log messages
  const msg = (text: string, type: "info" | "success" | "warning" | "danger" = "info") => {
    if (logRef.current) {
      const icon = { info: "ℹ️", success: "✅", warning: "⚠️", danger: "❌" }[type];
      logRef.current.innerHTML = `<p class="text-sm font-mono">${icon} ${text}</p>` + logRef.current.innerHTML;
    }
  };

  // Memoized callback for handling unit clicks
  const handleUnitClick = useCallback((unit: Unit) => {
    setSelectedUnitId(unit.id);
    loadUnitSensors(unit.id);
    if (unit.position && mapInstance.current) {
      mapInstance.current.flyTo([unit.position.y, unit.position.x], 13);
    }
  }, []);

  // Initialize the Leaflet map
  const initMap = () => {
    if (!mapRef.current || !window.L) return;
    mapInstance.current = window.L.map(mapRef.current).setView([-22.95764, 18.49041], 6);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance.current);
    msg("Map initialized successfully.", "success");
  };

  // Load Wialon resources and units
  const initResourcesAndUnits = () => {
    if (!window.wialon) return;
    const sess = window.wialon.core.Session.getInstance();
    const resFlags = window.wialon.item.Item.dataFlag.base | window.wialon.item.Resource.dataFlag.zones;
    const unitFlags = window.wialon.item.Item.dataFlag.base | window.wialon.item.Unit.dataFlag.lastMessage | window.wialon.item.Unit.dataFlag.sensors;

    sess.loadLibrary("resourceZones");
    sess.loadLibrary("itemIcon");
    sess.loadLibrary("unitSensors");

    sess.updateDataFlags(
      [
        { type: "type", data: "avl_resource", flags: resFlags, mode: 0 },
        { type: "type", data: "avl_unit", flags: unitFlags, mode: 0 },
      ],
      function (code: number) {
        if (code) {
          msg(`Error loading data: ${window.wialon.core.Errors.getErrorText(code)}`, "danger");
          return;
        }

        const resourcesData = sess.getItems("avl_resource");
        if (resourcesData && resourcesData.length) {
          const resourceList: Resource[] = resourcesData.map((r: any) => ({ id: r.getId(), name: r.getName() }));
          setResources(resourceList);
          setSelectedResourceId(resourceList[0]?.id || null);
          msg(`Successfully loaded ${resourceList.length} resources.`, "success");
        } else {
          msg("No resources found.", "warning");
        }

        const unitsData = sess.getItems("avl_unit");
        if (!unitsData || !unitsData.length) {
          msg("No units found.", "warning");
          return;
        }

        const unitsList: Unit[] = [];
        const bounds: any[] = [];
        for (const unit of unitsData) {
          const pos = unit.getPosition();
          const sensors = unit.getSensors() || [];
          const unitInfo: Unit = {
            id: unit.getId(),
            name: unit.getName(),
            uid: unit.getUid(),
            position: pos ? { x: pos.x, y: pos.y, s: pos.s || 0, t: pos.t || 0 } : undefined,
            sensors: sensors,
            status: pos ? (pos.s > 5 ? "active" : "idle") : "offline",
          };
          unitsList.push(unitInfo);

          if (pos && mapInstance.current) {
            const icon = window.L.icon({ iconUrl: unit.getIconUrl(24), iconAnchor: [12, 12] });
            const marker = window.L.marker({ lat: pos.y, lng: pos.x }, { icon: icon, title: unit.getName() }).addTo(mapInstance.current);
            unitMarkers.current[unit.getId()] = marker;
            bounds.push([pos.y, pos.x]);

            const eventId = unit.addListener("messageRegistered", (event: any) => {
              handleUnitUpdate(unit.getId(), event.getData());
            });
            unitEventIds.current[unit.getId()] = eventId;
          }
        }
        setUnits(unitsList);
        msg(`Successfully loaded and displayed ${unitsList.length} units on map.`, "success");

        if (bounds.length > 0 && mapInstance.current) {
          const group = new window.L.featureGroup(Object.values(unitMarkers.current));
          mapInstance.current.fitBounds(group.getBounds().pad(0.1));
        }
        generateMockTrackingOrders(unitsList);
      }
    );
  };

  const handleUnitUpdate = (unitId: string, data: any) => {
    if (!data.pos || !mapInstance.current) return;
    const marker = unitMarkers.current[unitId];
    if (marker) {
      const newPos = { lat: data.pos.y, lng: data.pos.x };
      marker.setLatLng(newPos);
      if (!trackingPolylines.current[unitId]) {
        trackingPolylines.current[unitId] = window.L.polyline([newPos], { color: "#3B82F6", weight: 3, opacity: 0.8 }).addTo(mapInstance.current);
      } else {
        trackingPolylines.current[unitId].addLatLng(newPos);
      }
      setUnits((prev) => prev.map((unit) =>
          unit.id === unitId ? {
              ...unit,
              position: { x: data.pos.x, y: data.pos.y, s: data.pos.s || 0, t: data.pos.t || 0 },
              status: (data.pos.s || 0) > 5 ? "active" : "idle",
            } : unit
        )
      );
      msg(`Unit ${unitId} position updated.`, "info");
    }
  };

  const generateMockTrackingOrders = (unitsList: Unit[]) => {
    const mockOrders: TrackingOrder[] = unitsList.slice(0, 3).map((unit, index) => ({
      id: `ORD${index + 1}`,
      orderId: `#AD345JK75${index + 8}`,
      status: index === 0 ? "in_transit" : index === 1 ? "checking" : "delivered",
      timeline: { checking: `${21 + index} Jan`, inTransit: index === 0 ? "Current" : `${22 + index} Jan`, delivered: index === 2 ? `${25 + index} Jan` : "---" },
      currentLocation: unit.position ? `${unit.position.y.toFixed(2)}, ${unit.position.x.toFixed(2)}` : "Unknown",
      destination: "Delivery Point",
    }));
    setTrackingOrders(mockOrders);
  };

  // Load geofences for a specific resource
  const loadGeofences = (resourceId: string) => {
    if (!window.wialon) return;
    const sess = window.wialon.core.Session.getInstance();
    const resource = sess.getItem(parseInt(resourceId, 10));
    if (!resource) {
      msg("Resource not found.", "danger");
      return;
    }

    const flags = window.wialon.item.Resource.dataFlag.zones;
    sess.updateDataFlags(
      [{ type: "id", data: resourceId, flags: flags, mode: 1 }],
      function (code: number) {
        if (code) {
          msg(`Error loading geofences: ${window.wialon.core.Errors.getErrorText(code)}`, "danger");
          return;
        }

        const zones = resource.getZones();
        if (!zones || !zones.length) {
          msg("No geofences found for this resource.", "warning");
          setGeofences([]);
          return;
        }
        const geofenceList: Geofence[] = zones.map((zone: any) => ({ id: zone.getId(), name: zone.getName(), type: zone.getType() }));
        setGeofences(geofenceList);
        msg(`Successfully loaded ${zones.length} geofences.`, "success");
      }
    );
  };

  // Display a geofence on the map
  const showGeofence = (geofenceId: string) => {
    if (!window.wialon || !selectedResourceId || !geofenceId || !mapInstance.current) return;
    const sess = window.wialon.core.Session.getInstance();
    const resource = sess.getItem(parseInt(selectedResourceId, 10));
    const geofence = resource.getZone(parseInt(geofenceId, 10));

    if (!geofence) {
      msg("Geofence not found.", "danger");
      return;
    }

    if (geofenceLayer.current) {
      mapInstance.current.removeLayer(geofenceLayer.current);
    }
    const points = geofence.getPoints();
    if (!points || !points.length) {
      msg("Geofence has no points.", "warning");
      return;
    }
    const latLngs = points.map((point: any) => [point.y, point.x]);
    geofenceLayer.current = window.L.polygon(latLngs, { color: "#10B981", fillColor: "#10B981", fillOpacity: 0.2, weight: 2 }).addTo(mapInstance.current);
    mapInstance.current.fitBounds(geofenceLayer.current.getBounds());
    msg(`Geofence "${geofence.getName()}" displayed on map.`, "success");
  };

  // Load sensors for a specific unit
  const loadUnitSensors = (unitId: string) => {
    if (!window.wialon) return;
    const sess = window.wialon.core.Session.getInstance();
    const unit = sess.getItem(parseInt(unitId, 10));
    if (!unit) {
      msg("Unit not found.", "danger");
      return;
    }
    const unitSensorsData = unit.getSensors();
    if (!unitSensorsData || !unitSensorsData.length) {
      msg("No sensors found for this unit.", "warning");
      setUnitSensors([]);
      return;
    }
    const sensorsWithValues = unitSensorsData.map((sensor: any) => {
      const lastMessage = unit.getLastMessage();
      let value = unit.calculateSensorValue(sensor, lastMessage);
      if (value === -348201.3876) value = "N/A";
      return { ...sensor, value: value, unit: sensor.m || "" };
    });
    setUnitSensors(sensorsWithValues);
    msg(`Successfully loaded ${sensorsWithValues.length} sensors.`, "success");
  };

  // Helper function to handle resource selection
  const handleSelectResource = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const resourceId = e.target.value;
    setSelectedResourceId(resourceId);
    if (resourceId) {
      loadGeofences(resourceId);
    }
  };

  // Helper function to handle geofence selection
  const handleSelectGeofence = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const geofenceId = e.target.value;
    setSelectedGeofenceId(geofenceId);
    if (geofenceId) {
      showGeofence(geofenceId);
    } else {
      if (geofenceLayer.current) {
        mapInstance.current.removeLayer(geofenceLayer.current);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "checking": return "bg-yellow-100 text-yellow-800";
      case "in_transit": return "bg-blue-100 text-blue-800";
      case "delivered": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Main effect to load dependencies and initialize
  useEffect(() => {
    const loadScript = (src: string) => new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(true); return; }
        const script = document.createElement("script"); script.src = src; script.onload = resolve; script.onerror = reject; document.head.appendChild(script);
      });
    const initializeWialon = async () => {
      try {
        msg("Starting Wialon initialization...", "info");
        setIsLoading(true);
        await Promise.all([
          loadScript("https://code.jquery.com/jquery-latest.min.js"),
          loadScript("https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.2/leaflet.js"),
        ]);
        await loadScript(`https://hst-api.wialon.com/wsdk/script/wialon.js?v=${Date.now()}`);

        msg("Dependencies loaded. Initializing Wialon session...", "info");
        window.wialon.core.Session.getInstance().initSession("https://hst-api.wialon.com");
        window.wialon.core.Session.getInstance().loginToken(WIALON_TOKEN, "", (code: number) => {
          if (code) {
            msg(`Login failed: ${window.wialon.core.Errors.getErrorText(code)}`, "danger");
            setIsLoading(false);
            return;
          }
          msg("Login successful!", "success");
          setIsLoggedIn(true);
          setIsLoading(false);
          initMap();
          initResourcesAndUnits();
        });
      } catch (error) {
        console.error("Failed to load Wialon dependencies:", error);
        msg("Failed to load map dependencies.", "danger");
        setIsLoading(false);
      }
    };
    initializeWialon();

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
      Object.entries(unitEventIds.current).forEach(([unitId, eventId]) => {
        const sess = window.wialon?.core?.Session?.getInstance();
        const unit = sess?.getItem(parseInt(unitId, 10));
        if (unit && eventId) {
          unit.removeListenerById(eventId);
        }
      });
    };
  }, []);

  // Effect to load geofences whenever a new resource is selected
  useEffect(() => {
    if (selectedResourceId) {
      loadGeofences(selectedResourceId);
    }
  }, [selectedResourceId]);

  // Placeholder for a detailed info panel for the selected unit
  const InfoPanel = () => {
    const selectedUnitDetail = units.find(unit => unit.id === selectedUnitId);
    if (!selectedUnitDetail) return null;
    return (
      <div id="info-panel" className="bg-white p-4 rounded-lg shadow-lg mt-4">
        <div id="panel-unit-name" className="text-lg font-bold text-gray-800">{selectedUnitDetail.name}</div>
        <div id="panel-unit-meta" className="text-sm text-gray-500">UID: {selectedUnitDetail.uid}</div>
        <div id="panel-details" className="mt-2 text-gray-600">
          <div className="font-semibold">Last Position:</div>
          <ul className="timeline list-disc list-inside mt-1">
            <li><b>Speed:</b> {selectedUnitDetail.position?.s.toFixed(1) || 0} km/h</li>
            <li>
              <b>Status: </b>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedUnitDetail.status)}`}>
                {selectedUnitDetail.status}
              </span>
            </li>
          </ul>
        </div>
        <div className="mt-4">
            <h4 className="font-semibold text-gray-800">Sensors</h4>
            <ul className="list-disc list-inside mt-1">
                {unitSensors.length > 0 ? (
                  unitSensors.map((sensor, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {sensor.n}: {sensor.value} {sensor.unit}
                    </li>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No sensor data available.</p>
                )}
            </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-row bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="md:w-96 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900">Wialon Live Dashboard</h1>
          {isLoading && <p className="text-sm text-blue-600">⏳ Loading...</p>}
          {!isLoading && isLoggedIn && <p className="text-sm text-green-600">✅ Connected to Wialon</p>}
          {!isLoading && !isLoggedIn && <p className="text-sm text-red-600">❌ Not connected</p>}
        </div>

        <div className="overflow-y-auto flex-grow p-4">
          {/* Section: Unit Status */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Vehicle Status</h3>
            <ul className="space-y-2">
              {units.length > 0 ? (
                units.map((unit) => (
                  <UnitListItem
                    key={unit.id}
                    unit={unit}
                    onUnitClick={handleUnitClick}
                    isSelected={selectedUnitId === unit.id}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">No units available.</p>
              )}
            </ul>
          </div>

          <hr className="my-4 border-gray-200" />

          {/* Section: Selected Unit Info Panel */}
          {selectedUnitId && <InfoPanel />}

          <hr className="my-4 border-gray-200" />

          {/* Section: Tracking Orders */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Tracking Orders</h3>
            <ul className="space-y-2">
              {trackingOrders.length > 0 ? (
                trackingOrders.map((order) => (
                  <li key={order.id} className="bg-gray-50 p-3 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-medium text-gray-700">{order.orderId}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>{order.status.replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm text-gray-500">Current Location: {order.currentLocation}</p>
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-500">No tracking orders available.</p>
              )}
            </ul>
          </div>

          <hr className="my-4 border-gray-200" />

          {/* Section: Geofence Management */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Geofences</h3>
            <div className="space-y-2">
              <select className="w-full p-2 border rounded-lg bg-gray-50" value={selectedResourceId || ""} onChange={handleSelectResource}>
                <option value="">-- Select Resource --</option>
                {resources.map((res) => (
                  <option key={res.id} value={res.id}>{res.name}</option>
                ))}
              </select>
              <select className="w-full p-2 border rounded-lg bg-gray-50" value={selectedGeofenceId || ""} onChange={handleSelectGeofence} disabled={!selectedResourceId}>
                <option value="">-- Select Geofence --</option>
                {geofences.map((geo) => (
                  <option key={geo.id} value={geo.id}>{geo.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content (Map and Log) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div ref={mapRef} className="flex-1 min-h-0 z-0" />
        {/* Log Panel */}
        <div className="bg-gray-900 text-gray-300 p-4 text-sm font-mono overflow-y-auto max-h-48 md:max-h-32 flex-shrink-0 z-10">
          <p className="text-white font-bold mb-1">Log:</p>
          <div ref={logRef} />
        </div>
      </div>
    </div>
  );
};

export default WialonDashboard;

