import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

// Define types for Workshop items
export interface Vendor {
  id: string;
  vendorId: string;
  vendorName: string;
  contactPerson: string;
  workEmail: string;
  mobile: string;
  address: string;
  city: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  subCategory?: string;
  description: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  cost: number;
  vendor: string;
  vendorId: string;
  location: string;
  lastRestocked: string;
  qrCode?: string;
  serialNumber?: string;
  barcode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrderItem {
  id: string;
  itemCode: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  title: string;
  description: string;
  dueDate: string;
  vendor: string;
  vendorId?: string;
  requester: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Draft" | "Pending" | "Approved" | "Ordered" | "Received" | "Cancelled" | "Completed";
  terms: string;
  poType: "Standard" | "Emergency" | "Planned" | "Service";
  shippingAddress: string;
  items: PurchaseOrderItem[];
  subTotal: number;
  tax: number;
  shipping: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  attachments: string[];
}

// Context interface
interface WorkshopContextType {
  // Vendors
  vendors: Vendor[];
  addVendor: (vendor: Omit<Vendor, "id">) => Promise<string>;
  updateVendor: (id: string, vendor: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  getVendorById: (id: string) => Vendor | undefined;
  importVendorsFromCSV: (
    vendors: Partial<Vendor>[]
  ) => Promise<{ success: number; failed: number; errors: string[] }>;

  // Stock Inventory
  stockItems: StockItem[];
  addStockItem: (item: Omit<StockItem, "id">) => Promise<string>;
  updateStockItem: (id: string, item: Partial<StockItem>) => Promise<void>;
  deleteStockItem: (id: string) => Promise<void>;
  getStockItemById: (id: string) => StockItem | undefined;
  getStockItemsByCategory: (category: string) => StockItem[];
  getStockItemsByVendor: (vendorId: string) => StockItem[];
  getLowStockItems: () => StockItem[];
  importStockItemsFromCSV: (
    items: Partial<StockItem>[]
  ) => Promise<{ success: number; failed: number; errors: string[] }>;

  // Purchase Orders
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: Omit<PurchaseOrder, "id">) => Promise<string>;
  updatePurchaseOrder: (id: string, po: Partial<PurchaseOrder>) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  getPurchaseOrderById: (id: string) => PurchaseOrder | undefined;
  getPurchaseOrdersByStatus: (status: PurchaseOrder["status"]) => PurchaseOrder[];
  getPurchaseOrdersByVendor: (vendorId: string) => PurchaseOrder[];

  // Loading states
  isLoading: {
    vendors: boolean;
    stockItems: boolean;
    purchaseOrders: boolean;
  };

  // Error states
  errors: {
    vendors: Error | null;
    stockItems: Error | null;
    purchaseOrders: Error | null;
  };
}

// Create the context with default values
const WorkshopContext = createContext<WorkshopContextType>({
  vendors: [],
  addVendor: async () => "",
  updateVendor: async () => {},
  deleteVendor: async () => {},
  getVendorById: () => undefined,
  importVendorsFromCSV: async () => ({ success: 0, failed: 0, errors: [] }),

  stockItems: [],
  addStockItem: async () => "",
  updateStockItem: async () => {},
  deleteStockItem: async () => {},
  getStockItemById: () => undefined,
  getStockItemsByCategory: () => [],
  getStockItemsByVendor: () => [],
  getLowStockItems: () => [],
  importStockItemsFromCSV: async () => ({ success: 0, failed: 0, errors: [] }),

  purchaseOrders: [],
  addPurchaseOrder: async () => "",
  updatePurchaseOrder: async () => {},
  deletePurchaseOrder: async () => {},
  getPurchaseOrderById: () => undefined,
  getPurchaseOrdersByStatus: () => [],
  getPurchaseOrdersByVendor: () => [],

  isLoading: {
    vendors: false,
    stockItems: false,
    purchaseOrders: false,
  },

  errors: {
    vendors: null,
    stockItems: null,
    purchaseOrders: null,
  },
});

// Provider component
export const WorkshopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // User authentication
  // const [user] = useAuthState(getAuth());
  const user = null; // Temporary placeholder

  // State for data
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  // Loading and error states
  const [isLoading, setIsLoading] = useState({
    vendors: true,
    stockItems: true,
    purchaseOrders: true,
  });

  const [errors, setErrors] = useState({
    vendors: null as Error | null,
    stockItems: null as Error | null,
    purchaseOrders: null as Error | null,
  });

  // Firestore instance
  const db = getFirestore();

  // Fetch vendors from Firestore
  useEffect(() => {
    if (!user) return;

    setIsLoading((prev) => ({ ...prev, vendors: true }));

    const vendorsRef = collection(db, "vendors");
    const vendorsQuery = query(vendorsRef);

    const unsubscribe = onSnapshot(
      vendorsQuery,
      (snapshot) => {
        const vendorsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Vendor[];

        setVendors(vendorsList);
        setIsLoading((prev) => ({ ...prev, vendors: false }));
        setErrors((prev) => ({ ...prev, vendors: null }));
      },
      (error) => {
        console.error("Error fetching vendors:", error);
        setErrors((prev) => ({ ...prev, vendors: error }));
        setIsLoading((prev) => ({ ...prev, vendors: false }));
      }
    );

    return () => unsubscribe();
  }, [db, user]);

