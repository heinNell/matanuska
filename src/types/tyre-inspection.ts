import { TyreConditionStatus } from "./workshop-tyre-inventory";

/**
 * Tyre Inspection Data: for form submission and basic frontend data
 */
export interface TyreInspectionData {
  vehicleId: string;
  position: string;
  inspectorName: string;
  currentOdometer: string;
  previousOdometer: string;
  distanceTraveled: number;
  treadDepth: string;
  pressure: string;
  condition: TyreConditionStatus | "";
  damage: string;
  notes: string;
  voiceNotes: string[];
  photos: string[];
  location: string;
  inspectionDate: string;
  signature: string;
}

/**
 * Tyre Inspection Record: for Firestore/database record
 */
export interface TyreInspectionRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  position: string;
  inspectorName: string;
  currentOdometer: number;
  previousOdometer: number;
  distanceTraveled: number;
  treadDepth: number;
  pressure: number;
  condition: TyreConditionStatus;
  damage: string;
  notes: string;
  photos: string[];
  location: string;
  inspectionDate: string;
  signature: string;
  createdAt: string;
  // Optionally, add costPerKm and remainingTreadLife to the record for quick analytics
  costPerKm?: number;
  remainingTreadLifeKm?: number;
}

/**
 * Helper: Calculate cost per kilometer for a tyre inspection.
 * @param totalCost - total cost of the tyre (number)
 * @param distanceTraveled - distance traveled (number, km)
 * @returns number (cost per km, rounded to 4 decimals)
 */
export function calculateCostPerKm(totalCost: number, distanceTraveled: number): number {
  if (!distanceTraveled || distanceTraveled <= 0) return 0;
  return Number((totalCost / distanceTraveled).toFixed(4));
}

/**
 * Helper: Calculate remaining tread life in km based on current tread, min tread, and average wear per km
 * @param treadDepth - current tread depth in mm
 * @param previousTreadDepth - previous tread depth in mm
 * @param distanceTraveled - distance (km) between inspections
 * @param minimumTread - legal minimum (default 3mm)
 * @returns number (remaining km)
 */
export function calculateRemainingTreadLifeKm(
  treadDepth: number,
  previousTreadDepth: number,
  distanceTraveled: number,
  minimumTread = 3
): number {
  const treadUsed = previousTreadDepth - treadDepth;
  const wearPerKm = distanceTraveled > 0 ? treadUsed / distanceTraveled : 0;
  const remainingTread = treadDepth - minimumTread;
  const remainingKm = wearPerKm > 0 ? remainingTread / wearPerKm : 0;
  return Math.max(remainingKm, 0);
}
