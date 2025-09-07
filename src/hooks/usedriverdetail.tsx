// src/hooks/usedriverdetail.tsx
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  Unsubscribe,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { db } from "../firebase";

/** -----------------------------
 * Types
 * ------------------------------*/
export interface Driver {
  id: string;
  idNo?: string | null;
  name: string;
  surname: string;
  status?: string;
  joinDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Authorization {
  id: string;
  idNo: string | null;
  name?: string | null;
  surname?: string | null;
  authorization: string;
  issueDate?: string | null;
  expireDate?: string | null;
  authRef?: string | null;
  authorised?: string | boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface UseDriverDetailArgs {
  idNo?: string;
  driverId?: string;
  realtime?: boolean;
  expiringSoonDays?: number;
}

type GroupedAuthorizations = Record<string, Authorization[]>;

/** -----------------------------
 * Utilities
 * ------------------------------*/
function parsePossiblyDayFirst(dateLike: unknown): Date | null {
  if (!dateLike) return null;

  // Firestore Timestamp
  if (
    typeof dateLike === "object" &&
    dateLike !== null &&
    typeof (dateLike as { toDate?: () => Date }).toDate === "function"
  ) {
    try {
      return (dateLike as { toDate: () => Date }).toDate();
    } catch {
      /* noop */
    }
  }

  if (typeof dateLike === "string") {
    // Try ISO
    const iso = new Date(dateLike);
    if (!Number.isNaN(iso.getTime())) return iso;

    // Try DD/MM/YYYY
    const match = dateLike.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const dd = Number(match[1]);
      const mm = Number(match[2]);
      const yyyy = Number(match[3]);
      const d = new Date(yyyy, mm - 1, dd);
      if (!Number.isNaN(d.getTime())) return d;
    }
  }

  return null;
}

function isExpired(expireDate?: string | null): boolean {
  const d = parsePossiblyDayFirst(expireDate);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

function isWithinDays(expireDate: string | null | undefined, days: number): boolean {
  const d = parsePossiblyDayFirst(expireDate);
  if (!d) return false;
  const now = new Date();
  const threshold = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
  return d >= now && d <= threshold;
}

/** -----------------------------
 * Hook
 * ------------------------------*/
export function useDriverDetail({
  idNo,
  driverId,
  realtime = true,
  expiringSoonDays = 60,
}: UseDriverDetailArgs) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [authorizations, setAuthorizations] = useState<Authorization[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // used to trigger re-subscribe/refresh
  const [reloadTick, setReloadTick] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadOnce = useCallback(async () => {
    if (!idNo && !driverId) {
      setDriver(null);
      setAuthorizations([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Resolve driver by driverId or idNo
      let foundDriver: Driver | null = null;

      if (driverId) {
        const driverRef = doc(db, "drivers", driverId);
        const snap = await getDoc(driverRef);
        if (snap.exists()) {
          const data = snap.data() as Record<string, unknown>;
          foundDriver = { id: snap.id, ...(data as any) };
        }
      } else if (idNo) {
        const dq = query(collection(db, "drivers"), where("idNo", "==", idNo), limit(1));
        const dsnap = await getDocs(dq);
        const firstDoc = dsnap.docs.at(0);
        if (firstDoc) {
          foundDriver = { id: firstDoc.id, ...(firstDoc.data() as any) };
        }
      }

      if (!isMounted.current) return;

      setDriver(foundDriver);

      // Fetch authorizations for idNo
      const authKey = (foundDriver?.idNo ?? idNo) ?? null;
      if (!authKey) {
        setAuthorizations([]);
      } else {
        const aq = query(collection(db, "authorizations"), where("idNo", "==", authKey));
        const asnap = await getDocs(aq);
        const rows = asnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as any),
        })) as Authorization[];
        setAuthorizations(rows);
      }

      setLoading(false);
    } catch (e: unknown) {
      if (!isMounted.current) return;
      setError(e instanceof Error ? e : new Error(String(e)));
      setLoading(false);
    }
  }, [idNo, driverId]);

