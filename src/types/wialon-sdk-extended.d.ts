// Extended typings for wialon-sdk.d.ts
import './wialon-sdk';

// Extending the existing Wialon SDK typings
declare namespace W {
  namespace core {
    interface SessionStatic {
      getInstance(): ExtendedSession;
    }

    interface RemoteStatic {
      getInstance(): Remote;
    }

    interface Remote {
      remoteCall(method: string, params: object, callback: (data: any) => void): void;
    }

    const Remote: RemoteStatic;
  }

  interface ExtendedSession extends Session {
    isInitialized(): boolean;
    loginToken(token: string, app: string, callback: (data: any) => void): void;
    logout(callback?: (data: any) => void): void;
  }
}

// Update the global window interface
interface Window {
  wialon: typeof W;
  WIALON_API_URL?: string;
  WIALON_API_TOKEN?: string;
}
