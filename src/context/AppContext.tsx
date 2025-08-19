import { addDoc, collection, deleteDoc, doc, getFirestore, Timestamp, writeBatch, serverTimestamp } from "firebase/firestore";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActionItem,
  AdditionalCost,
  Attachment,
  CARReport,
  CostEntry,
  DelayReason,
  DieselConsumptionRecord,
  DriverBehaviorEvent,
  FLEETS_WITH_PROBES,
  LoadPlan,
  MissedLoad,
  Trip,
  TripFinancialAnalysis,
  TripTemplate,
} from "../types";
import { AuditLog as AuditLogType } from "../types/audit";
import { Client } from "../types/client";
import { Trip as TripFromTripTs, TripStatus } from "../types/trip";
import { VehicleInspection } from "../types/vehicle";
import { JobCard as JobCardType } from "../types/workshop-job-card";
import { loadGoogleMapsScript } from "../utils/googleMapsLoader";
import { TyreInventoryItem } from "../utils/tyreConstants";

import { v4 as uuidv4 } from "uuid";
import {
  addAuditLogToFirebase,
  addDieselToFirebase,
  addMissedLoadToFirebase,
  addTripToFirebase,
  deleteTripFromFirebase,
  updateTripInFirebase,
} from "../firebase";
import {
  addConnectionListener,
  disableFirestoreNetwork,
  enableFirestoreNetwork,
  removeConnectionListener,
} from "../utils/firestoreConnection";
import { generateTripId } from "../utils/helpers";
import syncService from "../utils/syncService";
import { sendDriverBehaviorEvent, sendTripEvent } from "../utils/webhookSenders";

// Helper function to adapt our Trip type to the one expected by firebase.ts
function adaptTripForFirebase(trip: Trip | Partial<Trip>): Partial<TripFromTripTs> {
  // Map status values between the two types
  const statusMap: Record<string, TripStatus> = {
    active: "active",
    completed: "completed",
  invoiced: "active", // Map 'invoiced' to 'active' since it doesn't exist in TripStatus
  paid: "active", // Map 'paid' to 'active' since it doesn't exist in TripStatus
    shipped: "shipped",
    delivered: "delivered",
  };

  // Handle payment status mapping
  const paymentStatusMap: Record<string, "paid" | "unpaid" | undefined> = {
    paid: "paid",
    unpaid: "unpaid",
    partial: "unpaid" // Map 'partial' to 'unpaid' since it doesn't exist in TripFromTripTs
  };

  // Helper to adapt cost entry
  const adaptCostEntry = (cost: any): any => {
    return {
      ...cost,
      // Ensure description property exists
      description: cost.notes || cost.category || `${cost.category} - ${cost.amount}`,
      // Ensure category is a valid string for TripFromTripTs.CostEntry
      category: cost.category as any,
    };
  };

  // Get any updatedCosts that might be in the object
  const tripAny = trip as any;
  const updatedCosts = tripAny.updatedCosts;

  // Create a safe copy of the trip object without followUpHistory
  const { followUpHistory, ...tripWithoutFollowUp } = trip as any;

  // Process followUpHistory if it exists
  const processedFollowUpHistory = followUpHistory
    ? followUpHistory.map((record: any) =>
        typeof record === "string" ? record : JSON.stringify(record)
      )
    : undefined;

  // Map our Trip type to firebase's Trip type
  return {
    ...tripWithoutFollowUp,
    // Map required properties
    title: trip.loadRef || trip.description || `Trip ${trip.id || "new"}`,
    loadDate: trip.startDate || new Date().toISOString(),
    pickupDate: trip.startDate || new Date().toISOString(),
    deliveryDate: trip.endDate || new Date().toISOString(),
    // Map status using statusMap
    status: trip.status ? statusMap[trip.status as string] : undefined,
    // Map payment status
    paymentStatus: trip.paymentStatus ? paymentStatusMap[trip.paymentStatus] : undefined,
    // Ensure costs have description property
    costs: updatedCosts ? updatedCosts.map(adaptCostEntry) : trip.costs?.map(adaptCostEntry),
    // Add back processed followUpHistory if it exists
    ...(processedFollowUpHistory ? { followUpHistory: processedFollowUpHistory } : {}),
  };
}

// Wrapper function for updateTripInFirebase to handle type conversion
async function updateTripWithAdapter(
  tripId: string,
  tripData: Trip | Partial<Trip>
): Promise<string> {
  const adaptedTrip = adaptTripForFirebase(tripData);
  return updateTripInFirebase(tripId, adaptedTrip as any);
}

interface AppContextType {
  // Connection status
  isOnline: boolean;

  // Google Maps properties
  isGoogleMapsLoaded: boolean;
  googleMapsError: string | null;
  loadGoogleMaps: () => Promise<void>;

  // Constants
  FLEETS_WITH_PROBES: string[];
  trips: Trip[];
  addTrip: (trip: Omit<Trip, "id" | "costs" | "status">) => Promise<string>;
  updateTrip: (trip: Trip) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  getTrip: (id: string) => Trip | undefined;
  refreshTrips: () => Promise<void>;

  // Trip Templates
  tripTemplates: TripTemplate[];
  addTripTemplate: (template: Omit<TripTemplate, "id" | "createdAt">) => Promise<string>;
  updateTripTemplate: (template: TripTemplate) => Promise<void>;
  deleteTripTemplate: (id: string) => Promise<void>;
  getTripTemplate: (id: string) => TripTemplate | undefined;

  // Load Plans
  loadPlans: LoadPlan[];
  addLoadPlan: (plan: Omit<LoadPlan, "id" | "createdAt">) => Promise<string>;
  updateLoadPlan: (plan: LoadPlan) => Promise<void>;
  deleteLoadPlan: (id: string) => Promise<void>;
  getLoadPlan: (id: string) => LoadPlan | undefined;

  // Route Planning & Optimization
  planRoute: (
    tripId: string,
    origin: string,
    destination: string,
    waypoints?: string[]
  ) => Promise<void>;
  optimizeRoute: (tripId: string) => Promise<void>;

  // Trip Progress & Delivery
  updateTripProgress: (tripId: string, status: Trip["tripProgressStatus"]) => Promise<void>;
  confirmDelivery: (
    tripId: string,
    confirmationData: {
      status: "confirmed" | "disputed";
      notes?: string;
      deliveryDateTime: string;
      attachments?: File[];
    }
  ) => Promise<void>;

  // Trip Financials
  generateTripFinancialAnalysis: (tripId: string) => Promise<TripFinancialAnalysis>;
  getTripFinancialAnalysis: (tripId: string) => TripFinancialAnalysis | undefined;

  // PDF Generation
  generateQuoteConfirmationPdf: (tripId: string) => Promise<string>;
  generateLoadConfirmationPdf: (tripId: string) => Promise<string>;

  // Fleet Utilization
  calculateFleetUtilization: (tripId: string) => Promise<void>;
  getFleetUtilizationMetrics: (
    fleetNumber: string,
    startDate?: string,
    endDate?: string
  ) => { fleetNumber: string; utilizationRate: number; revenuePerKm: number; costPerKm: number }[];

  addCostEntry: (
    costEntry: Omit<CostEntry, "id" | "attachments">,
    files?: FileList
  ) => Promise<string>;
  updateCostEntry: (costEntry: CostEntry) => Promise<void>;
  deleteCostEntry: (id: string) => Promise<void>;

  addAttachment: (attachment: Omit<Attachment, "id">) => Promise<string>;
  deleteAttachment: (id: string) => Promise<void>;

  addAdditionalCost: (
    tripId: string,
    cost: Omit<AdditionalCost, "id">,
    files?: FileList
  ) => Promise<string>;
  removeAdditionalCost: (tripId: string, costId: string) => Promise<void>;

  addDelayReason: (tripId: string, delay: Omit<DelayReason, "id">) => Promise<string>;

  missedLoads: MissedLoad[];
  addMissedLoad: (missedLoad: Omit<MissedLoad, "id">) => Promise<string>;
  updateMissedLoad: (missedLoad: MissedLoad) => Promise<void>;
  deleteMissedLoad: (id: string) => Promise<void>;

  updateInvoicePayment: (
    tripId: string,
    paymentData: {
      paymentStatus: "unpaid" | "partial" | "paid";
      paymentAmount?: number;
      paymentReceivedDate?: string;
      paymentNotes?: string;
      paymentMethod?: string;
      bankReference?: string;
    }
  ) => Promise<void>;

  importTripsFromCSV: (trips: Omit<Trip, "id" | "costs" | "status">[]) => Promise<void>;
  triggerTripImport: () => Promise<void>;
  importCostsFromCSV: (costs: Omit<CostEntry, "id" | "attachments">[]) => Promise<void>;
  importTripsFromWebhook: () => Promise<{ imported: number; skipped: number }>;
  importDriverBehaviorEventsFromWebhook: () => Promise<{ imported: number; skipped: number }>;

  dieselRecords: DieselConsumptionRecord[];
  addDieselRecord: (record: Omit<DieselConsumptionRecord, "id">) => Promise<string>;
  updateDieselRecord: (record: DieselConsumptionRecord) => Promise<void>;
  deleteDieselRecord: (id: string) => Promise<void>;
  importDieselFromCSV: (records: Omit<DieselConsumptionRecord, "id">[]) => Promise<void>;

  updateDieselDebrief: (recordId: string, debriefData: any) => Promise<void>;

  allocateDieselToTrip: (dieselId: string, tripId: string) => Promise<void>;
  removeDieselFromTrip: (dieselId: string) => Promise<void>;

  driverBehaviorEvents: DriverBehaviorEvent[];
  addDriverBehaviorEvent: (
    event: Omit<DriverBehaviorEvent, "id">,
    files?: FileList
  ) => Promise<string>;
  updateDriverBehaviorEvent: (event: DriverBehaviorEvent) => Promise<void>;
  deleteDriverBehaviorEvent: (id: string) => Promise<void>;
  getDriverPerformance: (driverName: string) => any;
  getAllDriversPerformance: () => any[];
  triggerDriverBehaviorImport: () => Promise<void>;

