import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { db } from "../firebase";

/** ---- Types ---- */
export type AssetType = "Horse" | "Interlink" | "Reefer" | "LMV" | "Other";

export interface FleetAsset {
  fleetNo: string; // doc id
  positions: string[]; // mutable array
  type: AssetType;
}

export type PatternFitment = "Steer" | "Drive" | "Trailer" | "Multi";

export interface TyrePattern {
  id?: string;
  brand: string;
  pattern: string;
  size: string; // e.g. "315/80R22.5"
  position: PatternFitment;
}

/** ---- Constants / Utilities ---- */
const FLEET_COLLECTION = "fleetAssets";
const PATTERN_COLLECTION = "tyrePatterns";

const ALLOWED_BY_TYPE: Record<AssetType, RegExp> = {
  Horse: /^(V([1-9]|10)|SP)$/,
  Interlink: /^(T([1-9]|1[0-6])|SP[12])$/,
  Reefer: /^(T([1-6])|SP[12])$/,
  LMV: /^(P([1-6])|SP)$/,
  Other: /^(Q([1-9]|10)|SP)$/,
};

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function normalizeBrand(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function validatePositions(type: AssetType, positions: string[]): [boolean, string[]] {
  const rx = ALLOWED_BY_TYPE[type];
  const invalid = positions.filter((p) => !rx.test(p));
  return [invalid.length === 0, invalid];
}

/** Standardized position lists by asset type */
export const STANDARD_POSITIONS = {
  Horse: {
    full: ["V1","V2","V3","V4","V5","V6","V7","V8","V9","V10","SP"],
    compact: ["V1","V2","V3","V4","SP"]
  },
  Interlink: {
    standard: ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12","T13","T14","T15","T16","SP1","SP2"]
  },
  Reefer: {
    standard: ["T1","T2","T3","T4","T5","T6","SP1","SP2"]
  },
  LMV: {
    standard: ["P1","P2","P3","P4","P5","P6","SP"]
  },
  Other: {
    standard: ["Q1","Q2","Q3","Q4","Q5","Q6","Q7","Q8","Q9","Q10","SP"]
  }
} as const;

/** Get position configuration based on fleet number prefix */
export function getFleetConfig(fleetNo: string): { type: AssetType; positions: string[] } {
  const num = fleetNo.toUpperCase();

  if (num.endsWith('L')) {
    return { type: 'Horse', positions: Array.from(STANDARD_POSITIONS.Horse.compact) };
  }
  if (num.endsWith('H')) {
    if (num === '4H' || num === '6H' || num === '30H') {
      return { type: 'LMV', positions: Array.from(STANDARD_POSITIONS.LMV.standard) };
    }
    if (num === '29H') {
      return { type: 'Other', positions: Array.from(STANDARD_POSITIONS.Other.standard) };
    }
    return { type: 'Horse', positions: Array.from(STANDARD_POSITIONS.Horse.full) };
  }
  if (num.endsWith('T')) {
    return { type: 'Interlink', positions: Array.from(STANDARD_POSITIONS.Interlink.standard) };
  }
  if (num.endsWith('F')) {
    return { type: 'Reefer', positions: Array.from(STANDARD_POSITIONS.Reefer.standard) };
  }
  if (num === 'UD') {
    return { type: 'LMV', positions: Array.from(STANDARD_POSITIONS.LMV.standard) };
  }

  return { type: 'Horse', positions: Array.from(STANDARD_POSITIONS.Horse.full) };
}

/** Default positions helper */
export function defaultPositionsFor(type: AssetType): string[] {
  switch (type) {
    case "Horse": return Array.from(STANDARD_POSITIONS.Horse.full);
    case "Interlink": return Array.from(STANDARD_POSITIONS.Interlink.standard);
    case "Reefer": return Array.from(STANDARD_POSITIONS.Reefer.standard);
    case "LMV": return Array.from(STANDARD_POSITIONS.LMV.standard);
    case "Other": return Array.from(STANDARD_POSITIONS.Other.standard);
    default: return [];
  }
}

/** ---- Hook Return Type ---- */
export interface UseTyrePositions {
  assets: FleetAsset[];
  patterns: TyrePattern[];
  loading: boolean;
  error: string | null;
  getAsset: (fleetNo: string) => FleetAsset | undefined;
  getPositionsForAsset: (fleetNo: string) => string[];
  getPatternsByFitment: (fitment: PatternFitment) => TyrePattern[];
  upsertAsset: (asset: FleetAsset) => Promise<void>;
  setAssetPositions: (fleetNo: string, type: AssetType, positions: string[]) => Promise<void>;
  addPosition: (fleetNo: string, type: AssetType, pos: string) => Promise<void>;
  removePosition: (fleetNo: string, type: AssetType, pos: string) => Promise<void>;
}

/** ---- Hook ---- */
export function useTyrePositions(): UseTyrePositions {
  const [assets, setAssets] = useState<FleetAsset[]>([]);
  const [patterns, setPatterns] = useState<TyrePattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fleet assets subscription
  useEffect(() => {
    const q = query(collection(db, FLEET_COLLECTION), orderBy("fleetNo", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: FleetAsset[] = snap.docs.map((d) => ({
          fleetNo: d.id,
          positions: Array.isArray(d.data().positions) ? d.data().positions : [],
          type: d.data().type as AssetType,
        }));
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

  // Tyre patterns subscription
  useEffect(() => {
    const q = query(collection(db, PATTERN_COLLECTION), orderBy("brand", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: TyrePattern[] = snap.docs.map((d) => ({
          id: d.id,
          brand: normalizeBrand(d.data().brand),
          pattern: d.data().pattern ?? "",
          size: d.data().size,
          position: d.data().position as PatternFitment,
        }));
        setPatterns(rows);
      },
      (e) => {
        console.error("tyrePatterns subscribe error:", e);
        setError(e.message ?? "Failed to load tyrePatterns");
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
  const getPositionsForAsset = useCallback((fleetNo: string) => getAsset(fleetNo)?.positions ?? [], [getAsset]);
  const getPatternsByFitment = useCallback((fitment: PatternFitment) => patternsByFitment.get(fitment) ?? [], [patternsByFitment]);

  /** ---- Mutations ---- */
  const upsertAsset = useCallback(async (asset: FleetAsset) => {
    const [ok, invalid] = validatePositions(asset.type, asset.positions);
    if (!ok) throw new Error(`Invalid position codes for type ${asset.type}: ${invalid.join(", ")}`);
    const ref = doc(collection(db, FLEET_COLLECTION), asset.fleetNo);
    await setDoc(ref, { fleetNo: asset.fleetNo, type: asset.type, positions: uniq(asset.positions) });
  }, []);

  const setAssetPositions = useCallback(async (fleetNo: string, type: AssetType, positions: string[]) => {
    const [ok, invalid] = validatePositions(type, positions);
    if (!ok) throw new Error(`Invalid position codes: ${invalid.join(", ")}`);
    const ref = doc(collection(db, FLEET_COLLECTION), fleetNo);
    await setDoc(ref, { positions: uniq(positions) }, { merge: true });
  }, []);

  const addPosition = useCallback(async (fleetNo: string, type: AssetType, pos: string) => {
    const current = assetMap.get(fleetNo)?.positions ?? [];
    if (!current.includes(pos)) {
      await setAssetPositions(fleetNo, type, [...current, pos]);
    }
  }, [assetMap, setAssetPositions]);

  const removePosition = useCallback(async (fleetNo: string, type: AssetType, pos: string) => {
    const current = assetMap.get(fleetNo)?.positions ?? [];
    if (!current.includes(pos)) return;
    await setAssetPositions(fleetNo, type, current.filter((p) => p !== pos));
  }, [assetMap, setAssetPositions]);

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
