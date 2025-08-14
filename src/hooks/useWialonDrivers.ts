import { useState, useEffect } from "react";
import type { WialonSession, WialonUnit, WialonDriver, WialonGeofence } from "../types/wialon";


export function useWialonDrivers(session: any, resourceId: number | null) {
  const [drivers, setDrivers] = useState<WialonDriver[]>([]);
  useEffect(() => {
    if (!session || !resourceId) { setDrivers([]); return; }
    const res = session.getItem(resourceId);
    if (!res) return;
    const all = res.getDrivers();
    setDrivers(all.map((d: any) => ({
      id: d.id, name: d.n, ds: d.ds, p: d.p,
    })));
  }, [session, resourceId]);
  return drivers;
}
/**
 * This hook fetches Wialon drivers for a given resource ID.
 * It uses the Wialon session to retrieve the list of drivers and updates the state accordingly.
 * 
 * @param session - The Wialon session object.
 * @param resourceId - The ID of the resource to fetch drivers for.
 * @returns An array of WialonDriver objects.
 */