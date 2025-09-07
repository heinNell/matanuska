import { firestore } from "../firebase";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";

/** ===== Types (aligned to your seed) ===== */
export type TyreFitment = "Steer" | "Drive" | "Trailer" | "Multi";

export interface TyreBrandDoc {
  id: string; // lowercased, non-alnum stripped
  name: string; // "Bridgestone"
  createdAt?: string;
}

export interface TyreSizeDoc {
  id: string; // size sanitized (e.g., "31580r225")
  size: string; // "315/80R22.5"
  createdAt?: string;
}

export interface TyrePatternDoc {
  id: string; // brand_pattern_size (sanitized)
  brand: string; // as saved (may be mixed case in seed)
  pattern: string; // may be "" for standard
  size: string;
  position: TyreFitment;
  createdAt?: string;
}

/** ===== Collection names ===== */
const C_BRANDS = "tyreBrands";
const C_SIZES = "tyreSizes";
const C_PATTERNS = "tyrePatterns";

/** ===== ID builders (mirror your seeder) ===== */
const sanitize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const brandId = (name: string) => sanitize(name);
const sizeId = (size: string) => sanitize(size);
const patternId = (brand: string, pattern: string, size: string) =>
  `${sanitize(brand)}_${sanitize(pattern || "standard")}_${sanitize(size)}`;

/** ===== Small helpers ===== */
const nowIso = () => new Date().toISOString();
const normBrandLabel = (b: string) => b.charAt(0).toUpperCase() + b.slice(1).toLowerCase();

/** ===== Hook API ===== */
export interface UseTyreCatalog {
  // data
  brands: TyreBrandDoc[];
  sizes: TyreSizeDoc[];
  patterns: TyrePatternDoc[];
  loading: boolean;
  error: string | null;

  // selectors
  getPatterns: (filter?: {
    brand?: string;
    size?: string;
    position?: TyreFitment;
  }) => TyrePatternDoc[];
  sizesByBrand: (brand: string) => string[]; // unique sizes available for brand
  brandsBySize: (size: string) => string[]; // unique brands available for size
  positionsFor: (brand: string, size: string) => TyreFitment[]; // fitments available

  // mutations
  upsertBrand: (name: string) => Promise<void>;
  removeBrand: (name: string) => Promise<void>;

  upsertSize: (size: string) => Promise<void>;
  removeSize: (size: string) => Promise<void>;

  upsertPattern: (p: Omit<TyrePatternDoc, "id" | "createdAt">) => Promise<void>;
  removePattern: (p: { brand: string; pattern: string; size: string }) => Promise<void>;

  // bulk
  bulkUpsertPatterns: (rows: Omit<TyrePatternDoc, "id" | "createdAt">[]) => Promise<number>;
}

