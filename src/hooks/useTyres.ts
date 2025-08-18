import { firestore } from "../firebase";
import { tyreConverter } from "../types/TyreFirestoreConverter";
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Define the Tyre interface based on your actual data structure
export interface Tyre {
  id: string;
  serialNumber: string;
  brand: string;
  size: {
    width: number;
    aspectRatio: number;
    rimDiameter: number;
    displayString?: string;
  };
  status: string;
  condition?: {
    treadDepth: number;
    status: string;
  };
  kmRun: number;
  // Add other properties as needed
}

export function useTyres() {
  const [tyres, setTyres] = useState<Tyre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRef = useRef<(() => void) | undefined>(undefined);

  // Use Firestore to fetch tyres
  useEffect(() => {
    const tyresRef = collection(firestore, "tyres").withConverter(tyreConverter);
    let cleanup: (() => void) | undefined;
    try {
      // Set up real-time listener
      const unsubscribe = onSnapshot(
        tyresRef,
        (snapshot) => {
          const tyresData: Tyre[] = snapshot.docs.map((docSnapshot) => ({
            ...docSnapshot.data(),
            id: docSnapshot.id, // This will override any id field that came from data()
          }));
          setTyres(tyresData);
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );

      // Store unsubscribe function
      unsubscribeRef.current = unsubscribe;
      cleanup = () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch tyres"));
      setLoading(false);
      cleanup = undefined;
    }

    return cleanup ?? (() => {});
  }, []);

  // Add a new tyre
  const addTyre = useCallback(async (tyreData: Omit<Tyre, "id">) => {
    try {
      const tyresRef = collection(firestore, "tyres").withConverter(tyreConverter);
      await addDoc(tyresRef, tyreData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to add tyre"));
      return false;
    }
  }, []);

  // Update an existing tyre
  const updateTyre = useCallback(async (id: string, tyreData: Partial<Tyre>) => {
    try {
      const tyreRef = doc(firestore, "tyres", id);
      await updateDoc(tyreRef, tyreData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update tyre"));
      return false;
    }
  }, []);

  // Delete a tyre
  const deleteTyre = useCallback(async (id: string) => {
    try {
      const tyreRef = doc(firestore, "tyres", id);
      await deleteDoc(tyreRef);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to delete tyre"));
      return false;
    }
  }, []);

  // Memoize the return value for better performance
  return useMemo(
    () => ({
      tyres,
      loading,
      error,
      addTyre,
      updateTyre,
      deleteTyre,
    }),
    [tyres, loading, error, addTyre, updateTyre, deleteTyre]
  );
}
