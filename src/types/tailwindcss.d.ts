/**
 * Type declarations for missing Tailwind CSS functions
 * Used to resolve TypeScript errors in the library
 */

declare module "tailwindcss/lib/lib/content" {
  export function parseCandidateFiles(context: any, tailwindConfig: any): any[];
  export function resolvedChangedContent(
    context: any,
    candidateFiles: any[],
    fileModifiedMap: Map<string, number>
  ): [any[], Map<string, number>];
  export function createBroadPatternCheck(patterns: string[]): (path: string) => boolean;
}

declare module "tailwindcss/lib/lib/load-config" {
  export function useCustomJiti(jiti: any): void;
  export function loadConfig(path: string): any;
}

declare module "tailwindcss/lib/lib/setupContextUtils" {
  export const INTERNAL_FEATURES: Record<string, boolean>;
  export function isValidVariantFormatString(format: string): boolean;
  export function parseVariant(variant: string): any;
  export function getFileModifiedMap(context: any): Map<string, number>;
  export function createContext(config: any, root?: any, result?: any): any;
  export function getContext(
    root: any,
    result: any,
    tailwindConfig: any,
    userConfigPath: string | null,
    tailwindConfigHash: string,
    contextDependencies: Set<string>
  ): [any, boolean, Map<string, number>];
}
