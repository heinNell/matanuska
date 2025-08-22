import React from "react";
import { useState } from "react";
import { useWialonAuth } from "../../context/WialonAuthContext";
import { useWialonApiUnits } from "../../hooks/useWialonApiUnits";
import { type WialonUnit } from "../../services/wialonUnitsService";

interface WialonFleetDashboardProps {
  className?: string;
}

export function WialonFleetDashboard({ className }: WialonFleetDashboardProps) {
  const { isLoggedIn, loginData } = useWialonAuth();
  const { units, loading, error, refetch } = useWialonApiUnits({
    detailed: true,
    autoFetch: isLoggedIn
  });

  const [selectedUnit, setSelectedUnit] = useState<WialonUnit | null>(null);

  if (!isLoggedIn) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <h2 className="text-xl font-semibold mb-2">Wialon Fleet Dashboard</h2>
        <p className="text-gray-600">Please log in to Wialon to view your fleet</p>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Fleet Dashboard</h1>
          <p className="text-gray-600">
            {loginData?.user?.nm} • {units.length} vehicles
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">❌ {error}</p>
        </div>
      )}

      {/* Units Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse h-24 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit) => (
            <div
              key={unit.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedUnit?.id === unit.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
              onClick={() => setSelectedUnit(unit)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {unit.nm}
                  </h3>
                  <p className="text-sm text-gray-500">ID: {unit.id}</p>
                </div>
                <div className="ml-2 flex-shrink-0">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Access Level: {unit.uacl}
                </span>
                <span className="text-blue-600 font-medium">
                  Class {unit.cls}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unit Details Panel */}
      {selectedUnit && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Unit Details</h2>
            <button
              onClick={() => setSelectedUnit(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">{selectedUnit.nm}</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Unit ID:</span> {selectedUnit.id}</p>
                <p><span className="text-gray-500">Class:</span> {selectedUnit.cls}</p>
                <p><span className="text-gray-500">Access Level:</span> {selectedUnit.uacl}</p>
                <p><span className="text-gray-500">Modified Units:</span> {selectedUnit.mu}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors">
                  📍 View Location
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors">
                  📊 View Reports
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors">
                  🔧 Manage Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{units.length}</div>
          <div className="text-sm text-gray-500">Total Units</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {units.filter(u => u.cls === 2).length}
          </div>
          <div className="text-sm text-gray-500">Active Vehicles</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">0</div>
          <div className="text-sm text-gray-500">Alerts</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {Math.max(...units.map(u => u.uacl), 0)}
          </div>
          <div className="text-sm text-gray-500">Max Access Level</div>
        </div>
      </div>
    </div>
  );
}

export default WialonFleetDashboard;
