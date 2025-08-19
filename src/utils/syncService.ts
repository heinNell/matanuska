import {
  addDoc,
  collection,
  disableNetwork,
  doc,
  enableNetwork,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Unsubscribe,
  updateDoc,
  where,
} from "firebase/firestore";
import { type ClientOptions } from "openai/index";
import { db } from "../firebase";
import {
  type ActionItem,
  type AuditLog,
  CARReport,
  CostEntry,
  DieselConsumptionRecord,
  DriverBehaviorEvent,
  MissedLoad,
  Trip,
} from "../types";
import { EnhancedJobCard, JobCard } from "../types/workshop-job-card";
import { Tyre } from "../types/workshop-tyre-inventory";
import { cleanObjectForFirestore, convertTimestamps } from "./firestoreUtils";
import { TyreInventoryItem } from "./tyreConstants";

// Collection references
// const tripsCollection = collection(db, 'trips'); // Unused
const dieselCollection = collection(db, "diesel");
const driverBehaviorCollection = collection(db, "driverBehaviorEvents");
const auditLogsCollection = collection(db, "auditLogs");
const workshopInventoryCollection = collection(db, "workshopInventory");
const jobCardsCollection = collection(db, "jobCards");
const enhancedJobCardsCollection = collection(db, "enhancedJobCards");
const tyresCollection = collection(db, "tyres");

// Type for sync status
export type SyncStatus = "idle" | "syncing" | "success" | "error";
export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

// Interface for sync listeners
interface SyncListeners {
  onSyncStatusChange?: (status: SyncStatus) => void;
  onConnectionStatusChange?: (status: ConnectionStatus) => void;
  onTripUpdate?: (trip: Trip) => void;
  onDieselUpdate?: (record: DieselConsumptionRecord) => void;
  onDriverBehaviorUpdate?: (event: DriverBehaviorEvent) => void;
  onAuditLogUpdate?: (log: AuditLog) => void;
  onJobCardUpdate?: (jobCard: JobCard) => void;
  onEnhancedJobCardUpdate?: (jobCard: EnhancedJobCard) => void;
  onTyreUpdate?: (tyre: Tyre) => void;
}

// Sync service class
import type { ConnectionStatus } from "../types/connection";

export class SyncService {
  private listeners: SyncListeners = {};
  private dataCallbacks: Record<string, (...args: any[]) => void> = {};
  private tripUnsubscribes: Map<string, () => void> = new Map();
  private dieselUnsubscribes: Map<string, () => void> = new Map();
  private driverBehaviorUnsubscribes: Map<string, () => void> = new Map();
  private globalUnsubscribes: Map<string, Unsubscribe> = new Map();
  private auditLogUnsubscribes: Map<string, () => void> = new Map();
  private jobCardUnsubscribes: Map<string, () => void> = new Map();
  private enhancedJobCardUnsubscribes: Map<string, () => void> = new Map();
  private tyreUnsubscribes: Map<string, () => void> = new Map();
  public syncStatus: SyncStatus = "idle";
  public connectionStatus: ConnectionStatus = "connected";
  private pendingChanges: Map<string, any> = new Map();
  public isOnline: boolean = navigator.onLine;
  public lastSynced: Date | null = null;
  public pendingChangesCount = 0;

  constructor() {
    // Listen for online/offline events
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);

    // Initialize online status
    this.isOnline = navigator.onLine;
    console.log(`SyncService initialized. Online status: ${this.isOnline ? "online" : "offline"}`);

