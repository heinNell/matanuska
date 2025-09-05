import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { nativeNavigationService } from './nativeNavigationService';

interface FleetNotification {
  id: string;
  type: 'alert' | 'update' | 'emergency' | 'maintenance' | 'trip' | 'fuel';
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  vehicleId?: string;
  driverId?: string;
  tripId?: string;
  timestamp: number;
  expiresAt?: number;
}

interface NotificationAction {
  id: string;
  title: string;
  destructive?: boolean;
  requiresAuthentication?: boolean;
}

interface NotificationSettings {
  enabled: boolean;
  alertsEnabled: boolean;
  maintenanceEnabled: boolean;
  tripUpdatesEnabled: boolean;
  fuelAlertsEnabled: boolean;
  emergencyEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm format
  quietHoursEnd: string; // HH:mm format
}

class PushNotificationService {
  private isNativeApp: boolean;
  private pushToken: string | null = null;
  private settings: NotificationSettings;
  private pendingNotifications: FleetNotification[] = [];

  private readonly STORAGE_KEYS = {
    PUSH_TOKEN: 'push_notification_token',
    SETTINGS: 'notification_settings',
    PENDING_NOTIFICATIONS: 'pending_notifications'
  };

  private readonly DEFAULT_SETTINGS: NotificationSettings = {
    enabled: true,
    alertsEnabled: true,
    maintenanceEnabled: true,
    tripUpdatesEnabled: true,
    fuelAlertsEnabled: true,
    emergencyEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00'
  };

  constructor() {
    this.isNativeApp = Capacitor.isNativePlatform();
    this.settings = this.DEFAULT_SETTINGS;
    this.initializeService();
  }

  private async initializeService() {
    if (!this.isNativeApp) {
      console.log('Push notifications only available on native platforms');
      // Initialize local notifications for web fallback
      await this.initializeWebFallback();
      return;
    }

    try {
      // Load settings
      await this.loadSettings();

      // Request permissions
      await this.requestPermissions();

      // Register for push notifications
      await this.registerForPushNotifications();

      // Set up notification handlers
      this.setupNotificationHandlers();

      console.log('Push notification service initialized');

    } catch (error) {
      console.error('Failed to initialize push notification service:', error);
    }
  }

  private async requestPermissions(): Promise<boolean> {
    try {
      const result = await PushNotifications.requestPermissions();

      if (result.receive === 'granted') {
        console.log('Push notification permissions granted');
        return true;
      } else {
        console.log('Push notification permissions denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  private async registerForPushNotifications() {
    try {
      await PushNotifications.register();
      console.log('Registered for push notifications');
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
    }
  }

  private setupNotificationHandlers() {
    // Called when a new push token is received
    PushNotifications.addListener('registration', (token: Token) => {
      this.handleTokenReceived(token.value);
    });

    // Handle registration errors
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Push registration error:', error);
    });

    // Handle received push notification
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      this.handlePushNotificationReceived(notification);
    });

