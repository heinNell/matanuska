/** Position of a unit (vehicle) */
export interface WialonPosition {
  x: number; // Longitude
  y: number; // Latitude
  z?: number; // Altitude (optional)
  t?: number; // Timestamp (optional)
  s?: number; // Speed (optional)
  c?: number; // Course (optional)
  sc?: number; // Status code (optional)
}

/** Unit (vehicle or asset) from Wialon */
export interface WialonUnit {
  getId: () => number;
  getName: () => string;
  getPosition: () => WialonPosition | undefined;
  getIconUrl: (size?: number) => string;
  getUniqueId: () => string | number;
  addListener(event: string, callback: (event: any) => void): number;
  removeListenerById(id: number): void;
  getMessages(from: number, to: number, flags: number, callback: any): void;
}

/** Type definition for Wialon SDK */
export interface WialonSDK {
  core: {
    Session: {
      getInstance(): any;
    };
    Errors: {
      getErrorText(code: number): string;
    };
  };
  item: {
    Item: { dataFlag: any; };
    Unit: { dataFlag: any; };
    Resource: { dataFlag: any; };
  };
  util: {
    Number: {
      or(a: number, b: number): number;
    };
  };
}

declare global {
  interface Window {
    wialon: any;
  }
}
