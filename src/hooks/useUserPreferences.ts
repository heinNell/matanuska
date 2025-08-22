import { useEffect, useState, useCallback } from "react";
import { db } from "@/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

// Define a more specific type for preferences if possible,
// to improve type safety and autocompletion.
interface UserPreferences {
  lastUnit?: number;
  // Add other preference properties here
  [key: string]: any;
}

/**
 * A custom hook to fetch, save, and listen for real-time updates
 * to a user's preferences stored in Firestore.
 *
 * @param {string} uid The unique user ID.
 * @returns An object containing the user's preferences and a save function.
 */
export function useUserPreferences(uid: string) {
  // Initialize state with a more specific type.
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Use onSnapshot for real-time updates
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const docRef = doc(db, "userPreferences", uid);

    // This listener will fetch the initial data and any subsequent changes.
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          setPrefs(snap.data() as UserPreferences);
        } else {
          setPrefs(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Failed to fetch user preferences:", err);
        setError("Failed to load user preferences. Please try again.");
        setLoading(false);
      }
    );

    // The cleanup function unsubscribes the listener when the component unmounts.
    return () => unsubscribe();
  }, [uid]);

  // The save function is wrapped in useCallback to prevent unnecessary re-creations.
  const savePrefs = useCallback(async (data: Partial<UserPreferences>) => {
    if (!uid) {
      setError("User ID is not available to save preferences.");
      return;
    }

    try {
      // Optimistically update the local state for instant feedback.
      setPrefs((prevPrefs) => ({ ...prevPrefs, ...data }));

      // Attempt to update the database.
      await setDoc(doc(db, "userPreferences", uid), data, { merge: true });
      setError(null); // Clear any previous errors on success.
    } catch (err) {
      console.error("Failed to save user preferences:", err);
      // Rollback the local state and set an error message on failure.
      setError("Failed to save preferences. Please try again.");
    }
  }, [uid]);

  return { prefs, savePrefs, loading, error };
}
