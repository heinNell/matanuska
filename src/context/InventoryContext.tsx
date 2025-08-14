/**
 * Inventory Context
 *
 * This context provides access to inventory data, purchase orders,
 * and vendor information throughout the application. It handles
 * synchronization with Firestore and Sage.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  importInventoryFromSage,
  importPurchaseOrdersFromSage,
  importVendorsFromSage,
} from "../api/sageIntegration";
import { firestore } from "../firebase";
import { storeIdFromName } from "../hooks/useInventoryItem";
import { InventoryItem, PurchaseOrder, StockMovement, Vendor } from "../types/inventory";

interface InventoryContextType {
  // Inventory Items
  inventoryItems: InventoryItem[];
  loadingInventory: boolean;
  errorInventory: Error | null;
  addInventoryItem: (item: Omit<InventoryItem, "id">) => Promise<string>;
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;

  // Purchase Orders
  purchaseOrders: PurchaseOrder[];
  loadingPOs: boolean;
  errorPOs: Error | null;
  addPurchaseOrder: (po: Omit<PurchaseOrder, "id">) => Promise<string>;
  updatePurchaseOrder: (id: string, data: Partial<PurchaseOrder>) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;

  // Vendors
  vendors: Vendor[];
  loadingVendors: boolean;
  errorVendors: Error | null;
  addVendor: (vendor: Omit<Vendor, "id">) => Promise<string>;
  updateVendor: (id: string, data: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;

  // Stock Movements
  addStockMovement: (movement: Omit<StockMovement, "id">) => Promise<string>;
  getStockMovementsByItem: (itemId: string) => Promise<StockMovement[]>;

  // Sage Integration
  syncWithSage: () => Promise<void>;
  lastSyncDate: Date | null;
  syncStatus: "idle" | "syncing" | "success" | "error";
  syncError: Error | null;
  // Utility helpers
  getVendorSlug: (vendorId: string) => string | undefined;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  // State for inventory items
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [errorInventory, setErrorInventory] = useState<Error | null>(null);

  // State for purchase orders
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loadingPOs, setLoadingPOs] = useState(true);
  const [errorPOs, setErrorPOs] = useState<Error | null>(null);

  // State for vendors
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [errorVendors, setErrorVendors] = useState<Error | null>(null);

  // State for Sage sync
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncError, setSyncError] = useState<Error | null>(null);

  // Set up Firestore listeners for inventory items
  useEffect(() => {
    setLoadingInventory(true);

    try {
      const q = query(collection(firestore, "inventoryItems"), orderBy("updatedAt", "desc"));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: InventoryItem[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            // Convert Firestore timestamps to ISO strings
            if (data.createdAt) {
              data.createdAt = data.createdAt.toDate
                ? data.createdAt.toDate().toISOString()
                : data.createdAt;
            }
            if (data.updatedAt) {
              data.updatedAt = data.updatedAt.toDate
                ? data.updatedAt.toDate().toISOString()
                : data.updatedAt;
            }
            return { id: doc.id, ...data } as InventoryItem;
          });

          setInventoryItems(items);
          setLoadingInventory(false);
          setErrorInventory(null);
        },
        (error) => {
          console.error("Error fetching inventory items:", error);
          setErrorInventory(error as Error);
          setLoadingInventory(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up inventory listener:", error);
      setErrorInventory(error as Error);
      setLoadingInventory(false);
      return () => {};
    }
  }, []);

  // Set up Firestore listeners for purchase orders
  useEffect(() => {
    setLoadingPOs(true);

    try {
      const q = query(collection(firestore, "purchaseOrders"), orderBy("updatedAt", "desc"));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const orders: PurchaseOrder[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            // Convert Firestore timestamps to ISO strings
            if (data.createdAt) {
              data.createdAt = data.createdAt.toDate
                ? data.createdAt.toDate().toISOString()
                : data.createdAt;
            }
            if (data.updatedAt) {
              data.updatedAt = data.updatedAt.toDate
                ? data.updatedAt.toDate().toISOString()
                : data.updatedAt;
            }
            return { id: doc.id, ...data } as PurchaseOrder;
          });

          setPurchaseOrders(orders);
          setLoadingPOs(false);
          setErrorPOs(null);
        },
        (error) => {
          console.error("Error fetching purchase orders:", error);
          setErrorPOs(error as Error);
          setLoadingPOs(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up purchase orders listener:", error);
      setErrorPOs(error as Error);
      setLoadingPOs(false);
      return () => {};
    }
  }, []);

  // Set up Firestore listeners for vendors
  useEffect(() => {
    setLoadingVendors(true);

    try {
      const q = query(collection(firestore, "vendors"), orderBy("name", "asc"));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const vendorList: Vendor[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            // Convert Firestore timestamps to ISO strings
            if (data.createdAt) {
              data.createdAt = data.createdAt.toDate
                ? data.createdAt.toDate().toISOString()
                : data.createdAt;
            }
            if (data.updatedAt) {
              data.updatedAt = data.updatedAt.toDate
                ? data.updatedAt.toDate().toISOString()
                : data.updatedAt;
            }
            return { id: doc.id, ...data } as Vendor;
          });

          setVendors(vendorList);
          setLoadingVendors(false);
          setErrorVendors(null);
        },
        (error) => {
          console.error("Error fetching vendors:", error);
          setErrorVendors(error as Error);
          setLoadingVendors(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up vendors listener:", error);
      setErrorVendors(error as Error);
      setLoadingVendors(false);
      return () => {};
    }
  }, []);

  // Add inventory item
  const addInventoryItem = async (item: Omit<InventoryItem, "id">): Promise<string> => {
    try {
      const itemData = {
        ...item,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(firestore, "inventoryItems"), itemData);
      return docRef.id;
    } catch (error) {
      console.error("Error adding inventory item:", error);
      throw error;
    }
  };

  // Update inventory item
  const updateInventoryItem = async (id: string, data: Partial<InventoryItem>): Promise<void> => {
    try {
      await updateDoc(doc(firestore, "inventoryItems", id), {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating inventory item:", error);
      throw error;
    }
  };

  // Delete inventory item
  const deleteInventoryItem = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(firestore, "inventoryItems", id));
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      throw error;
    }
  };

  // Add purchase order
  const addPurchaseOrder = async (po: Omit<PurchaseOrder, "id">): Promise<string> => {
    try {
      const poData = {
        ...po,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(firestore, "purchaseOrders"), poData);
      return docRef.id;
    } catch (error) {
      console.error("Error adding purchase order:", error);
      throw error;
    }
  };

  // Update purchase order
  const updatePurchaseOrder = async (id: string, data: Partial<PurchaseOrder>): Promise<void> => {
    try {
      await updateDoc(doc(firestore, "purchaseOrders", id), {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating purchase order:", error);
      throw error;
    }
  };

  // Delete purchase order
  const deletePurchaseOrder = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(firestore, "purchaseOrders", id));
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      throw error;
    }
  };

  // Add vendor
  const addVendor = async (vendor: Omit<Vendor, "id">): Promise<string> => {
    try {
      const vendorData = {
        ...vendor,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(firestore, "vendors"), vendorData);
      return docRef.id;
    } catch (error) {
      console.error("Error adding vendor:", error);
      throw error;
    }
  };

  // Update vendor
  const updateVendor = async (id: string, data: Partial<Vendor>): Promise<void> => {
    try {
      await updateDoc(doc(firestore, "vendors", id), {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating vendor:", error);
      throw error;
    }
  };

  // Delete vendor
  const deleteVendor = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(firestore, "vendors", id));
    } catch (error) {
      console.error("Error deleting vendor:", error);
      throw error;
    }
  };

  // Add stock movement record
  const addStockMovement = async (movement: Omit<StockMovement, "id">): Promise<string> => {
    try {
      const movementData = {
        ...movement,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(firestore, "stockMovements"), movementData);

      // Update the inventory item quantity
      const itemRef = doc(firestore, "inventoryItems", movement.itemId);

      // Update quantity based on movement type
      if (movement.type === "receipt" || movement.type === "return") {
        await updateDoc(itemRef, {
          quantity: increment(movement.quantity),
          updatedAt: Timestamp.now(),
          lastReceived: Timestamp.now(),
        });
      } else if (movement.type === "issue" || movement.type === "scrap") {
        await updateDoc(itemRef, {
          quantity: increment(-movement.quantity),
          updatedAt: Timestamp.now(),
        });
      }

      return docRef.id;
    } catch (error) {
      console.error("Error adding stock movement:", error);
      throw error;
    }
  };

  // Helper: derive a URL/slug-safe identifier for a vendor by its name
  const getVendorSlug = React.useCallback(
    (vendorId: string) => {
      const v = vendors.find((ven) => ven.id === vendorId);
      return v ? storeIdFromName(v.name) : undefined;
    },
    [vendors]
  );

  // Get stock movements for a specific item
  const getStockMovementsByItem = async (itemId: string): Promise<StockMovement[]> => {
    try {
      const q = query(
        collection(firestore, "stockMovements"),
        where("itemId", "==", itemId),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        if (data.createdAt) {
          data.createdAt = data.createdAt.toDate
            ? data.createdAt.toDate().toISOString()
            : data.createdAt;
        }
        return { id: doc.id, ...data } as StockMovement;
      });
    } catch (error) {
      console.error("Error getting stock movements:", error);
      throw error;
    }
  };

  // Sync with Sage
  const syncWithSage = async (): Promise<void> => {
    setSyncStatus("syncing");
    setSyncError(null);

    try {
      // Fetch data from Sage
      const [sageVendors, sageInventory, sagePOs] = await Promise.all([
        importVendorsFromSage(),
        importInventoryFromSage(),
        importPurchaseOrdersFromSage(),
      ]);

      // Process each vendor
      for (const vendor of sageVendors) {
        // Check if vendor exists in Firestore
        const existingVendorIndex = vendors.findIndex((v) => v.sageId === vendor.sageId);

        if (existingVendorIndex >= 0) {
          // Update existing vendor
          await updateVendor(vendors[existingVendorIndex].id, vendor);
        } else {
          // Add new vendor
          await addVendor(vendor);
        }
      }

      // Process each inventory item
      for (const item of sageInventory) {
        // Check if item exists in Firestore
        const existingItemIndex = inventoryItems.findIndex((i) => i.sageId === item.sageId);

        if (existingItemIndex >= 0) {
          // Update existing item
          await updateInventoryItem(inventoryItems[existingItemIndex].id, item);
        } else {
          // Add new item
          await addInventoryItem(item);
        }
      }

      // Process each purchase order
      for (const po of sagePOs) {
        // Check if PO exists in Firestore
        const existingPOIndex = purchaseOrders.findIndex((p) => p.sageId === po.sageId);

        if (existingPOIndex >= 0) {
          // Update existing PO
          await updatePurchaseOrder(purchaseOrders[existingPOIndex].id, po);
        } else {
          // Add new PO
          await addPurchaseOrder(po);
        }
      }

      // Update sync metadata
      const now = new Date();
      setLastSyncDate(now);
      setSyncStatus("success");

      // Save sync record to Firestore
      await addDoc(collection(firestore, "syncLogs"), {
        integrationId: "sage",
        timestamp: Timestamp.now(),
        status: "success",
        entitiesProcessed: sageVendors.length + sageInventory.length + sagePOs.length,
        entitiesSucceede: sageVendors.length + sageInventory.length + sagePOs.length,
        entitiesFailed: 0,
      });
    } catch (error) {
      console.error("Error syncing with Sage:", error);
      setSyncError(error as Error);
      setSyncStatus("error");

      // Save error record to Firestore
      await addDoc(collection(firestore, "syncLogs"), {
        integrationId: "sage",
        timestamp: Timestamp.now(),
        status: "failed",
        errorDetails: (error as Error).message,
      });
    }
  };

  // Context value
  const value: InventoryContextType = {
    // Inventory Items
    inventoryItems,
    loadingInventory,
    errorInventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,

    // Purchase Orders
    purchaseOrders,
    loadingPOs,
    errorPOs,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,

    // Vendors
    vendors,
    loadingVendors,
    errorVendors,
    addVendor,
    updateVendor,
    deleteVendor,

    // Stock Movements
    addStockMovement,
    getStockMovementsByItem,

    // Sage Integration
    syncWithSage,
    lastSyncDate,
    syncStatus,
    syncError,
    getVendorSlug,
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};
