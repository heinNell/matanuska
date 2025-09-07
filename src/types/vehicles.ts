export interface Vehicle {
  id: string;
  status: string;
  type: string;
  series?: string;
  registrationNo?: string;
  mileage?: number;
  fleetNo?: string;
  manufacturer?: string;
  model?: string;
}

export const FLEET_VEHICLES: Vehicle[] = [
  { id: '1', status: 'active', type: 'sedan', series: 'A', registrationNo: 'XYZ 123', mileage: 15000 },
  { id: '2', status: 'inactive', type: 'hatchback', series: 'B', registrationNo: 'ABC 456', mileage: 30000 },
];

export const getFleetStats = (): { total: number; active: number; maintenance: number; outOfService: number; byType: Record<string, number> } => {
  return {
    total: 100,
    active: 80,
    maintenance: 10,
    outOfService: 10,
    byType: { heavy_truck: 50, light_truck: 50 },
  };
};

export const searchVehicles = (query: string): Vehicle[] => {
  return FLEET_VEHICLES.filter(vehicle => vehicle.model?.includes(query));
};

export const filterVehicles = (filters: Record<string, any>): Vehicle[] => {
  return FLEET_VEHICLES.filter(vehicle => {
    return Object.keys(filters).every(key => {
      const value = (vehicle as any)[key];
      return value && filters[key].includes(value);
    });
  });
};
