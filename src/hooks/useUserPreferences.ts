import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export function useUserPreferences(uid: string) {
  const [prefs, setPrefs] = useState<any | null>(null);

  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, "userPreferences", uid)).then(snap => {
      if (snap.exists()) setPrefs(snap.data());
    });
  }, [uid]);

  // Save/update
  const savePrefs = async (data: any) => {
    await setDoc(doc(db, "userPreferences", uid), data, { merge: true });
    setPrefs({ ...prefs, ...data });
  };

  return { prefs, savePrefs };
}
