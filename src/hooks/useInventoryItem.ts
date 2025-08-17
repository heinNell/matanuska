import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  doc,
  getFirestore,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  updateDoc,
  setDoc,
  increment as fsIncrement,
} from "firebase/firestore";
import { db as appDb } from "../firebase";

// If you already defined this elsewhere, remove this local interface and import it.
export interface InventoryItem {
  id: string;
  code: string; // StockCde
  description: string; // StockDescription
  supplierPartNo?: string;
  costPrice: number; // per unit
  qty: number; // on-hand
  reorderLevel: number;
  extendedValue?: number; // may be present from seeder
  storeId: string;
  storeName: string;
  createdAt?: any;
  updatedAt?: any;
}

export function storeIdFromName(name: string) {
  return String(name || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * useInventoryItem — realtime subscribe + handy mutations for a single SKU
 *
 * @param storeId   e.g. "mutare-depot-stock"  (slug of StoreName)
 * @param code      e.g. "TBAL0001"            (StockCde; doc id)
 * @param createIfMissing  if true, creates a minimal doc on first write
 */
export function useInventoryItem(
  storeId: string | undefined,
  code: string | undefined,
  createIfMissing = false
) {
  const db = appDb ?? getFirestore();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState<boolean>(!!storeId && !!code);
  const [error, setError] = useState<string | null>(null);
  const unsubRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!storeId || !code) {
      setItem(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);

    const ref = doc(db, "stores", storeId, "inventory", code);
    unsubRef.current?.();
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setItem(null);
        } else {
          const d = snap.data() as any;
          setItem({
            id: snap.id,
            code: d.code ?? snap.id,
            description: d.description ?? "",
            supplierPartNo: d.supplierPartNo ?? "",
            costPrice: Number(d.costPrice ?? 0),
            qty: Number(d.qty ?? 0),
            reorderLevel: Number(d.reorderLevel ?? 0),
            extendedValue: typeof d.extendedValue === "number" ? d.extendedValue : undefined,
            storeId: d.storeId ?? storeId,
            storeName: d.storeName ?? "",
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
          });
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to load inventory item");
        setLoading(false);
      }
    );
    unsubRef.current = unsub;
    return () => unsubRef.current?.();
  }, [db, storeId, code]);

  // Computed helpers
  const computed = useMemo(() => {
    if (!item) return { isLowStock: false, value: 0 };
    const value =
      typeof item.extendedValue === "number"
        ? item.extendedValue
        : Number((item.costPrice * item.qty).toFixed(2));
    const isLowStock = item.qty <= item.reorderLevel;
    return { isLowStock, value };
  }, [item]);

  // Mutations
  const ensureDoc = useCallback(async () => {
    if (!storeId || !code) return;
    if (!createIfMissing) return;
    const ref = doc(db, "stores", storeId, "inventory", code);
    await setDoc(
      ref,
      {
        code,
        description: "",
        supplierPartNo: "",
        costPrice: 0,
        qty: 0,
        reorderLevel: 0,
        storeId,
        storeName: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }, [db, storeId, code, createIfMissing]);

  const update = useCallback(
    async (patch: Partial<Omit<InventoryItem, "id" | "storeId" | "storeName">>) => {
      if (!storeId || !code) return;
      const ref = doc(db, "stores", storeId, "inventory", code);
      try {
        await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() });
      } catch (e: any) {
        if (createIfMissing) {
          await ensureDoc();
          await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() });
        } else {
          throw e;
        }
      }
    },
    [db, storeId, code, ensureDoc, createIfMissing]
  );

  const incrementQty = useCallback(
    async (delta: number) => {
      if (!storeId || !code || !Number.isFinite(delta)) return;
      const ref = doc(db, "stores", storeId, "inventory", code);
      try {
        await updateDoc(ref, { qty: fsIncrement(delta), updatedAt: serverTimestamp() });
      } catch (e: any) {
        if (createIfMissing) {
          await ensureDoc();
          await updateDoc(ref, { qty: fsIncrement(delta), updatedAt: serverTimestamp() });
        } else {
          throw e;
        }
      }
    },
    [db, storeId, code, ensureDoc, createIfMissing]
  );

  const setQty = useCallback(
    async (qty: number) => {
      if (!storeId || !code) return;
      await runTransaction(db, async (tx) => {
        const ref = doc(db, "stores", storeId, "inventory", code);
        tx.set(
          ref,
          {
            qty: Number(qty) || 0,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      });
    },
    [db, storeId, code]
  );

  const setReorderLevel = useCallback(
    async (level: number) => update({ reorderLevel: Number(level) || 0 }),
    [update]
  );

  const remove = useCallback(async () => {
    if (!storeId || !code) return;
    const ref = doc(db, "stores", storeId, "inventory", code);
    // tip: prefer a "soft delete" flag in production
    await updateDoc(ref, { qty: 0, updatedAt: serverTimestamp() });
  }, [db, storeId, code]);

  return {
    item,
    loading,
    error,
    ...computed, // isLowStock, value
    update,
    incrementQty,
    setQty,
    setReorderLevel,
    remove,
  };
}
