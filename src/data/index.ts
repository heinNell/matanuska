// Main export file to maintain backward compatibility
export type { FleetStats, Vehicle, VehicleFilters } from "../types/vehicle";
export { FLEET_VEHICLES } from "../types/fleetVehicles.js";
export { filterVehicles, getFleetStats, searchVehicles } from "../types/vehicles.js";

// Added exports for trips, tyre, and workshop data
export * from "../types/inspectionTemplates.js";
export * from "../types/tyreData.js";
// export * from './workshopJobCard'; // file no longer present

// Additional utility exports can be added here if needed
