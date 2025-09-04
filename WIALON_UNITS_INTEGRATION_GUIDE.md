# Wialon Units Integration Guide for Matanuska Transport Platform

## Overview

This guide explains how to integrate and utilize the Wialon GPS tracking units data (from `units_raw.json`) within the Matanuska transport platform for comprehensive fleet management.

## Data Structure Analysis

### Raw Wialon Response Format

```json
{
  "searchSpec": {
    "itemsType": "avl_unit",           // AVL (Automatic Vehicle Location) units
    "propName": "sys_name",            // Search by system name property
    "propValueMask": "*",              // Wildcard to get all units
    "sortType": "sys_name",            // Sort results by system name
    "propType": "",                    // No specific property type filter
    "or_logic": "0"                    // Use AND logic (not OR)
  },
  "dataFlags": 1,                      // Data flags for response format
  "totalItemsCount": 12,               // Total units in fleet
  "indexFrom": 0,                      // Pagination start
  "indexTo": 0,                        // Pagination end
  "items": [...]                       // Array of vehicle units
}
```

### Individual Unit Properties

Each unit contains these critical properties:

```json
{
  "nm": "21H - ADS 4865",             // Vehicle name/registration
  "cls": 2,                           // Class identifier (2 = vehicle unit)
  "id": 600665449,                    // Unique Wialon unit ID
  "mu": 0,                            // Modification unit flag
  "uacl": 4178835472383               // User Access Control List (bitmask)
}
```

## Integration Implementation

### 1. Data Transformation Layer

Create a service to transform raw Wialon data into your application's domain model:

```typescript
// src/services/wialonUnitsTransformer.ts
import type { WialonUnit } from '../types/wialon-types';
import type { Vehicle } from '../types/Vehicle';

export interface WialonUnitsResponse {
  searchSpec: {
    itemsType: string;
    propName: string;
    propValueMask: string;
    sortType: string;
    propType: string;
    or_logic: string;
  };
  dataFlags: number;
  totalItemsCount: number;
  indexFrom: number;
  indexTo: number;
  items: WialonUnit[];
}

export class WialonUnitsTransformer {
  static transformToVehicles(response: WialonUnitsResponse): Vehicle[] {
    return response.items.map(unit => this.transformUnit(unit));
  }

  private static transformUnit(unit: WialonUnit): Vehicle {
    const { id, nm, uacl } = unit;

    // Parse vehicle name to extract fleet ID and registration
    const nameMatch = nm?.match(/^(\d+H)\s*-\s*(.+)$/);
    const fleetId = nameMatch?.[1] || 'UNKNOWN';
    const registration = nameMatch?.[2]?.replace(/\s*\([^)]+\)/, '') || nm || 'UNKNOWN';

    // Determine connectivity type
    const isInternalSim = nm?.includes('Int Sim') || nm?.includes('Int sim');
    const isDemoUnit = nm?.includes('DEMO');

    // Determine access level from UACL
    const accessLevel = this.parseAccessLevel(uacl);

    return {
      id: String(id),
      wialonId: id,
      registrationNumber: registration,
      fleetIdentifier: fleetId,
      name: nm || 'Unknown Vehicle',
      status: 'active', // Default status
      type: 'truck', // Default type for Matanuska fleet
      connectivity: {
        type: isInternalSim ? 'internal_sim' : 'external_sim',
        wialonUnitId: id
      },
      permissions: accessLevel,
      isDemoUnit,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private static parseAccessLevel(uacl: number): string {
    // Common UACL values observed:
    // 4178835472383, 4178863783935 - Admin/Manager access
    // 4178867978239 - Standard fleet access

    switch (uacl) {
      case 4178835472383:
      case 4178863783935:
        return 'admin';
      case 4178867978239:
        return 'fleet_user';
      default:
        return 'basic';
    }
  }
}
```

### 2. Fleet Synchronization Service

Implement a service to sync Wialon units with your local database:

