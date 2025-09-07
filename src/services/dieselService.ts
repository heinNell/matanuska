// src/services/dieselService.ts (or wherever this file lives)

import { firestore } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  getDoc,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import type { DieselConsumptionRecord, DieselNorm } from "../types/diesel";

// ❌ REMOVE: never import UI components in a service layer
// import DieselNormsModal from "../components/Models/Diesel/DieselNormsModal";

// Collection references
const DIESEL_COLLECTION = "dieselConsumption";
const DIESEL_NORMS_COLLECTION = "dieselNorms";

/**
 * Add a new diesel consumption record
 */
export const addDieselRecord = async (record: DieselConsumptionRecord): Promise<string> => {
  try {
    interface DieselRecordWithLegacyDateISO {
      date?: Date;
      dateISO?: string;
    }

    const recordWithTimestamp: DieselConsumptionRecord = {
      ...record,
      date:
        (record.date !== undefined && record.date !== null) ||
        ((record as DieselRecordWithLegacyDateISO).dateISO !== undefined && (record as DieselRecordWithLegacyDateISO).dateISO !== null && (record as DieselRecordWithLegacyDateISO).dateISO !== '')
          ? Timestamp.fromDate(new Date((record as DieselRecordWithLegacyDateISO).dateISO!))
          : undefined,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(firestore, DIESEL_COLLECTION), recordWithTimestamp);
    return docRef.id;
  } catch (error: unknown) {
    console.error("Error adding diesel record:", error);
    throw error;
  }
};

/**
 * Get all diesel consumption records
 */
export const getAllDieselRecords = async (): Promise<DieselConsumptionRecord[]> => {
  try {
    const snap = await getDocs(collection(firestore, DIESEL_COLLECTION));
const records: DieselConsumptionRecord[] = [];
snap.forEach((d) => {
 records.push({ id: d.id, ...d.data() } as DieselConsumptionRecord);
});
    return records;
  } catch (error: unknown) {
    console.error("Error getting diesel records:", error);
    throw error;
  }
};

/**
 * Get diesel records for a specific vehicle/fleet
 */
export const getDieselRecordsForVehicle = async (
  fleetOrVehicleId: string
): Promise<DieselConsumptionRecord[]> => {
  try {
    // Support either field while you migrate
    const q1 = query(
      collection(firestore, DIESEL_COLLECTION),
      where("fleetNumber", "==", fleetOrVehicleId)
    );
    const q2 = query(
      collection(firestore, DIESEL_COLLECTION),
      where("vehicleId", "==", fleetOrVehicleId)
    );

    const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    // Type the raw document data properly
    type RawDocumentData = { id: string } & Record<string, unknown>;

    const a1: RawDocumentData[] = s1.docs.map((d) => ({ id: d.id, ...d.data() }));
    const a2: RawDocumentData[] = s2.docs.map((d) => ({ id: d.id, ...d.data() }));

    // de-dup on id
    const map = new Map<string, DieselConsumptionRecord>();
    [...a1, ...a2].forEach((r: RawDocumentData) => map.set(r.id, r as unknown as DieselConsumptionRecord));
    return [...map.values()];
  } catch (error: unknown) {
    console.error("Error getting diesel records for vehicle:", error);
    throw error;
  }
};

/**
 * Update a diesel consumption record
 */
export const updateDieselRecord = async (
  id: string,
  updatedData: Partial<DieselConsumptionRecord>
): Promise<void> => {
  try {
    const dataWithTimestamp: Partial<DieselConsumptionRecord> = {
      ...updatedData,
      ...(updatedData.dateISO !== undefined && updatedData.dateISO !== null && updatedData.dateISO !== ''
          ? { date: Timestamp.fromDate(new Date(updatedData.dateISO)) }
          : {}),
      updatedAt: serverTimestamp(),
    };
    await updateDoc(doc(firestore, DIESEL_COLLECTION, id), dataWithTimestamp);
  } catch (error: unknown) {
    console.error("Error updating diesel record:", error);
    throw error;
  }
};

/**
 * Delete a diesel consumption record
 */
export const deleteDieselRecord = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(firestore, DIESEL_COLLECTION, id));
  } catch (error: unknown) {
    console.error("Error deleting diesel record:", error);
    throw error;
  }
};

