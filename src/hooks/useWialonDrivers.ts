// src/hooks/useWialonDrivers.ts
import { useEffect, useState } from "react";
import wialonService from "../services/wialonService"; // Correct default import
import type { WialonDriver } from "../types/wialon-types";

export function useWialonDrivers(resourceId: number | null) {
  const [drivers, setDrivers] = useState<WialonDriver[]>([]);
  useEffect(() => {
    if (!resourceId) {
      setDrivers([]);
      return;
    }
    (async () => {
      try {
        // Use public API only
        const list = await wialonService.getDrivers(resourceId);
        setDrivers(list);
      } catch {
        setDrivers([]);
      }
    })();
  }, [resourceId]);
  return drivers;
}

export default useWialonDrivers;
