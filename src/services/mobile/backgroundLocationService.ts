import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { App, AppState } from '@capacitor/app';

interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

interface TrackingOptions {
  enableBackground: boolean;
  distanceFilter: number; // meters
  timeInterval: number; // milliseconds
  highAccuracy: boolean;
}

interface VehicleTrackingData {
  vehicleId: string;
  driverId: string;
  tripId?: string;
  isActive: boolean;
}

class BackgroundLocationService {
  private watchId: string | null = null;
  private isTracking: boolean = false;
  private trackingData: VehicleTrackingData | null = null;
  private locationBuffer: LocationUpdate[] = [];
  private syncTimer: NodeJS.Timeout | null = null;
  private appState: AppState | null = null;

  private readonly STORAGE_KEYS = {
    TRACKING_DATA: 'background_tracking_data',
    LOCATION_BUFFER: 'location_buffer',
    LAST_SYNC: 'last_location_sync'
  };

  private readonly DEFAULT_OPTIONS: TrackingOptions = {
    enableBackground: true,
    distanceFilter: 10, // 10 meters
    timeInterval: 30000, // 30 seconds
    highAccuracy: true
  };

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Background location service only available on native platforms');
      return;
    }

    // Monitor app state changes
    App.addListener('appStateChange', (state: AppState) => {
      this.appState = state;
      this.handleAppStateChange(state);
    });

    // Handle app resume
    App.addListener('resume', () => {
      this.handleAppResume();
    });

    // Restore tracking state on app start
    await this.restoreTrackingState();
  }

  async startTracking(trackingData: VehicleTrackingData, options?: Partial<TrackingOptions>): Promise<boolean> {
    if (this.isTracking) {
      console.log('Location tracking already active');
      return true;
    }

    const trackingOptions = { ...this.DEFAULT_OPTIONS, ...options };

    try {
      // Request permissions
      const permissions = await Geolocation.requestPermissions();
      if (permissions.location !== 'granted') {
        throw new Error('Location permission not granted');
      }

      // Store tracking configuration
      this.trackingData = trackingData;
      await this.saveTrackingData();

      // Start location watching
      this.watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: trackingOptions.highAccuracy,
          timeout: 15000,
          maximumAge: trackingOptions.timeInterval / 2
        },
        (position, err) => {
          if (err) {
            console.error('Location watch error:', err);
            this.handleLocationError(err);
            return;
          }

          if (position) {
            this.handleLocationUpdate({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed || undefined,
              heading: position.coords.heading || undefined,
              timestamp: position.timestamp
            });
          }
        }
      );

      this.isTracking = true;

      // Start sync timer
      this.startSyncTimer();

      // Request background location permissions on iOS
      if (Capacitor.getPlatform() === 'ios') {
        await this.requestBackgroundLocationPermission();
      }

      // Show notification that tracking is active
      await this.showTrackingNotification();

      console.log('Background location tracking started');
      return true;

    } catch (error) {
      console.error('Failed to start location tracking:', error);
      return false;
    }
  }

  async stopTracking(): Promise<void> {
    if (!this.isTracking) return;

    try {
      // Stop location watching
      if (this.watchId) {
        await Geolocation.clearWatch({ id: this.watchId });
        this.watchId = null;
      }

      // Stop sync timer
      if (this.syncTimer) {
        clearInterval(this.syncTimer);
        this.syncTimer = null;
      }

      // Sync any remaining locations
      await this.syncLocationBuffer();

      // Clear tracking data
      this.trackingData = null;
      this.isTracking = false;
      await this.clearTrackingData();

      // Cancel tracking notification
      await LocalNotifications.cancel({
        notifications: [{ id: 'location_tracking' }]
      });

      console.log('Background location tracking stopped');

    } catch (error) {
      console.error('Error stopping location tracking:', error);
    }
  }

  private async handleLocationUpdate(location: LocationUpdate) {
    // Add to buffer
    this.locationBuffer.push(location);

    // Limit buffer size
    if (this.locationBuffer.length > 100) {
      this.locationBuffer = this.locationBuffer.slice(-50);
    }

    // Save buffer to storage
    await this.saveLocationBuffer();

    // Update tracking notification with current location
    await this.updateTrackingNotification(location);

    // Immediate sync for critical updates (low accuracy, high speed changes)
    if (location.accuracy > 100 || (location.speed && location.speed > 20)) {
      await this.syncLocationBuffer();
    }
  }

  private async handleLocationError(error: any) {
    console.error('Location error:', error);

    // Show error notification
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 'location_error',
          title: 'Location Tracking Issue',
          body: 'GPS signal lost or weak. Tracking may be intermittent.',
          schedule: { at: new Date(Date.now() + 1000) }
        }
      ]
    });
  }

  private async handleAppStateChange(state: AppState) {
    if (state.isActive) {
      // App became active - sync immediately
      await this.syncLocationBuffer();
    } else {
      // App went to background - ensure tracking continues
      await this.ensureBackgroundTracking();
    }
  }

  private async handleAppResume() {
    // App resumed - restore tracking if needed
    await this.restoreTrackingState();
    await this.syncLocationBuffer();
  }

  private startSyncTimer() {
    this.syncTimer = setInterval(async () => {
      await this.syncLocationBuffer();
    }, 60000); // Sync every minute
  }

  private async syncLocationBuffer() {
    if (this.locationBuffer.length === 0) return;

    try {
      // In a real app, sync to your backend API
      console.log(`Syncing ${this.locationBuffer.length} location updates`);

      // Mock API call
      const syncData = {
        vehicleId: this.trackingData?.vehicleId,
        driverId: this.trackingData?.driverId,
        tripId: this.trackingData?.tripId,
        locations: [...this.locationBuffer],
        timestamp: Date.now()
      };

      // TODO: Replace with actual API call
      console.log('Location sync data:', syncData);

      // Clear buffer after successful sync
      this.locationBuffer = [];
      await this.saveLocationBuffer();

      // Update last sync timestamp
      await Preferences.set({
        key: this.STORAGE_KEYS.LAST_SYNC,
        value: Date.now().toString()
      });

    } catch (error) {
      console.error('Failed to sync location buffer:', error);

      // Keep failed locations for retry
      if (this.locationBuffer.length > 200) {
        this.locationBuffer = this.locationBuffer.slice(-100);
        await this.saveLocationBuffer();
      }
    }
  }

  private async saveTrackingData() {
    if (this.trackingData) {
      await Preferences.set({
        key: this.STORAGE_KEYS.TRACKING_DATA,
        value: JSON.stringify(this.trackingData)
      });
    }
  }

  private async restoreTrackingState() {
    try {
      const { value } = await Preferences.get({
        key: this.STORAGE_KEYS.TRACKING_DATA
      });

      if (value) {
        this.trackingData = JSON.parse(value);

        // Only restore if tracking was active
        if (this.trackingData?.isActive && !this.isTracking) {
          console.log('Restoring background location tracking');
          await this.startTracking(this.trackingData);
        }
      }
    } catch (error) {
      console.error('Failed to restore tracking state:', error);
    }
  }

  private async clearTrackingData() {
    await Preferences.remove({ key: this.STORAGE_KEYS.TRACKING_DATA });
  }

  private async saveLocationBuffer() {
    await Preferences.set({
      key: this.STORAGE_KEYS.LOCATION_BUFFER,
      value: JSON.stringify(this.locationBuffer)
    });
  }

  private async restoreLocationBuffer() {
    try {
      const { value } = await Preferences.get({
        key: this.STORAGE_KEYS.LOCATION_BUFFER
      });

      if (value) {
        this.locationBuffer = JSON.parse(value);
      }
    } catch (error) {
      console.error('Failed to restore location buffer:', error);
      this.locationBuffer = [];
    }
  }

  private async showTrackingNotification() {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 'location_tracking',
          title: 'Fleet Tracking Active',
          body: 'Your location is being tracked for this trip',
          ongoing: true,
          autoCancel: false
        }
      ]
    });
  }

  private async updateTrackingNotification(location: LocationUpdate) {
    const speed = location.speed ? Math.round(location.speed * 3.6) : 0;
    const accuracy = Math.round(location.accuracy);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 'location_tracking',
          title: 'Fleet Tracking Active',
          body: `Speed: ${speed} km/h • Accuracy: ${accuracy}m`,
          ongoing: true,
          autoCancel: false
        }
      ]
    });
  }

  private async requestBackgroundLocationPermission() {
    // This would typically be handled by native iOS code
    // Request "Always" location permission
    console.log('Requesting background location permission for iOS');
  }

  private async ensureBackgroundTracking() {
    if (this.isTracking && this.trackingData) {
      // Ensure tracking continues in background
      console.log('Ensuring background location tracking continues');

      // On some platforms, you might need to restart the watch
      // This is platform-specific optimization
    }
  }

  // Public methods for status checking
  public getTrackingStatus() {
    return {
      isTracking: this.isTracking,
      trackingData: this.trackingData,
      bufferSize: this.locationBuffer.length,
      lastUpdate: this.locationBuffer.length > 0
        ? new Date(this.locationBuffer[this.locationBuffer.length - 1].timestamp)
        : null
    };
  }

  public async getLocationHistory(): Promise<LocationUpdate[]> {
    await this.restoreLocationBuffer();
    return [...this.locationBuffer];
  }

  public async forcSync(): Promise<void> {
    await this.syncLocationBuffer();
  }
}

// Singleton instance
export const backgroundLocationService = new BackgroundLocationService();

export default backgroundLocationService;
