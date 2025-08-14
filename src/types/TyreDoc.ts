// src/types/tyres.ts
export interface TyreLocation {
  warehouseId: string;
  section: string;
  shelf: string;
  position: string;
  status: "in-stock" | "assigned" | "in-service" | "scrapped";
}

export interface TyreInspection {
  date: Date | string;
  treadDepth: number;
  inspector: string;
  notes?: string;
  condition: "good" | "fair" | "poor" | "unusable";
}

export interface TyreDoc {
  id: string;
  brand: string;
  model: string;
  serialNumber: string;
  size: string;
  pattern: string;
  status: string;
  purchaseDate: Date | string;
  purchasePrice: number;
  treadDepth: number;
  lastInspection: Date | string;
  manufacturingDate: Date | string;
  dotCode: string;
  loadIndex: number;
  speedRating: string;
  plyRating: string;
  season: "summer" | "winter" | "all-season";
  comments?: string;
  position?: string;

  // Required location property
  location: TyreLocation;

  // Optional fields
  assignedVehicle?: string;
  inspectionHistory?: TyreInspection[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
