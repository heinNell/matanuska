import { useCallback, useEffect, useState } from "react";
// Use canonical domain types
import { Tyre, TyreInspection, TyreStore } from "../types/tyre";
import { Vehicle } from "../types/vehicle";

// Minimal reference for a tyre model entity (no concrete type exists yet in types)
type TyreModelRef = { id: string; name?: string };
type TyreAssignment = {
  id: string;
  tyre: Tyre;
  vehicle: Vehicle;
  assignedAt: Date;
  store?: TyreStore; // Optional store reference
  inspection?: TyreInspection; // Optional inspection data
  model?: TyreModelRef; // Optional model reference
};

export const useTyreAssignment = (initialAssignments: TyreAssignment[] = []) => {
  const [assignments, setAssignments] = useState<TyreAssignment[]>(initialAssignments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load assignments with related tyre and vehicle data
  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      // Example API call - adjust to your backend
      const response = await fetch("/api/tyre-assignments?expand=tyre,vehicle,store");
      const data = await response.json();
      setAssignments(data);
    } catch (err) {
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize with data load
  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // Assign a tyre with full context
  const assignTyre = useCallback(
    async (
      tyre: Tyre,
      vehicle: Vehicle,
      options?: {
        store?: TyreStore;
        inspection?: TyreInspection;
        model?: TyreModelRef;
      }
    ) => {
      try {
        setLoading(true);
        const response = await fetch("/api/tyre-assignments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tyreId: tyre.id,
            vehicleId: vehicle.id,
            storeId: options?.store?.id,
            inspectionId: options?.inspection?.id,
            modelId: options?.model?.id,
          }),
        });

        const newAssignment = await response.json();
        setAssignments((prev) => [...prev, newAssignment]);
      } catch (err) {
        setError("Failed to assign tyre");
        throw err; // Re-throw for error handling in components
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Unassign a tyre
  const unassignTyre = useCallback(async (assignmentId: string) => {
    try {
      setLoading(true);
      await fetch(`/api/tyre-assignments/${assignmentId}`, {
        method: "DELETE",
      });

      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    } catch (err) {
      setError("Failed to unassign tyre");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Find assignments by various criteria
  const findAssignments = useCallback(
    (criteria: { tyreId?: string; vehicleId?: string; storeId?: string; modelId?: string }) => {
      return assignments.filter(
        (a) =>
          (!criteria.tyreId || a.tyre.id === criteria.tyreId) &&
          (!criteria.vehicleId || a.vehicle.id === criteria.vehicleId) &&
          (!criteria.storeId || a.store?.id === criteria.storeId) &&
          (!criteria.modelId || a.model?.id === criteria.modelId)
      );
    },
    [assignments]
  );

  // Get current assignment for a tyre
  const getTyreAssignment = useCallback(
    (tyreId: string) => {
      return assignments.find((a) => a.tyre.id === tyreId) || null;
    },
    [assignments]
  );

  return {
    assignments,
    assignTyre,
    unassignTyre,
    findAssignments,
    getTyreAssignment,
    loadAssignments,
    loading,
    error,
  };
};
