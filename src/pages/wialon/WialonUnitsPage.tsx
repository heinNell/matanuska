import React, { useState } from "react";
import WialonUnitsList from "../../components/wialon/WialonUnitsList";
import { useWialon } from "../../context/WialonProvider";

/**
 * WialonUnitsPage Component
 *
 * Page that displays and manages Wialon units/vehicles.
 * Allows viewing, filtering, and selecting units.
 */
const WialonUnitsPage: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  // Retrieve Wialon units, loading and error state from provider
  const { units, initializing, error } = useWialon();

  const handleSelectUnit = (unitId: number, unitInfo: any) => {
    setSelectedUnit(unitInfo);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Wialon Units</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-${selectedUnit ? "2" : "3"}`}>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium text-gray-900 mb-4">Available Units</h3>
            <WialonUnitsList
              units={(units as any) || null}
              loading={initializing}
              error={error}
              onSelectUnit={handleSelectUnit}
            />
          </div>
        </div>

        {selectedUnit && (
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded shadow sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">Unit Details</h3>
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-800">{selectedUnit.name}</h4>
                  {selectedUnit.hw_id && (
                    <p className="text-sm text-gray-500">Hardware ID: {selectedUnit.hw_id}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p
                      className={`text-sm font-medium ${selectedUnit.connection_state === 1 ? "text-green-600" : "text-red-600"}`}
                    >
                      {selectedUnit.connection_state === 1 ? "Online" : "Offline"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <p className="text-sm">{selectedUnit.type || `Class ${selectedUnit.cls_id}`}</p>
                  </div>
                </div>

                {selectedUnit.position && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Last Position</p>
                    <div className="text-sm">
                      <p>
                        <span className="font-medium">Latitude:</span>{" "}
                        {selectedUnit.position.y.toFixed(6)}
                      </p>
                      <p>
                        <span className="font-medium">Longitude:</span>{" "}
                        {selectedUnit.position.x.toFixed(6)}
                      </p>
                      {selectedUnit.position.t && (
                        <p>
                          <span className="font-medium">Time:</span>{" "}
                          {new Date(selectedUnit.position.t * 1000).toLocaleString()}
                        </p>
                      )}
                      {selectedUnit.position.s !== undefined && (
                        <p>
                          <span className="font-medium">Speed:</span> {selectedUnit.position.s} km/h
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`https://hosting.wialon.com/track.html?unit=${selectedUnit.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Track Unit
                    </a>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200">
                      View History
                    </button>
                  </div>
                </div>

                {selectedUnit.sensors && selectedUnit.sensors.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Sensors</h4>
                    <ul className="text-sm divide-y divide-gray-100">
                      {selectedUnit.sensors.slice(0, 5).map((sensor: any) => (
                        <li key={sensor.id} className="py-1">
                          <div className="flex justify-between">
                            <span className="font-medium">{sensor.name}</span>
                            <span>{sensor.value !== undefined ? sensor.value : "N/A"}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 text-sm">
        <h3 className="font-medium text-blue-700">Wialon Units Integration</h3>
        <p className="mt-1 text-blue-600">
          This page displays all units/vehicles from your Wialon account. You can filter and select
          units to view detailed information.
        </p>
      </div>
    </div>
  );
};

export default WialonUnitsPage;
