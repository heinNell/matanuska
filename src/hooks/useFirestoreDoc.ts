import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export function useFirestoreDoc(collection: string, docId: string | undefined): { data: any; loading: boolean } {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchDoc = async () => {
      try {
        const docRef = doc(db, collection, docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() });
        } else {
          setData(null);
        }
      } catch (error) {
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [collection, docId]);

  return { data, loading };
}
