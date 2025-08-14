// src/hooks/useWebBookDriverBehavior.ts

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, QuerySnapshot, DocumentData } from "firebase/firestore";
import { firestore } from "../utils/firebaseConnectionHandler";

// The event type (matching your payload)
export interface WebBookDriverBehavior {
  id: string;               // Firestore document ID
  fleetNumber: string;
  driverName: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  description?: string;
  location?: string;
  severity?: string;
  status?: string;
  points?: number;
  importSource?: string;
  importedAt?: string;
  updatedAt?: string;
}

export function useWebBookDriverBehavior() {
  const [events, setEvents] = useState<WebBookDriverBehavior[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Firestore query: only web_book-imported events
    const q = query(
      collection(firestore, "driverBehaviorEvents"),
      where("importSource", "==", "web_book")
    );

    // Real-time subscription
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const result: WebBookDriverBehavior[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          result.push({
            id: doc.id,
            ...data
          } as WebBookDriverBehavior);
        });
        setEvents(result);
        setLoading(false);
      },
      (err) => {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handy filters
  const byFleet = (fleetNumber: string) =>
    events.filter(e => e.fleetNumber === fleetNumber);

  const byEventType = (eventType: string) =>
    events.filter(e => e.eventType === eventType);

  return {
    events,           // All events imported from web_book
    loading,
    error,
    byFleet,          // (fleetNumber: string) => event[]
    byEventType,      // (eventType: string) => event[]
    highSeverity: events.filter(e => e.severity === "high"),
    pendingEvents: events.filter(e => e.status === "pending"),
  };
}
