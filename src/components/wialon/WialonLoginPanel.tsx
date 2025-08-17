import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Corrected: Import path now points to 'wialonAuth2' as specified.
import {
  getCurrentWialonUser,
  loadWialonSDK,
  loginWialon,
  logoutWialon,
} from "../../utils/wialonAuth2";
// Corrected: Import path now points to 'wialonConfig2' as specified.
import { WIALON_SESSION_TOKEN, openWialonLogin } from "../../utils/wialonConfig2";
import useWialonDiagnostics from "../../hooks/useWialonDiagnostics";

// Use the token from environment variables or fallback to default
const DEFAULT_TOKEN =
  WIALON_SESSION_TOKEN ||
  "c1099bc37c906fd0832d8e783b60ae0d30936747FF150CC77961EAF35CBC1E2E71BD55AF";

export const WialonLoginPanel: React.FC = () => {
  const [token, setToken] = useState(DEFAULT_TOKEN);
  const [log, setLog] = useState<string[]>([]);
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { diagnoseWialon } = useWialonDiagnostics();
  const navigate = useNavigate();

  // Load Wialon SDK on component mount
  useEffect(() => {
    const loadSDK = async () => {
      try {
        setIsLoading(true);
        appendLog("Loading Wialon SDK...");
        // Ensure loadWialonSDK is properly defined and handles potential errors
        await loadWialonSDK();
        appendLog("Wialon SDK loaded successfully");
        // Check if already logged in
        const currentUser = getCurrentWialonUser();
        if (currentUser) {
          setUser(currentUser);
          appendLog(`Already logged in as: ${currentUser}`);
        }
      } catch (err: any) {
        // Add type annotation for err
        appendLog(`Failed to load Wialon SDK: ${err.message || err}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadSDK();
  }, []); // Empty dependency array means this effect runs once on mount

  /**
   * Appends a message to the log, keeping only the last 20 messages.
   * @param msg The message to append.
   */
  const appendLog = (msg: string) => setLog((prev) => [msg, ...prev.slice(0, 20)]);

  /**
   * Handles the API login process using the Wialon token.
   */
  const handleLogin = async () => {
    if (!token.trim()) {
      appendLog("Please enter a valid token");
      return;
    }

    try {
      setIsLoading(true);
      appendLog("Attempting login...");
      // Ensure loginWialon returns a string message or handles errors appropriately
      const msg = await loginWialon(token);
      appendLog(msg);
      setUser(getCurrentWialonUser());
    } catch (err: any) {
      // Add type annotation for err
      appendLog(`Login failed: ${err.message || err}`);
      appendLog('Running diagnostics...');

      try {
        await diagnoseWialon({
          redirect: false,
          silent: true
        });
        appendLog('Diagnostics complete. Check the diagnostics page for results.');
      } catch (diagError) {
        appendLog('Failed to run diagnostics');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the logout process from Wialon.
   */
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      appendLog("Logging out...");
      // Ensure logoutWialon returns a string message or handles errors appropriately
      const msg = await logoutWialon();
      appendLog(msg);
      setUser(getCurrentWialonUser());
    } catch (err: any) {
      // Add type annotation for err
      appendLog(`Logout failed: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Retrieves and logs the current Wialon user.
   */
  const handleGetUser = () => {
    const username = getCurrentWialonUser();
    if (username) appendLog(`Logged in as: ${username}`);
    else appendLog("Not logged in.");
    setUser(username);
  };

  /**
   * Opens the Wialon direct login page in a new tab.
   */
  const handleDirectLogin = () => {
    appendLog("Opening Wialon direct login in a new tab...");
    // Ensure openWialonLogin correctly handles opening a new window/tab
    openWialonLogin(token);
  };

  return (
    <div className="bg-white border rounded-lg p-6 shadow-lg max-w-md mx-auto my-8 font-sans">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Wialon Login Panel</h2>
      <div className="mb-4">
        <label htmlFor="wialon-token" className="block text-sm font-medium text-gray-700 mb-1">
          Wialon API Token:
        </label>
        <input
          id="wialon-token"
          type="text"
          className="border border-gray-300 px-3 py-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter Wialon API Token"
        />
      </div>
      <div className="flex flex-wrap justify-center gap-3 mb-5">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleLogin}
          disabled={isLoading || !!user}
        >
          Login API
        </button>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleDirectLogin}
          disabled={isLoading}
        >
          Direct Login
        </button>
        <button
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleLogout}
          disabled={isLoading || !user}
        >
          Logout
        </button>
        <button
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105"
          onClick={() => navigate('/admin-management/wialon-diagnostics')}
        >
          Diagnostics
        </button>
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleGetUser}
          disabled={isLoading}
        >
          Get User
        </button>
      </div>
      <div className="text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-md p-3 h-40 overflow-y-auto mb-4 font-mono">
        {log.length === 0 ? (
          <div className="text-center text-gray-500">No log messages yet.</div>
        ) : (
          log.map((msg, i) => (
            <div key={i} className="mb-1 last:mb-0">
              {msg}
            </div>
          ))
        )}
      </div>
      <div className="text-md text-gray-800 font-semibold text-center">
        Status:{" "}
        {isLoading ? (
          <span className="text-blue-600 animate-pulse">Loading...</span>
        ) : user ? (
          <span className="text-green-700">{user}</span>
        ) : (
          <span className="text-red-600">Not logged in</span>
        )}
      </div>
    </div>
  );
};

export default WialonLoginPanel;
