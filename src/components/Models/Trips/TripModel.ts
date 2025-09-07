// TripModel.ts - Domain model for Trip Management
import { Trip } from '../../../types';

// Re-export the types
export type { Trip };

// Import Firebase functions related to trips
import {
  addTripToFirebase,
  updateTripInFirebase,
  deleteTripFromFirebase
} from '../../../firebase';

// Re-export the functions
export {
  addTripToFirebase,
  updateTripInFirebase,
  deleteTripFromFirebase
};

// Additional helper methods for the domain
export class TripService {
  // Calculate estimated trip duration
  static calculateEstimatedDuration(_origin: string, _destination: string, avgSpeed = 70): number {
    // Placeholder: assume a nominal 300 km trip and estimate time by avgSpeed,
    // with a small random jitter; clamp result between 2 and 8 hours.
    const nominalDistanceKm = 300;
    const baseHours = nominalDistanceKm / Math.max(1, avgSpeed);
    const jitter = (Math.random() - 0.5); // +/- 0.5 hours
    const estimate = Math.round(baseHours + jitter);
    return Math.min(8, Math.max(2, estimate));
  }

  // Format trip duration from minutes to hours and minutes
  static formatDuration(durationMinutes: number): string {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  }

  // Calculate estimated fuel consumption
  static calculateEstimatedFuelConsumption(distance: number, avgConsumption = 30): number {
    // avgConsumption in liters per 100km
    return (distance / 100) * avgConsumption;
  }

  // Generate a new trip number
  static generateTripNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TR-${year}-${random}`;
  }
}
