/**
 * Wialon API Diagnostics Tool
 *
 * This utility helps diagnose common Wialon API connection issues
 * and provides troubleshooting recommendations.
 */
import { ErrorCategory, ErrorSeverity, logError } from "../utils/errorHandling";

export interface DiagnosticResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  recommendations?: string[];
}

/**
 * Run full diagnostics on Wialon configuration and connection
 */
export const runWialonDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];

  // 1. Check environment variables
  const tokenCheck = checkWialonToken();
  results.push(tokenCheck);

  // 2. Check API URL format
  const apiUrlCheck = checkWialonApiUrl();
  results.push(apiUrlCheck);

  // 3. Check network connectivity to Wialon
  try {
    const connectivityCheck = await checkWialonConnectivity();
    results.push(connectivityCheck);
  } catch (error) {
    results.push({
      status: 'error',
      message: 'Error during connectivity test',
      details: error instanceof Error ? error.message : String(error),
      recommendations: [
        'Check network connectivity',
        'Verify firewall settings',
        'Ensure Wialon API endpoint is accessible from your network'
      ]
    });
  }

  // Log summary
  const errors = results.filter(r => r.status === 'error').length;
  const warnings = results.filter(r => r.status === 'warning').length;

  if (errors > 0) {
    logError(`Wialon diagnostics found ${errors} errors and ${warnings} warnings`, {
      category: ErrorCategory.API,
      severity: ErrorSeverity.WARNING,
      context: { results }
    });
  }

  return results;
};/**
 * Check if Wialon token is properly configured
 */
export const checkWialonToken = (): DiagnosticResult => {
  const token = import.meta.env.VITE_WIALON_TOKEN;

  if (!token) {
    return {
      status: 'error',
      message: 'Wialon token is missing',
      details: 'VITE_WIALON_TOKEN environment variable is not set',
      recommendations: [
        'Add VITE_WIALON_TOKEN to your environment variables',
        'Ensure the token is included in your .env file',
        'Generate a new token from Wialon if needed'
      ]
    };
  }

  if (token.length < 20) {
    return {
      status: 'warning',
      message: 'Wialon token may be invalid',
      details: 'Token length is shorter than expected',
      recommendations: [
        'Verify token format',
        'Generate a new token from Wialon',
        'Ensure token is copied correctly without missing characters'
      ]
    };
  }

  return {
    status: 'success',
    message: 'Wialon token is properly configured'
  };
};

/**
 * Check if Wialon API URL is properly formatted
 */
export const checkWialonApiUrl = (): DiagnosticResult => {
  const apiUrl = import.meta.env.VITE_WIALON_API_URL;

  if (!apiUrl) {
    return {
      status: 'warning',
      message: 'Using default Wialon API URL',
      details: 'VITE_WIALON_API_URL is not set, using fallback URL',
      recommendations: [
        'Add VITE_WIALON_API_URL to your environment variables if using a custom Wialon server',
        'The default URL is https://hst-api.wialon.com'
      ]
    };
  }

  try {
    new URL(apiUrl);

    if (!apiUrl.startsWith('http')) {
      return {
        status: 'error',
        message: 'Invalid API URL format',
        details: 'URL must start with http:// or https://',
        recommendations: [
          'Update VITE_WIALON_API_URL to include protocol (https://)',
          'Standard format is https://hst-api.wialon.com'
        ]
      };
    }

    return {
      status: 'success',
      message: 'Wialon API URL is properly formatted'
    };
  } catch (e) {
    return {
      status: 'error',
      message: 'Invalid Wialon API URL',
      details: 'URL format is incorrect',
      recommendations: [
        'Check VITE_WIALON_API_URL for typos or formatting issues',
        'Standard format is https://hst-api.wialon.com'
      ]
    };
  }
};

/**
 * Check connectivity to Wialon API
 */
export const checkWialonConnectivity = async (): Promise<DiagnosticResult> => {
  const apiUrl = import.meta.env.VITE_WIALON_API_URL || 'https://hst-api.wialon.com';

  try {
    // Use the SDK URL as a probe since it should always be available
    const sdkUrl = `${apiUrl.replace(/\/+$/, '')}/wsdk/script/wialon.js`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(sdkUrl, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        status: 'success',
        message: 'Successfully connected to Wialon API'
      };
    } else {
      return {
        status: 'error',
        message: `Connection error: HTTP ${response.status}`,
        details: `Server responded with status code ${response.status}`,
        recommendations: [
          'Verify the API URL is correct',
          'Check if the Wialon service is operational',
          'Ensure your network allows connections to this endpoint'
        ]
      };
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        status: 'error',
        message: 'Connection timeout',
        details: 'Request to Wialon API timed out after 5 seconds',
        recommendations: [
          'Check your network connection',
          'Verify if the Wialon service is experiencing delays',
          'Try again later or contact Wialon support'
        ]
      };
    }

    return {
      status: 'error',
      message: 'Connection failed',
      details: error instanceof Error ? error.message : String(error),
      recommendations: [
        'Check your internet connection',
        'Verify firewall settings',
        'Ensure the API endpoint is accessible from your network'
      ]
    };
  }
};
