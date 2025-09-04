// src/contexts/DataContext.tsx
import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { wialonDataManager } from '../services/WialonDataManager';
import type {
  WialonUnitDetailed,
  WialonUnitProcessed,
  WialonFleetStatus,
  WialonReportProcessed,
  WialonReportConfig,
  DataSubscriber
} from '../types/wialon-complete';

/**
 * Phase 2 - Task 2.2.2: Create DataContext for cached data management
 * Provides centralized caching, real-time updates, and data synchronization
 */

interface DataState {
  // Cached units data
  units: WialonUnitDetailed[];
  unitsProcessed: WialonUnitProcessed[];

  // Fleet overview
  fleetStatus: WialonFleetStatus | null;

  // Reports cache
  reports: Map<string, WialonReportProcessed>;

  // Cache status
  cacheHealth: {
    hitRate: number;
    totalRequests: number;
    cacheHits: number;
    lastCleanup: Date | null;
  };

  // Real-time status
  isPolling: boolean;
  lastSync: Date | null;
  syncErrors: string[];

  // Loading states
  loading: {
    units: boolean;
    fleetStatus: boolean;
    reports: Set<string>;
  };
}

type DataAction =
  | { type: 'SET_UNITS'; payload: WialonUnitDetailed[] }
  | { type: 'SET_UNITS_PROCESSED'; payload: WialonUnitProcessed[] }
  | { type: 'SET_FLEET_STATUS'; payload: WialonFleetStatus }
  | { type: 'SET_REPORT'; payload: { key: string; report: WialonReportProcessed } }
  | { type: 'UPDATE_CACHE_STATS'; payload: Partial<DataState['cacheHealth']> }
  | { type: 'SET_POLLING'; payload: boolean }
  | { type: 'SET_LAST_SYNC'; payload: Date }
  | { type: 'ADD_SYNC_ERROR'; payload: string }
  | { type: 'CLEAR_SYNC_ERRORS' }
  | { type: 'SET_LOADING'; payload: { key: keyof DataState['loading']; value: boolean | string } }
  | { type: 'CLEAR_CACHE' };

const initialState: DataState = {
  units: [],
  unitsProcessed: [],
  fleetStatus: null,
  reports: new Map(),
  cacheHealth: {
    hitRate: 0,
    totalRequests: 0,
    cacheHits: 0,
    lastCleanup: null,
  },
  isPolling: false,
  lastSync: null,
  syncErrors: [],
  loading: {
    units: false,
    fleetStatus: false,
    reports: new Set(),
  },
};

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_UNITS':
      return {
        ...state,
        units: action.payload,
        lastSync: new Date(),
        loading: { ...state.loading, units: false }
      };

    case 'SET_UNITS_PROCESSED':
      return {
        ...state,
        unitsProcessed: action.payload,
        lastSync: new Date()
      };

    case 'SET_FLEET_STATUS':
      return {
        ...state,
        fleetStatus: action.payload,
        lastSync: new Date(),
        loading: { ...state.loading, fleetStatus: false }
      };

    case 'SET_REPORT': {
      const newReports = new Map(state.reports);
      newReports.set(action.payload.key, action.payload.report);
      const newReportsSet = new Set(state.loading.reports);
      newReportsSet.delete(action.payload.key);

      return {
        ...state,
        reports: newReports,
        loading: { ...state.loading, reports: newReportsSet }
      };
    }

    case 'UPDATE_CACHE_STATS':
      return {
        ...state,
        cacheHealth: { ...state.cacheHealth, ...action.payload }
      };

    case 'SET_POLLING':
      return { ...state, isPolling: action.payload };

    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload };

    case 'ADD_SYNC_ERROR':
      return {
        ...state,
        syncErrors: [...state.syncErrors, action.payload].slice(-10) // Keep last 10 errors
      };

    case 'CLEAR_SYNC_ERRORS':
      return { ...state, syncErrors: [] };

    case 'SET_LOADING':
      if (typeof action.payload.value === 'string') {
        // For reports set
        const reportsSet = new Set(state.loading.reports);
        if (action.payload.key === 'reports') {
          reportsSet.add(action.payload.value);
        }
        return {
          ...state,
          loading: { ...state.loading, reports: reportsSet }
        };
      } else {
        return {
          ...state,
          loading: { ...state.loading, [action.payload.key]: action.payload.value }
        };
      }

    case 'CLEAR_CACHE':
      return {
        ...state,
        units: [],
        unitsProcessed: [],
        fleetStatus: null,
        reports: new Map(),
        cacheHealth: { ...initialState.cacheHealth, lastCleanup: new Date() }
      };

    default:
      return state;
  }
}

