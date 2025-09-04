import React from "react";
import MapView from "../../components/MapView";
import { useFleet } from "./useFleet";
import { FleetItem } from "../../services/wialonService";

export default function TrackingPage() {
  const { status, error, fleet, stats } = useFleet();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "380px 1fr",
        height: "100vh",
        background: "linear-gradient(135deg,#0f172a,#1f2937)",
        color: "#e5e7eb",
        fontFamily: "Inter, system-ui, Arial",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid #374151",
          background: "#0f172ab3",
          backdropFilter: "blur(10px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: 16, borderBottom: "1px solid #374151" }}>
          <div style={{ fontWeight: 700 }}>Matanuska – Realtime Tracking</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>Wialon + Google Maps</div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 8,
            padding: 12,
            borderBottom: "1px solid #374151",
          }}
        >
          <StatCard label="Active" value={stats.active} />
          <StatCard label="Idle" value={stats.idle} />
          <StatCard label="Offline" value={stats.offline} />
        </div>

        <div style={{ padding: 12, borderTop: "1px dashed #374151", fontSize: 13 }}>
          {status === "connecting" && (
            <span style={{ color: "#60a5fa" }}>Connecting to Wialon…</span>
          )}
          {status === "ready" && (
            <span style={{ color: "#10b981" }}>Connected – realtime polling active</span>
          )}
          {status === "error" && <span style={{ color: "#ef4444" }}>Error: {error}</span>}
          {status === "idle" && <span>Initializing…</span>}
        </div>

        <div
          style={{ display: "flex", gap: 8, padding: "10px 12px", borderTop: "1px solid #374151" }}
        >
          <button onClick={() => centerOnFleet(fleet)} style={btnPrimary}>
            Center on fleet
          </button>
          <button onClick={() => window.location.reload()} style={btnSecondary}>
            Refresh
          </button>
        </div>

        <div
          style={{
            overflow: "auto",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {fleet.length === 0 && (
            <div style={{ textAlign: "center", color: "#9ca3af", padding: 20 }}>
              Loading vehicles…
            </div>
          )}
          {fleet.map((v) => (
            <div key={v.id} style={itemCard} onClick={() => panTo(v)}>
              <h4 style={{ margin: 0, marginBottom: 6, fontSize: 14 }}>
                {v.name}{" "}
                <span
                  style={{
                    ...badge,
                    background: badgeColor(v.status),
                    color: v.status === "idle" ? "#111" : "#fff",
                  }}
                >
                  {v.status.toUpperCase()}
                </span>
              </h4>
              <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>
                {v.position ? (
                  <>
                    Speed: {v.speed} km/h
                    <br />
                    Last: {v.lastUpdate?.toLocaleString()}
                    <br />
                    {v.position.lat.toFixed(4)}, {v.position.lng.toFixed(4)}
                  </>
                ) : (
                  <>No position</>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main>
        <MapView
          vehicles={fleet}
          onMarkerClick={(v) => {
            // no-op: jy kan later 'n info panel wys
            console.log("Marker:", v.name);
          }}
        />
      </main>
    </div>
  );
}

function badgeColor(s: "active" | "idle" | "offline") {
  if (s === "active") return "#10b981";
  if (s === "idle") return "#f59e0b";
  return "#ef4444";
}

const btnPrimary: React.CSSProperties = {
  background: "#4361ee",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "10px 12px",
  fontWeight: 600,
  cursor: "pointer",
};
const btnSecondary: React.CSSProperties = {
  background: "#334155",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "10px 12px",
  fontWeight: 600,
  cursor: "pointer",
};
const itemCard: React.CSSProperties = {
  border: "1px solid #374151",
  borderRadius: 12,
  padding: 12,
  background: "rgba(255,255,255,.03)",
  cursor: "pointer",
};
const badge: React.CSSProperties = {
  padding: "2px 8px",
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 11,
};

function centerOnFleet(_fleet: ReturnType<typeof useFleet>["fleet"]) {
  // Hierdie word hanteer binne MapView – vir eenvoud los ons dit hier.
  // Jy kan 'n Zustand store of context gebruik om map te beheer.
  console.log("Center requested. (Implement as needed)");
}

function panTo(v: FleetItem) {
  // Idem as hierbo – stuur 'n event of gebruik 'n map ref/store.
  console.log("Pan to requested for:", v.name);
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,.03)",
        border: "1px solid #374151",
        borderRadius: 10,
        padding: 10,
        textAlign: "center",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 18 }}>{value}</div>
      <div style={{ color: "#9ca3af", fontSize: 12 }}>{label}</div>
    </div>
  );
}