```typescript
// src/services/fleetSyncService.ts
import { collection, doc, writeBatch, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { WialonUnitsTransformer } from './wialonUnitsTransformer';
import wialonService from './wialonService';

export class FleetSyncService {
  private static readonly COLLECTION_NAME = 'vehicles';

  /**
   * Fetch units from Wialon and sync with local database
   */
  async syncFleetUnits(): Promise<void> {
    try {
      // Initialize Wialon connection
      await wialonService.bootstrapFromLoginResponse();

      // Fetch units from Wialon API
      const unitsResponse = await this.fetchWialonUnits();

      // Transform to local vehicle format
      const vehicles = WialonUnitsTransformer.transformToVehicles(unitsResponse);

      // Sync with Firestore
      await this.syncToFirestore(vehicles);

      console.log(`Successfully synced ${vehicles.length} vehicles`);
    } catch (error) {
      console.error('Fleet sync failed:', error);
      throw error;
    }
  }

  private async fetchWialonUnits(): Promise<WialonUnitsResponse> {
    // This would use your actual Wialon service
    return wialonService.searchUnits({
      itemsType: 'avl_unit',
      propName: 'sys_name',
      propValueMask: '*',
      sortType: 'sys_name'
    });
  }

  private async syncToFirestore(vehicles: Vehicle[]): Promise<void> {
    const batch = writeBatch(db);

    for (const vehicle of vehicles) {
      const vehicleRef = doc(collection(db, this.COLLECTION_NAME), vehicle.id);

      // Merge with existing data to preserve local modifications
      batch.set(vehicleRef, {
        ...vehicle,
        lastWialonSync: new Date(),
        syncSource: 'wialon_api'
      }, { merge: true });
    }

    await batch.commit();
  }

  /**
   * Get vehicles that need position updates
   */
  async getActiveVehiclesForTracking(): Promise<Vehicle[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('status', 'in', ['active', 'in_transit'])
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
  }
}
```

### 3. Real-time Fleet Tracking Hook

Create a React hook for real-time fleet monitoring:

```typescript
// src/hooks/useFleetTracking.ts
import { useState, useEffect, useCallback } from 'react';
import { FleetSyncService } from '../services/fleetSyncService';
import wialonService from '../services/wialonService';

interface FleetTrackingState {
  vehicles: Vehicle[];
  positions: Map<string, VehiclePosition>;
  isLoading: boolean;
  error: Error | null;
  lastUpdate: Date | null;
}

export const useFleetTracking = (autoRefresh = true, interval = 30000) => {
  const [state, setState] = useState<FleetTrackingState>({
    vehicles: [],
    positions: new Map(),
    isLoading: true,
    error: null,
    lastUpdate: null
  });

  const fleetSyncService = new FleetSyncService();

  const refreshFleetData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Get active vehicles from local database
      const vehicles = await fleetSyncService.getActiveVehiclesForTracking();

      // Fetch current positions for all vehicles
      const positionPromises = vehicles.map(async (vehicle) => {
        try {
          const position = await wialonService.getVehicleLocation(vehicle.wialonId);
          return { vehicleId: vehicle.id, position };
        } catch (error) {
          console.warn(`Failed to get position for vehicle ${vehicle.id}:`, error);
          return { vehicleId: vehicle.id, position: null };
        }
      });

      const positionResults = await Promise.allSettled(positionPromises);
      const positions = new Map();

      positionResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.position) {
          positions.set(result.value.vehicleId, result.value.position);
        }
      });

      setState({
        vehicles,
        positions,
        isLoading: false,
        error: null,
        lastUpdate: new Date()
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error
      }));
    }
  }, [fleetSyncService]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(refreshFleetData, interval);

    // Initial load
    refreshFleetData();

    return () => clearInterval(intervalId);
  }, [autoRefresh, interval, refreshFleetData]);

  return {
    ...state,
    refreshFleetData,
    syncFleet: () => fleetSyncService.syncFleetUnits()
  };
};
```

### 4. Fleet Dashboard Component

Create a comprehensive dashboard component:

