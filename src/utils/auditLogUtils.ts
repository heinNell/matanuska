import { collection, addDoc, Timestamp } from "firebase/firestore";
import { firestore } from '../utils/firebaseConnectionHandler'; // Using the firestore instance from your connection handler

interface AuditLogData {
  user?: string;
  action: string;
  details: Record<string, any>;
  timestamp?: any;
}

/**
 * Add an audit log entry to Firestore
 * @param logData The audit log data to store
 * @returns The ID of the created audit log document
 */
export const addAuditLog = async (logData: AuditLogData): Promise<string> => {
  try {
    const auditLog = {
      ...logData,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(firestore, "auditLogs"), auditLog);
    console.log("✅ Audit log added:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding audit log:", error);
    throw error;
  }
};
