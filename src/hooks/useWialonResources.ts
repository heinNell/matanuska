import { useEffect, useState } from "react";

// Custom type definitions for WialonResource
type WialonResource = {
  id: string | number;
  name: string;
};

// A custom hook to fetch Wialon resources.
// It's a great way to encapsulate the data fetching logic.
export const useWialonResources = (session: any, loggedIn: boolean) => {
  const [resources, setResources] = useState<WialonResource[]>([]);

  useEffect(() => {
    // Only run if the user is logged in and a session exists
    if (!loggedIn || !session) return;

    // These flags specify what kind of data to get.
    // The user's original code used dataFlag.base, which is sufficient.
    const flags = window.wialon.item.Item.dataFlag.base;

    // Use session.updateDataFlags to load the items.
    session.updateDataFlags(
      [{ type: "type", data: "avl_resource", flags, mode: 0 }],
      (code: number) => {
        // Handle any errors from the API call
        if (code) {
          console.error("Error updating data flags:", code);
          return;
        }

        // Get the loaded Wialon SDK objects
        const rawResources = session.getItems("avl_resource");

        // IMPORTANT: Map the raw SDK objects to your custom WialonResource type.
        // This is the correct way to handle the data and update the state.
        if (rawResources) {
          const formattedResources = rawResources.map((r: any) => ({
            id: r.getId(),
            name: r.getName(),
          }));
          setResources(formattedResources);
        } else {
          setResources([]);
        }
      }
    );
  }, [session, loggedIn]); // The effect re-runs when session or loggedIn changes

  return resources;
};

export default useWialonResources;
