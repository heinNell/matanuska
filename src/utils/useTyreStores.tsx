import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
  listenToTyreStores,
  addTyreStore,
  updateTyreStoreEntry
} from '../firebase';
import { TyreStore, StockEntry } from '../types/tyre';

// Define the context type
type TyreStoresContextType = {
  stores: TyreStore[];
  addStore: (store: TyreStore) => Promise<void>;
  updateEntry: (storeId: string, entry: StockEntry) => Promise<void>;
};

// Create the context with default values
const TyreStoresContext = createContext<TyreStoresContextType>({
  stores: [],
  addStore: async () => {},
  updateEntry: async () => {}
});

// Props type for the provider
interface TyreStoresProviderProps {
  children: ReactNode;
}

export function TyreStoresProvider({ children }: TyreStoresProviderProps) {
  const [stores, setStores] = useState<TyreStore[]>([]);

  useEffect(() => {
    const unsub = listenToTyreStores(setStores);
    return () => unsub();
  }, []);

  return (
    <TyreStoresContext.Provider
      value={{
        stores,
        addStore: addTyreStore,
        updateEntry: updateTyreStoreEntry
      }}
    >
      {children}
    </TyreStoresContext.Provider>
  );
}

export function useTyreStores() {
  return useContext(TyreStoresContext);
}