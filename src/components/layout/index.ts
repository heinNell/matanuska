// Phase 3 - Advanced UI Components for Wialon Fleet Management
// Complete implementation with enhanced features and integrations

// Core Dashboard and List Components
export { default as WialonDashboardComplete } from '../wialon/WialonDashboardComplete';
export { default as WialonUnitList } from '../wialon/WialonUnitList';
export { default as WialonFleetStatus } from '../wialon/WialonFleetStatus';
export { default as WialonUnitDetails } from '../wialon/WialonUnitDetails';
export { default as WialonReportViewer } from '../wialon/WialonReportViewer';
export { default as WialonMapView } from '../wialon/WialonMapView';

// Advanced Feature Components
export { default as WialonAlerts } from '../wialon/WialonAlerts';
export { default as WialonGeofences } from '../wialon/WialonGeofences';
export { default as WialonReports } from '../wialon/WialonReports';
export { default as WialonSettings } from '../wialon/WialonSettings';

// Layout Components
export { default as WialonNavigation } from './WialonNavigation';
export { default as WialonLayout } from './WialonLayout';

// Type exports for easy access
export type {
  WialonDashboardProps,
  WialonUnitListProps,
  WialonFleetStatusProps,
  WialonUnitDetailsProps,
  WialonReportViewerProps,
  WialonMapViewProps
} from '../wialon/types';

export type {
  WialonAlertsProps,
  WialonGeofencesProps,
  WialonReportsProps,
  WialonSettingsProps
} from '../wialon/advanced-types';

export type {
  NavigationProps,
  WialonLayoutProps
} from './types';

// Component groupings for organized imports
export const WialonCoreComponents = {
  Dashboard: WialonDashboardComplete,
  UnitList: WialonUnitList,
  FleetStatus: WialonFleetStatus,
  UnitDetails: WialonUnitDetails,
  ReportViewer: WialonReportViewer,
  MapView: WialonMapView
} as const;

export const WialonAdvancedComponents = {
  Alerts: WialonAlerts,
  Geofences: WialonGeofences,
  Reports: WialonReports,
  Settings: WialonSettings
} as const;

export const WialonLayoutComponents = {
  Navigation: WialonNavigation,
  Layout: WialonLayout
} as const;

// All components in one object for convenience
export const WialonComponents = {
  ...WialonCoreComponents,
  ...WialonAdvancedComponents,
  ...WialonLayoutComponents
} as const;
