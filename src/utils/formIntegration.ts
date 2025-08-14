// src/utils/formIntegration.ts
/**
 * Form Integration Utility
 *
 * This utility provides a centralized approach to connecting forms with Firestore data.
 * It ensures consistent data handling across the application by providing:
 *
 * 1. Standard form select       } catch (err: any) {
        setError(err);
        logError(err,      } catch (err: any) {
        setError(err);
        logError(err, {
          context:       } else {
        // Queue operation for offline mode
        if (syncContext.queueOperation) {
          syncContext.queueOperation({
            type: id ? 'update' : 'add',
            collection: collectionName,
            id,
            data: {
              ...data,
              updatedAt: new Date().toISOString(),
              ...(id ? {} : { createdAt: new Date().toISOString() })
            }
          });
        }      setError(err);
      logError(err, {
        context: { action: `${id ? 'Updating' : 'Creating'} document in ${collectionName}` },
        severity: ErrorSeverity.ERROR
      }); positions for vehicle type: ${vehicleType}` },
          severity: ErrorSeverity.WARNING
        });      context: { action: `Loading tyre patterns for brand: ${brand}, size: ${size}` },
          severity: ErrorSeverity.WARNING
        }); loading from Firestore collections
 * 2. Form submission handlers with validation
 * 3. Consistent error handling
 * 4. Offline supp      } else {
        // Queue operation for offline mode
        syncContext.queueOperation && syncContext.queueOperation({
          type: id ? 'update' : 'add',
          collection: collectionName,
          id,
          data: {
            ...data,
            updatedAt: new Date().toISOString(),
            ...(id ? {} : { createdAt: new Date().toISOString() })
          }
        });
      }yncContext
 */

import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useSyncContext } from "../context/SyncContext";
import { db } from "../firebase";
import { ErrorSeverity, logError } from "./errorHandling";

// Types
export interface SelectOption {
  value: string;
  label: string;
}

export interface FormIntegrationOptions {
  collection: string;
  labelField?: string;
  valueField?: string;
  filterField?: string;
  filterValue?: any;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  limitResults?: number;
  transform?: (item: any) => SelectOption;
}

/**
 * Custom hook to load select options from Firestore
 */
export const useFirestoreOptions = (
  options: FormIntegrationOptions
): {
  options: SelectOption[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
} => {
  const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const syncContext = useSyncContext();
  const isOnline = syncContext.isOnline;

  const {
    collection: collectionName,
    labelField = "name",
    valueField = "id",
    filterField,
    filterValue,
    sortField,
    sortDirection = "asc",
    limitResults,
    transform,
  } = options;

  const loadOptions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let q = query(collection(db, collectionName));

      // Apply filter if specified
      if (filterField && filterValue !== undefined) {
        q = query(q, where(filterField, "==", filterValue));
      }

      // Apply sort if specified
      if (sortField) {
        q = query(q, orderBy(sortField, sortDirection));
      }

      // Apply limit if specified
      if (limitResults) {
        q = query(q, limit(limitResults));
      }

      const querySnapshot = await getDocs(q);

      const options: SelectOption[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        if (transform) {
          return transform(data);
        }
        return {
          value: data[valueField] || doc.id,
          label: data[labelField] || doc.id,
        };
      });

      setSelectOptions(options);
    } catch (err: any) {
      setError(err);
      logError(err, {
        context: { action: `Loading options from ${collectionName}` },
        severity: ErrorSeverity.WARNING,
      });
    } finally {
      setLoading(false);
    }
  }, [
    collectionName,
    labelField,
    valueField,
    filterField,
    filterValue,
    sortField,
    sortDirection,
    limitResults,
    transform,
  ]);

  // Load options when the component mounts or dependencies change
  useEffect(() => {
    if (isOnline) {
      loadOptions();
    } else {
      // Handle offline scenario
      setSelectOptions([]);
      setLoading(false);
      setError(new Error("Unable to load options while offline"));
    }
  }, [isOnline, loadOptions]);

  return {
    options: selectOptions,
    loading,
    error,
    refresh: loadOptions,
  };
};

/**
 * Get route distance options from Firestore
 */
export const useRouteOptions = () => {
  return useFirestoreOptions({
    collection: "routeDistances",
    labelField: "route",
    valueField: "route",
    sortField: "route",
  });
};

/**
 * Get fleet vehicle options from Firestore
 */
export const useFleetOptions = (vehicleType?: string) => {
  const options: FormIntegrationOptions = {
    collection: "fleet",
    labelField: "registrationNumber",
    valueField: "fleetNumber",
    sortField: "fleetNumber",
  };

  // Add filter for vehicle type if specified
  if (vehicleType) {
    options.filterField = "vehicleType";
    options.filterValue = vehicleType;
  }

  return useFirestoreOptions(options);
};

/**
 * Get tyre brand options from Firestore
 */
export const useTyreBrandOptions = () => {
  return useFirestoreOptions({
    collection: "tyreBrands",
    labelField: "name",
    valueField: "name",
    sortField: "name",
  });
};

/**
 * Get tyre size options from Firestore
 */
export const useTyreSizeOptions = () => {
  return useFirestoreOptions({
    collection: "tyreSizes",
    labelField: "size",
    valueField: "size",
    sortField: "size",
  });
};

/**
 * Get tyre pattern options from Firestore based on brand and size
 */
