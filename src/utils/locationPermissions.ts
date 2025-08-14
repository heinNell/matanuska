import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

/**
 * Helper class to handle location permissions in a Capacitor app
 */
export class LocationPermissionsHelper {
  /**
   * Check if the app has location permissions
   * @returns {Promise<boolean>} True if the app has location permissions
   */
  static async hasLocationPermissions() {
    // For web platform
    if (Capacitor.getPlatform() === "web") {
      try {
        // Try to get current position to trigger permission request
        await navigator.geolocation.getCurrentPosition(
          () => {},
          () => {},
          { timeout: 10 }
        );
        return true;
      } catch (error) {
        console.error("Error checking location permission on web:", error);
        return false;
      }
    }

    // For native platforms
    try {
      const permissionStatus = await Geolocation.checkPermissions();
      return permissionStatus.location === "granted" || permissionStatus.location === "prompt";
    } catch (error) {
      console.error("Error checking location permissions:", error);
      return false;
    }
  }

  /**
   * Request location permissions
   * @returns {Promise<boolean>} True if permissions were granted
   */
  static async requestLocationPermissions() {
    try {
      const permissionStatus = await Geolocation.requestPermissions();
      return permissionStatus.location === "granted";
    } catch (error) {
      console.error("Error requesting location permissions:", error);
      return false;
    }
  }

  /**
   * Get current position
   * @returns {Promise<GeolocationPosition>} The current position
   */
  static async getCurrentPosition() {
    try {
      const hasPermissions = await this.hasLocationPermissions();
      if (!hasPermissions) {
        const granted = await this.requestLocationPermissions();
        if (!granted) {
          throw new Error("Location permissions not granted");
        }
      }

      return await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
    } catch (error) {
      console.error("Error getting current position:", error);
      throw error;
    }
  }
}
