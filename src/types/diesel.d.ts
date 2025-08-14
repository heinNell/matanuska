export interface DieselConsumptionRecord {
  id: string;
  fleetNumber: string;
  driverName: string;
  date: string;
  litresFilled: number;
  totalCost: number;
  currency?: string;
  fuelStation: string;
  tripId?: string;
  probeReading?: number; // For probe verification
  probeDiscrepancy?: number; // Difference between filled and probe
  probeVerified?: boolean;
  probeVerificationNotes?: string;
  probeVerifiedAt?: string;
  probeVerifiedBy?: string;
  hoursOperated?: number;
  litresPerHour?: number;
  rootCause?: string;
  actionTaken?: string;
  // Add other fields as needed based on your usage
}
