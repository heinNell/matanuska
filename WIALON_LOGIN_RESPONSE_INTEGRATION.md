# Wialon Login Response Integration Guide

## Overview

This guide explains how to integrate and utilize the comprehensive Wialon login response data within your Matanuska transport platform. The login response contains critical session data, user permissions, feature flags, and configuration settings that power your entire fleet management system.

## Login Response Structure Analysis

### Core Session Data
```json
{
  "host": "4.240.39.200",
  "eid": "5187687a35ab46a7e28fe097737fb73a",
  "gis_sid": "47609b8a0c5ca713",
  "token": "{...}",
  "base_url": "https://hst-api.wialon.eu"
}
```

### User Information
```json
{
  "user": {
    "nm": "heinrich@matanuska.co.za",
    "id": 600542271,
    "bact": 25138250,  // Billing account/resource ID
    "uacl": 2146947    // User access control level
  }
}
```

### Service Configuration
```json
{
  "gis_search": "https://search-maps.wialon.com",
  "gis_render": "https://render-maps.wialon.com",
  "gis_geocode": "https://geocode-maps.wialon.com",
  "gis_routing": "https://routing-maps.wialon.com"
}
```

## Implementation Strategy

### 1. Authentication Session Manager

```typescript
// src/services/WialonSessionManager.ts
export interface WialonLoginResponse {
  host: string;
  eid: string;
  gis_sid: string;
  au: string; // authenticated user
  tm: number; // timestamp
  base_url: string;
  token: string;
  user: WialonUserData;
  features: WialonFeatures;
  classes: Record<string, number>;
  gis_search: string;
  gis_render: string;
  gis_geocode: string;
  gis_routing: string;
  video_service_url: string;
}

export interface WialonUserData {
  nm: string;
  cls: number;
  id: number;
  prp: Record<string, string>; // User properties/preferences
  crt: number; // Creator ID
  bact: number; // Billing account/resource ID
  uacl: number; // User access control level
  mapps: Record<string, WialonMobileApp>; // Mobile apps
}

export class WialonSessionManager {
  private loginResponse: WialonLoginResponse | null = null;
  private sessionTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Initialize session from login response
   */
  initializeSession(loginResponse: WialonLoginResponse): void {
    this.loginResponse = loginResponse;
    this.saveToStorage();
    this.setupSessionTimeout();
    this.configureServices();
  }

  /**
   * Get current session data
   */
  getSessionData(): WialonSessionData | null {
    if (!this.loginResponse) return null;

    return {
      eid: this.loginResponse.eid,
      token: this.parseToken(this.loginResponse.token),
      baseUrl: this.loginResponse.base_url,
      userId: this.loginResponse.user.id,
      userName: this.loginResponse.user.nm,
      resourceId: this.loginResponse.user.bact,
      sessionId: this.loginResponse.gis_sid,
      expiresAt: this.loginResponse.tm * 1000 // Convert to milliseconds
    };
  }

  /**
   * Get user permissions and access level
   */
  getUserPermissions(): UserPermissions {
    if (!this.loginResponse) throw new Error('No active session');

    const { user } = this.loginResponse;
    const userProperties = this.parseUserProperties(user.prp);

    return {
      userId: user.id,
      accessLevel: user.uacl,
      resourceId: user.bact,
      monitoringUnits: this.parseMonitoringUnits(userProperties.monu),
      accessTemplates: JSON.parse(userProperties.access_templates || '{}'),
      features: this.getEnabledFeatures(),
      isAdmin: (user.uacl & 0x1) === 1, // Check admin flag
      canCreateReports: this.hasFeature('custom_reports'),
      canManageUsers: this.hasFeature('create_users'),
      canManageUnits: this.hasFeature('create_units')
    };
  }

  /**
   * Get GIS service URLs for mapping
   */
  getGISServices(): GISServiceConfig {
    if (!this.loginResponse) throw new Error('No active session');

    return {
      search: this.loginResponse.gis_search,
      render: this.loginResponse.gis_render,
      geocode: this.loginResponse.gis_geocode,
      routing: this.loginResponse.gis_routing,
      video: this.loginResponse.video_service_url,
      baseUrl: this.loginResponse.base_url
    };
  }

  /**
   * Get monitoring configuration
   */
  getMonitoringConfig(): MonitoringConfig {
    const userProps = this.loginResponse?.user.prp;
    if (!userProps) throw new Error('No user properties available');

    return {
      monitoringUnits: this.parseMonitoringUnits(userProps.monu),
      unitGroups: JSON.parse(userProps.mongr || '{}'),
      monitoringMode: userProps.mont === '1',
      autoAdd: userProps.monitoringAutoAdd === '1',
      updateMask: userProps.muf ? parseInt(userProps.muf) : 0,
      fastReportTemplate: userProps.mu_fast_report_tmpl,
      tableColumns: this.parseTableColumns(userProps.mu_tbl_cols_sizes),
      language: userProps.language || 'en',
      timezone: userProps.tz
    };
  }

  private parseToken(tokenString: string): ParsedToken {
    try {
      return JSON.parse(tokenString);
    } catch {
      return { raw: tokenString };
    }
  }

  private parseUserProperties(props: Record<string, string>) {
    return props;
  }

  private parseMonitoringUnits(monu: string): number[] {
    try {
      return JSON.parse(monu || '[]');
    } catch {
      return [];
    }
  }

  private hasFeature(featureName: string): boolean {
    return this.loginResponse?.features?.svcs?.[featureName] === 1;
  }

  private getEnabledFeatures(): string[] {
    const features = this.loginResponse?.features?.svcs || {};
    return Object.keys(features).filter(key => features[key] === 1);
  }

  private setupSessionTimeout(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    const expiresAt = this.loginResponse!.tm * 1000;
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    if (timeUntilExpiry > 0) {
      this.sessionTimeout = setTimeout(() => {
        this.handleSessionExpiry();
      }, timeUntilExpiry - 60000); // Refresh 1 minute before expiry
    }
  }

  private handleSessionExpiry(): void {
    console.warn('Wialon session expiring, attempting refresh...');
    this.refreshSession();
  }

  private async refreshSession(): Promise<void> {
    // Implement session refresh logic
    try {
      const newResponse = await this.performTokenRefresh();
      this.initializeSession(newResponse);
    } catch (error) {
      console.error('Failed to refresh session:', error);
      this.clearSession();
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage !== 'undefined' && this.loginResponse) {
      localStorage.setItem('wialon_session', JSON.stringify(this.loginResponse));
    }
  }

  private loadFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('wialon_session');
      if (stored) {
        try {
          this.loginResponse = JSON.parse(stored);
        } catch (error) {
          console.warn('Failed to parse stored session:', error);
        }
      }
    }
  }
}
```

