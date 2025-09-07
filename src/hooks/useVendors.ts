/* ------------------------------------------------------------------
   useVendors.ts   - React hook for accessing / (optionally) seeding
                   the “vendors” collection from the client-side
                   Firebase SDK ( NOT firebase-admin ).
   ------------------------------------------------------------------ */

import { useCallback, useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc,
} from "firebase/firestore";
import { getApp, initializeApp } from "firebase/app";

/* ────────────────────────────────────────────────────────────────
   1.  Firebase client-side initialisation
   ──────────────────────────────────────────────────────────────── */
const firebaseConfig = {
  /* ❗ <-- YOUR PUBLIC CLIENT CONFIG HERE  --> */
};

function ensureFirebase() {
  try {
    return getApp();
  } catch {
    return initializeApp(firebaseConfig);
  }
}

/* ────────────────────────────────────────────────────────────────
   2.  Master vendor list (exactly the same data you provided)
   ──────────────────────────────────────────────────────────────── */
interface Vendor {
  vendorId: string;
  vendorName: string;
  contactPerson: string;
  workEmail: string;
  mobile: string;
  address: string;
  city: string;
}

const vendorList: Vendor[] = [
  { vendorId: "Joharita Enterprizes CC t/a Field Tyre", vendorName: "Field Tyre Services", contactPerson: "Joharita", workEmail: "admin@fieldtyreservices.co.za", mobile: "", address: "13 Varty Street Duncanville Vereeniging 1930", city: "Vereeniging" },
  { vendorId: "Art Cooperation Battery express", vendorName: "Art Cooperation Battery express", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Mutare" },
  { vendorId: "City Path Trading", vendorName: "City Path Trading", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Harare" },
  { vendorId: "Spetmic Investments (Pvt) Ltd t/a City Path Trading", vendorName: "Spetmic Investments (Pvt) Ltd t/a City Path Trading", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Harare" },
  { vendorId: "Spare Parts Exchange (Pvt) Ltd", vendorName: "Spare Parts Exchange (Pvt) Ltd", contactPerson: "", workEmail: "", mobile: "", address: "5a Martin Drive, Msasa, Harare", city: "Harare" },
  { vendorId: "Hinge Master", vendorName: "Hinge Master SA", contactPerson: "", workEmail: "", mobile: "", address: "18 Buwbes Road - Sebenza. Edenvale", city: "Johannesburg" },
  { vendorId: "Impala Truck Spares (PTA) CC", vendorName: "Impala Truck Spares (PTA) CC", contactPerson: "Andre", workEmail: "", mobile: "", address: "1311 Van Der Hoff Road, Zandfontein, Pretoria, 0082 Gauteng", city: "Pretoria" },
  { vendorId: "Monfiq Trading (Pvt) Ltd t/a Online Motor Spares", vendorName: "Monfiq Trading (Pvt) Ltd t/a Online Motor Spares", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Mutare" },
  { vendorId: "A&J Field Services", vendorName: "A&J Field Services", contactPerson: "JJ", workEmail: "", mobile: "", address: "", city: "" },
  { vendorId: "ELlemand", vendorName: "ELlemand", contactPerson: "", workEmail: "", mobile: "", address: "Polokwane", city: "Polokwane South Africa" },
  /* … <<< KEEP THE REMAINING LIST UNCHANGED >>> … */
  { vendorId: "Axle Investments Pvt Ltd t/a Matebeleland Trucks", vendorName: "Axle Investments Pvt Ltd t/a Matebeleland Trucks", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Harare" }
];

/* ────────────────────────────────────────────────────────────────
   3.  React hook
   ──────────────────────────────────────────────────────────────── */
export function useVendors(options?: { autoSeed?: boolean }) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<Error | null>(null);

  const db = getFirestore(ensureFirebase());

  /* ---------- download ---------- */
  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "vendors"));
      const data = snap.docs.map(d => d.data() as Vendor);
      setVendors(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  /* ---------- one-time seed ---------- */
  const seedVendors = useCallback(async () => {
    const colRef = collection(db, "vendors");
    const snap   = await getDocs(colRef);
    if (!snap.empty) {
      console.info(`vendors collection already contains ${snap.size} docs – skipping seed`);
      return;
    }
    const batch = writeBatch(db);
    vendorList.forEach(v => batch.set(doc(colRef), v));
    await batch.commit();
    console.info("✅ seeded vendors collection");
  }, [db]);

  useEffect(() => {
    (async () => {
      if (options?.autoSeed) await seedVendors();
      await fetchVendors();
    })();
  }, [fetchVendors, seedVendors, options?.autoSeed]);

  return { vendors, loading, error, refetch: fetchVendors, seedVendors };
}
