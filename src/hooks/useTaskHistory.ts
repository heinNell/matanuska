import { useEffect, useState } from "react";
import { TaskHistoryEntry } from "../types";
import { getTaskHistory, subscribeToTaskHistory } from "../utils/taskHistory";

/**
 * Hook to manage task history with real-time updates
 * @param taskId - The ID of the task/job card
 * @returns Object containing history data and loading state
 */
export const useTaskHistory = (taskId: string) => {
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // First, get initial data
    getTaskHistory(taskId)
      .then((initialHistory) => {
        setHistory(initialHistory);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching initial task history:", err);
        setError("Failed to load task history");
        setLoading(false);
      });

    // Then subscribe to real-time updates
    const unsubscribe = subscribeToTaskHistory(taskId, (updatedHistory) => {
      setHistory(updatedHistory);
      setLoading(false);
      setError(null);
    });

    return () => {
      unsubscribe();
    };
  }, [taskId]);

  return {
    history,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      getTaskHistory(taskId)
        .then(setHistory)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    },
  };
};