### 2. User Context Provider

```typescript
// src/context/WialonUserContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { WialonSessionManager } from '../services/WialonSessionManager';

interface WialonUserContextType {
  user: WialonUserData | null;
  permissions: UserPermissions | null;
  sessionData: WialonSessionData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => void;
}

const WialonUserContext = createContext<WialonUserContextType | undefined>(undefined);

export const WialonUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionManager] = useState(() => new WialonSessionManager());
  const [user, setUser] = useState<WialonUserData | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [sessionData, setSessionData] = useState<WialonSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeFromSession();
  }, []);

  const initializeFromSession = () => {
    try {
      const session = sessionManager.getSessionData();
      const userPerms = sessionManager.getUserPermissions();

      setSessionData(session);
      setPermissions(userPerms);
      setUser(session ? { id: session.userId, name: session.userName } : null);
    } catch (error) {
      console.warn('No valid session found:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    setIsLoading(true);
    try {
      await sessionManager.refreshSession();
      initializeFromSession();
    } catch (error) {
      console.error('Session refresh failed:', error);
      logout();
    }
  };

  const logout = () => {
    sessionManager.clearSession();
    setUser(null);
    setPermissions(null);
    setSessionData(null);
  };

  return (
    <WialonUserContext.Provider
      value={{
        user,
        permissions,
        sessionData,
        isAuthenticated: !!sessionData && Date.now() < sessionData.expiresAt,
        isLoading,
        refreshSession,
        logout
      }}
    >
      {children}
    </WialonUserContext.Provider>
  );
};

export const useWialonUser = () => {
  const context = useContext(WialonUserContext);
  if (context === undefined) {
    throw new Error('useWialonUser must be used within a WialonUserProvider');
  }
  return context;
};
```