  actionItems: ActionItem[];
  addActionItem: (
    item: Omit<ActionItem, "id" | "createdAt" | "updatedAt" | "createdBy">
  ) => Promise<string>;
  updateActionItem: (item: ActionItem) => Promise<void>;
  deleteActionItem: (id: string) => Promise<void>;
  addActionItemComment: (itemId: string, comment: string) => Promise<void>;

  carReports: CARReport[];
  addCARReport: (
    report: Omit<CARReport, "id" | "createdAt" | "updatedAt">,
    files?: FileList
  ) => Promise<string>;
  updateCARReport: (report: CARReport, files?: FileList) => Promise<void>;
  deleteCARReport: (id: string) => Promise<void>;

  workshopInventory: TyreInventoryItem[];
  addWorkshopInventoryItem: (
    item: Omit<TyreInventoryItem, "id">,
    currentUser?: string
  ) => Promise<string>;
  updateWorkshopInventoryItem: (item: TyreInventoryItem) => Promise<void>;
  deleteWorkshopInventoryItem: (id: string, currentUser?: string) => Promise<void>;
  refreshWorkshopInventory: () => Promise<void>;

  connectionStatus: import("../types/connection").ConnectionStatus;

  bulkDeleteTrips: (tripIds: string[]) => Promise<void>;

  updateTripStatus: (
    tripId: string,
    status: "shipped" | "delivered",
    notes: string
  ) => Promise<void>;

  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  completeTrip: (tripId: string) => Promise<void>;
  auditLogs: AuditLogType[];

  // Client Management
  clients: Client[];
  addClient: (client: Omit<Client, "id">) => Promise<string>;
  updateClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClient: (id: string) => Client | undefined;
  addClientRelationship: (
    clientId: string,
    relatedClientId: string,
    relationType: string,
    notes?: string
  ) => Promise<void>;
  removeClientRelationship: (clientId: string, relationshipId: string) => Promise<void>;

  // Add isLoading property to fix TypeScript error in ActiveTrips component
  isLoading: {
    loadTrips?: boolean;
    addTrip?: boolean;
    updateTrip?: boolean;
    [key: string]: boolean | undefined;
  };

  // Inspection-related methods and properties
  inspections: VehicleInspection[];
  addInspection: (inspection: Omit<VehicleInspection, "id">) => Promise<string>;
  updateInspection: (inspection: VehicleInspection) => Promise<void>;
  deleteInspection: (id: string) => Promise<void>;
  refreshInspections: () => Promise<void>;

  // Job Card-related methods and properties
  jobCards: JobCardType[];
  addJobCard: (jobCard: Omit<JobCardType, "id">) => Promise<string>;
  updateJobCard: (jobCard: JobCardType) => Promise<void>;
  deleteJobCard: (id: string) => Promise<void>;
  getJobCard: (id: string) => JobCardType | undefined;
  refreshJobCards: () => Promise<void>;

