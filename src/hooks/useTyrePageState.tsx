import { useState } from "react";
import { useTyres, type Tyre } from "./useTyres";

// Extended Tyre interface that includes properties that might not be in the base Tyre type
export interface ExtendedTyre extends Tyre {
  installation?: {
    vehicleId: string;
    installationDate?: Date;
    position?: string;
  };
  kmRunLimit?: number;
}

// UI Record interface for transformed data
export interface UIRecord {
  id: string;
  tyreNumber: string;
  manufacturer: string;
  condition: "Good" | "Fair" | "Poor";
  status: "In-Service" | "In-Stock" | "Repair" | "Scrap";
  vehicleAssignment: string;
  km: number;
  kmLimit: number;
  treadDepth: number;
  mountStatus: "Mounted" | "Not Mounted";
}

// Hook return type
export interface UseTyrePageStateReturn {
  // Core context data and methods
  tyres: Tyre[];
  loading: boolean;
  error: Error | null;
  addTyre: (tyre: Omit<Tyre, "id">) => Promise<boolean>;
  updateTyre: (id: string, updates: Partial<Tyre>) => Promise<boolean>;
  deleteTyre: (id: string) => Promise<boolean>;

  // UI state
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  brandFilter: string;
  setBrandFilter: (filter: string) => void;

  // UI data transformations
  uiRecords: UIRecord[];
  setUiRecords: (records: UIRecord[]) => void;
}

/**
 * A custom hook that combines TyreContext data with UI-specific state management
 * for tyre management pages
 */
export const useTyrePageState = (): UseTyrePageStateReturn => {
  const { tyres, loading, error, addTyre, updateTyre, deleteTyre: deleteContextTyre } = useTyres();

  // UI State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [uiRecords, setUiRecords] = useState<UIRecord[]>([]);

  // Generate UI records from tyres if needed
  const getUIRecords = (): UIRecord[] => {
    if (!tyres.length) return [];

    return tyres.map((tyre: Tyre): UIRecord => {
      return {
        id: tyre.id,
        tyreNumber: tyre.serialNumber || "",
        manufacturer: tyre.brand || "",
        condition:
          tyre.condition?.status === "good"
            ? "Good"
            : tyre.condition?.status === "critical"
              ? "Poor"
              : "Fair",
        status:
          tyre.status === "in_service"
            ? "In-Service"
            : tyre.status === "new"
              ? "In-Stock"
              : tyre.status === "scrapped"
                ? "Scrap"
                : "Repair",
        vehicleAssignment: tyre.installation?.vehicleId || "",
        km: tyre.kmRun || 0,
        kmLimit: (tyre as ExtendedTyre).kmRunLimit || 60000,
        treadDepth: tyre.condition?.treadDepth || 0,
        mountStatus: tyre.installation ? "Mounted" : "Not Mounted",
      };
    });
  };

  return {
    // Core context data and methods
    tyres,
    loading,
    error,
    addTyre,
    updateTyre,
    deleteTyre: deleteContextTyre,

    // UI state
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    brandFilter,
    setBrandFilter,

    // UI data transformations
    uiRecords: uiRecords.length ? uiRecords : getUIRecords(),
    setUiRecords,
  };
};