  useEffect(() => {
    if (!realtime || (!idNo && !driverId)) {
      // one-time fetch mode
      loadOnce();
      return;
    }

    setLoading(true);
    setError(null);

    const unsubs: Unsubscribe[] = [];

    (async () => {
      try {
        let resolvedDriverId: string | null = driverId ?? null;
        let resolvedIdNo: string | null = idNo ?? null;

        // Resolve driver doc by idNo if needed
        if (!resolvedDriverId && idNo) {
          const dq = query(collection(db, "drivers"), where("idNo", "==", idNo), limit(1));
          const dsnap = await getDocs(dq);
          const firstDoc = dsnap.docs.at(0);
          if (firstDoc) {
            resolvedDriverId = firstDoc.id;
            const data = firstDoc.data() as any;
            resolvedIdNo = (data?.idNo as string | null | undefined) ?? idNo;
            if (isMounted.current) setDriver({ id: firstDoc.id, ...(data || {}) });
          } else if (isMounted.current) {
            setDriver(null);
          }
        }

        // Listen to driver doc
        if (resolvedDriverId) {
          const dref = doc(db, "drivers", resolvedDriverId);
          const unsubDriver = onSnapshot(
            dref,
            (snap) => {
              if (!isMounted.current) return;
              if (snap.exists()) {
                setDriver({ id: snap.id, ...(snap.data() as any) });
              } else {
                setDriver(null);
              }
              setLoading(false);
            },
            (e) => {
              if (!isMounted.current) return;
              setError(e instanceof Error ? e : new Error(String(e)));
              setLoading(false);
            }
          );
          unsubs.push(unsubDriver);
        } else {
          if (isMounted.current) setLoading(false);
        }

        // Listen to authorizations by idNo
        const authKey = (resolvedIdNo ?? idNo) ?? null;
        if (authKey) {
          const aq = query(
            collection(db, "authorizations"),
            where("idNo", "==", authKey),
            orderBy("authorization", "asc")
          );
          const unsubAuth = onSnapshot(
            aq,
            (snap) => {
              if (!isMounted.current) return;
              const rows = snap.docs.map((docSnap) => ({
                id: docSnap.id,
                ...(docSnap.data() as any),
              })) as Authorization[];
              setAuthorizations(rows);
            },
            (e) => {
              if (!isMounted.current) return;
              setError(e instanceof Error ? e : new Error(String(e)));
            }
          );
          unsubs.push(unsubAuth);
        }
      } catch (e: unknown) {
        if (!isMounted.current) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setLoading(false);
      }
    })();

    return () => {
      for (const u of unsubs) {
        try {
          if (typeof u === "function") u();
        } catch {
          /* ignore */
        }
      }
    };
  }, [realtime, idNo, driverId, loadOnce, reloadTick]);

  const refresh = useCallback(() => {
    if (realtime) {
      setReloadTick((t) => t + 1);
    } else {
      loadOnce();
    }
  }, [realtime, loadOnce]);

  const groupedAuthorizations: GroupedAuthorizations = useMemo(() => {
    return authorizations.reduce<GroupedAuthorizations>((acc, auth) => {
      const key = (auth.authorization || "Unknown").trim();
      if (!acc[key]) acc[key] = [];
      acc[key].push(auth);
      return acc;
    }, {});
  }, [authorizations]);

  const expiredAuthorizations = useMemo(
    () => authorizations.filter((a) => isExpired(a.expireDate ?? null)),
    [authorizations]
  );

  const expiringSoonAuthorizations = useMemo(
    () => authorizations.filter((a) => isWithinDays(a.expireDate ?? null, expiringSoonDays)),
    [authorizations, expiringSoonDays]
  );

  const hasAnyExpired = expiredAuthorizations.length > 0;

  return {
    driver,
    authorizations,
    groupedAuthorizations,
    expiredAuthorizations,
    expiringSoonAuthorizations,
    hasAnyExpired,
    loading,
    error,
    refresh,
  };
}

export default useDriverDetail;
