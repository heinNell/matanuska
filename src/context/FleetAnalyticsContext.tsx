import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "../api/fleetAnalyticsApi";

// Define the shape of our analytics state
interface FleetAnalyticsState {
  fleetStatus: {
    total: number;
    operational: number;
    maintenance: number;
    percentOperational: number;
  };
  monthlyROI: Array<{
    month: string;
    roi: number;
  }>;
  fleetUtilization: Array<{
    month: string;
    utilization: number;
  }>;
  performance: Array<{
    month: string;
    fuelEfficiency: number;
    maintenanceCost: number;
  }>;
  costAnalysis: Array<{
    date: string;
    operations: number;
    maintenance: number;
  }>;
  fleetAnalytics: Array<{
    date: string;
    fuel: number;
    maintenance: number;
    roi: number;
  }>;
  vehicleUtilization: Array<{
    date: string;
    idleTime: number;
    activeTime: number;
  }>;
  // For data filtering functionality
  activeFilters: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  // Loading states
  isLoading: boolean;
  error: string | null;
}

interface FleetAnalyticsContextValue extends FleetAnalyticsState {
  // Action methods
  updateFilters: (filters: string[]) => void;
  updateDateRange: (start: Date, end: Date) => void;
  refreshData: () => Promise<void>;
}

// Create the context
const FleetAnalyticsContext = createContext<FleetAnalyticsContextValue | undefined>(undefined);

// Create a provider component
interface FleetAnalyticsProviderProps {
  children: ReactNode;
}

export const FleetAnalyticsProvider: React.FC<FleetAnalyticsProviderProps> = ({ children }) => {
  // Initial state
  const [state, setState] = useState<FleetAnalyticsState>({
    fleetStatus: {
      total: 0,
      operational: 0,
      maintenance: 0,
      percentOperational: 0,
    },
    monthlyROI: [],
    fleetUtilization: [],
    performance: [],
    costAnalysis: [],
    fleetAnalytics: [],
    vehicleUtilization: [],
    activeFilters: ["fuelConsumption", "maintenance", "utilization"],
    dateRange: {
      start: new Date(2025, 0, 1), // Jan 1, 2025
      end: new Date(2025, 6, 31), // July 31, 2025
    },
    isLoading: true,
    error: null,
  });

  // Fetch all data on mount and when filters or date range changes
  useEffect(() => {
    refreshData();
  }, [state.activeFilters, state.dateRange.start, state.dateRange.end]);

  // Update filters and trigger a refresh
  const updateFilters = (filters: string[]) => {
    setState((prev) => ({
      ...prev,
      activeFilters: filters,
    }));
  };

  // Update date range and trigger a refresh
  const updateDateRange = (start: Date, end: Date) => {
    setState((prev) => ({
      ...prev,
      dateRange: { start, end },
    }));
  };

  // Refresh data by fetching from our API
  const refreshData = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await api.fetchAllAnalyticsData(
        state.activeFilters,
        state.dateRange.start,
        state.dateRange.end
      );

      setState((prev) => ({
        ...prev,
        ...data,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to load analytics data",
      }));
    }
  };

  // Value object
  const value = {
    ...state,
    updateFilters,
    updateDateRange,
    refreshData,
  };

  return <FleetAnalyticsContext.Provider value={value}>{children}</FleetAnalyticsContext.Provider>;
};

// Custom hook to use the context
export const useFleetAnalytics = () => {
  const context = useContext(FleetAnalyticsContext);
  if (context === undefined) {
    throw new Error("useFleetAnalytics must be used within a FleetAnalyticsProvider");
  }
  return context;
};


