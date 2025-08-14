// Compatibility shim: re-export canonical Tyre type and listener to avoid duplicate type definitions.
export type { Tyre } from "./tyre";
export { listenToTyres } from "./tyreStores";

// Deprecated interfaces maintained temporarily for backward compatibility.
// Prefer importing from './tyre' moving forward.
export interface Vehicle {
  id: string;
  registration: string;
  model: string;
}

export interface Assignment {
  id: string;
  tyreId: string;
  vehicleId: string;
  assignedAt: Date;
  vehicle: Vehicle;
  // Use canonical Tyre type here
  tyre: import("./tyre").Tyre;
}
