import { useState, useEffect } from 'react';

// Define the types needed for the application
interface TokenValidationResult {
  isValid: boolean;
  message: string;
  details?: string;
}

// Mocked utility functions to replace the external imports
// In a real application, these would handle actual API calls and validation logic.

/**
 * Mocks the validation of the Wialon API URL.
 * It checks if the URL starts with 'https://' and is a valid format.
 * @param {string} url The URL to validate.
 * @returns {TokenValidationResult} An object with validation result and a message.
 */
const verifyWialonApiUrl = (url: string): TokenValidationResult => {
  if (url.trim() === '') {
    return { isValid: false, message: 'API URL cannot be empty.' };
  }
  if (!url.startsWith('https://')) {
    return { isValid: false, message: 'URL must start with "https://".' };
  }
  try {
    new URL(url);
    return { isValid: true, message: '' };
  } catch (error) {
    return { isValid: false, message: 'Invalid URL format.', details: (error as Error).message };
  }
};

/**
 * Mocks the validation of the Wialon token format.
 * For this example, it simply checks if the token is not empty.
 * @param {string} token The token to validate.
 * @returns {TokenValidationResult} An object with validation result and a message.
 */
const validateTokenFormat = (token: string): TokenValidationResult => {
  if (token.trim() === '') {
    return { isValid: false, message: 'Token cannot be empty.' };
  }
  // This is a simple mock, a real implementation would check for specific token patterns
  return { isValid: true, message: '' };
};

// Mocked Wialon API service functions

/**
 * Mocks the initialization of the Wialon API.
 * Simulates a successful or failed initialization.
 * @param {string} url The API URL.
 * @returns {Promise<boolean>} A promise that resolves to true for success, false for failure.
 */
const initWialonApi = (url: string): Promise<boolean> => {
  console.log(`Mock: Initializing Wialon API with URL: ${url}`);
  return new Promise((resolve) => setTimeout(() => resolve(true), 500));
};

/**
 * Mocks the login process to Wialon.
 * Simulates a successful login for a specific mock token, otherwise it fails.
 * @param {{ token: string, baseUrl: string }} params The login parameters.
 * @returns {Promise<void>} A promise that resolves on success or rejects on failure.
 */
const loginToWialon = ({ token, baseUrl }: { token: string, baseUrl: string }): Promise<void> => {
  console.log(`Mock: Attempting to login with token to ${baseUrl}...`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate successful login for a specific token
      // The token has been hardcoded in the component to the user's provided token
      if (token === 'c1099bc37c906fd0832d8e783b60ae0d4F999A33B2E4F3B4BE3FA15BFC665617D906C0F0') {
        resolve();
      } else {
        // Simulate a specific error
        reject(new Error('Unauthorized: Invalid token or insufficient rights.'));
      }
    }, 1000);
  });
};

/**
 * Mocks fetching Wialon units after a successful login.
 * Returns a list of units, the number of which depends on the token.
 * @returns {Promise<Array<any>>} A promise that resolves to an array of units.
 */
