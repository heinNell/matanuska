import React from 'react';
import { WIALON_LOGIN_URL, WIALON_API_URL } from '../../utils/wialonConfig2';

/**
 * WialonConfigDisplay Component
 *
 * Displays Wialon configuration information including API URL and login URL.
 * Can be used in admin panels or developer views.
 */
const WialonConfigDisplay: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Wialon Configuration</h3>

      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium text-gray-500">API URL:</span>
          <div className="ml-2 text-sm break-all">{WIALON_API_URL}</div>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-500">Login URL:</span>
          <div className="ml-2 text-xs break-all mb-2 font-mono bg-gray-50 p-1 border rounded">
            {WIALON_LOGIN_URL}
          </div>
          <a
            href={WIALON_LOGIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Open Wialon Login
          </a>
        </div>

        <div className="text-xs text-gray-500 pt-2 border-t">
          <p className="mb-1">To access Wialon hosting directly:</p>
          <ol className="list-decimal list-inside pl-2">
            <li>Click the "Open Wialon Login" button above</li>
            <li>Or use the Wialon Login Panel component in the admin area</li>
            <li>The token is automatically included in the URL</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default WialonConfigDisplay;
