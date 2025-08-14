import { useState, useEffect } from 'react';
import { subscribeToNetworkChanges, getNetworkState, checkNetworkConnectivity } from '../utils/networkDetection';

/**
 * A hook for monitoring network connectivity status
 * 
 * @returns An object containing network state information and functions
 */
const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState(getNetworkState());
  const [isCheckingNetwork, setIsCheckingNetwork] = useState(false);

  useEffect(() => {
    // Subscribe to network changes
    const unsubscribe = subscribeToNetworkChanges((newState) => {
      setNetworkState(newState);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Manually check network status
   */
  const checkConnection = async () => {
    setIsCheckingNetwork(true);
    try {
      await checkNetworkConnectivity(true);
    } finally {
      setIsCheckingNetwork(false);
    }
  };

  return {
    ...networkState,
    isOnline: networkState.status === 'online',
    isOffline: networkState.status === 'offline',
    isLimited: networkState.status === 'limited',
    isChecking: networkState.status === 'checking' || isCheckingNetwork,
    checkConnection
  };
};

export default useNetworkStatus;
