
/**
 * Hybrid Wialon Session Component
 * Demonstrates both client-side token login and server-side session creation
 */

import { useState } from "react";
import { useWialonAuth } from "../context/WialonAuthContext";
import { useServerWialonSession } from "../hooks/useServerWialonSession";
import { useWialonApiUnits } from "../hooks/useWialonApiUnits";
import WialonLoginModal from "./Models/wialon/WialonLoginModal";

type SessionMode = 'client' | 'server';

export function HybridWialonSession() {
  const [mode, setMode] = useState<SessionMode>('client');

  // Client-side authentication (token-based)
  const { isLoggedIn: clientLoggedIn, loginData: clientLoginData, logout: clientLogout } = useWialonAuth();

  // Server-side session
  const { sessionId: serverSessionId, loading: serverLoading, error: serverError, refreshSession } = useServerWialonSession();

  // Units fetching (works with either session type)
  const sessionId = mode === 'client' ? clientLoginData?.eid : serverSessionId;
  const { units, loading: unitsLoading, error: unitsError } = useWialonApiUnits({
    detailed: true,
    autoFetch: !!sessionId
  });

  const isLoggedIn = mode === 'client' ? clientLoggedIn : !!serverSessionId;
  const currentError = mode === 'client' ? null : serverError;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Mode Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Wialon Session Mode</h2>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="client"
              checked={mode === 'client'}
              onChange={(e) => setMode(e.target.value as SessionMode)}
              className="mr-2"
            />
            <span>Client-side Login (Token)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="server"
              checked={mode === 'server'}
              onChange={(e) => setMode(e.target.value as SessionMode)}
              className="mr-2"
            />
            <span>Server-side Session (Environment Token)</span>
          </label>
        </div>
      </div>

      {/* Session Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Session Status</h3>

        {mode === 'client' ? (
          <div className="space-y-2">
            <p><strong>Mode:</strong> Client-side Token Login</p>
            <p><strong>Status:</strong> {clientLoggedIn ? '✅ Logged In' : '❌ Not Logged In'}</p>
            {clientLoginData && (
              <>
                <p><strong>User:</strong> {clientLoginData.user?.nm}</p>
                <p><strong>Session ID:</strong> {clientLoginData.eid}</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p><strong>Mode:</strong> Server-side Environment Token</p>
            <p><strong>Status:</strong> {serverLoading ? '🔄 Loading...' : serverSessionId ? '✅ Session Active' : '❌ No Session'}</p>
            {serverSessionId && <p><strong>Session ID:</strong> {serverSessionId}</p>}
            {serverError && <p className="text-red-600"><strong>Error:</strong> {serverError}</p>}
          </div>
        )}
      </div>

      {/* Login Interface */}
      {!isLoggedIn && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          {mode === 'client' ? (
            <div>
              <h3 className="font-semibold mb-3">Client-side Login</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter your Wialon token to login directly from the browser
              </p>
              <WialonLoginModal />
            </div>
          ) : (
            <div>
              <h3 className="font-semibold mb-3">Server-side Session</h3>
              <p className="text-sm text-gray-600 mb-4">
                Uses the WIALON_TOKEN from your server environment
              </p>
              {serverLoading ? (
                <p className="text-blue-600">Creating session...</p>
              ) : (
                <button
                  onClick={refreshSession}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create Session
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Logout Button */}
      {isLoggedIn && (
        <div className="flex justify-end">
          {mode === 'client' ? (
            <button
              onClick={clientLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout (Client)
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear Session (Server)
            </button>
          )}
        </div>
      )}

      {/* Units Display */}
      {isLoggedIn && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Fleet Units</h3>

          {currentError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
              {currentError}
            </div>
          )}

          {unitsError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
              Units Error: {unitsError}
            </div>
          )}

          {unitsLoading ? (
            <p className="text-blue-600">Loading units...</p>
          ) : units.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Found {units.length} units:</p>
              <div className="grid gap-2">
                {units.slice(0, 5).map((unit) => (
                  <div key={unit.id} className="p-2 bg-gray-50 rounded text-sm">
                    <strong>{unit.nm}</strong> (ID: {unit.id})
                  </div>
                ))}
                {units.length > 5 && (
                  <p className="text-sm text-gray-500">... and {units.length - 5} more</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No units found</p>
          )}
        </div>
      )}
    </div>
  );
}

export default HybridWialonSession;
