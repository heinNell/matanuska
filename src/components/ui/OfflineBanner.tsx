import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw , AlertTriangle } from 'lucide-react';
import useNetworkStatus from '../../hooks/useNetworkStatus';
import { syncOfflineOperations } from '../../utils/offlineOperations';

const OfflineBanner: React.FC = () => {
  const networkStatus = useNetworkStatus();
  const [isVisible, setIsVisible] = useState<boolean>(networkStatus.isOffline || networkStatus.isLimited);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStats, setSyncStats] = useState<{success: number, failed: number} | null>(null);

  useEffect(() => {
    if (networkStatus.isOffline || networkStatus.isLimited) {
      setIsVisible(true);
      setIsDismissed(false);
    } else if (networkStatus.isOnline) {
      setIsVisible(false);
    }
  }, [networkStatus.isOffline, networkStatus.isLimited, networkStatus.isOnline]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handleRetry = async () => {
    await networkStatus.checkConnection();

    if (networkStatus.isOnline) {
      // If we're back online, try to sync offline operations
      setIsSyncing(true);
      try {
        const result = await syncOfflineOperations();
        setSyncStats(result);

        // Show the sync results briefly, then hide
        setTimeout(() => {
          setIsVisible(false);
          setSyncStats(null);
        }, 5000);
      } catch (error) {
        console.error('Failed to sync offline operations:', error);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  if (!isVisible || isDismissed) return null;

  const getBannerColors = () => {
    if (networkStatus.isOffline) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-400',
        text: 'text-red-800',
        buttonBg: 'bg-red-100',
        buttonText: 'text-red-800 hover:bg-red-200'
      };
    }
    if (networkStatus.isLimited) {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-400',
        text: 'text-yellow-800',
        buttonBg: 'bg-yellow-100',
        buttonText: 'text-yellow-800 hover:bg-yellow-200'
      };
    }
    return {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      text: 'text-blue-800',
      buttonBg: 'bg-blue-100',
      buttonText: 'text-blue-800 hover:bg-blue-200'
    };
  };

  const colors = getBannerColors();

  return (
    <div className={`sticky top-0 z-50 border-b ${colors.bg} ${colors.border} px-4 py-3 shadow-sm`}>
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          {networkStatus.isOffline ? (
            <WifiOff className="mr-2 h-5 w-5 text-red-500" />
          ) : (
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
          )}

          <div className="flex-1">
            <p className={`text-sm font-medium ${colors.text}`}>
              {networkStatus.isOffline
                ? "You're currently offline"
                : "You're on a limited connection"}
            </p>
            <p className="text-xs">
              {networkStatus.isOffline
                ? "Changes you make will be saved locally and synced when you're back online"
                : "Some features may be limited or slower than usual"}
            </p>

            {syncStats && (
              <div className="mt-1 text-xs">
                <span className="font-medium">Sync results:</span> {syncStats.success} successful,{' '}
                {syncStats.failed} failed
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 flex space-x-2 sm:mt-0">
          <button
            onClick={handleRetry}
            disabled={isSyncing}
            className={`flex items-center rounded px-3 py-1 text-xs font-medium ${colors.buttonBg} ${colors.buttonText}`}
          >
            <RefreshCw className={`mr-1.5 h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : networkStatus.isOffline ? 'Check Connection' : 'Retry Connection'}
          </button>

          <button
            onClick={handleDismiss}
            className="rounded px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineBanner;
