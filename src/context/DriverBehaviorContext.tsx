import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { DriverBehaviorEvent as DBEvent } from "../api/driverBehaviorService";
import { useDriverBehavior as useDriverBehaviorHook } from "../hooks/useDriverBehavior";

// Re-export the DriverBehaviorEvent interface from the service
export type DriverBehaviorEvent = DBEvent;

// Create context type
interface DriverBehaviorContextType {
  events: DriverBehaviorEvent[];
  loading: boolean;
  error: Error | null;
  webBookEvents: DriverBehaviorEvent[];
  selectedEvent: DriverBehaviorEvent | null;
  setSelectedEvent: (event: DriverBehaviorEvent | null) => void;
  filterEvents: (filters: {
    driverName?: string;
    fleetNumber?: string;
    eventType?: string;
    startDate?: string;
    endDate?: string;
    severity?: string;
    status?: string;
  }) => DriverBehaviorEvent[];
  addEvent: (eventData: Omit<DriverBehaviorEvent, "id">) => Promise<string>;
  updateEvent: (
    eventId: string,
    data: Partial<DriverBehaviorEvent>,
    eventPath?: string
  ) => Promise<void>;
  subscribeToDriver: (driverName: string) => void;
  refreshData: () => void;
}

// Create context with default values
const DriverBehaviorContext = createContext<DriverBehaviorContextType>({
  events: [],
  loading: true,
  error: null,
  webBookEvents: [],
  selectedEvent: null,
  setSelectedEvent: () => {},
  filterEvents: () => [],
  addEvent: async () => "",
  updateEvent: async () => {},
  subscribeToDriver: () => {},
  refreshData: () => {},
});

// Provider props interface
interface DriverBehaviorProviderProps {
  children: ReactNode;
  initialDriver?: string;
}

// Driver Behavior Provider component
export const DriverBehaviorProvider: React.FC<DriverBehaviorProviderProps> = ({
  children,
  initialDriver,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<DriverBehaviorEvent | null>(null);

  // Use our custom hook that connects to the driverBehaviorService
  const {
    events,
    loading,
    error,
    filterEvents,
    addEvent,
    updateEvent,
    subscribeToDriver,
    subscribeToAll,
  } = useDriverBehaviorHook({
    autoSubscribe: true,
    driver: initialDriver,
  });

  // Filter web book events
  const webBookEvents = events.filter((e: DriverBehaviorEvent) => e.importSource === "web_book");

  // Function to refresh data
  const refreshData = () => {
    if (initialDriver) {
      subscribeToDriver(initialDriver);
    } else {
      subscribeToAll();
    }
  };

  // If the selected event is updated in the events list, update the selectedEvent
  useEffect(() => {
    if (selectedEvent) {
      const updatedEvent = events.find((e: DriverBehaviorEvent) => e.id === selectedEvent.id);
      if (updatedEvent && JSON.stringify(updatedEvent) !== JSON.stringify(selectedEvent)) {
        setSelectedEvent(updatedEvent);
      }
    }
  }, [events, selectedEvent]);

  // Value to provide to context consumers
  const value: DriverBehaviorContextType = {
    events,
    loading,
    error,
    webBookEvents,
    selectedEvent,
    setSelectedEvent,
    filterEvents,
    addEvent,
    updateEvent,
    subscribeToDriver,
    refreshData,
  };

  return <DriverBehaviorContext.Provider value={value}>{children}</DriverBehaviorContext.Provider>;
};

// Custom hook for using the driver behavior context
export const useDriverBehaviorContext = () => useContext(DriverBehaviorContext);
// Backward-compatible alias: pages expecting useDriverBehavior can import this directly.
export const useDriverBehavior = () => useDriverBehaviorContext();
