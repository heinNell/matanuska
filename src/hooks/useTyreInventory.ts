import { firestore } from "../firebase";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tyre } from "../types/TyreModel";
import { useTyres } from "./useTyres";

// Define TyreDoc as an alias for Tyre with ID
type TyreDoc = Tyre & { id: string };

export interface TyreInventoryUIRecord {
  id: string;
  tyreNumber: string;
  manufacturer: string;
  condition: "New" | "Good" | "Fair" | "Poor" | "Retreaded";
  status: "In-Service" | "In-Stock" | "Repair" | "Scrap";
  vehicleAssignment: string;
  km: number;
  kmLimit: number;
  treadDepth: number;
  mountStatus: string;
  kmRun?: number;
  kmRunLimit?: number;
  lastInspection?: string;
  datePurchased?: string;
  size?: string;
  pattern?: string;
  axlePosition?: string;
}

interface PendingAdd {
  type: "add";
  tempId: string;
  data: Omit<TyreDoc, "id">;
}

interface PendingUpdate {
  type: "update";
  id: string;
  data: Partial<Omit<TyreDoc, "id">>;
}

interface PendingDelete {
  type: "delete";
  id: string;
}

type PendingOp = PendingAdd | PendingUpdate | PendingDelete;

interface UseTyreInventoryOptions {
  pageSize?: number;
  cacheKey?: string;
  queueKey?: string;
}

