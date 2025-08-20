import { useEffect, useState, useCallback } from "react";
import type { WialonGeofence, WialonResource } from "../types/wialon-types";

// Narrowing helper: does the object expose getZones()?
const hasGetZones = (x: any): x is { getZones: () => Record<string, any> | undefined } =>
  !!x && typeof x.getZones === "function";

interface UseWialonGeofencesResult {
  resources: WialonResource[];
  geofences: WialonGeofence[];
  selectedResourceId: string | number | null;
  selectResource: (id: string | number) => void;
  isLoading: boolean;
  error: string | null;
}

const useWialonGeofences = (
  resources: WialonResource[],
  selectedResourceId: string | number | null
): UseWialonGeofencesResult => {
  const [geofences, setGeofences] = useState<WialonGeofence[]>([]);
  const [selectedResId, setSelectedResId] = useState<string | number | null>(selectedResourceId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load geofences when resource changes
  useEffect(() => {
    if (!selectedResId) {
      setGeofences([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const selectedResource = resources.find((r) => r.id === selectedResId);
    if (!selectedResource) {
      setGeofences([]);
      setIsLoading(false);
      return;
    }

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

    const formattedGeofences: WialonGeofence[] = zoneArray.map((z: any) => ({
      id: z.id ?? z.i ?? "",          // Defensive
      n: z.n ?? z.name ?? "",
      t: typeof z.t === "number" ? z.t : 0,
      w: typeof z.w === "number" ? z.w : 0,
      c: z.c ?? "",
      p: Array.isArray(z.p) ? z.p : [],
    }));

    setGeofences(formattedGeofences);
    setIsLoading(false);
  }, [selectedResId, resources]);

  const selectResource = useCallback((id: string | number) => {
    setSelectedResId(id);
  }, []);

  return {
    resources,
    geofences,
    selectedResourceId: selectedResId,
    selectResource,
    isLoading,
    error,
  };
};

export default useWialonGeofences;
