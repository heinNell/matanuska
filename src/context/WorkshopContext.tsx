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
import {
  JobCard,
  JobCardStatus,
  WorkOrder,
  WorkOrderStatus
} from "../types/workshop-tyre-inventory";
import type { Inspection } from "@/types/inspectionTemplates";



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

  // Job Cards
  jobCards: JobCard[];
  addJobCard: (jobCard: Omit<JobCard, "id">) => Promise<string>;
  updateJobCard: (id: string, jobCard: Partial<JobCard>) => Promise<void>;
  deleteJobCard: (id: string) => Promise<void>;
  getJobCardById: (id: string) => JobCard | undefined;
  getJobCardsByStatus: (status: JobCardStatus) => JobCard[];
  getJobCardsByVehicle: (vehicleId: string) => JobCard[];
  getJobCardsByDate: (startDate: string, endDate: string) => JobCard[];
  createJobCardFromInspection: (inspectionId: string) => Promise<string>;

  // Work Orders
  workOrders: WorkOrder[];
  addWorkOrder: (workOrder: Omit<WorkOrder, "workOrderId">) => Promise<string>;
  updateWorkOrder: (id: string, workOrder: Partial<WorkOrder>) => Promise<void>;
  deleteWorkOrder: (id: string) => Promise<void>;
  getWorkOrderById: (id: string) => WorkOrder | undefined;
  getWorkOrdersByStatus: (status: WorkOrderStatus) => WorkOrder[];
  getWorkOrdersByVehicle: (vehicleId: string) => WorkOrder[];

  // Inspections
  inspections: Inspection[];
  addInspection: (inspection: Omit<Inspection, "id">) => Promise<string>;
  updateInspection: (id: string, inspection: Partial<Inspection>) => Promise<void>;
  deleteInspection: (id: string) => Promise<void>;
  getInspectionById: (id: string) => Inspection | undefined;
  getInspectionsByStatus: (status: string) => Inspection[];
  getInspectionsByVehicle: (vehicleId: string) => Inspection[];

  // Loading states
  isLoading: {
    vendors: boolean;
    stockItems: boolean;
    purchaseOrders: boolean;
    demandParts: boolean;
    jobCards: boolean;
    workOrders: boolean;
    inspections: boolean;
  };

  // Error states
  errors: {
    vendors: Error | null;
    stockItems: Error | null;
    purchaseOrders: Error | null;
    demandParts: Error | null;
    jobCards: Error | null;
    workOrders: Error | null;
    inspections: Error | null;
  };

  // Refresh functions for real-time data
  refreshJobCards: () => Promise<void>;
  refreshWorkOrders: () => Promise<void>;
  refreshInspections: () => Promise<void>;
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

  // Job Cards
  jobCards: [],
  addJobCard: async () => "",
  updateJobCard: async () => {},
  deleteJobCard: async () => {},
  getJobCardById: () => undefined,
  getJobCardsByStatus: () => [],
  getJobCardsByVehicle: () => [],
  getJobCardsByDate: () => [],
  createJobCardFromInspection: async () => "",

  // Work Orders
  workOrders: [],
  addWorkOrder: async () => "",
  updateWorkOrder: async () => {},
  deleteWorkOrder: async () => {},
  getWorkOrderById: () => undefined,
  getWorkOrdersByStatus: () => [],
  getWorkOrdersByVehicle: () => [],

  // Inspections
  inspections: [],
  addInspection: async () => "",
  updateInspection: async () => {},
  deleteInspection: async () => {},
  getInspectionById: () => undefined,
  getInspectionsByStatus: () => [],
  getInspectionsByVehicle: () => [],

  // Refresh functions
  refreshJobCards: async () => {},
  refreshWorkOrders: async () => {},
  refreshInspections: async () => {},

  isLoading: {
    vendors: false,
    stockItems: false,
    purchaseOrders: false,
    demandParts: false,
    jobCards: false,
    workOrders: false,
    inspections: false,
  },

  errors: {
    vendors: null,
    stockItems: null,
    purchaseOrders: null,
    demandParts: null,
    jobCards: null,
    workOrders: null,
    inspections: null,
  },
});

