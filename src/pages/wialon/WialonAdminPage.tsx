import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import { Circle, MapContainer, Polygon, Polyline, TileLayer, useMapEvents } from "react-leaflet";

/* ----------------------------------------------------------------
   MOCKS (keep app runnable without external deps; replace as needed)
-------------------------------------------------------------------*/
const db = {}; // Mock Firestore DB
const WIALON_API_URL = "https://hosting.wialon.com/?token=[VITE-WIALON-TOKEN]&lang=en";
const WIALON_LOGIN_URL =
  "https://hosting.wialon.com/?token=c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053&lang=en";

interface WialonConnectionStatus {
  connected: boolean;
  user: string | null;
  serverTime: Date | null;
  tokenExpiry: Date | null;
  errorMessage: string | null;
}

const useWialonConnection = () => {
  const [status, setStatus] = useState<WialonConnectionStatus>({
    connected: false,
    user: null,
    serverTime: null,
    tokenExpiry: null,
    errorMessage: null,
  });
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      setStatus({
        connected: true,
        user: "MockUser",
        serverTime: new Date(),
        tokenExpiry: new Date(Date.now() + 3600000),
        errorMessage: null,
      });
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { status, loading, refresh };
};

export interface WialonUnit {
  id: number;
  name: string;
  pos?: { x: number; y: number; s: number; t: number };
  cls_id?: number;
  type?: string;
  last_message?: number; // unix seconds
  connection_state?: number; // 1 online, 0 offline
}

const useWialonUnits = () => {
  const [units, setUnits] = useState<WialonUnit[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setUnits([
        {
          id: 1,
          name: "Truck 001",
          type: "truck",
          cls_id: 1,
          last_message: Date.now() / 1000,
          connection_state: 1,
        },
        {
          id: 2,
          name: "Van 002",
          type: "van",
          cls_id: 2,
          last_message: Date.now() / 1000 - 3600,
          connection_state: 1,
        },
        {
          id: 3,
          name: "Car 003",
          type: "car",
          cls_id: 3,
          last_message: Date.now() / 1000 - 86400,
          connection_state: 0,
        },
        {
          id: 4,
          name: "Truck 004",
          type: "truck",
          cls_id: 1,
          last_message: Date.now() / 1000 - 1000,
          connection_state: 1,
        },
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  return { units, loading, error };
};

const useWialonSdk = () => {
  const [sdkReady, setSdkReady] = useState(false);
  useEffect(() => {
    setTimeout(() => setSdkReady(true), 500);
  }, []);
  return sdkReady;
};

const useWialonSession = (sdkReady: boolean) => {
  const [session, setSession] = useState<any>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sdkReady) {
      setLoggedIn(true);
      setSession({
        getItem: () => ({
          createDriver: (payload: any, callback: any) => {
            console.log("Mock driver create:", payload);
            callback(0, { n: payload.n });
          },
          createZone: (payload: any, callback: any) => {
            console.log("Mock geofence create:", payload);
            callback(0, { n: payload.n });
          },
        }),
      });
      setError(null);
    }
  }, [sdkReady]);
  return { loggedIn, error, session };
};

const useWialonResources = (session: any, loggedIn: boolean) => {
  const [resources, setResources] = useState<any[]>([]);
  useEffect(() => {
    if (loggedIn && session)
      setResources([
        { id: 1, name: "Company A" },
        { id: 2, name: "Company B" },
      ]);
    else setResources([]);
  }, [loggedIn, session]);
  return resources;
};

const useWialonDrivers = (session: any, resourceId: number | null) => {
  const [drivers, setDrivers] = useState<any[]>([]);
  useEffect(() => {
    if (session && resourceId) {
      setDrivers([
        { id: 101, n: "John Doe", ds: "Truck Driver", p: "+12345" },
        { id: 102, n: "Jane Smith", ds: "Van Driver", p: "+67890" },
      ]);
    } else setDrivers([]);
  }, [session, resourceId]);
  return drivers;
};

const useWialonGeofences = (session: any, resourceId: number | null) => {
  const [geofences, setGeofences] = useState<any[]>([]);
  useEffect(() => {
    if (session && resourceId) {
      setGeofences([
        { id: 201, n: "Office", t: 3, w: 200, p: [{ x: 28.05, y: -26.2, r: 200 }] },
        {
          id: 202,
          n: "Warehouse",
          t: 2,
          p: [
            { x: 28.0, y: -26.15 },
            { x: 28.0, y: -26.25 },
            { x: 28.1, y: -26.25 },
            { x: 28.1, y: -26.15 },
          ],
        },
      ]);
    } else setGeofences([]);
  }, [session, resourceId]);
  return geofences;
};