const getWialonUnits = (): Promise<any[]> => {
  console.log(`Mock: Fetching Wialon units...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return a mock list of units
      const mockUnits = [
        { id: 1, name: 'Unit A' },
        { id: 2, name: 'Unit B' },
        { id: 3, name: 'Unit C' }
      ];
      resolve(mockUnits);
    }, 750);
  });
};

const WialonConfig: React.FC = () => {
  // Simulate the VITE environment variable
  const wialonLoginUrl = 'https://hosting.wialon.com/?token=c1099bc37c906fd0832d8e783b60ae0d4F999A33B2E4F3B4BE3FA15BFC665617D906C0F0&lang=en';

  // Form state
  const [apiUrl, setApiUrl] = useState(
    localStorage.getItem('wialon_api_url') ||
    'https://hst-api.wialon.com'
  );

  const [token, setToken] = useState(
    localStorage.getItem('wialon_token') ||
    'c1099bc37c906fd0832d8e783b60ae0d4F999A33B2E4F3B4BE3FA15BFC665617D906C0F0'
  );

  const [isTokenVisible, setIsTokenVisible] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Validation state
  const [urlValidation, setUrlValidation] = useState<TokenValidationResult>({
    isValid: true,
    message: ''
  });

  const [tokenValidation, setTokenValidation] = useState<TokenValidationResult>({
    isValid: true,
    message: ''
  });

  // Test connection state
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
    unitCount?: number;
  } | null>(null);

  // Effect to validate inputs when they change
  useEffect(() => {
    setUrlValidation(verifyWialonApiUrl(apiUrl));
  }, [apiUrl]);

  useEffect(() => {
    setTokenValidation(validateTokenFormat(token));
  }, [token]);

  // Save settings
  const saveSettings = () => {
    // Save to localStorage
    localStorage.setItem('wialon_api_url', apiUrl);
    localStorage.setItem('wialon_token', token);

    // Show success message in the UI
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Test connection
  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      // Step 1: Initialize API
      const initialized = await initWialonApi(apiUrl);
      if (!initialized) {
        throw new Error('Failed to initialize Wialon API');
      }

      // Step 2: Login with token
      await loginToWialon({ token, baseUrl: apiUrl });

      // Step 3: Fetch units to verify full access
      const units = await getWialonUnits();

      setTestResult({
        success: true,
        message: 'Successfully connected!',
        details: `Retrieved ${units.length} units from your account`,
        unitCount: units.length
      });
    } catch (error: any) {
      console.error('Wialon connection test failed:', error);

      setTestResult({
        success: false,
        message: 'Connection failed',
        details: error.message || 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginUrl = () => {
    if (wialonLoginUrl) {
      // For a user-facing login flow, you would typically open this URL in a new window
      window.open(wialonLoginUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-100 min-h-screen font-sans antialiased">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Wialon API Configuration</h1>

        <div className="space-y-6">
          <div className="form-group">
            <label htmlFor="api-url" className="block text-sm font-medium text-gray-700 mb-1">Wialon API URL</label>
            <input
              id="api-url"
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className={`block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!urlValidation.isValid ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="https://hst-api.wialon.com"
            />
            {!urlValidation.isValid && (
              <div className="text-sm text-red-500 mt-1">
                <p>{urlValidation.message}</p>
                {urlValidation.details && <p className="text-xs text-red-400">{urlValidation.details}</p>}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">Wialon Token</label>
            <div className="relative">
              <input
                id="token"
                type={isTokenVisible ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className={`block w-full pr-12 px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!tokenValidation.isValid ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your Wialon token"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none"
                onClick={() => setIsTokenVisible(!isTokenVisible)}
              >
                {isTokenVisible ? 'Hide' : 'Show'}
              </button>
            </div>
            {!tokenValidation.isValid && (
              <div className="text-sm text-red-500 mt-1">
                <p>{tokenValidation.message}</p>
                {tokenValidation.details && <p className="text-xs text-red-400">{tokenValidation.details}</p>}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              className="w-full sm:w-1/2 px-6 py-3 font-medium text-white transition-colors duration-200 transform bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300"
              onClick={saveSettings}
              disabled={!urlValidation.isValid || !tokenValidation.isValid}
            >
              Save Settings
            </button>
            <button
              type="button"
              className="w-full sm:w-1/2 px-6 py-3 font-medium text-indigo-600 transition-colors duration-200 transform bg-white border border-indigo-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300"
              onClick={testConnection}
              disabled={isLoading || !urlValidation.isValid || !tokenValidation.isValid}
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {saveSuccess && (
              <div className="text-center text-sm text-green-600 font-semibold p-2 bg-green-100 rounded-lg transition-opacity duration-300">
                Wialon settings saved successfully!
              </div>
          )}

          {testResult && (
            <div className={`p-4 rounded-lg border-2 ${testResult.success ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`}>
              <h3 className="font-semibold text-lg">{testResult.message}</h3>
              {testResult.details && <p className="mt-1 text-sm">{testResult.details}</p>}
              {testResult.success && testResult.unitCount !== undefined && (
                <div className="mt-4">
                  <p className="text-sm">Connection successful! You can now use Wialon tracking in the application.</p>
                  {testResult.unitCount > 0 ? (
                    <a href="/wialon-dashboard" className="inline-block mt-3 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 transform bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                      Go to Wialon Dashboard
                    </a>
                  ) : (
                    <p className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded mt-2">
                      <span className="font-semibold">Warning:</span> No units found in your account.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 border-t pt-6 border-gray-200 space-y-4 text-gray-600">
          <h2 className="text-xl font-semibold text-gray-800">User Login with URL</h2>
          <p>
            You can use a direct login URL to access Wialon. This will open a new browser tab and redirect you to your Wialon account.
          </p>
          <button
            onClick={handleLoginUrl}
            className="w-full sm:w-auto px-6 py-3 font-medium text-white transition-colors duration-200 transform bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Go to Wialon Login
          </button>
        </div>

        <div className="mt-8 border-t pt-6 border-gray-200 space-y-4 text-gray-600">
          <h2 className="text-xl font-semibold text-gray-800">How to get a Wialon token?</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Log in to your Wialon account</li>
            <li>Go to "My Profile" or "User Settings"</li>
            <li>Navigate to the "App Access" or "API Tokens" section</li>
            <li>Click "Create Token" and set appropriate access rights</li>
            <li>Copy the generated token and paste it here</li>
          </ol>

          <h2 className="text-xl font-semibold text-gray-800">Troubleshooting</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-gray-800">Error code 5 (Error performing request)</strong>: This usually indicates a network issue, incorrect API URL, or invalid token format.
            </li>
            <li>
              <strong className="text-gray-800">Error code 7 (Unauthorized)</strong>: Your token may have expired or doesn't have the required permissions.
            </li>
            <li>
              <strong className="text-gray-800">Network errors</strong>: Check your internet connection and verify the API URL.
            </li>
          </ul>

          <p>
            <a
              href="https://sdk.wialon.com/wiki/en/sidebar/remoteapi/apiref/apiref"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline transition-colors duration-200"
            >
              Wialon API Documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WialonConfig;
