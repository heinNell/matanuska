import React, { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../../firebase"; // <- adjust if your path differs
import {
  Timestamp,
  collection,
  collectionGroup,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  DocumentData,
  QueryConstraint,
} from "firebase/firestore";

type EventType =
  | "FITTED"
  | "REMOVED"
  | "ROTATED"
  | "REPAIRED"
  | "RETREADED"
  | "INSPECTED"
  | "SCRAPPED";

type TyreEvent = {
  id: string;
  tyreId: string;
  tyreSerial?: string;
  brand?: string;
  size?: string;
  pattern?: string;
  vehicleId?: string;
  vehicleReg?: string;
  axle?: string;
  position?: string;
  odometer?: number;
  eventType: EventType;
  notes?: string;
  performedBy?: string;
  eventDate: Date; // normalized from Firestore Timestamp
  createdAt?: Date;
};

const EVENT_COLORS: Record<EventType, string> = {
  FITTED: "bg-green-100 text-green-700 ring-green-600/20",
  REMOVED: "bg-amber-100 text-amber-700 ring-amber-600/20",
  ROTATED: "bg-blue-100 text-blue-700 ring-blue-600/20",
  REPAIRED: "bg-cyan-100 text-cyan-700 ring-cyan-600/20",
  RETREADED: "bg-indigo-100 text-indigo-700 ring-indigo-600/20",
  INSPECTED: "bg-slate-100 text-slate-700 ring-slate-600/20",
  SCRAPPED: "bg-rose-100 text-rose-700 ring-rose-600/20",
};

// --- Small utilities ---
const toDateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const tsToDate = (val: Timestamp | Date | string | number | null | undefined): Date | undefined => {
  if (!val) return undefined;
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  const num = typeof val === "string" ? Date.parse(val) : val;
  if (typeof num === "number" && !isNaN(num)) return new Date(num);
  return undefined;
};

function useDebounced<T>(value: T, ms = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function csvEscape(s: unknown): string {
  const str = s == null ? "" : String(s);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCSV(rows: Record<string, unknown>[], headerOrder?: string[]) {
  if (rows.length === 0) return "data:text/csv;charset=utf-8,\uFEFF";
  const headers = headerOrder ?? (rows[0] ? Object.keys(rows[0]) : []);
  const lines = [
    headers.map(csvEscape).join(","),
    ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(",")),
  ];
  return "data:text/csv;charset=utf-8,\uFEFF" + lines.join("\n");
}

// --- Data hook ---
type SourceMode = "collectionGroup" | "topLevelCollection" | "subcollectionPerTyre";

function normalizeEvent(id: string, data: DocumentData): TyreEvent {
  return {
    id,
    tyreId: data.tyreId ?? "",
    tyreSerial: data.tyreSerial,
    brand: data.brand,
    size: data.size,
    pattern: data.pattern,
    vehicleId: data.vehicleId,
    vehicleReg: data.vehicleReg,
    axle: data.axle,
    position: data.position,
    odometer: typeof data.odometer === "number" ? data.odometer : undefined,
    eventType: (data.eventType as EventType) ?? "INSPECTED",
    notes: data.notes,
    performedBy: data.performedBy,
    eventDate: tsToDate(data.eventDate) ?? tsToDate(data.createdAt) ?? new Date(0),
    createdAt: tsToDate(data.createdAt),
  };
}

function useTyreEvents(initialDaysBack = 180, sourceMode: SourceMode = "collectionGroup") {
  const [events, setEvents] = useState<TyreEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setErr(null);

    const since = new Date();
    since.setDate(since.getDate() - initialDaysBack);

    const constraints: QueryConstraint[] = [
      orderBy("eventDate", "desc"),
      // not all schemas have eventDate indexed; if missing, remove where and rely on client-side filter
      // Prefer: where("eventDate", ">=", since)
      limit(1000),
    ];

    let unsub = () => {};
    async function boot() {
      try {
        if (sourceMode === "collectionGroup") {
          const qRef = query(collectionGroup(db, "tyreEvents"), ...constraints);
          unsub = onSnapshot(
            qRef,
            (snap) => {
              const rows = snap.docs.map((d) => normalizeEvent(d.id, d.data()));
              setEvents(rows);
              setLoading(false);
            },
            (e) => {
              console.error(e);
              setErr(e.message || "Failed to load tyre events.");
              setLoading(false);
            }
          );
        } else if (sourceMode === "topLevelCollection") {
          const qRef = query(collection(db, "tyreEvents"), ...constraints);
          unsub = onSnapshot(
            qRef,
            (snap) => {
              const rows = snap.docs.map((d) => normalizeEvent(d.id, d.data()));
              setEvents(rows);
              setLoading(false);
            },
            (e) => {
              console.error(e);
              setErr(e.message || "Failed to load tyre events.");
              setLoading(false);
            }
          );
        } else {
          // subcollectionPerTyre: Best-effort batch read (no realtime). Adjust if you provide a tyreId prop/page param.
          const tyresSnap = await getDocs(collection(db, "tyres"));
          const promises = tyresSnap.docs.map((t) =>
            getDocs(query(collection(t.ref, "events"), orderBy("eventDate", "desc"), limit(500)))
          );
          const results = await Promise.all(promises);
          const rows: TyreEvent[] = [];
          for (const r of results) {
            r.forEach((doc) => rows.push(normalizeEvent(doc.id, doc.data())));
          }
          setEvents(rows);
          setLoading(false);
        }
      } catch (e: any) {
        console.error(e);
        setErr(e.message || "Failed to load tyre events.");
        setLoading(false);
      }
    }
    boot();

    return () => {
      unsub();
    };
  }, [db, initialDaysBack, sourceMode]);

  return { events, loading, error: err };
}