  // Fetch stock items from Firestore
  useEffect(() => {
    if (!user) return;

    setIsLoading((prev) => ({ ...prev, stockItems: true }));

    const stockItemsRef = collection(db, "stockInventory");
    const stockItemsQuery = query(stockItemsRef);

    const unsubscribe = onSnapshot(
      stockItemsQuery,
      (snapshot) => {
        const stockItemsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as StockItem[];

        setStockItems(stockItemsList);
        setIsLoading((prev) => ({ ...prev, stockItems: false }));
        setErrors((prev) => ({ ...prev, stockItems: null }));
      },
      (error) => {
        console.error("Error fetching stock items:", error);
        setErrors((prev) => ({ ...prev, stockItems: error }));
        setIsLoading((prev) => ({ ...prev, stockItems: false }));
      }
    );

    return () => unsubscribe();
  }, [db, user]);

  // Fetch purchase orders from Firestore
  useEffect(() => {
    if (!user) return;

    setIsLoading((prev) => ({ ...prev, purchaseOrders: true }));

    const purchaseOrdersRef = collection(db, "purchaseOrders");
    const purchaseOrdersQuery = query(purchaseOrdersRef);

    const unsubscribe = onSnapshot(
      purchaseOrdersQuery,
      (snapshot) => {
        const purchaseOrdersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PurchaseOrder[];

        setPurchaseOrders(purchaseOrdersList);
        setIsLoading((prev) => ({ ...prev, purchaseOrders: false }));
        setErrors((prev) => ({ ...prev, purchaseOrders: null }));
      },
      (error) => {
        console.error("Error fetching purchase orders:", error);
        setErrors((prev) => ({ ...prev, purchaseOrders: error }));
        setIsLoading((prev) => ({ ...prev, purchaseOrders: false }));
      }
    );

    return () => unsubscribe();
  }, [db, user]);

