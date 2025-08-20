import React, { useState } from 'react';

// Use a placeholder for the API host and a dummy session ID for the example.
// Replace these with your actual values.
const API_HOST = 'https://hst-api.wialon.com';
const DUMMY_SID = typeof crypto !== 'undefined' ? crypto.randomUUID() : 'dummy_session_id';

// --- Type Definitions ---
// Define the structure of the API responses and request parameters for better type safety.

interface FuelConsMath {
  idling: number;
  urban: number;
  suburban: number;
}

interface FuelConsRates {
  consSummer: number;
  consWinter: number;
  winterMonthFrom: number;
  winterDayFrom: number;
  winterMonthTo: number;
  winterDayTo: number;
}

interface FuelLevelParams {
  flags: number;
  ignoreStayTimeout: number;
  minFillingVolume: number;
  minTheftTimeout: number;
  minTheftVolume: number;
  filterQuality: number;
  fillingsJoinInterval: number;
  theftsJoinInterval: number;
  extraFillingTimeout: number;
}

interface FuelConsImpulse {
  maxImpulses: number;
  skipZero: number;
}

interface GetFuelSettingsResponse {
  calcTypes: number;
  fuelLevelParams: FuelLevelParams;
  fuelConsMath: FuelConsMath;
  fuelConsRates: FuelConsRates;
  fuelConsImpulse: FuelConsImpulse;
}

interface RegisterFuelFillingParams {
  date: number;
  volume: number;
  cost: number;
  location: string;
  deviation: number;
  x: number;
  y: number;
  description: string;
  itemId: number;
}

// --- Custom Hook for a generic API Call ---
// This hook encapsulates the logic for making API requests and managing state.
// It handles loading, success, and error states for any given service call.
const useApi  = <T, P>(service: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (params: P) => {
    setLoading(true);
    setError(null);
    setData(null);

    // Construct the API URL.
    const url = `${API_HOST}/wialon/ajax.html?svc=${service}&params=${encodeURIComponent(JSON.stringify(params))}&sid=${DUMMY_SID}`;

    try {
      const response = await fetch(url);
      const result = await response.json();

      // Check for errors in the response body (common in some APIs).
      if (result.error) {
        setError(`API Error: Code ${result.error}, Description: ${result.description || 'Unknown error'}`);
      } else {
        setData(result);
      }
    } catch (err: any) {
      setError(`Network Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
};

// --- Custom Hook for Fuel Settings ---
// This hook specifically handles the get_fuel_settings API call.
const useFuelSettings = () => {
  const { data, loading, error, fetchData } = useApi<GetFuelSettingsResponse, { itemId: number }>('unit/get_fuel_settings');

  const getSettings = (itemId: number) => {
    fetchData({ itemId });
  };

  return { fuelSettings: data, settingsLoading: loading, settingsError: error, getSettings };
};

// --- React App Component ---
const App: React.FC = () => {
  const [itemId, setItemId] = useState<number>(123456789); // Placeholder itemId

  // States for the fuel filling form
  const [formData, setFormData] = useState<Omit<RegisterFuelFillingParams, 'itemId'>>({
    date: Math.floor(Date.now() / 1000),
    volume: 50.5,
    cost: 75.25,
    location: 'Example Gas Station',
    deviation: 5,
    x: -74.0060, // Longitude
    y: 40.7128,  // Latitude
    description: 'Routine refuel'
  });

  // Use the custom hook for each API call
  const { fuelSettings, settingsLoading, settingsError, getSettings } = useFuelSettings();
  const { loading: registryLoading, error: registryError, fetchData: registerFilling } = useApi<{}, RegisterFuelFillingParams>('unit/registry_fuel_filling_event');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'volume' || name === 'cost' || name === 'x' || name === 'y') ? parseFloat(value) : value
    }));
  };

  const handleRegisterFilling = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerFilling({ ...formData, itemId });
  };

  const handleGetSettings = () => {
    getSettings(itemId);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* --- Fuel Filling Registration Form --- */}
        <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-center text-indigo-700">Register Fuel Filling</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Unit ID (itemId)</label>
            <input
              type="number"
              value={itemId}
              onChange={(e) => setItemId(parseInt(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <form onSubmit={handleRegisterFilling} className="space-y-4">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-gray-700 capitalize">
                  {key}
                </label>
                <input
                  type={typeof value === 'number' ? 'number' : 'text'}
                  name={key}
                  id={key}
                  value={value as any}
                  onChange={handleInputChange}
                  step={key === 'volume' || key === 'cost' || key === 'x' || key === 'y' ? "any" : "1"}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            ))}
            <div className="text-center pt-4">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={registryLoading}
              >
                {registryLoading ? 'Registering...' : 'Register Event'}
              </button>
            </div>
          </form>
          {registryLoading && <p className="mt-4 text-center text-indigo-600">Registering fuel filling...</p>}
          {registryError && <div className="mt-4 p-3 bg-red-100 text-red-700 border-l-4 border-red-500 rounded-md"><p>Error: {registryError}</p></div>}
        </div>

        {/* --- Fuel Settings Display --- */}
        <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-center text-indigo-700">Fuel Consumption Settings</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Unit ID (itemId)</label>
            <input
              type="number"
              value={itemId}
              onChange={(e) => setItemId(parseInt(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="text-center">
            <button
              onClick={handleGetSettings}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              disabled={settingsLoading}
            >
              {settingsLoading ? 'Fetching...' : 'Get Fuel Settings'}
            </button>
          </div>

          {settingsLoading && <p className="mt-4 text-center text-emerald-600">Fetching fuel settings...</p>}
          {settingsError && <div className="mt-4 p-3 bg-red-100 text-red-700 border-l-4 border-red-500 rounded-md"><p>Error: {settingsError}</p></div>}

          {fuelSettings && (
            <div className="mt-6 border-t border-gray-200 pt-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Settings for Unit {itemId}</h3>
              <div className="p-4 bg-gray-50 rounded-md shadow-sm">
                <p className="font-bold">Calculation Type:</p>
                <p>{fuelSettings.calcTypes}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-md shadow-sm">
                <p className="font-bold">Math Consumption:</p>
                <ul className="list-disc list-inside ml-4 text-sm">
                  <li>Idling: {fuelSettings.fuelConsMath.idling} L/hr</li>
                  <li>Urban: {fuelSettings.fuelConsMath.urban} L/100km</li>
                  <li>Suburban: {fuelSettings.fuelConsMath.suburban} L/100km</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 rounded-md shadow-sm">
                <p className="font-bold">Seasonal Rates:</p>
                <ul className="list-disc list-inside ml-4 text-sm">
                  <li>Summer: {fuelSettings.fuelConsRates.consSummer} L/100km</li>
                  <li>Winter: {fuelSettings.fuelConsRates.consWinter} L/100km</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
