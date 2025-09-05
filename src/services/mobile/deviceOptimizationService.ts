import { Capacitor } from '@capacitor/core';
import { Device, DeviceInfo } from '@capacitor/device';
import { Network, NetworkStatus } from '@capacitor/network';
import { App, AppState } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { Preferences } from '@capacitor/preferences';

interface DeviceOptimizationSettings {
  batteryOptimizationEnabled: boolean;
  backgroundSyncEnabled: boolean;
  highPerformanceModeEnabled: boolean;
  dataCompressionEnabled: boolean;
  cacheOptimizationEnabled: boolean;
  imageCompressionQuality: number; // 0-100
  locationAccuracyMode: 'high' | 'balanced' | 'low_power';
  syncFrequency: number; // minutes
}

interface PerformanceMetrics {
  batteryLevel?: number;
  isCharging?: boolean;
  memoryUsage?: number;
  networkType: string;
  networkSpeed: 'slow' | 'moderate' | 'fast' | 'unknown';
  isLowPowerMode?: boolean;
  devicePerformance: 'low' | 'medium' | 'high';
}

interface OptimizationRecommendation {
  category: 'battery' | 'performance' | 'network' | 'storage';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actionRequired: boolean;
  autoApplicable: boolean;
}

class DeviceOptimizationService {
  private isNativeApp: boolean;
  private deviceInfo: DeviceInfo | null = null;
  private networkStatus: NetworkStatus | null = null;
  private appState: AppState | null = null;
  private settings: DeviceOptimizationSettings;
  private performanceMetrics: PerformanceMetrics | null = null;
  private optimizationTimer: NodeJS.Timeout | null = null;

  private readonly STORAGE_KEYS = {
    OPTIMIZATION_SETTINGS: 'device_optimization_settings',
    PERFORMANCE_METRICS: 'performance_metrics_history',
    LAST_OPTIMIZATION: 'last_optimization_check'
  };

  private readonly DEFAULT_SETTINGS: DeviceOptimizationSettings = {
    batteryOptimizationEnabled: true,
    backgroundSyncEnabled: true,
    highPerformanceModeEnabled: false,
    dataCompressionEnabled: true,
    cacheOptimizationEnabled: true,
    imageCompressionQuality: 80,
    locationAccuracyMode: 'balanced',
    syncFrequency: 5
  };

  constructor() {
    this.isNativeApp = Capacitor.isNativePlatform();
    this.settings = this.DEFAULT_SETTINGS;
    this.initializeService();
  }

  private async initializeService() {
    if (!this.isNativeApp) {
      console.log('Device optimization limited on web platform');
    }

    try {
      // Load settings
      await this.loadSettings();

      // Get device information
      if (this.isNativeApp) {
        this.deviceInfo = await Device.getInfo();
        this.networkStatus = await Network.getStatus();
      }

      // Set up listeners
      this.setupEventListeners();

      // Start optimization monitoring
      this.startOptimizationMonitoring();

      // Apply initial optimizations
      await this.applyOptimizations();

      console.log('Device optimization service initialized');

    } catch (error) {
      console.error('Failed to initialize device optimization service:', error);
    }
  }

  private setupEventListeners() {
    if (!this.isNativeApp) return;

    // Network status changes
    Network.addListener('networkStatusChange', (status) => {
      this.networkStatus = status;
      this.updatePerformanceMetrics();
      this.handleNetworkChange(status);
    });

    // App state changes
    App.addListener('appStateChange', (state) => {
      this.appState = state;
      this.handleAppStateChange(state);
    });

    // Memory warnings (if available)
    if ('addEventListener' in window) {
      window.addEventListener('memoryWarning', () => {
        this.handleMemoryWarning();
      });
    }
  }

