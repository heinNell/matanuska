import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { db } from "../firebase";

/** ============== Types ============== */
export interface FuelStation {
  id?: string; // derived from buildDepotId(name, town)
  name: string;
  town: string;
  address: string;
  // Optional geo fields if you later add them
  lat?: number | null;
  lng?: number | null;
  // timestamps (string to align with your seed approach; you can switch to Firestore Timestamp)
  createdAt?: string;
  updatedAt?: string;
}

export interface UseFuelStations {
  items: FuelStation[];
  loading: boolean;
  error: string | null;

  // Selectors
  search: (q: string) => FuelStation[];
  byTown: (town: string) => FuelStation[];
  get: (id: string) => FuelStation | undefined;

  // Mutations
  upsert: (station: FuelStation) => Promise<void>;
  remove: (id: string) => Promise<void>;
  bulkUpsert: (rows: FuelStation[]) => Promise<{ upserts: number }>;
}

/** ============== Constants/Utils ============== */
const COLLECTION = "depots";

// Same sanitization as your seeder
export function buildDepotId(name: string, town: string) {
  return (name + "_" + town).replace(/[^a-zA-Z0-9]/g, "_");
}

function nowIso() {
  return new Date().toISOString();
}

/** ============== Hook ============== */
export function useFuelStations(): UseFuelStations {
  const [items, setItems] = useState<FuelStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sorted read (helps with UX and stable diffs)
    const q = query(collection(db, COLLECTION), orderBy("town", "asc"), orderBy("name", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: FuelStation[] = snap.docs.map((d) => {
          const data = d.data() as FuelStation;
          return { id: d.id, ...data };
        });
        setItems(rows);
        setLoading(false);
      },
      (e) => {
        console.error("depots subscribe error:", e);
        setError(e.message ?? "Failed to load depots");
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  /** ---------- Selectors ---------- */
  const mapById = useMemo(() => {
    const m = new Map<string, FuelStation>();
    for (const r of items) if (r.id) m.set(r.id, r);
    return m;
  }, [items]);

  const normalizedIndex = useMemo(() => {
    // simple lowercase tokens for quick in-memory search
    return items.map((r) => ({
      ref: r,
      hay: `${r.name} ${r.town} ${r.address}`.toLowerCase(),
    }));
  }, [items]);

  const search = useCallback(
    (q: string) => {
      const s = q.trim().toLowerCase();
      if (!s) return items;
      return normalizedIndex.filter((n) => n.hay.includes(s)).map((n) => n.ref);
    },
    [items, normalizedIndex]
  );

  const byTown = useCallback(
    (town: string) => items.filter((r) => r.town.toLowerCase() === town.trim().toLowerCase()),
    [items]
  );

  const get = useCallback((id: string) => mapById.get(id), [mapById]);

  /** ---------- Mutations ---------- */
  const upsert = useCallback(async (station: FuelStation) => {
    const id = station.id ?? buildDepotId(station.name, station.town);
    const ref = doc(collection(db, COLLECTION), id);
    const payload: FuelStation = {
      name: station.name,
      town: station.town,
      address: station.address,
      lat: station.lat ?? null,
      lng: station.lng ?? null,
      createdAt: station.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    };
    await setDoc(ref, payload, { merge: true });
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteDoc(doc(collection(db, COLLECTION), id));
  }, []);

  const bulkUpsert = useCallback(async (rows: FuelStation[]) => {
    const batch = writeBatch(db);
    let upserts = 0;
    for (const r of rows) {
      if (!r.name || !r.town) continue;
      const id = r.id ?? buildDepotId(r.name, r.town);
      const ref = doc(collection(db, COLLECTION), id);
      batch.set(
        ref,
        {
          name: r.name,
          town: r.town,
          address: r.address,
          lat: r.lat ?? null,
          lng: r.lng ?? null,
          createdAt: r.createdAt ?? nowIso(),
          updatedAt: nowIso(),
        },
        { merge: true }
      );
      upserts++;
    }
    await batch.commit();
    return { upserts };
  }, []);

  return {
    items,
    loading,
    error,
    search,
    byTown,
    get,
    upsert,
    remove,
    bulkUpsert,
  };
}
