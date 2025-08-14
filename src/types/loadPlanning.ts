export interface LoadPlan {
  id: string;
  tripId: string;
  vehicleCapacity: {
    weight: number;
    volume: number;
    length: number;
    width: number;
    height: number;
  };
  cargoItems: CargoItem[];
  utilisationRate: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CargoItem {
  id: string;
  description: string;
  weight: number;
  volume: number;
  quantity: number;
  stackable: boolean;
  hazardous: boolean;
  category: string;
  priorityLevel: 'low' | 'medium' | 'high';
}

export const LOAD_CATEGORIES = [
  { label: 'General Cargo', value: 'general_cargo' },
  { label: 'Palletized Goods', value: 'palletized' },
  { label: 'Bulk Materials', value: 'bulk' },
  { label: 'Hazardous Materials', value: 'hazardous' },
  { label: 'Temperature Controlled', value: 'temperature_controlled' },
  { label: 'Fragile Items', value: 'fragile' },
  { label: 'Heavy Machinery', value: 'heavy_machinery' },
  { label: 'Containers', value: 'containers' },
  { label: 'Liquids', value: 'liquids' },
  { label: 'Other', value: 'other' }
];
