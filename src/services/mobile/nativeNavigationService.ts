import { Capacitor } from '@capacitor/core';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface NavigationRoute {
  path: string;
  component: string;
  params?: Record<string, string>;
}

interface DeepLinkHandler {
  pattern: string;
  handler: (params: Record<string, string>) => void | Promise<void>;
}

class NativeNavigationService {
  private isNativeApp: boolean;
  private deepLinkHandlers: DeepLinkHandler[] = [];
  private navigationHistory: string[] = [];
  private currentRoute = '/';

  constructor() {
    this.isNativeApp = Capacitor.isNativePlatform();
    this.initializeNavigation();
  }

  private async initializeNavigation() {
    if (!this.isNativeApp) {
      console.log('Native navigation only available on native platforms');
      return;
    }

    // Register deep link listener
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.handleDeepLink(event.url);
    });

    // Handle app state changes for navigation context
    App.addListener('appStateChange', (state) => {
      if (state.isActive) {
        this.handleAppActivation();
      }
    });

    // Register default deep link handlers
    this.registerDefaultDeepLinkHandlers();
  }

  /**
   * Navigate to a route with native optimizations
   */
  public async navigateTo(path: string, options: {
    replace?: boolean;
    animate?: boolean;
    hapticFeedback?: boolean;
    closeKeyboard?: boolean;
  } = {}) {
    const {
      replace = false,
      animate = true,
      hapticFeedback = true,
      closeKeyboard = true
    } = options;

    try {
      // Haptic feedback for navigation
      if (hapticFeedback && this.isNativeApp) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }

      // Close keyboard if open
      if (closeKeyboard && this.isNativeApp) {
        // This would be handled by the Keyboard plugin
        console.log('Closing keyboard for navigation');
      }

      // Update navigation history
      if (!replace) {
        this.navigationHistory.push(this.currentRoute);

        // Limit history size
        if (this.navigationHistory.length > 50) {
          this.navigationHistory = this.navigationHistory.slice(-25);
        }
      }

      this.currentRoute = path;

      // Use React Router or your routing solution
      // This is a placeholder for your actual routing implementation
      console.log(`Navigating to: ${path}`, { replace, animate });

      // In a real app, you'd call your router here
      // Example: router.push(path) or router.replace(path)

    } catch (error) {
      console.error('Navigation error:', error);
    }
  }

  /**
   * Navigate back with native behavior
   */
  public async navigateBack(options: {
    hapticFeedback?: boolean;
  } = {}) {
    const { hapticFeedback = true } = options;

    try {
      // Haptic feedback
      if (hapticFeedback && this.isNativeApp) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }

      if (this.navigationHistory.length > 0) {
        const previousRoute = this.navigationHistory.pop();
        if (previousRoute) {
          this.currentRoute = previousRoute;
          // Navigate to previous route
          console.log(`Navigating back to: ${previousRoute}`);

          // In a real app, you'd call your router here
          // Example: router.back() or router.push(previousRoute)
        }
      } else {
        // No history - exit app or go to home
        await this.handleExitApp();
      }

    } catch (error) {
      console.error('Back navigation error:', error);
    }
  }

  /**
   * Open external URL with native browser
   */
  public async openExternalUrl(url: string, options: {
    preferInApp?: boolean;
    toolbarColor?: string;
  } = {}) {
    const { preferInApp = true, toolbarColor = '#2563eb' } = options;

    try {
      if (this.isNativeApp && preferInApp) {
        await Browser.open({
          url,
          windowName: '_blank',
          toolbarColor,
          presentationStyle: 'popover'
        });
      } else {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error opening external URL:', error);
      // Fallback to window.open
      window.open(url, '_blank');
    }
  }

  /**
   * Register a deep link handler
   */
  public registerDeepLinkHandler(pattern: string, handler: (params: Record<string, string>) => void | Promise<void>) {
    this.deepLinkHandlers.push({ pattern, handler });
  }

  /**
   * Handle deep link URL
   */
  private async handleDeepLink(url: string) {
    console.log('Handling deep link:', url);

    try {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname;
      const searchParams = new URLSearchParams(parsedUrl.search);

      // Convert search params to object
      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      // Find matching handler
      for (const handler of this.deepLinkHandlers) {
        if (this.matchesPattern(path, handler.pattern)) {
          await handler.handler(params);
          return;
        }
      }

      // Default handling - navigate to the path
      await this.navigateTo(path);

    } catch (error) {
      console.error('Deep link handling error:', error);
    }
  }

  /**
   * Check if path matches pattern
   */
  private matchesPattern(path: string, pattern: string): boolean {
    // Simple pattern matching - in a real app, use a more sophisticated matcher
    const regexPattern = pattern
      .replace(/:\w+/g, '([^/]+)') // Replace :param with capture group
      .replace(/\*/g, '.*'); // Replace * with wildcard

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  /**
   * Register default deep link handlers for the fleet app
   */
  private registerDefaultDeepLinkHandlers() {
    // Vehicle details: matanuska://vehicle/:id
    this.registerDeepLinkHandler('/vehicle/:id', async (params) => {
      await this.navigateTo(`/vehicles/${params.id}`);
    });

    // Trip details: matanuska://trip/:id
    this.registerDeepLinkHandler('/trip/:id', async (params) => {
      await this.navigateTo(`/trips/${params.id}`);
    });

    // Job card: matanuska://jobcard/:id
    this.registerDeepLinkHandler('/jobcard/:id', async (params) => {
      await this.navigateTo(`/workshop/jobcards/${params.id}`);
    });

    // QR Scanner: matanuska://qr-scan
    this.registerDeepLinkHandler('/qr-scan', async () => {
      await this.navigateTo('/workshop/qr/scan');
    });

    // Mobile dashboard: matanuska://mobile-dashboard
    this.registerDeepLinkHandler('/mobile-dashboard', async () => {
      await this.navigateTo('/mobile/dashboard');
    });

    // Location services: matanuska://location
    this.registerDeepLinkHandler('/location', async () => {
      await this.navigateTo('/mobile/location');
    });

    // Emergency: matanuska://emergency
    this.registerDeepLinkHandler('/emergency', async (params) => {
      await this.handleEmergencyDeepLink(params);
    });
  }

  /**
   * Handle emergency deep links
   */
  private async handleEmergencyDeepLink(params: Record<string, string>) {
    // Strong haptic feedback for emergency
    if (this.isNativeApp) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    }

    const vehicleId = params.vehicleId;
    const emergencyType = params.type || 'general';

    console.log('Emergency deep link:', { vehicleId, emergencyType });

    // Navigate to emergency page or show emergency modal
    await this.navigateTo('/emergency', { hapticFeedback: false });

    // Additional emergency handling would go here
  }

  /**
   * Handle app activation (from background or deep link)
   */
  private async handleAppActivation() {
    console.log('App activated, current route:', this.currentRoute);

    // Refresh current page data
    // In a real app, you might want to refresh the current page's data
  }

  /**
   * Handle app exit
   */
  private async handleExitApp() {
    if (this.isNativeApp) {
      // On native platforms, minimize the app instead of closing
      App.minimizeApp();
    } else {
      // On web, go to home page or show exit confirmation
      await this.navigateTo('/');
    }
  }

  /**
   * Share content using native sharing
   */
  public async shareContent(content: {
    title?: string;
    text?: string;
    url?: string;
  }) {
    if (this.isNativeApp && 'navigator' in window && 'share' in navigator) {
      try {
        await navigator.share(content);
      } catch (error) {
        console.error('Native sharing failed:', error);
        // Fallback to copying to clipboard or other sharing method
      }
    } else {
      // Fallback sharing implementation
      console.log('Sharing content:', content);
    }
  }

  /**
   * Get navigation history
   */
  public getNavigationHistory(): string[] {
    return [...this.navigationHistory];
  }

  /**
   * Get current route
   */
  public getCurrentRoute(): string {
    return this.currentRoute;
  }

  /**
   * Clear navigation history
   */
  public clearHistory() {
    this.navigationHistory = [];
  }

  /**
   * Generate deep link URL for sharing
   */
  public generateDeepLink(path: string, params?: Record<string, string>): string {
    const baseUrl = this.isNativeApp ? 'matanuska://fleet' : window.location.origin;
    const url = new URL(path, baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    return url.toString();
  }

  /**
   * Handle hardware back button (Android)
   */
  public async handleHardwareBack(): Promise<boolean> {
    if (this.navigationHistory.length > 0) {
      await this.navigateBack();
      return true; // Handled
    }

    return false; // Not handled - will exit app
  }
}

// Singleton instance
export const nativeNavigationService = new NativeNavigationService();

export default nativeNavigationService;
