import React, { useEffect, useState } from "react";
import wialonService from "../services/wialonService";
import type { WialonUnit } from "../types/wialon-types";

// ====== PASTE YOUR THREE BLOBS HERE (from your messages) ======
const LOGIN_BLOB = {
  base_url: "https://hst-api.wialon.eu",
  eid: "51dffd4e89b2f38b26a7187c2911198d",
};

const SAMPLE_UNITS = [
  { id: 600665449, nm: "21H - ADS 4865" },
  { id: 600702514, nm: "22H - AGZ 3812 (ADS 4866)" },
  { id: 600590053, nm: "23H - AFQ 1324 (Int Sim)" },
  { id: 24979429, nm: "24H - AFQ 1325 (Int Sim)" },
  { id: 600541672, nm: "26H - AFQ 1327 (Int Sim)" },
  { id: 600610518, nm: "28H - AFQ 1329 (Int Sim)" },
  { id: 600695231, nm: "29H - AGJ 3466" },
  { id: 600614258, nm: "30H - AGL 4216" },
  { id: 600672382, nm: "31H - AGZ 1963 (Int sim)" },
  { id: 600754126, nm: "32H - JF964 FS (Int sim)" },
  { id: 600769948, nm: "33H - JFK 963 FS (Int sim)" },
  { id: 600614226, nm: "BVTR 25 - DEMO TO BE RETURNED" },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RESOURCE = {
  id: 25138250,
  reports: [
    { id: 1, name: "Matanuska Fuel report" },
    { id: 2, name: "MATANUSKA DAILY SUMMARY- ALL VALUES" },
    { id: 3, name: "New report" },
  ],
};
// ===============================================================

export default function WialonPlayground() {
  const [attached, setAttached] = useState(false);
  const [units, setUnits] = useState<WialonUnit[]>([]);
  const [oneUnit, setOneUnit] = useState<WialonUnit | null>(null);
  const [trackCount, setTrackCount] = useState<number>(0);
  const [reportRows, setReportRows] = useState<number>(0);
  const [log, setLog] = useState<string[]>([]);

  function push(msg: string) {
    setLog((prev) => [`${new Date().toLocaleTimeString()}  ${msg}`, ...prev].slice(0, 200));
  }

  // 1) Attach your session (no re-login)
  useEffect(() => {
    try {
      wialonService.bootstrapFromLoginResponse(LOGIN_BLOB);
      setAttached(true);
      push("Attached session (eid) to WialonService");
    } catch (e: unknown) {
      const error = e as Error;
      push("Attach failed: " + error?.message);
    }
  }, []);

  async function doListUnits() {
    try {
      const u = await wialonService.getUnitsSnapshot();
      setUnits(u);
      push(`Fetched ${u.length} units from Wialon`);
    } catch (e: any) {
      push("List units failed: " + e?.message);
    }
  }

  async function doGetOne() {
    try {
      const sample = SAMPLE_UNITS.at(-1)!; // last item from your sample list
      const units = await wialonService.getUnitsSnapshot();
      const u = units.find(unit => {
        const unitData = unit as { id: number };
        return unitData.id === sample.id;
      }) || null;
      setOneUnit(u);
      push(`Fetched unit ${sample.id} (${sample.nm})`);
    } catch (e: unknown) {
      const error = e as Error;
      push("Get unit failed: " + error?.message);
    }
  }

  async function doHistory1h() {
    try {
      const sample = SAMPLE_UNITS.at(-1)!;
      const to = new Date();
      const from = new Date(Date.now() - 60 * 60 * 1000);
      const points = await (wialonService as any).getUnitHistory(sample.id, from, to);
      setTrackCount(points.length || 0);
      push(`Loaded ${points.length || 0} track points for ${sample.nm} (last hour) - Feature not implemented in simplified service`);
    } catch (e: unknown) {
      const error = e as Error;
      push("History failed: " + error?.message);
    }
  }

  async function doRunDailySummary() {
    try {
      const resourceId = RESOURCE.id;
      const templateId = 2; // “MATANUSKA DAILY SUMMARY- ALL VALUES”
      const now = Math.floor(Date.now() / 1000);
      const startOfDay = Math.floor(new Date(new Date().toDateString()).getTime() / 1000);

      await (wialonService as any).executeCustomMethod("report/exec_report", {
        reportResourceId: resourceId,
        reportTemplateId: templateId,
        interval: { from: startOfDay, to: now, flags: 0 },
      });

      const table0 = await (wialonService as any).executeCustomMethod<any>("report/get_result", {
        tableIndex: 0,
        config: "",
      });
      setReportRows(table0?.rows?.length ?? 0);
      push(`Report table 0 has ${table0?.rows?.length ?? 0} rows`);

      await (wialonService as any).executeCustomMethod("report/unload", {});
    } catch (e: any) {
      push("Report failed: " + e?.message);
    }
  }  return (
    <div
      style={{
        padding: 16,
        fontFamily: "Inter, system-ui, Arial",
        color: "#e5e7eb",
        background: "linear-gradient(135deg,#0f172a,#1f2937)",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ marginBottom: 8 }}>Wialon Playground</h2>
      <div style={{ marginBottom: 16, color: attached ? "#10b981" : "#f59e0b" }}>
        Session: {attached ? "attached" : "not attached"}
      </div>

      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          marginBottom: 16,
        }}
      >
        <button onClick={doListUnits} style={btn}>
          List Units
        </button>
        <button onClick={doGetOne} style={btn}>
          Get One Unit
        </button>
        <button onClick={doHistory1h} style={btn}>
          Last Hour History
        </button>
        <button onClick={doRunDailySummary} style={btn}>
          Run Daily Summary Report
        </button>
      </div>

      <div style={grid}>
        <section style={panel}>
          <h3 style={h3}>Units</h3>
          <div>{units.length} units</div>
          <div style={{ marginTop: 8, maxHeight: 240, overflow: "auto", fontSize: 13 }}>
            {units.map((u) => (
              <div key={u.id} style={row}>
                {u.id} — {u.nm ?? u.sys_name ?? 'Unknown'}
              </div>
            ))}
          </div>
        </section>

        <section style={panel}>
          <h3 style={h3}>One Unit</h3>
          {oneUnit ? (
            <pre style={pre}>{JSON.stringify(oneUnit, null, 2)}</pre>
          ) : (
            <div style={{ color: "#9ca3af" }}>Click “Get One Unit”</div>
          )}
        </section>

        <section style={panel}>
          <h3 style={h3}>History (1h)</h3>
          <div>{trackCount} points</div>
        </section>

        <section style={panel}>
          <h3 style={h3}>Report</h3>
          <div>Table 0 rows: {reportRows}</div>
        </section>
      </div>

      <section style={{ ...panel, marginTop: 16 }}>
        <h3 style={h3}>Log</h3>
        <div
          style={{
            maxHeight: 200,
            overflow: "auto",
            fontSize: 12,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          {log.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </section>
    </div>
  );
}

const btn: React.CSSProperties = {
  background: "#4361ee",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "10px 12px",
  fontWeight: 600,
  cursor: "pointer",
};
const grid: React.CSSProperties = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
};
const panel: React.CSSProperties = {
  background: "rgba(255,255,255,.03)",
  border: "1px solid #374151",
  borderRadius: 12,
  padding: 12,
};
const h3: React.CSSProperties = { margin: 0, marginBottom: 8, fontSize: 14 };
const row: React.CSSProperties = { padding: "6px 0", borderBottom: "1px dashed #374151" };
const pre: React.CSSProperties = { margin: 0, whiteSpace: "pre-wrap" };
