import { useEffect, useState } from "react";
import type { WialonResource } from "../types/wialon-types";

/**
 * Hook to fetch Wialon resources
 * @param session Wialon session object
 * @param loggedIn Boolean indicating whether the session is active
 * @returns Array of WialonResource objects including rawObject
 */
export const useWialonResources = (session: any, loggedIn: boolean): WialonResource[] => {
  const [resources, setResources] = useState<WialonResource[]>([]);

  useEffect(() => {
    if (!loggedIn || !session) return;

    const flags = window.wialon.item.Item.dataFlag.base;

    session.updateDataFlags(
      [{ type: "type", data: "avl_resource", flags, mode: 0 }],
      (code: number) => {
        if (code) {
          console.error("Error updating data flags:", code);
          return;
        }

        const rawResources = session.getItems("avl_resource");

        if (rawResources) {
          const formattedResources: WialonResource[] = rawResources.map((r: any) => ({
            id: r.getId(),
            name: r.getName(),
            rawObject: r, // Added rawObject for TypeScript compatibility
          }));
          setResources(formattedResources);
        } else {
          setResources([]);
        }
      }
    );
  }, [session, loggedIn]);

  return resources;
};

export default useWialonResources;
