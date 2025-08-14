import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
  writeBatch,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

/** ================== Types ================== */
export interface TyreStoreRecord {
  RegistrationNo: string; // e.g. 'AAX2987' or 'ABB1578/ABB1577'
  StoreName: string;      // e.g. '15L', '2T'
  TyrePosDescription: string; // e.g. 'V1', 'T12', 'SP'
  TyreCode: string;            // e.g. 'MAT0171'
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface UseVehicleTyreStore {
  items: TyreStoreRecord[];
  loading: boolean;
  error: string | null;

  // Selectors
  getByStore: (storeName: string) => TyreStoreRecord[];
  getByRegistration: (regNo: string) => TyreStoreRecord[];
  getByTyreCode: (tyreCode: string) => TyreStoreRecord | undefined;
  getAtPosition: (storeName: string, pos: string) => TyreStoreRecord | undefined;

  // Mutations
  assignTyre: (params: {
    storeName: string;
    pos: string;
    tyreCode: string;
    registrationNo: string;
  }) => Promise<void>;

  removeTyre: (params: {
    storeName: string;
    pos: string;
    tyreCode?: string; // if omitted, remove the doc regardless of code match
  }) => Promise<void>;

  moveTyre: (params: {
    from: { storeName: string; pos: string; tyreCode?: string };
    to: { storeName: string; pos: string; registrationNo: string };
    replaceIfExists?: boolean;
  }) => Promise<void>;

  bulkUpsert: (rows: TyreStoreRecord[]) => Promise<{ upserts: number }>;
}

/** ================== Helpers ================== */
const COLLECTION = "tyreStore";

// Keep your doc ID format consistent with the seeder
export function buildDocId(storeName: string, pos: string, tyreCode: string) {
  return `${storeName}_${pos}_${tyreCode}`;
}

function sysNow() {
  return new Date().toISOString();
}

/** ================== Hook ================== */
export function useVehicleTyreStore(): UseVehicleTyreStore {
  const [items, setItems] = useState<TyreStoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Live subscription
  useEffect(() => {
    const qCol = query(collection(db, COLLECTION), orderBy("StoreName", "asc"));
    const unsub = onSnapshot(
      qCol,
      (snap) => {
        const rows: TyreStoreRecord[] = snap.docs.map((d) => {
          const data = d.data() as TyreStoreRecord;
          return {
            RegistrationNo: data.RegistrationNo,
            StoreName: data.StoreName,
            TyrePosDescription: data.TyrePosDescription,
            TyreCode: data.TyreCode,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
        setItems(rows);
        setLoading(false);
      },
      (e) => {
        console.error("tyreStore subscribe error:", e);
        setError(e.message ?? "Failed to load tyreStore");
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  /** ================== Selectors ================== */
  const byStore = useMemo(() => {
    const m = new Map<string, TyreStoreRecord[]>();
    for (const r of items) {
      const list = m.get(r.StoreName) ?? [];
      list.push(r);
      m.set(r.StoreName, list);
    }
    for (const [k, list] of m) {
      list.sort((a, b) => {
        const ax = a.TyrePosDescription;
        const bx = b.TyrePosDescription;
        const num = (s: string) => Number(String(s).replace(/[^\d]/g, "") || "0");
        const aIsSpare = ax.startsWith("SP");
        const bIsSpare = bx.startsWith("SP");
        if (aIsSpare !== bIsSpare) return aIsSpare ? 1 : -1;
        return num(ax) - num(bx);
      });
      m.set(k, list);
    }
    return m;
  }, [items]);

  const byRegistration = useMemo(() => {
    const m = new Map<string, TyreStoreRecord[]>();
    for (const r of items) {
      const list = m.get(r.RegistrationNo) ?? [];
      list.push(r);
      m.set(r.RegistrationNo, list);
    }
    return m;
  }, [items]);

  const byTyreCode = useMemo(() => {
    const m = new Map<string, TyreStoreRecord>();
    for (const r of items) m.set(r.TyreCode, r);
    return m;
  }, [items]);

  const getByStore = useCallback((storeName: string) => byStore.get(storeName) ?? [], [byStore]);
  const getByRegistration = useCallback(
    (regNo: string) => byRegistration.get(regNo) ?? [],
    [byRegistration]
  );
  const getByTyreCode = useCallback((tyreCode: string) => byTyreCode.get(tyreCode), [byTyreCode]);
  const getAtPosition = useCallback(
    (storeName: string, pos: string) =>
      (byStore.get(storeName) ?? []).find((r) => r.TyrePosDescription === pos),
    [byStore]
  );

  /** ================== Mutations ================== */

  /**
   * Assign a tyre to (storeName,pos).
   * Implementation: query existing occupants, then atomic batch: delete occupants + set new doc.
   */
  const assignTyre = useCallback(
    async ({
      storeName,
      pos,
      tyreCode,
      registrationNo,
    }: {
      storeName: string;
      pos: string;
      tyreCode: string;
      registrationNo: string;
    }) => {
      // Find current occupant(s)
      const qPos = query(
        collection(db, COLLECTION),
        where("StoreName", "==", storeName),
        where("TyrePosDescription", "==", pos)
      );
      const existingSnap = await getDocs(qPos);

      const batch = writeBatch(db);

      // Clear occupants at (store,pos)
      existingSnap.forEach((d) => batch.delete(d.ref));

      // Upsert new assignment with composite ID
      const targetId = buildDocId(storeName, pos, tyreCode);
      const targetRef = doc(collection(db, COLLECTION), targetId);
      batch.set(targetRef, {
        RegistrationNo: registrationNo,
        StoreName: storeName,
        TyrePosDescription: pos,
        TyreCode: tyreCode,
        createdAt: sysNow(),
        updatedAt: sysNow(),
      });

      await batch.commit();
    },
    []
  );

  /**
   * Remove a tyre from a position.
   */
  const removeTyre = useCallback(
    async ({ storeName, pos, tyreCode }: { storeName: string; pos: string; tyreCode?: string }) => {
      if (tyreCode) {
        const id = buildDocId(storeName, pos, tyreCode);
        await deleteDoc(doc(collection(db, COLLECTION), id));
        return;
      }
      const qPos = query(
        collection(db, COLLECTION),
        where("StoreName", "==", storeName),
        where("TyrePosDescription", "==", pos)
      );
      const snap = await getDocs(qPos);
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    },
    []
  );

  /**
   * Move a tyre between positions (and/or vehicles).
   * Strategy: resolve source doc, resolve/optionally clear destination, then atomic batch: delete source + dest(s) + set dest.
   */
  const moveTyre = useCallback(
    async ({
      from,
      to,
      replaceIfExists = true,
    }: {
      from: { storeName: string; pos: string; tyreCode?: string };
      to: { storeName: string; pos: string; registrationNo: string };
      replaceIfExists?: boolean;
    }) => {
      // Resolve source
      let sourceDocRef:
        | ReturnType<typeof doc>
        | undefined;

      if (from.tyreCode) {
        sourceDocRef = doc(collection(db, COLLECTION), buildDocId(from.storeName, from.pos, from.tyreCode));
      } else {
        const qPos = query(
          collection(db, COLLECTION),
          where("StoreName", "==", from.storeName),
          where("TyrePosDescription", "==", from.pos)
        );
        const qPosSnap = await getDocs(qPos);
        const first = qPosSnap.docs[0];
        if (!first) throw new Error(`No tyre found at ${from.storeName}:${from.pos}`);
        sourceDocRef = first.ref;
      }

      // Read source data
      const sourceDoc = await getDocs(
        query(
          collection(db, COLLECTION),
          where("StoreName", "==", from.storeName),
          where("TyrePosDescription", "==", from.pos),
          ...(from.tyreCode ? [where("TyreCode", "==", from.tyreCode)] : [])
        )
      );
      const src = sourceDoc.docs[0];
      if (!src) throw new Error("Source tyre document not found");
      const sourceData = src.data() as TyreStoreRecord;
      const tyreCode = sourceData.TyreCode;

      // Destination occupants
      const qDest = query(
        collection(db, COLLECTION),
        where("StoreName", "==", to.storeName),
        where("TyrePosDescription", "==", to.pos)
      );
      const qDestSnap = await getDocs(qDest);
      if (!replaceIfExists && !qDestSnap.empty) {
        throw new Error(`Destination ${to.storeName}:${to.pos} already occupied`);
      }

      // Batch: delete source + (optional) dests, then set new dest
      const batch = writeBatch(db);

      // Delete source
      if (sourceDocRef) batch.delete(sourceDocRef);

      // Clear destination occupants
      qDestSnap.forEach((d) => batch.delete(d.ref));

      // Create destination doc with new composite id
      const destRef = doc(collection(db, COLLECTION), buildDocId(to.storeName, to.pos, tyreCode));
      batch.set(destRef, {
        RegistrationNo: to.registrationNo,
        StoreName: to.storeName,
        TyrePosDescription: to.pos,
        TyreCode: tyreCode,
        createdAt: sourceData.createdAt ?? sysNow(),
        updatedAt: sysNow(),
      });

      await batch.commit();
    },
    []
  );

  /**
   * Bulk upsert (idempotent for exact same composite key).
   */
  const bulkUpsert = useCallback(async (rows: TyreStoreRecord[]) => {
    const batch = writeBatch(db);
    let upserts = 0;

    for (const r of rows) {
      if (!r.StoreName || !r.TyrePosDescription || !r.TyreCode) continue;
      const id = buildDocId(r.StoreName, r.TyrePosDescription, r.TyreCode);
      const ref = doc(collection(db, COLLECTION), id);
      batch.set(ref, {
        RegistrationNo: r.RegistrationNo,
        StoreName: r.StoreName,
        TyrePosDescription: r.TyrePosDescription,
        TyreCode: r.TyreCode,
        createdAt: r.createdAt ?? sysNow(),
        updatedAt: sysNow(),
      });
      upserts++;
    }

    await batch.commit();
    return { upserts };
  }, []);

  return {
    items,
    loading,
    error,
    getByStore,
    getByRegistration,
    getByTyreCode,
    getAtPosition,
    assignTyre,
    removeTyre,
    moveTyre,
    bulkUpsert,
  };
}
