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
// 🔧 Adjust this to your Firestore client instance
import { db } from "../firebase";

// Defensive: ensure Firestore instance exists before using it to avoid
// cryptic SDK errors (e.g., reading internal property 'wI' on undefined).
function ensureDbOrSetError(dbInst: unknown, setErr: (e: Error) => void): dbInst is object {
  const ok = !!dbInst && typeof dbInst === "object";
  if (!ok) {
    setErr(new Error("Firestore not initialized. Check firebase.ts initialization."));
  }
  return ok as any;
}

export type Driver = {
  id: string;
  idNo?: string | null;
  name: string;
  surname: string;
  status?: string;
  joinDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Authorization = {
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
};

type UseDriverDetailArgs = {
  idNo?: string;
  driverId?: string;
  realtime?: boolean;
  expiringSoonDays?: number;
};

type GroupedAuthorizations = Record<string, Authorization[]>;

function parsePossiblyDayFirst(dateLike: any): Date | null {
  if (!dateLike) return null;

  if (typeof dateLike === "object" && typeof dateLike.toDate === "function") {
    try {
      return dateLike.toDate();
    } catch {
      /* noop */
    }
  }

  if (typeof dateLike === "string") {
    const iso = new Date(dateLike);
    if (!Number.isNaN(iso.getTime())) return iso;

    // DD/MM/YYYY
    const m = dateLike.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const [, dd, mm, yyyy] = m; // fix: avoid unused '_' var
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
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

  // used to trigger re-subscribe/refresh without eslint-disable comments
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
      if (!ensureDbOrSetError(db, (e) => setError(e))) {
        setLoading(false);
        return;
      }
      let foundDriver: Driver | null = null;

      if (driverId) {
        const dref = doc(db, "drivers", driverId);
        const snap = await getDoc(dref);
        if (snap.exists()) {
          const data = snap.data() as any;
          foundDriver = { id: snap.id, ...(data || {}) };
        }
      } else if (idNo) {
        const dq = query(collection(db, "drivers"), where("idNo", "==", idNo), limit(1));
        const dsnap = await getDocs(dq);
        if (!dsnap.empty) {
          const d = dsnap.docs[0];
          foundDriver = { id: d.id, ...(d.data() as any) };
        }
      }

      if (!isMounted.current) return;

      setDriver(foundDriver);

      const key = foundDriver?.idNo ?? idNo ?? null;
      if (!key) {
        setAuthorizations([]);
      } else {
        const aq = query(collection(db, "authorizations"), where("idNo", "==", key));
        const asnap = await getDocs(aq);
        const rows = asnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Authorization[];
        setAuthorizations(rows);
      }

      setLoading(false);
    } catch (e: any) {
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

    const unsubs: Unsubscribe[] = []; // fix: prefer-const

    (async () => {
      try {
        if (!ensureDbOrSetError(db, (e) => setError(e))) {
          setLoading(false);
          return;
        }
        let localDriverId: string | null = driverId ?? null;
        let localIdNo: string | null = idNo ?? null;

        // Resolve driver doc by idNo if needed
        if (!localDriverId && idNo) {
          const dq = query(collection(db, "drivers"), where("idNo", "==", idNo), limit(1));
          const dsnap = await getDocs(dq);
          if (!dsnap.empty) {
            const d = dsnap.docs[0];
            localDriverId = d.id;
            localIdNo = (d.data() as any)?.idNo ?? idNo;
            if (isMounted.current) setDriver({ id: d.id, ...(d.data() as any) });
          } else if (isMounted.current) {
            setDriver(null);
          }
        }

        // Listen to driver doc
        if (localDriverId) {
          const dref = doc(db, "drivers", localDriverId);
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
        const key = localIdNo ?? idNo ?? null;
        if (key) {
          const aq = query(
            collection(db, "authorizations"),
            where("idNo", "==", key),
            orderBy("authorization", "asc")
          );
          const unsubAuth = onSnapshot(
            aq,
            (snap) => {
              if (!isMounted.current) return;
              const rows = snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as any),
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
      } catch (e: any) {
        if (!isMounted.current) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setLoading(false);
      }
    })();

    return () => {
      unsubs.forEach((u) => {
        try {
          if (typeof u === "function") u();
        } catch {
          /* ignore */
        }
      });
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
    return authorizations.reduce<GroupedAuthorizations>((acc, a) => {
      const key = (a.authorization || "Unknown").trim();
      if (!acc[key]) acc[key] = [];
      acc[key].push(a);
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
