// src/hooks/useWialonDrivers.ts
import { useEffect, useState } from "react";
import wialonService from "../services/wialonService"; // Correct default import
import type { WialonDriver } from "../types/wialon-types";
import { WialonSession } from '../types/wialon';

export function useWialonDrivers(session: WialonSession | null) {
  const [drivers, setDrivers] = useState<WialonDriver[]>([]);

  useEffect(() => {
    if (!session) {
      setDrivers([]);
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        // First get available resources if no resourceId provided
        if (!session.resourceId) {
          const resources = await wialonService.getResources();
          if (resources && resources.length > 0 && isMounted) {
            // Use the first resource if resourceId is not provided
            const resourceId = resources[0]?.id;
            if (resourceId) {
              const list = await wialonService.getDrivers(resourceId);
              if (isMounted) {
                setDrivers(Array.isArray(list) ? list : []);
              }
            }
          }
        } else {
          // If resourceId is provided, use it
          const list = await wialonService.getDrivers(session.resourceId);
          if (isMounted) {
            setDrivers(Array.isArray(list) ? list : []);
          }
        }
      } catch (error) {
        console.error("Failed to fetch drivers:", error);
        if (isMounted) {
          setDrivers([]);
        }
      }
    })();

    return () => {
      isMounted = false; // Cleanup to avoid state updates after unmount
    };
  }, [session]);

  return drivers;
}

export default useWialonDrivers;
