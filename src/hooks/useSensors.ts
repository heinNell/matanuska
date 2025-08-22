/* ─────────────────────────────────────────────────────────────
   useSensors – simple “load-once” hook for the `sensors` collection
   (easily extended to onSnapshot-realtime later).
   ───────────────────────────────────────────────────────────── */

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase";
import { ISensor } from "../types/sensor-types";

export interface UseSensorsResult {
  sensors: ISensor[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches all documents from Firestore’s `sensors` collection once.
 * Returns sensors, loading flag and a possible error message.
 */
export function useSensors(): UseSensorsResult {
  const [sensors, setSensors] = useState<ISensor[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState<string | null>(null);

  useEffect(() => {
    let active = true; // guards against state-update after unmount

    (async () => {
      try {
        const snap = await getDocs(collection(firestore, "sensors"));
        if (!active) return;
        setSensors(snap.docs.map(d => ({ id: d.id, ...d.data() } as ISensor)));
      } catch (err) {
        console.error("useSensors – Firestore read failed:", err);
        if (active) setError((err as Error).message ?? "Unknown error");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, []);

  return { sensors, loading, error };
}
