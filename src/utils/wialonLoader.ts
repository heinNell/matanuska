/**
 * Centralized Wialon SDK loader utility
 * Ensures the Wialon SDK is loaded only once and properly initialized
 */

let isWialonLoaded = false;
let isWialonLoading = false;
let wialonPromise: Promise<void> | null = null;

/**
 * Load Wialon SDK with optimal performance settings
 * @param options - Configuration options for the Wialon SDK
 */
export interface WialonLoadOptions {
  baseUrl?: string;
  token?: string;
}

export const loadWialonSDK = (options: WialonLoadOptions = {}): Promise<void> => {
  // Return existing promise if already loading or loaded
  if (wialonPromise) {
    return wialonPromise;
  }

  // If already loaded, return resolved promise
  if (isWialonLoaded && window.wialon) {
    return Promise.resolve();
  }

  // Set loading flag
  isWialonLoading = true;

  wialonPromise = new Promise<void>((resolve, reject) => {
    try {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="wialon.js"]');
      if (existingScript) {
        console.log("✅ Wialon SDK script already exists in DOM");
        isWialonLoaded = true;
        isWialonLoading = false;
        resolve();
        return;
      }

      // Get configuration
      const baseUrl =
        options.baseUrl ||
        "https://hst-api.wialon.com";

      // Create script element with optimal loading
      const script = document.createElement("script");
      script.src = `${baseUrl}/wsdk/script/wialon.js`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log("✅ Wialon SDK loaded successfully");
        isWialonLoaded = true;
        isWialonLoading = false;
        resolve();
      };

      script.onerror = () => {
        const error = "Failed to load Wialon SDK script";
        console.error(error);
        isWialonLoading = false;
        wialonPromise = null;
        reject(new Error(error));
      };

      document.head.appendChild(script);
      console.log("🚚 Loading Wialon SDK...");
    } catch (error) {
      console.error("Error loading Wialon SDK:", error);
      isWialonLoading = false;
      wialonPromise = null;
      reject(error);
    }
  });

  return wialonPromise;
};

/**
 * Initialize Wialon session with token
 * @param token - Wialon token for authentication
 * @param baseUrl - Base URL for Wialon API (default: https://hosting.wialon.com/?token=c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053&lang=en)
 */
export const initWialonSession = async (
  token: string,
  baseUrl: string = "https://hst-api.wialon.com"
): Promise<any> => {
  // Ensure Wialon SDK is loaded
  await loadWialonSDK({ baseUrl });

  if (!window.wialon) {
    throw new Error("Wialon SDK not loaded");
  }

  return new Promise((resolve, reject) => {
    const sess = window.wialon.core.Session.getInstance();
    sess.initSession(baseUrl);

    try {
      sess.loginToken(token, "", (code: any) => {
        if (code) {
          // Get detailed error information
          const errorText = window.wialon.core.Errors.getErrorText(code);
          console.error("Wialon login failed:", errorText, "Error code:", code);
          
          // Check for specific error codes
          if (code === 5) {
            console.warn("Error performing request - Possible network issue or invalid API endpoint");
            console.warn("API URL being used:", baseUrl);
            console.warn("Token format correct:", token && token.length > 20 ? "Yes" : "No");
          }
          
          reject(new Error(`Wialon login failed: ${errorText}`));
          return;
        }

        console.log("✅ Wialon session initialized successfully");
        resolve(sess);
      });
    } catch (err) {
      console.error("Exception during Wialon login:", err);
      reject(new Error(`Wialon login exception: ${err instanceof Error ? err.message : String(err)}`));
    }
  });
};

/**
 * Get Wialon units with their positions
 * @param session - Initialized Wialon session
 * @returns Promise resolving to array of units with positions
 */
export const getWialonUnits = async (session: any): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    if (!window.wialon) {
      reject(new Error("Wialon SDK not loaded"));
      return;
    }

    const flags =
      window.wialon.item.Item.dataFlag.base | window.wialon.item.Unit.dataFlag.lastMessage;

    session.updateDataFlags([{ type: "type", data: "avl_unit", flags, mode: 0 }], (err: any) => {
      if (err) {
        console.error("Wialon flags load error", err);
        reject(new Error(`Wialon flags load error: ${err}`));
        return;
      }

      const units = session.getItems("avl_unit") || [];
      resolve(units);
    });
  });
};

/**
 * Check if Wialon SDK is loaded
 */
export const isWialonSDKLoaded = (): boolean => {
  return isWialonLoaded && !!window.wialon;
};

/**
 * Check if Wialon SDK is currently loading
 */
export const isWialonSDKLoading = (): boolean => {
  return isWialonLoading;
};

/**
 * Get the current Wialon SDK loading status
 */
export const getWialonSDKStatus = () => {
  return {
    isLoaded: isWialonSDKLoaded(),
    isLoading: isWialonSDKLoading(),
    isAvailable: !!window.wialon,
  };
};

// Rely on global typings in src/types/wialon-sdk.d.ts
