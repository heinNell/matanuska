import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

/** ---- Types ---- */
export type AssetType = "Horse" | "Interlink" | "Reefer" | "LMV" | "Other";

export interface FleetAsset {
  fleetNo: string; // doc id
  positions: string[]; // e.g. ["V1","V2",...,"SP"]
  type: AssetType;
}

export type PatternFitment = "Steer" | "Drive" | "Trailer" | "Multi";

export interface TyrePattern {
  id?: string;
  brand: string;
  pattern: string;
  size: string; // e.g. "315/80R22.5"
  position: PatternFitment; // seed uses Drive/Steer/Trailer/Multi
}

/** ---- Constants / Utilities ---- */
const FLEET_COLLECTION = "fleetAssets";
const PATTERN_COLLECTION = "tyrePatterns";

const ALLOWED_BY_TYPE: Record<AssetType, RegExp> = {
  // Horse: V1..V10 and SP
  Horse: /^(V([1-9]|10)|SP)$/,
  // Interlink: T1..T16 and SP1..SP2
  Interlink: /^(T([1-9]|1[0-6])|SP[12])$/,
  // Reefer: T1..T6 and SP1..SP2
  Reefer: /^(T([1-6])|SP[12])$/,
  // LMV: P1..P6 and SP
  LMV: /^(P([1-6])|SP)$/,
  // Other: Q1..Q10 and SP
  Other: /^(Q([1-9]|10)|SP)$/,
};

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function normalizeBrand(value: string) {
  // Your seed has mixed case: SUNFULL, Sunfull, WellPlus, Wellplus, TriAngle/TRAINGLE typo, etc.
  // Keep it simple: capitalize first letter, lowercase rest.
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

/** Validate a positions array against an asset type. Returns [isValid, invalidCodes[]] */
function validatePositions(type: AssetType, positions: string[]): [boolean, string[]] {
  const rx = ALLOWED_BY_TYPE[type];
  const invalid = positions.filter((p) => !rx.test(p));
  return [invalid.length === 0, invalid];
}

/** Optional: generate default positions for an asset type (useful if empty) */
export function defaultPositionsFor(type: AssetType): string[] {
  switch (type) {
    case "Horse":
      return ["V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "SP"];
    case "Interlink":
      return [
        "T1",
        "T2",
        "T3",
        "T4",
        "T5",
        "T6",
        "T7",
        "T8",
        "T9",
        "T10",
        "T11",
        "T12",
        "T13",
        "T14",
        "T15",
        "T16",
        "SP1",
        "SP2",
      ];
    case "Reefer":
      return ["T1", "T2", "T3", "T4", "T5", "T6", "SP1", "SP2"];
    case "LMV":
      return ["P1", "P2", "P3", "P4", "P5", "P6", "SP"];
    case "Other":
      return ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10", "SP"];
    default:
      return [];
  }
}

/** ---- Hook Return Type ---- */
export interface UseTyrePositions {
  assets: FleetAsset[];
  patterns: TyrePattern[];
  loading: boolean;
  error: string | null;
  /** Lookup helpers */
  getAsset: (fleetNo: string) => FleetAsset | undefined;
  getPositionsForAsset: (fleetNo: string) => string[];
  getPatternsByFitment: (fitment: PatternFitment) => TyrePattern[];
  /** Mutations */
  upsertAsset: (asset: FleetAsset) => Promise<void>;
  setAssetPositions: (fleetNo: string, type: AssetType, positions: string[]) => Promise<void>;
  addPosition: (fleetNo: string, type: AssetType, pos: string) => Promise<void>;
  removePosition: (fleetNo: string, type: AssetType, pos: string) => Promise<void>;
}

/** ---- The Hook ---- */
export function useTyrePositions(): UseTyrePositions {
  const [assets, setAssets] = useState<FleetAsset[]>([]);
  const [patterns, setPatterns] = useState<TyrePattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to fleet assets
  useEffect(() => {
    const q = query(collection(db, FLEET_COLLECTION), orderBy("fleetNo", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: FleetAsset[] = snap.docs.map((d) => {
          const data = d.data() as FleetAsset;
          return {
            fleetNo: d.id,
            positions: Array.isArray(data.positions) ? data.positions : [],
            type: data.type as AssetType,
          };
        });
        setAssets(rows);
        setLoading(false);
      },
      (e) => {
        console.error("fleetAssets subscribe error:", e);
        setError(e.message || "Failed to load fleetAssets");
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // Subscribe to tyre patterns
  useEffect(() => {
    const q = query(collection(db, PATTERN_COLLECTION), orderBy("brand", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: TyrePattern[] = snap.docs.map((d) => {
          const data = d.data() as TyrePattern;
          return {
            id: d.id,
            brand: normalizeBrand(data.brand),
            pattern: data.pattern ?? "",
            size: data.size,
            position: data.position as PatternFitment,
          };
        });
        setPatterns(rows);
      },
      (e) => {
        console.error("tyrePatterns subscribe error:", e);
        setError(e.message || "Failed to load tyrePatterns");
      }
    );
    return () => unsub();
  }, []);

  /** ---- Lookups ---- */
  const assetMap = useMemo(() => {
    const m = new Map<string, FleetAsset>();
    for (const a of assets) m.set(a.fleetNo, a);
    return m;
  }, [assets]);

  const patternsByFitment = useMemo(() => {
    const m = new Map<PatternFitment, TyrePattern[]>();
    for (const p of patterns) {
      const arr = m.get(p.position) ?? [];
      arr.push(p);
      m.set(p.position, arr);
    }
    return m;
  }, [patterns]);

  const getAsset = useCallback((fleetNo: string) => assetMap.get(fleetNo), [assetMap]);

  const getPositionsForAsset = useCallback(
    (fleetNo: string) => getAsset(fleetNo)?.positions ?? [],
    [getAsset]
  );

  const getPatternsByFitment = useCallback(
    (fitment: PatternFitment) => patternsByFitment.get(fitment) ?? [],
    [patternsByFitment]
  );

  /** ---- Mutations ---- */

  /** Create or replace an asset document */
  const upsertAsset = useCallback(async (asset: FleetAsset) => {
    try {
      const [ok, invalid] = validatePositions(asset.type, asset.positions);
      if (!ok) {
        throw new Error(`Invalid position codes for type ${asset.type}: ${invalid.join(", ")}`);
      }
      const ref = doc(collection(db, FLEET_COLLECTION), asset.fleetNo);
      await setDoc(ref, {
        fleetNo: asset.fleetNo,
        type: asset.type,
        positions: uniq(asset.positions),
      });
    } catch (e: any) {
      console.error("upsertAsset error:", e);
      setError(e.message ?? "upsertAsset failed");
      throw e;
    }
  }, []);

  /** Overwrite positions array on an asset with validation */
  const setAssetPositions = useCallback(
    async (fleetNo: string, type: AssetType, positions: string[]) => {
      try {
        const [ok, invalid] = validatePositions(type, positions);
        if (!ok) throw new Error(`Invalid position codes: ${invalid.join(", ")}`);
        const ref = doc(collection(db, FLEET_COLLECTION), fleetNo);
        await updateDoc(ref, { positions: uniq(positions) });
      } catch (e: any) {
        console.error("setAssetPositions error:", e);
        setError(e.message ?? "setAssetPositions failed");
        throw e;
      }
    },
    []
  );

  const addPosition = useCallback(
    async (fleetNo: string, type: AssetType, pos: string) => {
      try {
        const [ok] = validatePositions(type, [pos]);
        if (!ok) throw new Error(`Invalid position '${pos}' for type ${type}`);
        const current = assetMap.get(fleetNo)?.positions ?? [];
        if (current.includes(pos)) return; // no-op
        await setAssetPositions(fleetNo, type, [...current, pos]);
      } catch (e: any) {
        console.error("addPosition error:", e);
        setError(e.message ?? "addPosition failed");
        throw e;
      }
    },
    [assetMap, setAssetPositions]
  );

  const removePosition = useCallback(
    async (fleetNo: string, type: AssetType, pos: string) => {
      try {
        const current = assetMap.get(fleetNo)?.positions ?? [];
        if (!current.includes(pos)) return; // no-op
        await setAssetPositions(
          fleetNo,
          type,
          current.filter((p) => p !== pos)
        );
      } catch (e: any) {
        console.error("removePosition error:", e);
        setError(e.message ?? "removePosition failed");
        throw e;
      }
    },
    [assetMap, setAssetPositions]
  );

  return {
    assets,
    patterns,
    loading,
    error,
    getAsset,
    getPositionsForAsset,
    getPatternsByFitment,
    upsertAsset,
    setAssetPositions,
    addPosition,
    removePosition,
  };
}
