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
export const getEnvVar = (key: string, fallback: string = ''): string => {
  // Check if running in browser with global ENV_VARS object
  if (typeof window !== 'undefined' && 'ENV_VARS' in window) {
    return (window as any).ENV_VARS[key] || fallback;
  }

  // For Vite's import.meta.env context (modern ES modules)
  try {
    if (import.meta?.env) {
      return import.meta.env[key] || fallback;
    }
  } catch {
    // Silently fail if import.meta is not available
  }

  // For Node.js process.env context
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || fallback;
    }
  } catch {
    // Silently fail if process is not available
  }

  // Return fallback if no environment system is available
  return fallback;
};

/**
 * Initialize environment variables in the browser
 * Creates a global ENV_VARS object that can be used by getEnvVar
 *
 * @param vars - Object containing environment variables
 */
export const initBrowserEnv = (vars: Record<string, string>) => {
  if (typeof window !== 'undefined') {
    (window as any).ENV_VARS = vars;
  }
};
