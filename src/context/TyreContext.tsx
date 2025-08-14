import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import type {
  Tyre,
  TyreInspection, // Import TyrePosition
  TyreInspectionRecord, // Ensure TyreRepair is imported
  TyrePosition, // Import the new TyreInspectionRecord
  TyreStoreLocation,
} from "../types/tyre"; // All types should now come from here
import {
  addTyreInspection as addTyreInspectionToFirebase,
  deleteTyre,
  getTyreById, // Renamed to avoid conflict
  getTyreInspections as getTyreInspectionsFromFirebase,
  getTyres, // Renamed to avoid conflict
  getTyresByVehicle,
  listenToTyres,
  saveTyre,
} from "../types/tyreStores";

interface TyreContextType {
  tyres: Tyre[];
  loading: boolean;
  error: Error | null;
  saveTyre: (tyre: Tyre) => Promise<string>;
  getTyreById: (id: string) => Promise<Tyre | null>;
  deleteTyre: (id: string) => Promise<void>;
  // addInspection now expects a TyreInspectionRecord to provide full context to Firebase
  addInspection: (inspection: TyreInspectionRecord) => Promise<string>;
  // getInspections now returns the simpler TyreInspection type
  getInspections: (tyreId: string) => Promise<TyreInspection[]>;
  getTyresByVehicle: (vehicleId: string) => Promise<Tyre[]>;
  filterTyres: (filters: {
    status?: Tyre["status"];
    mountStatus?: Tyre["mountStatus"];
    brand?: string;
    location?: Tyre["location"];
    vehicleId?: string;
    condition?: TyreInspection["condition"]; // This refers to the condition string from TyreInspection
    minTreadDepth?: number;
    maxTreadDepth?: number;
  }) => Promise<Tyre[]>;
  // UI filtering state
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  statusFilter: string;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  brandFilter: string;
  setBrandFilter: React.Dispatch<React.SetStateAction<string>>;
  uiRecords: any[];
}
const TyreContext = createContext<TyreContextType | undefined>(undefined);