  private async updatePerformanceMetrics() {
    try {
      const metrics: PerformanceMetrics = {
        networkType: this.networkStatus?.connectionType || 'unknown',
        networkSpeed: this.calculateNetworkSpeed(),
        devicePerformance: this.calculateDevicePerformance(),
        batteryLevel: await this.getBatteryLevel(),
        isCharging: await this.getChargingStatus(),
        memoryUsage: this.getMemoryUsage(),
        isLowPowerMode: await this.getLowPowerModeStatus()
      };

      this.performanceMetrics = metrics;

      // Save metrics for analysis
      await this.savePerformanceMetrics(metrics);

      console.log('Performance metrics updated:', metrics);

    } catch (error) {
      console.error('Failed to update performance metrics:', error);
    }
  }

  private calculateNetworkSpeed(): PerformanceMetrics['networkSpeed'] {
    if (!this.networkStatus) return 'unknown';

    switch (this.networkStatus.connectionType) {
      case 'wifi':
        return 'fast';
      case 'cellular':
        // This would need more sophisticated detection
        return 'moderate';
      case 'none':
        return 'slow';
      default:
        return 'unknown';
    }
  }

  private calculateDevicePerformance(): PerformanceMetrics['devicePerformance'] {
    if (!this.deviceInfo) return 'medium';

    // Basic heuristics based on device info
    const platform = this.deviceInfo.platform;
    const osVersion = this.deviceInfo.osVersion;

    // This is simplified - in a real app, you'd use more sophisticated metrics
    if (platform === 'ios' && parseFloat(osVersion) >= 15) {
      return 'high';
    } else if (platform === 'android' && parseFloat(osVersion) >= 10) {
      return 'high';
    } else {
      return 'medium';
    }
  }