  // ===== VENDOR FUNCTIONS =====
  const addVendor = async (vendor: Omit<Vendor, "id">): Promise<string> => {
    try {
      const newVendor = {
        ...vendor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const vendorRef = await addDoc(collection(db, "vendors"), newVendor);
      return vendorRef.id;
    } catch (error) {
      console.error("Error adding vendor:", error);
      throw error;
    }
  };

  const updateVendor = async (id: string, vendor: Partial<Vendor>): Promise<void> => {
    try {
      const vendorRef = doc(db, "vendors", id);
      await updateDoc(vendorRef, {
        ...vendor,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating vendor:", error);
      throw error;
    }
  };

  const deleteVendor = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "vendors", id));
    } catch (error) {
      console.error("Error deleting vendor:", error);
      throw error;
    }
  };

  const getVendorById = (id: string): Vendor | undefined => {
    return vendors.find((vendor) => vendor.id === id);
  };

  // ===== STOCK ITEM FUNCTIONS =====
  const addStockItem = async (item: Omit<StockItem, "id">): Promise<string> => {
    try {
      const newItem = {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const itemRef = await addDoc(collection(db, "stockInventory"), newItem);
      return itemRef.id;
    } catch (error) {
      console.error("Error adding stock item:", error);
      throw error;
    }
  };

  const updateStockItem = async (id: string, item: Partial<StockItem>): Promise<void> => {
    try {
      const itemRef = doc(db, "stockInventory", id);
      await updateDoc(itemRef, {
        ...item,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating stock item:", error);
      throw error;
    }
  };

  const deleteStockItem = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "stockInventory", id));
    } catch (error) {
      console.error("Error deleting stock item:", error);
      throw error;
    }
  };

  const getStockItemById = (id: string): StockItem | undefined => {
    return stockItems.find((item) => item.id === id);
  };

  const getStockItemsByCategory = (category: string): StockItem[] => {
    return stockItems.filter((item) => item.category === category);
  };

  const getStockItemsByVendor = (vendorId: string): StockItem[] => {
    return stockItems.filter((item) => item.vendorId === vendorId);
  };

  const getLowStockItems = (): StockItem[] => {
    return stockItems.filter((item) => item.quantity <= item.reorderLevel);
  };

  // ===== PURCHASE ORDER FUNCTIONS =====
  const addPurchaseOrder = async (po: Omit<PurchaseOrder, "id">): Promise<string> => {
    try {
      const newPO = {
        ...po,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const poRef = await addDoc(collection(db, "purchaseOrders"), newPO);
      return poRef.id;
    } catch (error) {
      console.error("Error adding purchase order:", error);
      throw error;
    }
  };

  const updatePurchaseOrder = async (id: string, po: Partial<PurchaseOrder>): Promise<void> => {
    try {
      const poRef = doc(db, "purchaseOrders", id);
      await updateDoc(poRef, {
        ...po,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating purchase order:", error);
      throw error;
    }
  };

  const deletePurchaseOrder = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "purchaseOrders", id));
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      throw error;
    }
  };

  const getPurchaseOrderById = (id: string): PurchaseOrder | undefined => {
    return purchaseOrders.find((po) => po.id === id);
  };

  const getPurchaseOrdersByStatus = (status: PurchaseOrder["status"]): PurchaseOrder[] => {
    return purchaseOrders.filter((po) => po.status === status);
  };

  const getPurchaseOrdersByVendor = (vendorId: string): PurchaseOrder[] => {
    return purchaseOrders.filter((po) => po.vendorId === vendorId);
  };

  // Bulk import stock items from CSV
  const importStockItemsFromCSV = async (
    items: Partial<StockItem>[]
  ): Promise<{ success: number; failed: number; errors: string[] }> => {
    const importResults = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const record of items) {
      try {
        // Validate required fields
        if (!record.itemCode || !record.itemName || !record.category) {
          throw new Error(`Missing required fields for item ${record.itemCode || "unknown"}`);
        }

        // Find vendor ID if only name is provided
        if (record.vendor && !record.vendorId) {
          const vendor = vendors.find((v) => v.vendorName === record.vendor);
          if (vendor) {
            record.vendorId = vendor.id;
          }
        }

        // Prepare complete record
        const stockItem = {
          itemCode: record.itemCode || "",
          itemName: record.itemName || "",
          category: record.category || "",
          subCategory: record.subCategory || "",
          description: record.description || "",
          unit: record.unit || "ea",
          quantity: Number(record.quantity) || 0,
          reorderLevel: Number(record.reorderLevel) || 0,
          cost: Number(record.cost) || 0,
          vendor: record.vendor || "",
          vendorId: record.vendorId || "",
          location: record.location || "",
          lastRestocked: record.lastRestocked || new Date().toISOString().split("T")[0], // Ensure this is always a string
        };

        // Check for existing item to update instead of adding duplicate
        const existingItem = stockItems.find((item) => item.itemCode === stockItem.itemCode);

        if (existingItem) {
          await updateStockItem(existingItem.id, stockItem);
        } else {
          const itemToAdd: Omit<StockItem, "id"> = stockItem;
          await addStockItem(itemToAdd);
        }

        importResults.success++;
      } catch (error) {
        console.error("Error importing stock item:", error);
        importResults.failed++;
        importResults.errors.push(`${record.itemCode || "unknown"}: ${(error as Error).message}`);
      }
    }

    return importResults;
  };

  // Bulk import vendors from CSV
  const importVendorsFromCSV = async (
    records: Partial<Vendor>[]
  ): Promise<{ success: number; failed: number; errors: string[] }> => {
    const importResults = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const record of records) {
      try {
        // Validate required fields
        if (!record.vendorId || !record.vendorName) {
          throw new Error(`Missing required fields for vendor ${record.vendorName || "unknown"}`);
        }

        // Prepare complete record
        const vendor = {
          vendorId: record.vendorId,
          vendorName: record.vendorName,
          contactPerson: record.contactPerson || "",
          workEmail: record.workEmail || "",
          mobile: record.mobile || "",
          address: record.address || "",
          city: record.city || "",
        };

        // Check for existing vendor to update instead of adding duplicate
        const existingVendor = vendors.find((v) => v.vendorId === vendor.vendorId);

        if (existingVendor) {
          await updateVendor(existingVendor.id, vendor);
        } else {
          await addVendor(vendor);
        }

        importResults.success++;
      } catch (error) {
        console.error("Error importing vendor:", error);
        importResults.failed++;
        importResults.errors.push(`${record.vendorId || "unknown"}: ${(error as Error).message}`);
      }
    }

    return importResults;
  };

  const value = {
    // Vendors
    vendors,
    addVendor,
    updateVendor,
    deleteVendor,
    getVendorById,
    importVendorsFromCSV,

    // Stock Items
    stockItems,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    getStockItemById,
    getStockItemsByCategory,
    getStockItemsByVendor,
    getLowStockItems,
    importStockItemsFromCSV,

    // Purchase Orders
    purchaseOrders,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getPurchaseOrderById,
    getPurchaseOrdersByStatus,
    getPurchaseOrdersByVendor,

    // Loading states
    isLoading,

    // Error states
    errors,
  };

  return <WorkshopContext.Provider value={value}>{children}</WorkshopContext.Provider>;
};

// Custom hook to use the Workshop context
export const useWorkshop = (): WorkshopContextType => {
  const context = useContext(WorkshopContext);
  if (context === undefined) {
    throw new Error("useWorkshop must be used within a WorkshopProvider");
  }
  return context;
};
