/**
 * Global type definitions for environment variables
 * This helps with IDE support and prevents runtime errors
 */

interface ImportMeta {
  env: {
    MODE?: string;
    BASE_URL?: string;
    PROD?: boolean;
    DEV?: boolean;
    VITE_WIALON_API_URL?: string;
    VITE_WIALON_LOGIN_URL?: string;
    VITE_WIALON_SESSION_TOKEN?: string;
    VITE_GOOGLE_MAPS_API_KEY?: string;
    VITE_FIREBASE_API_KEY?: string;
    VITE_FIREBASE_AUTH_DOMAIN?: string;
    VITE_FIREBASE_PROJECT_ID?: string;
    VITE_FIREBASE_STORAGE_BUCKET?: string;
    VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
    VITE_FIREBASE_APP_ID?: string;
    VITE_FIREBASE_MEASUREMENT_ID?: string;
    VITE_USE_EMULATOR?: string;
    VITE_ENV_MODE?: string;
    [key: string]: string | boolean | undefined;
  };
}
