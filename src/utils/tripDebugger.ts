/**
 * Trip Debugging Utility
 * 
 * This utility provides functions to help diagnose issues with trip data,
 * particularly focusing on trip status and visibility problems.
 */

import { Trip } from '../types';

/**
 * Analyzes trip data to identify potential issues with trip status filtering
 * @param trips Array of all trips from the database
 * @returns Debugging information about the trips
 */
export const analyzeTripData = (trips: Trip[]) => {
  if (!trips || trips.length === 0) {
    console.warn('No trips available to analyze');
    return {
      totalTrips: 0,
      activeTrips: 0,
      completedTrips: 0,
      otherStatusTrips: 0,
      statusDistribution: {},
      missingStatusTrips: 0,
      potentialIssues: ['No trips found in the dataset']
    };
  }

  // Count trips by status
  const statusDistribution: Record<string, number> = {};
  let missingStatusTrips = 0;
  let incorrectStatusTypeTrips = 0;

  trips.forEach(trip => {
    if (!trip.status) {
      missingStatusTrips++;
      return;
    }

    // Check if status is a string - correct type but might have unexpected values
    if (typeof trip.status !== 'string') {
      incorrectStatusTypeTrips++;
      return;
    }

    // Count all statuses including unexpected ones
    const status = trip.status.toString();
    statusDistribution[status] = (statusDistribution[status] || 0) + 1;
  });

  // Identify potential issues
  const potentialIssues = [];
  
  if (missingStatusTrips > 0) {
    potentialIssues.push(`${missingStatusTrips} trips missing status field`);
  }
  
  if (incorrectStatusTypeTrips > 0) {
    potentialIssues.push(`${incorrectStatusTypeTrips} trips have status that is not a string`);
  }
  
  if (statusDistribution['active'] === 0 && trips.length > 0) {
    potentialIssues.push('No trips with status "active" found but there are trips in the database');
  }

  // Check for case mismatches like "Active" instead of "active"
  const unexpectedStatuses = Object.keys(statusDistribution).filter(
    status => !['active', 'completed', 'invoiced', 'paid'].includes(status)
  );
  
  if (unexpectedStatuses.length > 0) {
    potentialIssues.push(`Unexpected status values found: ${unexpectedStatuses.join(', ')}`);
  }

  // Generate report
  return {
    totalTrips: trips.length,
    activeTrips: statusDistribution['active'] || 0,
    completedTrips: statusDistribution['completed'] || 0,
    otherStatusTrips: trips.length - (statusDistribution['active'] || 0) - (statusDistribution['completed'] || 0),
    statusDistribution,
    missingStatusTrips,
    incorrectStatusTypeTrips,
    potentialIssues
  };
};

/**
 * Corrects trip status issues in the provided array
 * @param trips Array of trips to fix
 * @returns Array of corrected trips
 */
export const fixTripStatusIssues = (trips: Trip[]): Trip[] => {
  if (!trips || trips.length === 0) return [];

  return trips.map(trip => {
    const updatedTrip = { ...trip };
    
    // Fix missing status
    if (!updatedTrip.status) {
      console.log(`Fixing missing status for trip ${trip.id}`);
      updatedTrip.status = 'active';
    }
    
    // Fix case sensitivity and map web import statuses
    if (typeof updatedTrip.status === 'string') {
      const status = updatedTrip.status.toLowerCase();
      
      // Map web import statuses to our standard statuses
      const statusMapping: Record<string, 'active' | 'completed' | 'invoiced' | 'paid'> = {
        'active': 'active',
        'completed': 'completed',
        'invoiced': 'invoiced', 
        'paid': 'paid',
        'delivered': 'completed', // Map delivered to completed
        'shipped': 'active', // Map shipped to active
        'in_transit': 'active', // Map in_transit to active
        'pending': 'active', // Map pending to active
        'booked': 'active', // Map booked to active
        'confirmed': 'active' // Map confirmed to active
      };
      
      const mappedStatus = statusMapping[status];
      if (mappedStatus && updatedTrip.status !== mappedStatus) {
        console.log(`Mapping status for trip ${trip.id}: ${updatedTrip.status} -> ${mappedStatus}`);
        updatedTrip.status = mappedStatus;
      }
    }
    
    // Fix client name mapping for web imports
    if (!updatedTrip.clientName && (updatedTrip as any).customer) {
      console.log(`Mapping customer to clientName for trip ${trip.id}`);
      updatedTrip.clientName = (updatedTrip as any).customer;
    }
    
    return updatedTrip;
  });
};

/**
 * Gets trips with specific status, handling edge cases
 * @param trips Array of all trips
 * @param status Desired status ('active', 'completed', etc.)
 * @returns Filtered trips matching the status
 */
export const getTripsByStatus = (trips: Trip[], status: 'active' | 'completed' | 'invoiced' | 'paid'): Trip[] => {
  if (!trips || trips.length === 0) return [];
  
  // First fix any status issues
  const fixedTrips = fixTripStatusIssues(trips);
  
  // Then filter by the requested status
  return fixedTrips.filter(trip => trip.status === status);
};