export function useTyreInventory(opts: UseTyreInventoryOptions = {}) {
  const { pageSize = 10, cacheKey = "tyres_cache_v1", queueKey = "tyres_op_queue_v1" } = opts;

  // Core state
  const [tyres, setTyres] = useState<TyreDoc[]>([]);
  const [filtered, setFiltered] = useState<TyreDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtering state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");

  // Pagination state
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);
  const [totalPages, setTotalPages] = useState(1);

  const processingRef = useRef(false);

  const { tyres: liveTyres, loading: tyresLoading, error: tyresError } = useTyres();

  // --- Offline Queue Helpers ---
  const loadQueue = (): PendingOp[] => {
    try {
      return JSON.parse(localStorage.getItem(queueKey) || "[]");
    } catch {
      return [];
    }
  };

  const saveQueue = (q: PendingOp[]) => localStorage.setItem(queueKey, JSON.stringify(q));

  const enqueue = (op: PendingOp) => {
    const q = loadQueue();
    q.push(op);
    saveQueue(q);
  };

  const processQueue = useCallback(async () => {
    if (!navigator.onLine || processingRef.current) return;
    const q = loadQueue();
    if (!q.length) return;
    processingRef.current = true;
    const remain: PendingOp[] = [];

    for (const op of q) {
      try {
        if (op.type === "add") {
          const ref = await addDoc(collection(firestore, "tyres"), {
            ...op.data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setTyres((prev) => prev.map((t) => (t.id === op.tempId ? { ...t, id: ref.id } : t)));
        } else if (op.type === "update") {
          await updateDoc(doc(firestore, "tyres", op.id), {
            ...op.data,
            updatedAt: new Date().toISOString(),
          });
        } else if (op.type === "delete") {
          await deleteDoc(doc(firestore, "tyres", op.id));
        }
      } catch (e) {
        console.warn("Retry later op failed", op, e);
        remain.push(op);
      }
    }
    saveQueue(remain);
    processingRef.current = false;
  }, [queueKey]);

  // --- Cache helpers ---
  const loadCache = (): TyreDoc[] => {
    try {
      return JSON.parse(localStorage.getItem(cacheKey) || "[]");
    } catch {
      return [];
    }
  };

  const saveCache = (list: TyreDoc[]) => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(list));
    } catch {
      /*ignore*/
    }
  };

  // Update total pages whenever filtered results or itemsPerPage changes
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filtered.length / itemsPerPage)));
    // Reset to first page if current page exceeds new total pages
    if (page > totalPages) {
      setPage(1);
    }
  }, [filtered.length, itemsPerPage, page, totalPages]);

  // Use the tyres data from the useTyres hook
  useEffect(() => {
    if (!tyresLoading) {
      setTyres(liveTyres as TyreDoc[]);
      applyFilters(liveTyres as TyreDoc[], searchTerm, statusFilter, brandFilter, sizeFilter);
      saveCache(liveTyres as TyreDoc[]);
      setLoading(false);
    }
    if (tyresError) {
      setError("Failed to load tyres");
    }
  }, [liveTyres, tyresLoading, tyresError, searchTerm, statusFilter, brandFilter, sizeFilter]);

  // Initial setup from cache
  useEffect(() => {
    const cached = loadCache();
    if (cached.length) {
      setTyres(cached);
      setFiltered(cached);
      setLoading(false);
    }

    window.addEventListener("online", processQueue);
    processQueue();
    return () => {
      window.removeEventListener("online", processQueue);
    };
  }, []);

  const applyFilters = useCallback(
    (
      list: TyreDoc[],
      search = searchTerm,
      status = statusFilter,
      brand = brandFilter,
      size = sizeFilter
    ) => {
      let f = list;
      if (search) {
        const s = search.toLowerCase();
        f = f.filter(
          (t) =>
            t.serialNumber.toLowerCase().includes(s) ||
            t.brand.toLowerCase().includes(s) ||
            t.model?.toLowerCase().includes(s) ||
            (t.installation?.vehicleId || "").toLowerCase().includes(s)
        );
      }
      if (status !== "all") f = f.filter((t) => t.status === status);
      if (brand !== "all") f = f.filter((t) => t.brand === brand);
      if (size !== "all") {
        f = f.filter((t) => {
          const sizeStr = `${t.size.width}/${t.size.aspectRatio}R${t.size.rimDiameter}`;
          return sizeStr === size;
        });
      }
      setFiltered(f);
      setPage(1);
    },
    [searchTerm, statusFilter, brandFilter, sizeFilter]
  );

  // Handlers
  const onSearchChange = (v: string) => {
    setSearchTerm(v);
    applyFilters(tyres, v);
  };

  const onStatusChange = (v: string) => {
    setStatusFilter(v);
    applyFilters(tyres, searchTerm, v);
  };

  const onBrandChange = (v: string) => {
    setBrandFilter(v);
    applyFilters(tyres, searchTerm, statusFilter, v);
  };

  const onSizeChange = (v: string) => {
    setSizeFilter(v);
    applyFilters(tyres, searchTerm, statusFilter, brandFilter, v);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setBrandFilter("all");
    setSizeFilter("all");
    applyFilters(tyres, "", "all", "all", "all");
  };

  // CRUD operations
  const addTyre = async (data: Omit<TyreDoc, "id">) => {
    const tempId = `temp-${Date.now()}`;
    const optimistic: TyreDoc = { id: tempId, ...data } as TyreDoc;
    setTyres((prev) => [optimistic, ...prev]);
    enqueue({ type: "add", tempId, data });
    applyFilters([optimistic, ...tyres]);
    processQueue();
  };

  const updateTyre = async (id: string, data: Partial<Omit<TyreDoc, "id">>) => {
    setTyres((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    enqueue({ type: "update", id, data });
    applyFilters(tyres.map((t) => (t.id === id ? { ...t, ...data } : t)));
    processQueue();
  };

  const deleteTyre = async (id: string) => {
    const backup = tyres;
    setTyres((prev) => prev.filter((t) => t.id !== id));
    enqueue({ type: "delete", id });
    applyFilters(tyres.filter((t) => t.id !== id));
    try {
      await processQueue();
    } catch {
      setTyres(backup);
      applyFilters(backup);
    }
  };

  // Pagination
  const pageItems = useMemo(
    () => filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [filtered, page, itemsPerPage]
  );

  const nextPage = () => setPage((p) => Math.min(totalPages, p + 1));
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const gotoPage = (p: number) => setPage(Math.min(totalPages, Math.max(1, p)));

  // UI mapping
  const uiRecords: TyreInventoryUIRecord[] = useMemo(
    () =>
      filtered.map((t) => ({
        id: t.id,
        tyreNumber: t.serialNumber || t.id,
        manufacturer: t.brand,
        condition: ((): TyreInventoryUIRecord["condition"] => {
          if (t.status === "new") return "New";
          const tread = t.condition?.treadDepth ?? 0;
          if (tread > 10) return "Good";
          if (tread > 6) return "Fair";
          if (tread > 3) return "Poor";
          return "Retreaded";
        })(),
        status: ((): TyreInventoryUIRecord["status"] => {
          switch (t.status) {
            case "new":
              return "In-Stock";
            case "in_service":
              return "In-Service";
            case "retreaded":
            case "spare":
              return "Repair";
            case "scrapped":
              return "Scrap";
            default:
              return "In-Service";
          }
        })(),
        vehicleAssignment: t.installation?.vehicleId || "",
        km: t.kmRun || 0,
        kmLimit: t.kmRunLimit || 60000,
        treadDepth: t.condition?.treadDepth || 0,
        mountStatus: t.installation ? "Mounted" : "Not Mounted",
        axlePosition: t.installation?.position,
        lastInspection: t.condition?.lastInspectionDate,
        datePurchased: t.purchaseDetails?.date,
        size: `${t.size.width}/${t.size.aspectRatio}R${t.size.rimDiameter}`,
        pattern: t.pattern,
      })),
    [filtered]
  );

  return {
    // raw data
    tyres,
    loading,
    error,

    // filtering
    searchTerm,
    statusFilter,
    brandFilter,
    sizeFilter,
    setSearchTerm: onSearchChange,
    setStatusFilter: onStatusChange,
    setBrandFilter: onBrandChange,
    setSizeFilter: onSizeChange,
    clearFilters,

    // pagination
    page,
    setPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    pageItems,
    nextPage,
    prevPage,
    gotoPage,

    // ui mapping
    uiRecords,

    // crud operations
    addTyre,
    updateTyre,
    deleteTyre,
  };
}
