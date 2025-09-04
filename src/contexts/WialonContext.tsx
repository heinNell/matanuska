// src/contexts/WialonContext.tsx
import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { WialonServiceComplete } from '../services/WialonServiceComplete';
import { wialonDataManager } from '../services/WialonDataManager';
import type {
  WialonUnitDetailed,
  WialonSystemData,
  WialonUser,
  WialonSessionInfo,
  WialonError
} from '../types/wialon-complete';

/**
 * Phase 2 - Task 2.2.1: Create WialonContext with comprehensive state management
 */

interface WialonState {
  // Authentication
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionInfo: WialonSessionInfo | null;
  user: WialonUser | null;

  // Data
  units: WialonUnitDetailed[];
  systemData: WialonSystemData | null;

  // Status
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastError: WialonError | null;

  // Real-time
  isPolling: boolean;
  lastUpdate: Date | null;
}

type WialonAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_SESSION_INFO'; payload: WialonSessionInfo | null }
  | { type: 'SET_USER'; payload: WialonUser | null }
  | { type: 'SET_UNITS'; payload: WialonUnitDetailed[] }
  | { type: 'SET_SYSTEM_DATA'; payload: WialonSystemData | null }
  | { type: 'SET_CONNECTION_STATUS'; payload: WialonState['connectionStatus'] }
  | { type: 'SET_ERROR'; payload: WialonError | null }
  | { type: 'SET_POLLING'; payload: boolean }
  | { type: 'SET_LAST_UPDATE'; payload: Date }
  | { type: 'RESET_STATE' };

const initialState: WialonState = {
  isAuthenticated: false,
  isLoading: false,
  sessionInfo: null,
  user: null,
  units: [],
  systemData: null,
  connectionStatus: 'disconnected',
  lastError: null,
  isPolling: false,
  lastUpdate: null,
};

function wialonReducer(state: WialonState, action: WialonAction): WialonState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_SESSION_INFO':
      return { ...state, sessionInfo: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_UNITS':
      return { ...state, units: action.payload, lastUpdate: new Date() };
    case 'SET_SYSTEM_DATA':
      return { ...state, systemData: action.payload };
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    case 'SET_ERROR':
      return { ...state, lastError: action.payload };
    case 'SET_POLLING':
      return { ...state, isPolling: action.payload };
    case 'SET_LAST_UPDATE':
      return { ...state, lastUpdate: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

interface WialonContextValue extends WialonState {
  // Actions
  login: (token: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
  startRealTimeUpdates: () => void;
  stopRealTimeUpdates: () => void;

  // Data fetching
  getUnits: () => Promise<WialonUnitDetailed[]>;
  getSystemData: () => Promise<WialonSystemData | null>;

  // Utilities
  clearError: () => void;
  isUnitOnline: (unitId: string) => boolean;
}

const WialonContext = createContext<WialonContextValue | null>(null);

export const useWialonContext = () => {
  const context = useContext(WialonContext);
  if (!context) {
    throw new Error('useWialonContext must be used within a WialonProvider');
  }
  return context;
};

interface WialonProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
  pollingInterval?: number;
}

export const WialonProvider: React.FC<WialonProviderProps> = ({
  children,
  autoConnect = true,
  pollingInterval = 5000
}) => {
  const [state, dispatch] = useReducer(wialonReducer, initialState);

  // Initialize Wialon service
  const wialonService = new WialonServiceComplete();

  const login = useCallback(async (token: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connecting' });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const result = await wialonService.login(token);

      if (result.success && result.data) {
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        dispatch({ type: 'SET_SESSION_INFO', payload: result.data });
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });

        // Initialize data manager
        await wialonDataManager.initialize();

        // Load initial data
        await refreshData();

        return true;
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      const wialonError: WialonError = {
        code: 'LOGIN_FAILED',
        message: error instanceof Error ? error.message : 'Unknown login error',
        details: error
      };

      dispatch({ type: 'SET_ERROR', payload: wialonError });
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'error' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await wialonService.logout();
      wialonDataManager.stopPolling();
      dispatch({ type: 'RESET_STATE' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const refreshData = useCallback(async (): Promise<void> => {
    if (!state.isAuthenticated) return;

    try {
      // Get units
      const units = await getUnits();
      dispatch({ type: 'SET_UNITS', payload: units });

      // Get system data
      const systemData = await getSystemData();
      dispatch({ type: 'SET_SYSTEM_DATA', payload: systemData });

      dispatch({ type: 'SET_LAST_UPDATE', payload: new Date() });
    } catch (error) {
      const wialonError: WialonError = {
        code: 'REFRESH_FAILED',
        message: error instanceof Error ? error.message : 'Failed to refresh data',
        details: error
      };
      dispatch({ type: 'SET_ERROR', payload: wialonError });
    }
  }, [state.isAuthenticated]);

  const getUnits = useCallback(async (): Promise<WialonUnitDetailed[]> => {
    const result = await wialonService.searchUnits({
      itemsType: 'avl_unit',
      propName: 'sys_name',
      propValueMask: '*',
      sortType: 'sys_name'
    });

    if (result.success && result.data) {
      return result.data as WialonUnitDetailed[];
    }
    return [];
  }, []);

  const getSystemData = useCallback(async (): Promise<WialonSystemData | null> => {
    const result = await wialonService.getSystemData();
    return result.success && result.data ? result.data : null;
  }, []);

  const startRealTimeUpdates = useCallback((): void => {
    if (!state.isPolling && state.isAuthenticated) {
      wialonDataManager.startPolling(pollingInterval);
      dispatch({ type: 'SET_POLLING', payload: true });

      // Subscribe to data manager updates
      wialonDataManager.subscribe('units', (data) => {
        dispatch({ type: 'SET_UNITS', payload: data as WialonUnitDetailed[] });
      });
    }
  }, [state.isPolling, state.isAuthenticated, pollingInterval]);

  const stopRealTimeUpdates = useCallback((): void => {
    if (state.isPolling) {
      wialonDataManager.stopPolling();
      dispatch({ type: 'SET_POLLING', payload: false });
    }
  }, [state.isPolling]);

  const clearError = useCallback((): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const isUnitOnline = useCallback((unitId: string): boolean => {
    const unit = state.units.find(u => u.id === parseInt(unitId));
    return unit?.lmsg?.t ? (Date.now() - unit.lmsg.t * 1000) < 300000 : false; // 5 minutes
  }, [state.units]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      // Try to get token from environment or storage
      const token = process.env.REACT_APP_WIALON_TOKEN || 'c1099bc37c906fd0832d8e783b60ae0d';
      if (token && !state.isAuthenticated) {
        login(token);
      }
    }
  }, [autoConnect, state.isAuthenticated, login]);

  // Start polling when authenticated
  useEffect(() => {
    if (state.isAuthenticated && !state.isPolling && autoConnect) {
      startRealTimeUpdates();
    }
  }, [state.isAuthenticated, state.isPolling, autoConnect, startRealTimeUpdates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRealTimeUpdates();
    };
  }, [stopRealTimeUpdates]);

  const contextValue: WialonContextValue = {
    ...state,
    login,
    logout,
    refreshData,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    getUnits,
    getSystemData,
    clearError,
    isUnitOnline,
  };

  return (
    <WialonContext.Provider value={contextValue}>
      {children}
    </WialonContext.Provider>
  );
};

export { WialonContext };
export default WialonProvider;
