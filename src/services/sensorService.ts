/* --------------------------------------------------------------------------
 *  Sensor data helpers – Firebase **Realtime** DB
 * -------------------------------------------------------------------------- */
import {
  getDatabase,
  ref,
  get,
  onValue,
  off,
  DataSnapshot,
  Database,
} from "firebase/database";
import firebaseApp from "../firebase";               // default export = FirebaseApp
import { ISensor } from "../types/sensor-types";

/** Lazily initialise / reuse the Realtime DB instance */
const rtdb: Database = getDatabase(firebaseApp);

/** DB node that stores the sensors */
const SENSORS_PATH = "sensors";

/* ---------- one-off fetch ----------------------------------------------- */
export async function fetchSensors(): Promise<ISensor[]> {
  const snap: DataSnapshot = await get(ref(rtdb, SENSORS_PATH));
  const val = snap.val() as Record<string, ISensor> | null;
  if (!val) return [];

  /* - ensure we keep an existing id or fall back to the key */
  return Object.entries(val).map(([key, data]) => ({
    ...data,
    id: data.id ?? key,
  }));
}

/* ---------- realtime subscription --------------------------------------- */
export function subscribeToSensorUpdates(
  callback: (sensors: ISensor[]) => void
): () => void {
  const sensorRef = ref(rtdb, SENSORS_PATH);

  const listener = (snap: DataSnapshot) => {
    const val = snap.val() as Record<string, ISensor> | null;
    const list = val
      ? Object.entries(val).map(([key, data]) => ({
          ...data,
          id: data.id ?? key,
        }))
      : [];
    callback(list);
  };

  onValue(sensorRef, listener);

  /* unsubscribe mirrors Firebase RTDB API */
  return () => off(sensorRef, "value", listener);
}
