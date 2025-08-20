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
  lastRestocked: string; // required string
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

// Demand parts
export interface DemandPart {
  id: string;
  sku: string;
  description: string;
  quantity: number;
  workOrderId: string;
  vehicleId: string;
  status: "PENDING" | "ORDERED" | "RECEIVED" | "CANCELLED";
  urgency: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
  demandedBy: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  poId?: string;
}

export interface StockItemInput {
  id: string;
  name: string;
  quantity: number;
  lastRestocked?: string; // allow undefined
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

  // Demand Parts
  demandParts: DemandPart[];
  addDemandPart: (part: Omit<DemandPart, "id">) => Promise<string>;
  updateDemandPart: (id: string, part: Partial<DemandPart>) => Promise<void>;
  deleteDemandPart: (id: string) => Promise<void>;
  getDemandPartById: (id: string) => DemandPart | undefined;
  getDemandPartsByWorkOrder: (workOrderId: string) => DemandPart[];
  getDemandPartsByVehicle: (vehicleId: string) => DemandPart[];
  getDemandPartsByStatus: (status: DemandPart["status"]) => DemandPart[];

  // Loading states
  isLoading: {
    vendors: boolean;
    stockItems: boolean;
    purchaseOrders: boolean;
    demandParts: boolean;
  };

  // Error states
  errors: {
    vendors: Error | null;
    stockItems: Error | null;
    purchaseOrders: Error | null;
    demandParts: Error | null;
  };
}

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

  demandParts: [],
  addDemandPart: async () => "",
  updateDemandPart: async () => {},
  deleteDemandPart: async () => {},
  getDemandPartById: () => undefined,
  getDemandPartsByWorkOrder: () => [],
  getDemandPartsByVehicle: () => [],
  getDemandPartsByStatus: () => [],

  isLoading: {
    vendors: false,
    stockItems: false,
    purchaseOrders: false,
    demandParts: false,
  },

  errors: {
    vendors: null,
    stockItems: null,
    purchaseOrders: null,
    demandParts: null,
  },
});

