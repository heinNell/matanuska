import React from "react";
import { WialonAuthProvider, useWialonAuth } from "../context/WialonAuthContext";
import { useWialonApiUnits } from "../hooks/useWialonApiUnits";
import WialonLoginModal from "../components/Models/wialon/WialonLoginModal";

function WialonUnitsDisplay() {
  const { units, loading, error, totalCount, refetch } = useWialonApiUnits({
    detailed: true,  // Get detailed unit information
    autoFetch: true  // Auto-fetch when logged in
  });

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-blue-600">🔄 Loading units...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-600 mb-2">❌ Error: {error}</p>
        <button
          onClick={refetch}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded">
        <p className="text-gray-600">No units found</p>
        <button
          onClick={refetch}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          🚛 Fleet Units ({totalCount} total)
        </h3>
        <button
          onClick={refetch}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-3">
        {units.map((unit) => (
          <div
            key={unit.id}
            className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{unit.nm}</h4>
                <p className="text-sm text-gray-500">ID: {unit.id}</p>
              </div>
              <div className="text-xs text-gray-400">
                Class: {unit.cls} | Access: {unit.uacl}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WialonTestContent() {
  const { isLoggedIn, loginData, error, logout } = useWialonAuth();

  if (isLoggedIn) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Login Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold text-green-800 mb-2">
                🎉 Wialon Connected!
              </h2>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>User:</strong> {loginData?.user?.nm}</p>
                <p><strong>Account:</strong> {loginData?.au}</p>
                <p><strong>Session ID:</strong> {loginData?.eid}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Units Display */}
        <WialonUnitsDisplay />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4 text-center">Wialon API Test</h1>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Login to see your fleet units using the same API pattern as your curl request
      </p>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}
      <WialonLoginModal />
    </div>
  );
}

export default function WialonLoginTest() {
  return (
    <WialonAuthProvider>
      <WialonTestContent />
    </WialonAuthProvider>
  );
}
