import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  deleteDoc,
  addDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase"; // Assuming db is the Firestore instance
import { Tyre, TyreInspection, TyreStore } from "../types/tyre";
import { Vehicle } from "../types/vehicle";

// Collection name in Firestore
const ASSIGNMENTS_COLLECTION = "tyreAssignments";

type TyreModelRef = { id: string; name?: string };

export interface TyreAssignment {
  id: string;
  tyre: { id: string; serialNumber: string; brand: string };
  vehicle: { id: string; fleetNo: string };
  assignedAt: string;
  store?: TyreStore;
  inspection?: TyreInspection;
  model?: TyreModelRef;
}

/**
 * A custom hook to manage tyre assignments in Firestore.
 * It provides real-time data, and functions for creating, unassigning, and finding assignments.
 */
export const useTyreAssignment = () => {
  const [assignments, setAssignments] = useState<TyreAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set up a real-time listener for the assignments collection
  useEffect(() => {
    const assignmentsRef = collection(db, ASSIGNMENTS_COLLECTION);
    const q = query(assignmentsRef);

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

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Assigns a tyre to a vehicle in the database.
   */
  const assignTyre = useCallback(
    async (
      tyre: { id: string; serialNumber: string; brand: string },
      vehicle: { id: string; fleetNo: string },
      options?: {
        store?: TyreStore;
        inspection?: TyreInspection;
        model?: TyreModelRef;
      }
    ) => {
      try {
        setLoading(true);
        const newAssignmentData = {
          tyre,
          vehicle,
          assignedAt: new Date().toISOString(),
          ...options,
        };
        await addDoc(collection(db, ASSIGNMENTS_COLLECTION), newAssignmentData);
      } catch (err) {
        setError("Failed to assign tyre.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Unassigns a tyre by deleting the assignment document from the database.
   */
  const unassignTyre = useCallback(async (assignmentId: string) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, ASSIGNMENTS_COLLECTION, assignmentId));
    } catch (err) {
      setError("Failed to unassign tyre.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Finds assignments based on various criteria using in-memory filtering.
   */
  const findAssignments = useCallback(
    (criteria: { tyreId?: string; vehicleId?: string }) => {
      return assignments.filter(
        (a) =>
          (!criteria.tyreId || a.tyre.id === criteria.tyreId) &&
          (!criteria.vehicleId || a.vehicle.id === criteria.vehicleId)
      );
    },
    [assignments]
  );

  /**
   * Gets the current assignment for a specific tyre ID.
   */
  const getTyreAssignment = useCallback(
    (tyreId: string) => {
      return assignments.find((a) => a.tyre.id === tyreId) || null;
    },
    [assignments]
  );

  return {
    assignments,
    loading,
    error,
    assignTyre,
    unassignTyre,
    findAssignments,
    getTyreAssignment,
  };
};
