/**
 * Wialon Configuration Component
 * Used to configure and test Wialon API connection settings
 */

import React, { useState } from 'react';
import { wialonService } from '../utils/wialonService';
import './WialonConfig.css';

interface WialonError extends Error {
  code?: number;
}

interface TestResult {
  success: boolean;
  message: string;
  details?: string;
  unitCount?: number;
}

const WialonConfig: React.FC = () => {
  // Form state
  const [apiUrl, setApiUrl] = useState(
    localStorage.getItem('wialon_api_url') ||
    import.meta.env.VITE_WIALON_API_URL ||
    'https://hst-api.wialon.com'
  );

  const [token, setToken] = useState(
    localStorage.getItem('wialon_token') ||
    import.meta.env.VITE_WIALON_TOKEN ||
    ''
  );

  const [isTokenVisible, setIsTokenVisible] = useState(false);

  // Test connection state
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Save settings
  const saveSettings = () => {
    // Save to localStorage
    localStorage.setItem('wialon_api_url', apiUrl);
    localStorage.setItem('wialon_token', token);

    // Show success message
    alert('Wialon settings saved successfully');
  };

  // Test connection with proper error typing
  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      // Step 1 & 2: Initialize and login using the service class.
      (wialonService as any).TOKEN = token;
      await wialonService.initSession();

      // Step 3: Fetch units to verify full access
      const units = wialonService.getUnits();

      setTestResult({
        success: true,
        message: 'Successfully connected to Wialon API!',
        details: `Retrieved ${units.length} units from your account`,
        unitCount: units.length
      });
    } catch (error) {
      console.error('Wialon connection test failed:', error);

      const wialonError = error as WialonError;
      setTestResult({
        success: false,
        message: 'Connection failed',
        details: wialonError.message || 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wialon-config-container">
      <h1>Wialon API Configuration</h1>

      <div className="config-form">
        <div className="form-group">
          <label htmlFor="api-url">Wialon API URL</label>
          <input
            id="api-url"
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="form-control"
            placeholder="https://hst-api.wialon.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="token">Wialon Token</label>
          <div className="token-input-container">
            <input
              id="token"
              type={isTokenVisible ? 'text' : 'password'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="form-control"
              placeholder="Enter your Wialon token"
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setIsTokenVisible(!isTokenVisible)}
            >
              {isTokenVisible ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={saveSettings}
          >
            Save Settings
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={testConnection}
            disabled={isLoading}
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        {testResult && (
          <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
            <h3>{testResult.message}</h3>
            {testResult.details && <p>{testResult.details}</p>}
            {testResult.success && testResult.unitCount !== undefined && (
              <div className="success-details">
                <p>Connection successful! You can now use Wialon tracking in the application.</p>
                {testResult.unitCount > 0 ? (
                  <a href="/wialon-dashboard" className="btn btn-success">
                    Go to Wialon Dashboard
                  </a>
                ) : (
                  <p className="warning">
                    No units found in your account. Please make sure you have units configured in Wialon.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="help-section">
        <h2>How to get a Wialon token?</h2>
        <ol>
          <li>Log in to your Wialon account</li>
          <li>Go to "My Profile" or "User Settings"</li>
          <li>Navigate to the "App Access" or "API Tokens" section</li>
          <li>Click "Create Token" and set appropriate access rights</li>
          <li>Copy the generated token and paste it here</li>
        </ol>

        <h2>Troubleshooting</h2>
        <ul>
          <li>
            <strong>Error code 5 (Error performing request)</strong>:
            This usually indicates a network issue, incorrect API URL, or invalid token format.
          </li>
          <li>
            <strong>Error code 7 (Unauthorized)</strong>:
            Your token may have expired or doesn't have the required permissions.
          </li>
          <li>
            <strong>Network errors</strong>:
            Check your internet connection and verify the API URL.
          </li>
        </ul>

        <p>
          <a
            href="https://sdk.wialon.com/wiki/en/sidebar/remoteapi/apiref/apiref"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wialon API Documentation
          </a>
        </p>
      </div>
    </div>
  );
};

export default WialonConfig;
