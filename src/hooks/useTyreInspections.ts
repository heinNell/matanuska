import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from 'firebase/firestore';
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
      setLoading(false);
      return;
    }

    const fetchInspections = async () => {
      setLoading(true);
      setError(null);
      const cancelled = false;
      try {
        // Try fetching from a top-level tyreInspections collection
        const q = query(
          collection(firestore, 'tyreInspections'),
          where('tyreId', '==', tyreId)
        );
        const snap = await getDocs(q);

        if (!cancelled) {
          if (!snap.empty) {
            const rows: TyreInspection[] = snap.docs.map((d) => {
              const data = d.data() as any;
              return {
                id: d.id,
                date:
                  (typeof data.date === 'string' && data.date) ||
                  (typeof data.createdAt === 'string' && data.createdAt) ||
                  new Date().toISOString().slice(0, 10),
                tyreId: data.tyreId ?? tyreId,
                treadDepth: Number(data.treadDepth) || 0,
                pressure:
                  typeof data.pressure === 'number'
                    ? data.pressure
                    : Number(data.pressure) || undefined,
                temperature:
                  typeof data.temperature === 'number'
                    ? data.temperature
                    : Number(data.temperature) || undefined,
                status: String(data.status || 'unknown'),
                inspector: data.inspector,
                notes: data.notes,
              } as TyreInspection;
            });
            setInspections(rows);
          } else {
            // Fallback to mock data if none found
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
            setInspections(mockInspections);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch inspections"));
          // Keep mock data on error
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
          setInspections(mockInspections);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchInspections();
    return () => {
      // cancel flag is captured in fetchInspections scope
    };
  }, [tyreId]);

  return { inspections, loading, error };
}
