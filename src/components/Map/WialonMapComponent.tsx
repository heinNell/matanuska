import React, { useEffect, useRef, useState } from "react";

// Import augmentation types
/// <reference path="../../types/wialon-sdk-augment.d.ts" />

// Using module augmentation instead of global redeclaration
// to avoid the "Subsequent property declarations must have the same type" error
declare global {
  interface Window {
    // Skip declaring wialon to avoid type conflicts with existing declaration
    L: any;
    $: any;
  }
}

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

/* eslint-disable @typescript-eslint/no-unused-vars */
const WialonMapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const unitMarkers = useRef<any>({});
  const trackingPolylines = useRef<any>({});
  const geofenceLayer = useRef<any>(null);

  // These state variables would be used in a fully implemented component
  const [_resources, setResources] = useState<Resource[]>([]);
  const [_geofences, setGeofences] = useState<Geofence[]>([]);
  const [_units, setUnits] = useState<Unit[]>([]);
  const [selectedResource, _setSelectedResource] = useState<string>("");
  const [_selectedUnit, _setSelectedUnit] = useState<string>("");
  const [_selectedGeofence, _setSelectedGeofence] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [_trackingOrders, setTrackingOrders] = useState<TrackingOrder[]>([]);
  const [_sensors, setSensors] = useState<any[]>([]);
  const [unitEventIds, setUnitEventIds] = useState<any>({});

  // Token for immediate activation
  const WIALON_TOKEN = "c1099bc37c906fd0832d8e783b60ae0d0FFC3299205409AD690223C11B631D38FD0FE04A";

  const msg = (text: string) => {
    if (logRef.current) {
      logRef.current.innerHTML = text + "<br/>" + logRef.current.innerHTML;
    }
  };

  const initMap = () => {
    if (!mapRef.current || !window.L) return;

    // Create map centered on South Africa/Namibia region
    mapInstance.current = window.L.map(mapRef.current).setView([-22.95764, 18.49041], 6);

    // Add OpenStreetMap tile layer
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance.current);

    msg("✅ Map initialized successfully");
  };

  const initResources = () => {
    if (!window.wialon) return;

    const sess = window.wialon.core.Session.getInstance();
    const flags =
      window.wialon.item.Item.dataFlag.base |
      // @ts-expect-error: Wialon SDK typing issue
      window.wialon.item.Resource.dataFlag.zones;
    sess.loadLibrary("resourceZones");
    sess.updateDataFlags(
      [{ type: "type", data: "avl_resource", flags: flags, mode: 0 }],
      function (code: number) {
        if (code) {
          msg(`❌ Error loading resources: ${window.wialon.core.Errors.getErrorText(code)}`);
          return;
        }

        const res = sess.getItems("avl_resource");
        if (!res || !res.length) {
          msg("⚠️ No resources found");
          return;
        }

        const resourceList: Resource[] = [];
        for (let i = 0; i < res.length; i++) {
          resourceList.push({
            id: res[i].getId(),
            name: res[i].getName(),
          });
        }
        setResources(resourceList);
        msg(`✅ ${resourceList.length} resources loaded successfully`);
      }
    );
  };

  const initUnits = () => {
    if (!window.wialon) return;

    const sess = window.wialon.core.Session.getInstance();
    const flags =
      window.wialon.item.Item.dataFlag.base |
      window.wialon.item.Unit.dataFlag.lastMessage |
      window.wialon.item.Unit.dataFlag.sensors;

    sess.loadLibrary("itemIcon");
    sess.loadLibrary("unitSensors");
    sess.updateDataFlags(
      [{ type: "type", data: "avl_unit", flags: flags, mode: 0 }],
      function (code: number) {
        if (code) {
          msg(`❌ Error loading units: ${window.wialon.core.Errors.getErrorText(code)}`);
          return;
        }

        const unitsData = sess.getItems("avl_unit");
        if (!unitsData || !unitsData.length) {
          msg("⚠️ No units found");
          return;
        }

        const unitsList: Unit[] = [];
        const bounds: any[] = [];

        for (let i = 0; i < unitsData.length; i++) {
          const unit = unitsData[i];
          const pos = unit.getPosition();
          const sensors = unit.getSensors() || [];

          const unitInfo: Unit = {
            id: unit.getId(),
            name: unit.getName(),
            position: pos
              ? {
                  x: pos.x,
                  y: pos.y,
                  s: pos.s || 0,
                  t: pos.t || 0,
                }
              : undefined,
            sensors: sensors,
            status: pos ? (pos.s > 5 ? "active" : "idle") : "offline",
          };

          unitsList.push(unitInfo);

          if (pos && mapInstance.current) {
            const icon = window.L.icon({
              iconUrl: unit.getIconUrl(24),
              iconAnchor: [12, 12],
            });

            const marker = window.L.marker({ lat: pos.y, lng: pos.x }, { icon: icon })
              .bindPopup(
                `
                <div class="p-2">
                  <strong>${unit.getName()}</strong><br/>
                  <div class="text-sm">
                    Position: ${pos.x.toFixed(4)}, ${pos.y.toFixed(4)}<br/>
                    Speed: ${pos.s || 0} km/h<br/>
                    Sensors: ${sensors.length}<br/>
                    Status: ${unitInfo.status}
                  </div>
                </div>
              `
              )
              .addTo(mapInstance.current);

            unitMarkers.current[unit.getId()] = marker;
            bounds.push([pos.y, pos.x]);

            // Set up real-time tracking
            const eventId = unit.addListener("messageRegistered", (event: any) => {
              handleUnitUpdate(unit.getId(), event.getData());
            });

            setUnitEventIds((prev: Record<string, number>) => ({
              ...prev,
              [unit.getId()]: eventId,
            }));
          }
        }

        setUnits(unitsList);

        // Fit map to show all units
        if (bounds.length > 0 && mapInstance.current) {
          const group = new window.L.featureGroup(Object.values(unitMarkers.current));
          mapInstance.current.fitBounds(group.getBounds().pad(0.1));
        }

        msg(`✅ ${unitsList.length} units loaded and displayed on map`);

        // Generate mock tracking orders
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

      // Update or create polyline for tracking
      if (!trackingPolylines.current[unitId]) {
        trackingPolylines.current[unitId] = window.L.polyline([newPos], {
          color: "#3B82F6",
          weight: 3,
          opacity: 0.8,
        }).addTo(mapInstance.current);
      } else {
        trackingPolylines.current[unitId].addLatLng(newPos);
      }

      // Update unit data
      setUnits((prev) =>
        prev.map((unit) =>
          unit.id === unitId
            ? {
                ...unit,
                position: {
                  x: data.pos.x,
                  y: data.pos.y,
                  s: data.pos.s || 0,
                  t: data.pos.t || 0,
                },
                status: (data.pos.s || 0) > 5 ? "active" : "idle",
              }
            : unit
        )
      );

      msg(
        `📍 Unit ${unitId} position updated: ${data.pos.x.toFixed(4)}, ${data.pos.y.toFixed(4)} - Speed: ${data.pos.s || 0} km/h`
      );
    }
  };

  const generateMockTrackingOrders = (unitsList: Unit[]) => {
    const mockOrders: TrackingOrder[] = unitsList.slice(0, 3).map((unit, index) => ({
      id: `ORD${index + 1}`,
      orderId: `#AD345JK75${index + 8}`,
      status: index === 0 ? "in_transit" : index === 1 ? "checking" : "delivered",
      timeline: {
        checking: `${21 + index} Jan`,
        inTransit: index === 0 ? "Current" : `${22 + index} Jan`,
        delivered: index === 2 ? `${25 + index} Jan` : "---",
      },
      currentLocation: unit.position
        ? `${unit.position.y.toFixed(2)}, ${unit.position.x.toFixed(2)}`
        : "Unknown",
      destination: "Delivery Point",
    }));

    setTrackingOrders(mockOrders);
  };

  const loadGeofences = (resourceId: string) => {
    if (!window.wialon || !resourceId) return;

    const sess = window.wialon.core.Session.getInstance();
    const resource = sess.getItem(parseInt(resourceId, 10));

    if (!resource) {
      msg("❌ Resource not found");
      return;
    }

    // @ts-expect-error: Wialon SDK typing issue
    const flags = window.wialon.item.Resource.dataFlag.zones;

    sess.updateDataFlags(
      [{ type: "id", data: resourceId, flags: flags, mode: 1 }],
      function (code: number) {
        if (code) {
          msg(`❌ Error loading geofences: ${window.wialon.core.Errors.getErrorText(code)}`);
          return;
        }

        const zones = resource.getZones();
        if (!zones || !zones.length) {
          msg("⚠️ No geofences found for this resource");
          setGeofences([]);
          return;
        }

        const geofenceList: Geofence[] = [];
        for (let i = 0; i < zones.length; i++) {
          geofenceList.push({
            id: zones[i].getId(),
            name: zones[i].getName(),
            type: zones[i].getType(),
          });
        }

        setGeofences(geofenceList);
        msg(`✅ ${zones.length} geofences loaded for ${resource.getName()}`);
      }
    );
  };

  const showGeofence = (geofenceId: string) => {
    if (!window.wialon || !selectedResource || !geofenceId || !mapInstance.current) return;

    const sess = window.wialon.core.Session.getInstance();
    const resource = sess.getItem(parseInt(selectedResource, 10));
    const geofence = resource.getZone(parseInt(geofenceId, 10));

    if (!geofence) return;

    // Clear previous geofence layer
    if (geofenceLayer.current) {
      mapInstance.current.removeLayer(geofenceLayer.current);
    }

    const points = geofence.getPoints();
    if (!points || !points.length) return;

    // Convert points to Leaflet format
    const latLngs = points.map((point: any) => [point.y, point.x]);

    // Create polygon
    geofenceLayer.current = window.L.polygon(latLngs, {
      color: "#10B981",
      fillColor: "#10B981",
      fillOpacity: 0.2,
      weight: 2,
    }).addTo(mapInstance.current);

    // Fit map to geofence bounds
    mapInstance.current.fitBounds(geofenceLayer.current.getBounds());

    msg(`🏁 Geofence "${geofence.getName()}" displayed on map`);
  };

  const loadUnitSensors = (unitId: string) => {
    if (!window.wialon || !unitId) return;

    const sess = window.wialon.core.Session.getInstance();
    const unit = sess.getItem(parseInt(unitId, 10));

    if (!unit) {
      msg("❌ Unit not found");
      return;
    }

    const unitSensors = unit.getSensors();
    if (!unitSensors || !unitSensors.length) {
      msg("⚠️ No sensors found for this unit");
      setSensors([]);
      return;
    }

    const sensorsWithValues = unitSensors.map((sensor: any) => {
      const lastMessage = unit.getLastMessage();
      let value = unit.calculateSensorValue(sensor, lastMessage);
      if (value === -348201.3876) value = "N/A";

      return {
        ...sensor,
        value: value,
        unit: sensor.m || "",
      };
    });

    setSensors(sensorsWithValues);
    msg(`✅ ${sensorsWithValues.length} sensors loaded for ${unit.getName()}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "checking":
        return "bg-yellow-100 text-yellow-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUnitStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-600";
      case "idle":
        return "bg-yellow-100 text-yellow-600";
      case "offline":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  useEffect(() => {
    // Load external dependencies and initialize immediately
    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve(true);
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const loadCSS = (href: string) => {
      // Check if CSS is already loaded
      if (document.querySelector(`link[href="${href}"]`)) {
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    };

    const initializeWialon = async () => {
      try {
        msg("🔄 Starting Wialon initialization...");
        setIsLoading(true);

        // Load Leaflet CSS
        loadCSS("https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.2/leaflet.css");

        // Load dependencies in sequence for faster loading
        await loadScript("https://code.jquery.com/jquery-latest.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.2/leaflet.js");
        await loadScript(
          "https://hosting.wialon.com/?token=c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053&lang=en/wsdk/script/wialon.js"
        );

        msg("📡 Dependencies loaded, initializing Wialon session...");

        // Initialize Wialon session
        window.wialon.core.Session.getInstance().initSession(
          "https://hosting.wialon.com/?token=c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053&lang=en"
        );

        // Login with token immediately
        window.wialon.core.Session.getInstance().loginToken(
          WIALON_TOKEN,
          "",
          function (code: number) {
            if (code) {
              msg(`❌ Login failed: ${window.wialon.core.Errors.getErrorText(code)}`);
              setIsLoading(false);
              return;
            }

            msg("✅ Logged in successfully!");
            setIsLoggedIn(true);
            setIsLoading(false);

            // Initialize everything immediately after login
            initMap();
            initUnits();
            initResources();
          }
        );
      } catch (error) {
        console.error("Failed to load Wialon dependencies:", error);
        msg("❌ Failed to load map dependencies");
        setIsLoading(false);
      }
    };

    // Start initialization immediately
    initializeWialon();

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }

      // Remove event listeners
      Object.entries(unitEventIds).forEach(([unitId, eventId]) => {
        const sess = window.wialon?.core?.Session?.getInstance();
        const unit = sess?.getItem(parseInt(unitId, 10));
        if (unit && eventId) {
          unit.removeListenerById(eventId);
        }
      });
    };
  }, []);

  return (
    <div className="w-full h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Side panel - hidden on mobile, visible on desktop */}
      <div className="hidden md:flex md:w-80 bg-white border-r border-gray-200 flex-col">
        {/* Header */}
        <div className="p-3 md:p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">Tracking Delivery</h1>
              {isLoading && (
                <p className="text-xs md:text-sm text-blue-600">⏳ Loading Wialon data...</p>
              )}
              {isLoggedIn && (
                <p className="text-xs md:text-sm text-green-600">✅ Connected to Wialon</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WialonMapComponent;
