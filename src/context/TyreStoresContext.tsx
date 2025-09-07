import type { StockEntry, TyreStore } from "../types/tyre";
import { addTyreStore, listenToTyreStores, updateTyreStoreEntry } from "../types/tyreStores";
import { firestore } from "../utils/firebaseConnectionHandler";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

// Context interface
interface TyreStoresContextType {
  stores: TyreStore[];
  addStore: (store: TyreStore) => Promise<void>;
  updateEntry: (storeId: string, entry: StockEntry) => Promise<void>;
  removeEntry: (storeId: string, tyreId: string) => Promise<void>;
  moveEntry: (fromStoreId: string, toStoreId: string, entry: StockEntry) => Promise<void>;
}

const TyreStoresContext = createContext<TyreStoresContextType | undefined>(undefined);

export const TyreStoresProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stores, setStores] = useState<TyreStore[]>([]);

  // subscribe to Firestore collection
  useEffect(() => {
    const unsubscribe = listenToTyreStores((all) => setStores(all));
    return () => unsubscribe();
  }, []);

  // add new store doc
  const addStoreFn = async (store: TyreStore) => {
    await addTyreStore(store);
  };

  // upsert a StockEntry in a store
  const updateEntryFn = async (storeId: string, entry: StockEntry) => {
    await updateTyreStoreEntry(storeId, entry);
  };

  // remove a StockEntry from a store
  const removeEntryFn = async (storeId: string, tyreId: string) => {
    const ref = doc(firestore, "tyreStores", storeId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error(`Store ${storeId} not found`);
    const data = snap.data() as TyreStore;
    const filtered = data.entries.filter((e) => e.tyreId !== tyreId);
    await updateDoc(ref, { entries: filtered });
  };

  // move entry between two stores
  const moveEntryFn = async (fromStoreId: string, toStoreId: string, entry: StockEntry) => {
    // remove from source
    await removeEntryFn(fromStoreId, entry.tyreId);
    // insert/update in target
    await updateTyreStoreEntry(toStoreId, entry);
  };

  return (
    <TyreStoresContext.Provider
      value={{
        stores,
        addStore: addStoreFn,
        updateEntry: updateEntryFn,
        removeEntry: removeEntryFn,
        moveEntry: moveEntryFn,
      }}
    >
      {children}
    </TyreStoresContext.Provider>
  );
};

export function useTyreStores(): TyreStoresContextType {
  const ctx = useContext(TyreStoresContext);
  if (!ctx) {
    throw new Error("useTyreStores must be used within TyreStoresProvider");
  }
  return ctx;
}
