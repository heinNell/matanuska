import { useEffect, useState } from "react";
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../utils/firebaseConnectionHandler';
// Define inspection interface
export interface TyreInspection {
  id: string;
  date: string;
  tyreId: string;
  treadDepth: number;
  pressure?: number;
  temperature?: number;
  status: string;
  inspector?: string;
  notes?: string;
}

export function useTyreInspections(tyreId?: string) {
  const [inspections, setInspections] = useState<TyreInspection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tyreId) {
      setInspections([]);
      return;
    }

    const fetchInspections = async () => {
      try {
        setLoading(true);

        // Mock data - in a real app, fetch from Firestore or API
        const mockInspections: TyreInspection[] = [
          {
            id: "1",
            date: "2025-06-15",
            tyreId,
            treadDepth: 18,
            pressure: 120,
            temperature: 35,
            status: "good",
            inspector: "John Doe",
            notes: "Regular inspection",
          },
          {
            id: "2",
            date: "2025-07-01",
            tyreId,
            treadDepth: 16,
            pressure: 118,
            temperature: 38,
            status: "good",
            inspector: "Jane Smith",
            notes: "Minor wear detected",
          },
        ];

        // Simulate API delay
        setTimeout(() => {
          setInspections(mockInspections);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch inspections"));
        setLoading(false);
      }
    };

    fetchInspections();
  }, [tyreId]);

  return { inspections, loading, error };
}
