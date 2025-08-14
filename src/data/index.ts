// Main export file to maintain backward compatibility
export type { FleetStats, Vehicle, VehicleFilters } from "../types/vehicle";
export { FLEET_VEHICLES } from "./fleetVehicles";
export { filterVehicles, getFleetStats, searchVehicles } from "./vehicles";

// Added exports for trips, tyre, and workshop data
export * from "./inspectionTemplates";
export * from "./tyreData";
// export * from './workshopJobCard'; // file no longer present

// Additional utility exports can be added here if needed
