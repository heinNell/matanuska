import { useEffect, useState } from "react";
import wialonService, { WialonResource as ServiceWialonResource } from "../services/wialonService";
import type { WialonDriver } from "../types/wialon-types";
import { WialonApiSession } from '../types/wialon';

export function useWialonDrivers(session: WialonApiSession | null) {
  const [drivers, setDrivers] = useState<WialonDriver[]>([]);

  useEffect(() => {
    if (!session) {
      setDrivers([]);
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        const resources: ServiceWialonResource[] = await wialonService.getResources();

        // Correctly handle the case where session.resource_id is an array
        const resourceId = Array.isArray(session.resource_id)
          ? session.resource_id[0] // Use the first resource ID if it's an array
          : session.resource_id;

        if (resourceId) {
          const list = await wialonService.getDrivers(resourceId);
          if (isMounted) {
            setDrivers(Array.isArray(list) ? list : []);
          }
        } else if (resources && resources.length > 0 && isMounted) {
          // Fallback to the first available resource if none is provided in the session
          const firstResourceId = resources[0]?.id;
          if (firstResourceId) {
            const list = await wialonService.getDrivers(firstResourceId);
            if (isMounted) {
              setDrivers(Array.isArray(list) ? list : []);
            }
          }
        } else {
          // No resources or resource ID found
          if (isMounted) {
            setDrivers([]);
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