    // Handle notification tap
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      this.handleNotificationAction(notification);
    });
  }

  private async handleTokenReceived(token: string) {
    this.pushToken = token;

    // Save token for later use
    await Preferences.set({
      key: this.STORAGE_KEYS.PUSH_TOKEN,
      value: token
    });

    console.log('Push token received:', token);

    // Send token to your backend
    await this.sendTokenToBackend(token);
  }

  private async sendTokenToBackend(token: string) {
    try {
      // TODO: Replace with your actual API endpoint
      console.log('Sending push token to backend:', token);

      // Example API call:
      // const response = await fetch('/api/push-tokens', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, platform: Capacitor.getPlatform() })
      // });

    } catch (error) {
      console.error('Failed to send push token to backend:', error);
    }
  }

  private async handlePushNotificationReceived(notification: PushNotificationSchema) {
    console.log('Push notification received:', notification);

    // Convert to FleetNotification format
    const fleetNotification: FleetNotification = {
      id: notification.id || Date.now().toString(),
      type: (notification.data?.type as FleetNotification['type']) || 'update',
      title: notification.title || 'Fleet Update',
      message: notification.body || '',
      data: notification.data,
      priority: (notification.data?.priority as FleetNotification['priority']) || 'normal',
      vehicleId: notification.data?.vehicleId,
      driverId: notification.data?.driverId,
      tripId: notification.data?.tripId,
      timestamp: Date.now()
    };

    // Check if notifications are enabled
    if (!this.settings.enabled || !this.shouldShowNotification(fleetNotification)) {
      return;
    }

    // Handle different notification types
    await this.processFleetNotification(fleetNotification);
  }

  private async handleNotificationAction(actionPerformed: ActionPerformed) {
    const { notification, actionId } = actionPerformed;

    console.log('Notification action performed:', { notification, actionId });

    // Handle different actions
    switch (actionId) {
      case 'view':
        await this.handleViewAction(notification);
        break;
      case 'acknowledge':
        await this.handleAcknowledgeAction(notification);
        break;
      case 'emergency_response':
        await this.handleEmergencyResponse(notification);
        break;
      default:
        // Default action - open the app
        await this.handleDefaultAction(notification);
        break;
    }
  }

  private async handleViewAction(notification: PushNotificationSchema) {
    const data = notification.data;

    if (data?.vehicleId) {
      await nativeNavigationService.navigateTo(`/vehicles/${data.vehicleId}`);
    } else if (data?.tripId) {
      await nativeNavigationService.navigateTo(`/trips/${data.tripId}`);
    } else if (data?.deepLink) {
      await nativeNavigationService.navigateTo(data.deepLink);
    } else {
      await nativeNavigationService.navigateTo('/dashboard');
    }
  }

  private async handleAcknowledgeAction(notification: PushNotificationSchema) {
    const notificationId = notification.id;

    if (notificationId) {
      // Send acknowledgment to backend
      console.log('Acknowledging notification:', notificationId);

      // TODO: API call to acknowledge notification
      // await fetch(`/api/notifications/${notificationId}/acknowledge`, { method: 'POST' });
    }
  }

  private async handleEmergencyResponse(notification: PushNotificationSchema) {
    const data = notification.data;

    // Navigate to emergency response page
    await nativeNavigationService.navigateTo('/emergency', {
      hapticFeedback: true
    });

    // Additional emergency handling
    console.log('Emergency response triggered:', data);
  }

  private async handleDefaultAction(notification: PushNotificationSchema) {
    // Default behavior - open relevant page or dashboard
    await nativeNavigationService.navigateTo('/dashboard');
  }

  public async sendLocalNotification(notification: FleetNotification): Promise<void> {
    if (!this.settings.enabled || !this.shouldShowNotification(notification)) {
      return;
    }

    try {
      const localNotification: LocalNotificationSchema = {
        id: parseInt(notification.id) || Date.now(),
        title: notification.title,
        body: notification.message,
        schedule: { at: new Date(Date.now() + 1000) }, // Schedule 1 second from now
        sound: this.settings.soundEnabled ? 'default' : undefined,
        actionTypeId: this.getActionTypeId(notification.type),
        extra: notification.data
      };

      await LocalNotifications.schedule({
        notifications: [localNotification]
      });

      console.log('Local notification scheduled:', notification);

    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  }

  public async scheduleFuelLevelAlert(vehicleId: string, fuelLevel: number): Promise<void> {
    if (!this.settings.fuelAlertsEnabled) return;

    const notification: FleetNotification = {
      id: `fuel_alert_${vehicleId}_${Date.now()}`,
      type: 'fuel',
      title: 'Low Fuel Alert',
      message: `Vehicle fuel level is ${fuelLevel}%. Consider refueling soon.`,
      priority: fuelLevel < 10 ? 'urgent' : 'normal',
      vehicleId,
      timestamp: Date.now(),
      data: { fuelLevel }
    };

    await this.sendLocalNotification(notification);
  }

  public async scheduleMaintenanceReminder(vehicleId: string, maintenanceType: string, dueDate: Date): Promise<void> {
    if (!this.settings.maintenanceEnabled) return;

    const notification: FleetNotification = {
      id: `maintenance_${vehicleId}_${Date.now()}`,
      type: 'maintenance',
      title: 'Maintenance Due',
      message: `${maintenanceType} maintenance is due for vehicle on ${dueDate.toLocaleDateString()}`,
      priority: 'normal',
      vehicleId,
      timestamp: Date.now(),
      expiresAt: dueDate.getTime() + 24 * 60 * 60 * 1000, // Expires 1 day after due date
      data: { maintenanceType, dueDate: dueDate.toISOString() }
    };

    await this.sendLocalNotification(notification);
  }

  public async sendEmergencyAlert(vehicleId: string, driverId: string, location: { lat: number; lng: number }): Promise<void> {
    const notification: FleetNotification = {
      id: `emergency_${vehicleId}_${Date.now()}`,
      type: 'emergency',
      title: 'EMERGENCY ALERT',
      message: 'Emergency button pressed by driver',
      priority: 'urgent',
      vehicleId,
      driverId,
      timestamp: Date.now(),
      data: { location, emergencyType: 'panic_button' }
    };

    await this.sendLocalNotification(notification);

    // Also try to send push notification to all managers
    await this.sendEmergencyPushToManagers(notification);
  }

  private async sendEmergencyPushToManagers(notification: FleetNotification) {
    // This would typically be handled by your backend
    console.log('Sending emergency push to fleet managers:', notification);
  }

  private shouldShowNotification(notification: FleetNotification): boolean {
    // Check type-specific settings
    switch (notification.type) {
      case 'alert':
        return this.settings.alertsEnabled;
      case 'maintenance':
        return this.settings.maintenanceEnabled;
      case 'trip':
        return this.settings.tripUpdatesEnabled;
      case 'fuel':
        return this.settings.fuelAlertsEnabled;
      case 'emergency':
        return this.settings.emergencyEnabled;
      default:
        return true;
    }
  }

  private isInQuietHours(): boolean {
    if (!this.settings.quietHoursEnabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = this.settings.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = this.settings.quietHoursEnd.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      // Same day range (e.g., 9:00 to 17:00)
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight range (e.g., 22:00 to 07:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private getActionTypeId(type: FleetNotification['type']): string {
    switch (type) {
      case 'emergency':
        return 'emergency_actions';
      case 'alert':
        return 'alert_actions';
      case 'maintenance':
        return 'maintenance_actions';
      default:
        return 'default_actions';
    }
  }

  private async processFleetNotification(notification: FleetNotification) {
    // Skip if in quiet hours (except emergencies)
    if (this.isInQuietHours() && notification.priority !== 'urgent' && notification.type !== 'emergency') {
      this.pendingNotifications.push(notification);
      await this.savePendingNotifications();
      return;
    }

    // Process immediately
    await this.sendLocalNotification(notification);
  }

  private async initializeWebFallback() {
    // Initialize local notifications for web platform
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('Web notification permission:', permission);
    }
  }

  // Settings management
  public async updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  private async loadSettings() {
    try {
      const { value } = await Preferences.get({
        key: this.STORAGE_KEYS.SETTINGS
      });

      if (value) {
        this.settings = { ...this.DEFAULT_SETTINGS, ...JSON.parse(value) };
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }

  private async saveSettings() {
    try {
      await Preferences.set({
        key: this.STORAGE_KEYS.SETTINGS,
        value: JSON.stringify(this.settings)
      });
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  private async savePendingNotifications() {
    try {
      await Preferences.set({
        key: this.STORAGE_KEYS.PENDING_NOTIFICATIONS,
        value: JSON.stringify(this.pendingNotifications)
      });
    } catch (error) {
      console.error('Failed to save pending notifications:', error);
    }
  }

  public getPushToken(): string | null {
    return this.pushToken;
  }

  public async clearAllNotifications() {
    try {
      if (this.isNativeApp) {
        await LocalNotifications.removeAllDeliveredNotifications();
      }

      this.pendingNotifications = [];
      await this.savePendingNotifications();

    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }
}

// Singleton instance
export const pushNotificationService = new PushNotificationService();

export default pushNotificationService;