export const WorkshopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // const [user] = useAuthState(getAuth());
  const user = null; // existing behavior unchanged

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [demandParts, setDemandParts] = useState<DemandPart[]>([]);
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);

  const [isLoading, setIsLoading] = useState({
    vendors: true,
    stockItems: true,
    purchaseOrders: true,
    demandParts: true,
    jobCards: true,
    workOrders: true,
    inspections: true,
  });

  const [errors, setErrors] = useState({
    vendors: null as Error | null,
    stockItems: null as Error | null,
    purchaseOrders: null as Error | null,
    demandParts: null as Error | null,
    jobCards: null as Error | null,
    workOrders: null as Error | null,
    inspections: null as Error | null,
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

  // Job Cards
  useEffect(() => {
    if (!user) return;
    setIsLoading((prev) => ({ ...prev, jobCards: true }));

    const jobCardsRef = collection(db, "jobCards");
    const jobCardsQuery = query(jobCardsRef);

    const unsubscribe = onSnapshot(
      jobCardsQuery,
      (snapshot) => {
        const jobCardsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as JobCard[];

        setJobCards(jobCardsList);
        setIsLoading((prev) => ({ ...prev, jobCards: false }));
        setErrors((prev) => ({ ...prev, jobCards: null }));
      },
      (error) => {
        console.error("Error fetching job cards:", error);
        setErrors((prev) => ({ ...prev, jobCards: error }));
        setIsLoading((prev) => ({ ...prev, jobCards: false }));
      }
    );

    return () => unsubscribe();
  }, [db, user]);

  // Work Orders
  useEffect(() => {
    if (!user) return;
    setIsLoading((prev) => ({ ...prev, workOrders: true }));

    const workOrdersRef = collection(db, "workOrders");
    const workOrdersQuery = query(workOrdersRef);

    const unsubscribe = onSnapshot(
      workOrdersQuery,
      (snapshot) => {
        const workOrdersList = snapshot.docs.map((doc) => ({
          workOrderId: doc.id,
          ...doc.data(),
        })) as WorkOrder[];

        setWorkOrders(workOrdersList);
        setIsLoading((prev) => ({ ...prev, workOrders: false }));
        setErrors((prev) => ({ ...prev, workOrders: null }));
      },
      (error) => {
        console.error("Error fetching work orders:", error);
        setErrors((prev) => ({ ...prev, workOrders: error }));
        setIsLoading((prev) => ({ ...prev, workOrders: false }));
      }
    );

    return () => unsubscribe();
  }, [db, user]);

  // Inspections
  useEffect(() => {
    if (!user) return;
    setIsLoading((prev) => ({ ...prev, inspections: true }));

    const inspectionsRef = collection(db, "inspections");
    const inspectionsQuery = query(inspectionsRef);

    const unsubscribe = onSnapshot(
      inspectionsQuery,
      (snapshot) => {
        const inspectionsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Inspection[];

        setInspections(inspectionsList);
        setIsLoading((prev) => ({ ...prev, inspections: false }));
        setErrors((prev) => ({ ...prev, inspections: null }));
      },
      (error) => {
        console.error("Error fetching inspections:", error);
        setErrors((prev) => ({ ...prev, inspections: error }));
        setIsLoading((prev) => ({ ...prev, inspections: false }));
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

  // Job Cards functions
  const addJobCard = async (jobCard: Omit<JobCard, "id">): Promise<string> => {
    try {
      const newJobCard = {
        ...jobCard,
        createdAt: jobCard.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const jobCardRef = await addDoc(collection(db, "jobCards"), newJobCard);
      return jobCardRef.id;
    } catch (error) {
      console.error("Error adding job card:", error);
      throw error;
    }
  };

  const updateJobCard = async (id: string, jobCard: Partial<JobCard>): Promise<void> => {
    try {
      const jobCardRef = doc(db, "jobCards", id);
      await updateDoc(jobCardRef, {
        ...jobCard,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating job card:", error);
      throw error;
    }
  };

  const deleteJobCard = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "jobCards", id));
    } catch (error) {
      console.error("Error deleting job card:", error);
      throw error;
    }
  };

  const getJobCardById = (id: string): JobCard | undefined =>
    jobCards.find((jobCard) => jobCard.id === id);

  const getJobCardsByStatus = (status: JobCardStatus): JobCard[] =>
    jobCards.filter((jobCard) => jobCard.status === status);

  const getJobCardsByVehicle = (vehicleId: string): JobCard[] =>
    jobCards.filter((jobCard) => jobCard.vehicleId === vehicleId);

  const getJobCardsByDate = (startDate: string, endDate: string): JobCard[] => {
    return jobCards.filter((jobCard) => {
      const cardDate = new Date(jobCard.createdDate).getTime();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      return cardDate >= start && cardDate <= end;
    });
  };

  const createJobCardFromInspection = async (inspectionId: string): Promise<string> => {
    try {
      const inspection = inspections.find(i => i.id === inspectionId);

      if (!inspection) {
        throw new Error(`Inspection with ID ${inspectionId} not found`);
      }

      // Create a new job card from the inspection
      const newJobCard: Omit<JobCard, "id"> = {
        workOrderNumber: `WO-${new Date().getTime().toString().slice(-6)}`,
        inspectionId: inspectionId,
        vehicleId: inspection.vehicleId,
        customerName: inspection.vehicleName?.split(' (')[0] || "Unknown",
        priority: "medium", // Default priority
        status: "initiated", // Initial status
        createdDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        workDescription: `Job card created from ${inspection.inspectionType}`,
        estimatedHours: 0,
        laborRate: 0,
        partsCost: 0,
        totalEstimate: 0,
        tasks: inspection.findings?.map((finding, index) => ({
          id: `task-${index + 1}`,
          description: finding.description,
          taskType: "repair",
          priority: finding.severity as "low" | "medium" | "high" | "critical",
          estimatedHours: 1, // Default estimated hours
          status: "pending",
          partsRequired: [],
          notes: finding.recommendedAction || "",
        })) || [],
        totalLaborHours: 0,
        totalPartsValue: 0,
        notes: `Created from inspection ${inspectionId}`,
        faultIds: [],
        attachments: [],
        remarks: [],
        timeLog: [],
        linkedPOIds: [],
        createdBy: "system",
        updatedAt: new Date().toISOString(),
        odometer: 0,
        model: "",
        tyrePositions: [],
        memo: "",
        additionalCosts: 0,
        rcaRequired: false,
        rcaCompleted: false,
      };

      return await addJobCard(newJobCard);
    } catch (error) {
      console.error("Error creating job card from inspection:", error);
      throw error;
    }
  };

  // Work Orders functions
  const addWorkOrder = async (workOrder: Omit<WorkOrder, "workOrderId">): Promise<string> => {
    try {
      const newWorkOrder = {
        ...workOrder,
        createdAt: workOrder.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const workOrderRef = await addDoc(collection(db, "workOrders"), newWorkOrder);
      return workOrderRef.id;
    } catch (error) {
      console.error("Error adding work order:", error);
      throw error;
    }
  };

  const updateWorkOrder = async (id: string, workOrder: Partial<WorkOrder>): Promise<void> => {
    try {
      const workOrderRef = doc(db, "workOrders", id);
      await updateDoc(workOrderRef, {
        ...workOrder,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating work order:", error);
      throw error;
    }
  };

  const deleteWorkOrder = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "workOrders", id));
    } catch (error) {
      console.error("Error deleting work order:", error);
      throw error;
    }
  };

  const getWorkOrderById = (id: string): WorkOrder | undefined =>
    workOrders.find((workOrder) => workOrder.workOrderId === id);

  const getWorkOrdersByStatus = (status: WorkOrderStatus): WorkOrder[] =>
    workOrders.filter((workOrder) => workOrder.status === status);

  const getWorkOrdersByVehicle = (vehicleId: string): WorkOrder[] =>
    workOrders.filter((workOrder) => workOrder.vehicleId === vehicleId);

  // Inspection functions
  const addInspection = async (inspection: Omit<Inspection, "id">): Promise<string> => {
    try {
      const newInspection = {
        ...inspection,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const inspectionRef = await addDoc(collection(db, "inspections"), newInspection);
      return inspectionRef.id;
    } catch (error) {
      console.error("Error adding inspection:", error);
      throw error;
    }
  };

  const updateInspection = async (id: string, inspection: Partial<Inspection>): Promise<void> => {
    try {
      const inspectionRef = doc(db, "inspections", id);
      await updateDoc(inspectionRef, {
        ...inspection,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating inspection:", error);
      throw error;
    }
  };

  const deleteInspection = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "inspections", id));
    } catch (error) {
      console.error("Error deleting inspection:", error);
      throw error;
    }
  };

  const getInspectionById = (id: string): Inspection | undefined =>
    inspections.find((inspection) => inspection.id === id);

  const getInspectionsByStatus = (status: string): Inspection[] =>
    inspections.filter((inspection) => inspection.status === status);

  const getInspectionsByVehicle = (vehicleId: string): Inspection[] =>
    inspections.filter((inspection) => inspection.vehicleId === vehicleId);

  // Refresh functions to force fetch new data
  const refreshJobCards = async (): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, jobCards: true }));

      // In a real implementation with Firestore, we might fetch data directly
      // Since we're using onSnapshot which automatically updates the state,
      // we'll use mock data for demonstration purposes

      // This simulates refreshed job cards data
      const mockJobCards: JobCard[] = [
        {
          id: 'jc-001',
          workOrderNumber: 'WO-20250822-001',
          vehicleId: 'VEH-001',
          customerName: 'Acme Logistics',
          priority: 'high',
          status: 'in_progress',
          createdAt: '2025-08-20T10:00:00Z',
          createdDate: '2025-08-20T10:00:00Z',
          scheduledDate: '2025-08-22T09:00:00Z',
          assignedTechnician: 'John Doe',
          workDescription: 'Routine maintenance and brake inspection',
          estimatedHours: 4,
          laborRate: 75,
          partsCost: 250,
          totalEstimate: 550,
          tasks: [
            {
              id: 'task-001',
              description: 'Oil Change',
              taskType: 'service',
              priority: 'medium',
              estimatedHours: 1,
              status: 'completed',
              notes: 'Used synthetic oil',
              partsRequired: []
            },
            {
              id: 'task-002',
              description: 'Brake Inspection',
              taskType: 'inspect',
              priority: 'high',
              estimatedHours: 1,
              status: 'in_progress',
              notes: 'Front pads need replacement',
              partsRequired: []
            }
          ],
          totalLaborHours: 2,
          totalPartsValue: 250,
          notes: 'Customer requested completion by EOD',
          faultIds: ['fault-001', 'fault-002'],
          attachments: [],
          remarks: [],
          timeLog: [],
          linkedPOIds: ['po-001'],
          createdBy: 'admin',
          updatedAt: '2025-08-21T14:30:00Z',
          odometer: 15000,
          model: 'Volvo FH16',
          tyrePositions: [],
          memo: '',
          additionalCosts: 50,
          rcaRequired: false,
          rcaCompleted: false
        },
        {
          id: 'jc-002',
          workOrderNumber: 'WO-20250821-002',
          vehicleId: 'VEH-003',
          customerName: 'Global Transport',
          priority: 'critical',
          status: 'parts_pending',
          createdAt: '2025-08-21T08:15:00Z',
          createdDate: '2025-08-21T08:15:00Z',
          assignedTechnician: 'Jane Smith',
          workDescription: 'Engine warning light diagnosis and repair',
          estimatedHours: 6,
          laborRate: 85,
          partsCost: 750,
          totalEstimate: 1260,
          tasks: [
            {
              id: 'task-004',
              description: 'Diagnostic Scan',
              taskType: 'service',
              priority: 'high',
              estimatedHours: 1,
              status: 'completed',
              notes: 'Found fault code P0401',
              partsRequired: []
            }
          ],
          totalLaborHours: 1,
          totalPartsValue: 750,
          notes: 'Vehicle needed urgently by customer',
          faultIds: ['fault-003'],
          attachments: [],
          remarks: [],
          timeLog: [],
          linkedPOIds: ['po-002'],
          createdBy: 'supervisor',
          updatedAt: '2025-08-21T16:45:00Z',
          odometer: 45000,
          model: 'Mercedes Actros',
          tyrePositions: [],
          memo: 'Customer approval received for additional work',
          additionalCosts: 0,
          rcaRequired: true,
          rcaCompleted: false
        }
      ];

      setJobCards(mockJobCards);
      setErrors((prev) => ({ ...prev, jobCards: null }));
    } catch (error) {
      console.error("Error refreshing job cards:", error);
      setErrors((prev) => ({ ...prev, jobCards: error as Error }));
    } finally {
      setIsLoading((prev) => ({ ...prev, jobCards: false }));
    }
  };

  const refreshWorkOrders = async (): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, workOrders: true }));

      // Mock data for demonstration
      const mockWorkOrders: WorkOrder[] = [
        {
          workOrderId: 'wo-001',
          vehicleId: 'VEH-001',
          status: 'in_progress',
          priority: 'high',
          title: 'Scheduled Maintenance',
          description: 'Comprehensive service including oil change, filters, and safety inspection',
          tasks: [
            {
              taskId: 'task-001',
              description: 'Oil and Filter Change',
              status: 'completed',
              assignedTo: 'John Doe',
              estimatedHours: 1,
              actualHours: 0.75,
              notes: 'Used synthetic oil'
            },
            {
              taskId: 'task-002',
              description: 'Safety Inspection',
              status: 'in_progress',
              assignedTo: 'Jane Smith',
              estimatedHours: 1,
              notes: ''
            }
          ],
          partsUsed: [
            {
              partId: 'part-001',
              partNumber: 'OIL-5W30',
              description: 'Synthetic Oil 5W30',
              quantity: 10,
              unitCost: 12.5,
              totalCost: 125,
              supplier: 'Auto Parts Inc',
              status: 'installed'
            }
          ],
          laborEntries: [
            {
              laborId: 'labor-001',
              technicianId: 'tech-001',
              technicianName: 'John Doe',
              laborCode: 'OIL-CHG',
              hoursWorked: 0.75,
              hourlyRate: 75,
              totalCost: 56.25,
              date: '2025-08-22T10:30:00Z'
            }
          ],
          attachments: [],
          remarks: [],
          timeLog: [],
          linkedInspectionId: 'insp-001',
          linkedPOIds: [],
          createdBy: 'admin',
          createdAt: '2025-08-21T09:00:00Z',
          updatedAt: '2025-08-22T10:45:00Z',
          startedAt: '2025-08-22T10:00:00Z'
        },
        {
          workOrderId: 'wo-002',
          vehicleId: 'VEH-003',
          status: 'initiated',
          priority: 'critical',
          title: 'Engine Repair',
          description: 'Investigate engine warning light and repair issue',
          tasks: [
            {
              taskId: 'task-003',
              description: 'Diagnostic Scan',
              status: 'pending',
              estimatedHours: 1,
              notes: ''
            }
          ],
          partsUsed: [],
          laborEntries: [],
          attachments: [],
          remarks: [
            {
              remarkId: 'remark-001',
              text: 'Customer reported engine running rough',
              addedBy: 'Service Advisor',
              addedAt: '2025-08-22T09:00:00Z',
              type: 'customer'
            }
          ],
          timeLog: [],
          linkedPOIds: [],
          createdBy: 'service-advisor',
          createdAt: '2025-08-22T09:00:00Z',
          updatedAt: '2025-08-22T09:00:00Z'
        }
      ];

      setWorkOrders(mockWorkOrders);
      setErrors((prev) => ({ ...prev, workOrders: null }));
    } catch (error) {
      console.error("Error refreshing work orders:", error);
      setErrors((prev) => ({ ...prev, workOrders: error as Error }));
    } finally {
      setIsLoading((prev) => ({ ...prev, workOrders: false }));
    }
  };

  const refreshInspections = async (): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, inspections: true }));

      // Mock data for demonstration
      const mockInspections: Inspection[] = [
        {
          id: 'insp-001',
          vehicleId: 'VEH-001',
          vehicleName: 'Volvo FH16 (VEH-001)',
          inspectionType: 'Pre-Trip Inspection',
          status: 'completed',
          performedBy: 'John Doe',
          inspectionDate: '2025-08-21T08:00:00Z',
          completedAt: '2025-08-21T08:30:00Z',
          findings: [
            {
              id: 'find-001',
              category: 'Tires',
              description: 'Front right tire showing uneven wear',
              severity: 'medium',
              recommendedAction: 'Schedule rotation and alignment',
              status: 'new'
            },
            {
              id: 'find-002',
              category: 'Lights',
              description: 'Left taillight intermittently working',
              severity: 'low',
              recommendedAction: 'Replace bulb',
              status: 'new'
            }
          ],
          createdAt: '2025-08-21T08:00:00Z',
          updatedAt: '2025-08-21T08:30:00Z'
        },
        {
          id: 'insp-002',
          vehicleId: 'VEH-002',
          vehicleName: 'Scania R500 (VEH-002)',
          inspectionType: 'Annual DOT Inspection',
          status: 'in_progress',
          performedBy: 'Jane Smith',
          inspectionDate: '2025-08-22T09:00:00Z',
          dueDate: '2025-08-22T17:00:00Z',
          createdAt: '2025-08-22T09:00:00Z',
          updatedAt: '2025-08-22T09:00:00Z'
        }
      ];

      setInspections(mockInspections);
      setErrors((prev) => ({ ...prev, inspections: null }));
    } catch (error) {
      console.error("Error refreshing inspections:", error);
      setErrors((prev) => ({ ...prev, inspections: error as Error }));
    } finally {
      setIsLoading((prev) => ({ ...prev, inspections: false }));
    }
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

    // Job Cards
    jobCards,
    addJobCard,
    updateJobCard,
    deleteJobCard,
    getJobCardById,
    getJobCardsByStatus,
    getJobCardsByVehicle,
    getJobCardsByDate,
    createJobCardFromInspection,

    // Work Orders
    workOrders,
    addWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    getWorkOrderById,
    getWorkOrdersByStatus,
    getWorkOrdersByVehicle,

    // Inspections
    inspections,
    addInspection,
    updateInspection,
    deleteInspection,
    getInspectionById,
    getInspectionsByStatus,
    getInspectionsByVehicle,

    // Refresh functions
    refreshJobCards,
    refreshWorkOrders,
    refreshInspections,

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

