import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { firebaseApp } from '../firebaseConfig';

type ConnectionStatusType = 'connected' | 'disconnected' | 'reconnecting' | 'error';
type ConnectionListener = (status: ConnectionStatusType) => void;

// Ensure firebaseApp is defined
if (!firebaseApp) {
  throw new Error('Firebase app is not initialized');
}

// Initialize Firestore
const db = getFirestore(firebaseApp);
let connectionStatus: ConnectionStatusType = 'connected';
const listeners: ConnectionListener[] = [];

/**
 * Enable Firestore network connection
 */
export const enableFirestoreNetwork = async (): Promise<void> => {
  try {
    await enableNetwork(db);
    updateConnectionStatus('connected');
    console.log("✅ Firestore network connection enabled");
  } catch (error) {
    console.error("Error enabling Firestore network:", error);
    updateConnectionStatus('error');
    throw error;
  }
};

/**
 * Disable Firestore network connection (for offline mode)
 */
export const disableFirestoreNetwork = async (): Promise<void> => {
  try {
    await disableNetwork(db);
    updateConnectionStatus('disconnected');
    console.log("⚠️ Firestore network connection disabled");
  } catch (error) {
    console.error("Error disabling Firestore network:", error);
    updateConnectionStatus('error');
    throw error;
  }
};

/**
 * Get current connection status
 */
export const getConnectionStatus = (): ConnectionStatusType => {
  return connectionStatus;
};

/**
 * Update connection status and notify listeners
 */
const updateConnectionStatus = (status: ConnectionStatusType): void => {
  connectionStatus = status;
  notifyListeners();
};

/**
 * Register a listener for connection status changes
 */
export const addConnectionListener = (listener: ConnectionListener): void => {
  listeners.push(listener);
};

/**
 * Remove a connection status listener
 */
export const removeConnectionListener = (listener: ConnectionListener): void => {
  const index = listeners.indexOf(listener);
  if (index !== -1) {
    listeners.splice(index, 1);
  }
};

/**
 * Notify all listeners of connection status change
 */
const notifyListeners = (): void => {
  listeners.forEach(listener => listener(connectionStatus));
};
