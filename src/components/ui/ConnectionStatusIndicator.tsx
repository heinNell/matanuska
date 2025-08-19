import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, RefreshCw, WifiLow } from 'lucide-react';
import {
  onConnectionStatusChanged,
  getConnectionStatus,
  attemptReconnect
} from '../../utils/firebaseConnectionHandler';
import type { ConnectionStatus } from '../../types/connection';
import useNetworkStatus from '../../hooks/useNetworkStatus';

interface ConnectionStatusIndicatorProps {
  showText?: boolean;
  className?: string;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  showText = false,
  className = ''
}) => {
  const [status, setStatus] = useState<ConnectionStatus>(getConnectionStatus().status);
  const [error, setError] = useState<Error | null>(getConnectionStatus().error);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const networkStatus = useNetworkStatus();

  useEffect(() => {
    // Subscribe to connection status changes
    const unsubscribe = onConnectionStatusChanged((newStatus, newError) => {
      setStatus(newStatus);
      setError(newError || null);
    });

    return unsubscribe;
  }, []);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      // Check network connectivity first
      await networkStatus.checkConnection();

      if (networkStatus.isOnline) {
        await attemptReconnect();
      }
    } finally {
      setIsReconnecting(false);
    }
  };

  // Render different indicators based on status and network quality
  const renderIndicator = () => {
    // If network is being checked or reconnecting
  if (networkStatus.isChecking || isReconnecting || status === 'reconnecting') {
      return (
        <div className="flex items-center text-blue-600">
          <RefreshCw className="w-4 h-4 animate-spin" />
      {showText && <span className="ml-2 text-sm">Checking connection...</span>}
        </div>
      );
    }

    // If network is limited (connected to internet but not to Firebase)
    if (networkStatus.isLimited) {
      return (
        <div className="flex items-center text-amber-600">
          <WifiLow className="w-4 h-4" />
          {showText && <span className="ml-2 text-sm">Limited Connectivity</span>}
          <button
            onClick={handleReconnect}
            className="ml-2 p-1 rounded hover:bg-gray-100"
            disabled={isReconnecting}
            title="Try to reconnect"
          >
            <RefreshCw className={`w-3 h-3 text-amber-600 ${isReconnecting ? 'animate-spin' : ''}`} />
          </button>
        </div>
      );
    }

    // If network is offline
    if (networkStatus.isOffline) {
      return (
        <div className="flex items-center text-amber-600">
          <WifiOff className="w-4 h-4" />
          {showText && <span className="ml-2 text-sm">Offline Mode</span>}
          <button
            onClick={handleReconnect}
            className="ml-2 p-1 rounded hover:bg-gray-100"
            disabled={isReconnecting}
            title="Try to reconnect"
          >
            <RefreshCw className={`w-3 h-3 text-amber-600 ${isReconnecting ? 'animate-spin' : ''}`} />
          </button>
        </div>
      );
    }

    // If Firestore status is used for the rest
    switch (status) {
      case 'connected':
        return (
          <div className="flex items-center text-green-600">
            <Wifi className="w-4 h-4" />
            {showText && (
              <span className="ml-2 text-sm">
                Connected
                {networkStatus.quality === 'poor' &&
                  <span className="text-xs ml-1">(Slow)</span>
                }
              </span>
            )}
          </div>
        );

      case 'disconnected':
        return (
          <div className="flex items-center text-amber-600">
            <WifiOff className="w-4 h-4" />
            {showText && <span className="ml-2 text-sm">Offline Mode</span>}
            <button
              onClick={handleReconnect}
              className="ml-2 p-1 rounded hover:bg-gray-100"
              disabled={isReconnecting}
              title="Try to reconnect"
            >
              <RefreshCw className={`w-3 h-3 text-amber-600 ${isReconnecting ? 'animate-spin' : ''}`} />
            </button>
          </div>
        );

      case 'connecting':
        return (
          <div className="flex items-center text-blue-600">
            <RefreshCw className="w-4 h-4 animate-spin" />
            {showText && <span className="ml-2 text-sm">Connecting...</span>}
          </div>
        );

      case 'error':
        return (
          <div className="flex items-center text-red-600">
            <AlertTriangle className="w-4 h-4" />
            {showText && (
              <span className="ml-2 text-sm">
                Connection Error
                {error && <span className="hidden md:inline"> - {error.message}</span>}
              </span>
            )}
            <button
              onClick={handleReconnect}
              className="ml-2 p-1 rounded hover:bg-gray-100"
              disabled={isReconnecting}
              title="Try to reconnect"
            >
              <RefreshCw className={`w-3 h-3 text-red-600 ${isReconnecting ? 'animate-spin' : ''}`} />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      {renderIndicator()}
    </div>
  );
};

export default ConnectionStatusIndicator;