### 3. Feature Flag System

```typescript
// src/hooks/useWialonFeatures.ts
export const useWialonFeatures = () => {
  const { permissions } = useWialonUser();

  const hasFeature = (featureName: string): boolean => {
    return permissions?.features.includes(featureName) || false;
  };

  const getFeatureConfig = () => {
    if (!permissions) return {};

    return {
      // Core features
      canCreateReports: hasFeature('custom_reports'),
      canManageDrivers: hasFeature('drivers'),
      canViewVideo: hasFeature('video'),
      canManageTrailers: hasFeature('trailers'),
      canUseJobs: hasFeature('jobs'),
      canAccessMobileApp: hasFeature('mobile_apps'),

      // Advanced features
      canUseEcoDriving: hasFeature('ecodriving'),
      canManageZones: hasFeature('zones_library'),
      canUseFleetRun: hasFeature('fleetrun'),
      canAccessTachograph: hasFeature('tacho'),

      // API features
      hasSDKAccess: hasFeature('sdk'),
      hasAPIAccess: hasFeature('wialon_hosting_api'),

      // Map services
      hasGoogleMaps: hasFeature('own_google_service'),
      hasOSMMaps: hasFeature('own_osm_service'),
      hasBingMaps: hasFeature('own_bing_service'),

      // Specialized features
      canUseAgro: hasFeature('agro'),
      canAccessLocator: hasFeature('locator'),
      canManageRetranslators: hasFeature('avl_retranslator')
    };
  };

  return {
    hasFeature,
    features: getFeatureConfig(),
    allFeatures: permissions?.features || []
  };
};
```

### 4. GIS Services Configuration

```typescript
// src/services/WialonGISService.ts
export class WialonGISService {
  private sessionManager: WialonSessionManager;
  private gisConfig: GISServiceConfig;

  constructor(sessionManager: WialonSessionManager) {
    this.sessionManager = sessionManager;
    this.gisConfig = sessionManager.getGISServices();
  }

  /**
   * Geocode address to coordinates
   */
  async geocodeAddress(address: string): Promise<GeocodingResult[]> {
    const url = `${this.gisConfig.geocode}/gis_geocode`;

    const response = await this.makeGISRequest(url, {
      coords: `[{"lon":0,"lat":0}]`,
      flags: 1255211008,
      uid: this.sessionManager.getSessionData()?.sessionId,
      query: address
    });

    return this.parseGeocodingResponse(response);
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    const url = `${this.gisConfig.geocode}/gis_geocode`;

    const response = await this.makeGISRequest(url, {
      coords: `[{"lon":${lng},"lat":${lat}}]`,
      flags: 1255211008,
      uid: this.sessionManager.getSessionData()?.sessionId
    });

    return this.parseAddressResponse(response);
  }

  /**
   * Calculate route between points
   */
  async calculateRoute(waypoints: LatLng[]): Promise<RouteResult> {
    const url = `${this.gisConfig.routing}/gis_routing`;

    const response = await this.makeGISRequest(url, {
      points: JSON.stringify(waypoints),
      flags: 1,
      uid: this.sessionManager.getSessionData()?.sessionId
    });

    return this.parseRouteResponse(response);
  }

  /**
   * Search for POIs near location
   */
  async searchPOIs(lat: number, lng: number, radius: number, category?: string): Promise<POIResult[]> {
    const url = `${this.gisConfig.search}/gis_search`;

    const response = await this.makeGISRequest(url, {
      coords: `[{"lon":${lng},"lat":${lat}}]`,
      radius,
      category: category || '',
      uid: this.sessionManager.getSessionData()?.sessionId
    });

    return this.parsePOIResponse(response);
  }

  private async makeGISRequest(url: string, params: Record<string, unknown>): Promise<unknown> {
    const queryString = new URLSearchParams(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    ).toString();

    const response = await fetch(`${url}?${queryString}`);

    if (!response.ok) {
      throw new Error(`GIS request failed: ${response.statusText}`);
    }

    return response.json();
  }
}
```

