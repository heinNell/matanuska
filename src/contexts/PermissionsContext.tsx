// src/contexts/PermissionsContext.tsx
import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';

/**
 * Phase 2 - Task 2.2.3: Create PermissionsContext for location/notification permissions
 * Handles device permissions with proper state management and error handling
 */

type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unknown';

interface PermissionState {
  status: PermissionStatus;
  lastRequested: Date | null;
  error: string | null;
}

interface PermissionsState {
  // Location permissions
  location: PermissionState;
  backgroundLocation: PermissionState;

  // Notification permissions
  notifications: PermissionState;

  // Camera/Media permissions (for future use)
  camera: PermissionState;

  // Overall state
  isInitialized: boolean;
  isChecking: boolean;
}

type PermissionsAction =
  | { type: 'SET_PERMISSION'; payload: { permission: keyof PermissionsState; status: PermissionStatus; error?: string } }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_CHECKING'; payload: boolean }
  | { type: 'CLEAR_ERRORS' };

const initialPermissionState: PermissionState = {
  status: 'unknown',
  lastRequested: null,
  error: null,
};

const initialState: PermissionsState = {
  location: { ...initialPermissionState },
  backgroundLocation: { ...initialPermissionState },
  notifications: { ...initialPermissionState },
  camera: { ...initialPermissionState },
  isInitialized: false,
  isChecking: false,
};

function permissionsReducer(state: PermissionsState, action: PermissionsAction): PermissionsState {
  switch (action.type) {
    case 'SET_PERMISSION': {
      const { permission, status, error } = action.payload;
      if (permission === 'isInitialized' || permission === 'isChecking') {
        return state; // Skip non-permission properties
      }

      return {
        ...state,
        [permission]: {
          status,
          lastRequested: new Date(),
          error: error || null,
        },
      };
    }

    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };

    case 'SET_CHECKING':
      return { ...state, isChecking: action.payload };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        location: { ...state.location, error: null },
        backgroundLocation: { ...state.backgroundLocation, error: null },
        notifications: { ...state.notifications, error: null },
        camera: { ...state.camera, error: null },
      };

    default:
      return state;
  }
}

interface PermissionsContextValue extends PermissionsState {
  // Permission checking
  checkAllPermissions: () => Promise<void>;
  checkLocationPermission: () => Promise<PermissionStatus>;
  checkNotificationPermission: () => Promise<PermissionStatus>;

  // Permission requesting
  requestLocationPermission: () => Promise<PermissionStatus>;
  requestNotificationPermission: () => Promise<PermissionStatus>;
  requestBackgroundLocationPermission: () => Promise<PermissionStatus>;

  // Utilities
  hasLocationPermission: () => boolean;
  hasNotificationPermission: () => boolean;
  canRequestPermission: (permission: keyof PermissionsState) => boolean;
  clearErrors: () => void;

  // Geolocation utilities
  getCurrentPosition: () => Promise<GeolocationPosition | null>;
  watchPosition: (callback: (position: GeolocationPosition) => void) => number | null;
  clearWatch: (watchId: number) => void;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

interface PermissionsProviderProps {
  children: React.ReactNode;
  autoCheck?: boolean;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({
  children,
  autoCheck = true
}) => {
  const [state, dispatch] = useReducer(permissionsReducer, initialState);

  // Check permissions
  const checkLocationPermission = useCallback(async (): Promise<PermissionStatus> => {
    try {
      if (!navigator.geolocation) {
        dispatch({
          type: 'SET_PERMISSION',
          payload: { permission: 'location', status: 'denied', error: 'Geolocation not supported' }
        });
        return 'denied';
      }

      // For browsers that support permissions API
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        const status = result.state as PermissionStatus;

        dispatch({
          type: 'SET_PERMISSION',
          payload: { permission: 'location', status }
        });

        return status;
      }

      // Fallback for older browsers
      dispatch({
        type: 'SET_PERMISSION',
        payload: { permission: 'location', status: 'prompt' }
      });

      return 'prompt';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({
        type: 'SET_PERMISSION',
        payload: { permission: 'location', status: 'denied', error: errorMessage }
      });
      return 'denied';
    }
  }, []);

  const checkNotificationPermission = useCallback(async (): Promise<PermissionStatus> => {
    try {
      if (!('Notification' in window)) {
        dispatch({
          type: 'SET_PERMISSION',
          payload: { permission: 'notifications', status: 'denied', error: 'Notifications not supported' }
        });
        return 'denied';
      }

      const permission = Notification.permission as PermissionStatus;
      dispatch({
        type: 'SET_PERMISSION',
        payload: { permission: 'notifications', status: permission }
      });

      return permission;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({
        type: 'SET_PERMISSION',
        payload: { permission: 'notifications', status: 'denied', error: errorMessage }
      });
      return 'denied';
    }
  }, []);

