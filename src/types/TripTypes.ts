import { Trip } from "./index";

export type TripFormData = Omit<Trip, "id" | "costs" | "status" | "additionalCosts">;