export function useTyreCatalog(): UseTyreCatalog {
  const [brands, setBrands] = useState<TyreBrandDoc[]>([]);
  const [sizes, setSizes] = useState<TyreSizeDoc[]>([]);
  const [patterns, setPatterns] = useState<TyrePatternDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Realtime subscriptions */
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // brands
    unsubscribers.push(
      onSnapshot(
        query(collection(firestore, C_BRANDS), orderBy("name", "asc")),
        (snap) => {
          setBrands(snap.docs.map((d) => ({ ...(d.data() as TyreBrandDoc), id: d.id })));
        },
        (e) => setError(e.message)
      )
    );

    // sizes
    unsubscribers.push(
      onSnapshot(
        query(collection(firestore, C_SIZES), orderBy("size", "asc")),
        (snap) => {
          setSizes(snap.docs.map((d) => ({ ...(d.data() as TyreSizeDoc), id: d.id })));
        },
        (e) => setError(e.message)
      )
    );

    // patterns
    unsubscribers.push(
      onSnapshot(
        query(collection(firestore, C_PATTERNS), orderBy("brand", "asc")),
        (snap) => {
          setPatterns(snap.docs.map((d) => ({ ...(d.data() as TyrePatternDoc), id: d.id })));
          setLoading(false);
        },
        (e) => {
          setError(e.message);
          setLoading(false);
        }
      )
    );

    return () => unsubscribers.forEach((u) => u());
  }, []);

  /** Indexes for fast selectors */
  const patternsByBrand = useMemo(() => {
    const m = new Map<string, TyrePatternDoc[]>();
    for (const p of patterns) {
      const key = p.brand;
      const arr = m.get(key) ?? [];
      arr.push(p);
      m.set(key, arr);
    }
    return m;
  }, [patterns]);

  const patternsBySize = useMemo(() => {
    const m = new Map<string, TyrePatternDoc[]>();
    for (const p of patterns) {
      const arr = m.get(p.size) ?? [];
      arr.push(p);
      m.set(p.size, arr);
    }
    return m;
  }, [patterns]);

  /** Selectors */
  const getPatterns = useCallback(
    (filter?: { brand?: string; size?: string; position?: TyreFitment }) => {
      if (!filter) return patterns;
      return patterns.filter(
        (p) =>
          (filter.brand ? p.brand === filter.brand : true) &&
          (filter.size ? p.size === filter.size : true) &&
          (filter.position ? p.position === filter.position : true)
      );
    },
    [patterns]
  );

  const sizesByBrand = useCallback(
    (brand: string) => {
      const set = new Set<string>();
      for (const p of patternsByBrand.get(brand) ?? []) set.add(p.size);
      return Array.from(set).sort();
    },
    [patternsByBrand]
  );

  const brandsBySize = useCallback(
    (size: string) => {
      const set = new Set<string>();
      for (const p of patternsBySize.get(size) ?? []) set.add(p.brand);
      // normalize label casing for display
      return Array.from(set).map(normBrandLabel).sort();
    },
    [patternsBySize]
  );

  const positionsFor = useCallback(
    (brand: string, size: string) => {
      const set = new Set<TyreFitment>();
      for (const p of patterns) {
        if (p.brand === brand && p.size === size) set.add(p.position);
      }
      return Array.from(set).sort();
    },
    [patterns]
  );

  /** Mutations */
  const upsertBrand = useCallback(async (name: string) => {
    const id = brandId(name);
    await setDoc(doc(collection(firestore, C_BRANDS), id), {
      name,
      createdAt: nowIso(),
    } as TyreBrandDoc);
  }, []);

  const removeBrand = useCallback(async (name: string) => {
    await deleteDoc(doc(collection(firestore, C_BRANDS), brandId(name)));
  }, []);

  const upsertSize = useCallback(async (size: string) => {
    const id = sizeId(size);
    await setDoc(doc(collection(firestore, C_SIZES), id), {
      size,
      createdAt: nowIso(),
    } as TyreSizeDoc);
  }, []);

  const removeSize = useCallback(async (size: string) => {
    await deleteDoc(doc(collection(firestore, C_SIZES), sizeId(size)));
  }, []);

  const upsertPattern = useCallback(async (p: Omit<TyrePatternDoc, "id" | "createdAt">) => {
    const id = patternId(p.brand, p.pattern, p.size);
    await setDoc(doc(collection(firestore, C_PATTERNS), id), {
      ...p,
      createdAt: nowIso(),
    } as TyrePatternDoc);
  }, []);

  const removePattern = useCallback(
    async ({ brand, pattern, size }: { brand: string; pattern: string; size: string }) => {
      await deleteDoc(doc(collection(firestore, C_PATTERNS), patternId(brand, pattern, size)));
    },
    []
  );

  const bulkUpsertPatterns = useCallback(
    async (rows: Omit<TyrePatternDoc, "id" | "createdAt">[]) => {
      const batch = writeBatch(firestore);
      let n = 0;
      for (const r of rows) {
        const id = patternId(r.brand, r.pattern, r.size);
        batch.set(doc(collection(firestore, C_PATTERNS), id), { ...r, createdAt: nowIso() });
        n++;
      }
      await batch.commit();
      return n;
    },
    []
  );

  return {
    brands,
    sizes,
    patterns,
    loading,
    error,
    getPatterns,
    sizesByBrand,
    brandsBySize,
    positionsFor,
    upsertBrand,
    removeBrand,
    upsertSize,
    removeSize,
    upsertPattern,
    removePattern,
    bulkUpsertPatterns,
  };
}