export const useTyrePatternOptions = (brand?: string, size?: string) => {
  const [patternOptions, setPatternOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const syncContext = useSyncContext();
  const isOnline = syncContext.isOnline;

  useEffect(() => {
    const loadPatterns = async () => {
      if (!brand || !size) {
        setPatternOptions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let q = query(
          collection(db, "tyrePatterns"),
          where("brand", "==", brand),
          where("size", "==", size)
        );

        const querySnapshot = await getDocs(q);

        const options: SelectOption[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            value: data.pattern || "standard",
            label: data.pattern
              ? `${data.pattern} (${data.position})`
              : `Standard (${data.position})`,
          };
        });

        setPatternOptions(options);
      } catch (err: any) {
        setError(err);
        logError(err, {
          context: { action: `Loading tyre patterns for brand: ${brand}, size: ${size}` },
          severity: ErrorSeverity.WARNING,
        });
      } finally {
        setLoading(false);
      }
    };

    if (isOnline) {
      loadPatterns();
    } else {
      setPatternOptions([]);
      setLoading(false);
      setError(new Error("Unable to load options while offline"));
    }
  }, [brand, size, isOnline]);

  return {
    options: patternOptions,
    loading,
    error,
  };
};

/**
 * Get vehicle position options based on vehicle type
 */
export const useVehiclePositionOptions = (vehicleType: string) => {
  const [positions, setPositions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const syncContext = useSyncContext();
  const isOnline = syncContext.isOnline;

  useEffect(() => {
    const loadPositions = async () => {
      if (!vehicleType) {
        setPositions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const docRef = doc(db, "vehiclePositions", vehicleType);
        const docSnap = await getDocs(
          query(collection(db, "vehiclePositions"), where("vehicleType", "==", vehicleType))
        );

        if (!docSnap.empty) {
          const data = docSnap.docs[0].data();
          const positionOptions = data.positions.map((pos: any) => ({
            value: pos.id,
            label: pos.name,
          }));
          setPositions(positionOptions);
        } else {
          setPositions([]);
          setError(new Error(`No positions found for vehicle type: ${vehicleType}`));
        }
      } catch (err: any) {
        setError(err);
        logError(err, {
          context: { action: `Loading positions for vehicle type: ${vehicleType}` },
          severity: ErrorSeverity.WARNING,
        });
      } finally {
        setLoading(false);
      }
    };

    if (isOnline) {
      loadPositions();
    } else {
      setPositions([]);
      setLoading(false);
      setError(new Error("Unable to load options while offline"));
    }
  }, [vehicleType, isOnline]);

  return {
    options: positions,
    loading,
    error,
  };
};

/**
 * Get inventory stock items by store
 */
export const useInventoryOptions = (storeName?: string) => {
  const options: FormIntegrationOptions = {
    collection: "stockInventory",
    labelField: "StockDescription",
    valueField: "StockCde",
    sortField: "StockDescription",
    transform: (item) => ({
      value: item.StockCde,
      label: `${item.StockDescription} (${item.StockQty} in stock)`,
    }),
  };

  // Add filter for store name if specified
  if (storeName) {
    options.filterField = "StoreName";
    options.filterValue = storeName;
  }

  return useFirestoreOptions(options);
};

/**
 * Form submission handler with validation and offline support
 */
export const useFormSubmit = (collectionName: string) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const syncContext = useSyncContext();
  const { isOnline } = syncContext;

  const submitForm = async (data: any, id?: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (isOnline) {
        // Online submission
        if (id) {
          // Update existing document
          const docRef = doc(db, collectionName, id);
          await updateDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString(),
          });
        } else {
          // Create new document
          await addDoc(collection(db, collectionName), {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        // Queue operation for offline mode - not implemented yet
        console.warn(
          `Cannot ${id ? "update" : "create"} document in ${collectionName} while offline`
        );
        // Store in localStorage for potential future implementation
        const pendingOps = JSON.parse(localStorage.getItem("pendingFormOperations") || "[]");
        pendingOps.push({
          type: id ? "update" : "add",
          collection: collectionName,
          id,
          data: {
            ...data,
            updatedAt: new Date().toISOString(),
            ...(id ? {} : { createdAt: new Date().toISOString() }),
          },
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem("pendingFormOperations", JSON.stringify(pendingOps));
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err);
      logError(err, {
        context: { action: `${id ? "Updating" : "Creating"} document in ${collectionName}` },
        severity: ErrorSeverity.ERROR,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    submitForm,
    loading,
    error,
    success,
    reset: () => {
      setError(null);
      setSuccess(false);
    },
  };
};

/**
 * Form validation utility
 */
export const validateForm = (
  data: any,
  schema: any
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let isValid = true;

  Object.keys(schema).forEach((field) => {
    const { required, min, max, pattern, validate } = schema[field];
    const value = data[field];

    // Check required fields
    if (required && (value === undefined || value === null || value === "")) {
      errors[field] = "This field is required";
      isValid = false;
    }

    // Skip other validations if value is empty and not required
    if (value === undefined || value === null || value === "") {
      return;
    }

    // Validate min/max for strings (length) or numbers
    if (min !== undefined) {
      if (typeof value === "string" && value.length < min) {
        errors[field] = `Must be at least ${min} characters`;
        isValid = false;
      } else if (typeof value === "number" && value < min) {
        errors[field] = `Must be at least ${min}`;
        isValid = false;
      }
    }

    if (max !== undefined) {
      if (typeof value === "string" && value.length > max) {
        errors[field] = `Must be at most ${max} characters`;
        isValid = false;
      } else if (typeof value === "number" && value > max) {
        errors[field] = `Must be at most ${max}`;
        isValid = false;
      }
    }

    // Validate pattern (regex)
    if (pattern && typeof value === "string") {
      if (!pattern.test(value)) {
        errors[field] = "Invalid format";
        isValid = false;
      }
    }

    // Custom validation
    if (validate && typeof validate === "function") {
      const customError = validate(value, data);
      if (customError) {
        errors[field] = customError;
        isValid = false;
      }
    }
  });

  return { isValid, errors };
};