    // Setup a periodic connection check
    setInterval(() => this.checkConnection(), 60000); // Check every minute
  }

  // Register data callbacks for all collections
  public registerDataCallbacks(callbacks: Record<string, (...args: any[]) => void>): void {
    this.dataCallbacks = { ...this.dataCallbacks, ...callbacks };
    console.log("✅ Data callbacks registered:", Object.keys(callbacks).join(", "));
  }

  // Register listeners
  public registerListeners(listeners: SyncListeners): void {
    this.listeners = { ...this.listeners, ...listeners };
  }

  // Check connection and attempt reconnection if needed
  private async checkConnection(): Promise<void> {
    if (!this.isOnline && navigator.onLine) {
      // We were offline but now we appear to be online
      console.log("Network connection detected - attempting to reconnect");
      await this.handleOnline();
    } else if (this.isOnline && !navigator.onLine) {
      // We were online but now appear to be offline
      this.handleOffline();
    }
  }

  // Handle online event
  private handleOnline = async (): Promise<void> => {
    console.log("🟢 Connection restored - syncing pending changes");
    this.isOnline = true;
    this.setConnectionStatus("reconnecting");
    this.setSyncStatus("syncing");

    try {
      // Enable Firestore network
      await enableNetwork(db);

      // Process any pending changes
      await this.processPendingChanges();
      this.setSyncStatus("success");
      this.setConnectionStatus("connected");
      this.lastSynced = new Date();
    } catch (error) {
      console.error("Error syncing pending changes:", error);
      this.setConnectionStatus("disconnected");
      this.setSyncStatus("error");
    }
  };

  // Handle offline event
  private handleOffline = (): void => {
    console.log("🔴 Connection lost - working offline");
    this.isOnline = false;
    this.setConnectionStatus("disconnected");
    this.setSyncStatus("idle");

    // Disable Firestore network to avoid unnecessary retries
    disableNetwork(db).catch((error) => {
      console.error("Error disabling Firestore network:", error);
    });
  };

  // Set sync status and notify listeners
  private setSyncStatus(status: SyncStatus): void {
    this.syncStatus = status;
    this.pendingChangesCount = this.pendingChanges.size;
    if (this.listeners.onSyncStatusChange) {
      this.listeners.onSyncStatusChange(status);
    }
  }

  // Set connection status and notify listeners
  private setConnectionStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    if (this.listeners.onConnectionStatusChange) {
      this.listeners.onConnectionStatusChange(status);
    }
  }

  // Process pending changes when back online
  private async processPendingChanges(): Promise<void> {
    if (this.pendingChanges.size === 0) return;

    console.log(`Processing ${this.pendingChanges.size} pending changes`);

    for (const [key, change] of this.pendingChanges.entries()) {
      try {
        const parts = key.split(":");
        const collection = parts[0];
        const id = parts[1];

        if (!collection || !id) {
          console.warn(`Invalid pending change key: ${key}`);
          continue;
        }

        const docRef = doc(db, collection, id);

        // Add server timestamp
        const dataWithTimestamp = {
          ...change,
          updatedAt: serverTimestamp(),
        };

        await updateDoc(docRef, dataWithTimestamp);
        console.log(`✅ Synced change for ${collection}/${id}`);

        // Remove from pending changes
        this.pendingChanges.delete(key);
      } catch (error) {
        console.error(`Error syncing change for ${key}:`, error);
      }
    }
  }

  // Subscribe to a trip's real-time updates
  public subscribeToTrip(tripId: string): void {
    // DEBUG ONLY - Validate context
    console.log("🔍 subscribeToTrip called with tripId:", tripId);
    console.log("🔍 this context available:", this !== undefined);
    console.log("🔍 tripUnsubscribes available:", this?.tripUnsubscribes !== undefined);

    // Guard against undefined 'this'
    if (!this || !this.tripUnsubscribes) {
      console.error(
        '❌ ERROR: Missing context in subscribeToTrip - "this" is unavailable',
        new Error().stack
      );
      return; // Abort to prevent crash
    }

    // Unsubscribe if already subscribed
    if (this.tripUnsubscribes.has(tripId)) {
      this.tripUnsubscribes.get(tripId)?.();
    }

    const tripRef = doc(db, "trips", tripId);

    const unsubscribe = onSnapshot(
      tripRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const tripData = snapshot.data();

          // Convert Firestore timestamps to ISO strings using our helper function
          const trip = convertTimestamps(tripData) as Trip;

          console.log(`🔄 Real-time update for trip ${tripId}`);

          if (this.listeners.onTripUpdate) {
            this.listeners.onTripUpdate({ ...trip, id: tripId });
          }
        }
      },
      (error) => {
        console.error(`Error subscribing to trip ${tripId}:`, error);
      }
    );

    this.tripUnsubscribes.set(tripId, unsubscribe);
  }

  // Unsubscribe from trips collection subscription
  public unsubscribeFromTrips(): void {
    // Unsubscribe from global trips listener if it exists
    if (this.globalUnsubscribes.has("allTrips")) {
      this.globalUnsubscribes.get("allTrips")?.();
      this.globalUnsubscribes.delete("allTrips");
      console.log("🔄 Unsubscribed from trips collection");
    }
  }

  // Unsubscribe from tyres collection subscription
  public unsubscribeFromAllTyres(): void {
    // Unsubscribe from global tyres listener if it exists
    if (this.globalUnsubscribes.has("allTyres")) {
      this.globalUnsubscribes.get("allTyres")?.();
      this.globalUnsubscribes.delete("allTyres");
      console.log("🔄 Unsubscribed from tyres collection");
    }
  }

  // Subscribe to all trips (global listener)
  public subscribeToAllTrips(): void {
    // Clear any existing global trip listeners
    this.unsubscribeFromTrips();

    // Check if user is authenticated before subscribing
    if (!this.isAuthenticated()) {
      console.warn("⚠️ Cannot subscribe to trips - user not authenticated");
      return;
    }

    const tripsQuery = query(collection(db, "trips"), orderBy("startDate", "desc"));

    const unsubscribe = onSnapshot(
      tripsQuery,
      (snapshot) => {
        const trips: Trip[] = [];

        // Track changes for debugging
        let added = 0,
          modified = 0,
          removed = 0;

        // Process document changes
        snapshot.docChanges().forEach((change) => {
          const id = change.doc.id;
          const data = convertTimestamps(change.doc.data());

          if (change.type === "added") {
            added++;
            console.log(`Trip added: ${id}`);
            trips.push({ id, ...data } as Trip);
          } else if (change.type === "modified") {
            modified++;
            console.log(`Trip modified: ${id}`);
            trips.push({ id, ...data } as Trip);
          } else if (change.type === "removed") {
            removed++;
            console.log(`Trip removed: ${id}`);
            // Removed trips will be filtered out when we rebuild the trips array
          }
        });

        // If we have added/modified/removed items, do a full rebuild of the trips array
        if (added > 0 || modified > 0 || removed > 0) {
          console.log(
            `🔄 Global trips listener changes: ${added} added, ${modified} modified, ${removed} removed`
          );

          // For a complete refresh, get all current documents
          const currentTrips: Trip[] = [];
          snapshot.forEach((doc) => {
            const data = convertTimestamps(doc.data());
            currentTrips.push({ id: doc.id, ...data } as Trip);
          });

          if (typeof this.dataCallbacks.setTrips === "function") {
            this.dataCallbacks.setTrips(currentTrips);
          } else {
            console.warn("⚠️ setTrips callback not registered");
          }
          this.lastSynced = new Date();
        }
      },
      (error) => {
        console.error("Error in global trips listener:", error);
        // Don't change connection status here to avoid false disconnections
      }
    );

    this.globalUnsubscribes.set("allTrips", unsubscribe);
  }

  // Subscribe to diesel records for a specific fleet
  public subscribeToDieselRecords(fleetNumber: string): void {
    // Unsubscribe if already subscribed
    if (this.dieselUnsubscribes.has(fleetNumber)) {
      this.dieselUnsubscribes.get(fleetNumber)?.();
    }

    const q = query(
      dieselCollection,
      where("fleetNumber", "==", fleetNumber),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const dieselData = change.doc.data();

          // Convert Firestore timestamps to ISO strings
          const dieselRecord = convertTimestamps(dieselData) as DieselConsumptionRecord;

          if (change.type === "added" || change.type === "modified") {
            console.log(`🔄 Real-time update for diesel record ${change.doc.id}`);

            if (this.listeners.onDieselUpdate) {
              this.listeners.onDieselUpdate({ ...dieselRecord, id: change.doc.id });
            }
          }
        });
      },
      (error) => {
        console.error(`Error subscribing to diesel records for fleet ${fleetNumber}:`, error);
      }
    );

    this.dieselUnsubscribes.set(fleetNumber, unsubscribe);
  }

  // Subscribe to driver behavior events for a specific driver
  public subscribeToDriverBehavior(driverName: string): void {
    // Unsubscribe if already subscribed
    if (this.driverBehaviorUnsubscribes.has(driverName)) {
      this.driverBehaviorUnsubscribes.get(driverName)?.();
    }

    const q = query(
      driverBehaviorCollection,
      where("driverName", "==", driverName),
      orderBy("eventDate", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const eventData = change.doc.data();

          // Convert Firestore timestamps to ISO strings
          const event = convertTimestamps(eventData) as DriverBehaviorEvent;

          if (change.type === "added" || change.type === "modified") {
            console.log(`🔄 Real-time update for driver behavior event ${change.doc.id}`);

            if (this.listeners.onDriverBehaviorUpdate) {
              this.listeners.onDriverBehaviorUpdate({ ...event, id: change.doc.id });
            }
          }
        });
      },
      (error) => {
        console.error(`Error subscribing to driver behavior for ${driverName}:`, error);
      }
    );

    this.driverBehaviorUnsubscribes.set(driverName, unsubscribe);
  }

  // Subscribe to all driver behavior events (global listener)
  public subscribeToAllDriverBehaviorEvents(): void {
    // Clear any existing global driver behavior listeners
    if (this.globalUnsubscribes.has("allDriverBehavior")) {
      this.globalUnsubscribes.get("allDriverBehavior")?.();
    }

    // Check if user is authenticated before subscribing
    if (!this.isAuthenticated()) {
      console.warn("⚠️ Cannot subscribe to driver behavior events - user not authenticated");
      return;
    }

    const eventsQuery = query(collection(db, "driverBehaviorEvents"), orderBy("eventDate", "desc"));

    const unsubscribe = onSnapshot(
      eventsQuery,
      (snapshot) => {
        // Track changes for debugging
        let added = 0,
          modified = 0,
          removed = 0;

        // Process document changes
        snapshot.docChanges().forEach((change) => {
          const id = change.doc.id;

          if (change.type === "added") {
            added++;
            console.log(`Driver behavior event added: ${id}`);
          } else if (change.type === "modified") {
            modified++;
            console.log(`Driver behavior event modified: ${id}`);
          } else if (change.type === "removed") {
            removed++;
            console.log(`Driver behavior event removed: ${id}`);
          }
        });

        if (added > 0 || modified > 0 || removed > 0) {
          console.log(
            `🔄 Driver behavior changes: ${added} added, ${modified} modified, ${removed} removed`
          );

          // Get all current documents for a full refresh
          const events: DriverBehaviorEvent[] = [];
          snapshot.forEach((doc) => {
            const data = convertTimestamps(doc.data());
            events.push({ id: doc.id, ...data } as DriverBehaviorEvent);
          });

          if (typeof this.dataCallbacks.setDriverBehaviorEvents === "function") {
            this.dataCallbacks.setDriverBehaviorEvents(events);
          } else {
            console.warn("⚠️ setDriverBehaviorEvents callback not registered");
          }
          this.lastSynced = new Date();
        }
      },
      (error) => {
        console.error("Error in global driver behavior listener:", error);
      }
    );

    this.globalUnsubscribes.set("allDriverBehavior", unsubscribe);
  }

  // Subscribe to all diesel records (global listener)
  public subscribeToAllDieselRecords(): void {
    // Clear any existing global diesel listeners
    if (this.globalUnsubscribes.has("allDiesel")) {
      this.globalUnsubscribes.get("allDiesel")?.();
    }

    // Check if user is authenticated before subscribing
    if (!this.isAuthenticated()) {
      console.warn("⚠️ Cannot subscribe to diesel records - user not authenticated");
      return;
    }

    const recordsQuery = query(collection(db, "diesel"), orderBy("date", "desc"));

    const unsubscribe = onSnapshot(
      recordsQuery,
      (snapshot) => {
        // Track changes for debugging
        let added = 0,
          modified = 0,
          removed = 0;

        // Process document changes
        snapshot.docChanges().forEach((change) => {
          const id = change.doc.id;

          if (change.type === "added") {
            added++;
            console.log(`Diesel record added: ${id}`);
          } else if (change.type === "modified") {
            modified++;
            console.log(`Diesel record modified: ${id}`);
          } else if (change.type === "removed") {
            removed++;
            console.log(`Diesel record removed: ${id}`);
          }
        });

        if (added > 0 || modified > 0 || removed > 0) {
          console.log(
            `🔄 Diesel records changes: ${added} added, ${modified} modified, ${removed} removed`
          );

          // Get all current documents for a full refresh
          const records: DieselConsumptionRecord[] = [];
          snapshot.forEach((doc) => {
            const data = convertTimestamps(doc.data());
            records.push({ id: doc.id, ...data } as DieselConsumptionRecord);
          });

          if (typeof this.dataCallbacks.setDieselRecords === "function") {
            this.dataCallbacks.setDieselRecords(records);
          } else {
            console.warn("⚠️ setDieselRecords callback not registered");
          }
          this.lastSynced = new Date();
        }
      },
      (error) => {
        console.error("Error in global diesel listener:", error);
      }
    );

    this.globalUnsubscribes.set("allDiesel", unsubscribe);
  }

  // Subscribe to audit logs
  public subscribeToAuditLogs(): void {
    // Check if user is authenticated before subscribing
    if (!this.isAuthenticated()) {
      console.warn("⚠️ Cannot subscribe to audit logs - user not authenticated");
      return;
    }

    const unsubscribe = onSnapshot(
      query(auditLogsCollection, orderBy("timestamp", "desc")),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const logData = change.doc.data();
          const log = convertTimestamps(logData) as AuditLog;

          if (change.type === "added") {
            const auditLog = { ...log, id: change.doc.id };
            if (typeof this.dataCallbacks.setAuditLogs === "function") {
              // Get current audit logs and add the new one
              this.dataCallbacks.setAuditLogs((prevLogs: AuditLog[]) => [auditLog, ...prevLogs]);
            } else if (this.listeners.onAuditLogUpdate) {
              this.listeners.onAuditLogUpdate(auditLog);
            }
          }
        });
      },
      (error) => {
        console.error(`Error subscribing to audit logs:`, error);
      }
    );

    this.auditLogUnsubscribes.set("all", unsubscribe);
  }

  // Update a trip with real-time sync
  public async updateTrip(tripId: string, data: Partial<Trip>): Promise<void> {
    try {
      this.setSyncStatus("syncing");

      // Clean data for Firestore (remove undefined values)
      const cleanData = cleanObjectForFirestore(data);

      // Add updatedAt timestamp
      const updateData = {
        ...cleanData,
        updatedAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
      };

      if (this.isOnline) {
        // Online - update directly
        const tripRef = doc(db, "trips", tripId);
        await updateDoc(tripRef, updateData);
        console.log(`✅ Trip ${tripId} updated with real-time sync`);
      } else {
        // Offline - store for later sync
        this.pendingChanges.set(`trips:${tripId}`, updateData);
        console.log(`📝 Trip ${tripId} update queued for sync when online`);

        // Store in localStorage as backup
        this.storePendingChangesInLocalStorage();
      }

      this.setSyncStatus("success");
    } catch (error) {
      console.error(`Error updating trip ${tripId}:`, error);
      this.setSyncStatus("error");
      throw error;
    }
  }

  // Update a diesel record with real-time sync
  public async updateDieselRecord(
    recordId: string,
    data: Partial<DieselConsumptionRecord>
  ): Promise<void> {
    try {
      this.setSyncStatus("syncing");

      // Clean data for Firestore
      const cleanData = cleanObjectForFirestore(data);

      // Add updatedAt timestamp
      const updateData = {
        ...cleanData,
        updatedAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
      };

      if (this.isOnline) {
        // Online - update directly
        const recordRef = doc(db, "diesel", recordId);
        await updateDoc(recordRef, updateData);
        console.log(`✅ Diesel record ${recordId} updated with real-time sync`);
      } else {
        // Offline - store for later sync
        this.pendingChanges.set(`diesel:${recordId}`, updateData);
        console.log(`📝 Diesel record ${recordId} update queued for sync when online`);

        // Store in localStorage as backup
        this.storePendingChangesInLocalStorage();
      }

      this.setSyncStatus("success");
    } catch (error) {
      console.error(`Error updating diesel record ${recordId}:`, error);
      this.setSyncStatus("error");
      throw error;
    }
  }

  // Update a driver behavior event with real-time sync
  public async updateDriverBehaviorEvent(
    eventId: string,
    data: Partial<DriverBehaviorEvent>
  ): Promise<void> {
    try {
      this.setSyncStatus("syncing");

      // Clean data for Firestore
      const cleanData = cleanObjectForFirestore(data);

      // Add updatedAt timestamp
      const updateData = {
        ...cleanData,
        updatedAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
      };

      if (this.isOnline) {
        // Online - update directly
        const eventRef = doc(db, "driverBehaviorEvents", eventId);
        await updateDoc(eventRef, updateData);
        console.log(`✅ Driver behavior event ${eventId} updated with real-time sync`);
      } else {
        // Offline - store for later sync
        this.pendingChanges.set(`driverBehaviorEvents:${eventId}`, updateData);
        console.log(`📝 Driver behavior event ${eventId} update queued for sync when online`);

        // Store in localStorage as backup
        this.storePendingChangesInLocalStorage();
      }

      this.setSyncStatus("success");
    } catch (error) {
      console.error(`Error updating driver behavior event ${eventId}:`, error);
      this.setSyncStatus("error");
      throw error;
    }
  }

  // Link diesel record to trip
  public async linkDieselToTrip(dieselId: string, tripId: string): Promise<void> {
    try {
      this.setSyncStatus("syncing");

      // Get the diesel record
      const dieselRef = doc(db, "diesel", dieselId);
      const dieselSnap = await getDocs(
        query(collection(db, "diesel"), where("id", "==", dieselId))
      );

      if (dieselSnap.empty) {
        throw new Error(`Diesel record ${dieselId} not found`);
      }

      const firstDieselDoc = dieselSnap.docs[0];
      if (!firstDieselDoc) {
        throw new Error(`Diesel record ${dieselId} not found`);
      }

      const dieselData = firstDieselDoc.data() as DieselConsumptionRecord;

      // Get the trip
      const tripRef = doc(db, "trips", tripId);
      const tripSnap = await getDocs(query(collection(db, "trips"), where("id", "==", tripId)));

      if (tripSnap.empty) {
        throw new Error(`Trip ${tripId} not found`);
      }

      const firstTripDoc = tripSnap.docs[0];
      if (!firstTripDoc) {
        throw new Error(`Trip ${tripId} not found`);
      }

      const tripData = firstTripDoc.data() as Trip;

      // Update diesel record with trip ID
      await updateDoc(dieselRef, {
        tripId,
        updatedAt: serverTimestamp(),
      });

      // Create a cost entry in the trip
      const costEntry: Omit<CostEntry, "id"> = {
        tripId,
        category: "Diesel",
        subCategory: `${dieselData.fuelStation} - ${dieselData.fleetNumber}`,
        amount: dieselData.totalCost,
        currency: dieselData.currency || tripData.revenueCurrency,
        referenceNumber: `DIESEL-${dieselId}`,
        date: dieselData.date,
        notes: `Diesel: ${dieselData.litresFilled} liters at ${dieselData.fuelStation}`,
        attachments: [],
        isFlagged: false,
        isSystemGenerated: false,
      };

      // Add cost entry to trip
      const updatedCosts = [...(tripData.costs || []), { ...costEntry, id: `cost-${Date.now()}` }];

      await updateDoc(tripRef, {
        costs: updatedCosts,
        updatedAt: serverTimestamp(),
      });

      console.log(`✅ Diesel record ${dieselId} linked to trip ${tripId}`);
      this.setSyncStatus("success");
    } catch (error) {
      console.error(`Error linking diesel to trip:`, error);
      this.setSyncStatus("error");
      throw error;
    }
  }

  // Store pending changes in localStorage as backup
  private storePendingChangesInLocalStorage(): void {
    try {
      const pendingChangesObj = Object.fromEntries(this.pendingChanges);
      localStorage.setItem("pendingChanges", JSON.stringify(pendingChangesObj));
    } catch (error) {
      console.error("Error storing pending changes in localStorage:", error);
    }
  }

  // Subscribe to all missed loads (global listener)
  public subscribeToAllMissedLoads(): void {
    // Clear any existing global missed loads listeners
    if (this.globalUnsubscribes.has("allMissedLoads")) {
      this.globalUnsubscribes.get("allMissedLoads")?.();
    }

    // Check if user is authenticated before subscribing
    if (!this.isAuthenticated()) {
      console.warn("⚠️ Cannot subscribe to missed loads - user not authenticated");
      return;
    }

    const missedLoadsQuery = query(collection(db, "missedLoads"), orderBy("date", "desc"));

    const unsubscribe = onSnapshot(
      missedLoadsQuery,
      (snapshot) => {
        // Track changes for debugging
        let added = 0,
          modified = 0,
          removed = 0;

        // Process document changes
        snapshot.docChanges().forEach((change) => {
          const id = change.doc.id;

          if (change.type === "added") {
            added++;
            console.log(`Missed load added: ${id}`);
          } else if (change.type === "modified") {
            modified++;
            console.log(`Missed load modified: ${id}`);
          } else if (change.type === "removed") {
            removed++;
            console.log(`Missed load removed: ${id}`);
          }
        });

        if (added > 0 || modified > 0 || removed > 0) {
          console.log(
            `🔄 Missed loads changes: ${added} added, ${modified} modified, ${removed} removed`
          );

          // Get all current documents for a full refresh
          const missedLoads: MissedLoad[] = [];
          snapshot.forEach((doc) => {
            const data = convertTimestamps(doc.data());
            missedLoads.push({ id: doc.id, ...data } as MissedLoad);
          });

          if (typeof this.dataCallbacks.setMissedLoads === "function") {
            this.dataCallbacks.setMissedLoads(missedLoads);
          } else {
            console.warn("⚠️ setMissedLoads callback not registered");
          }
          this.lastSynced = new Date();
        }
      },
      (error) => {
        console.error("Error in global missed loads listener:", error);
      }
    );

    this.globalUnsubscribes.set("allMissedLoads", unsubscribe);
  }

  // Subscribe to all action items (global listener)
  public subscribeToAllActionItems(): void {
    // Clear any existing global action items listeners
    if (this.globalUnsubscribes.has("allActionItems")) {
      this.globalUnsubscribes.get("allActionItems")?.();
    }

    // Check if user is authenticated before subscribing
    if (!this.isAuthenticated()) {
      console.warn("⚠️ Cannot subscribe to action items - user not authenticated");
      return;
    }

    const actionItemsQuery = query(collection(db, "actionItems"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      actionItemsQuery,
      (snapshot) => {
        // Track changes for debugging
        let added = 0,
          modified = 0,
          removed = 0;

        // Process document changes
        snapshot.docChanges().forEach((change) => {
          const id = change.doc.id;

          if (change.type === "added") {
            added++;
            console.log(`Action item added: ${id}`);
          } else if (change.type === "modified") {
            modified++;
            console.log(`Action item modified: ${id}`);
          } else if (change.type === "removed") {
            removed++;
            console.log(`Action item removed: ${id}`);
          }
        });

        if (added > 0 || modified > 0 || removed > 0) {
          console.log(
            `🔄 Action items changes: ${added} added, ${modified} modified, ${removed} removed`
          );

          // Get all current documents for a full refresh
          const actionItems: ActionItem[] = [];
          snapshot.forEach((doc) => {
            const data = convertTimestamps(doc.data());
            actionItems.push({ id: doc.id, ...data } as ActionItem);
          });

          if (typeof this.dataCallbacks.setActionItems === "function") {
            this.dataCallbacks.setActionItems(actionItems);
          } else {
            console.warn("⚠️ setActionItems callback not registered");
          }
          this.lastSynced = new Date();
        }
      },
      (error) => {
        console.error("Error in global action items listener:", error);
      }
    );

    this.globalUnsubscribes.set("allActionItems", unsubscribe);
  }

  // Subscribe to all clients (global listener)
  public subscribeToAllClients(): void {
    // Clear any existing global clients listeners
    if (this.globalUnsubscribes.has("allClients")) {
      this.globalUnsubscribes.get("allClients")?.();
    }

    // Check if user is authenticated before subscribing
    if (!this.isAuthenticated()) {
      console.warn("⚠️ Cannot subscribe to clients - user not authenticated");
      return;
    }

    const clientsQuery = query(collection(db, "clients"), orderBy("name", "asc"));

    const unsubscribe = onSnapshot(
      clientsQuery,
      (snapshot) => {
        // Track changes for debugging
        let added = 0,
          modified = 0,
          removed = 0;

        // Process document changes
        snapshot.docChanges().forEach((change) => {
          const id = change.doc.id;

          if (change.type === "added") {
            added++;
            console.log(`Client added: ${id}`);
          } else if (change.type === "modified") {
            modified++;
            console.log(`Client modified: ${id}`);
          } else if (change.type === "removed") {
            removed++;
            console.log(`Client removed: ${id}`);
          }
        });

        if (added > 0 || modified > 0 || removed > 0) {
          console.log(
            `🔄 Clients changes: ${added} added, ${modified} modified, ${removed} removed`
          );

          // Get all current documents for a full refresh
          const clients: ClientOptions[] = [];
          snapshot.forEach((doc) => {
            const data = convertTimestamps(doc.data());
            clients.push({ id: doc.id, ...data } as ClientOptions);
          });

          if (typeof this.dataCallbacks.setClients === "function") {
            this.dataCallbacks.setClients(clients);
          } else {
            console.warn("⚠️ setClients callback not registered");
          }
          this.lastSynced = new Date();
        }
      },
      (error) => {
        console.error("Error in global clients listener:", error);
      }
    );

    this.globalUnsubscribes.set("allClients", unsubscribe);
  }

  // Subscribe to all CAR reports (global listener)
  public subscribeToAllCARReports(): void {
    // Clear any existing global CAR reports listeners
    if (this.globalUnsubscribes.has("allCARReports")) {
      this.globalUnsubscribes.get("allCARReports")?.();
    }

    // Check if user is authenticated before subscribing
    if (!this.isAuthenticated()) {
      console.warn("⚠️ Cannot subscribe to CAR reports - user not authenticated");
      return;
    }

    const carReportsQuery = query(collection(db, "carReports"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      carReportsQuery,
      (snapshot) => {
        // Track changes for debugging
        let added = 0,
          modified = 0,
          removed = 0;

        // Process document changes
        snapshot.docChanges().forEach((change) => {
          const id = change.doc.id;

          if (change.type === "added") {
            added++;
            console.log(`CAR report added: ${id}`);
          } else if (change.type === "modified") {
            modified++;
            console.log(`CAR report modified: ${id}`);
          } else if (change.type === "removed") {
            removed++;
            console.log(`CAR report removed: ${id}`);
          }
        });

        if (added > 0 || modified > 0 || removed > 0) {
          console.log(
            `🔄 CAR reports changes: ${added} added, ${modified} modified, ${removed} removed`
          );

          // Get all current documents for a full refresh
          const carReports: CARReport[] = [];
          snapshot.forEach((doc) => {
            const data = convertTimestamps(doc.data());
            carReports.push({ id: doc.id, ...data } as CARReport);
          });

          if (typeof this.dataCallbacks.setCarReports === "function") {
            this.dataCallbacks.setCarReports(carReports);
          } else {
            console.warn("⚠️ setCarReports callback not registered");
          }
          this.lastSynced = new Date();
        }
      },
      (error) => {
        console.error("Error in global CAR reports listener:", error);
      }
    );

    this.globalUnsubscribes.set("allCARReports", unsubscribe);
  }

  // Load pending changes from localStorage
  public loadPendingChangesFromLocalStorage(): void {
    try {
      const pendingChangesJson = localStorage.getItem("pendingChanges");
      if (pendingChangesJson) {
        const pendingChangesObj = JSON.parse(pendingChangesJson);
        this.pendingChanges = new Map(Object.entries(pendingChangesObj));
        console.log(`Loaded ${this.pendingChanges.size} pending changes from localStorage`);
      }
    } catch (error) {
      console.error("Error loading pending changes from localStorage:", error);
    }
  }

  // Subscribe to all enhanced job cards (global listener)
  public subscribeToAllEnhancedJobCards(): void {
    // Clear any existing global enhanced job cards listeners
    if (this.globalUnsubscribes.has("allEnhancedJobCards")) {
      this.globalUnsubscribes.get("allEnhancedJobCards")?.();
    }

    // Check if user is authenticated before subscribing
    if (!this.isAuthenticated()) {
      console.warn("⚠️ Cannot subscribe to enhanced job cards - user not authenticated");
      return;
    }

    const enhancedJobCardsQuery = query(
      enhancedJobCardsCollection,
      orderBy("workOrderInfo.date", "desc")
    );

    const unsubscribe = onSnapshot(
      enhancedJobCardsQuery,
      (snapshot) => {
        // Track changes for debugging
        let added = 0,
          modified = 0,
          removed = 0;

        // Process document changes
        snapshot.docChanges().forEach((change) => {
          const id = change.doc.id;

          if (change.type === "added") {
            added++;
            console.log(`Enhanced job card added: ${id}`);
          } else if (change.type === "modified") {
            modified++;
            console.log(`Enhanced job card modified: ${id}`);
          } else if (change.type === "removed") {
            removed++;
            console.log(`Enhanced job card removed: ${id}`);
          }
        });

        if (added > 0 || modified > 0 || removed > 0) {
          console.log(
            `🔄 Enhanced job cards changes: ${added} added, ${modified} modified, ${removed} removed`
          );

          // Get all current documents for a full refresh
          const enhancedJobCards: EnhancedJobCard[] = [];
          snapshot.forEach((doc) => {
            const data = convertTimestamps(doc.data());
            enhancedJobCards.push({ id: doc.id, ...data } as EnhancedJobCard);
          });

          if (typeof this.dataCallbacks.setEnhancedJobCards === "function") {
            this.dataCallbacks.setEnhancedJobCards(enhancedJobCards);
          } else {
            console.warn("⚠️ setEnhancedJobCards callback not registered");
          }
          this.lastSynced = new Date();
        }
      },
      (error) => {
        console.error("Error in global enhanced job cards listener:", error);
      }
    );

    this.globalUnsubscribes.set("allEnhancedJobCards", unsubscribe);
  }

  // Unsubscribe from enhanced job cards collection subscription
  public unsubscribeFromAllEnhancedJobCards(): void {
    // Unsubscribe from global enhanced job cards listener if it exists
    if (this.globalUnsubscribes.has("allEnhancedJobCards")) {
      this.globalUnsubscribes.get("allEnhancedJobCards")?.();
      this.globalUnsubscribes.delete("allEnhancedJobCards");
      console.log("🔄 Unsubscribed from enhanced job cards collection");
    }
  }

  // Add an enhanced job card
  public async addEnhancedJobCard(data: Omit<EnhancedJobCard, "id">): Promise<string> {
    try {
      this.setSyncStatus("syncing");

      // Clean data for Firestore
      const cleanData = cleanObjectForFirestore(data);

      // Add timestamps
      const jobCardData = {
        ...cleanData,
        createdAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
        updatedAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
      };

      let jobCardId: string;

      if (this.isOnline) {
        // Online - add directly to Firestore
        const docRef = await addDoc(enhancedJobCardsCollection, jobCardData);
        jobCardId = docRef.id;
        console.log(`✅ Enhanced job card added with ID: ${jobCardId}`);
      } else {
        // Offline - generate temporary ID and store for later sync
        jobCardId = `temp-enhanced-jobcard-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        this.pendingChanges.set(`enhancedJobCards:${jobCardId}`, jobCardData);
        console.log(`📝 Enhanced job card creation queued for sync when online`);

        // Store in localStorage as backup
        this.storePendingChangesInLocalStorage();
      }

      this.setSyncStatus("success");
      return jobCardId;
    } catch (error) {
      console.error(`Error adding enhanced job card:`, error);
      this.setSyncStatus("error");
      throw error;
    }
  }

  // Update an enhanced job card
  public async updateEnhancedJobCard(
    jobCardId: string,
    data: Partial<EnhancedJobCard>
  ): Promise<void> {
    try {
      this.setSyncStatus("syncing");

      // Clean data for Firestore
      const cleanData = cleanObjectForFirestore(data);

      // Add updatedAt timestamp
      const updateData = {
        ...cleanData,
        updatedAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
      };

      if (this.isOnline) {
        // Online - update directly
        const jobCardRef = doc(db, "enhancedJobCards", jobCardId);
        await updateDoc(jobCardRef, updateData);
        console.log(`✅ Enhanced job card ${jobCardId} updated with real-time sync`);
      } else {
        // Offline - store for later sync
        this.pendingChanges.set(`enhancedJobCards:${jobCardId}`, updateData);
        console.log(`📝 Enhanced job card ${jobCardId} update queued for sync when online`);

        // Store in localStorage as backup
        this.storePendingChangesInLocalStorage();
      }

      this.setSyncStatus("success");
    } catch (error) {
      console.error(`Error updating enhanced job card ${jobCardId}:`, error);
      this.setSyncStatus("error");
      throw error;
    }
  }

  // Delete an enhanced job card
  public async deleteEnhancedJobCard(jobCardId: string): Promise<void> {
    try {
      this.setSyncStatus("syncing");

      if (this.isOnline) {
        // Online - delete directly from Firestore
        const jobCardRef = doc(db, "enhancedJobCards", jobCardId);
        await updateDoc(jobCardRef, { deleted: true, updatedAt: serverTimestamp() });
        console.log(`✅ Enhanced job card ${jobCardId} marked as deleted`);
      } else {
        // Offline - store delete operation for later sync
        this.pendingChanges.set(`enhancedJobCards:${jobCardId}:delete`, { deleted: true });
        console.log(`📝 Enhanced job card deletion queued for sync when online`);

        // Store in localStorage as backup
        this.storePendingChangesInLocalStorage();
      }

      this.setSyncStatus("success");
    } catch (error) {
      console.error(`Error deleting enhanced job card ${jobCardId}:`, error);
      this.setSyncStatus("error");
      throw error;
    }
  }

  // Cleanup method to unsubscribe from all listeners
  public cleanup(): void {
    console.log("🧹 Cleaning up all SyncService listeners");
    // Unsubscribe from all individual trip listeners
    for (const unsubscribe of this.tripUnsubscribes.values()) {
      unsubscribe();
    }
    this.tripUnsubscribes.clear();

    // Unsubscribe from all individual diesel listeners
    for (const unsubscribe of this.dieselUnsubscribes.values()) {
      unsubscribe();
    }
    this.dieselUnsubscribes.clear();

    // Unsubscribe from all individual driver behavior listeners
    for (const unsubscribe of this.driverBehaviorUnsubscribes.values()) {
      unsubscribe();
    }
    this.driverBehaviorUnsubscribes.clear();

    // Unsubscribe from all individual audit log listeners
    for (const unsubscribe of this.auditLogUnsubscribes.values()) {
      unsubscribe();
    }
    this.auditLogUnsubscribes.clear();

    // Unsubscribe from all individual job card listeners
    for (const unsubscribe of this.jobCardUnsubscribes.values()) {
      unsubscribe();
    }
    this.jobCardUnsubscribes.clear();

    // Unsubscribe from all individual enhanced job card listeners
    for (const unsubscribe of this.enhancedJobCardUnsubscribes.values()) {
      unsubscribe();
    }
    this.enhancedJobCardUnsubscribes.clear();

    // Unsubscribe from all individual tyre listeners
    for (const unsubscribe of this.tyreUnsubscribes.values()) {
      unsubscribe();
    }
    this.tyreUnsubscribes.clear();

    // Unsubscribe from all global listeners
    for (const unsubscribe of this.globalUnsubscribes.values()) {
      unsubscribe();
    }
    this.globalUnsubscribes.clear();

    // Remove event listeners
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
  }

  // Get connection status
  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  // Check if the user is authenticated
  private isAuthenticated(): boolean {
    // This is a simplified check that could be expanded based on your auth implementation
    // For demo purposes, we'll just check if we're in development mode
    if (import.meta.env.DEV) {
      // In development mode, always return true to allow subscriptions
      return true;
    }

    // In production, we should check for actual authentication
    // This is where you'd add your Firebase Auth check
    try {
      // Example (assuming there's a global auth object or function):
      // return firebase.auth().currentUser != null;

      // For now, we'll just return true as a fallback
      return true;

      // In a real implementation, you'd want to check if the user is signed in:
      // const user = getAuth().currentUser;
      // return !!user;
    } catch (error) {
      console.error("Error checking authentication status:", error);
      return false;
    }
  }

  // Subscribe to all workshop inventory items (global listener)
  public subscribeToAllWorkshopInventory(): void {
    // Clear any existing global workshop inventory listeners
    if (this.globalUnsubscribes.has("allWorkshopInventory")) {
      this.globalUnsubscribes.get("allWorkshopInventory")?.();
    }

    // Check if user is authenticated before subscribing
    if (!this.isAuthenticated()) {
      console.warn("⚠️ Cannot subscribe to workshop inventory - user not authenticated");
      return;
    }

    const inventoryQuery = query(workshopInventoryCollection, orderBy("purchaseDate", "desc"));

    const unsubscribe = onSnapshot(
      inventoryQuery,
      (snapshot) => {
        // Track changes for debugging
        let added = 0,
          modified = 0,
          removed = 0;

        // Process document changes
        snapshot.docChanges().forEach((change) => {
          const id = change.doc.id;

          if (change.type === "added") {
            added++;
            console.log(`Workshop inventory item added: ${id}`);
          } else if (change.type === "modified") {
            modified++;
            console.log(`Workshop inventory item modified: ${id}`);
          } else if (change.type === "removed") {
            removed++;
            console.log(`Workshop inventory item removed: ${id}`);
          }
        });

        if (added > 0 || modified > 0 || removed > 0) {
          console.log(
            `🔄 Workshop inventory changes: ${added} added, ${modified} modified, ${removed} removed`
          );

          // Get all current documents for a full refresh
          const inventory: TyreInventoryItem[] = [];
          snapshot.forEach((doc) => {
            const data = convertTimestamps(doc.data());
            inventory.push({ id: doc.id, ...data } as TyreInventoryItem);
          });

          if (typeof this.dataCallbacks.setWorkshopInventory === "function") {
            this.dataCallbacks.setWorkshopInventory(inventory);
          } else {
            console.warn("⚠️ setWorkshopInventory callback not registered");
          }
          this.lastSynced = new Date();
        }
      },
      (error) => {
        console.error("Error in global workshop inventory listener:", error);
      }
    );

    this.globalUnsubscribes.set("allWorkshopInventory", unsubscribe);
  }

  // Add a workshop inventory item
  public async addWorkshopInventoryItem(data: Omit<TyreInventoryItem, "id">): Promise<string> {
    try {
      this.setSyncStatus("syncing");

      // Clean data for Firestore
      const cleanData = cleanObjectForFirestore(data);

      // Add timestamps
      const itemData = {
        ...cleanData,
        createdAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
        updatedAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
      };

      let itemId: string;

      if (this.isOnline) {
        // Online - add directly to Firestore
        const docRef = await addDoc(workshopInventoryCollection, itemData);
        itemId = docRef.id;
        console.log(`✅ Workshop inventory item added with ID: ${itemId}`);
      } else {
        // Offline - generate temporary ID and store for later sync
        itemId = `temp-inventory-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        this.pendingChanges.set(`workshopInventory:${itemId}`, itemData);
        console.log(`📝 Workshop inventory item creation queued for sync when online`);

        // Store in localStorage as backup
        this.storePendingChangesInLocalStorage();
      }

      this.setSyncStatus("success");
      return itemId;
    } catch (error) {
      console.error(`Error adding workshop inventory item:`, error);
      this.setSyncStatus("error");
      throw error;
    }
  }

  // Update a workshop inventory item with real-time sync
  public async updateWorkshopInventoryItem(
    itemId: string,
    data: Partial<TyreInventoryItem>
  ): Promise<void> {
    try {
      this.setSyncStatus("syncing");

      // Clean data for Firestore
      const cleanData = cleanObjectForFirestore(data);

      // Add updatedAt timestamp
      const updateData = {
        ...cleanData,
        updatedAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
      };

      if (this.isOnline) {
        // Online - update directly
        const inventoryRef = doc(db, "workshopInventory", itemId);
        await updateDoc(inventoryRef, updateData);
        console.log(`✅ Workshop inventory item ${itemId} updated with real-time sync`);
      } else {
        // Offline - store for later sync
        this.pendingChanges.set(`workshopInventory:${itemId}`, updateData);
        console.log(`📝 Workshop inventory item ${itemId} update queued for sync when online`);

        // Store in localStorage as backup
        this.storePendingChangesInLocalStorage();
      }

      this.setSyncStatus("success");
    } catch (error) {
      console.error(`Error updating workshop inventory item ${itemId}:`, error);
      this.setSyncStatus("error");
      throw error;
    }
  }

  // Delete a workshop inventory item
  public async deleteWorkshopInventoryItem(itemId: string): Promise<void> {
    try {
      this.setSyncStatus("syncing");

      if (this.isOnline) {
        // Online - delete directly from Firestore
        const itemRef = doc(db, "workshopInventory", itemId);
        await updateDoc(itemRef, { deleted: true, updatedAt: serverTimestamp() });
        console.log(`✅ Workshop inventory item ${itemId} marked as deleted`);
      } else {
        // Offline - store delete operation for later sync
        this.pendingChanges.set(`workshopInventory:${itemId}:delete`, { deleted: true });
        console.log(`📝 Workshop inventory item deletion queued for sync when online`);

        // Store in localStorage as backup
        this.storePendingChangesInLocalStorage();
      }

      this.setSyncStatus("success");
    } catch (error) {
      console.error(`Error deleting workshop inventory item ${itemId}:`, error);
      this.setSyncStatus("error");
      throw error;
    }
  }

  // Subscribe to all job cards (global listener)
  public subscribeToAllJobCards(): void {
    // Clear any existing global job cards listeners
    if (this.globalUnsubscribes.has("allJobCards")) {
      this.globalUnsubscribes.get("allJobCards")?.();
    }

    // Check if user is authenticated before subscribing
    if (!this.isAuthenticated()) {
      console.warn("⚠️ Cannot subscribe to job cards - user not authenticated");
      return;
    }

    const jobCardsQuery = query(jobCardsCollection, orderBy("createdDate", "desc"));

    const unsubscribe = onSnapshot(
      jobCardsQuery,
      (snapshot) => {
        // Track changes for debugging
        let added = 0,
          modified = 0,
          removed = 0;

        // Process document changes
        snapshot.docChanges().forEach((change) => {
          const id = change.doc.id;

          if (change.type === "added") {
            added++;
            console.log(`Job card added: ${id}`);
          } else if (change.type === "modified") {
            modified++;
            console.log(`Job card modified: ${id}`);
          } else if (change.type === "removed") {
            removed++;
            console.log(`Job card removed: ${id}`);
          }
        });

        if (added > 0 || modified > 0 || removed > 0) {
          console.log(
            `🔄 Job cards changes: ${added} added, ${modified} modified, ${removed} removed`
          );

          // Get all current documents for a full refresh
          const jobCards: JobCard[] = [];
          snapshot.forEach((doc) => {
            const data = convertTimestamps(doc.data());
            jobCards.push({ id: doc.id, ...data } as JobCard);
          });

          if (typeof this.dataCallbacks.setJobCards === "function") {
            this.dataCallbacks.setJobCards(jobCards);
          } else {
            console.warn("⚠️ setJobCards callback not registered");
          }
          this.lastSynced = new Date();
        }
      },
      (error) => {
        console.error("Error in global job cards listener:", error);
      }
    );

    this.globalUnsubscribes.set("allJobCards", unsubscribe);
  }

  // Add a job card
  public async addJobCard(data: Omit<JobCard, "id">): Promise<string> {
    try {
      this.setSyncStatus("syncing");

      // Clean data for Firestore
      const cleanData = cleanObjectForFirestore(data);

      // Add timestamps
      const jobCardData = {
        ...cleanData,
        createdAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
        updatedAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
      };

      let jobCardId: string;

      if (this.isOnline) {
        // Online - add directly to Firestore
        const docRef = await addDoc(jobCardsCollection, jobCardData);
        jobCardId = docRef.id;
        console.log(`✅ Job card added with ID: ${jobCardId}`);
      } else {
        // Offline - generate temporary ID and store for later sync
        jobCardId = `temp-jobcard-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        this.pendingChanges.set(`jobCards:${jobCardId}`, jobCardData);
        console.log(`📝 Job card creation queued for sync when online`);

        // Store in localStorage as backup
        this.storePendingChangesInLocalStorage();
      }

      this.setSyncStatus("success");
      return jobCardId;
    } catch (error) {
      console.error(`Error adding job card:`, error);
      this.setSyncStatus("error");
      throw error;
    }
  }

  // Update a job card
  public async updateJobCard(jobCardId: string, data: Partial<JobCard>): Promise<void> {
    try {
      this.setSyncStatus("syncing");

      // Clean data for Firestore
      const cleanData = cleanObjectForFirestore(data);

      // Add updatedAt timestamp
      const updateData = {
        ...cleanData,
        updatedAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
      };

      if (this.isOnline) {
        // Online - update directly
        const jobCardRef = doc(db, "jobCards", jobCardId);
        await updateDoc(jobCardRef, updateData);
        console.log(`✅ Job card ${jobCardId} updated with real-time sync`);
      } else {
        // Offline - store for later sync
        this.pendingChanges.set(`jobCards:${jobCardId}`, updateData);
        console.log(`📝 Job card ${jobCardId} update queued for sync when online`);

        // Store in localStorage as backup
        this.storePendingChangesInLocalStorage();
      }

      this.setSyncStatus("success");
    } catch (error) {
      console.error(`Error updating job card ${jobCardId}:`, error);
      this.setSyncStatus("error");
      throw error;
    }
  }

  // Delete a job card
  public async deleteJobCard(jobCardId: string): Promise<void> {
    try {
      this.setSyncStatus("syncing");

      if (this.isOnline) {
        // Online - delete directly from Firestore
        const jobCardRef = doc(db, "jobCards", jobCardId);
        await updateDoc(jobCardRef, { deleted: true, updatedAt: serverTimestamp() });
        console.log(`✅ Job card ${jobCardId} marked as deleted`);
      } else {
        // Offline - store delete operation for later sync
        this.pendingChanges.set(`jobCards:${jobCardId}:delete`, { deleted: true });
        console.log(`📝 Job card deletion queued for sync when online`);

        // Store in localStorage as backup
        this.storePendingChangesInLocalStorage();
      }

      this.setSyncStatus("success");
    } catch (error) {
      console.error(`Error deleting job card ${jobCardId}:`, error);
      this.setSyncStatus("error");
      throw error;
    }
  }

  // Subscribe to all tyres (global listener)
  public subscribeToAllTyres(): void {
    // Clear any existing global tyres listeners
    if (this.globalUnsubscribes.has("allTyres")) {
      this.globalUnsubscribes.get("allTyres")?.();
    }

    // Check if user is authenticated before subscribing
    if (!this.isAuthenticated()) {
      console.warn("⚠️ Cannot subscribe to tyres - user not authenticated");
      return;
    }

    const tyresQuery = query(tyresCollection, orderBy("installDetails.date", "desc"));

    const unsubscribe = onSnapshot(
      tyresQuery,
      (snapshot) => {
        // Track changes for debugging
        let added = 0,
          modified = 0,
          removed = 0;

        // Process document changes
        snapshot.docChanges().forEach((change) => {
          const id = change.doc.id;

          if (change.type === "added") {
            added++;
            console.log(`Tyre added: ${id}`);
          } else if (change.type === "modified") {
            modified++;
            console.log(`Tyre modified: ${id}`);
          } else if (change.type === "removed") {
            removed++;
            console.log(`Tyre removed: ${id}`);
          }
        });

        if (added > 0 || modified > 0 || removed > 0) {
          console.log(`🔄 Tyres changes: ${added} added, ${modified} modified, ${removed} removed`);

          // Get all current documents for a full refresh
          const tyres: Tyre[] = [];
          snapshot.forEach((doc) => {
            const data = convertTimestamps(doc.data());
            tyres.push({ id: doc.id, ...data } as Tyre);
          });

          if (typeof this.dataCallbacks.setTyres === "function") {
            this.dataCallbacks.setTyres(tyres);
          } else {
            console.warn("⚠️ setTyres callback not registered");
          }
          this.lastSynced = new Date();
        }
      },
      (error) => {
        console.error("Error in global tyres listener:", error);
      }
    );

    this.globalUnsubscribes.set("allTyres", unsubscribe);
  }

  // Add a tyre
  public async addTyre(data: Omit<Tyre, "id">): Promise<string> {
    try {
      this.setSyncStatus("syncing");

      // Clean data for Firestore
      const cleanData = cleanObjectForFirestore(data);

      // Add timestamps
      const tyreData = {
        ...cleanData,
        createdAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
        updatedAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
      };

      let tyreId: string;

      if (this.isOnline) {
        // Online - add directly to Firestore
        const docRef = await addDoc(tyresCollection, tyreData);
        tyreId = docRef.id;
        console.log(`✅ Tyre added with ID: ${tyreId}`);
      } else {
        // Offline - generate temporary ID and store for later sync
        tyreId = `temp-tyre-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        this.pendingChanges.set(`tyres:${tyreId}`, tyreData);
        console.log(`📝 Tyre creation queued for sync when online`);

        // Store in localStorage as backup
        this.storePendingChangesInLocalStorage();
      }

      this.setSyncStatus("success");
      return tyreId;
    } catch (error) {
      console.error(`Error adding tyre:`, error);
      this.setSyncStatus("error");
      throw error;
    }
  }

  // Update a tyre
  public async updateTyre(tyreId: string, data: Partial<Tyre>): Promise<void> {
    try {
      this.setSyncStatus("syncing");

      // Clean data for Firestore
      const cleanData = cleanObjectForFirestore(data);

      // Add updatedAt timestamp
      const updateData = {
        ...cleanData,
        updatedAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
      };

      if (this.isOnline) {
        // Online - update directly
        const tyreRef = doc(db, "tyres", tyreId);
        await updateDoc(tyreRef, updateData);
        console.log(`✅ Tyre ${tyreId} updated with real-time sync`);
      } else {
        // Offline - store for later sync
        this.pendingChanges.set(`tyres:${tyreId}`, updateData);
        console.log(`📝 Tyre ${tyreId} update queued for sync when online`);

        // Store in localStorage as backup
        this.storePendingChangesInLocalStorage();
      }

      this.setSyncStatus("success");
    } catch (error) {
      console.error(`Error updating tyre ${tyreId}:`, error);
      this.setSyncStatus("error");
      throw error;
    }
  }

  // Delete a tyre
  public async deleteTyre(tyreId: string): Promise<void> {
    try {
      this.setSyncStatus("syncing");

      if (this.isOnline) {
        // Online - delete directly from Firestore
        const tyreRef = doc(db, "tyres", tyreId);
        await updateDoc(tyreRef, { deleted: true, updatedAt: serverTimestamp() });
        console.log(`✅ Tyre ${tyreId} marked as deleted`);
      } else {
        // Offline - store delete operation for later sync
        this.pendingChanges.set(`tyres:${tyreId}:delete`, { deleted: true });
        console.log(`📝 Tyre deletion queued for sync when online`);

        // Store in localStorage as backup
        this.storePendingChangesInLocalStorage();
      }

      this.setSyncStatus("success");
    } catch (error) {
      console.error(`Error deleting tyre ${tyreId}:`, error);
      this.setSyncStatus("error");
      throw error;
    }
  }

  // Add a tyre inspection
  public async addTyreInspection(tyreId: string, inspectionData: any): Promise<string> {
    try {
      this.setSyncStatus("syncing");

      // Clean data for Firestore
      const cleanData = cleanObjectForFirestore(inspectionData);

      // Add timestamps
      const data = {
        ...cleanData,
        tyreId,
        timestamp: this.isOnline ? serverTimestamp() : new Date().toISOString(),
        createdAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
      };

      // Get the tyre to update its inspection history
      const tyreRef = doc(db, "tyres", tyreId);
      const tyreSnap = await getDocs(query(collection(db, "tyres"), where("id", "==", tyreId)));

      if (tyreSnap.empty) {
        throw new Error(`Tyre ${tyreId} not found`);
      }

      const firstTyreDoc = tyreSnap.docs[0];
      if (!firstTyreDoc) {
        throw new Error(`Tyre ${tyreId} not found`);
      }

      const tyreData = firstTyreDoc.data() as Tyre;

      // Create a new inspection ID
      const inspectionId = `insp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Add the inspection to the tyre's inspection history
      const inspectionHistory = tyreData.inspectionHistory || [];
      inspectionHistory.push({
        ...data,
        id: inspectionId,
      });

      // Update the tyre with the new inspection history and current tread depth/pressure
      await updateDoc(tyreRef, {
        inspectionHistory,
        treadDepth: data.treadDepth,
        pressure: data.pressure,
        status: data.status,
        lastInspection: this.isOnline ? serverTimestamp() : new Date().toISOString(),
        updatedAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
      });

      console.log(`✅ Tyre inspection added with ID: ${inspectionId}`);
      this.setSyncStatus("success");
      return inspectionId;
    } catch (error) {
      console.error(`Error adding tyre inspection:`, error);
      this.setSyncStatus("error");
      throw error;
    }
  }

  // Add inventory item (alias for addWorkshopInventoryItem for consistency)
  public async addInventoryItem(data: Omit<TyreInventoryItem, "id">): Promise<string> {
    return this.addWorkshopInventoryItem(data);
  }

  // Update inventory item (alias for updateWorkshopInventoryItem for consistency)
  public async updateInventoryItem(
    itemId: string,
    data: Partial<TyreInventoryItem>
  ): Promise<void> {
    return this.updateWorkshopInventoryItem(itemId, data);
  }

  // Add a reorder request for inventory items
  public async addReorderRequest(requestData: any): Promise<string> {
    try {
      this.setSyncStatus("syncing");

      // Clean data for Firestore
      const cleanData = cleanObjectForFirestore(requestData);

      // Add timestamps
      const data = {
        ...cleanData,
        createdAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
        updatedAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
        status: requestData.status || "pending",
      };

      let requestId: string;

      if (this.isOnline) {
        // Online - add directly to Firestore
        const docRef = await addDoc(collection(db, "reorderRequests"), data);
        requestId = docRef.id;
        console.log(`✅ Reorder request added with ID: ${requestId}`);
      } else {
        // Offline - generate temporary ID and store for later sync
        requestId = `temp-reorder-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        this.pendingChanges.set(`reorderRequests:${requestId}`, data);
        console.log(`📝 Reorder request creation queued for sync when online`);

        // Store in localStorage as backup
        this.storePendingChangesInLocalStorage();
      }

      this.setSyncStatus("success");
      return requestId;
    } catch (error) {
      console.error(`Error adding reorder request:`, error);
      this.setSyncStatus("error");
      throw error;
    }
  }

  // Get tyres - helper method to provide current tyres via callback
  public getTyres(callback: (tyres: Tyre[]) => void): void {
    const tyresQuery = query(tyresCollection, orderBy("installDetails.date", "desc"));

    getDocs(tyresQuery)
      .then((snapshot) => {
        const tyres: Tyre[] = [];
        snapshot.forEach((doc) => {
          const data = convertTimestamps(doc.data());
          tyres.push({ id: doc.id, ...data } as Tyre);
        });
        callback(tyres);
      })
      .catch((error) => {
        console.error("Error getting tyres:", error);
        callback([]);
      });
  }
}

// The cleanObjectForFirestore and convertTimestamps functions have been moved
// to a shared utility file at ./firestoreUtils.ts
// They are now imported at the top of this file.

// Create and export a singleton instance
export const syncService = new SyncService();

// Initialize by loading any pending changes
syncService.loadPendingChangesFromLocalStorage();

export default syncService;
