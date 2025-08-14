/**
 * Global type declarations for the application
 */

// This is now properly declared in vite-env.d.ts
// Keeping this reference here for backward compatibility if needed
// For Google Maps types, see googleMaps.d.ts

// Global window declarations
declare global {
  interface Window {
    // Add global window properties here if needed
    // For Google Maps, use the types in googleMaps.d.ts
    wialon?: {
      core?: {
        Session: new () => any;
        Errors: {
          getErrorText(code: number): string;
        };
      };
    };
  }
}

// Turn off TypeScript checking for all files in the node_modules/tailwindcss directory
declare module "tailwindcss/lib/lib/*" {
  const content: any;
  export = content;
}

// Specific module augmentations for Tailwind CSS functions
declare module "tailwindcss/lib/lib/content" {
  export function parseCandidateFiles(context: any, tailwindConfig: any): any[];
  export function resolvedChangedContent(
    context: any,
    candidateFiles: any[],
    fileModifiedMap: Map<string, number>
  ): [any[], Map<string, number>];
}

declare module "tailwindcss/lib/lib/load-config" {
  export function loadConfig(path: string): any;
}

declare module "tailwindcss/lib/lib/setupContextUtils" {
  export function getContext(
    root: any,
    result: any,
    tailwindConfig: any,
    userConfigPath: string | null,
    tailwindConfigHash: string,
    contextDependencies: Set<string>
  ): [any, boolean, Map<string, number>];
  export function getFileModifiedMap(context: any): Map<string, number>;
}