interface DataContextValue extends DataState {
  // Data operations
  refreshUnits: () => Promise<WialonUnitDetailed[]>;
  getUnitDetails: (unitId: string) => Promise<WialonUnitDetailed | null>;
  getFleetStatus: () => Promise<WialonFleetStatus>;
  executeReport: (config: WialonReportConfig) => Promise<WialonReportProcessed | null>;

  // Cache operations
  clearCache: () => void;
  getCacheStats: () => DataState['cacheHealth'];
  preloadData: () => Promise<void>;

  // Real-time operations
  startDataPolling: () => void;
  stopDataPolling: () => void;

  // Utilities
  clearErrors: () => void;
  getUnitById: (unitId: string) => WialonUnitDetailed | undefined;
  isUnitLoaded: (unitId: string) => boolean;
}

const DataContext = createContext<DataContextValue | null>(null);

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: React.ReactNode;
  enableAutoRefresh?: boolean;
  cacheTimeout?: number;
}

export const DataProvider: React.FC<DataProviderProps> = ({
  children,
  enableAutoRefresh = true,
  cacheTimeout = 300000 // 5 minutes
}) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Data operations
  const refreshUnits = useCallback(async (): Promise<WialonUnitDetailed[]> => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'units', value: true } });

    try {
      const units = await wialonDataManager.getUnits();
      dispatch({ type: 'SET_UNITS', payload: units });

      // Update cache stats
      dispatch({
        type: 'UPDATE_CACHE_STATS',
        payload: { totalRequests: state.cacheHealth.totalRequests + 1 }
      });

      return units;
    } catch (error) {
      dispatch({
        type: 'ADD_SYNC_ERROR',
        payload: `Failed to refresh units: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      dispatch({ type: 'SET_LOADING', payload: { key: 'units', value: false } });
      return [];
    }
  }, [state.cacheHealth.totalRequests]);

  const getUnitDetails = useCallback(async (unitId: string): Promise<WialonUnitDetailed | null> => {
    try {
      const unit = await wialonDataManager.getUnitDetails(unitId);

      if (unit) {
        // Update units array with new details
        const updatedUnits = state.units.map(u =>
          u.id === parseInt(unitId) ? unit : u
        );

        if (!updatedUnits.find(u => u.id === parseInt(unitId))) {
          updatedUnits.push(unit);
        }

        dispatch({ type: 'SET_UNITS', payload: updatedUnits });
      }

      return unit;
    } catch (error) {
      dispatch({
        type: 'ADD_SYNC_ERROR',
        payload: `Failed to get unit details for ${unitId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      return null;
    }
  }, [state.units]);

  const getFleetStatus = useCallback(async (): Promise<WialonFleetStatus> => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'fleetStatus', value: true } });

    try {
      const fleetStatus = await wialonDataManager.getFleetStatus();
      dispatch({ type: 'SET_FLEET_STATUS', payload: fleetStatus });
      return fleetStatus;
    } catch (error) {
      dispatch({
        type: 'ADD_SYNC_ERROR',
        payload: `Failed to get fleet status: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      dispatch({ type: 'SET_LOADING', payload: { key: 'fleetStatus', value: false } });

      // Return empty fleet status
      return {
        totalUnits: 0,
        onlineUnits: 0,
        offlineUnits: 0,
        movingUnits: 0,
        stoppedUnits: 0,
        idleUnits: 0,
        alertsCount: 0,
        lastUpdate: new Date()
      };
    }
  }, []);

  const executeReport = useCallback(async (config: WialonReportConfig): Promise<WialonReportProcessed | null> => {
    const reportKey = `report_${Date.now()}`;
    dispatch({ type: 'SET_LOADING', payload: { key: 'reports', value: reportKey } });

    try {
      const report = await wialonDataManager.executeReport(config);

      if (report) {
        dispatch({
          type: 'SET_REPORT',
          payload: { key: reportKey, report }
        });
      }

      return report;
    } catch (error) {
      dispatch({
        type: 'ADD_SYNC_ERROR',
        payload: `Failed to execute report: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

      const reportsSet = new Set(state.loading.reports);
      reportsSet.delete(reportKey);
      dispatch({ type: 'SET_LOADING', payload: { key: 'reports', value: false } });

      return null;
    }
  }, [state.loading.reports]);

  // Cache operations
  const clearCache = useCallback((): void => {
    wialonDataManager.clearCache();
    dispatch({ type: 'CLEAR_CACHE' });
  }, []);

  const getCacheStats = useCallback((): DataState['cacheHealth'] => {
    return state.cacheHealth;
  }, [state.cacheHealth]);

  const preloadData = useCallback(async (): Promise<void> => {
    try {
      await Promise.all([
        refreshUnits(),
        getFleetStatus()
      ]);
    } catch (error) {
      console.error('Preload failed:', error);
    }
  }, [refreshUnits, getFleetStatus]);

  // Real-time operations
  const startDataPolling = useCallback((): void => {
    if (!state.isPolling) {
      wialonDataManager.startPolling(5000);
      dispatch({ type: 'SET_POLLING', payload: true });

      // Subscribe to data manager updates
      const subscriber: DataSubscriber = (data) => {
        if (Array.isArray(data)) {
          dispatch({ type: 'SET_UNITS', payload: data as WialonUnitDetailed[] });
        }
      };

      wialonDataManager.subscribe('units', subscriber);
    }
  }, [state.isPolling]);

  const stopDataPolling = useCallback((): void => {
    if (state.isPolling) {
      wialonDataManager.stopPolling();
      dispatch({ type: 'SET_POLLING', payload: false });
    }
  }, [state.isPolling]);

  // Utilities
  const clearErrors = useCallback((): void => {
    dispatch({ type: 'CLEAR_SYNC_ERRORS' });
  }, []);

  const getUnitById = useCallback((unitId: string): WialonUnitDetailed | undefined => {
    return state.units.find(unit => unit.id === parseInt(unitId));
  }, [state.units]);

  const isUnitLoaded = useCallback((unitId: string): boolean => {
    return state.units.some(unit => unit.id === parseInt(unitId));
  }, [state.units]);

  // Auto-start polling if enabled
  useEffect(() => {
    if (enableAutoRefresh && !state.isPolling) {
      startDataPolling();
    }

    return () => {
      if (state.isPolling) {
        stopDataPolling();
      }
    };
  }, [enableAutoRefresh, state.isPolling, startDataPolling, stopDataPolling]);

  // Auto-cleanup cache periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      dispatch({
        type: 'UPDATE_CACHE_STATS',
        payload: { lastCleanup: new Date() }
      });
    }, cacheTimeout);

    return () => clearInterval(cleanup);
  }, [cacheTimeout]);

  const contextValue: DataContextValue = {
    ...state,
    refreshUnits,
    getUnitDetails,
    getFleetStatus,
    executeReport,
    clearCache,
    getCacheStats,
    preloadData,
    startDataPolling,
    stopDataPolling,
    clearErrors,
    getUnitById,
    isUnitLoaded,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export { DataContext };
export default DataProvider;
