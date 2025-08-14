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
  static calculateEstimatedDuration(origin: string, destination: string, avgSpeed: number = 70): number {
    // This is a placeholder. In a real implementation, this would use a distance matrix API
    // For now, we'll just return a random duration between 2 and 8 hours
    return Math.floor(Math.random() * 6) + 2;
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
  static calculateEstimatedFuelConsumption(distance: number, avgConsumption: number = 30): number {
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
