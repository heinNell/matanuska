import { useState } from "react";
import { wialonTokenLogin, type WialonLoginResponse } from "../../../services/wialonAuthService";

interface WialonLoginModalProps {
  onLoginSuccess?: (loginData: WialonLoginResponse) => void;
}

export default function WialonLoginModal({ onLoginSuccess }: WialonLoginModalProps) {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginData, setLoginData] = useState<WialonLoginResponse | null>(null);

  const handleLogin = async () => {
    if (!token.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await wialonTokenLogin(token.trim());

      // Store login data
      setLoginData(response);

      // Call success callback if provided
      if (onLoginSuccess) {
        onLoginSuccess(response);
      }

      console.log("Wialon login successful:", response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setToken("");
    setError(null);
  };

  const handleLogout = () => {
    setLoginData(null);
    setToken("");
    setError(null);
  };

  const isLoggedIn = loginData && loginData.user;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {!isLoggedIn ? (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter Wialon Token"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            {token && (
              <button
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                title="Clear token"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={handleLogin}
            disabled={!token.trim() || isLoading}
            className={`w-full p-2 rounded text-white transition-colors ${
              isLoading || !token.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          {error && (
            <div className="p-2 text-red-600 bg-red-50 rounded border border-red-200">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-green-600 font-medium">
            ✅ Successfully logged in to Wialon!
          </div>

          {/* Display user information */}
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <div className="text-sm">
              <div><strong>User:</strong> {loginData.user?.nm}</div>
              <div><strong>User ID:</strong> {loginData.user?.id}</div>
              <div><strong>Account:</strong> {loginData.au}</div>
              {loginData.eid && <div><strong>EID:</strong> {loginData.eid}</div>}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full p-2 rounded text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
