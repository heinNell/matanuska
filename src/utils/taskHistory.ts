import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { TaskHistoryEntry } from "../types";

/**
 * Adds a new task history entry to Firestore
 * @param taskId - The ID of the task/job card
 * @param entry - The history entry data (without id and performedAt)
 * @returns The ID of the created history entry
 */
export const addTaskHistory = async (
  taskId: string,
  entry: Omit<TaskHistoryEntry, "id" | "at">
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "tasks", taskId, "taskHistory"), {
      ...entry,
      at: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding task history:", error);
    throw error;
  }
};

/**
 * Gets all task history entries for a task (snapshot)
 * @param taskId - The ID of the task/job card
 * @returns Array of task history entries
 */
export const getTaskHistory = async (taskId: string): Promise<TaskHistoryEntry[]> => {
  try {
    const q = query(collection(db, "tasks", taskId, "taskHistory"), orderBy("at", "desc"));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TaskHistoryEntry[];
  } catch (error) {
    console.error("Error fetching task history:", error);
    return [];
  }
};

/**
 * Subscribes to real-time task history updates
 * @param taskId - The ID of the task/job card
 * @param callback - Function to call when history updates
 * @returns Unsubscribe function
 */
export const subscribeToTaskHistory = (
  taskId: string,
  callback: (history: TaskHistoryEntry[]) => void
) => {
  const q = query(collection(db, "tasks", taskId, "taskHistory"), orderBy("at", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const history = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TaskHistoryEntry[];

      callback(history);
    },
    (error) => {
      console.error("Error in task history subscription:", error);
      callback([]); // Return empty array on error
    }
  );
};

// Helper functions for common task history actions

export const logStatusChange = async (
  taskId: string,
  previousStatus: string,
  newStatus: string,
  by: string,
  notes?: string
) => {
  return addTaskHistory(taskId, {
    taskId,
    event: "statusChanged",
    previousStatus,
    newStatus,
    by,
    notes,
  });
};

export const logTaskAssignment = async (
  taskId: string,
  assignedTo: string,
  by: string,
  notes?: string
) => {
  return addTaskHistory(taskId, {
    taskId,
    event: "assigned",
    by,
    notes: notes || `Task assigned to ${assignedTo}`,
  });
};

export const logTaskVerification = async (taskId: string, by: string, notes?: string) => {
  return addTaskHistory(taskId, {
    taskId,
    event: "verified",
    by,
    notes: notes || "Task verified by supervisor",
  });
};

export const logTaskEdit = async (taskId: string, by: string, notes?: string) => {
  return addTaskHistory(taskId, {
    taskId,
    event: "edited",
    by,
    notes: notes || "Task details updated",
  });
};
