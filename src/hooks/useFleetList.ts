import { useMemo } from 'react';
import { FLEET_VEHICLES } from '../data/fleetVehicles';
import { Vehicle } from '../types/vehicle';

export interface FleetOption {
  value: string;
  label: string;
  registration: string;
  type: string;
  status: string;
  details?: Vehicle;
}

export function useFleetList(options?: {
  onlyActive?: boolean;
  filterType?: 'Truck' | 'Trailer' | 'Reefer' | string[];
  includeDetails?: boolean;
}) {
  const fleetOptions = useMemo(() => {
    let vehicles = [...FLEET_VEHICLES];
    
    // Filter by status if onlyActive is true
    if (options?.onlyActive) {
      vehicles = vehicles.filter(v => v.status === 'active');
    }
    
    // Filter by type
    if (options?.filterType) {
      if (Array.isArray(options.filterType)) {
        vehicles = vehicles.filter(v => options.filterType!.includes(v.category));
      } else {
        // Map string types to our vehicle categories
        const categoryMap: Record<string, string> = {
          'Truck': 'truck',
          'Trailer': 'trailer',
          'Reefer': 'reefer'
        };
        const category = categoryMap[options.filterType] || options.filterType.toLowerCase();
        vehicles = vehicles.filter(v => v.category === category);
      }
    }
    
    // Map to dropdown options
    return vehicles.map(vehicle => ({
      value: vehicle.fleetNo,
      label: `${vehicle.fleetNo} - ${vehicle.manufacturer} ${vehicle.model}`,
      registration: vehicle.registrationNo,
      type: vehicle.category,
      status: vehicle.status,
      ...(options?.includeDetails ? { details: vehicle } : {})
    }));
  }, [options?.onlyActive, options?.filterType, options?.includeDetails]);

  // Return all fleet options and helper methods
  return {
    fleetOptions,
    getFleetById: (id: string) => fleetOptions.find((f: FleetOption) => f.value === id),
    getAllFleetNumbers: () => fleetOptions.map((f: FleetOption) => f.value),
    getRegistrationByFleetNumber: (fleetNo: string) => {
      const fleet = fleetOptions.find((f: FleetOption) => f.value === fleetNo);
      return fleet ? fleet.registration : '';
    },
    isValidFleetNumber: (fleetNo: string) => fleetOptions.some((f: FleetOption) => f.value === fleetNo)
  };
}