const firestoreMock = {
  doc: (_db: any, _collection: string, _docId: string) => {
    void _db;
    void _collection;
    void _docId; // mark as used
    return {
      exists: true,
      data: () => ({
        baseUrl: "https://hosting.wialon.com/",
        token: "mock-token-12345",
        language: "en",
        defaultView: "monitoring",
      }),
    };
  },
  getDoc: async (ref: any) => ref,
  updateDoc: async (_ref: any, data: any) => console.log("Mock update:", data),
  setDoc: async (_ref: any, data: any) => console.log("Mock set:", data),
};
const { doc, getDoc, updateDoc, setDoc } = firestoreMock;

/* ----------------------------------------------------------------
   STATUS
-------------------------------------------------------------------*/
const WialonStatus: React.FC = () => {
  const { status, loading: connectionLoading, refresh } = useWialonConnection();
  const { units, loading: unitsLoading, error: unitsError } = useWialonUnits();

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Wialon Integration Status
        </h3>
        <button
          onClick={refresh}
          className="px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700 dark:text-blue-100 rounded transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="p-2 border border-gray-200 dark:border-gray-700 rounded-md mb-2 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${status.connected ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {connectionLoading
              ? "Checking connection..."
              : status.connected
                ? "Connected"
                : "Disconnected"}
          </span>
        </div>
        {status.errorMessage && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            Error: {status.errorMessage}
          </div>
        )}
      </div>

      {status.connected && (
        <div className="text-sm space-y-1 mt-3">
          {status.user && (
            <div>
              <span className="text-gray-500 dark:text-gray-400 inline-block w-24">Account:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{status.user}</span>
            </div>
          )}
          {status.serverTime && (
            <div>
              <span className="text-gray-500 dark:text-gray-400 inline-block w-24">
                Server Time:
              </span>
              <span className="text-gray-800 dark:text-gray-200">
                {status.serverTime.toLocaleString()}
              </span>
            </div>
          )}
          {status.tokenExpiry && (
            <div>
              <span className="text-gray-500 dark:text-gray-400 inline-block w-24">
                Token Expires:
              </span>
              <span
                className={`${new Date() > status.tokenExpiry ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-200"}`}
              >
                {status.tokenExpiry.toLocaleString()}
              </span>
            </div>
          )}
          <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400 inline-block w-24">Units:</span>
            {unitsLoading ? (
              <span className="text-gray-600 dark:text-gray-400">Loading units...</span>
            ) : unitsError ? (
              <span className="text-red-600 dark:text-red-400">Error loading units</span>
            ) : (
              <span className="text-gray-800 dark:text-gray-200">
                {units?.length || 0} units available
              </span>
            )}
          </div>
        </div>
      )}

      {!status.connected && !connectionLoading && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
          <p className="font-medium">Troubleshooting:</p>
          <ul className="list-disc list-inside pl-2 mt-1 space-y-1">
            <li>Check if VITE_WIALON_SESSION_TOKEN is set in environment variables</li>
            <li>Ensure your token has not expired</li>
          </ul>
        </div>
      )}
    </div>
  );
};

/* ----------------------------------------------------------------
   UNITS LIST (typed sorting fix for TS7053)
-------------------------------------------------------------------*/
type SortKey = "name" | "last_message";
type SortDirection = "ascending" | "descending";

const getSortableValue = (u: WialonUnit, key: SortKey): string | number => {
  if (key === "name") return u.name ?? "";
  if (key === "last_message")
    return typeof u.last_message === "number" ? u.last_message : -Infinity;
  // unreachable due to union type, but satisfies exhaustive checks
  return "";
};

const compareValues = (a: string | number, b: string | number, dir: SortDirection) => {
  if (a < b) return dir === "ascending" ? -1 : 1;
  if (a > b) return dir === "ascending" ? 1 : -1;
  return 0;
};

