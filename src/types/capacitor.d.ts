// This file provides type declarations for @capacitor/core to fix TypeScript errors
declare module '@capacitor/core' {
  export interface CapacitorConfig {
    appId: string;
    appName: string;
    webDir: string;
    server?: {
      url?: string;
      cleartext?: boolean;
    };
    plugins?: Record<string, unknown>;
  }

  export const Capacitor: {
    getPlatform: () => 'web' | 'android' | 'ios';
    isPluginAvailable: (name: string) => boolean;
    isNativePlatform: () => boolean;
    registerPlugin: (name: string, methods?: string[]) => Record<string, unknown>;
    convertFileSrc: (path: string) => string;
  };
}
