import { useState } from "react";

// This is a simplified mock of the useOfflineForm hook for testing
// The real implementation would use IndexedDB/local storage and handle
// network detection, queuing, and sync operations

interface UseOfflineFormOptions {
  collectionPath: string;
  showOfflineWarning?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface OfflineFormReturn {
  submit: (data: any, id?: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  isSubmitting: boolean;
  isDeleting: boolean;
  isOfflineOperation: boolean;
  error: Error | null;
}

export const useOfflineForm = (options: UseOfflineFormOptions): OfflineFormReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // For demo purposes, randomly simulate offline status
  const isOffline = Math.random() < 0.3;

  const submit = async (data: any, id?: string): Promise<void> => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, randomly simulate failure
      const simulateFailure = Math.random() < 0.1;
      if (simulateFailure) {
        throw new Error("Failed to submit data");
      }

      if (options.onSuccess) {
        options.onSuccess(data);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An unknown error occurred");
      setError(error);

      if (options.onError) {
        options.onError(error);
      }

      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async (id: string): Promise<void> => {
    setIsDeleting(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, randomly simulate failure
      const simulateFailure = Math.random() < 0.1;
      if (simulateFailure) {
        throw new Error("Failed to delete data");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An unknown error occurred");
      setError(error);

      if (options.onError) {
        options.onError(error);
      }

      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    submit,
    remove,
    isSubmitting,
    isDeleting,
    isOfflineOperation: isOffline,
    error,
  };
};

export default useOfflineForm;
