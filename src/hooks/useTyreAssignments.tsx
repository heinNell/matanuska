import { useCallback, useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  deleteDoc,
  writeBatch,
  QueryConstraint,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { TyreInspection, TyreStore } from "../types/tyre";

export type TyreModelRef = { id: string; name?: string };

export interface TyreAssignment {
  id: string;
  tyre: { id: string; serialNumber: string; brand: string };
  vehicle: { id: string; fleetNo: string };
  assignedAt: string;
  store?: TyreStore;
  inspection?: TyreInspection;
  model?: TyreModelRef;
}

interface UseTyreAssignmentOptions {
  collectionName?: string;
  filters?: { tyreId?: string; vehicleId?: string };
}

export const useTyreAssignment = ({
  collectionName = "tyreAssignments",
  filters,
}: UseTyreAssignmentOptions = {}) => {
  const [assignments, setAssignments] = useState<TyreAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener
  useEffect(() => {
    const assignmentsRef = collection(db, collectionName);
    const constraints: QueryConstraint[] = [];
    if (filters?.tyreId) constraints.push(where("tyre.id", "==", filters.tyreId));
    if (filters?.vehicleId) constraints.push(where("vehicle.id", "==", filters.vehicleId));

    const q = constraints.length > 0 ? query(assignmentsRef, ...constraints) : assignmentsRef;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const assignmentsData: TyreAssignment[] = snapshot.docs.map((d) => ({
          ...(d.data() as Omit<TyreAssignment, "id">),
          id: d.id,
        }));
        setAssignments(assignmentsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Failed to fetch tyre assignments:", err);
        setError("Failed to load assignments from the database.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, filters?.tyreId, filters?.vehicleId]);

  // Assign single tyre
  const assignTyre = useCallback(
    async (
      tyre: { id: string; serialNumber: string; brand: string },
      vehicle: { id: string; fleetNo: string },
      options?: { store?: TyreStore; inspection?: TyreInspection; model?: TyreModelRef }
    ) => {
      try {
        setLoading(true);
        const newAssignmentData = {
          tyre,
          vehicle,
          assignedAt: new Date().toISOString(),
          ...options,
        };
        await addDoc(collection(db, collectionName), newAssignmentData);
      } catch (err) {
        setError("Failed to assign tyre.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [collectionName]
  );

  // Bulk assign multiple tyres
  const bulkAssignTyres = useCallback(
    async (
      tyres: { id: string; serialNumber: string; brand: string }[],
      vehicle: { id: string; fleetNo: string },
      options?: { store?: TyreStore; inspection?: TyreInspection; model?: TyreModelRef }
    ) => {
      if (!tyres.length) return;
      try {
        setLoading(true);
        const batch = writeBatch(db);
        const assignmentsRef = collection(db, collectionName);

        tyres.forEach((tyre) => {
          const docRef = doc(assignmentsRef);
          batch.set(docRef, {
            tyre,
            vehicle,
            assignedAt: new Date().toISOString(),
            ...options,
          });
        });

        await batch.commit();
      } catch (err) {
        setError("Failed to bulk assign tyres.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [collectionName]
  );

  // Unassign a tyre
  const unassignTyre = useCallback(
    async (assignmentId: string) => {
      try {
        setLoading(true);
        await deleteDoc(doc(db, collectionName, assignmentId));
      } catch (err) {
        setError("Failed to unassign tyre.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [collectionName]
  );

  const findAssignments = useCallback(
    (criteria?: { tyreId?: string; vehicleId?: string }) => {
      if (!criteria) return assignments;
      return assignments.filter(
        (a) =>
          (!criteria.tyreId || a.tyre.id === criteria.tyreId) &&
          (!criteria.vehicleId || a.vehicle.id === criteria.vehicleId)
      );
    },
    [assignments]
  );

  const getTyreAssignment = useCallback(
    (tyreId: string) => assignments.find((a) => a.tyre.id === tyreId) || null,
    [assignments]
  );

  return {
    assignments,
    loading,
    error,
    assignTyre,
    bulkAssignTyres, // ✅ added
    unassignTyre,
    findAssignments,
    getTyreAssignment,
  };
};