```typescript
// src/components/fleet/FleetDashboard.tsx
import React, { useMemo } from 'react';
import { useFleetTracking } from '../../hooks/useFleetTracking';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { MapView } from '../maps/MapView';

export const FleetDashboard: React.FC = () => {
  const { vehicles, positions, isLoading, error, lastUpdate, refreshFleetData } = useFleetTracking();

  const fleetStats = useMemo(() => {
    const total = vehicles.length;
    const active = vehicles.filter(v => v.status === 'active').length;
    const withGPS = Array.from(positions.keys()).length;

    return {
      total,
      active,
      withGPS,
      coverage: total > 0 ? Math.round((withGPS / total) * 100) : 0
    };
  }, [vehicles, positions]);

  const vehicleMarkers = useMemo(() => {
    return vehicles
      .map(vehicle => {
        const position = positions.get(vehicle.id);
        if (!position) return null;

        return {
          id: vehicle.id,
          position: { lat: position.lat, lng: position.lng },
          title: vehicle.registrationNumber,
          subtitle: vehicle.fleetIdentifier,
          status: vehicle.status,
          icon: getVehicleIcon(vehicle.status)
        };
      })
      .filter(Boolean);
  }, [vehicles, positions]);

  if (isLoading && vehicles.length === 0) {
    return <div className="p-4">Loading fleet data...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="text-red-800 font-semibold">Fleet Tracking Error</h3>
        <p className="text-red-600">{error.message}</p>
        <button
          onClick={refreshFleetData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Fleet Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader title="Total Vehicles" />
          <CardContent>
            <div className="text-2xl font-bold">{fleetStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Active Units" />
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{fleetStats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="GPS Coverage" />
          <CardContent>
            <div className="text-2xl font-bold">{fleetStats.coverage}%</div>
            <div className="text-sm text-gray-500">{fleetStats.withGPS} of {fleetStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Last Update" />
          <CardContent>
            <div className="text-sm">
              {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
            </div>
            <button
              onClick={refreshFleetData}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh Now'}
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Map */}
      <Card className="h-96">
        <CardHeader title="Live Fleet Tracking" />
        <CardContent className="p-0 h-80">
          <MapView
            markers={vehicleMarkers}
            showControls
            showTraffic
            className="w-full h-full rounded-b-lg"
          />
        </CardContent>
      </Card>

      {/* Vehicle List */}
      <Card>
        <CardHeader title="Vehicle Status" />
        <CardContent>
          <div className="space-y-2">
            {vehicles.map(vehicle => {
              const position = positions.get(vehicle.id);
              const hasGPS = !!position;

              return (
                <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium">{vehicle.fleetIdentifier}</div>
                    <div className="text-gray-600">{vehicle.registrationNumber}</div>
                    {vehicle.isDemoUnit && (
                      <Badge variant="warning">Demo Unit</Badge>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={vehicle.status === 'active' ? 'success' : 'secondary'}
                    >
                      {vehicle.status}
                    </Badge>

                    <Badge
                      variant={hasGPS ? 'success' : 'error'}
                    >
                      {hasGPS ? 'GPS Active' : 'No GPS'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function getVehicleIcon(status: string): string {
  switch (status) {
    case 'active': return '🚛';
    case 'idle': return '⏸️';
    case 'maintenance': return '🔧';
    default: return '📍';
  }
}
```

## Usage in Different App Contexts

### 1. Trip Management Integration

```typescript
// When creating a trip, populate vehicle dropdown with Wialon units
const availableVehicles = vehicles.filter(v =>
  v.status === 'active' &&
  !v.isDemoUnit &&
  positions.has(v.id) // Only show vehicles with GPS
);
```

### 2. Maintenance Scheduling

```typescript
// Use vehicle data for maintenance scheduling
const vehiclesNeedingMaintenance = vehicles.filter(v => {
  const lastMaintenance = getLastMaintenanceDate(v.id);
  const daysSince = daysBetween(lastMaintenance, new Date());
  return daysSince > 30 || v.status === 'maintenance_due';
});
```

### 3. Driver Assignment

```typescript
// Match drivers to vehicles based on permissions and training
const assignableVehicles = vehicles.filter(v =>
  canDriverOperateVehicle(driverId, v.type) &&
  v.status === 'active'
);
```

### 4. Route Optimization

```typescript
// Use real-time positions for route planning
const vehiclePositions = vehicles
  .map(v => ({
    vehicleId: v.id,
    position: positions.get(v.id),
    capacity: getVehicleCapacity(v.type)
  }))
  .filter(v => v.position);
```

## Security Considerations

1. **Access Control**: Use the UACL values to implement role-based access
2. **API Rate Limiting**: Cache Wialon responses to avoid API limits
3. **Data Validation**: Always validate Wialon responses before processing
4. **Error Handling**: Implement graceful fallbacks for GPS connectivity issues

## Performance Optimization

1. **Batch Operations**: Group multiple vehicle requests
2. **Selective Updates**: Only refresh positions for active vehicles
3. **Local Caching**: Cache vehicle metadata locally
4. **Lazy Loading**: Load detailed data on demand

## Monitoring and Alerts

Set up alerts for:
- Vehicles losing GPS connection
- Demo units in production routes
- Access permission mismatches
- Sync failures with Wialon API

This integration provides a comprehensive foundation for leveraging your Wialon GPS tracking data within the Matanuska transport platform's fleet management capabilities.
