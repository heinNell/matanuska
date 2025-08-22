/**
 * Type definitions for global window with Wialon SDK
 */

interface WialonCore {
  Session: {
    getInstance(): {
      initSession(url: string): void;
      loginToken(token: string, flagss: string, callback: (code: number) => void): void;
      getId(): string;
      getCurrUser(): { getName(): string };
      getBaseUrl(): string;
      logout(callback: () => void): void;
      loadLibrary(libs: string, callback: () => void): void;
      updateDataFlags(flags: Array<{
        type: string;
        data: string;
        flags: number;
        mode: number;
      }>, callback: (code: number) => void): void;
      getItems(type: string): any[];
      getItem(id: number): any;
    };
  };
  Remote: {
    getInstance(): {
      remoteCall(method: string, params: string, callback: (code: number, data: any) => void): void;
    };
  };
  Errors: {
    getErrorText(code: number): string;
  };
}

declare global {
  interface Window {
    wialon?: {
      core: WialonCore;
      item: any;
      util: any;
      render: any;
      [key: string]: any;
    };
  }
}

export {};
