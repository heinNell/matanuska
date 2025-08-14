import { useEffect, useState, useCallback } from "react";
import type { WialonSession } from "../types/wialon";

// Custom type definitions for Wialon objects
type WialonResource = {
  id: string | number;
  name: string;
  // Wialon SDK objects can be complex, so we'll store the raw object as well
  rawObject: any;
};

type WialonGeofence = {
  id: string | number;
  name: string;
  // Geofence data can also be complex, this keeps it type-safe
  data: any;
};

/**
 * A custom hook for fetching Wialon resources and their associated geofences.
 * It encapsulates the logic for loading data and managing the state of resources
 * and geofences for a selected resource.
 *
 * @param session The Wialon SDK session instance.
 * @param loggedIn A boolean indicating the user's login status.
 * @returns An object containing the resources, geofences, the selected resource ID,
 * and a function to select a resource.
 */
const useWialonGeofences = (session: WialonSession, loggedIn: boolean) => {
  const [resources, setResources] = useState<WialonResource[]>([]);
  const [geofences, setGeofences] = useState<WialonGeofence[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string | number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to load resources initially
  useEffect(() => {
    if (!loggedIn || !session || !window.wialon || !window.wialon.item) return;

    // The flags from the jQuery code to get base data and geofences
    // FIX: Added a type assertion to resolve the TypeScript error.
    const flags =
      window.wialon.item.Item.dataFlag.base | (window.wialon.item as any).Resource.dataFlag.zones;

    setIsLoading(true);
    setError(null);

    // The Wialon SDK requires the 'resourceZones' library to be loaded for geofence data
    session.loadLibrary("resourceZones");

    // Use updateDataFlags to load resources and their geofences
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
          // Automatically select the first resource found
          setSelectedResourceId(formattedResources[0].id);
        } else {
          setResources([]);
          setSelectedResourceId(null);
          setGeofences([]);
        }
        setIsLoading(false);
      }
    );
  }, [session, loggedIn]);

  // Effect to load geofences for the selected resource
  useEffect(() => {
    if (!loggedIn || !session || selectedResourceId === null) {
      setGeofences([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Find the selected resource object from our state
    const selectedResource = resources.find((r) => r.id === selectedResourceId);

    if (selectedResource) {
      // The getZones() function from the Wialon SDK directly returns the zones data
      const zones = selectedResource.rawObject.getZones();

      if (zones) {
        const formattedGeofences = Object.values(zones).map((z: any) => ({
          id: z.id,
          name: z.n,
          data: z,
        }));
        setGeofences(formattedGeofences);
      } else {
        setGeofences([]);
      }
    } else {
      setGeofences([]);
    }
    setIsLoading(false);
  }, [selectedResourceId, resources, session, loggedIn]);

  // A public function to allow the user to select a different resource
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