export const WorkshopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // const [user] = useAuthState(getAuth());
  const user = null; // existing behavior unchanged

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [demandParts, setDemandParts] = useState<DemandPart[]>([]);

  const [isLoading, setIsLoading] = useState({
    vendors: true,
    stockItems: true,
    purchaseOrders: true,
    demandParts: true,
  });

  const [errors, setErrors] = useState({
    vendors: null as Error | null,
    stockItems: null as Error | null,
    purchaseOrders: null as Error | null,
    demandParts: null as Error | null,
  });

  const db = getFirestore();

  // Vendors
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

  // Stock Items
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

  // Purchase Orders
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

  // Demand Parts
  useEffect(() => {
    if (!user) return;
    setIsLoading((prev) => ({ ...prev, demandParts: true }));

    const demandPartsRef = collection(db, "demandParts");
    const demandPartsQuery = query(demandPartsRef);

    const unsubscribe = onSnapshot(
      demandPartsQuery,
      (snapshot) => {
        const demandPartsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as DemandPart[];

        setDemandParts(demandPartsList);
        setIsLoading((prev) => ({ ...prev, demandParts: false }));
        setErrors((prev) => ({ ...prev, demandParts: null }));
      },
      (error) => {
        console.error("Error fetching demand parts:", error);
        setErrors((prev) => ({ ...prev, demandParts: error }));
        setIsLoading((prev) => ({ ...prev, demandParts: false }));
      }
    );

    return () => unsubscribe();
  }, [db, user]);

  // Vendor functions
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

  const getVendorById = (id: string): Vendor | undefined =>
    vendors.find((vendor) => vendor.id === id);

  // Stock functions
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

  const getStockItemById = (id: string): StockItem | undefined =>
    stockItems.find((item) => item.id === id);

  const getStockItemsByCategory = (category: string): StockItem[] =>
    stockItems.filter((item) => item.category === category);

  const getStockItemsByVendor = (vendorId: string): StockItem[] =>
    stockItems.filter((item) => item.vendorId === vendorId);

  const getLowStockItems = (): StockItem[] =>
    stockItems.filter((item) => item.quantity <= item.reorderLevel);

  // Purchase orders
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

  const getPurchaseOrderById = (id: string): PurchaseOrder | undefined =>
    purchaseOrders.find((po) => po.id === id);

  const getPurchaseOrdersByStatus = (status: PurchaseOrder["status"]): PurchaseOrder[] =>
    purchaseOrders.filter((po) => po.status === status);

  const getPurchaseOrdersByVendor = (vendorId: string): PurchaseOrder[] =>
    purchaseOrders.filter((po) => po.vendorId === vendorId);

  // Demand parts
  const addDemandPart = async (part: Omit<DemandPart, "id">): Promise<string> => {
    try {
      const newPart = {
        ...part,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const partRef = await addDoc(collection(db, "demandParts"), newPart);
      return partRef.id;
    } catch (error) {
      console.error("Error adding demand part:", error);
      throw error;
    }
  };

  const updateDemandPart = async (id: string, part: Partial<DemandPart>): Promise<void> => {
    try {
      const partRef = doc(db, "demandParts", id);
      await updateDoc(partRef, {
        ...part,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating demand part:", error);
      throw error;
    }
  };

  const deleteDemandPart = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "demandParts", id));
    } catch (error) {
      console.error("Error deleting demand part:", error);
      throw error;
    }
  };

  const getDemandPartById = (id: string): DemandPart | undefined =>
    demandParts.find((part) => part.id === id);

  const getDemandPartsByWorkOrder = (workOrderId: string): DemandPart[] =>
    demandParts.filter((part) => part.workOrderId === workOrderId);

  const getDemandPartsByVehicle = (vehicleId: string): DemandPart[] =>
    demandParts.filter((part) => part.vehicleId === vehicleId);

  const getDemandPartsByStatus = (status: DemandPart["status"]): DemandPart[] =>
    demandParts.filter((part) => part.status === status);

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
        if (!record.itemCode || !record.itemName || !record.category) {
          throw new Error(`Missing required fields for item ${record.itemCode || "unknown"}`);
        }

        if (record.vendor && !record.vendorId) {
          const vendor = vendors.find((v) => v.vendorName === record.vendor);
          if (vendor) record.vendorId = vendor.id;
        }

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
          lastRestocked: record.lastRestocked || new Date().toISOString().slice(0, 10), // ensure string
        };

        const existingItem = stockItems.find((i) => i.itemCode === stockItem.itemCode);

        if (existingItem) {
          await updateStockItem(existingItem.id, stockItem);
        } else {
          const itemToAdd: Omit<StockItem, "id"> = {
            ...stockItem,
            lastRestocked: stockItem.lastRestocked || new Date().toISOString(),
          };
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
        if (!record.vendorId || !record.vendorName) {
          throw new Error(`Missing required fields for vendor ${record.vendorName || "unknown"}`);
        }

        const vendor = {
          vendorId: record.vendorId,
          vendorName: record.vendorName,
          contactPerson: record.contactPerson || "",
          workEmail: record.workEmail || "",
          mobile: record.mobile || "",
          address: record.address || "",
          city: record.city || "",
        };

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
    vendors,
    addVendor,
    updateVendor,
    deleteVendor,
    getVendorById,
    importVendorsFromCSV,

    stockItems,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    getStockItemById,
    getStockItemsByCategory,
    getStockItemsByVendor,
    getLowStockItems,
    importStockItemsFromCSV,

    purchaseOrders,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getPurchaseOrderById,
    getPurchaseOrdersByStatus,
    getPurchaseOrdersByVendor,

    demandParts,
    addDemandPart,
    updateDemandPart,
    deleteDemandPart,
    getDemandPartById,
    getDemandPartsByWorkOrder,
    getDemandPartsByVehicle,
    getDemandPartsByStatus,

    isLoading,
    errors,
  };

  return <WorkshopContext.Provider value={value}>{children}</WorkshopContext.Provider>;
};

export const useWorkshop = (): WorkshopContextType => {
  const context = useContext(WorkshopContext);
  if (context === undefined) {
    throw new Error("useWorkshop must be used within a WorkshopProvider");
  }
  return context;
};

