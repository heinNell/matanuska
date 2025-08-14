import { useState, useEffect, useCallback } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

// ==== TYPE DEFINITIONS ====
export interface StockItem {
  id?: string;
  StoreName: string;
  StockCde: string;
  SupplierPartNo?: string;
  StockDescription: string;
  StockCostPrice: number;
  StockQty: number;
  StockValue: number;
  ReorderLevel: number;
}

interface UseStockInventoryResult {
  stock: StockItem[];
  loading: boolean;
  error: string | null;
  addStock: (item: Omit<StockItem, "id">) => Promise<void>;
  updateStock: (id: string, updatedFields: Partial<StockItem>) => Promise<void>;
  deleteStock: (id: string) => Promise<void>;
}

// ==== HOOK IMPLEMENTATION ====
export function useStockInventory(): UseStockInventoryResult {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load & subscribe to stock data in Firestore
  useEffect(() => {
    const q = query(collection(db, "stockInventory"), orderBy("StoreName", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: StockItem[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as StockItem),
        }));
        setStock(items);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading stock:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Add stock
  const addStock = useCallback(async (item: Omit<StockItem, "id">) => {
    try {
      await addDoc(collection(db, "stockInventory"), item);
    } catch (err: any) {
      console.error("Error adding stock:", err);
      setError(err.message);
    }
  }, []);

  // Update stock
  const updateStock = useCallback(async (id: string, updatedFields: Partial<StockItem>) => {
    try {
      await updateDoc(doc(db, "stockInventory", id), updatedFields);
    } catch (err: any) {
      console.error("Error updating stock:", err);
      setError(err.message);
    }
  }, []);

  // Delete stock
  const deleteStock = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, "stockInventory", id));
    } catch (err: any) {
      console.error("Error deleting stock:", err);
      setError(err.message);
    }
  }, []);

  return { stock, loading, error, addStock, updateStock, deleteStock };
}
