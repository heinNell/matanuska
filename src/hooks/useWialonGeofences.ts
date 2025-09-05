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

/**
 * Hook for managing Wialon geofences with enhanced error handling
 * @param resources Array of Wialon resources
 * @param selectedResourceId ID of selected resource
 * @returns State and functions for geofence management
 */
const useWialonGeofences = (
  resources: WialonResource[] | undefined,
  selectedResourceId: string | number | null
): UseWialonGeofencesResult => {
  const [geofences, setGeofences] = useState<WialonGeofence[]>([]);
  const [selectedResId, setSelectedResId] = useState<string | number | null>(selectedResourceId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load geofences when resource changes
  useEffect(() => {
    // Reset state if no selectedResId
    if (!selectedResId) {
      setGeofences([]);
      return;
    }

    // Start loading process
    setIsLoading(true);
    setError(null);

    try {
      // Ensure resources array exists
      if (!Array.isArray(resources)) {
        throw new Error("Resources array is not available");
      }

      // Find selected resource
      const selectedResource = resources.find((r) => r?.id === selectedResId);
      if (!selectedResource) {
        setGeofences([]);
        setIsLoading(false);
        return;
      }

      // Safely extract zones from resource
      let zones: Record<string, any> | undefined;

      // Check if rawObject is available
      if (!selectedResource.rawObject) {
        throw new Error("Resource raw object is not available");
      }

      if (hasGetZones(selectedResource.rawObject)) {
        try {
          zones = selectedResource.rawObject.getZones();
        } catch (err) {
          console.error("Error calling getZones:", err);
          throw new Error("Failed to get zones from resource");
        }
      } else if (
        selectedResource.rawObject &&
        typeof selectedResource.rawObject.zones === "object"
      ) {
        try {
          zones = selectedResource.rawObject.zones as Record<string, any>;
          if (!zones) {
            throw new Error("No zones found in resource");
          }
        } catch (err) {
          console.error("Error accessing zones property:", err);
          throw new Error("Failed to access zones from resource");
        }
      }

      // Process zone data safely
      try {
        // Convert zones object to array safely
        const zoneArray = zones ? Object.values(zones) : [];

        // Map zone data to our format with defensive coding
        const formattedGeofences: WialonGeofence[] = zoneArray
          .map((z: any) => {
            if (!z) return null;

            return {
              id: z.id ?? z.i ?? "",
              n: z.n ?? z.name ?? "Unnamed",
              t: typeof z.t === "number" ? z.t : 0,
              w: typeof z.w === "number" ? z.w : 0,
              c: z.c ?? "",
              // Ensure points exist and are properly formatted
              p: Array.isArray(z.p)
                ? z.p.map((point: any) => ({
                    x: typeof point.x === "number" ? point.x : 0,
                    y: typeof point.y === "number" ? point.y : 0,
                    r: typeof point.r === "number" ? point.r : 0,
                  }))
                : [],
            };
          })
          .filter(Boolean) as WialonGeofence[]; // Remove any null entries

        setGeofences(formattedGeofences);
      } catch (err) {
        console.error("Error processing geofence data:", err);
        setError(
          `Failed to process geofence data: ${err instanceof Error ? err.message : String(err)}`
        );
        setGeofences([]);
      }
    } catch (err) {
      console.error("Error in geofence loading:", err);
      setError(`Error loading geofences: ${err instanceof Error ? err.message : String(err)}`);
      setGeofences([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedResId, resources]);

  const selectResource = useCallback((id: string | number) => {
    setSelectedResId(id);
    setError(null); // Clear errors when selecting a new resource
  }, []);

  return {
    resources: Array.isArray(resources) ? resources : [],
    geofences,
    selectedResourceId: selectedResId,
    selectResource,
    isLoading,
    error,
  };
};

export default useWialonGeofences;
