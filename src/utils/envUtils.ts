/**
 * Environment Variable Utilities
 *
 * Provides safe access to environment variables in different contexts (browser, server, etc.)
 */

/**
 * Get an environment variable safely across different contexts
 *
 * @param key - Environment variable name (e.g., 'VITE_API_URL')
 * @param fallback - Default value if the variable is not found
 * @returns The environment variable value or fallback
 */
export function getEnvVar(key: string, fallback = ''): string {
  try {
    // Prefer variables initialized on the window by initBrowserEnv
    if (typeof window !== 'undefined' && (window as any).ENV_VARS) {
      const winVal = (window as any).ENV_VARS[key];
      if (typeof winVal === 'string' && winVal.trim() !== '') return winVal.trim();
    }

  const metaEnvVal = (import.meta as any)?.env?.[key] as unknown;
  if (typeof metaEnvVal === 'string' && metaEnvVal.trim() !== '') return metaEnvVal.trim();

    const procEnv = (typeof process !== 'undefined' && process.env)
      ? (process.env as any)[key]
      : undefined;
    if (typeof procEnv === 'string' && procEnv.trim() !== '') return procEnv.trim();

    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Initialize environment variables in the browser
 * Creates a global ENV_VARS object that can be used by getEnvVar
 *
 * @param vars - Object containing environment variables
 */
export const initBrowserEnv = (vars: Record<string, string>): void => {
  if (typeof window !== 'undefined') {
    (window as any).ENV_VARS = vars;
  }
};
