import { useState } from "react";
import { getNetworkState } from "../utils/networkDetection";
import { saveDocument, deleteDocument } from "../utils/offlineOperations";

interface UseOfflineFormOptions {
  collectionPath: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showOfflineWarning?: boolean;
}

interface OfflineFormReturn {
  submit: (data: any, id?: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  isSubmitting: boolean;
  isDeleting: boolean;
  isOfflineOperation: boolean;
  error: Error | null;
}

/**
 * A custom hook for handling form submissions with offline support
 *
 * @param options Configuration options
 * @returns An object with form submission functions and state
 */
const useOfflineForm = (options: UseOfflineFormOptions): OfflineFormReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOfflineOperation, setIsOfflineOperation] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Submit form data to Firestore with offline support
   */
  const submit = async (data: any, id?: string): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setIsOfflineOperation(false);

    try {
      const networkState = getNetworkState();

      // Check if we're offline
      if (networkState.status === "offline") {
        setIsOfflineOperation(true);
        if (options.showOfflineWarning) {
          console.warn("You are offline. Changes will be saved when you reconnect.");
        }
      }

      // Generate ID if not provided
      const documentId = id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Save to Firestore (or queue for offline)
      await saveDocument(options.collectionPath, documentId, data);

      // Call success callback if provided
      if (options.onSuccess) {
        options.onSuccess({
          id: documentId,
          ...data,
        });
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);

      // Call error callback if provided
      if (options.onError) {
        options.onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Delete a document with offline support
   */
  const remove = async (id: string): Promise<void> => {
    setIsDeleting(true);
    setError(null);
    setIsOfflineOperation(false);

    try {
      const networkState = getNetworkState();

      // Check if we're offline
      if (networkState.status === "offline") {
        setIsOfflineOperation(true);
        if (options.showOfflineWarning) {
          console.warn("You are offline. Deletion will be processed when you reconnect.");
        }
      }

      // Delete from Firestore (or queue for offline)
      await deleteDocument(options.collectionPath, id);

      // Call success callback if provided
      if (options.onSuccess) {
        options.onSuccess({ id, deleted: true });
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);

      // Call error callback if provided
      if (options.onError) {
        options.onError(error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    submit,
    remove,
    isSubmitting,
    isDeleting,
    isOfflineOperation,
    error,
  };
};

export default useOfflineForm;
