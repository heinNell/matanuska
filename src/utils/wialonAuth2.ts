/**
 * Wialon Authentication Utilities
 *
 * This file provides functions for interacting with the Wialon API
 * for login, logout, getting current user information, and loading the SDK.
 */

// Placeholder for the Wialon SDK object, which would be globally available after loading.
// In a real scenario, you'd likely get this from `window.wialon` or similar after the SDK script loads.
declare const wialon: any;

/**
 * Loads the Wialon JavaScript SDK dynamically.
 * You might fetch the WIALON_SDK_URL from wialonConfig.
 */
export const loadWialonSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Prevent multiple SDK loads
    if (typeof wialon !== 'undefined' && wialon.core) {
      console.log('Wialon SDK already loaded.');
      return resolve();
    }

    const script = document.createElement('script');
    // Assuming WIALON_SDK_URL is defined and accessible, e.g., imported from wialonConfig.
    // For this example, we'll hardcode it, but you should import it.
    script.src = "https://sdk.wialon.com/wialon/sdk/current/wialon.js"; // Example SDK URL
    script.async = true;
    script.onload = () => {
      if (typeof wialon !== 'undefined' && wialon.core) {
        console.log('Wialon SDK loaded successfully via script.');
        resolve();
      } else {
        reject(new Error('Wialon SDK failed to initialize after script load.'));
      }
    };
    script.onerror = (error) => {
      console.error('Failed to load Wialon SDK script:', error);
      reject(new Error('Failed to load Wialon SDK script.'));
    };
    document.head.appendChild(script);
  });
};

/**
 * Attempts to log in to Wialon using the provided token.
 * @param token The Wialon API token.
 * @returns A promise that resolves with a success message or rejects with an error.
 */
export const loginWialon = (token: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (typeof wialon === 'undefined' || !wialon.core) {
      return reject(new Error('Wialon SDK not loaded. Please load SDK first.'));
    }

    wialon.core.Session.getInstance().loginToken(token, (code: number) => {
      if (code === 0) {
        // Success
        // Corrected: Changed .get="user"() to .getUser()
        resolve(`Logged in as: ${wialon.core.Session.getInstance().getUser().getName()}`);
      } else {
        // Error
        const errorMsg = wialon.core.Errors.getErrorText(code);
        reject(new Error(`Login failed: ${errorMsg} (Code: ${code})`));
      }
    });
  });
};

/**
 * Logs out from the current Wialon session.
 * @returns A promise that resolves with a success message or rejects with an error.
 */
export const logoutWialon = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (typeof wialon === 'undefined' || !wialon.core) {
      return reject(new Error('Wialon SDK not loaded. Cannot logout.'));
    }

    wialon.core.Session.getInstance().logout((code: number) => {
      if (code === 0) {
        resolve("Logged out successfully.");
      } else {
        const errorMsg = wialon.core.Errors.getErrorText(code);
        reject(new Error(`Logout failed: ${errorMsg} (Code: ${code})`));
      }
    });
  });
};

/**
 * Gets the name of the current Wialon user, if logged in.
 * @returns The username string or null if not logged in.
 */
export const getCurrentWialonUser = (): string | null => {
  // Corrected: Changed .get="user"() to .getUser()
  if (typeof wialon === 'undefined' || !wialon.core || !wialon.core.Session.getInstance().getUser()) {
    return null;
  }
  // Corrected: Changed .get="user"() to .getUser()
  return wialon.core.Session.getInstance().getUser().getName();
};