  importDieselRecords: (records: DieselConsumptionRecord[]) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export { AppContext };

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripTemplates, setTripTemplates] = useState<TripTemplate[]>([]);
  const [loadPlans, setLoadPlans] = useState<LoadPlan[]>([]);
  const [tripFinancials, setTripFinancials] = useState<TripFinancialAnalysis[]>([]);
  const [missedLoads, setMissedLoads] = useState<MissedLoad[]>([]);
  const [dieselRecords, setDieselRecords] = useState<DieselConsumptionRecord[]>([]);
  const [driverBehaviorEvents, setDriverBehaviorEvents] = useState<DriverBehaviorEvent[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [carReports, setCARReports] = useState<CARReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogType[]>([]);
  const [workshopInventory, setWorkshopInventory] = useState<TyreInventoryItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [inspections, setInspections] = useState<VehicleInspection[]>([]);
  const [jobCards, setJobCards] = useState<JobCardType[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "reconnecting"
  >("connected");
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  // Google Maps state
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState<boolean>(false);
  const [googleMapsError, setGoogleMapsError] = useState<string | null>(null);

  // Add refreshTrips method to manually refresh trip data from Firestore
  const refreshTrips = useCallback(async (): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, loadTrips: true }));
      console.log("🔄 Refreshing trip data from Firestore...");

      // Force resubscribe to trips collection to get fresh data
      syncService.unsubscribeFromTrips();
      syncService.subscribeToAllTrips();

      // Wait a moment for data to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("✅ Trip data refreshed successfully");
      return Promise.resolve();
    } catch (error) {
      console.error("❌ Error refreshing trip data:", error);
      throw error;
    } finally {
      setIsLoading((prev) => ({ ...prev, loadTrips: false }));
    }
  }, []);

  // Add refreshWorkshopInventory method to manually refresh workshop inventory data from Firestore
  const refreshWorkshopInventory = useCallback(async (): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, loadWorkshopInventory: true }));
      console.log("🔄 Refreshing workshop inventory data from Firestore...");

      // Wait a moment for data to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("✅ Workshop inventory data refreshed successfully");
      return Promise.resolve();
    } catch (error) {
      console.error("❌ Error refreshing workshop inventory data:", error);
      throw error;
    } finally {
      setIsLoading((prev) => ({ ...prev, loadWorkshopInventory: false }));
    }
  }, []);

  // Add refreshInspections method to manually refresh inspection data from Firestore
  const refreshInspections = useCallback(async (): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, loadInspections: true }));
      console.log("🔄 Refreshing inspection data from Firestore...");

      // Simulate Firestore fetch
      const fetchedInspections: VehicleInspection[] = []; // Replace with actual Firestore fetch logic
      setInspections(fetchedInspections);

      console.log("✅ Inspection data refreshed successfully");
      return Promise.resolve();
    } catch (error) {
      console.error("❌ Error refreshing inspection data:", error);
      throw error;
    } finally {
      setIsLoading((prev) => ({ ...prev, loadInspections: false }));
    }
  }, []);

  // Google Maps initialization function
  const loadGoogleMaps = useCallback(async (): Promise<void> => {
    if (isGoogleMapsLoaded) return;

    setIsLoading((prev) => ({ ...prev, loadGoogleMaps: true }));
    setGoogleMapsError(null);

    try {
      // In development mode, continue even if Maps fails to load
      try {
        await loadGoogleMapsScript("places");

        // Add additional validation for Places API specifically
        if (window.google?.maps?.places?.PlacesService) {
          setIsGoogleMapsLoaded(true);
          console.log("✅ Google Maps API with Places library loaded successfully.");
        } else {
          throw new Error("Places library not properly loaded");
        }
      } catch (error) {
        // In development, treat as non-fatal
        if (import.meta.env.DEV) {
          console.warn(
            "Maps service unavailable in development mode - some features will be limited"
          );
          setIsGoogleMapsLoaded(true); // Still mark as loaded to prevent further attempts
        } else {
          // In production, propagate the error
          throw error;
        }
      }
    } catch (error) {
      const errorMsg =
        "Failed to load Google Maps API script. Please check your network connection and API key.";
      setGoogleMapsError(errorMsg);
      console.error(errorMsg, error);

      // Don't throw in development - just log the error
      if (!import.meta.env.DEV) {
        throw error;
      }
    } finally {
      setIsLoading((prev) => ({ ...prev, loadGoogleMaps: false }));
    }
  }, [isGoogleMapsLoaded]);

  // Load Google Maps on initial app load
  useEffect(() => {
    loadGoogleMaps().catch((err) => {
      console.error("AppContext: Initial Google Maps load failed.", err.message);
    });
  }, [loadGoogleMaps]);

  // Monitor online/offline status and Firestore connection
  useEffect(() => {
    const handleOnline = async () => {
      console.log("✅ App is now online");
      setIsOnline(true);
      setConnectionStatus("reconnecting");
      try {
        // Attempt to enable Firestore network
        await enableFirestoreNetwork();
        setConnectionStatus("connected");
      } catch (error) {
        console.error("Failed to reconnect to Firestore:", error);
        setConnectionStatus("disconnected");
      }
    };

    const handleOffline = async () => {
      console.log("⚠️ App is now offline");
      setIsOnline(false);
      setConnectionStatus("disconnected");
      try {
        // Disable Firestore network to prevent unnecessary retries
        await disableFirestoreNetwork();
      } catch (error) {
        console.error("Failed to properly disconnect Firestore:", error);
      }
    };

    // Handle Firestore connection status changes
    const handleFirestoreConnectionChange = (
      status: "connected" | "disconnected" | "reconnecting" | "error"
    ) => {
      setConnectionStatus(status === "error" ? "disconnected" : status);
    };

    // Add connection listener
    addConnectionListener(handleFirestoreConnectionChange);

    // Set initial status
    setConnectionStatus(navigator.onLine ? "connected" : "disconnected");

    // Add browser online/offline event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      removeConnectionListener(handleFirestoreConnectionChange);
    };
  }, []);

  // Stabilize the callbacks object to prevent infinite re-renders
  const stableCallbacks = useMemo(
    () => ({
      setTrips,
      setTripTemplates,
      setLoadPlans,
      setMissedLoads,
      setDieselRecords,
      setDriverBehaviorEvents,
      setActionItems,
      setCarReports: setCARReports,
      setAuditLogs,
      setWorkshopInventory,
      setClients,
      setJobCards, // Register job cards state
    }),
    [
      setTrips,
      setTripTemplates,
      setLoadPlans,
      setMissedLoads,
      setDieselRecords,
      setDriverBehaviorEvents,
      setActionItems,
      setCARReports,
      setAuditLogs,
      setWorkshopInventory,
      setClients,
      setJobCards,
    ]
  );

  useEffect(() => {
    // Set up all data subscriptions through the SyncService
    // Register all data callbacks with SyncService
    syncService.registerDataCallbacks(stableCallbacks);

    // Subscribe to all collections
    syncService.subscribeToAllTrips();
    // Methods now implemented in syncService
    syncService.subscribeToAllMissedLoads();
    syncService.subscribeToAllDieselRecords();
    syncService.subscribeToAllDriverBehaviorEvents();
    syncService.subscribeToAllActionItems();
    syncService.subscribeToAllCARReports();
    syncService.subscribeToAuditLogs();
    syncService.subscribeToAllWorkshopInventory(); // Add subscription to workshop inventory
    syncService.subscribeToAllJobCards(); // Subscribe to job cards

    return () => {
      // Let SyncService handle unsubscribing from all listeners
      syncService.cleanup();
    };
  }, [stableCallbacks]);

  // Add workshop inventory item
  const addWorkshopInventoryItem = async (
    item: Omit<TyreInventoryItem, "id">,
    currentUser?: string
  ): Promise<string> => {
    try {
      setIsLoading((prev) => ({ ...prev, addWorkshopInventoryItem: true }));

      // 1. Add to Firestore
      const db = getFirestore();
      const docRef = await addDoc(collection(db, "workshopInventory"), item);

      // 2. Create item with the Firestore-generated ID
      const newItem = {
        ...item,
        id: docRef.id,
      };

      // 3. Update local state
      setWorkshopInventory((prev) => [...prev, newItem as TyreInventoryItem]);

      // 4. Log the action for audit/compliance
      await addAuditLogToFirebase({
        user: currentUser || "unknown",
        action: "ADD_WORKSHOP_INVENTORY",
        details: { id: docRef.id, ...item },
      });

      console.log(`✅ Workshop inventory item added: ${newItem.id}`);

      return newItem.id;
    } catch (error) {
      console.error("Error adding workshop inventory item:", error);
      throw error;
    } finally {
      setIsLoading((prev) => ({ ...prev, addWorkshopInventoryItem: false }));
    }
  };

  // Update workshop inventory item
  const updateWorkshopInventoryItem = async (item: TyreInventoryItem): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, updateWorkshopInventoryItem: true }));

      // Update item in Firestore using syncService
      await syncService.updateWorkshopInventoryItem(item.id, item);

      // Optimistically update local state
      setWorkshopInventory((prev) => prev.map((i) => (i.id === item.id ? item : i)));

      console.log(`✅ Workshop inventory item updated: ${item.id}`);
    } catch (error) {
      console.error("Error updating workshop inventory item:", error);
      throw error;
    } finally {
      setIsLoading((prev) => ({ ...prev, updateWorkshopInventoryItem: false }));
    }
  };

  // Delete workshop inventory item
  const deleteWorkshopInventoryItem = async (id: string, currentUser?: string): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, deleteWorkshopInventoryItem: true }));

      // Delete from Firestore
      const db = getFirestore();
      await deleteDoc(doc(db, "workshopInventory", id));

      // Update local state
      setWorkshopInventory((prev) => prev.filter((item) => item.id !== id));

      // Audit log the action
      await addAuditLogToFirebase({
        user: currentUser || "unknown",
        action: "DELETE_WORKSHOP_INVENTORY",
        details: { id },
      });

      console.log(`✅ Workshop inventory item deleted: ${id}`);
    } catch (error) {
      console.error("Error deleting workshop inventory item:", error);
      throw error;
    } finally {
      setIsLoading((prev) => ({ ...prev, deleteWorkshopInventoryItem: false }));
    }
  };

  // Client Management Functions
  const addClient = async (clientData: Omit<Client, "id">): Promise<string> => {
    try {
      setIsLoading((prev) => ({ ...prev, addClient: true }));
      const newClient: Client = {
        ...clientData,
        id: uuidv4(),
      };

      // In a real implementation, this would add to Firestore
      setClients((prev) => [...prev, newClient]);

      // Log client creation for audit trail
      await addAuditLogToFirebase({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        user: "system", // Replace with actual user
        action: "create",
        entity: "client",
        entityId: newClient.id,
        details: `Client ${newClient.name} created`,
        changes: newClient,
      });

      return newClient.id;
    } catch (error) {
      console.error("Error adding client:", error);
      throw error;
    } finally {
      setIsLoading((prev) => ({ ...prev, addClient: false }));
    }
  };

  const updateClient = async (client: Client): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, updateClient: true }));

      // Get the original client for audit logging
      const originalClient = clients.find((c) => c.id === client.id);

      // In a real implementation, this would update Firestore
      setClients((prev) =>
        prev.map((c) =>
          c.id === client.id ? { ...client, updatedAt: new Date().toISOString() } : c
        )
      );

      // Log client update for audit trail
      if (originalClient) {
        await addAuditLogToFirebase({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          user: "system", // Replace with actual user
          action: "update",
          entity: "client",
          entityId: client.id,
          details: `Client ${client.name} updated`,
          changes: {
            before: originalClient,
            after: client,
          },
        });
      }
    } catch (error) {
      console.error("Error updating client:", error);
      throw error;
    } finally {
      setIsLoading((prev) => ({ ...prev, updateClient: false }));
    }
  };

  const deleteClient = async (id: string): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, [`deleteClient-${id}`]: true }));

      const clientToDelete = clients.find((c) => c.id === id);

      if (clientToDelete) {
        // Check if client is referenced in trips
        const clientTrips = trips.filter((t) => t.clientName === clientToDelete.name);

        if (clientTrips.length > 0) {
          throw new Error(
            `Cannot delete client: ${clientToDelete.name} is referenced in ${clientTrips.length} trips`
          );
        }

        // Log client deletion for audit trail
        await addAuditLogToFirebase({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          user: "system", // Replace with actual user
          action: "delete",
          entity: "client",
          entityId: id,
          details: `Client ${clientToDelete.name} deleted`,
          changes: clientToDelete,
        });
      }

      // In a real implementation, this would delete from Firestore
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting client:", error);
      throw error;
    } finally {
      setIsLoading((prev) => {
        const newState = { ...prev };
        delete newState[`deleteClient-${id}`];
        return newState;
      });
    }
  };

  const getClient = (id: string): Client | undefined => {
    return clients.find((c) => c.id === id);
  };

  const addClientRelationship = async (
    clientId: string,
    relatedClientId: string,
    relationType: string,
    notes?: string
  ): Promise<void> => {
    try {
      const client = clients.find((c) => c.id === clientId);
      if (!client) throw new Error(`Client with ID ${clientId} not found`);

      // Check if relationship already exists
      const existingRelationship = client.relationships.find(
        (r) => r.relatedClientId === relatedClientId
      );
      if (existingRelationship) {
        throw new Error("Relationship already exists between these clients");
      }

      // Create the new relationship
      const relationship = {
        id: uuidv4(),
        relatedClientId,
        relationType: relationType as any,
        notes,
        createdAt: new Date().toISOString(),
      };

      // Update the client with the new relationship
      const updatedClient = {
        ...client,
        relationships: [...client.relationships, relationship],
        updatedAt: new Date().toISOString(),
      };

      // Update the client in state
      await updateClient(updatedClient);
    } catch (error) {
      console.error("Error adding client relationship:", error);
      throw error;
    }
  };

  const removeClientRelationship = async (
    clientId: string,
    relationshipId: string
  ): Promise<void> => {
    try {
      const client = clients.find((c) => c.id === clientId);
      if (!client) throw new Error(`Client with ID ${clientId} not found`);

      // Filter out the relationship
      const updatedClient = {
        ...client,
        relationships: client.relationships.filter((r) => r.id !== relationshipId),
        updatedAt: new Date().toISOString(),
      };

      // Update the client in state
      await updateClient(updatedClient);
    } catch (error) {
      console.error("Error removing client relationship:", error);
      throw error;
    }
  };

  const addTrip = async (trip: Omit<Trip, "id" | "costs" | "status">): Promise<string> => {
    try {
      setIsLoading((prev) => ({ ...prev, addTrip: true }));
      const newTrip = {
        ...trip,
        id: generateTripId(),
        costs: [],
        status: "active" as const,
      };

      // Adapt our Trip type to the one expected by firebase.ts
      const adaptedTrip = adaptTripForFirebase(newTrip);

      // Return the trip ID
      return await addTripToFirebase(adaptedTrip as any);
    } catch (error) {
      console.error("Error adding trip:", error);
      throw error;
    } finally {
      setIsLoading((prev) => ({ ...prev, addTrip: false }));
    }
  };

  const updateTrip = async (trip: Trip): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, updateTrip: true }));
      // Get the original trip for audit logging
      const originalTrip = trips.find((t) => t.id === trip.id);

      await updateTripWithAdapter(trip.id, trip);

      // Log trip update for audit trail
      if (originalTrip) {
        await addAuditLogToFirebase({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          user: "system", // Replace with actual user
          action: "update",
          entity: "trip",
          entityId: trip.id,
          details: `Trip ${trip.id} updated`,
          changes: {
            before: originalTrip,
            after: trip,
          },
        });
      }
    } catch (error) {
      console.error("Error updating trip:", error);
      throw error;
    } finally {
      setIsLoading((prev) => ({ ...prev, updateTrip: false }));
    }
  };

  const deleteTrip = async (id: string): Promise<void> => {
    try {
      const tripToDelete = trips.find((t) => t.id === id);
      if (tripToDelete) {
        await addAuditLogToFirebase({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          user: "system", // Replace with actual user
          action: "delete",
          entity: "trip",
          entityId: id,
          details: `Trip ${id} deleted`,
          changes: tripToDelete,
        });
      }
      await deleteTripFromFirebase(id);
      // Optimistically remove from local state
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting trip:", error);
      throw error;
    }
  };

  const getTrip = (id: string): Trip | undefined => {
    return trips.find((t) => t.id === id);
  };

  const addMissedLoad = async (missedLoad: Omit<MissedLoad, "id">): Promise<string> => {
    const newMissedLoad = { ...missedLoad, id: uuidv4() };
    return await addMissedLoadToFirebase(newMissedLoad as MissedLoad);
  };

  const updateMissedLoad = async (): Promise<void> => {
    console.warn("updateMissedLoad is not implemented");
  };

  const deleteMissedLoad = async (id: string): Promise<void> => {
    try {
      // Set loading state
      setIsLoading((prev) => ({ ...prev, [`deleteMissedLoad-${id}`]: true }));

      // Delete from Firestore
      // Placeholder for deleteMissedLoadFromFirebase
      console.warn("deleteMissedLoadFromFirebase is not implemented");

      // Optimistically update local state
      setMissedLoads((prev) => prev.filter((load) => load.id !== id));
    } catch (error) {
      console.error("Error deleting missed load:", error);
      throw error;
    } finally {
      // Clear loading state
      setIsLoading((prev) => {
        const newState = { ...prev };
        delete newState[`deleteMissedLoad-${id}`];
        return newState;
      });
    }
  };

  // This is a placeholder for future audit logging implementation
  // We're keeping this as a reference for when we implement proper audit logging
  /*
  const addAuditLog = async (logData: any) => {
    try {
      setIsLoading(prev => ({ ...prev, [`addAuditLog-${logData.id || 'unknown'}`]: true }));

      // Use the proper audit log utility
      const docId = await addAuditLogToFirebase({
        ...logData,
        details: logData.details,
      });

      console.log("✅ Audit log added:", docId);
      return docId;
    } catch (error) {
      console.error("Error adding audit log:", error);
      throw error;
    } finally {
      // Clear loading state
      setIsLoading(prev => {
        const newState = { ...prev };
        delete newState[`addAuditLog-${logData.id || 'unknown'}`];
        return newState;
      });
    }
  };
  */

  const completeTrip = async (tripId: string): Promise<void> => {
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      const updatedTrip = {
        ...trip,
        status: "completed" as const,
        completedAt: new Date().toISOString(),
        completedBy: "Current User", // In a real app, use the logged-in user
      };
      await updateTripWithAdapter(updatedTrip.id, updatedTrip);
    }
  };

  // Placeholder implementations for other functions
  const placeholder = async () => {
    console.warn("Function not implemented");
  };
  const placeholderString = async () => {
    console.warn("Function not implemented");
    return "";
  };
  const placeholderWebhook = async () => {
    console.warn("Function not implemented");
    return { imported: 0, skipped: 0 };
  };

  const addDieselRecord = async (record: Omit<DieselConsumptionRecord, "id">): Promise<string> => {
    const newRecord = {
      ...record,
      id: `diesel-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If linked to a trip, create a cost entry
    if (newRecord.tripId) {
      const trip = trips.find((t) => t.id === newRecord.tripId);
      if (trip) {
        const costEntry: CostEntry = {
          id: `cost-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          tripId: trip.id,
          category: "Diesel",
          subCategory: `${newRecord.fuelStation} - ${newRecord.fleetNumber}`,
          amount: newRecord.totalCost,
          currency: newRecord.currency || trip.revenueCurrency,
          referenceNumber: `DIESEL-${newRecord.id}`,
          date: newRecord.date,
          notes: `Diesel: ${newRecord.litresFilled} liters at ${newRecord.fuelStation}`,
          attachments: [],
          isFlagged: false,
        };

        // Add cost entry to trip
        const updatedTrip = {
          ...trip,
          costs: [...trip.costs, costEntry],
        };

        // Use the adapter wrapper function
        await updateTripWithAdapter(trip.id, updatedTrip);
      }
    }

    // Convert the date string to a Timestamp for Firebase
    const recordForFirebase = {
      ...newRecord,
      date:
        typeof newRecord.date === "string"
          ? Timestamp.fromDate(new Date(newRecord.date))
          : newRecord.date,
    };

    return await addDieselToFirebase(recordForFirebase);
  };

  const triggerTripImport = async (): Promise<void> => {
    try {
      const eventData = {
        eventType: "trip.import_request",
        timestamp: new Date().toISOString(),
        data: {
          source: "webapp",
        },
      };
      await sendTripEvent(eventData);
    } catch (error) {
      console.error("Error triggering trip import:", error);
      throw error;
    }
  };

  const triggerDriverBehaviorImport = async (): Promise<void> => {
    try {
      const eventData = {
        eventType: "driver.behavior.import_request",
        timestamp: new Date().toISOString(),
        data: {
          source: "webapp",
        },
      };
      await sendDriverBehaviorEvent(eventData);
    } catch (error) {
      console.error("Error triggering driver behavior import:", error);
      throw error;
    }
  };

  const getDriverPerformance = (driverName: string) => {
    // Filter events for this driver
    const driverEvents = driverBehaviorEvents.filter((event) => event.driverName === driverName);

    if (driverEvents.length === 0) {
      return {
        driverName,
        totalEvents: 0,
        behaviorScore: 100,
        criticalEvents: 0,
        highSeverityEvents: 0,
        recentEvents: [],
      };
    }

    // Calculate behavior score (100 is perfect, deduct points for events based on severity)
    const baseScore = 100;
    const criticalPoints = driverEvents.filter((e) => e.severity === "critical").length * 15;
    const highPoints = driverEvents.filter((e) => e.severity === "high").length * 10;
    const mediumPoints = driverEvents.filter((e) => e.severity === "medium").length * 5;
    const lowPoints = driverEvents.filter((e) => e.severity === "low").length * 2;

    // Don't go below zero
    const behaviorScore = Math.max(
      0,
      baseScore - criticalPoints - highPoints - mediumPoints - lowPoints
    );

    // Sort events by date, most recent first
    const sortedEvents = [...driverEvents].sort(
      (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
    );

    return {
      driverName,
      totalEvents: driverEvents.length,
      behaviorScore,
      criticalEvents: driverEvents.filter((e) => e.severity === "critical").length,
      highSeverityEvents: driverEvents.filter((e) => e.severity === "high").length,
      recentEvents: sortedEvents.slice(0, 5), // Return 5 most recent events
    };
  };

  const getAllDriversPerformance = () => {
    // Get unique driver names
    const driverNames = Array.from(new Set(driverBehaviorEvents.map((event) => event.driverName)));

    // For each driver, calculate their performance
    return driverNames.map((driverName) => {
      // Filter events for this driver
      const driverEvents = driverBehaviorEvents.filter((event) => event.driverName === driverName);

      // Calculate behavior score (100 is perfect, deduct points for events based on severity)
      const baseScore = 100;
      const criticalPoints = driverEvents.filter((e) => e.severity === "critical").length * 15;
      const highPoints = driverEvents.filter((e) => e.severity === "high").length * 10;
      const mediumPoints = driverEvents.filter((e) => e.severity === "medium").length * 5;
      const lowPoints = driverEvents.filter((e) => e.severity === "low").length * 2;

      // Don't go below zero
      const behaviorScore = Math.max(
        0,
        baseScore - criticalPoints - highPoints - mediumPoints - lowPoints
      );

      // Sort events by date, most recent first
      const sortedEvents = [...driverEvents].sort(
        (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      );

      return {
        driverName,
        totalEvents: driverEvents.length,
        behaviorScore,
        criticalEvents: driverEvents.filter((e) => e.severity === "critical").length,
        highSeverityEvents: driverEvents.filter((e) => e.severity === "high").length,
        recentEvents: sortedEvents.slice(0, 3), // Return 3 most recent events
      };
    });
  };

  // Trip Template functions
  const addTripTemplate = async (
    template: Omit<TripTemplate, "id" | "createdAt">
  ): Promise<string> => {
    try {
      setIsLoading((prev) => ({ ...prev, addTripTemplate: true }));

      const newTemplate = {
        ...template,
        id: `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // In a real implementation, this would save to Firestore
      setTripTemplates((prev) => [...prev, newTemplate]);

      return newTemplate.id;
    } catch (error) {
      console.error("Error adding trip template:", error);
      throw error;
    } finally {
      setIsLoading((prev) => ({ ...prev, addTripTemplate: false }));
    }
  };

  const updateTripTemplate = async (template: TripTemplate): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, updateTripTemplate: true }));

      // In a real implementation, this would update Firestore
      setTripTemplates((prev) =>
        prev.map((t) =>
          t.id === template.id ? { ...template, updatedAt: new Date().toISOString() } : t
        )
      );
    } catch (error) {
      console.error("Error updating trip template:", error);
      throw error;
    } finally {
      setIsLoading((prev) => ({ ...prev, updateTripTemplate: false }));
    }
  };

  const deleteTripTemplate = async (id: string): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, [`deleteTripTemplate-${id}`]: true }));

      // In a real implementation, this would delete from Firestore
      setTripTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting trip template:", error);
      throw error;
    } finally {
      setIsLoading((prev) => {
        const newState = { ...prev };
        delete newState[`deleteTripTemplate-${id}`];
        return newState;
      });
    }
  };

  const getTripTemplate = (id: string): TripTemplate | undefined => {
    return tripTemplates.find((t) => t.id === id);
  };

  // Load Plan functions
  const addLoadPlan = async (plan: Omit<LoadPlan, "id" | "createdAt">): Promise<string> => {
    try {
      setIsLoading((prev) => ({ ...prev, addLoadPlan: true }));

      const newPlan = {
        ...plan,
        id: `load-plan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // In a real implementation, this would save to Firestore
      setLoadPlans((prev) => [...prev, newPlan]);

      // Update the associated trip with the load plan ID
      const trip = trips.find((t) => t.id === plan.tripId);
      if (trip) {
        await updateTrip({
          ...trip,
          loadPlanId: newPlan.id,
        });
      }

      return newPlan.id;
    } catch (error) {
      console.error("Error adding load plan:", error);
      throw error;
    } finally {
      setIsLoading((prev) => ({ ...prev, addLoadPlan: false }));
    }
  };

  const updateLoadPlan = async (plan: LoadPlan): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, updateLoadPlan: true }));

      // In a real implementation, this would update Firestore
      setLoadPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...plan, updatedAt: new Date().toISOString() } : p))
      );
    } catch (error) {
      console.error("Error updating load plan:", error);
      throw error;
    } finally {
      setIsLoading((prev) => ({ ...prev, updateLoadPlan: false }));
    }
  };

  const deleteLoadPlan = async (id: string): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, [`deleteLoadPlan-${id}`]: true }));

      // Get the load plan to find its associated trip
      const loadPlan = loadPlans.find((p) => p.id === id);
      if (loadPlan) {
        // Update the associated trip to remove the load plan ID reference
        const trip = trips.find((t) => t.id === loadPlan.tripId);
        if (trip && trip.loadPlanId === id) {
          await updateTrip({
            ...trip,
            loadPlanId: undefined,
          });
        }
      }

      // In a real implementation, this would delete from Firestore
      setLoadPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting load plan:", error);
      throw error;
    } finally {
      setIsLoading((prev) => {
        const newState = { ...prev };
        delete newState[`deleteLoadPlan-${id}`];
        return newState;
      });
    }
  };

  const getLoadPlan = (id: string): LoadPlan | undefined => {
    return loadPlans.find((p) => p.id === id);
  };

  // Route Planning & Optimization functions
  const planRoute = async (
    tripId: string,
    origin: string,
    destination: string,
    waypoints?: string[]
  ): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, [`planRoute-${tripId}`]: true }));

      const trip = trips.find((t) => t.id === tripId);
      if (!trip) throw new Error(`Trip with ID ${tripId} not found`);

      // In a real implementation, this would call Google Maps API or similar
      // For now, we'll simulate route planning with dummy data
      const simulatedCoordinates = [
        { lat: 40.7128, lng: -74.006 }, // Example: NYC coordinates
        { lat: 41.8781, lng: -87.6298 }, // Example: Chicago coordinates
      ];

      const plannedRoute = {
        origin,
        destination,
        waypoints: waypoints || [],
        coordinates: simulatedCoordinates,
        estimatedDistance: 1200, // km
        estimatedDuration: 720, // minutes
      };

      await updateTrip({
        ...trip,
        plannedRoute,
        distanceKm: plannedRoute.estimatedDistance, // Update trip distance based on route
      });

      console.log(`Route planned for trip ${tripId}`);
    } catch (error) {
      console.error("Error planning route:", error);
      throw error;
    } finally {
      setIsLoading((prev) => {
        const newState = { ...prev };
        delete newState[`planRoute-${tripId}`];
        return newState;
      });
    }
  };

  const optimizeRoute = async (tripId: string): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, [`optimizeRoute-${tripId}`]: true }));

      const trip = trips.find((t) => t.id === tripId);
      if (!trip) throw new Error(`Trip with ID ${tripId} not found`);
      if (!trip.plannedRoute) throw new Error(`Trip ${tripId} has no planned route to optimize`);

      // In a real implementation, this would call a route optimization API
      // For now, we'll simulate optimization with improved metrics

      // Copy planned route and add optimization improvements
      const optimizedRoute = {
        ...trip.plannedRoute,
        // Simulate 10% improvement in distance and duration
        estimatedDistance: Math.round((trip.plannedRoute.estimatedDistance ?? 0) * 0.9),
        estimatedDuration: Math.round((trip.plannedRoute.estimatedDuration ?? 0) * 0.9),
        // Add optimization metrics
        fuelSavings: Math.round((trip.plannedRoute.estimatedDistance ?? 0) * 0.1 * 0.3), // Assume 0.3L/km
        timeSavings: Math.round((trip.plannedRoute.estimatedDuration ?? 0) * 0.1), // 10% time savings
        optimizationDate: new Date().toISOString(),
      };

      await updateTrip({
        ...trip,
        optimizedRoute,
        distanceKm: optimizedRoute.estimatedDistance, // Update trip distance to optimized value
      });

      console.log(`Route optimized for trip ${tripId}`);
    } catch (error) {
      console.error("Error optimizing route:", error);
      throw error;
    } finally {
      setIsLoading((prev) => {
        const newState = { ...prev };
        delete newState[`optimizeRoute-${tripId}`];
        return newState;
      });
    }
  };

  // Trip Progress & Delivery functions
  const updateTripProgress = async (
    tripId: string,
    status: Trip["tripProgressStatus"]
  ): Promise<void> => {
    try {
      const trip = trips.find((t) => t.id === tripId);
      if (!trip) throw new Error(`Trip with ID ${tripId} not found`);

      await updateTrip({
        ...trip,
        tripProgressStatus: status,
        // If the status is 'completed', also update the main trip status
        status: status === "completed" ? "completed" : trip.status,
      });

      console.log(`Trip ${tripId} progress updated to ${status}`);
    } catch (error) {
      console.error("Error updating trip progress:", error);
      throw error;
    }
  };

  const confirmDelivery = async (
    tripId: string,
    confirmationData: {
      status: "confirmed" | "disputed";
      notes?: string;
      deliveryDateTime: string;
      attachments?: File[];
    }
  ): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, [`confirmDelivery-${tripId}`]: true }));

      const trip = trips.find((t) => t.id === tripId);
      if (!trip) throw new Error(`Trip with ID ${tripId} not found`);

      // In a real implementation, we would upload the attachments to storage
      // and get back URLs to store in the trip record
      const proofOfDeliveryAttachments: Attachment[] = confirmationData.attachments
        ? confirmationData.attachments.map((file) => ({
            id: `pod-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            tripId: tripId,
            filename: file.name,
            fileUrl: URL.createObjectURL(file), // This is temporary and not suitable for production
            fileType: file.type,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
          }))
        : [];

      await updateTrip({
        ...trip,
        deliveryConfirmationStatus: confirmationData.status,
        deliveryConfirmationNotes: confirmationData.notes,
        actualDeliveryDateTime: confirmationData.deliveryDateTime,
        proofOfDeliveryAttachments: [
          ...(trip.proofOfDeliveryAttachments || []),
          ...proofOfDeliveryAttachments,
        ],
        tripProgressStatus: "delivered",
        // If confirmed, mark the trip as completed
        status: confirmationData.status === "confirmed" ? "completed" : trip.status,
      });

      console.log(`Delivery confirmed for trip ${tripId}`);
    } catch (error) {
      console.error("Error confirming delivery:", error);
      throw error;
    } finally {
      setIsLoading((prev) => {
        const newState = { ...prev };
        delete newState[`confirmDelivery-${tripId}`];
        return newState;
      });
    }
  };

  // Trip Financials functions
  const generateTripFinancialAnalysis = async (tripId: string): Promise<TripFinancialAnalysis> => {
    try {
      setIsLoading((prev) => ({ ...prev, [`generateFinancials-${tripId}`]: true }));

      const trip = trips.find((t) => t.id === tripId);
      if (!trip) throw new Error(`Trip with ID ${tripId} not found`);

      // Calculate costs
      const totalCosts = calculateTotalCosts(trip.costs);
      const additionalCostsTotal =
        trip.additionalCosts?.reduce((sum, cost) => sum + cost.amount, 0) || 0;

      // Calculate fuel costs specifically - assume fuel is 30% of total costs for simplified analysis
      const fuelCosts = totalCosts * 0.3;

      // Calculate border costs - filter costs with 'Border Costs' category
      const borderCosts = trip.costs
        .filter((cost) => cost.category === "Border Costs")
        .reduce((sum, cost) => sum + cost.amount, 0);

      // Calculate driver allowance - filter costs with 'Trip Allowances' category
      const driverAllowance = trip.costs
        .filter((cost) => cost.category === "Trip Allowances")
        .reduce((sum, cost) => sum + cost.amount, 0);

      // Calculate toll fees - filter costs with 'Tolls' category
      const tollFees = trip.costs
        .filter((cost) => cost.category === "Tolls")
        .reduce((sum, cost) => sum + cost.amount, 0);

      // Remaining costs are classified as maintenance and miscellaneous
      const maintenanceCosts = totalCosts * 0.2; // Assume 20% of total costs
      const miscellaneousCosts =
        totalCosts - fuelCosts - borderCosts - driverAllowance - tollFees - maintenanceCosts;

      // Financial calculations
      const totalRevenue = trip.baseRevenue;
      const grossProfit = totalRevenue - totalCosts - additionalCostsTotal;
      const grossProfitMargin = (grossProfit / totalRevenue) * 100;

      // Assume net profit is 90% of gross (after taxes, overhead, etc.)
      const netProfit = grossProfit * 0.9;
      const netProfitMargin = (netProfit / totalRevenue) * 100;

      // Calculate per km metrics
      const distanceKm = trip.distanceKm || 1; // Avoid division by zero
      const revenuePerKm = totalRevenue / distanceKm;
      const costPerKm = (totalCosts + additionalCostsTotal) / distanceKm;
      const profitPerKm = netProfit / distanceKm;

      // Create the financial analysis object
      const analysis: TripFinancialAnalysis = {
        tripId,
        revenueSummary: {
          baseRevenue: trip.baseRevenue,
          additionalRevenue: 0, // Placeholder for future implementation
          totalRevenue,
          currency: trip.revenueCurrency,
        },
        costBreakdown: {
          fuelCosts,
          borderCosts,
          driverAllowance,
          maintenanceCosts,
          tollFees,
          miscellaneousCosts,
          totalCosts: totalCosts + additionalCostsTotal,
        },
        profitAnalysis: {
          grossProfit,
          grossProfitMargin,
          netProfit,
          netProfitMargin,
          returnOnInvestment: (netProfit / (totalCosts + additionalCostsTotal)) * 100,
        },
        perKmMetrics: {
          revenuePerKm,
          costPerKm,
          profitPerKm,
        },
        comparisonMetrics: {
          industryAvgCostPerKm: 2.5, // Placeholder values for demonstration
          companyAvgCostPerKm: 2.3,
          variance: ((costPerKm - 2.3) / 2.3) * 100,
        },
        calculatedAt: new Date().toISOString(),
      };

      // Store the analysis in state
      setTripFinancials((prev) => {
        const existing = prev.findIndex((a) => a.tripId === tripId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = analysis;
          return updated;
        }
        return [...prev, analysis];
      });

      return analysis;
    } catch (error) {
      console.error("Error generating financial analysis:", error);
      throw error;
    } finally {
      setIsLoading((prev) => {
        const newState = { ...prev };
        delete newState[`generateFinancials-${tripId}`];
        return newState;
      });
    }
  };

  const getTripFinancialAnalysis = (tripId: string): TripFinancialAnalysis | undefined => {
    return tripFinancials.find((a) => a.tripId === tripId);
  };

  // PDF Generation functions
  const generateQuoteConfirmationPdf = async (tripId: string): Promise<string> => {
    try {
      setIsLoading((prev) => ({ ...prev, [`generateQuotePdf-${tripId}`]: true }));

      const trip = trips.find((t) => t.id === tripId);
      if (!trip) throw new Error(`Trip with ID ${tripId} not found`);

      // In a real implementation, this would generate a PDF using jspdf
      // For now, we'll simulate PDF generation with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate a PDF URL
      const pdfUrl = `https://example.com/quote_${tripId}.pdf`;

      // Update the trip with the PDF URL
      await updateTrip({
        ...trip,
        quoteConfirmationPdfUrl: pdfUrl,
      });

      return pdfUrl;
    } catch (error) {
      console.error("Error generating quote confirmation PDF:", error);
      throw error;
    } finally {
      setIsLoading((prev) => {
        const newState = { ...prev };
        delete newState[`generateQuotePdf-${tripId}`];
        return newState;
      });
    }
  };

  const generateLoadConfirmationPdf = async (tripId: string): Promise<string> => {
    try {
      setIsLoading((prev) => ({ ...prev, [`generateLoadPdf-${tripId}`]: true }));

      const trip = trips.find((t) => t.id === tripId);
      if (!trip) throw new Error(`Trip with ID ${tripId} not found`);

      // In a real implementation, this would generate a PDF using jspdf
      // For now, we'll simulate PDF generation with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate a PDF URL
      const pdfUrl = `https://example.com/load_${tripId}.pdf`;

      // Update the trip with the PDF URL
      await updateTrip({
        ...trip,
        loadConfirmationPdfUrl: pdfUrl,
      });

      return pdfUrl;
    } catch (error) {
      console.error("Error generating load confirmation PDF:", error);
      throw error;
    } finally {
      setIsLoading((prev) => {
        const newState = { ...prev };
        delete newState[`generateLoadPdf-${tripId}`];
        return newState;
      });
    }
  };

  // Fleet Utilization functions
  const calculateFleetUtilization = async (tripId: string): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, [`calculateUtilization-${tripId}`]: true }));

      const trip = trips.find((t) => t.id === tripId);
      if (!trip) throw new Error(`Trip with ID ${tripId} not found`);

      // Calculate metrics
      // 1. Calculate capacity utilization
      // Assume 70% capacity utilization for demo purposes
      // In a real implementation, this would be calculated based on the load plan
      const capacityUtilization = 70;

      // 2. Calculate fuel efficiency
      // Get diesel records for this trip
      const tripDieselRecords = dieselRecords.filter((r) => r.tripId === tripId);
      const totalLitres = tripDieselRecords.reduce((sum, r) => sum + r.litresFilled, 0);
      const fuelEfficiency = trip.distanceKm && totalLitres ? trip.distanceKm / totalLitres : 3.0; // Default to 3.0 km/L

      // 3. Calculate revenue and cost per km
      const revenuePerKm = trip.distanceKm ? trip.baseRevenue / trip.distanceKm : 0;
      const totalCosts = calculateTotalCosts(trip.costs);
      const costPerKm = trip.distanceKm ? totalCosts / trip.distanceKm : 0;

      // 4. Calculate idle time (stub - in real implementation would be based on GPS data)
      const idleTime = 2.5; // hours

      // Update the trip with the utilization metrics
      await updateTrip({
        ...trip,
        fleetUtilizationMetrics: {
          capacityUtilization,
          fuelEfficiency,
          revenuePerKm,
          costPerKm,
          idleTime,
        },
      });

      console.log(`Fleet utilization calculated for trip ${tripId}`);
    } catch (error) {
      console.error("Error calculating fleet utilization:", error);
      throw error;
    } finally {
      setIsLoading((prev) => {
        const newState = { ...prev };
        delete newState[`calculateUtilization-${tripId}`];
        return newState;
      });
    }
  };

  const getFleetUtilizationMetrics = (
    fleetNumber: string,
    startDate?: string,
    endDate?: string
  ): {
    fleetNumber: string;
    utilizationRate: number;
    revenuePerKm: number;
    costPerKm: number;
  }[] => {
    // Filter trips by fleet number and date range
    const filteredTrips = trips.filter((trip) => {
      if (trip.fleetNumber !== fleetNumber) return false;
      if (startDate && trip.startDate < startDate) return false;
      if (endDate && trip.endDate > endDate) return false;
      if (!trip.fleetUtilizationMetrics) return false;
      return true;
    });

    if (filteredTrips.length === 0) {
      return [
        {
          fleetNumber,
          utilizationRate: 0,
          revenuePerKm: 0,
          costPerKm: 0,
        },
      ];
    }

    // Calculate average metrics
    const totalUtilizationRate = filteredTrips.reduce(
      (sum, trip) => sum + (trip.fleetUtilizationMetrics?.capacityUtilization || 0),
      0
    );
    const totalRevenuePerKm = filteredTrips.reduce(
      (sum, trip) => sum + (trip.fleetUtilizationMetrics?.revenuePerKm || 0),
      0
    );
    const totalCostPerKm = filteredTrips.reduce(
      (sum, trip) => sum + (trip.fleetUtilizationMetrics?.costPerKm || 0),
      0
    );

    return [
      {
        fleetNumber,
        utilizationRate: totalUtilizationRate / filteredTrips.length,
        revenuePerKm: totalRevenuePerKm / filteredTrips.length,
        costPerKm: totalCostPerKm / filteredTrips.length,
      },
    ];
  };

  // Add inspection-related methods
  const addInspection = async (inspection: Omit<VehicleInspection, "id">): Promise<string> => {
    try {
      const newInspection = { ...inspection, id: uuidv4() };
      setInspections((prev) => [...prev, newInspection]);
      console.log("✅ Inspection added:", newInspection);
      return newInspection.id;
    } catch (error) {
      console.error("Error adding inspection:", error);
      throw error;
    }
  };

  const updateInspection = async (updatedInspection: VehicleInspection): Promise<void> => {
    try {
      setInspections((prev) =>
        prev.map((inspection) =>
          inspection.id === updatedInspection.id ? updatedInspection : inspection
        )
      );
      console.log("✅ Inspection updated:", updatedInspection);
    } catch (error) {
      console.error("Error updating inspection:", error);
      throw error;
    }
  };

  const deleteInspection = async (id: string): Promise<void> => {
    try {
      setInspections((prev) => prev.filter((inspection) => inspection.id !== id));
      console.log("✅ Inspection deleted with ID:", id);
    } catch (error) {
      console.error("Error deleting inspection:", error);
      throw error;
    }
  };

  // Job Card methods
  const addJobCard = async (jobCard: Omit<JobCardType, "id">): Promise<string> => {
    try {
      setIsLoading((prev) => ({ ...prev, addJobCard: true }));
      const newJobCard = {
        ...jobCard,
        id: uuidv4(),
      };
      setJobCards((prev) => [...prev, newJobCard]);
      console.log("✅ Job card added:", newJobCard);
      return newJobCard.id;
    } catch (error) {
      console.error("Error adding job card:", error);
      throw error;
    } finally {
      setIsLoading((prev) => ({ ...prev, addJobCard: false }));
    }
  };

  const updateJobCard = async (jobCard: JobCardType): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, updateJobCard: true }));
      setJobCards((prev) => prev.map((jc) => (jc.id === jobCard.id ? jobCard : jc)));
      console.log("✅ Job card updated:", jobCard);
    } catch (error) {
      console.error("Error updating job card:", error);
      throw error;
    } finally {
      setIsLoading((prev) => ({ ...prev, updateJobCard: false }));
    }
  };

  const deleteJobCard = async (id: string): Promise<void> => {
    try {
      setIsLoading((prev) => ({ ...prev, deleteJobCard: true }));
      setJobCards((prev) => prev.filter((jc) => jc.id !== id));
      console.log("✅ Job card deleted with ID:", id);
    } catch (error) {
      console.error("Error deleting job card:", error);
      throw error;
    } finally {
      setIsLoading((prev) => ({ ...prev, deleteJobCard: false }));
    }
  };

  const importDieselRecordsFn = async (records: DieselConsumptionRecord[]) => {
    try {
      const db = getFirestore();
      const batch = writeBatch(db);

      // Create a new batch write for all records
      records.forEach((record) => {
        const docRef = doc(collection(db, 'diesel'));
        batch.set(docRef, {
          ...record,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      // Commit the batch
      await batch.commit();

      // Update local storage
      const savedRecords = JSON.parse(localStorage.getItem('dieselRecords') || '[]');
      localStorage.setItem('dieselRecords', JSON.stringify([...savedRecords, ...records]));

    } catch (error) {
      console.error('Error importing diesel records:', error);
      throw error;
    }
  };

  const value = {
    // Connection status
    isOnline,

    // Google Maps
    isGoogleMapsLoaded,
    googleMapsError,
    loadGoogleMaps,
    trips,
    addTrip,
    updateTrip,
    deleteTrip,
    getTrip,
    refreshTrips,
    addCostEntry: placeholderString,
    updateCostEntry: placeholder,
    deleteCostEntry: placeholder,
    addAttachment: placeholderString,
    deleteAttachment: placeholder,
    addAdditionalCost: placeholderString,
    removeAdditionalCost: placeholder,
    addDelayReason: placeholderString,
    missedLoads,
    addMissedLoad,
    updateMissedLoad,
    deleteMissedLoad,
    updateInvoicePayment: async (
      tripId: string,
      paymentData: {
        paymentStatus: "unpaid" | "partial" | "paid";
        paymentAmount?: number;
        paymentReceivedDate?: string;
        paymentNotes?: string;
        paymentMethod?: string;
        bankReference?: string;
      }
    ): Promise<void> => {
      try {
        setIsLoading((prev) => ({ ...prev, [`updatePayment-${tripId}`]: true }));

        const trip = trips.find((t) => t.id === tripId);
        if (!trip) throw new Error(`Trip with ID ${tripId} not found`);

        const updatedTrip = {
          ...trip,
          paymentStatus: paymentData.paymentStatus,
          paymentAmount: paymentData.paymentAmount,
          paymentReceivedDate: paymentData.paymentReceivedDate,
          paymentNotes: paymentData.paymentNotes,
          paymentMethod: paymentData.paymentMethod,
          bankReference: paymentData.bankReference,
          status: paymentData.paymentStatus === "paid" ? "paid" : trip.status,
          lastUpdated: new Date().toISOString(),
        };

        await updateTripWithAdapter(tripId, updatedTrip);

        // Update local state
        setTrips((prev) => prev.map((t) => (t.id === tripId ? updatedTrip : t)));

        // Add audit log entry
        await addAuditLogToFirebase({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          user: "system", // In a real app, use the actual logged-in user
          action: "update",
          entity: "trip",
          entityId: tripId,
          details: `Payment status updated to ${paymentData.paymentStatus}`,
          changes: {
            paymentStatus: {
              previous: trip.paymentStatus,
              new: paymentData.paymentStatus,
            },
            paymentAmount: {
              previous: trip.paymentAmount,
              new: paymentData.paymentAmount,
            },
          },
        });

        console.log(`✅ Payment updated for trip ${tripId}`);
      } catch (error) {
        console.error("❌ Error updating payment:", error);
        throw error;
      } finally {
        setIsLoading((prev) => {
          const newState = { ...prev };
          delete newState[`updatePayment-${tripId}`];
          return newState;
        });
      }
    },
    importTripsFromCSV: async (newTrips: Omit<Trip, "id" | "costs" | "status">[]) => {
      for (const trip of newTrips) {
        await addTrip(trip);
      }
    },
    triggerTripImport,
    importCostsFromCSV: placeholder,
  importTripsFromWebhook: placeholderWebhook,
  importDieselRecords: importDieselRecordsFn,
    importDriverBehaviorEventsFromWebhook: async () => {
      try {
        console.log("🔄 Importing driver behavior events from webhook...");
        await triggerDriverBehaviorImport();

        // Wait for a moment to allow the cloud function to process and update Firestore
        // This is a temporary solution until we have proper webhook response handling
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Since we're using real-time listeners, the UI will update automatically
        // when the cloud function adds the data to Firestore
        console.log("✅ Driver behavior import triggered successfully");
        return { imported: 1, skipped: 0 }; // We don't know the actual counts yet
      } catch (error) {
        console.error("❌ Error importing driver behavior events:", error);
        throw error;
      }
    },
    dieselRecords,
    addDieselRecord,
    updateDieselRecord: async (record: DieselConsumptionRecord): Promise<void> => {
      try {

        // Get the original record to track changes
        const originalRecord = dieselRecords.find((r) => r.id === record.id);

        // Update the record in Firestore
        await updateTripWithAdapter(record.id, record);

        // If this record is linked to a trip, update the corresponding cost entry
        if (record.tripId) {
          const trip = trips.find((t) => t.id === record.tripId);
          if (trip) {
            // Find the cost entry that corresponds to this diesel record
            const costIndex = trip.costs.findIndex(
              (c) =>
                c.referenceNumber === `DIESEL-${record.id}` ||
                c.referenceNumber === `DIESEL-REEFER-${record.id}`
            );

            if (costIndex !== -1) {
              // Update the existing cost entry
              const updatedCosts = [...trip.costs];
              const existingCost = updatedCosts[costIndex];
              if (existingCost) {
                updatedCosts[costIndex] = {
                  ...existingCost,
                  id: existingCost.id || uuidv4(), // Ensure id is always present
                  tripId: existingCost.tripId || trip.id, // Ensure tripId is present
                  amount: record.totalCost,
                  currency: record.currency || trip.revenueCurrency,
                  notes: `Diesel: ${record.litresFilled} liters at ${record.fuelStation}${record.isReeferUnit ? " (Reefer)" : ""}`,
                  // Removed updatedAt property as it doesn't exist in CostEntry type
                };
              }

              // Use helper to map costs with description property before updating
              const costsWithDescription = updatedCosts.map((cost) => ({
                ...cost,
                description: cost.notes || cost.category || `${cost.category} - ${cost.amount}`,
              }));

              await updateTripWithAdapter(trip.id, {
                ...trip,
                costs: costsWithDescription as any,
              });
            }
          }
        }

        // Log diesel update for audit trail
        await addAuditLogToFirebase({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          user: "system", // Replace with actual user
          action: "update",
          entity: "diesel",
          entityId: record.id,
          details: `Diesel record ${record.id} updated for ${record.fleetNumber}`,
          changes: {
            before: originalRecord,
            after: record,
          },
        });

        console.log("✅ Diesel record updated:", record.id);
      } catch (error) {
        console.error("❌ Error updating diesel record:", error);
        throw error;
      }
    },

    deleteDieselRecord: async (id: string): Promise<void> => {
      try {
        // Get the record before deletion for audit and to check if it's linked to a trip
        const record = dieselRecords.find((r) => r.id === id);
        if (!record) {
          console.warn(`Diesel record with ID ${id} not found, nothing to delete`);
          return;
        }

        // If this record is linked to a trip, remove the corresponding cost entry
        if (record.tripId) {
          const trip = trips.find((t) => t.id === record.tripId);
          if (trip) {
            // Find and remove the cost entry that corresponds to this diesel record
            const updatedCosts = trip.costs.filter(
              (c) =>
                c.referenceNumber !== `DIESEL-${id}` && c.referenceNumber !== `DIESEL-REEFER-${id}`
            );

            if (updatedCosts.length !== trip.costs.length) {
              // Only update if we actually removed a cost
              await updateTripWithAdapter(trip.id, {
                ...trip,
                costs: updatedCosts,
              });
            }
          }
        }

        // Delete the record from Firestore
        await deleteTripFromFirebase(id);

        // Log diesel deletion for audit trail
        await addAuditLogToFirebase({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          user: "system", // Replace with actual user
          action: "delete",
          entity: "diesel",
          entityId: id,
          details: `Diesel record ${id} deleted for ${record.fleetNumber}`,
          changes: record,
        });

        // Optimistically remove from local state
        setDieselRecords((prev) => prev.filter((r) => r.id !== id));

        console.log("✅ Diesel record deleted:", id);
      } catch (error) {
        console.error("❌ Error deleting diesel record:", error);
        throw error;
      }
    },

    importDieselFromCSV: async (records: Omit<DieselConsumptionRecord, "id">[]): Promise<void> => {
      try {
        console.log(`🔄 Importing ${records.length} diesel records from CSV...`);

        const importResults = {
          success: 0,
          failed: 0,
          skipped: 0,
          errors: [] as string[],
        };

        // Process each record sequentially to ensure all validation logic runs
        for (const record of records) {
          try {
            // Check for duplicate records (same fleet, date, and km reading)
            const isDuplicate = dieselRecords.some(
              (existing) =>
                existing.fleetNumber === record.fleetNumber &&
                existing.date === record.date &&
                existing.kmReading === record.kmReading &&
                Math.abs(existing.litresFilled - record.litresFilled) < 0.1 // Small tolerance for rounding errors
            );

            if (isDuplicate) {
              console.warn(
                `⚠️ Skipping duplicate diesel record for ${record.fleetNumber} on ${record.date}`
              );
              importResults.skipped++;
              continue;
            }

            // Add the record
            await addDieselRecord(record);
            importResults.success++;
          } catch (recordError) {
            console.error(
              `❌ Failed to import diesel record for ${record.fleetNumber}:`,
              recordError
            );
            importResults.failed++;
            importResults.errors.push(
              `${record.fleetNumber} on ${record.date}: ${(recordError as Error).message}`
            );
          }
        }

        console.log(
          `✅ Diesel import complete: ${importResults.success} added, ${importResults.skipped} skipped, ${importResults.failed} failed`
        );

        // Add import summary to audit log
        await addAuditLogToFirebase({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          user: "system", // Replace with actual user
          action: "create", // Changed from 'import' to satisfy AuditLog type
          entity: "diesel",
          entityId: "batch",
          details: `Diesel CSV import: ${importResults.success} added, ${importResults.skipped} skipped, ${importResults.failed} failed`,
          changes: importResults,
        });
      } catch (error) {
        console.error("❌ Error importing diesel records from CSV:", error);
        throw error;
      }
    },

    updateDieselDebrief: async (
      recordId: string,
      debriefData: {
        debriefDate: string;
        debriefNotes: string;
        debriefSignedBy: string;
        rootCause?: string;
        actionTaken?: string;
        driverSignature?: string;
        probeReading?: number;
        probeDiscrepancy?: number;
        probeVerified?: boolean;
        probeVerificationNotes?: string;
      }
    ): Promise<void> => {
      try {
        // Get the current record
        const record = dieselRecords.find((r: DieselConsumptionRecord) => r.id === recordId);
        if (!record) {
          throw new Error(`Diesel record with ID ${recordId} not found`);
        }

        // If probe data is provided and this is a fleet with probe
        const hasProbe = FLEETS_WITH_PROBES.includes(record.fleetNumber);

        const updatedRecord = {
          ...record,
          debriefDate: debriefData.debriefDate,
          debriefNotes: debriefData.debriefNotes,
          rootCause: debriefData.rootCause,
          actionTaken: debriefData.actionTaken,
          debriefSignedBy: debriefData.debriefSignedBy,
          driverSignature: debriefData.driverSignature,
          debriefSignedAt: new Date().toISOString(),
        };

        // Add probe verification data if applicable
        if (hasProbe && debriefData.probeReading !== undefined) {
          updatedRecord.probeReading = debriefData.probeReading;
          updatedRecord.probeDiscrepancy =
            debriefData.probeDiscrepancy || debriefData.probeReading - record.litresFilled;
          updatedRecord.probeVerified = debriefData.probeVerified || false;
          updatedRecord.probeVerificationNotes = debriefData.probeVerificationNotes;
          updatedRecord.probeVerifiedAt = new Date().toISOString();
          updatedRecord.probeVerifiedBy = debriefData.debriefSignedBy;
        }

        // Update the record
        await updateTripWithAdapter(recordId, updatedRecord);

        // Log debrief for audit trail
        await addAuditLogToFirebase({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          user: "system", // Replace with actual user
          action: "update", // Changed from 'debrief' to satisfy AuditLog type
          entity: "diesel",
          entityId: recordId,
          details: `Diesel debrief completed for ${record.fleetNumber} by ${debriefData.debriefSignedBy}`,
          changes: {
            debriefData,
            hasProbe,
            probeDiscrepancy: updatedRecord.probeDiscrepancy,
          },
        });

        console.log(`✅ Diesel debrief updated for record ${recordId}`);
      } catch (error) {
        console.error("❌ Error updating diesel debrief:", error);
        throw error;
      }
    },

    allocateDieselToTrip: async (dieselId: string, tripId: string): Promise<void> => {
      try {
        // Get the diesel record and trip
        const record = dieselRecords.find((r) => r.id === dieselId);
        const trip = trips.find((t) => t.id === tripId);

        if (!record) {
          throw new Error(`Diesel record with ID ${dieselId} not found`);
        }

        if (!trip) {
          throw new Error(`Trip with ID ${tripId} not found`);
        }

        // Check if this diesel is already linked to a different trip
        if (record.tripId && record.tripId !== tripId) {
          // Need to remove it from the old trip first - inline the removal logic
          const oldTripId = record.tripId;
          const oldTrip = trips.find((t) => t.id === oldTripId);

          if (oldTrip) {
            // Find and remove the cost entry that corresponds to this diesel record
            const updatedCosts = oldTrip.costs.filter(
              (c) =>
                c.referenceNumber !== `DIESEL-${dieselId}` &&
                c.referenceNumber !== `DIESEL-REEFER-${dieselId}`
            );

            // Only update if we actually removed a cost
            if (updatedCosts.length !== oldTrip.costs.length) {
              await updateTripWithAdapter(oldTrip.id, {
                ...oldTrip,
                costs: updatedCosts,
              });

              console.log(`✅ Diesel record ${dieselId} removed from previous trip ${oldTrip.id}`);
            }
          }
        }

        // Create a new cost entry for this diesel record
        const costEntry: CostEntry = {
          id: `cost-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          tripId: tripId,
          category: "Diesel",
          subCategory: `${record.fuelStation} - ${record.fleetNumber}${record.isReeferUnit ? " (Reefer)" : ""}`,
          amount: record.totalCost,
          currency: record.currency || trip.revenueCurrency,
          referenceNumber: `DIESEL-${record.isReeferUnit ? "REEFER-" : ""}${record.id}`,
          date: record.date,
          notes: `Diesel: ${record.litresFilled} liters at ${record.fuelStation}${record.isReeferUnit ? " (Reefer)" : ""}`,
          attachments: [],
          isFlagged: false,
        };

        // Update the trip with the new cost entry
        const updatedTrip = {
          ...trip,
          costs: [...trip.costs, costEntry],
        };

        // Update the diesel record with the trip link
        const updatedRecord = {
          ...record,
          tripId: tripId,
          updatedAt: new Date().toISOString(),
        };

        // Save both updates
        await updateTripWithAdapter(tripId, updatedTrip);
        await updateTripWithAdapter(dieselId, updatedRecord);

        // Log allocation for audit trail
        await addAuditLogToFirebase({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          user: "system", // Replace with actual user
          action: "update", // Changed from 'allocate' to satisfy AuditLog type
          entity: "diesel",
          entityId: dieselId,
          details: `Diesel record ${dieselId} allocated to trip ${tripId}`,
          changes: {
            dieselRecord: updatedRecord,
            costEntry: costEntry,
          },
        });

        console.log(`✅ Diesel record ${dieselId} allocated to trip ${tripId}`);
      } catch (error) {
        console.error("❌ Error allocating diesel to trip:", error);
        throw error;
      }
    },

    removeDieselFromTrip: async (dieselId: string): Promise<void> => {
      try {
        // Get the diesel record
        const record = dieselRecords.find((r) => r.id === dieselId);

        if (!record) {
          throw new Error(`Diesel record with ID ${dieselId} not found`);
        }

        // If not linked to any trip, nothing to do
        if (!record.tripId) {
          console.warn(`Diesel record ${dieselId} is not linked to any trip`);
          return;
        }

        // Get the trip
        const trip = trips.find((t) => t.id === record.tripId);

        if (!trip) {
          // Trip doesn't exist anymore, just update the diesel record
          const updatedRecord = {
            ...record,
            tripId: undefined,
          };
          await updateTripWithAdapter(dieselId, updatedRecord);
          console.log(`✅ Diesel record ${dieselId} unlinked (trip ${record.tripId} not found)`);
          return;
        }

        // Find and remove the cost entry that corresponds to this diesel record
        const updatedCosts = trip.costs.filter(
          (c) =>
            c.referenceNumber !== `DIESEL-${dieselId}` &&
            c.referenceNumber !== `DIESEL-REEFER-${dieselId}`
        );

        // Update the trip without the cost entry
        if (updatedCosts.length !== trip.costs.length) {
          // Only update if we actually removed a cost
          await updateTripWithAdapter(trip.id, {
            ...trip,
            costs: updatedCosts,
          });
        }

        // Update the diesel record to remove the trip link
        const updatedRecord = {
          ...record,
          tripId: undefined,
          updatedAt: new Date().toISOString(),
        };

        await updateTripWithAdapter(dieselId, updatedRecord);

        // Log removal for audit trail
        await addAuditLogToFirebase({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          user: "system", // Replace with actual user
          action: "delete", // Changed from 'unlink' to satisfy AuditLog type
          entity: "diesel",
          entityId: dieselId,
          details: `Diesel record ${dieselId} removed from trip ${trip.id}`,
          changes: {
            dieselRecord: record,
            tripId: trip.id,
          },
        });

        console.log(`✅ Diesel record ${dieselId} removed from trip ${trip.id}`);
      } catch (error) {
        console.error("❌ Error removing diesel from trip:", error);
        throw error;
      }
    },
    driverBehaviorEvents,
    addDriverBehaviorEvent: placeholderString,
    updateDriverBehaviorEvent: placeholder,
    deleteDriverBehaviorEvent: placeholder,
    getDriverPerformance,
    getAllDriversPerformance,
    triggerDriverBehaviorImport,
    actionItems,
    addActionItem: placeholderString,
    updateActionItem: placeholder,
    deleteActionItem: placeholder,
    addActionItemComment: placeholder,
    carReports,
    addCARReport: placeholderString,
    updateCARReport: placeholder,
    deleteCARReport: placeholder,
    workshopInventory,
    addWorkshopInventoryItem,
    updateWorkshopInventoryItem,
    deleteWorkshopInventoryItem,
    refreshWorkshopInventory,
    inspections,
    addInspection,
    updateInspection,
    deleteInspection,
    refreshInspections,
    jobCards,
    addJobCard,
    updateJobCard,
    deleteJobCard,
    refreshJobCards: async () => {
      try {
        setIsLoading((prev) => ({ ...prev, refreshJobCards: true }));
        console.log("🔄 Refreshing job cards data from Firestore...");

        // Simulate Firestore fetch
        const fetchedJobCards: JobCardType[] = []; // Replace with actual Firestore fetch logic
        setJobCards(fetchedJobCards);

        console.log("✅ Job cards data refreshed successfully");
        return Promise.resolve();
      } catch (error) {
        console.error("❌ Error refreshing job cards data:", error);
        throw error;
      } finally {
        setIsLoading((prev) => ({ ...prev, refreshJobCards: false }));
      }
    },
    connectionStatus,
    // Client Management
    clients,
    addClient,
    updateClient,
    deleteClient,
    getClient,
    addClientRelationship,
    removeClientRelationship,
    bulkDeleteTrips: placeholder,
    updateTripStatus: async (
      tripId: string,
      status: "shipped" | "delivered",
      notes: string
    ): Promise<void> => {
      try {
        const trip = trips.find((t) => t.id === tripId);
        if (!trip) {
          throw new Error(`Trip with ID ${tripId} not found`);
        }

        const updatedTrip = {
          ...trip,
          status: status === "delivered" ? "completed" : trip.status,
          shippedAt: status === "shipped" ? new Date().toISOString() : trip.shippedAt,
          deliveredAt: status === "delivered" ? new Date().toISOString() : trip.deliveredAt,
          statusNotes: notes || trip.statusNotes,
        };

        await updateTripWithAdapter(tripId, updatedTrip);
        console.log(`✅ Trip ${tripId} status updated to ${status}`);
      } catch (error) {
        console.error(`❌ Error updating trip status to ${status}:`, error);
        throw error;
      }
    },
    setTrips,
    completeTrip,
    auditLogs,
    isLoading,
    // Trip Templates
    tripTemplates,
    addTripTemplate,
    updateTripTemplate,
    deleteTripTemplate,
    getTripTemplate,

    // Load Plans
    loadPlans,
    addLoadPlan,
    updateLoadPlan,
    deleteLoadPlan,
    getLoadPlan,

    // Route Planning & Optimization
    planRoute,
    optimizeRoute,

    // Trip Progress & Delivery
    updateTripProgress,
    confirmDelivery,

    // Trip Financials
    generateTripFinancialAnalysis,
    getTripFinancialAnalysis,

    // PDF Generation
    generateQuoteConfirmationPdf,
    generateLoadConfirmationPdf,

    // Fleet Utilization
    calculateFleetUtilization,
    getFleetUtilizationMetrics,

    getJobCard: (id: string) => jobCards.find((jobCard) => jobCard.id === id),

    FLEETS_WITH_PROBES,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
function calculateTotalCosts(costs: CostEntry[]) {
  // Sum the amount of all cost entries that are not flagged as system-generated and not flagged for investigation
  return costs
    .filter((cost) => !cost.isFlagged && !cost.isSystemGenerated)
    .reduce((sum, cost) => sum + (typeof cost.amount === "number" ? cost.amount : 0), 0);
}
