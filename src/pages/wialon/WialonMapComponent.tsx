import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    // Using the proper Wialon type that's already defined in wialon-sdk.d.ts
    L: any;
    $: any;
  }
}

const WialonMapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const unitsSelectRef = useRef<HTMLSelectElement>(null);
  const mapInstance = useRef<any>(null);
  const marker = useRef<any>(null);

  const msg = (text: string) => {
    if (logRef.current) {
      logRef.current.innerHTML = text + "<br/>" + logRef.current.innerHTML;
    }
  };

  const initMap = () => {
    if (!mapRef.current || !window.L) return;

    // Create map
    mapInstance.current = window.L.map(mapRef.current).setView([54.68, 25.27], 10);

    // Add OpenStreetMap tile layer as fallback
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance.current);
  };

  const init = () => {
    if (!window.wialon) return;

    const sess = window.wialon.core.Session.getInstance();
    const flags =
      window.wialon.item.Item.dataFlag.base | window.wialon.item.Unit.dataFlag.lastMessage;

    sess.loadLibrary("itemIcon");
    sess.updateDataFlags(
      [{ type: "type", data: "avl_unit", flags: flags, mode: 0 }],
      function (code: number) {
        if (code) {
          msg(window.wialon.core.Errors.getErrorText(code));
          return;
        }

        const units = sess.getItems("avl_unit");
        if (!units || !units.length) {
          msg("No units found");
          return;
        }

        // Clear existing options
        if (unitsSelectRef.current) {
          unitsSelectRef.current.innerHTML = '<option value="">Select a unit...</option>';

          for (let i = 0; i < units.length; i++) {
            const option = document.createElement("option");
            option.value = units[i].getId();
            option.textContent = units[i].getName();
            unitsSelectRef.current.appendChild(option);
          }
        }
      }
    );
  };

  const showUnit = () => {
    if (!unitsSelectRef.current) return;

    const val = unitsSelectRef.current.value;
    if (!val) return;

    const unit = window.wialon.core.Session.getInstance().getItem(parseInt(val, 10));
    if (!unit) return;

    const pos = unit.getPosition();
    if (!pos) return;

    msg(
      `<img src='${unit.getIconUrl(32)}'/> ${unit.getName()} selected. Position ${pos.x}, ${pos.y}`
    );

    if (mapInstance.current) {
      const icon = window.L.icon({
        iconUrl: unit.getIconUrl(32),
        iconAnchor: [16, 16],
      });

      if (!marker.current) {
        marker.current = window.L.marker({ lat: pos.y, lng: pos.x }, { icon: icon }).addTo(
          mapInstance.current
        );
      } else {
        marker.current.setLatLng({ lat: pos.y, lng: pos.x });
        marker.current.setIcon(icon);
      }

      mapInstance.current.setView({ lat: pos.y, lng: pos.x }, 15);
    }
  };

  useEffect(() => {
    // Load external dependencies
    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const loadCSS = (href: string) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    };

    const initializeWialon = async () => {
      try {
        // Load Leaflet CSS
        loadCSS("https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.2/leaflet.css");

        // Load jQuery
        await loadScript("https://code.jquery.com/jquery-latest.min.js");

        // Load Leaflet
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.2/leaflet.js");

        // Load Wialon SDK
        await loadScript(
          "https://hosting.wialon.com/?token=c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053&lang=en/wsdk/script/wialon.js"
        );

        // Initialize Wialon session
        window.wialon.core.Session.getInstance().initSession(
          "https://hosting.wialon.com/?token=c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053&lang=en"
        );

        // Login with token
        window.wialon.core.Session.getInstance().loginToken(
          "c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053",
          "",
          function (code: number) {
            if (code) {
              msg(window.wialon.core.Errors.getErrorText(code));
              return;
            }
            msg("Logged successfully");
            initMap();
            init();
          }
        );
      } catch (error) {
        console.error("Failed to load Wialon dependencies:", error);
        msg("Failed to load map dependencies");
      }
    };

    initializeWialon();

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, []);

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex-shrink-0 p-4 bg-background border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Fleet Tracking & Maps</h1>
            <p className="text-muted-foreground">Real-time vehicle monitoring via Wialon SDK</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              ref={unitsSelectRef}
              onChange={showUnit}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="">Select a unit...</option>
            </select>
            <button
              onClick={() => showUnit()}
              className="px-3 py-2 border rounded-md bg-background"
            >
              Show Unit
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1">
          <div ref={mapRef} className="w-full h-full" style={{ minHeight: "400px" }} />
        </div>

        <div className="w-80 m-4 p-4 overflow-y-auto bg-white shadow rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Activity Log</h3>
          <div
            ref={logRef}
            className="text-sm space-y-2 max-h-96 overflow-y-auto"
            style={{
              border: "1px solid #e5e7eb",
              padding: "8px",
              minHeight: "200px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default WialonMapComponent;