  const checkAllPermissions = useCallback(async (): Promise<void> => {
    dispatch({ type: 'SET_CHECKING', payload: true });

    try {
      await Promise.all([
        checkLocationPermission(),
        checkNotificationPermission()
      ]);
    } finally {
      dispatch({ type: 'SET_CHECKING', payload: false });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    }
  }, [checkLocationPermission, checkNotificationPermission]);

  // Request permissions
  const requestLocationPermission = useCallback(async (): Promise<PermissionStatus> => {
    try {
      if (!navigator.geolocation) {
        return 'denied';
      }

      return new Promise<PermissionStatus>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => {
            dispatch({
              type: 'SET_PERMISSION',
              payload: { permission: 'location', status: 'granted' }
            });
            resolve('granted');
          },
          (error) => {
            let status: PermissionStatus = 'denied';
            let errorMessage = 'Location access denied';

            switch (error.code) {
              case error.PERMISSION_DENIED:
                status = 'denied';
                errorMessage = 'Location permission denied by user';
                break;
              case error.POSITION_UNAVAILABLE:
                status = 'denied';
                errorMessage = 'Location information unavailable';
                break;
              case error.TIMEOUT:
                status = 'prompt';
                errorMessage = 'Location request timed out';
                break;
            }

            dispatch({
              type: 'SET_PERMISSION',
              payload: { permission: 'location', status, error: errorMessage }
            });
            resolve(status);
          },
          { timeout: 10000 }
        );
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({
        type: 'SET_PERMISSION',
        payload: { permission: 'location', status: 'denied', error: errorMessage }
      });
      return 'denied';
    }
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<PermissionStatus> => {
    try {
      if (!('Notification' in window)) {
        return 'denied';
      }

      const permission = await Notification.requestPermission() as PermissionStatus;
      dispatch({
        type: 'SET_PERMISSION',
        payload: { permission: 'notifications', status: permission }
      });

      return permission;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({
        type: 'SET_PERMISSION',
        payload: { permission: 'notifications', status: 'denied', error: errorMessage }
      });
      return 'denied';
    }
  }, []);

  const requestBackgroundLocationPermission = useCallback(async (): Promise<PermissionStatus> => {
    // Background location requires special handling and is platform-specific
    // For now, we'll treat it the same as regular location permission
    const status = await requestLocationPermission();
    dispatch({
      type: 'SET_PERMISSION',
      payload: { permission: 'backgroundLocation', status }
    });
    return status;
  }, [requestLocationPermission]);

  // Utility functions
  const hasLocationPermission = useCallback((): boolean => {
    return state.location.status === 'granted';
  }, [state.location.status]);

  const hasNotificationPermission = useCallback((): boolean => {
    return state.notifications.status === 'granted';
  }, [state.notifications.status]);

  const canRequestPermission = useCallback((permission: keyof PermissionsState): boolean => {
    if (permission === 'isInitialized' || permission === 'isChecking') {
      return false;
    }

    const permState = state[permission] as PermissionState;
    return permState.status === 'prompt' || permState.status === 'unknown';
  }, [state]);

  const clearErrors = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  // Geolocation utilities
  const getCurrentPosition = useCallback(async (): Promise<GeolocationPosition | null> => {
    if (!hasLocationPermission()) {
      const status = await requestLocationPermission();
      if (status !== 'granted') {
        return null;
      }
    }

    return new Promise<GeolocationPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          console.error('Geolocation error:', error);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, [hasLocationPermission, requestLocationPermission]);

  const watchPosition = useCallback((callback: (position: GeolocationPosition) => void): number | null => {
    if (!hasLocationPermission()) {
      console.warn('Location permission not granted');
      return null;
    }

    return navigator.geolocation.watchPosition(
      callback,
      (error) => console.error('Watch position error:', error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [hasLocationPermission]);

  const clearWatch = useCallback((watchId: number): void => {
    navigator.geolocation.clearWatch(watchId);
  }, []);

  // Auto-check permissions on mount
  useEffect(() => {
    if (autoCheck && !state.isInitialized) {
      checkAllPermissions();
    }
  }, [autoCheck, state.isInitialized, checkAllPermissions]);

  // Listen for permission changes
  useEffect(() => {
    if ('permissions' in navigator) {
      const handlePermissionChange = () => {
        checkAllPermissions();
      };

      // Check for permission changes periodically
      const interval = setInterval(() => {
        if (state.isInitialized) {
          checkAllPermissions();
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [checkAllPermissions, state.isInitialized]);

  const contextValue: PermissionsContextValue = {
    ...state,
    checkAllPermissions,
    checkLocationPermission,
    checkNotificationPermission,
    requestLocationPermission,
    requestNotificationPermission,
    requestBackgroundLocationPermission,
    hasLocationPermission,
    hasNotificationPermission,
    canRequestPermission,
    clearErrors,
    getCurrentPosition,
    watchPosition,
    clearWatch,
  };

  return (
    <PermissionsContext.Provider value={contextValue}>
      {children}
    </PermissionsContext.Provider>
  );
};

export { PermissionsContext };
export default PermissionsProvider;
