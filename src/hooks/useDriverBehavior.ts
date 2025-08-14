import { useCallback, useEffect, useState } from "react";
import { DriverBehaviorEvent, driverBehaviorService } from "../api/driverBehaviorService";

interface UseDriverBehaviorOptions {
  autoSubscribe?: boolean;
  driver?: string;
}

export function useDriverBehavior(options: UseDriverBehaviorOptions = {}) {
  const [events, setEvents] = useState<DriverBehaviorEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to all driver behavior events
  const subscribeToAll = useCallback(() => {
    try {
      setLoading(true);
      driverBehaviorService.registerCallbacks({
        setDriverBehaviorEvents: (events) => {
          setEvents(events);
          setLoading(false);
        },
      });
      driverBehaviorService.subscribeToAllDriverBehaviorEvents();
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to subscribe to driver behavior events")
      );
      setLoading(false);
    }
  }, []);

  // Subscribe to a specific driver's behavior events
  const subscribeToDriver = useCallback((driverName: string) => {
    try {
      setLoading(true);
      driverBehaviorService.registerCallbacks({
        onDriverBehaviorUpdate: (event) => {
          setEvents((prev) => {
            const exists = prev.findIndex((e) => e.id === event.id);
            if (exists >= 0) {
              // Update existing event
              const updated = [...prev];
              updated[exists] = event;
              return updated;
            } else {
              // Add new event
              return [...prev, event];
            }
          });
          setLoading(false);
        },
      });
      driverBehaviorService.subscribeToDriverBehavior(driverName);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error(`Failed to subscribe to driver ${driverName}'s behavior events`)
      );
      setLoading(false);
    }
  }, []);

  // Add a new driver behavior event
  const addEvent = useCallback(async (eventData: Omit<DriverBehaviorEvent, "id">) => {
    try {
      return await driverBehaviorService.addDriverBehaviorEvent(eventData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to add driver behavior event"));
      throw err;
    }
  }, []);

  // Update an existing driver behavior event
  const updateEvent = useCallback(
    async (eventId: string, data: Partial<DriverBehaviorEvent>, eventPath?: string) => {
      try {
        await driverBehaviorService.updateDriverBehaviorEvent(eventId, data, eventPath);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error(`Failed to update driver behavior event ${eventId}`)
        );
        throw err;
      }
    },
    []
  );

  // Filter events by various criteria
  const filterEvents = useCallback(
    (filters: {
      driverName?: string;
      fleetNumber?: string;
      eventType?: string;
      startDate?: string;
      endDate?: string;
      severity?: string;
      status?: string;
    }) => {
      return events.filter((event) => {
        let matches = true;

        if (filters.driverName && event.driverName !== filters.driverName) {
          matches = false;
        }

        if (filters.fleetNumber && event.fleetNumber !== filters.fleetNumber) {
          matches = false;
        }

        if (filters.eventType && event.eventType !== filters.eventType) {
          matches = false;
        }

        if (filters.severity && event.severity !== filters.severity) {
          matches = false;
        }

        if (filters.status && event.status !== filters.status) {
          matches = false;
        }

        if (filters.startDate || filters.endDate) {
          const eventDate = event.eventDate;
          if (filters.startDate && eventDate < filters.startDate) {
            matches = false;
          }
          if (filters.endDate && eventDate > filters.endDate) {
            matches = false;
          }
        }

        return matches;
      });
    },
    [events]
  );

  // Generate a document path for an event
  const getEventPath = useCallback((event: Partial<DriverBehaviorEvent>): string | null => {
    if (!event.fleetNumber || !event.eventType || !event.eventDate || !event.id) {
      return null;
    }

    const month = event.eventDate.split("/")[1]; // Extract month from "2025/06/20"
    return `driverBehaviorEvents/${event.fleetNumber}_${event.eventType}_2025/${month}/${event.id}`;
  }, []);

  // Auto-subscribe based on options
  useEffect(() => {
    if (options.autoSubscribe) {
      if (options.driver) {
        subscribeToDriver(options.driver);
      } else {
        subscribeToAll();
      }
    }

    // Cleanup on unmount
    return () => {
      driverBehaviorService.cleanup();
    };
  }, [options.autoSubscribe, options.driver, subscribeToAll, subscribeToDriver]);

  return {
    events,
    loading,
    error,
    subscribeToAll,
    subscribeToDriver,
    addEvent,
    updateEvent,
    filterEvents,
    getEventPath,
  };
}

export default useDriverBehavior;