  private async getBatteryLevel(): Promise<number | undefined> {
    try {
      if (this.isNativeApp) {
        const batteryInfo = await Device.getBatteryInfo();
        return batteryInfo?.batteryLevel ? batteryInfo.batteryLevel * 100 : undefined;
      }

      // Web Battery API (deprecated but might work)
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return battery ? battery.level * 100 : undefined;
      }

      return undefined;
    } catch (error) {
      console.error('Failed to get battery level:', error);
      return undefined;
    }
  }

  private async getChargingStatus(): Promise<boolean | undefined> {
    try {
      if (this.isNativeApp) {
        const batteryInfo = await Device.getBatteryInfo();
        return batteryInfo?.isCharging;
      }

      // Web Battery API fallback
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return battery ? battery.charging : undefined;
      }

      return undefined;
    } catch (error) {
      console.error('Failed to get charging status:', error);
      return undefined;
    }
  }

  private getMemoryUsage(): number | undefined {
    try {
      // Web Performance Memory API
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        return memory ? memory.usedJSHeapSize / memory.totalJSHeapSize : undefined;
      }

      return undefined;
    } catch (error) {
      console.error('Failed to get memory usage:', error);
      return undefined;
    }
  }

  private async getLowPowerModeStatus(): Promise<boolean | undefined> {
    // This would typically be detected through native plugins
    // For now, we'll estimate based on battery level
    const batteryLevel = await this.getBatteryLevel();
    return batteryLevel !== undefined ? batteryLevel < 20 : undefined;
  }

  private async applyOptimizations() {
    const recommendations = await this.getOptimizationRecommendations();

    for (const recommendation of recommendations) {
      if (recommendation.autoApplicable) {
        await this.applyOptimization(recommendation);
      }
    }
  }

  public async getOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    if (!this.performanceMetrics) {
      await this.updatePerformanceMetrics();
    }

    const metrics = this.performanceMetrics;
    if (!metrics) return recommendations;

    // Battery optimizations
    if (metrics.batteryLevel !== undefined && metrics.batteryLevel < 20) {
      recommendations.push({
        category: 'battery',
        severity: 'high',
        title: 'Enable Battery Saving Mode',
        description: 'Your battery is low. Enable battery saving mode to extend usage.',
        actionRequired: false,
        autoApplicable: true
      });
    }

    // Performance optimizations
    if (metrics.devicePerformance === 'low') {
      recommendations.push({
        category: 'performance',
        severity: 'medium',
        title: 'Reduce Visual Effects',
        description: 'Reduce animations and visual effects to improve performance.',
        actionRequired: false,
        autoApplicable: true
      });
    }

    // Network optimizations
    if (metrics.networkSpeed === 'slow') {
      recommendations.push({
        category: 'network',
        severity: 'medium',
        title: 'Enable Data Compression',
        description: 'Compress images and data to reduce network usage.',
        actionRequired: false,
        autoApplicable: true
      });
    }

    // Memory optimizations
    if (metrics.memoryUsage !== undefined && metrics.memoryUsage > 0.8) {
      recommendations.push({
        category: 'performance',
        severity: 'high',
        title: 'Clear App Cache',
        description: 'Clear cached data to free up memory.',
        actionRequired: true,
        autoApplicable: false
      });
    }

    return recommendations;
  }

  private async applyOptimization(recommendation: OptimizationRecommendation) {
    console.log('Applying optimization:', recommendation.title);

    switch (recommendation.category) {
      case 'battery':
        await this.applyBatteryOptimizations();
        break;
      case 'performance':
        await this.applyPerformanceOptimizations();
        break;
      case 'network':
        await this.applyNetworkOptimizations();
        break;
      case 'storage':
        await this.applyStorageOptimizations();
        break;
    }
  }

  private async applyBatteryOptimizations() {
    if (!this.settings.batteryOptimizationEnabled) return;

    // Reduce location accuracy
    this.settings.locationAccuracyMode = 'low_power';

    // Increase sync frequency
    this.settings.syncFrequency = Math.max(this.settings.syncFrequency * 2, 15);

    // Reduce image quality
    this.settings.imageCompressionQuality = Math.min(this.settings.imageCompressionQuality, 60);

    // Update status bar (darker theme uses less battery on OLED)
    if (this.isNativeApp) {
      try {
        await StatusBar.setStyle({ style: 'dark' });
      } catch (error) {
        console.error('Failed to set status bar style:', error);
      }
    }

    await this.saveSettings();
    console.log('Battery optimizations applied');
  }

  private async applyPerformanceOptimizations() {
    // Disable non-essential background processes
    this.settings.backgroundSyncEnabled = false;

    // Enable cache optimization
    this.settings.cacheOptimizationEnabled = true;

    await this.saveSettings();
    console.log('Performance optimizations applied');
  }

  private async applyNetworkOptimizations() {
    // Enable data compression
    this.settings.dataCompressionEnabled = true;

    // Reduce image quality for slower connections
    this.settings.imageCompressionQuality = Math.min(this.settings.imageCompressionQuality, 70);

    await this.saveSettings();
    console.log('Network optimizations applied');
  }

  private async applyStorageOptimizations() {
    // Clear old cached data
    await this.clearOldCacheData();

    // Enable cache optimization
    this.settings.cacheOptimizationEnabled = true;

    await this.saveSettings();
    console.log('Storage optimizations applied');
  }

  private async handleNetworkChange(status: NetworkStatus) {
    console.log('Network status changed:', status);

    if (status.connected) {
      // Network available - resume normal operation
      await this.resumeNormalOperation();
    } else {
      // No network - enter offline mode
      await this.enterOfflineMode();
    }
  }

  private async handleAppStateChange(state: AppState) {
    console.log('App state changed:', state);

    if (state.isActive) {
      // App became active - resume optimizations
      await this.resumeOptimizations();
    } else {
      // App went to background - apply background optimizations
      await this.applyBackgroundOptimizations();
    }
  }

  private async handleMemoryWarning() {
    console.log('Memory warning received');

    // Immediate memory cleanup
    await this.clearNonEssentialCache();

    // Reduce memory usage temporarily
    this.settings.cacheOptimizationEnabled = true;
    this.settings.imageCompressionQuality = Math.min(this.settings.imageCompressionQuality, 50);
  }

  private async resumeNormalOperation() {
    // Restore normal settings if battery allows
    const batteryLevel = await this.getBatteryLevel();

    if (batteryLevel && batteryLevel > 30) {
      this.settings.syncFrequency = this.DEFAULT_SETTINGS.syncFrequency;
      this.settings.imageCompressionQuality = this.DEFAULT_SETTINGS.imageCompressionQuality;
      await this.saveSettings();
    }
  }

  private async enterOfflineMode() {
    // Disable background sync
    this.settings.backgroundSyncEnabled = false;

    // Prepare for offline operation
    console.log('Entering offline mode optimizations');
  }

  private async resumeOptimizations() {
    // Resume optimization monitoring
    this.startOptimizationMonitoring();

    // Update metrics
    await this.updatePerformanceMetrics();
  }

  private async applyBackgroundOptimizations() {
    // Reduce background activity
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
      this.optimizationTimer = null;
    }

    console.log('Background optimizations applied');
  }

  private startOptimizationMonitoring() {
    if (this.optimizationTimer) return;

    // Check optimizations every 5 minutes
    this.optimizationTimer = setInterval(async () => {
      await this.updatePerformanceMetrics();

      const recommendations = await this.getOptimizationRecommendations();
      const urgentRecommendations = recommendations.filter(r => r.severity === 'high' && r.autoApplicable);

      for (const recommendation of urgentRecommendations) {
        await this.applyOptimization(recommendation);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  private async clearOldCacheData() {
    try {
      // This would clear old cached data
      console.log('Clearing old cache data');

      // In a real app, you'd clear specific cache entries
      // based on age and usage patterns

    } catch (error) {
      console.error('Failed to clear cache data:', error);
    }
  }

  private async clearNonEssentialCache() {
    try {
      console.log('Clearing non-essential cache for memory warning');

      // Clear image cache, temporary files, etc.

    } catch (error) {
      console.error('Failed to clear non-essential cache:', error);
    }
  }

  // Public methods
  public async updateOptimizationSettings(newSettings: Partial<DeviceOptimizationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
    await this.applyOptimizations();
  }

  public getOptimizationSettings(): DeviceOptimizationSettings {
    return { ...this.settings };
  }

  public getPerformanceMetrics(): PerformanceMetrics | null {
    return this.performanceMetrics;
  }

  public getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  public async forceOptimizationCheck(): Promise<OptimizationRecommendation[]> {
    await this.updatePerformanceMetrics();
    return this.getOptimizationRecommendations();
  }

  private async loadSettings() {
    try {
      const { value } = await Preferences.get({
        key: this.STORAGE_KEYS.OPTIMIZATION_SETTINGS
      });

      if (value) {
        this.settings = { ...this.DEFAULT_SETTINGS, ...JSON.parse(value) };
      }
    } catch (error) {
      console.error('Failed to load optimization settings:', error);
    }
  }

  private async saveSettings() {
    try {
      await Preferences.set({
        key: this.STORAGE_KEYS.OPTIMIZATION_SETTINGS,
        value: JSON.stringify(this.settings)
      });
    } catch (error) {
      console.error('Failed to save optimization settings:', error);
    }
  }

  private async savePerformanceMetrics(metrics: PerformanceMetrics) {
    try {
      // Save metrics with timestamp for historical analysis
      const metricsWithTimestamp = {
        ...metrics,
        timestamp: Date.now()
      };

      const { value } = await Preferences.get({
        key: this.STORAGE_KEYS.PERFORMANCE_METRICS
      });

      let history: any[] = [];
      if (value) {
        history = JSON.parse(value);
      }

      history.push(metricsWithTimestamp);

      // Keep only last 100 entries
      if (history.length > 100) {
        history = history.slice(-50);
      }

      await Preferences.set({
        key: this.STORAGE_KEYS.PERFORMANCE_METRICS,
        value: JSON.stringify(history)
      });

    } catch (error) {
      console.error('Failed to save performance metrics:', error);
    }
  }
}

// Singleton instance
export const deviceOptimizationService = new DeviceOptimizationService();

export default deviceOptimizationService;
