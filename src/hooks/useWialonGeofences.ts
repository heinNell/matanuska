// src/hooks/useWialonGeofences.ts
import { useEffect, useState, useCallback } from "react";
import type { WialonSession } from "../types/wialon";

// Custom type definitions for Wialon objects
type WialonResource = {
  id: string | number;
  name: string;
  rawObject: any;
};

type WialonGeofence = {
  id: string | number;
  name: string;
  data: any;
};

// Narrowing helper: does the object expose getZones()?
const hasGetZones = (x: any): x is { getZones: () => Record<string, any> | undefined } =>
  !!x && typeof x.getZones === "function";

/**
 * Fetch Wialon resources and their geofences.
 */
const useWialonGeofences = (session: WialonSession, loggedIn: boolean) => {
  const [resources, setResources] = useState<WialonResource[]>([]);
  const [geofences, setGeofences] = useState<WialonGeofence[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string | number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load resources initially
  useEffect(() => {
    if (!loggedIn || !session || !window.wialon || !window.wialon.item) return;

    const flags =
      window.wialon.item.Item.dataFlag.base |
      (window.wialon.item as any).Resource.dataFlag.zones;

    setIsLoading(true);
    setError(null);

    session.loadLibrary("resourceZones");

    session.updateDataFlags(
      [{ type: "type", data: "avl_resource", flags, mode: 0 }],
      (code: number) => {
        if (code) {
          setError(`Error loading resources: ${window.wialon.core.Errors.getErrorText(code)}`);
          setIsLoading(false);
          return;
        }

        const rawResources = session.getItems("avl_resource");
        if (rawResources && rawResources.length > 0) {
          const formattedResources = rawResources.map((r: any) => ({
            id: r.getId(),
            name: r.getName(),
            rawObject: r,
          }));
          setResources(formattedResources);
          // only auto-select if we actually have the first item
          if (formattedResources[0]) setSelectedResourceId(formattedResources[0].id);
        } else {
          setResources([]);
          setSelectedResourceId(null);
          setGeofences([]);
        }
        setIsLoading(false);
      }
    );
  }, [session, loggedIn]);

  // Load geofences for the selected resource
  useEffect(() => {
    if (!loggedIn || !session || selectedResourceId === null) {
      setGeofences([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const selectedResource = resources.find((r) => r.id === selectedResourceId);

    if (selectedResource) {
      // ✅ Guard getZones() existence to satisfy TS and runtime
      let zones: Record<string, any> | undefined;

      if (hasGetZones(selectedResource.rawObject)) {
        zones = selectedResource.rawObject.getZones();
      } else if (
        selectedResource.rawObject &&
        typeof selectedResource.rawObject.zones === "object"
      ) {
        zones = selectedResource.rawObject.zones as Record<string, any>;
      }

      const zoneArray = zones ? Object.values(zones) : [];
      const formattedGeofences = zoneArray.map((z: any) => ({
        id: z.id as string | number,
        name: (z.n as string) ?? String(z.id),
        data: z,
      }));

      setGeofences(formattedGeofences);
    } else {
      setGeofences([]);
    }

    setIsLoading(false);
  }, [selectedResourceId, resources, session, loggedIn]);

  const selectResource = useCallback((id: string | number) => {
    setSelectedResourceId(id);
  }, []);

  return {
    resources,
    geofences,
    selectedResourceId,
    selectResource,
    isLoading,
    error,
  };
};

export default useWialonGeofences;
