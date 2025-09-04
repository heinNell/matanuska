// src/contexts/AppProviders.tsx
import React from 'react';
import { WialonProvider } from './WialonContext';
import { DataProvider } from './DataContext';
import { PermissionsProvider } from './PermissionsContext';

/**
 * Phase 2 - Task 2.2.4: Create combined AppProviders wrapper
 * Combines all context providers in the correct order
 */

interface AppProvidersProps {
  children: React.ReactNode;

  // Wialon Provider options
  autoConnect?: boolean;
  pollingInterval?: number;

  // Data Provider options
  enableAutoRefresh?: boolean;
  cacheTimeout?: number;

  // Permissions Provider options
  autoCheckPermissions?: boolean;
}

export const AppProviders: React.FC<AppProvidersProps> = ({
  children,
  autoConnect = true,
  pollingInterval = 5000,
  enableAutoRefresh = true,
  cacheTimeout = 300000, // 5 minutes
  autoCheckPermissions = true,
}) => {
  return (
    <PermissionsProvider autoCheck={autoCheckPermissions}>
      <WialonProvider
        autoConnect={autoConnect}
        pollingInterval={pollingInterval}
      >
        <DataProvider
          enableAutoRefresh={enableAutoRefresh}
          cacheTimeout={cacheTimeout}
        >
          {children}
        </DataProvider>
      </WialonProvider>
    </PermissionsProvider>
  );
};

// Individual exports for granular usage
export { WialonProvider } from './WialonContext';
export { DataProvider } from './DataContext';
export { PermissionsProvider } from './PermissionsContext';

// Hook exports
export { useWialonContext } from './WialonContext';
export { useDataContext } from './DataContext';
export { usePermissions } from './PermissionsContext';

export default AppProviders;