// --- UI helpers ---
const Badge: React.FC<{ label: string; tone?: string; title?: string }> = ({
  label,
  tone = "bg-slate-100 text-slate-700 ring-slate-600/20",
  title,
}) => (
  <span
    title={title}
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}
  >
    {label}
  </span>
);

const SkeletonRow: React.FC = () => (
  <tr className="animate-pulse">
    {[...Array(8)].map((_, i) => (
      <td key={i} className="px-3 py-3">
        <div className="h-3 w-full rounded bg-gray-200" />
      </td>
    ))}
  </tr>
);

// --- Main page ---
const TyreHistoryPage: React.FC = () => {
  // Filters
  const [qText, setQText] = useState("");
  const debouncedQ = useDebounced(qText, 300);

  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [dateFrom, setDateFrom] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return toDateOnly(d).toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState<string>(() =>
    toDateOnly(new Date()).toISOString().slice(0, 10)
  );
  const [sourceMode, setSourceMode] = useState<SourceMode>("collectionGroup");

  const { events, loading, error } = useTyreEvents(180, sourceMode);

  // Derived view
  const filtered = useMemo(() => {
    const df = dateFrom ? new Date(dateFrom) : undefined;
    const dt = dateTo ? new Date(dateTo) : undefined;
    const txt = debouncedQ.trim().toLowerCase();

    return events
      .filter((e) => {
        // date range filter
        if (df && e.eventDate < df) return false;
        if (dt && e.eventDate > new Date(dt.getTime() + 24 * 60 * 60 * 1000 - 1)) return false;

        // type filter
        if (eventTypes.length && !eventTypes.includes(e.eventType)) return false;

        // text search across key fields
        if (!txt) return true;
        const hay = [
          e.tyreSerial,
          e.brand,
          e.size,
          e.pattern,
          e.vehicleReg,
          e.vehicleId,
          e.axle,
          e.position,
          e.notes,
          e.performedBy,
          e.eventType,
          e.tyreId,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return hay.includes(txt);
      })
      .sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());
  }, [events, debouncedQ, eventTypes, dateFrom, dateTo]);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    // reset to page 1 on filter change
    setPage(1);
  }, [debouncedQ, eventTypes, dateFrom, dateTo]);

  const pageSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // CSV export
  const downloadRef = useRef<HTMLAnchorElement | null>(null);
  const handleExport = () => {
    const rows = filtered.map((e) => ({
      date: e.eventDate.toISOString(),
      eventType: e.eventType,
      tyreSerial: e.tyreSerial ?? "",
      brand: e.brand ?? "",
      size: e.size ?? "",
      pattern: e.pattern ?? "",
      vehicleReg: e.vehicleReg ?? "",
      vehicleId: e.vehicleId ?? "",
      axle: e.axle ?? "",
      position: e.position ?? "",
      odometer: e.odometer ?? "",
      performedBy: e.performedBy ?? "",
      notes: e.notes ?? "",
      tyreId: e.tyreId,
      createdAt: e.createdAt ? e.createdAt.toISOString() : "",
    }));
    const url = toCSV(rows, [
      "date",
      "eventType",
      "tyreSerial",
      "brand",
      "size",
      "pattern",
      "vehicleReg",
      "vehicleId",
      "axle",
      "position",
      "odometer",
      "performedBy",
      "notes",
      "tyreId",
      "createdAt",
    ]);
    const a = downloadRef.current;
    if (!a) return;
    a.href = encodeURI(url);
    a.download = `tyre-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const toggleType = (t: EventType) =>
    setEventTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tyre History</h1>
          <p className="text-sm text-gray-600">
            Live view of all tyre lifecycle events. Search, filter, export, and audit changes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50"
            title="Export current view to CSV"
          >
            Export CSV
          </button>
          <a ref={downloadRef} className="hidden" aria-hidden />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border p-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-1">
          <label className="mb-1 block text-xs font-medium text-gray-700">Search</label>
          <input
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            placeholder="Serial, reg, brand, note…"
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Data Source</label>
          <select
            value={sourceMode}
            onChange={(e) => setSourceMode(e.target.value as SourceMode)}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            title="Switch if your schema differs"
          >
            <option value="collectionGroup">collectionGroup: tyreEvents</option>
            <option value="topLevelCollection">collection: tyreEvents</option>
            <option value="subcollectionPerTyre">subcollection: tyres/{`{tyreId}`}/events</option>
          </select>
        </div>

        {/* Event type filter row (full width on small screens) */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-4">
          <label className="mb-2 block text-xs font-medium text-gray-700">Event Types</label>
          <div className="flex flex-wrap gap-2">
            {(
              [
                "FITTED",
                "REMOVED",
                "ROTATED",
                "REPAIRED",
                "RETREADED",
                "INSPECTED",
                "SCRAPPED",
              ] as EventType[]
            ).map((t) => {
              const active = eventTypes.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    active ? "border-transparent bg-black text-white" : "hover:bg-gray-50"
                  }`}
                >
                  {t}
                </button>
              );
            })}
            {eventTypes.length > 0 && (
              <button
                onClick={() => setEventTypes([])}
                className="rounded-full border px-3 py-1 text-xs font-medium hover:bg-gray-50"
                title="Clear type filters"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
        <div>
          {loading ? "Loading…" : `${filtered.length.toLocaleString()} events`}{" "}
          {error && <span className="text-rose-600">• {error}</span>}
        </div>
        <div>
          Page {page} of {totalPages}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-3 py-3 text-left">Date</th>
              <th className="px-3 py-3 text-left">Event</th>
              <th className="px-3 py-3 text-left">Tyre</th>
              <th className="px-3 py-3 text-left">Vehicle</th>
              <th className="px-3 py-3 text-left">Axle/Pos</th>
              <th className="px-3 py-3 text-left">Odometer</th>
              <th className="px-3 py-3 text-left">Notes</th>
              <th className="px-3 py-3 text-left">By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading && [...Array(10)].map((_, i) => <SkeletonRow key={`sk-${i}`} />)}

            {!loading && pageSlice.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  No events match your filters. Adjust the date range or clear the search.
                </td>
              </tr>
            )}

            {!loading &&
              pageSlice.map((e) => {
                const tone = EVENT_COLORS[e.eventType] ?? EVENT_COLORS.INSPECTED;
                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-3 py-3">{e.eventDate.toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <Badge label={e.eventType} tone={tone} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{e.tyreSerial ?? "—"}</div>
                      <div className="text-xs text-gray-500">
                        {[e.brand, e.size, e.pattern].filter(Boolean).join(" • ") || "—"}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{e.vehicleReg ?? "—"}</div>
                      <div className="text-xs text-gray-500">{e.vehicleId ?? ""}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div>{e.axle ?? "—"}</div>
                      <div className="text-xs text-gray-500">{e.position ?? ""}</div>
                    </td>
                    <td className="px-3 py-3">{e.odometer?.toLocaleString() ?? "—"}</td>
                    <td className="max-w-[20ch] px-3 py-3">
                      <div className="truncate" title={e.notes}>
                        {e.notes ?? "—"}
                      </div>
                    </td>
                    <td className="px-3 py-3">{e.performedBy ?? "—"}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of{" "}
          {filtered.length}
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <button
            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TyreHistoryPage;