### 5. Vehicle Monitoring Configuration

```typescript
// src/hooks/useMonitoringConfig.ts
export const useMonitoringConfig = () => {
  const sessionManager = new WialonSessionManager();

  const getMonitoringUnits = (): number[] => {
    const config = sessionManager.getMonitoringConfig();
    return config.monitoringUnits;
  };

  const isUnitMonitored = (unitId: number): boolean => {
    return getMonitoringUnits().includes(unitId);
  };

  const getTableConfiguration = () => {
    const config = sessionManager.getMonitoringConfig();
    return {
      columns: config.tableColumns,
      sortMode: config.sortMode,
      updateMask: config.updateMask
    };
  };

  const getDefaultsForNewTrip = () => {
    const config = sessionManager.getMonitoringConfig();

    return {
      availableUnits: config.monitoringUnits,
      defaultTemplate: config.fastReportTemplate,
      userPreferences: {
        language: config.language,
        timezone: config.timezone,
        autoAdd: config.autoAdd
      }
    };
  };

  return {
    monitoringUnits: getMonitoringUnits(),
    isUnitMonitored,
    tableConfig: getTableConfiguration(),
    tripDefaults: getDefaultsForNewTrip()
  };
};
```

## Practical Usage Examples

### 1. Dashboard Authorization

```typescript
// Restrict dashboard access based on user permissions
const DashboardPage = () => {
  const { permissions } = useWialonUser();
  const { hasFeature } = useWialonFeatures();

  if (!permissions?.canCreateReports) {
    return <div>Access denied - Reports feature not available</div>;
  }

  return (
    <div>
      {hasFeature('monitoring_dashboard') && <MonitoringDashboard />}
      {hasFeature('custom_reports') && <ReportsSection />}
      {hasFeature('video') && <VideoMonitoring />}
    </div>
  );
};
```

### 2. Trip Creation with Unit Validation

```typescript
// Only show monitored units in trip creation
const TripForm = () => {
  const { monitoringUnits, isUnitMonitored } = useMonitoringConfig();
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    // Filter vehicles to only show monitored units
    const availableVehicles = allVehicles.filter(v =>
      isUnitMonitored(v.wialonId)
    );
    setVehicles(availableVehicles);
  }, [monitoringUnits]);

  return <VehicleSelector vehicles={vehicles} />;
};
```

### 3. Map Service Integration

```typescript
// Use appropriate map service based on available features
const MapComponent = () => {
  const { features } = useWialonFeatures();

  const getMapProvider = () => {
    if (features.hasGoogleMaps) return 'google';
    if (features.hasOSMMaps) return 'osm';
    if (features.hasBingMaps) return 'bing';
    return 'default';
  };

  return <MapView provider={getMapProvider()} />;
};
```

### 4. Feature-based Navigation

```typescript
// Show/hide navigation items based on available features
const Navigation = () => {
  const { features } = useWialonFeatures();

  return (
    <nav>
      <NavItem to="/dashboard" label="Dashboard" />
      {features.canManageDrivers && (
        <NavItem to="/drivers" label="Drivers" />
      )}
      {features.canUseJobs && (
        <NavItem to="/jobs" label="Jobs" />
      )}
      {features.canViewVideo && (
        <NavItem to="/video" label="Video" />
      )}
      {features.canCreateReports && (
        <NavItem to="/reports" label="Reports" />
      )}
    </nav>
  );
};
```

This comprehensive integration approach ensures that your Matanuska platform leverages all available Wialon features while respecting user permissions and subscription limits.
