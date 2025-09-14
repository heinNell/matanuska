import React, { useState, useEffect } from 'react';
import {
  Car,
  Fuel,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Gauge,
  Users,
  Wrench,
  Bell,
  Battery,
  Thermometer,
  Navigation,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

interface VehicleStatus {
  id: string;
  registration: string;
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  }
  driver?: string;
  fuel: {
    level: number;
    efficiency: number;
  };
  engine: {
    temperature: number;
    rpm: number;
    running: boolean;
  };
  lastUpdate: Date;
  alerts: Alert[];
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface FleetMetrics {
  totalVehicles: number;
  activeVehicles: number;
  idleVehicles: number;
  maintenanceVehicles: number;
  averageFuelLevel: number;
  totalAlerts: number;
  activeTrips: number;
  completedTripsToday: number;
}

interface MobileDashboardProps {
  onClose?: () => void;
}

export const MobileDashboard: React.FC<MobileDashboardProps> = ({ onClose }) => {
  const [vehicles, setVehicles] = useState<VehicleStatus[]>([]);
  const [metrics, setMetrics] = useState<FleetMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [_selectedVehicle, _setSelectedVehicle] = useState<VehicleStatus | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);

  useEffect((): (() => void) => {
    setIsNativeApp(Capacitor.isNativePlatform());
    void loadDashboardData();

    // Set up auto-refresh
    const interval = setInterval((): void => {
      void loadDashboardData(false);
    }, 30000); // Refresh every 30 seconds

    return (): void => clearInterval(interval);
  }, []);

  const loadDashboardData = async (showLoading = true): Promise<void> => {
    if (showLoading) setIsRefreshing(true);

    try {
      // Sample data - in real app, load from API
      const sampleVehicles: VehicleStatus[] = [
        {
          id: 'V001',
          registration: 'KCA 123A',
          status: 'active',
          location: {
            latitude: -1.292066,
            longitude: 36.821945,
            address: 'Nairobi CBD'
          },
          driver: 'John Doe',
          fuel: {
            level: 75,
            efficiency: 8.5
          },
          engine: {
            temperature: 85,
            rpm: 2200,
            running: true
          },
          lastUpdate: new Date(),
          alerts: []
        },
        {
          id: 'V002',
          registration: 'KBZ 456B',
          status: 'idle',
          location: {
            latitude: -1.285,
            longitude: 36.815,
            address: 'Industrial Area'
          },
          driver: 'Jane Smith',
          fuel: {
            level: 45,
            efficiency: 9.2
          },
          engine: {
            temperature: 70,
            rpm: 0,
            running: false
          },
          lastUpdate: new Date(Date.now() - 300000), // 5 minutes ago
          alerts: [
            {
              id: 'A001',
              type: 'warning',
              message: 'Low fuel level',
              timestamp: new Date(),
              acknowledged: false
            }
          ]
        },
        {
          id: 'V003',
          registration: 'KCC 789C',
          status: 'maintenance',
          location: {
            latitude: -1.300,
            longitude: 36.830,
            address: 'Workshop'
          },
          fuel: {
            level: 90,
            efficiency: 7.8
          },
          engine: {
            temperature: 0,
            rpm: 0,
            running: false
          },
          lastUpdate: new Date(Date.now() - 3600000), // 1 hour ago
          alerts: [
            {
              id: 'A002',
              type: 'error',
              message: 'Scheduled maintenance required',
              timestamp: new Date(),
              acknowledged: false
            }
          ]
        }
      ];

      const allAlerts = sampleVehicles.flatMap(v => v.alerts);

      const sampleMetrics: FleetMetrics = {
        totalVehicles: sampleVehicles.length,
        activeVehicles: sampleVehicles.filter(v => v.status === 'active').length,
        idleVehicles: sampleVehicles.filter(v => v.status === 'idle').length,
        maintenanceVehicles: sampleVehicles.filter(v => v.status === 'maintenance').length,
        averageFuelLevel: sampleVehicles.reduce((sum, v) => sum + v.fuel.level, 0) / sampleVehicles.length,
        totalAlerts: allAlerts.filter(a => a.acknowledged === false).length,
        activeTrips: sampleVehicles.filter(v => v.status === 'active').length,
        completedTripsToday: 12
      };

      setVehicles(sampleVehicles);
      setMetrics(sampleMetrics);
      setAlerts(allAlerts.filter(a => a.acknowledged === false));
      setLastUpdate(new Date());

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to refresh dashboard data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: VehicleStatus['status']): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'idle': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (type: Alert['type']): string => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const acknowledgeAlert = (alertId: string): void => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    setVehicles(prev => prev.map(vehicle => ({
      ...vehicle,
      alerts: vehicle.alerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    })));
    toast.success('Alert acknowledged');
  };

  const openMaps = (vehicle: VehicleStatus): void => {
    if (isNativeApp) {
      // Use native maps
      const url = `geo:${vehicle.location.latitude},${vehicle.location.longitude}?q=${vehicle.location.latitude},${vehicle.location.longitude}(${vehicle.registration})`;
      window.open(url, '_system');
    } else {
      // Use web maps
      const url = `https://maps.google.com/?q=${vehicle.location.latitude},${vehicle.location.longitude}`;
      window.open(url, '_blank');
    }
  };

  const formatLastUpdate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes === 0) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Gauge className="h-6 w-6 mr-2" />
            <h1 className="text-lg font-semibold">Fleet Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-white relative"
            >
              <Bell className="h-5 w-5" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {alerts.length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadDashboardData()}
              disabled={isRefreshing}
              className="text-white"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white">
                ✕
              </Button>
            )}
          </div>
        </div>

        <p className="text-xs text-blue-100 mt-2">
          Last updated: {formatLastUpdate(lastUpdate)}
        </p>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg border-b z-10 max-h-64 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Active Alerts ({alerts.length})
            </h3>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs opacity-75">{formatLastUpdate(alert.timestamp)}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="ml-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No active alerts</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3 text-center">
                <Car className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-green-800">{metrics.activeVehicles}</p>
                <p className="text-xs text-green-600">Active</p>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-3 text-center">
                <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-yellow-800">{metrics.idleVehicles}</p>
                <p className="text-xs text-yellow-600">Idle</p>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3 text-center">
                <Fuel className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-blue-800">{metrics.averageFuelLevel.toFixed(0)}%</p>
                <p className="text-xs text-blue-600">Avg Fuel</p>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-3 text-center">
                <Wrench className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-orange-800">{metrics.maintenanceVehicles}</p>
                <p className="text-xs text-orange-600">Maintenance</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vehicle List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Fleet Status</h2>

          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{vehicle.registration}</h3>
                    {vehicle.driver != null && vehicle.driver !== '' && (
                      <p className="text-xs text-gray-600 flex items-center mt-1">
                        <Users className="h-3 w-3 mr-1" />
                        {vehicle.driver}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {vehicle.alerts.length > 0 && (
                      <Badge className="bg-red-100 text-red-800">
                        {vehicle.alerts.length}
                      </Badge>
                    )}
                    <Badge className={`text-xs ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                {/* Location */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">{vehicle.location.address != null && vehicle.location.address !== '' ? vehicle.location.address : 'Unknown location'}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openMaps(vehicle)}
                    className="h-6 px-2"
                  >
                    <Navigation className="h-3 w-3" />
                  </Button>
                </div>

                {/* Vehicle Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center justify-center bg-gray-50 rounded p-2">
                    <Fuel className="h-3 w-3 mr-1 text-gray-600" />
                    <span>{vehicle.fuel.level}%</span>
                  </div>

                  <div className="flex items-center justify-center bg-gray-50 rounded p-2">
                    <Thermometer className="h-3 w-3 mr-1 text-gray-600" />
                    <span>{vehicle.engine.temperature}°C</span>
                  </div>

                  <div className="flex items-center justify-center bg-gray-50 rounded p-2">
                    {vehicle.engine.running ? (
                      <>
                        <Battery className="h-3 w-3 mr-1 text-green-600" />
                        <span className="text-green-600">ON</span>
                      </>
                    ) : (
                      <>
                        <Battery className="h-3 w-3 mr-1 text-gray-400" />
                        <span className="text-gray-600">OFF</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Alerts */}
                {vehicle.alerts.length > 0 && (
                  <div className="space-y-1">
                    {vehicle.alerts.slice(0, 2).map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between bg-red-50 border border-red-200 rounded p-2">
                        <div className="flex items-center">
                          <AlertTriangle className="h-3 w-3 text-red-600 mr-2" />
                          <span className="text-xs text-red-800">{alert.message}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="h-5 w-5 p-0 text-red-600"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {vehicle.alerts.length > 2 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{vehicle.alerts.length - 2} more alerts
                      </p>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Last update: {formatLastUpdate(vehicle.lastUpdate)}
                </p>
              </CardContent>
            </Card>
          ))}

          {vehicles.length === 0 && !isRefreshing && (
            <div className="text-center py-8 text-gray-500">
              <Car className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No vehicles found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;
