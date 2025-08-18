// src/pages/Dashboard.tsx
import { collection, getDocs, limit, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import FormSelector from "../components/forms/FormSelector";
import EnhancedMapComponent from "../components/Map/EnhancedMapComponent";
import { useSyncContext } from "../context/SyncContext";
import { db } from "../firebase";
import { Location } from "../types/mapTypes";

// Log when Dashboard component is loaded to help debug dynamic import issues
console.log("Dashboard component file loaded successfully");

const Dashboard: React.FC = () => {
  const syncContext = useSyncContext();
  const [activeView, setActiveView] = useState<"map" | "fleet" | "trips" | "statistics">("map");
  const [locations, setLocations] = useState<Location[]>([]);
  const [fleetOptions, setFleetOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedFleet, setSelectedFleet] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: -33.8688,
    lng: 151.2093,
  });

  useEffect(() => {
    const loadLocations = async () => {
      if (!syncContext.isOnline) return;
      try {
        setLoading(true);
        const locationsQuery = query(collection(db, "locations"), limit(20));
        const snapshot = await getDocs(locationsQuery);
        const locationData: Location[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            lat: data.latitude || data.lat,
            lng: data.longitude || data.lng,
            title: data.name || data.title,
            info: data.description,
            address: data.address,
            iconType: data.type || "default",
          };
        });
        setLocations(locationData);
        if (locationData.length > 0 && locationData[0]) {
          const firstLocation = locationData[0];
          if (firstLocation.lat !== undefined && firstLocation.lng !== undefined) {
            setMapCenter({ lat: firstLocation.lat, lng: firstLocation.lng });
          }
        }
      } catch (error) {
        console.error("Error loading locations:", error);
      } finally {
        setLoading(false);
      }
    };
    loadLocations();
  }, [syncContext.isOnline]);

  useEffect(() => {
    const loadFleetVehicles = async () => {
      if (!syncContext.isOnline) return;
      try {
        const fleetQuery = query(collection(db, "fleet"), limit(50));
        const snapshot = await getDocs(fleetQuery);
        const options = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            value: doc.id,
            label: `${data.registrationNumber} (${data.vehicleType})`,
          };
        });
        setFleetOptions(options);
      } catch (error) {
        console.error("Error loading fleet vehicles:", error);
      }
    };
    loadFleetVehicles();
  }, [syncContext.isOnline]);

  const statistics = [
    { title: "Active Vehicles", value: "42", change: "+3", changeType: "positive" },
    { title: "Vehicles in Maintenance", value: "7", change: "-2", changeType: "negative" },
    { title: "Ongoing Trips", value: "18", change: "+5", changeType: "positive" },
    { title: "Total Distance Today", value: "1,287 km", change: "+12%", changeType: "positive" },
    { title: "Fuel Analytics", value: "6.2 L/100km", change: "-0.5", changeType: "positive" },
    { title: "Compliance Score", value: "92%", change: "+4%", changeType: "positive" },
  ];

  const handleLocationSelect = (location: Location) => {
    console.log("Selected location:", location);
  };

  return (
    <div className="container mx-auto p-6 lg:p-8">
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Fleet Dashboard</h1>
            <p className="text-gray-600 text-lg">Monitor and manage your fleet operations</p>
          </div>
          <div
            className={`px-5 py-3 rounded-full text-sm font-medium shadow-sm ${
              syncContext.isOnline
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <div className="flex items-center">
              <span
                className={`w-2 h-2 rounded-full mr-2 ${syncContext.isOnline ? "bg-green-500" : "bg-red-500"}`}
              ></span>
              {syncContext.isOnline ? "System Online" : "System Offline"}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
        {statistics.map((stat, index) => (
          <div
            key={index}
            className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl p-6 lg:p-8 border border-gray-100 dashboard-widget"
          >
            <h3 className="text-sm uppercase tracking-wider font-medium text-gray-500 mb-2">
              {stat.title}
            </h3>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p
                className={`ml-3 text-sm font-semibold flex items-center ${
                  stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                }`}
              >
                <span
                  className={`mr-1 text-lg ${stat.changeType === "positive" ? "text-green-500" : "text-red-500"}`}
                >
                  {stat.changeType === "positive" ? "↑" : "↓"}
                </span>
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8 bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
        <nav className="flex px-4">
          {["map", "fleet", "trips", "statistics"].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view as typeof activeView)}
              className={`py-5 px-8 font-medium transition-colors duration-200 ${
                activeView === view
                  ? "border-b-3 border-blue-600 text-blue-700 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)} View
            </button>
          ))}
        </nav>
      </div>

      {activeView === "map" && (
        <div className="bg-white shadow-lg rounded-xl p-6 lg:p-8 border border-gray-100 dashboard-widget">
          <div className="mb-6 flex flex-wrap items-center gap-6">
            <h2 className="text-2xl font-bold text-gray-900">Fleet Map</h2>
            <div className="flex-1 max-w-xs">
              <select
                value={selectedFleet}
                onChange={(e) => setSelectedFleet(e.target.value)}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Vehicles</option>
                {fleetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {loading && (
              <div className="flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent mr-3"></div>
                <span className="text-sm">Loading map data...</span>
              </div>
            )}
          </div>
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <EnhancedMapComponent
              locations={locations}
              center={mapCenter}
              height="600px"
              showInfoOnHover={true}
              onLocationSelect={handleLocationSelect}
              showPlacesSearch={true}
              showRoutes={true}
            />
          </div>
        </div>
      )}

      {activeView === "fleet" && (
        <div className="bg-white shadow-lg rounded-xl p-6 lg:p-8 border border-gray-100">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Fleet Management</h2>
            <p className="text-gray-600">
              Select a vehicle from your fleet to view detailed information
            </p>
          </div>

          <div className="max-w-md bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Selection
            </label>
            <FormSelector
              label="Select Vehicle"
              name="fleetId"
              value={selectedFleet}
              onChange={setSelectedFleet}
              collection="fleet"
              labelField="registrationNumber"
              valueField="id"
              sortField="fleetNumber"
              placeholder="Select a vehicle"
              required={false}
              className="mb-4"
            />
          </div>

          {selectedFleet ? (
            <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-blue-700">Vehicle Details</h3>
              </div>
              <p className="text-blue-600 italic ml-4 pl-8 border-l-2 border-blue-300">
                Vehicle data would display here based on selection
              </p>
            </div>
          ) : (
            <div className="mt-6 bg-gray-50 p-6 rounded-xl border border-gray-200 text-center">
              <p className="text-gray-500">Please select a vehicle to view its details</p>
            </div>
          )}
        </div>
      )}

      {activeView === "trips" && (
        <div className="bg-white shadow-lg rounded-xl p-6 lg:p-8 border border-gray-100">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Active Trips</h2>
              <p className="text-gray-600">View and manage ongoing trips across your fleet</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center btn-hover-effect">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              New Trip
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-green-800">On Schedule</h3>
              </div>
              <p className="ml-11 text-green-700">12 trips on schedule</p>
            </div>

            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-yellow-800">Needs Attention</h3>
              </div>
              <p className="ml-11 text-yellow-700">6 trips require attention</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Trip Details</h3>
            <div className="text-center p-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
              <p className="text-gray-600 italic">Trip data would display here</p>
              <p className="text-gray-500 text-sm mt-2">Select a trip to view details</p>
            </div>
          </div>
        </div>
      )}

      {activeView === "statistics" && (
        <div className="bg-white shadow-lg rounded-xl p-6 lg:p-8 border border-gray-100">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Fleet Statistics</h2>
            <p className="text-gray-600">
              Comprehensive overview of your fleet performance metrics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 flex flex-col items-center justify-center">
              <div className="bg-indigo-100 p-3 rounded-full mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-indigo-900 text-center mb-1">
                Fuel Efficiency
              </h3>
              <p className="text-indigo-700 text-center text-3xl font-bold">6.2 L/100km</p>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 border border-purple-100 flex flex-col items-center justify-center">
              <div className="bg-purple-100 p-3 rounded-full mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-purple-900 text-center mb-1">Energy Usage</h3>
              <p className="text-purple-700 text-center text-3xl font-bold">42.8 kWh</p>
            </div>

            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 flex flex-col items-center justify-center">
              <div className="bg-emerald-100 p-3 rounded-full mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-emerald-900 text-center mb-1">
                Compliance Score
              </h3>
              <p className="text-emerald-700 text-center text-3xl font-bold">92%</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Performance Metrics</h3>
              <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 italic">Advanced statistics would display here</p>
              <button className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors duration-200 text-sm btn-hover-effect">
                View Detailed Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