export const TyreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tyres, setTyres] = useState<Tyre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Add UI filtering state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [uiRecords, setUiRecords] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    // Listen to real-time updates from Firebase
    const unsubscribe = listenToTyres((updatedTyres: Tyre[]) => {
      // Map and normalize the incoming tyre data to ensure type consistency
      const mappedTyres = updatedTyres.map((tyre) => ({
        ...tyre,
        // Ensure installation position is correctly typed as TyrePosition
        installation: tyre.installation
          ? {
              ...tyre.installation,
              position: tyre.installation.position as TyrePosition,
            }
          : undefined,
        maintenanceHistory: {
          ...tyre.maintenanceHistory,
          // Map rotations to ensure 'id' is present and positions are TyrePosition
          rotations:
            tyre.maintenanceHistory?.rotations?.map((r: any, i) => ({
              // Cast 'r' to 'any' for initial access
              ...r,
              id: r.id || `rotation-${tyre.id}-${i}`, // Provide a fallback ID
              fromPosition: r.fromPosition as TyrePosition,
              toPosition: r.toPosition as TyrePosition,
            })) || [],
          // Map repairs to ensure 'id' is present
          repairs:
            tyre.maintenanceHistory?.repairs?.map((r: any, i) => ({
              // Cast 'r' to 'any' for initial access
              ...r,
              id: r.id || `repair-${tyre.id}-${i}`, // Provide a fallback ID
            })) || [],
          // Map inspections to ensure 'id' is present
          inspections:
            tyre.maintenanceHistory?.inspections?.map((i: any, idx) => ({
              // Cast 'i' to 'any' for initial access
              ...i,
              id: i.id || `inspection-${tyre.id}-${idx}`, // Provide a fallback ID
            })) || [],
        },
        // Ensure location is correctly typed as TyreStoreLocation
        location: tyre.location as TyreStoreLocation,
      }));
      setTyres(mappedTyres);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveTyre = async (tyre: Tyre): Promise<string> => {
    try {
      // Ensure the tyre object passed to Firebase matches the expected structure
      return await saveTyre(tyre);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error saving tyre"));
      throw err;
    }
  };

  const handleGetTyreById = async (id: string): Promise<Tyre | null> => {
    try {
      const result = await getTyreById(id);
      if (!result) return null;
      // Normalize the retrieved tyre data
      return {
        ...result,
        installation: result.installation
          ? {
              ...result.installation,
              position: result.installation.position as TyrePosition,
            }
          : undefined,
        maintenanceHistory: {
          ...result.maintenanceHistory,
          rotations:
            result.maintenanceHistory?.rotations?.map((r: any, i) => ({
              ...r,
              id: r.id || `rotation-${result.id}-${i}`,
              fromPosition: r.fromPosition as TyrePosition,
              toPosition: r.toPosition as TyrePosition,
            })) || [],
          repairs:
            result.maintenanceHistory?.repairs?.map((r: any, i) => ({
              ...r,
              id: r.id || `repair-${result.id}-${i}`,
            })) || [],
          inspections:
            result.maintenanceHistory?.inspections?.map((i: any, idx) => ({
              ...i,
              id: i.id || `inspection-${result.id}-${idx}`,
            })) || [],
        },
        location: result.location as TyreStoreLocation,
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error getting tyre"));
      throw err;
    }
  };

  const handleDeleteTyre = async (id: string): Promise<void> => {
    try {
      await deleteTyre(id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error deleting tyre"));
      throw err;
    }
  };

  // handleAddInspection now takes a TyreInspectionRecord
  const handleAddInspection = async (
    inspectionRecord: TyreInspectionRecord // Expect TyreInspectionRecord here
  ): Promise<string> => {
    try {
      // Pass the full TyreInspectionRecord to the Firebase function.
      // The Firebase function 'addTyreInspection' expects two arguments: tyreId and inspectionRecord.
      // We extract tyreId from the inspectionRecord itself.
      return await addTyreInspectionToFirebase(inspectionRecord.tyreId, inspectionRecord);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error adding inspection"));
      throw err;
    }
  };

  const handleGetInspections = async (tyreId: string): Promise<TyreInspection[]> => {
    try {
      // Firebase function returns TyreInspectionRecord[], map it to TyreInspection[]
      const records = await getTyreInspectionsFromFirebase(tyreId);
      return records.map((r: any, i) => ({
        // Cast 'r' to 'any' for initial access
        id: r.id || `inspection-${tyreId}-${i}`, // Ensure ID is present
        date: r.date,
        inspector: r.inspectorName, // Map inspectorName from record to inspector in TyreInspection
        treadDepth: r.treadDepth,
        pressure: r.pressure,
        temperature: r.temperature,
        condition: r.condition,
        notes: r.notes,
        images: r.images,
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error getting inspections"));
      throw err;
    }
  };

  const handleGetTyresByVehicle = async (vehicleId: string): Promise<Tyre[]> => {
    try {
      const result = await getTyresByVehicle(vehicleId);
      // Normalize the retrieved tyre data
      return result.map((tyre) => ({
        ...tyre,
        installation: tyre.installation
          ? {
              ...tyre.installation,
              position: tyre.installation.position as TyrePosition,
            }
          : undefined,
        maintenanceHistory: {
          ...tyre.maintenanceHistory,
          rotations:
            tyre.maintenanceHistory?.rotations?.map((r: any, i) => ({
              ...r,
              id: r.id || `rotation-${tyre.id}-${i}`,
              fromPosition: r.fromPosition as TyrePosition,
              toPosition: r.toPosition as TyrePosition,
            })) || [],
          repairs:
            tyre.maintenanceHistory?.repairs?.map((r: any, i) => ({
              ...r,
              id: r.id || `repair-${tyre.id}-${i}`,
            })) || [],
          inspections:
            tyre.maintenanceHistory?.inspections?.map((i: any, idx) => ({
              ...i,
              id: i.id || `inspection-${tyre.id}-${idx}`,
            })) || [],
        },
        location: tyre.location as TyreStoreLocation,
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error getting vehicle tyres"));
      throw err;
    }
  };

  const handleFilterTyres = async (filters: {
    status?: Tyre["status"];
    mountStatus?: Tyre["mountStatus"];
    brand?: string;
    location?: Tyre["location"];
    vehicleId?: string;
    condition?: TyreInspection["condition"];
    minTreadDepth?: number;
    maxTreadDepth?: number;
  }): Promise<Tyre[]> => {
    try {
      const tyres = await getTyres(filters);
      // Normalize the retrieved tyre data
      return tyres.map((tyre) => ({
        ...tyre,
        installation: tyre.installation
          ? {
              ...tyre.installation,
              position: tyre.installation.position as TyrePosition,
            }
          : undefined,
        maintenanceHistory: {
          ...tyre.maintenanceHistory,
          rotations:
            tyre.maintenanceHistory?.rotations?.map((r: any, i) => ({
              ...r,
              id: r.id || `rotation-${tyre.id}-${i}`,
              fromPosition: r.fromPosition as TyrePosition,
              toPosition: r.toPosition as TyrePosition,
            })) || [],
          repairs:
            tyre.maintenanceHistory?.repairs?.map((r: any, i) => ({
              ...r,
              id: r.id || `repair-${tyre.id}-${i}`,
            })) || [],
          inspections:
            tyre.maintenanceHistory?.inspections?.map((i: any, idx) => ({
              ...i,
              id: i.id || `inspection-${tyre.id}-${idx}`,
            })) || [],
        },
        location: tyre.location as TyreStoreLocation,
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error filtering tyres"));
      throw err;
    }
  };

  // Transform tyres into UI records when tyres change
  useEffect(() => {
    const newUiRecords = tyres.map((tyre) => ({
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
      kmLimit: tyre.kmRunLimit || 60000,
      treadDepth: tyre.condition?.treadDepth || 0,
      mountStatus: tyre.installation ? "Mounted" : "Not Mounted",
      axlePosition: tyre.installation?.position || "",
      lastInspection: tyre.condition?.lastInspectionDate || "",
      datePurchased: tyre.purchaseDetails?.date || "",
      size: tyre.size ? `${tyre.size.width}/${tyre.size.aspectRatio}R${tyre.size.rimDiameter}` : "",
      pattern: tyre.pattern || "",
    }));

    setUiRecords(newUiRecords);
  }, [tyres]);

  const value: TyreContextType = {
    tyres,
    loading,
    error,
    saveTyre: handleSaveTyre,
    getTyreById: handleGetTyreById,
    deleteTyre: handleDeleteTyre,
    addInspection: handleAddInspection,
    getInspections: handleGetInspections,
    getTyresByVehicle: handleGetTyresByVehicle,
    // Add UI filtering state
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    brandFilter,
    setBrandFilter,
    uiRecords,
    filterTyres: handleFilterTyres,
  };

  return <TyreContext.Provider value={value}>{children}</TyreContext.Provider>;
};

export function useTyres(): TyreContextType {
  const context = useContext(TyreContext);
  if (!context) {
    throw new Error("useTyres must be used within a TyreProvider");
  }
  return context;
}

export const useTyreInventoryContext = () => {
  const context = useContext(TyreContext);
  if (context === undefined) {
    throw new Error("useTyreInventoryContext must be used within a TyreProvider");
  }
  return context;
};
