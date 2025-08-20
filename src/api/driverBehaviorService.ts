import {
  collection,
  collectionGroup,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase";
import { cleanObjectForFirestore, convertTimestamps } from "../utils/firestoreUtils";

/* =========================
   Types
   ========================= */
export interface DriverBehaviorEvent {
  id: string;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
  driverName: string;
  eventDate: string; // "YYYY/MM/DD"
  eventTime: string; // "HH:MM"
  eventType: string;
  description: string;
  fleetNumber: string;
  importSource: string;
  location: string;
  points: number;
  severity: string;
  status: string;
  uniqueKey: string;
  eventCategory?: string; // derived from path (e.g. "21H_Fatigue Alert_2025")
  month?: string; // derived from path "01".."12"
}

export interface DriverBehaviorCallbacks {
  setDriverBehaviorEvents?: (events: DriverBehaviorEvent[]) => void;
  onDriverBehaviorUpdate?: (event: DriverBehaviorEvent) => void;
}

type SyncStatus = "idle" | "syncing" | "success" | "error";

/* =========================
   Service
   ========================= */
export class DriverBehaviorService {
  private driverBehaviorUnsubscribes: Map<string, Unsubscribe> = new Map();
  private globalUnsubscribes: Map<string, Unsubscribe> = new Map();
  private pendingChanges: Map<string, any> = new Map();
  private callbacks: DriverBehaviorCallbacks = {};
  private isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  private lastSynced: Date | null = null;
  private syncStatus: SyncStatus = "idle";

  constructor() {
    // online/offline listeners
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.syncPendingChanges().catch((e) =>
        console.error("DriverBehavior syncPendingChanges failed:", e)
      );
    });
    window.addEventListener("offline", () => {
      this.isOnline = false;
    });

    this.loadPendingChangesFromLocalStorage();
  }

  /* ---------- status ---------- */
  private setSyncStatus(status: SyncStatus) {
    this.syncStatus = status;
  }

  // Expose read-only status for consumers (and ensure fields are read)
  public getLastSynced(): Date | null {
    return this.lastSynced;
  }

  public getSyncStatus(): SyncStatus {
    return this.syncStatus;
  }

  /* ---------- auth gate (replace with your auth check) ---------- */
  private isAuthenticated(): boolean {
    try {
      return true;
    } catch (e) {
      console.error("Auth check failed:", e);
      return false;
    }
  }

  /* ---------- persistence of pending changes ---------- */
  private storePendingChangesInLocalStorage(): void {
    try {
      const obj = Object.fromEntries(this.pendingChanges.entries());
      localStorage.setItem("driverBehavior_pendingChanges", JSON.stringify(obj));
    } catch (e) {
      console.error("Error storing driverBehavior pending changes:", e);
    }
  }

  private loadPendingChangesFromLocalStorage(): void {
    try {
      const raw = localStorage.getItem("driverBehavior_pendingChanges");
      if (!raw) return;
      const obj = JSON.parse(raw);
      this.pendingChanges = new Map(Object.entries(obj));
      console.log(
        `📥 Loaded ${this.pendingChanges.size} pending driver behavior changes from localStorage`
      );
    } catch (e) {
      console.error("Error loading driverBehavior pending changes:", e);
    }
  }

  /* ---------- sync queue when back online ---------- */
  private async syncPendingChanges(): Promise<void> {
    if (!this.isOnline || this.pendingChanges.size === 0) return;

    console.log(`🔄 Syncing ${this.pendingChanges.size} pending driver behavior changes`);
    this.setSyncStatus("syncing");

    const completedKeys: string[] = [];

    for (const [key, value] of this.pendingChanges.entries()) {
      if (!key.startsWith("driverBehaviorEvents:")) continue;

      const eventId = key.split(":")[1];
      const { docPath, ...data } = value || {};

      if (!docPath) {
        console.warn(`Missing docPath for driver behavior event ${eventId}`);
        continue;
      }

      try {
        const ref = doc(db, docPath);
        await setDoc(
          ref,
          {
            ...data,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        console.log(`✅ Synced driver behavior event ${eventId}`);
        completedKeys.push(key);
      } catch (e) {
        console.error(`Error syncing driver behavior event ${eventId}:`, e);
      }
    }

    // remove successful items and persist the remainder
    completedKeys.forEach((k) => this.pendingChanges.delete(k));
    this.storePendingChangesInLocalStorage();

    this.lastSynced = new Date();
    this.setSyncStatus("success");
  }

  /* ---------- callbacks ---------- */
  public registerCallbacks(callbacks: DriverBehaviorCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /* ---------- targeted subscription by driver ---------- */
  public subscribeToDriverBehavior(driverName: string): void {
    // tear down previous
    this.driverBehaviorUnsubscribes.get(driverName)?.();

    // collectionGroup across month subcollections "01".."12"
    const monthQueries = Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, "0");
      return query(
        collectionGroup(db, month),
        where("driverName", "==", driverName),
        where("importSource", "==", "web_book"),
        orderBy("createdAt", "desc")
      );
    });

    const unsubs: Unsubscribe[] = [];

    monthQueries.forEach((qry) => {
      const unsub = onSnapshot(
        qry,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const eventData = change.doc.data();
            const docPath = change.doc.ref.path;

            // derive meta from path: driverBehaviorEvents/<category>/<month>/<docId>
            const parts = docPath.split("/");
            const eventCategory = parts[1] ?? "";
            const month = parts[2] ?? "";

            const event = convertTimestamps(eventData) as DriverBehaviorEvent;

            if (change.type === "added" || change.type === "modified") {
              this.callbacks.onDriverBehaviorUpdate?.({
                ...event,
                id: change.doc.id,
                eventCategory,
                month,
              });
            }
          });
        },
        (error) => {
          console.error(`Error subscribing to driver behavior for ${driverName}:`, error);
        }
      );
      unsubs.push(unsub);
    });

    // store composite unsubscribe
    this.driverBehaviorUnsubscribes.set(driverName, () => unsubs.forEach((u) => u()));
  }

  /* ---------- global subscription (explicit paths) ---------- */
  public subscribeToAllDriverBehaviorEvents(): void {
    // tear down previous
    this.globalUnsubscribes.get("allDriverBehavior")?.();

    if (!this.isAuthenticated()) {
      console.warn("⚠️ Cannot subscribe to driver behavior events - user not authenticated");
      return;
    }

    const eventTypes = [
      "Fatigue Alert",
      "Distracted",
      "Speeding",
      "Phone Usage While Driving",
      "Seatbelt Violation",
      "Accident",
      "Unspecified Passenger",
    ];
    const fleets = ["21H", "24H"];
    const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

    const allEvents: DriverBehaviorEvent[] = [];
    const unsubs: Unsubscribe[] = [];

    fleets.forEach((fleet) => {
      eventTypes.forEach((eventType) => {
        months.forEach((month) => {
          const path = `driverBehaviorEvents/${fleet}_${eventType}_2025/${month}`;
          try {
            const qry = query(
              collection(db, path),
              where("importSource", "==", "web_book"),
              orderBy("createdAt", "desc")
            );

            const unsub = onSnapshot(
              qry,
              (snapshot) => {
                let added = 0,
                  modified = 0,
                  removed = 0;

                // drop any existing events from this path/month
                const filtered = allEvents.filter(
                  (e) =>
                    !(e.fleetNumber === fleet && e.eventType === eventType && e.month === month)
                );

                snapshot.docChanges().forEach((change) => {
                  const id = change.doc.id;
                  const data = convertTimestamps(change.doc.data());

                  if (change.type === "added") {
                    added++;
                    filtered.push({
                      id,
                      ...data,
                      eventCategory: `${fleet}_${eventType}_2025`,
                      month,
                    } as DriverBehaviorEvent);
                  } else if (change.type === "modified") {
                    modified++;
                    filtered.push({
                      id,
                      ...data,
                      eventCategory: `${fleet}_${eventType}_2025`,
                      month,
                    } as DriverBehaviorEvent);
                  } else if (change.type === "removed") {
                    removed++;
                    // already filtered out above
                  }
                });

                if (added || modified || removed) {
                  console.log(
                    `🔄 Driver behavior changes in ${path}: ${added} added, ${modified} modified, ${removed} removed`
                  );
                  allEvents.length = 0;
                  allEvents.push(...filtered);
                  this.callbacks.setDriverBehaviorEvents?.([...allEvents]);
                  this.lastSynced = new Date();
                }
              },
              (error) => {
                console.error(`Error in driver behavior listener for ${path}:`, error);
              }
            );

            unsubs.push(unsub);
          } catch (e) {
            console.error(`Error setting up listener for ${path}:`, e);
          }
        });
      });
    });

    this.globalUnsubscribes.set("allDriverBehavior", () => unsubs.forEach((u) => u()));
  }

  /* ---------- simpler global subscription via collectionGroup ---------- */
  public subscribeToAllDriverBehaviorEventsSimple(): void {
    this.globalUnsubscribes.get("allDriverBehavior")?.();

    if (!this.isAuthenticated()) {
      console.warn("⚠️ Cannot subscribe to driver behavior events - user not authenticated");
      return;
    }

    const monthQueries = Array.from({ length: 12 }, (_, i) => {
      const m = String(i + 1).padStart(2, "0");
      return [
        m,
        query(
          collectionGroup(db, m),
          where("importSource", "==", "web_book"),
          orderBy("createdAt", "desc")
        ),
      ] as const;
    });

    const allEvents: DriverBehaviorEvent[] = [];
    const unsubs: Unsubscribe[] = [];

    monthQueries.forEach(([month, qry]) => {
      const unsub = onSnapshot(
        qry,
        (snapshot) => {
          const filtered = allEvents.filter((e) => e.month !== month);

          snapshot.forEach((docSnap) => {
            const data = convertTimestamps(docSnap.data());
            const docPath = docSnap.ref.path;
            const parts = docPath.split("/");
            const eventCategory = parts[1] ?? "";

            filtered.push({
              id: docSnap.id,
              month,
              eventCategory,
              ...data,
            } as DriverBehaviorEvent);
          });

          allEvents.length = 0;
          allEvents.push(...filtered);
          this.callbacks.setDriverBehaviorEvents?.([...allEvents]);
          this.lastSynced = new Date();
        },
        (error) => {
          console.error(`Error in driver behavior month ${month} listener:`, error);
        }
      );

      unsubs.push(unsub);
    });

    this.globalUnsubscribes.set("allDriverBehavior", () => unsubs.forEach((u) => u()));
  }

  /* ---------- mutations (online-first with offline queue) ---------- */
  public async updateDriverBehaviorEvent(
    eventId: string,
    data: Partial<DriverBehaviorEvent>,
    eventPath?: string
  ): Promise<void> {
    try {
      this.setSyncStatus("syncing");

      const cleanData = cleanObjectForFirestore(data);
      const updateData = {
        ...cleanData,
        updatedAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
      };

      if (this.isOnline) {
        // determine path
        let docPath = eventPath;
        if (!docPath && data.fleetNumber && data.eventType && data.eventDate) {
          const month = data.eventDate.split("/")[1]; // "2025/06/20" -> "06"
          docPath = `driverBehaviorEvents/${data.fleetNumber}_${data.eventType}_2025/${month}/${eventId}`;
        }
        if (!docPath) throw new Error("Cannot determine document path for driver behavior update");

        await updateDoc(doc(db, docPath), updateData);
        console.log(`✅ Driver behavior event updated at ${docPath}`);
      } else {
        // queue with docPath (consistent with syncPendingChanges)
        this.pendingChanges.set(`driverBehaviorEvents:${eventId}`, {
          ...updateData,
          docPath: eventPath ?? null,
        });
        this.storePendingChangesInLocalStorage();
        console.log(`📝 Driver behavior event ${eventId} queued for sync`);
      }

      this.setSyncStatus("success");
    } catch (e) {
      console.error(`Error updating driver behavior event ${eventId}:`, e);
      this.setSyncStatus("error");
      throw e;
    }
  }

  public async addDriverBehaviorEvent(eventData: Omit<DriverBehaviorEvent, "id">): Promise<string> {
    try {
      this.setSyncStatus("syncing");

      const cleanData = cleanObjectForFirestore(eventData);
      const eventTypeYear = `${eventData.fleetNumber}_${eventData.eventType}_2025`;
      const [, month, day] = eventData.eventDate.split("/"); // ["2025","06","20"]
      const time = eventData.eventTime.replace(":", ""); // "17:23" -> "1723"
      const documentId = `${day}_${time}`;
      const docPath = `driverBehaviorEvents/${eventTypeYear}/${month}/${documentId}`;

      const finalData = {
        ...cleanData,
        createdAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
        updatedAt: this.isOnline ? serverTimestamp() : new Date().toISOString(),
        uniqueKey: `${eventData.fleetNumber}_${eventData.eventType}_${eventData.eventDate}_${eventData.eventTime}`,
      };

      if (this.isOnline) {
        await setDoc(doc(db, docPath), finalData);
        console.log(`✅ Driver behavior event added at ${docPath}`);
      } else {
        this.pendingChanges.set(`driverBehaviorEvents:${documentId}`, {
          ...finalData,
          docPath,
        });
        this.storePendingChangesInLocalStorage();
        console.log("📝 Driver behavior event creation queued for sync");
      }

      this.setSyncStatus("success");
      return documentId;
    } catch (e) {
      console.error("Error adding driver behavior event:", e);
      this.setSyncStatus("error");
      throw e;
    }
  }

  /* ---------- cleanup ---------- */
  public cleanup(): void {
    console.log("🧹 Cleaning up driver behavior listeners");

    this.driverBehaviorUnsubscribes.forEach((u) => u());
    this.driverBehaviorUnsubscribes.clear();

    this.globalUnsubscribes.forEach((u) => u());
    this.globalUnsubscribes.clear();
  }
}

/* Singleton */
export const driverBehaviorService = new DriverBehaviorService();