/**
 * Get a diesel consumption record by ID
 */
export const getDieselRecordById = async (id: string): Promise<DieselConsumptionRecord | null> => {
  try {
    const ref = doc(firestore, DIESEL_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as DieselConsumptionRecord;
  } catch (error: unknown) {
    console.error("Error getting diesel record:", error);
    throw error;
  }
};

/**
 * Get diesel records for a specific date range (server-side via Timestamp)
 * startDate / endDate: "YYYY-MM-DD"
 */
export const getDieselRecordsForDateRange = async (
  startDate: string,
  endDate: string
): Promise<DieselConsumptionRecord[]> => {
  try {
    const startTs = Timestamp.fromDate(new Date(`${startDate}T00:00:00`));
    const endTs = Timestamp.fromDate(new Date(`${endDate}T23:59:59`));

    // Firestore requires consistent orderBy when doing range filters
    const q = query(
      collection(firestore, DIESEL_COLLECTION),
      where("date", ">=", startTs),
      where("date", "<=", endTs),
      orderBy("date", "asc")
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DieselConsumptionRecord);
  } catch (error: unknown) {
    // If you still store string dates in some docs, you can fall back to client filtering:
    // const all = await getAllDieselRecords();
    // return all.filter(r => r.dateISO && r.dateISO >= startDate && r.dateISO <= endDate);
    console.error("Error getting diesel records for date range:", error);
    throw error;
  }
};

/**
 * Link a diesel record to a trip
 */
export const linkDieselToTrip = async (dieselId: string, tripId: string): Promise<void> => {
  try {
    await updateDieselRecord(dieselId, { tripId });
  } catch (error: unknown) {
    console.error("Error linking diesel to trip:", error);
    throw error;
  }
};

/**
 * Get all diesel norms
 */
export const getAllDieselNorms = async (): Promise<DieselNorm[]> => {
  try {
    const snap = await getDocs(collection(firestore, DIESEL_NORMS_COLLECTION));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DieselNorm);
  } catch (error: unknown) {
    console.error("Error getting diesel norms:", error);
    throw error;
  }
};

/**
 * Update or create a diesel norm
 */
export const upsertDieselNorm = async (norm: DieselNorm): Promise<string> => {
  try {
    if (norm.id !== undefined && norm.id !== null && norm.id !== '') {
      await updateDoc(doc(firestore, DIESEL_NORMS_COLLECTION, norm.id), {
        ...norm,
        updatedAt: serverTimestamp(),
      } as DieselNorm);
      return norm.id;
    } else {
      const ref = await addDoc(collection(firestore, DIESEL_NORMS_COLLECTION), {
        ...norm,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as DieselNorm);
      return ref.id;
    }
  } catch (error: unknown) {
    console.error("Error upserting diesel norm:", error);
    throw error;
  }
};

/**
 * Delete a diesel norm
 */
export const deleteDieselNorm = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(firestore, DIESEL_NORMS_COLLECTION, id));
  } catch (error: unknown) {
    console.error("Error deleting diesel norm:", error);
    throw error;
  }
};

/**
 * Calculate diesel consumption statistics for a vehicle/fleet
 */
export const calculateDieselStats = async (
  fleetOrVehicleId: string
): Promise<{
  totalConsumption: number;
  averageConsumptionPer100km: number;
  recordCount: number;
  totalDistance: number;
}> => {
  try {
    const records = await getDieselRecordsForVehicle(fleetOrVehicleId);
    if (records.length === 0) {
      return {
        totalConsumption: 0,
        averageConsumptionPer100km: 0,
        recordCount: 0,
        totalDistance: 0,
      };
    }

    const totalConsumption = records.reduce((sum, r) => sum + (r.litresFilled || 0), 0);

    let totalDistance = 0;
    for (const r of records) {
      const dist = (r.kmReading ?? 0) - (r.previousKmReading ?? 0);
      if (dist > 0) totalDistance += dist;
    }

    const averageConsumptionPer100km =
      totalDistance > 0 ? (totalConsumption / totalDistance) * 100 : 0;

    return {
      totalConsumption,
      averageConsumptionPer100km,
      recordCount: records.length,
      totalDistance,
    };
  } catch (error: unknown) {
    console.error("Error calculating diesel stats:", error);
    throw error;
  }
};