const WialonUnitsList: React.FC = () => {
  const { units, loading, error } = useWialonUnits();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: "name",
    direction: "ascending",
  });

  const [filteredUnits, setFilteredUnits] = useState<WialonUnit[]>([]);

  useEffect(() => {
    if (!units) {
      setFilteredUnits([]);
      return;
    }

    let current = [...units];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      current = current.filter((u) => u.name.toLowerCase().includes(q));
    }

    if (selectedType) {
      current = current.filter(
        (u) =>
          (u.cls_id && String(u.cls_id) === selectedType) ||
          (u.type && u.type.toLowerCase() === selectedType.toLowerCase())
      );
    }

    // Typed sort
    current.sort((a, b) => {
      const va = getSortableValue(a, sortConfig.key);
      const vb = getSortableValue(b, sortConfig.key);
      return compareValues(va, vb, sortConfig.direction);
    });

    setFilteredUnits(current);
  }, [units, searchQuery, selectedType, sortConfig]);

  const unitTypes = units
    ? Array.from(new Set(units.map((u) => (u.cls_id ? `Class ${u.cls_id}` : u.type))))
        .filter(Boolean)
        .map((t) => ({ id: String(t), name: String(t) }))
    : [];

  if (loading)
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse text-gray-600">Loading Wialon units...</div>
      </div>
    );
  if (error)
    return (
      <div className="p-4 text-center text-red-600">
        <p className="font-medium">Error loading units</p>
        <p className="text-sm mt-1">{String(error)}</p>
      </div>
    );
  if (!units || units.length === 0)
    return <div className="p-4 text-center text-gray-600">No units available.</div>;

  const toggleSort = (key: SortKey) =>
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "ascending" ? "descending" : "ascending",
    }));

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Wialon Units</h2>

      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="unit-search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Units
          </label>
          <input
            id="unit-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="sm:w-1/3">
          <label htmlFor="unit-type" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Type
          </label>
          <select
            id="unit-type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            {unitTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort("name")}
              >
                Name{" "}
                {sortConfig.key === "name" && (
                  <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                )}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort("last_message")}
              >
                Last Active{" "}
                {sortConfig.key === "last_message" && (
                  <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                )}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUnits.map((u) => (
              <tr
                key={u.id}
                className="hover:bg-blue-50 cursor-pointer transition-colors duration-150 ease-in-out"
              >
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{u.name}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {u.type || (u.cls_id ? `Class ${u.cls_id}` : "N/A")}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {u.last_message ? new Date(u.last_message * 1000).toLocaleString() : "Never"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.connection_state === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {u.connection_state === 1 ? "Online" : "Offline"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-right text-sm text-gray-500">
        {filteredUnits.length} units shown{" "}
        {units.length > filteredUnits.length && `(out of ${units.length})`}
      </div>
    </div>
  );
};

/* ----------------------------------------------------------------
   CONFIG
-------------------------------------------------------------------*/
interface WialonConfigProps {
  companyId?: string;
}
interface WialonConfigState {
  baseUrl: string;
  token: string;
  refreshToken?: string;
  language: string;
  defaultView: "monitoring" | "tracks" | "dashboard";
  expiresAt?: number;
}

const WialonConfig: React.FC<WialonConfigProps> = ({ companyId = "default" }) => {
  const [config, setConfig] = useState<WialonConfigState>({
    baseUrl: "https://hosting.wialon.com/",
    token: "",
    language: "en",
    defaultView: "monitoring",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTokenVisible, setIsTokenVisible] = useState(false);

  const languages = [
    { code: "en", name: "English" },
    { code: "ru", name: "Russian" },
    { code: "es", name: "Spanish" },
    { code: "de", name: "German" },
    { code: "fr", name: "French" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
  ];

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const configRef = doc(db, "integrationConfig", `wialon-${companyId}`);
        const docSnap = await getDoc(configRef);
        if (docSnap.exists)
          setConfig((prev) => ({ ...prev, ...(docSnap.data() as WialonConfigState) }));
      } catch {
        setError("Failed to load configuration. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, [companyId]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");
      setSaveSuccess(false);
      if (!config.baseUrl || !config.token) {
        setError("Base URL and Token are required fields.");
        return;
      }
      const formattedBaseUrl = config.baseUrl.endsWith("/") ? config.baseUrl : `${config.baseUrl}/`;
      const configRef = doc(db, "integrationConfig", `wialon-${companyId}`);
      const docSnap = await getDoc(configRef);
      if (docSnap.exists) {
        await updateDoc(configRef, {
          ...config,
          baseUrl: formattedBaseUrl,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await setDoc(configRef, {
          ...config,
          baseUrl: formattedBaseUrl,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setError("Failed to save configuration. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleTokenVisibility = () => setIsTokenVisible((v) => !v);

  if (isLoading) return <div className="p-4 text-center">Loading configuration...</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Wialon Integration Configuration</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded">{error}</div>
      )}
      {saveSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-700 rounded">
          Configuration saved successfully!
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Wialon Base URL
        </label>
        <input
          id="baseUrl"
          type="text"
          value={config.baseUrl}
          onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
          placeholder="https://hosting.wialon.com/"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">The base URL for your Wialon instance</p>
      </div>

      <div className="mb-4">
        <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
          Wialon Token
        </label>
        <div className="relative">
          <input
            id="token"
            type={isTokenVisible ? "text" : "password"}
            value={config.token}
            onChange={(e) => setConfig({ ...config, token: e.target.value })}
            placeholder="Enter your Wialon token"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleToggleTokenVisibility}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {isTokenVisible ? (
              <span className="text-xs">Hide</span>
            ) : (
              <span className="text-xs">Show</span>
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          The authentication token for accessing your Wialon account
        </p>
      </div>

      <div className="mb-4">
        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
          Default Language
        </label>
        <select
          id="language"
          value={config.language}
          onChange={(e) => setConfig({ ...config, language: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name} ({lang.code})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="defaultView" className="block text-sm font-medium text-gray-700 mb-1">
          Default View
        </label>
        <select
          id="defaultView"
          value={config.defaultView}
          onChange={(e) =>
            setConfig({
              ...config,
              defaultView: e.target.value as WialonConfigState["defaultView"],
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="monitoring">Monitoring</option>
          <option value="tracks">Tracks</option>
          <option value="dashboard">Dashboard</option>
        </select>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isSaving ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </div>
  );
};

/* ----------------------------------------------------------------
   CONFIG DISPLAY
-------------------------------------------------------------------*/
const WialonConfigDisplay: React.FC = () => (
  <div className="bg-white shadow rounded-lg p-4">
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

/* ----------------------------------------------------------------
   DRIVER MANAGER
-------------------------------------------------------------------*/
interface Driver {
  id: number;
  n: string;
  ds: string;
  p: string;
}

export const WialonDriverManager: React.FC = () => {
  const sdkReady = useWialonSdk();
  const { loggedIn, error, session } = useWialonSession(sdkReady);
  const resources = useWialonResources(session, loggedIn);
  const [selectedRes, setSelectedRes] = useState<number | null>(null);
  const drivers = useWialonDrivers(session, selectedRes) as Driver[];

  const [form, setForm] = useState({ n: "", ds: "", p: "" });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = () => {
    if (!selectedRes || !session) return;
    const res = session.getItem(selectedRes);
    res.createDriver(
      {
        itemId: selectedRes,
        id: 0,
        callMode: "create",
        c: "",
        ck: 0,
        ds: form.ds,
        n: form.n,
        p: form.p,
        r: 1,
        f: 0,
        jp: {},
      },
      (code: number, data: any) => {
        const errorText = (globalThis as any)?.wialon?.core?.Errors?.getErrorText?.(code) ?? code;
        alert(code ? `[Wialon] Driver create error: ${errorText}` : `Driver "${data.n}" created!`);
      }
    );
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Wialon Driver Manager</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}

      <label className="block mb-2">
        <span className="text-sm font-medium text-gray-700">Resource:</span>
        <select
          value={selectedRes ?? ""}
          onChange={(e) => setSelectedRes(Number(e.target.value))}
          className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
        >
          <option value="">-- select resource --</option>
          {resources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </label>

      <h3 className="text-lg font-semibold mt-4">Drivers</h3>
      <ul className="list-disc list-inside space-y-1 mt-2">
        {drivers.map((d) => (
          <li key={d.id}>
            {d.n} - {d.ds} ({d.p})
          </li>
        ))}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
        className="mt-4 space-y-2"
      >
        <input
          name="n"
          placeholder="Name"
          value={form.n}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
        <input
          name="ds"
          placeholder="Description"
          value={form.ds}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
        <input
          name="p"
          placeholder="Phone"
          value={form.p}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Create Driver
        </button>
      </form>
    </div>
  );
};

/* ----------------------------------------------------------------
   GEOFENCE MANAGER
-------------------------------------------------------------------*/
type LatLngTuple = [number, number];
const center: LatLngTuple = [-26.2041, 28.0473];

export const WialonGeofenceManager: React.FC = () => {
  const sdkReady = useWialonSdk();
  const { loggedIn, error, session } = useWialonSession(sdkReady);
  const resources = useWialonResources(session, loggedIn);
  const [selectedRes, setSelectedRes] = useState<number | null>(null);
  const geofences = useWialonGeofences(session, selectedRes);
  const [newCircle, setNewCircle] = useState<{ lat: number; lng: number; radius: number } | null>(
    null
  );
  const [name, setName] = useState("");

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setNewCircle({ lat: e.latlng.lat, lng: e.latlng.lng, radius: 500 });
      },
    });
    return null;
  }

  const handleCreateGeofence = () => {
    if (!selectedRes || !session || !newCircle || !name) return;
    const res = session.getItem(selectedRes);
    res.createZone(
      {
        n: name,
        t: 3,
        f: 0,
        w: newCircle.radius,
        c: 2566914048,
        p: [{ x: newCircle.lng, y: newCircle.lat, r: newCircle.radius }],
      },
      (code: number, data: any) => {
        const errorText = (globalThis as any)?.wialon?.core?.Errors?.getErrorText?.(code) ?? code;
        alert(code ? errorText : `Geofence "${data.n}" created`);
      }
    );
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Wialon Geofence Manager</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}

      <label className="block mb-4">
        <span className="text-sm font-medium text-gray-700">Resource:</span>
        <select
          value={selectedRes ?? ""}
          onChange={(e) => setSelectedRes(Number(e.target.value))}
          className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
        >
          <option value="">-- select resource --</option>
          {resources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4">
        <MapContainer
          center={center}
          zoom={6}
          style={{ height: 400, width: "100%", borderRadius: 8 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler />

          {geofences.map((zone: any) =>
            zone.t === 3 && zone.p && zone.p.length > 0 ? (
              <Circle
                key={zone.id}
                center={[zone.p[0].y, zone.p[0].x]}
                radius={zone.w ?? 0}
                pathOptions={{ color: "red" }}
              />
            ) : zone.t === 2 && zone.p ? (
              <Polygon
                key={zone.id}
                positions={zone.p.map((pt: any) => [pt.y, pt.x])}
                pathOptions={{ color: "blue" }}
              />
            ) : zone.p ? (
              <Polyline
                key={zone.id}
                positions={zone.p.map((pt: any) => [pt.y, pt.x])}
                pathOptions={{ color: "green" }}
              />
            ) : null
          )}

          {newCircle && (
            <Circle
              center={[newCircle.lat, newCircle.lng]}
              radius={newCircle.radius}
              pathOptions={{ color: "green" }}
            />
          )}
        </MapContainer>

        <div className="mt-2 flex items-center space-x-2">
          <input
            placeholder="Geofence name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!newCircle}
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={handleCreateGeofence}
            disabled={!newCircle || !name || !selectedRes}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Save Geofence
          </button>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------------------------------------
   PAGE
-------------------------------------------------------------------*/
// forward declaration removed (component already defined above)

const WialonAdminPage: React.FC = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("default");
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        setTimeout(() => {
          setCompanies([
            { id: "comp1", name: "Alpha Logistics" },
            { id: "comp2", name: "Beta Haulage" },
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (e) {
        console.error("Error fetching companies:", e);
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Wialon Integration Dashboard</h1>
        </div>

        {/* Company selection */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Configuration Target</h2>
          <div className="mb-4">
            <label
              htmlFor="company-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Company
            </label>
            <select
              id="company-select"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="default">System Default (All Companies)</option>
              {!isLoading &&
                companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Configure Wialon for all companies (default) or customize for a specific one.
            </p>
          </div>
        </div>

        {/* Status & Config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <WialonStatus />
          <div className="space-y-6">
            <WialonConfig companyId={selectedCompanyId} />
            <WialonConfigDisplay />
          </div>
        </div>

        <div className="mt-6">
          <WialonUnitsList />
        </div>

        {/* Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <WialonDriverManager />
          <WialonGeofenceManager />
        </div>

        {/* Info */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-sm rounded">
          <h3 className="font-medium text-blue-700">About This Panel</h3>
          <p className="mt-1 text-blue-600">
            Use the components above to configure API settings, manage company-specific data, and
            perform essential tasks like driver and geofence management.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WialonAdminPage;
