import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Crosshair,
  Car,
  Clock,
  Route,
  AlertCircle,
  RefreshCw,
  Settings,
  Map as MapIcon,
  Compass,
  GPS,
  Zap
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

interface VehicleLocation {
  id: string;
  registration: string;
  location: LocationData;
  status: 'moving' | 'idle' | 'offline';
  driver?: string;
  destination?: {
    address: string;
    eta: string;
    distance: number;
  };
}

interface GeofenceAlert {
  id: string;
  vehicleId: string;
  type: 'entry' | 'exit';
  zone: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface LocationPermissions {
  granted: boolean;
  precise: boolean;
  canRequestPrecise: boolean;
}

interface MobileLocationServicesProps {
  onClose?: () => void;
  vehicles?: VehicleLocation[];
}

export const MobileLocationServices: React.FC<MobileLocationServicesProps> = ({
  onClose,
  vehicles: propVehicles
}) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleLocation[]>([]);
  const [geofenceAlerts, setGeofenceAlerts] = useState<GeofenceAlert[]>([]);
  const [permissions, setPermissions] = useState<LocationPermissions>({
    granted: false,
    precise: false,
    canRequestPrecise: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [trackingHistory, setTrackingHistory] = useState<LocationData[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);

  const watchIdRef = useRef<string | null>(null);
  const locationHistoryRef = useRef<LocationData[]>([]);

  useEffect(() => {
    setIsNativeApp(Capacitor.isNativePlatform());
    checkLocationPermissions();
    loadVehicleData();

    return () => {
      stopLocationTracking();
    };
  }, []);

  useEffect(() => {
    if (propVehicles) {
      setVehicles(propVehicles);
    }
  }, [propVehicles]);

  const checkLocationPermissions = async () => {
    try {
      const permissions = await Geolocation.checkPermissions();

      setPermissions({
        granted: permissions.location === 'granted',
        precise: permissions.coarseLocation === 'granted',
        canRequestPrecise: permissions.location !== 'denied'
      });

      if (permissions.location === 'granted') {
        getCurrentLocation();
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const permissions = await Geolocation.requestPermissions();

      setPermissions({
        granted: permissions.location === 'granted',
        precise: permissions.coarseLocation === 'granted',
        canRequestPrecise: false
      });

      if (permissions.location === 'granted') {
        toast.success('Location permission granted');
        getCurrentLocation();
      } else {
        toast.error('Location permission denied');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast.error('Failed to request location permission');
    }
  };

  const getCurrentLocation = async () => {
    if (!permissions.granted) {
      toast.error('Location permission not granted');
      return;
    }

    setIsLoading(true);

    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude || undefined,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        timestamp: position.timestamp
      };

      setCurrentLocation(locationData);

      // Add to history
      locationHistoryRef.current = [...locationHistoryRef.current.slice(-99), locationData];
      setTrackingHistory(locationHistoryRef.current);

    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  };

  const startLocationTracking = async () => {
    if (!permissions.granted) {
      await requestLocationPermission();
      return;
    }

    try {
      setIsTracking(true);

      const watchId = await Geolocation.watchPosition({
        enableHighAccuracy: true,
        timeout: 10000
      }, (position, err) => {
        if (err) {
          console.error('Location watch error:', err);
          return;
        }

        if (position) {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp
          };

          setCurrentLocation(locationData);

          // Add to history
          locationHistoryRef.current = [...locationHistoryRef.current.slice(-99), locationData];
          setTrackingHistory(locationHistoryRef.current);
        }
      });

      watchIdRef.current = watchId;
      toast.success('Location tracking started');

    } catch (error) {
      console.error('Error starting location tracking:', error);
      toast.error('Failed to start location tracking');
      setIsTracking(false);
    }
  };

  const stopLocationTracking = async () => {
    if (watchIdRef.current) {
      try {
        await Geolocation.clearWatch({ id: watchIdRef.current });
        watchIdRef.current = null;
        setIsTracking(false);
        toast.success('Location tracking stopped');
      } catch (error) {
        console.error('Error stopping location tracking:', error);
      }
    }
  };

  const loadVehicleData = () => {
    // Mock vehicle location data
    const mockVehicles: VehicleLocation[] = [
      {
        id: 'V001',
        registration: 'KCA 123A',
        location: {
          latitude: -1.292066,
          longitude: 36.821945,
          accuracy: 10,
          speed: 45,
          heading: 180,
          timestamp: Date.now()
        },
        status: 'moving',
        driver: 'John Doe',
        destination: {
          address: 'Industrial Area, Nairobi',
          eta: '25 mins',
          distance: 15.2
        }
      },
      {
        id: 'V002',
        registration: 'KBZ 456B',
        location: {
          latitude: -1.285,
          longitude: 36.815,
          accuracy: 15,
          speed: 0,
          timestamp: Date.now() - 300000
        },
        status: 'idle',
        driver: 'Jane Smith'
      },
      {
        id: 'V003',
        registration: 'KCC 789C',
        location: {
          latitude: -1.300,
          longitude: 36.830,
          accuracy: 5,
          speed: 0,
          timestamp: Date.now() - 3600000
        },
        status: 'offline'
      }
    ];

    const mockAlerts: GeofenceAlert[] = [
      {
        id: 'GA001',
        vehicleId: 'V001',
        type: 'exit',
        zone: 'Depot Zone',
        timestamp: new Date(),
        acknowledged: false
      }
    ];

    setVehicles(mockVehicles);
    setGeofenceAlerts(mockAlerts);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getNearbyVehicles = (): VehicleLocation[] => {
    if (!currentLocation) return [];

    return vehicles.filter(vehicle => {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        vehicle.location.latitude,
        vehicle.location.longitude
      );
      return distance <= 5; // Within 5km
    });
  };

  const formatSpeed = (speed?: number): string => {
    if (!speed) return '0 km/h';
    return `${Math.round(speed * 3.6)} km/h`;
  };

  const formatAccuracy = (accuracy: number): string => {
    if (accuracy < 10) return 'High';
    if (accuracy < 50) return 'Medium';
    return 'Low';
  };

  const getStatusColor = (status: VehicleLocation['status']) => {
    switch (status) {
      case 'moving': return 'bg-green-100 text-green-800';
      case 'idle': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const acknowledgeGeofenceAlert = (alertId: string) => {
    setGeofenceAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast.success('Alert acknowledged');
  };

  const openMaps = (location: LocationData) => {
    if (isNativeApp) {
      const url = `geo:${location.latitude},${location.longitude}?q=${location.latitude},${location.longitude}`;
      window.open(url, '_system');
    } else {
      const url = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
      window.open(url, '_blank');
    }
  };

  const nearbyVehicles = getNearbyVehicles();

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="h-6 w-6 mr-2" />
            <h1 className="text-lg font-semibold">Location Services</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMap(!showMap)}
              className="text-white"
            >
              <MapIcon className="h-5 w-5" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white">
                ✕
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Permission Status */}
        {!permissions.granted && (
          <Card className="mb-4 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800">Location Permission Required</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Enable location access to track vehicles and get real-time updates.
                  </p>
                  <Button
                    onClick={requestLocationPermission}
                    className="mt-3 bg-orange-600 hover:bg-orange-700"
                    size="sm"
                  >
                    Grant Permission
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Location */}
        {permissions.granted && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold flex items-center">
                  <Crosshair className="h-4 w-4 mr-2" />
                  Your Location
                </h2>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant={isTracking ? "destructive" : "default"}
                    onClick={isTracking ? stopLocationTracking : startLocationTracking}
                  >
                    {isTracking ? (
                      <>
                        <Zap className="h-4 w-4 mr-1" />
                        Stop
                      </>
                    ) : (
                      <>
                        <GPS className="h-4 w-4 mr-1" />
                        Track
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {currentLocation ? (
                <>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-600">Coordinates</p>
                      <p className="font-mono text-xs">
                        {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-600">Accuracy</p>
                      <p className="font-semibold">
                        {formatAccuracy(currentLocation.accuracy)} ({currentLocation.accuracy.toFixed(0)}m)
                      </p>
                    </div>

                    {currentLocation.speed !== undefined && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-600">Speed</p>
                        <p className="font-semibold">{formatSpeed(currentLocation.speed)}</p>
                      </div>
                    )}

                    {currentLocation.heading !== undefined && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-600">Heading</p>
                        <p className="font-semibold flex items-center">
                          <Compass className="h-3 w-3 mr-1" />
                          {currentLocation.heading.toFixed(0)}°
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openMaps(currentLocation)}
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Open Map
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Location not available</p>
                  {permissions.granted && (
                    <Button
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={isLoading}
                      className="mt-2"
                    >
                      Get Location
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Nearby Vehicles */}
        {nearbyVehicles.length > 0 && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <h2 className="font-semibold">Nearby Vehicles ({nearbyVehicles.length})</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              {nearbyVehicles.map((vehicle) => {
                const distance = currentLocation ? calculateDistance(
                  currentLocation.latitude,
                  currentLocation.longitude,
                  vehicle.location.latitude,
                  vehicle.location.longitude
                ) : 0;

                return (
                  <div key={vehicle.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2 text-gray-600" />
                      <div>
                        <p className="font-semibold text-sm">{vehicle.registration}</p>
                        <p className="text-xs text-gray-600">
                          {distance.toFixed(1)} km away
                        </p>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Vehicle List */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <h2 className="font-semibold">All Vehicles ({vehicles.length})</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{vehicle.registration}</h3>
                    {vehicle.driver && (
                      <p className="text-xs text-gray-600">{vehicle.driver}</p>
                    )}
                  </div>
                  <Badge className={`text-xs ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">Speed</p>
                    <p className="font-semibold">{formatSpeed(vehicle.location.speed)}</p>
                  </div>

                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">Accuracy</p>
                    <p className="font-semibold">{formatAccuracy(vehicle.location.accuracy)}</p>
                  </div>
                </div>

                {vehicle.destination && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Route className="h-3 w-3 mr-1 text-blue-600" />
                        <p className="text-xs font-medium text-blue-800">{vehicle.destination.address}</p>
                      </div>
                      <div className="text-xs text-blue-600">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {vehicle.destination.eta}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Last update: {new Date(vehicle.location.timestamp).toLocaleTimeString()}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openMaps(vehicle.location)}
                  >
                    <MapPin className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}

            {vehicles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Car className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No vehicles found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Geofence Alerts */}
        {geofenceAlerts.length > 0 && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <h2 className="font-semibold text-red-800 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Geofence Alerts ({geofenceAlerts.length})
              </h2>
            </CardHeader>
            <CardContent className="space-y-2">
              {geofenceAlerts.map((alert) => {
                const vehicle = vehicles.find(v => v.id === alert.vehicleId);
                return (
                  <div key={alert.id} className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm text-red-800">
                          {vehicle?.registration} - {alert.type === 'entry' ? 'Entered' : 'Exited'} {alert.zone}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          {alert.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => acknowledgeGeofenceAlert(alert.id)}
                        className="text-red-600"
                      >
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Location History */}
        {trackingHistory.length > 0 && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <h2 className="font-semibold">Location History ({trackingHistory.length})</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {trackingHistory.slice(-10).reverse().map((location, index) => (
                  <div key={location.timestamp} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <div>
                      <p className="font-mono">
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </p>
                      <p className="text-gray-600">
                        {formatAccuracy(location.accuracy)} accuracy
                        {location.speed && ` • ${formatSpeed(location.speed)}`}
                      </p>
                    </div>
                    <p className="text-gray-500">
                      {new Date(location.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MobileLocationServices;
