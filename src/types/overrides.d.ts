// This declaration file is used to override types from third-party libraries
// that might cause TypeScript errors due to incompatible features

declare module 'google-auth-library' {
  // Overriding the BaseExternalAccountClient class to avoid private field errors
  export class BaseExternalAccountClient {
    // Add basic public methods and properties
    getServiceAccountEmail(): string | null;
    setCredentials(credentials: any): void;
    getAccessToken(): Promise<any>;
    getRequestHeaders(): Promise<any>;
    request<T>(opts: any): Promise<T>;
    request<T>(opts: any, callback: (err: any, res?: T) => void): void;
    getProjectId(): Promise<string | null>;
  }

  // Keep other exports intact
  export * from 'google-auth-library';
}
