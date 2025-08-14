/**
 * Network Detection and Recovery Utility
 * 
 * This utility provides enhanced network state detection beyond the basic
 * browser 'online' and 'offline' events. It performs active checks against
 * actual endpoints to determine if connectivity is working properly.
 */

type NetworkStatus = 'online' | 'offline' | 'checking' | 'limited';
type ConnectionQuality = 'good' | 'poor' | 'bad' | 'unknown';

interface NetworkState {
  status: NetworkStatus;
  quality: ConnectionQuality;
  latency: number | null;
  lastChecked: Date | null;
  isFirebaseReachable: boolean;
  isInternetReachable: boolean;
}

const PING_ENDPOINTS = [
  'https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel',
  'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js',
  'https://www.google.com/favicon.ico'
];

const initialState: NetworkState = {
  status: navigator.onLine ? 'online' : 'offline',
  quality: 'unknown',
  latency: null,
  lastChecked: null,
  isFirebaseReachable: false,
  isInternetReachable: false
};

let currentState: NetworkState = { ...initialState };
let listeners: ((state: NetworkState) => void)[] = [];
let checkInProgress = false;
let periodicCheckTimer: number | null = null;

/**
 * Performs active network connectivity checks
 */
export const checkNetworkConnectivity = async (forceCheck = false): Promise<NetworkState> => {
  if (checkInProgress && !forceCheck) {
    return currentState;
  }
  
  checkInProgress = true;
  
  // Update status to checking during the check
  updateState({
    ...currentState,
    status: 'checking'
  });

  // Quick check for basic connectivity
  if (!navigator.onLine) {
    updateState({
      ...currentState,
      status: 'offline',
      quality: 'bad',
      isFirebaseReachable: false,
      isInternetReachable: false,
      lastChecked: new Date()
    });
    checkInProgress = false;
    return currentState;
  }

  try {
    // Test Firebase reachability
    const firebaseEndpoint = PING_ENDPOINTS[0];
    const googleEndpoint = PING_ENDPOINTS[2];
    
    const startTime = Date.now();
    
    const [firebaseResponse, googleResponse] = await Promise.allSettled([
      pingEndpoint(firebaseEndpoint, 5000),
      pingEndpoint(googleEndpoint, 5000)
    ]);
    
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    const isFirebaseReachable = firebaseResponse.status === 'fulfilled' && firebaseResponse.value;
    const isInternetReachable = googleResponse.status === 'fulfilled' && googleResponse.value;
    
    let status: NetworkStatus = 'offline';
    let quality: ConnectionQuality = 'bad';
    
    if (isFirebaseReachable && isInternetReachable) {
      status = 'online';
      quality = latency < 300 ? 'good' : latency < 1000 ? 'poor' : 'bad';
    } else if (isInternetReachable) {
      status = 'limited';
      quality = 'poor';
    }
    
    updateState({
      status,
      quality,
      latency,
      lastChecked: new Date(),
      isFirebaseReachable,
      isInternetReachable
    });
  } catch (error) {
    console.error('Error checking network connectivity:', error);
    
    updateState({
      ...currentState,
      status: 'offline',
      quality: 'bad',
      isFirebaseReachable: false,
      isInternetReachable: false,
      lastChecked: new Date()
    });
  }
  
  checkInProgress = false;
  return currentState;
};

/**
 * Ping an endpoint to check if it's reachable
 */
const pingEndpoint = async (url: string, timeout: number = 5000): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Update the network state and notify listeners
 */
const updateState = (newState: NetworkState): void => {
  currentState = newState;
  listeners.forEach(listener => listener(currentState));
};

/**
 * Start periodic network checks
 */
export const startNetworkMonitoring = (checkIntervalMs: number = 30000): void => {
  // Perform initial check
  checkNetworkConnectivity();
  
  // Set up event listeners
  window.addEventListener('online', () => {
    checkNetworkConnectivity();
  });
  
  window.addEventListener('offline', () => {
    updateState({
      ...currentState,
      status: 'offline',
      quality: 'bad',
      isFirebaseReachable: false,
      isInternetReachable: false,
      lastChecked: new Date()
    });
  });
  
  // Set up periodic checking
  if (periodicCheckTimer === null) {
    periodicCheckTimer = window.setInterval(() => {
      checkNetworkConnectivity();
    }, checkIntervalMs);
  }
};

/**
 * Stop periodic network checks
 */
export const stopNetworkMonitoring = (): void => {
  if (periodicCheckTimer !== null) {
    clearInterval(periodicCheckTimer);
    periodicCheckTimer = null;
  }
};

/**
 * Subscribe to network state changes
 */
export const subscribeToNetworkChanges = (
  callback: (state: NetworkState) => void
): () => void => {
  listeners.push(callback);
  
  // Call immediately with current state
  callback(currentState);
  
  // Return unsubscribe function
  return () => {
    listeners = listeners.filter(listener => listener !== callback);
  };
};

/**
 * Get the current network state
 */
export const getNetworkState = (): NetworkState => {
  return currentState;
};

// Start monitoring by default when this module is imported
startNetworkMonitoring();

export default {
  checkNetworkConnectivity,
  startNetworkMonitoring,
  stopNetworkMonitoring,
  subscribeToNetworkChanges,
  getNetworkState
};
