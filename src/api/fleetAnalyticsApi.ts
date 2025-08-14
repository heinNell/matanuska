import {
  costAnalysisData,
  fleetAnalyticsData,
  fleetStatusData,
  fleetUtilizationData,
  monthlyROIData,
  performanceData,
  vehicleUtilizationData,
} from "../data/fleetAnalyticsData";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Filter data by date range
const filterByDateRange = (data: any[], startDate: Date, endDate: Date, dateField = "date") => {
  return data.filter((item) => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= startDate && itemDate <= endDate;
  });
};

// Simulate API endpoints for fleet analytics data
export const api = {
  async fetchFleetStatus(filters: string[] = [], startDate?: Date, endDate?: Date) {
    // Simulate network request
    await delay(500);

    // In a real application, you would apply filters and date range
    // For this simulation, we'll just return the static data
    return fleetStatusData;
  },

  async fetchMonthlyROI(filters: string[] = [], startDate?: Date, endDate?: Date) {
    await delay(600);

    // Apply date filtering if dates are provided
    let data = [...monthlyROIData];

    // Filter by specific data points if needed
    // In a real application, this would be handled by the backend
    if (filters.length > 0 && !filters.includes("roi")) {
      // Return empty data if roi filter not selected
      return [];
    }

    return data;
  },

  async fetchFleetUtilization(filters: string[] = [], startDate?: Date, endDate?: Date) {
    await delay(550);

    // Filter by specific data points
    if (filters.length > 0 && !filters.includes("utilization")) {
      // Return empty data if utilization filter not selected
      return [];
    }

    return fleetUtilizationData;
  },

  async fetchPerformanceData(filters: string[] = [], startDate?: Date, endDate?: Date) {
    await delay(700);

    let filteredData = [...performanceData];

    // Apply filters - this would be done server-side in a real app
    if (filters.length > 0) {
      const includesFuel = filters.includes("fuelConsumption");
      const includesMaintenance = filters.includes("maintenance");

      if (!includesFuel && !includesMaintenance) {
        return [];
      }

      // If only one metric is selected, zero out the other one
      filteredData = filteredData.map((item) => ({
        ...item,
        fuelEfficiency: includesFuel ? item.fuelEfficiency : 0,
        maintenanceCost: includesMaintenance ? item.maintenanceCost : 0,
      }));
    }

    return filteredData;
  },

  async fetchCostAnalysisData(filters: string[] = [], startDate?: Date, endDate?: Date) {
    await delay(650);

    let data = [...costAnalysisData];

    // Apply date range filtering
    if (startDate && endDate) {
      data = filterByDateRange(data, startDate, endDate);
    }

    return data;
  },

  async fetchFleetAnalyticsData(filters: string[] = [], startDate?: Date, endDate?: Date) {
    await delay(800);

    let data = [...fleetAnalyticsData];

    // Apply date range filtering
    if (startDate && endDate) {
      data = filterByDateRange(data, startDate, endDate);
    }

    // Filter metrics based on active filters
    if (filters.length > 0) {
      const includesFuel = filters.includes("fuelConsumption");
      const includesMaintenance = filters.includes("maintenance");
      const includesROI = filters.includes("roi");

      // Apply filters by zeroing out non-selected metrics
      data = data.map((item) => ({
        ...item,
        fuel: includesFuel ? item.fuel : 0,
        maintenance: includesMaintenance ? item.maintenance : 0,
        roi: includesROI ? item.roi : 0,
      }));
    }

    return data;
  },

  async fetchVehicleUtilizationData(filters: string[] = [], startDate?: Date, endDate?: Date) {
    await delay(700);

    let data = [...vehicleUtilizationData];

    // Apply date range filtering
    if (startDate && endDate) {
      data = filterByDateRange(data, startDate, endDate);
    }

    return data;
  },

  // Fetch all data at once
  async fetchAllAnalyticsData(filters: string[] = [], startDate?: Date, endDate?: Date) {
    try {
      const [
        fleetStatus,
        monthlyROI,
        fleetUtilization,
        performance,
        costAnalysis,
        fleetAnalytics,
        vehicleUtilization,
      ] = await Promise.all([
        this.fetchFleetStatus(filters, startDate, endDate),
        this.fetchMonthlyROI(filters, startDate, endDate),
        this.fetchFleetUtilization(filters, startDate, endDate),
        this.fetchPerformanceData(filters, startDate, endDate),
        this.fetchCostAnalysisData(filters, startDate, endDate),
        this.fetchFleetAnalyticsData(filters, startDate, endDate),
        this.fetchVehicleUtilizationData(filters, startDate, endDate),
      ]);

      return {
        fleetStatus,
        monthlyROI,
        fleetUtilization,
        performance,
        costAnalysis,
        fleetAnalytics,
        vehicleUtilization,
      };
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      throw error;
    }
  },
};

export default api;
